import Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  props: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await props.params;
  const { items } = await req.json();

  if (!Array.isArray(items) || items.length === 0) {
    return new NextResponse('items are required', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const variantIds = items.map((i: any) => i.variantId);

  const variants = await prismadb.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: {
      id: true,
      price: true,
      product: { select: { name: true } },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
    variants.map((v) => {
      const item = items.find((i: any) => i.variantId === v.id)!;
      return {
        quantity: item.quantity,
        price_data: {
          currency: 'USD',
          product_data: { name: v.product.name },
          unit_amount: Math.round(v.price * 100),
        },
      };
    });

  const order = await prismadb.order.create({
    data: {
      storeId,
      isPaid: false,
      orderItems: {
        create: items.map((i: any) => ({
          variant: { connect: { id: i.variantId } },
          quantity: i.quantity,
        })),
      },
    },
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: { enabled: true },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: { orderId: order.id },
  });

  return NextResponse.json({ url: session.url }, { headers: corsHeaders });
}
