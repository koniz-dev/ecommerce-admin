import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import prismadb from '@/lib/prismadb';

import { ColorColumn } from './components/columns';
import { ColorClient } from './components/client';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

const ColorsPage = async (props: PageProps) => {
  const { storeId } = await props.params;

  const colors = await prismadb.color.findMany({
    where: {
      storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedColors: ColorColumn[] = colors.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ColorClient data={formattedColors} />
      </div>
    </div>
  );
};

export default ColorsPage;
