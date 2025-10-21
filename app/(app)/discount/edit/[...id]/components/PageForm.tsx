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
import { Checkbox } from '@/components/ui/checkbox';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  code: z.string().min(2, { message: 'Code must be at least 2 characters' }),
  discountValue: z.coerce
    .number({
      message: 'Discount Value must be a number',
    })
    .gte(1, 'Must be 1 and above'),
  isPercentage: z.boolean(),
  isPublished: z.boolean(),
  usageCount: z.coerce.number({
    message: 'Usage Count must be a number',
  }),
  maxUsage: z.coerce
    .number({
      message: 'Max Usage must be a number',
    })
    .gte(1, 'Must be 1 and above'),
});

//types
type PageFormProps = {
  initialData: Awaited<
    ReturnType<(typeof serverClient)['getDiscountCodeById']>
  >;
  dataId: string;
};

const PageForm = ({ initialData, dataId }: PageFormProps) => {
  //router
  const router = useRouter();

  //trpc
  const { data, refetch } = trpc.getDiscountCodeById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { refetch: refetchData } = trpc.getDiscountCodes.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  // trpc mutation for updating the item
  const updateData = trpc.updateDiscountCode.useMutation({
    onSuccess: () => {
      toast.success('Data updated successfully');
      refetch(); //refetch the data, so the form will be updated
      refetchData(); //refetch the list
      router.push('/discount/list'); // Navigate back to the item list
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
      code: data?.code || '',
      discountValue: data?.discountValue || 0,
      isPercentage: data?.isPercentage || false,
      isPublished: data?.published || false,
      usageCount: data?.usageCount || 0,
      maxUsage: data?.maxUsage || 0,
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateData.mutate({
      id: dataId,
      code: values.code,
      discountValue: values.discountValue,
      isPercentage: values.isPercentage,
      isPublished: values.isPublished,
      usageCount: values.usageCount,
      maxUsage: values.maxUsage,
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
          name='code'
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
          name='discountValue'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='isPercentage'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-1 leading-none'>
                <FormLabel>Is Percentage Discount</FormLabel>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className='ml-2'
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='isPublished'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-1 leading-none'>
                <FormLabel>Is Published</FormLabel>
              </div>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className='ml-2'
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='usageCount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usage Count</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='maxUsage'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Usage</FormLabel>
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
