'use client';

import { Plus } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { ApiList } from '@/components/ui/api-list';
import { columns, VariantColumn } from './columns';

interface Props {
  data: VariantColumn[];
}

export const VariantClient: React.FC<Props> = ({ data }) => {
  const { storeId, productId } = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Variants (${data.length})`}
          description="Manage variants for your product"
        />

        <Button
          onClick={() =>
            router.push(`/${storeId}/products/${productId}/variants/new`)
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Variant
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="sku" columns={columns} data={data} />
      <Separator />
      <ApiList
        entityName={`products/${productId}/variants`}
        entityIdName="variantId"
      />
    </>
  );
};
