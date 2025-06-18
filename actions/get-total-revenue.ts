import prismadb from '@/lib/prismadb';

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          variant: true,
        },
      },
    },
  });

  const totalRevenue = paidOrders.reduce((total: number, order) => {
    const orderTotal = order.orderItems.reduce((orderSum: number, item) => {
      const price = Number(item.variant.price);
      return orderSum + price * item.quantity;
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};
