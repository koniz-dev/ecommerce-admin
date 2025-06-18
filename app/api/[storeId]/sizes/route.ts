import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  props: { params: Promise<{ storeId: string }> },
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

    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 });
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

    const size = await prismadb.size.create({
      data: {
        label: body.label,
        guideImageUrl: body?.guideImageUrl,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZES_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function GET(
  req: Request,
  props: { params: Promise<{ storeId: string }> },
) {
  const params = await props.params;
  try {
    if (!params.storeId) {
      return new NextResponse('Store id is required', { status: 400 });
    }

    const sizes = await prismadb.size.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log('[SIZES_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
