import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

// Allowed product statuses
const VALID_STATUSES = ['draft', 'active', 'archived'] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  if (!productId) {
    return new NextResponse('Product id is required', { status: 400 });
  }
  try {
    const product = await prismadb.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        variants: {
          include: {
            color: true,
            size: true,
            images: true,
          },
        },
      },
    });
    if (!product) {
      return new NextResponse('Not found', { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCT_PUBLIC_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> },
) {
  try {
    const { storeId, productId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }
    const body = await req.json();
    const { name, description, status, isFeatured, categoryId } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (status && !VALID_STATUSES.includes(status as Status)) {
      return new NextResponse('Invalid status value', { status: 400 });
    }
    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    // Verify store ownership
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });
    if (!store) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Prepare update payload
    const updateData: any = { name, description, isFeatured };
    if (status) updateData.status = status;
    if (categoryId) updateData.categoryId = categoryId;

    const updated = await prismadb.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ storeId: string; productId: string }> },
) {
  try {
    const { storeId, productId } = await params;
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    // Verify store ownership
    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });
    if (!store) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    // Perform deletion in a single transaction
    await prismadb.$transaction([
      prismadb.productVariant.deleteMany({ where: { productId } }),
      prismadb.product.delete({ where: { id: productId } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
