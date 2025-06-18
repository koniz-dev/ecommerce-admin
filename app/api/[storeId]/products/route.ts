import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params;

  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    const body = await req.json();
    const { name, description, status, categoryId, isFeatured } = body;

    if (!name) {
      return new NextResponse('Name is required', { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse('Category is required', { status: 400 });
    }
    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });
    if (!store) {
      return new NextResponse('Unauthorized', { status: 403 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        description,
        status,
        isFeatured,
        storeId,
        categoryId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

const validStatuses = ['draft', 'active', 'archived'] as const;
type ProductStatus = (typeof validStatuses)[number];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params;

  try {
    if (!storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const url = new URL(req.url);
    const categoryId = url.searchParams.get('categoryId');
    const statusParam = url.searchParams.get('status');
    const isFeaturedParam = url.searchParams.get('isFeatured');

    const isFeatured =
      isFeaturedParam === 'true'
        ? true
        : isFeaturedParam === 'false'
        ? false
        : undefined;

    const status = validStatuses.includes(statusParam as ProductStatus)
      ? (statusParam as ProductStatus)
      : undefined;

    const products = await prismadb.product.findMany({
      where: {
        storeId,
        ...(categoryId && { categoryId }),
        ...(status && { status }),
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
      },
      orderBy: {
        createdAt: 'desc',
      },
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

    return NextResponse.json(products);
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
