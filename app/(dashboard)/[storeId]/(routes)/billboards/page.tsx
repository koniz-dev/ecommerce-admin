import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';


import prismadb from '@/lib/prismadb';
import { BillboardColumn } from './components/columns';
import { BillboardClient } from './components/client';

interface PageProps {
  params: Promise<{ storeId: string }>;
}


const BillboardsPage = async (props: PageProps) => {
  const { storeId } = await props.params;

  const billboards = await prismadb.billboard.findMany({
    where: { storeId },
    orderBy: { createdAt: 'desc' },
  });

  const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;
