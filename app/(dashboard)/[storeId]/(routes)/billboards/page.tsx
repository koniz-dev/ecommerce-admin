import { format } from 'date-fns';

import prismadb from '@/lib/prismadb';

import { BillboardColumn } from './components/columns';
import { BillboardClient } from './components/client';

const BillboardsPage = async (props: { params: Promise<{ storeId: string }> }) => {
  const params = await props.params;
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedBillboards: BillboardColumn[] = billboards.map((item: any) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;
