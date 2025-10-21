'use client';
import React from 'react';

import { toast } from 'react-toastify';

//trpc
import { trpc } from '@/app/_trpc/client';
import { TRPCClientError } from '@trpc/client';

//form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

//ui
import Button from '@/components/global/Button';

import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedProduct } from '@/redux/slices/modalSlice';

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

const PageForm = () => {
  const dispatch = useAppDispatch();
  const selectedProduct = useAppSelector(state => state.modal.selectedProduct);

  // trpc mutation for updating the item
  const addReview = trpc.addReview.useMutation({
    onSuccess: data => {
      form.reset();
      dispatch(setSelectedProduct(data));
      toast.success('Review added successfully');
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
      rating: 0,
      review: '',
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    addReview.mutate({
      itemId: selectedProduct?.id || '',
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
                  className='block w-full px-4 py-2 text-base border border-gray-300 rounded-md shadow-sm   focus-visible:ring-slate-950'
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
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='pt-6 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Post
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
