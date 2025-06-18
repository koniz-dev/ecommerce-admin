'use client';

import { ColumnDef } from '@tanstack/react-table';

import { CellAction } from './cell-action';
import Image from 'next/image';

export type SizeColumn = {
  id: string;
  label: string;
  guideImageUrl?: string;
  createdAt: string;
};

export const columns: ColumnDef<SizeColumn>[] = [
  {
    accessorKey: 'label',
    header: 'Size',
  },
  {
    accessorKey: 'guideImageUrl',
    header: 'Guide',
    cell: ({ row }) =>
      row.original.guideImageUrl ? (
        <Image
          src={row.original.guideImageUrl}
          alt="Guide"
          width={48}
          height={48}
          className="object-cover rounded"
        />
      ) : (
        <span className="text-gray-400 italic">No image</span>
      ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
