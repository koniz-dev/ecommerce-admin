import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';

import prismadb from '@/lib/prismadb';

import { ProductsClient } from './components/client';
import { ProductColumn } from './components/columns';

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default async function ProductsPage({ params }: PageProps) {
  const { storeId } = await params;

  const products = await prismadb.product.findMany({
    where: { storeId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const data: ProductColumn[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    featured: p.isFeatured,
    category: p.category.name,
    created: format(p.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col p-8 space-y-4">
      <ProductsClient data={data} />
    </div>
  );
}
