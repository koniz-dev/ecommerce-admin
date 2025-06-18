import prismadb from '@/lib/prismadb';
import { ProductForm } from './components/product-form';

interface PageProps {
  params: Promise<{ storeId: string; productId: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { storeId, productId } = await params;

  const product =
    productId !== 'new'
      ? await prismadb.product.findUnique({ where: { id: productId } })
      : null;

  const categories = await prismadb.category.findMany({
    where: {
      storeId,
    },
  });

  return (
    <div className="flex flex-col p-8 space-y-6">
      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}
