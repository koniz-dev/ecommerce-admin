import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import prismadb from '@/lib/prismadb';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId as string;
    const address = session.customer_details?.address;

    // Build a single string for the address
    const addressString = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ]
      .filter(Boolean)
      .join(', ');

    // 1) Mark order as paid and set address/phone
    const order = await prismadb.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        address: addressString,
        phone: session.customer_details?.phone || '',
      },
      include: { orderItems: true },
    });

    // 2) For each ordered variant: decrement stock, then disable if empty
    for (const item of order.orderItems) {
      const variantId = item.variantId;
      const quantity = item.quantity;

      // a) decrement stock
      const updatedVariant = await prismadb.productVariant.update({
        where: { id: variantId },
        data: {
          stock: { decrement: quantity },
        },
      });

      // b) if stock now zero or negative, set status disabled
      if (updatedVariant.stock <= 0) {
        await prismadb.productVariant.update({
          where: { id: variantId },
          data: { status: 'disabled' },
        });
      }
    }
  }

  return new NextResponse(null, { status: 200 });
}
