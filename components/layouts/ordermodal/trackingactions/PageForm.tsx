'use client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

//trpc
import { trpc } from '@/app/_trpc/client';
import { TRPCError } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

//form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { set, z } from 'zod';

//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { setSelectedOrder } from '@/redux/slices/modalSlice';

//ui
import Button from '@/components/global/Button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  trackingCode: z
    .string()
    .min(2, { message: 'Tracking Code must be at least 2 characters' }),
  shippingProvider: z
    .string()
    .min(2, { message: 'Shipping Provider must be at least 2 characters' }),
  shippingProviderWebsite: z.string(),
});

//types
type PageFormProps = {
  trackingCode: string;
  shippingProvider: string;
  shippingProviderWebsite: string;
  shopName?: string;
  orderCode: string;
  shipmentId: string;
};

const PageForm = ({
  trackingCode,
  shippingProvider,
  shippingProviderWebsite,
  shopName,
  orderCode,
  shipmentId,
}: PageFormProps) => {
  const dispatch = useAppDispatch();

  //trpc
  const { data: order, refetch } = trpc.getUserOrderById.useQuery(
    orderCode || ''
  );

  const updateShipment = trpc.updateShipment.useMutation();

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingCode: trackingCode ?? '',
      shippingProvider: shippingProvider || '',
      shippingProviderWebsite: shippingProviderWebsite || '',
    },
  });

  // reset form values when currentOrder changes
  useEffect(() => {
    form.reset({
      trackingCode: trackingCode ?? '',
      shippingProvider: shippingProvider || '',
      shippingProviderWebsite: shippingProviderWebsite || '',
    });
  }, [trackingCode, shippingProvider, form,shippingProviderWebsite]);

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateShipment.mutate(
      {
        shipmentId: shipmentId || '',
        ...values,
      },
      {
        onSuccess: async data => {
          toast.success('Fulfillment updated successfully');
          dispatch(setSelectedOrder(data));
          refetch();
        },
        onError: error => {
          if (error instanceof TRPCClientError) {
            toast.error('Something went wrong: ' + error.message);
          } else {
            toast.error('An unexpected error occurred');
          }
        },
      }
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full space-y-2'
      >
        <FormField
          control={form.control}
          name='trackingCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Code</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='shippingProvider'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Provider</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='shippingProviderWebsite'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Website</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-2 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Ship {shopName}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
