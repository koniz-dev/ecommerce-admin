import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import prismadb from '@/lib/prismadb';

import { CategoryColumn } from './components/columns';
import { CategoriesClient } from './components/client';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

const CategoriesPage = async (props: PageProps) => {
  const { storeId } = await props.params;

  const categories = await prismadb.category.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoriesClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;
