import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import prismadb from '@/lib/prismadb';

import { SizeColumn } from './components/columns';
import { SizesClient } from './components/client';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

const SizesPage = async (props: PageProps) => {
  const params = await props.params;
  const sizes = await prismadb.size.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedSizes: SizeColumn[] = sizes.map((item) => ({
    id: item.id,
    label: item.label,
    guideImageUrl: item.guideImageUrl ?? undefined,
    createdAt: format(item.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SizesClient data={formattedSizes} />
      </div>
    </div>
  );
};

export default SizesPage;
