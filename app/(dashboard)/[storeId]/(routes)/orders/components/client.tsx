'use client';

import { DataTable } from '@/components/ui/data-table';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';

import { columns, OrderColumn } from './columns';
import { Fragment } from 'react';
import { ApiList } from '@/components/ui/api-list';

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {
  return (
    <Fragment>
      <Heading
        title={`Orders (${data.length})`}
        description="Manage orders for your store"
      />
      <Separator />

      <DataTable searchKey="products" columns={columns} data={data} />
      <Separator />

      <ApiList entityName="orders" entityIdName="orderId" />
    </Fragment>
  );
};
