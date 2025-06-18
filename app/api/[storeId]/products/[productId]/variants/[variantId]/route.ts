import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> },
) {
  const { variantId } = await params;
  if (!variantId) return new NextResponse('Missing variantId', { status: 400 });

  try {
    const variant = await prismadb.productVariant.findUnique({
      where: { id: variantId },
      include: { color: true, size: true, images: true },
    });
    if (!variant) return new NextResponse('Not found', { status: 404 });
    return NextResponse.json(variant);
  } catch (error) {
    console.log('[PRODUCT_VARIANT_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; productId: string; variantId: string }>;
  },
) {
  const { storeId, variantId } = await params;

  try {
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

    const updated = await prismadb.productVariant.update({
      where: { id: variantId },
      data: {
        sku: sku || null,
        price: Number(price),
        stock: Number(stock),
        sizeId,
        colorId,
        status,
        images: {
          deleteMany: {},
          createMany: {
            data: images.map((img: { url: string }) => ({ url: img.url })),
          },
        },
      },
      include: {
        color: true,
        size: true,
        images: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log('[PRODUCT_VARIANT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ storeId: string; productId: string; variantId: string }>;
  },
) {
  const { storeId, variantId } = await params;

  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthenticated', { status: 403 });

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });
    if (!store) return new NextResponse('Unauthorized', { status: 403 });

    await prismadb.productVariant.delete({ where: { id: variantId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log('[PRODUCT_VARIANT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
