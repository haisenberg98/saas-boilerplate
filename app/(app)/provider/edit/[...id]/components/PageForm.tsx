'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
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

//ui
import Button from '@/components/global/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Provider name must be at least 2 characters' }),
  address: z
    .string()
    .min(2, { message: 'Address must be at least 2 characters' }),
  phone: z.string().min(2, { message: 'Phone must be at least 2 characters' }),
  openingHours: z
    .string()
    .min(2, { message: 'Opening hours must be at least 2 characters' }),
  minDeliveryTime: z.coerce
    .number({
      message: 'Minimum Average Delivery Time must be at least 2 characters',
    })
    .gte(1, 'Must be 1 and above'),
  maxDeliveryTime: z.coerce
    .number({
      message: 'Maximum Average Delivery Time must be at least 2 characters',
    })
    .gte(1, 'Must be 1 and above'),
});

//types
type PageFormProps = {
  initialData: Awaited<ReturnType<(typeof serverClient)['getShopById']>>;
  dataId: string;
};

const PageForm = ({ initialData, dataId }: PageFormProps) => {
  //router
  const router = useRouter();

  //trpc

  const { data, refetch } = trpc.getShopById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { refetch: refetchData } = trpc.getShops.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  // trpc mutation for updating the item
  const updateData = trpc.updateShop.useMutation({
    onSuccess: () => {
      toast.success('Data updated successfully');
      refetch(); //refetch the data, so the form will be updated
      refetchData(); //refetch the list
      router.push('/provider/list'); // Navigate back to the item list
    },
    onError: error => {
      if (error instanceof TRPCClientError) {
        toast.error('Something went wrong: ' + error.message);
      } else {
        toast.error('An unexpected error occurred');
      }
    },
  });

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: data?.name || '',
      address: data?.address || '',
      phone: data?.phone || '',
      openingHours: data?.openingHours || '',
      minDeliveryTime: data?.minDeliveryTime || 0,
      maxDeliveryTime: data?.maxDeliveryTime || 0,
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateData.mutate({
      id: dataId,
      name: values.name,
      address: values.address,
      phone: values.phone,
      openingHours: values.openingHours,
      minDeliveryTime: values.minDeliveryTime,
      maxDeliveryTime: values.maxDeliveryTime,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full space-y-2'
      >
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='openingHours'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opening Hours</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='minDeliveryTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Min Delivery Time</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='maxDeliveryTime'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Delivery Time</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-6 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Update
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
