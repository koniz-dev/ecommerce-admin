'use client';

import axios from 'axios';
import { Copy, Edit, MoreHorizontal, Trash2, CopyPlus } from 'lucide-react';
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

  const onDuplicate = async () => {
    setLoading(true);
    try {
      // Fetch the full variant data (including images)
      const variantRes = await axios.get(
        `/api/${storeId}/products/${productId}/variants/${data.id}`
      );
      const variant = variantRes.data;
      // Prepare payload for new variant (remove id, set new SKU if needed)
      const payload = {
        images: variant.images?.map((img: { url: string }) => ({ url: img.url })) || [],
        sku: variant.sku ? `${variant.sku}-copy` : undefined,
        price: variant.price,
        stock: variant.stock,
        sizeId: variant.sizeId,
        colorId: variant.colorId,
        status: variant.status,
      };
      await axios.post(
        `/api/${storeId}/products/${productId}/variants`,
        payload
      );
      toast.success('Variant duplicated.');
      router.refresh();
    } catch {
      toast.error('Failed to duplicate variant.');
    } finally {
      setLoading(false);
    }
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
          <DropdownMenuItem onClick={onDuplicate} disabled={loading}>
            <CopyPlus className="mr-2 h-4 w-4" /> Duplicate
          </DropdownMenuItem>
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
