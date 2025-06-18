'use client';

import axios from 'axios';
import { Copy, Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AlertModal } from '@/components/modals/alert-modal';

import { VariantColumn } from './columns';

interface CellActionProps {
  data: VariantColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const router = useRouter();
  const { storeId, productId } = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const onConfirm = async () => {
    setLoading(true);
    try {
      await axios.delete(
        `/api/${storeId}/products/${productId}/variants/${data.id}`,
      );
      toast.success('Variant deleted.');
      router.refresh();
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          error.response.data?.message || 'Failed to delete variant.',
        );
      } else {
        toast.error('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCopy = () => {
    navigator.clipboard.writeText(data.id);
    toast.success('Variant ID copied to clipboard.');
  };

  return (
    <Fragment>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onCopy}>
            <Copy className="mr-2 h-4 w-4" /> Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/${storeId}/products/${productId}/variants/${data.id}`,
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Fragment>
  );
};
