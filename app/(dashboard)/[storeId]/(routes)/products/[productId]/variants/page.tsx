import prismadb from '@/lib/prismadb';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { VariantClient } from './components/client';
import { VariantColumn } from './components/columns';

interface PageProps {
  params: Promise<{ storeId: string; productId: string }>;
}

export default async function VariantsPage({ params }: PageProps) {
  const { productId } = await params;

  const variants = await prismadb.productVariant.findMany({
    where: { productId },
    include: { size: true, color: true },
    orderBy: { createdAt: 'desc' },
  });

  const data: VariantColumn[] = variants.map((v) => ({
    id: v.id,
    sku: v.sku || '—',
    price: `$${v.price.toFixed(2)}`,
    stock: v.stock,
    size: v.size?.label || '—',
    color: v.color?.value || '—',
    status: v.status,
    created: format(v.createdAt, 'MMMM do, yyyy', { locale: enUS }),
  }));

  return (
    <div className="flex flex-col p-8 space-y-4">
      <VariantClient data={data} />
    </div>
  );
}
