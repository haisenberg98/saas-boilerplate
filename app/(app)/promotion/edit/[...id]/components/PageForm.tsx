'use client';
import React, { useState } from 'react';
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

//components
import ImageUpload from './ImageUpload';
import TipTap from '@/components/global/TipTap';

//utils
import { sanitizeContent } from '@/lib/utils';

const formSchema = z.object({
  images: z.array(z.string()),

  title: z
    .string()
    .min(2, { message: 'Promotion title must be at least 2 characters' }),
  hasLink: z.boolean(),
  published: z.boolean(),
  description: z.string(),
});

//types
type PageFormProps = {
  initialData: Awaited<ReturnType<(typeof serverClient)['getPromotionById']>>;

  dataId: string;
};

const PageForm = ({ initialData, dataId }: PageFormProps) => {
  //router
  const router = useRouter();

  //trpc
  const { data, refetch } = trpc.getPromotionById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  //state
  const [editorContentState, setEditorContentState] = useState<string>(
    data?.description || ''
  );

  const { refetch: refetchData } = trpc.getPosts.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  // trpc mutation for updating the item
  const updateData = trpc.updatePromotion.useMutation({
    onSuccess: () => {
      toast.success('Data updated successfully');
      refetch(); // refetch the item data after a successful update
      refetchData(); //refetch the data list
      router.push('/promotion/list'); // Navigate back to the data list
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
      images: [],

      title: data?.title || '',
      hasLink: data?.hasLink || false,
      published: data?.published || false,
      description: data?.description || '',
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editorContentState === '') {
      toast.error('Description is required');
      return;
    }

    // Sanitize the editor content
    const sanitizedContent = sanitizeContent(editorContentState);
    values.description = sanitizedContent;

    updateData.mutate({
      id: dataId,
      title: values.title,
      hasLink: values.hasLink,
      published: values.published,
      description: values.description,
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col w-full space-y-2'
      >
        {/* images upload */}
        <ImageUpload
          dataId={dataId}
          dataImages={data?.images}
          refetchData={refetch}
        />

        {/* Title input */}
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input type='text' {...field} autoFocus={false} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* has link */}
        <FormField
          control={form.control}
          name='hasLink'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-1 leading-none'>
                <FormLabel>Has Link</FormLabel>
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
        {/* published */}
        <FormField
          control={form.control}
          name='published'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-1 leading-none'>
                <FormLabel>Published</FormLabel>
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

        {/* Tiptap Editor */}
        <label className='block text-sm font-medium md:text-lg'>Content</label>
        <TipTap
          setEditorContentState={setEditorContentState}
          initialContent={data?.description || ''}
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
