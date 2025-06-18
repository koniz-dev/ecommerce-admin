import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> },
) {
  const { storeId, productId } = await params;
  if (!storeId || !productId)
    return new NextResponse('Missing parameters', { status: 400 });

  const variants = await prismadb.productVariant.findMany({
    where: { productId },
    include: { color: true, size: true, images: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(variants);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> },
) {
  const { storeId, productId } = await params;
  const { userId } = await auth();
  if (!userId) return new NextResponse('Unauthenticated', { status: 403 });

  const body = await req.json();
  const { images, sku, price, stock, sizeId, colorId, status } = body;

  if (!images || !images.length) {
    return new NextResponse('Images are required', { status: 400 });
  }

  if (price == null) {
    return new NextResponse('Price is required', { status: 400 });
  }

  if (stock == null) {
    return new NextResponse('Stock is required', { status: 400 });
  }

  if (!sizeId) {
    return new NextResponse('Size is required', { status: 400 });
  }

  if (!colorId) {
    return new NextResponse('Color is required', { status: 400 });
  }

  const store = await prismadb.store.findFirst({
    where: { id: storeId, userId },
  });
  if (!store) return new NextResponse('Unauthorized', { status: 403 });

  const variant = await prismadb.productVariant.create({
    data: {
      productId,
      sku: sku || null,
      price: Number(price),
      stock: Number(stock),
      sizeId,
      colorId,
      status,
      images: {
        createMany: {
          data: [...images.map((image: { url: string }) => image)],
        },
      },
    },
    include: { color: true, size: true, images: true },
  });
  return NextResponse.json(variant);
}
