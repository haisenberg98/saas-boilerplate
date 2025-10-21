'use client';
import React from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

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
  maxDeliveryTime: z.coerce.number({
    message: 'Maximum Average Delivery Time must be at least 2 characters',
  }),
});

const PageForm = ({
  initialData,
}: {
  initialData: Awaited<ReturnType<(typeof serverClient)['getShops']>>;
}) => {
  const router = useRouter();
  //trpc
  const { refetch } = trpc.getShops.useQuery(undefined, {
    initialData: initialData, // This is the initial data
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  const addShop = trpc.addShop.useMutation();

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      openingHours: '',
      minDeliveryTime: 0,
      maxDeliveryTime: 0,
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    addShop.mutate(values, {
      onError: error => {
        if (error instanceof TRPCClientError) {
          toast.error('Something went wrong');
        }
        if (error instanceof TRPCError) {
          toast.error(error.message);
        }
      },
      onSuccess: async data => {
        try {
          toast.success('Data added successfully');
          form.reset({
            name: '',
            address: '',
            phone: '',
            openingHours: '',
            minDeliveryTime: 0,
            maxDeliveryTime: 0,
          }); // Reset the form fields
          refetch(); // Refetch the data
          router.push('/provider/list'); // Redirect to the list page
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Failed to add data: ${error.message}`);
          } else {
            toast.error('Failed to add data due to an unknown error');
          }
        }
      },
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
                <Input type='text' {...field} />
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
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-6 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Add
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
