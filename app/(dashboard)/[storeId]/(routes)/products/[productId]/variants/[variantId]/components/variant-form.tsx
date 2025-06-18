'use client';

import * as z from 'zod';
import axios from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heading } from '@/components/ui/heading';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ImageUpload from '@/components/ui/image-upload';
import { AlertModal } from '@/components/modals/alert-modal';

import { Trash } from 'lucide-react';

import { toast } from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
import { Color, Size } from '@prisma/client';

const formSchema = z.object({
  images: z
    .array(z.object({ url: z.string().url() }))
    .optional()
    .default([]),
  sku: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().min(0),
  sizeId: z.string().min(1),
  colorId: z.string().min(1),
  status: z.enum(['active', 'disabled', 'discontinued']).default('active'),
});

type VariantFormValues = z.input<typeof formSchema>;

interface VariantFormProps {
  initialData: any;
  productId: string;
  colors: Color[];
  sizes: Size[];
}

export function VariantForm({
  initialData,
  productId,
  sizes,
  colors,
}: VariantFormProps) {
  const { storeId, variantId } = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      images: [],
      sku: '',
      price: 0,
      stock: 0,
      sizeId: '',
      colorId: '',
      status: 'active',
    },
  });

  const onSubmit = async (data: VariantFormValues) => {
    setLoading(true);
    try {
      if (initialData) {
        await axios.patch(
          `/api/${storeId}/products/${productId}/variants/${variantId}`,
          data,
        );
        toast.success('Variant updated');
      } else {
        await axios.post(
          `/api/${storeId}/products/${productId}/variants`,
          data,
        );
        toast.success('Variant created');
      }
      router.refresh();
      router.push(`/${storeId}/products/${productId}/variants`);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `/api/${storeId}/products/${productId}/variants/${variantId}`,
      );
      router.refresh();
      router.push(`/${storeId}/products/${productId}/variants/${variantId}`);
      toast.success('Product deleted.');
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />

      <div className="flex items-center justify-between">
        <Heading
          title={initialData ? 'Edit Variant' : 'New Variant'}
          description="Set price, stock and options"
        />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full"
        >
          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={(field.value || []).map((image) => image.url)}
                    disabled={loading}
                    onChange={(url) => {
                      const newValue = [
                        ...(form.getValues('images') || []),
                        { url },
                      ];
                      field.onChange(newValue);
                    }}
                    onRemove={(url) =>
                      field.onChange([
                        ...(field.value || []).filter(
                          (current) => current.url !== url,
                        ),
                      ])
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:grid md:grid-cols-3 gap-8">
            <FormField
              name="sku"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="price"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="stock"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a size"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select a color"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-x-4">
                            <div
                              className="border p-3 rounded-full"
                              style={{ backgroundColor: color.value }}
                            />

                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder="Select status"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading}>
            Save Variant
          </Button>
        </form>
      </Form>
    </>
  );
}
