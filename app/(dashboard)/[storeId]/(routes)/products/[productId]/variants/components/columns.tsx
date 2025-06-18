'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

export type VariantColumn = {
  id: string;
  sku: string;
  price: string;
  stock: number;
  size: string;
  color: string;
  status: 'active' | 'disabled' | 'discontinued';
  created: string;
};

export const columns: ColumnDef<VariantColumn>[] = [
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'stock', header: 'Stock' },
  { accessorKey: 'size', header: 'Size' },
  {
    accessorKey: 'color',
    header: 'Color',
    cell: ({ row }) => {
      const value = row.original.color;
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full border"
            style={{ backgroundColor: value }}
          />
          <span>{value}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const capitalized = status.charAt(0).toUpperCase() + status.slice(1);
      return capitalized;
    },
  },
  { accessorKey: 'created', header: 'Created' },
  { id: 'actions', cell: ({ row }) => <CellAction data={row.original} /> },
];
