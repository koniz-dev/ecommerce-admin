'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Check } from 'lucide-react';

export type ProductColumn = {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  featured: boolean;
  category: string;
  created: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      const capitalized = status.charAt(0).toUpperCase() + status.slice(1);
      return capitalized;
    },
  },
  {
    accessorKey: 'featured',
    header: 'Featured',
    cell: ({ row }) => {
      const isFeatured = row.original.featured;
      return isFeatured ? (
        <Check className="h-4 w-4 text-green-500 ml-5" />
      ) : null;
    },
  },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'created', header: 'Created' },
  { id: 'actions', cell: ({ row }) => <CellAction data={row.original} /> },
];
