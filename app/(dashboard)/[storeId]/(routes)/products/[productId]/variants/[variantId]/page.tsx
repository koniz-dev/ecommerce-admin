import prismadb from '@/lib/prismadb';
import { VariantForm } from './components/variant-form';

interface PageProps {
  params: Promise<{ storeId: string; productId: string; variantId: string }>;
}

export default async function VariantPage({ params }: PageProps) {
  const { storeId, productId, variantId } = await params;
  const variant =
    variantId !== 'new'
      ? await prismadb.productVariant.findUnique({
          where: { id: variantId },
          include: { size: true, color: true, images: true },
        })
      : null;

  const sizes = await prismadb.size.findMany({
    where: {
      storeId: storeId,
    },
  });

  const colors = await prismadb.color.findMany({
    where: {
      storeId: storeId,
    },
  });

  return (
    <div className="flex flex-col p-8">
      <VariantForm
        initialData={variant}
        productId={productId}
        sizes={sizes}
        colors={colors}
      />
    </div>
  );
}
