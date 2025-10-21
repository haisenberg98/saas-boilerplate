'use client';
import React, { useEffect } from 'react';
import { toast } from 'react-toastify';

//trpc
import { trpc } from '@/app/_trpc/client';
import { TRPCError } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

//form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';

//ui
import Button from '@/components/global/Button';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { setSelectedOrder } from '@/redux/slices/modalSlice';

const formSchema = z.object({
  orderStatus: z.string().min(2, { message: 'Order Status is required' }),
});

const PageForm = () => {
  //redux
  const dispatch = useAppDispatch();
  const { selectedOrder } = useAppSelector(state => state.modal);

  //trpc
  const { data: status } = trpc.getOrderStatus.useQuery();
  const { data: order, refetch } = trpc.getUserOrderById.useQuery(
    selectedOrder?.orderCode || ''
  );

  const updateOrder = trpc.updateOrder.useMutation();

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      orderStatus: selectedOrder?.orderStatus || '',
    },
  });

  // reset form values when currentOrder changes
  useEffect(() => {
    form.reset({
      orderStatus: selectedOrder?.orderStatus || '',
    });
  }, [selectedOrder, form]);

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateOrder.mutate(
      {
        orderId: order?.id || '',
        ...values,
      },
      {
        onSuccess: async data => {
          toast.success('Order updated successfully');

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
        {/* order status */}
        <FormField
          control={form.control}
          name='orderStatus'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className='block w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                  value={field.value || ''}
                >
                  <option value='' disabled>
                    Select order status
                  </option>
                  {status?.map((item, index) => (
                    <option key={index} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-2 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Update Order
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
