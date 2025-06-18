import prismadb from '@/lib/prismadb';

export const getStockCount = async (storeId: string) => {
  const result = await prismadb.productVariant.aggregate({
    _sum: {
      stock: true,
    },
    where: {
      product: {
        storeId,
        status: 'active',
      },
      status: 'active',
    },
  });

  return result._sum.stock ?? 0;
};
