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
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  rating: z.coerce
    .number({
      message: 'Rating must be a number',
    })
    .gte(1, 'Rating must be at least 1'),
  review: z
    .string()
    .min(2, { message: 'Review must be at least 2 characters' }),
});

//types
type PageFormProps = {
  initialData: Awaited<
    ReturnType<(typeof serverClient)['getProductReviewById']>
  >;
  dataId: string;
};

const PageForm = ({ initialData, dataId }: PageFormProps) => {
  //router
  const router = useRouter();

  //trpc
  const { data, refetch } = trpc.getProductReviewById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { refetch: refetchData } = trpc.getProductReviews.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  // trpc mutation for updating the item
  const updateData = trpc.updateProductReview.useMutation({
    onSuccess: () => {
      toast.success('Data updated successfully');
      refetch(); //refetch the data, so the form will be updated
      refetchData(); //refetch the list
      router.push('/item-review/list'); // Navigate back to the item list
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
      rating: data?.rating || 1,
      review: data?.review || '',
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    updateData.mutate({
      id: dataId,
      rating: values.rating,
      review: values.review,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full space-y-2'
      >
        {/* Rating */}
        <FormField
          control={form.control}
          name='rating'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className='block w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm   focus-visible:ring-slate-950 sm:text-sm'
                  value={field.value || ''}
                >
                  <option value='' disabled>
                    Select rating
                  </option>
                  {[1, 2, 3, 4, 5].map((item, index) => (
                    <option key={index} value={item}>
                      {item} star{item > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='review'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Review</FormLabel>
              <FormControl>
                <Textarea cols={8} {...field} className='h-40' />
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
