import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import prismadb from '@/lib/prismadb';
import { formatter } from '@/lib/utils';

import { OrderColumn } from './components/columns';
import { OrderClient } from './components/client';

const OrdersPage = async (props: { params: Promise<{ storeId: string }> }) => {
  const params = await props.params;
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      orderItems: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((order) => ({
    id: order.id,
    phone: order.phone,
    address: order.address,
    products: order.orderItems
      .map((oi) => oi.variant?.product.name ?? '—')
      .join(', '),
    totalPrice: formatter.format(
      order.orderItems.reduce((sum, oi) => {
        const price = oi.variant?.price ?? 0;
        return sum + price * oi.quantity;
      }, 0),
    ),
    isPaid: order.isPaid,
    created: format(order.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
