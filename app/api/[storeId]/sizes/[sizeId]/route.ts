import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: Request,
  props: { params: Promise<{ sizeId: string }> },
) {
  const params = await props.params;
  try {
    if (!params.sizeId) {
      return new NextResponse('Size id is required', { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!params.sizeId) {
      return new NextResponse('Size id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 405 });
    }

    const size = await prismadb.size.delete({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  props: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  const params = await props.params;
  try {
    const { userId } = await auth();

    const body = await req.json();

    if (!userId) {
      return new NextResponse('Unauthenticated', { status: 403 });
    }

    if (!body.label) {
      return new NextResponse('Label is required', { status: 400 });
    }

    if (!params.sizeId) {
      return new NextResponse('Size id is required', { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse('Unauthorized', { status: 405 });
    }

    const size = await prismadb.size.update({
      where: {
        id: params.sizeId,
      },
      data: {
        label: body.label,
        guideImageUrl: body?.guideImageUrl,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_PATCH]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
