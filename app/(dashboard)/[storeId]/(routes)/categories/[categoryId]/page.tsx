import prismadb from '@/lib/prismadb';

import { CategoryForm } from './components/category-form';

const CategoryPage = async (
  props: {
    params: Promise<{ categoryId: string; storeId: string }>;
  }
) => {
  const params = await props.params;
  let category = null;

  if (params.categoryId !== 'new') {
    category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });
  }

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;
