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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

//components
import ImageUpload from './ImageUpload';
import TipTap from '@/components/global/TipTap';

//utils
import { sanitizeContent } from '@/lib/utils';

const formSchema = z.object({
  images: z.array(z.string()),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  title: z
    .string()
    .min(2, { message: 'Post title must be at least 2 characters' }),
  content: z.string(),
});

//types
type PageFormProps = {
  initialData: Awaited<ReturnType<(typeof serverClient)['getPostById']>>;
  initialCategories: Awaited<
    ReturnType<(typeof serverClient)['getPostCategories']>
  >;
  dataId: string;
};

const PageForm = ({
  initialData,
  initialCategories,
  dataId,
}: PageFormProps) => {
  //router
  const router = useRouter();

  //trpc
  const { data: categories } = trpc.getPostCategories.useQuery(undefined, {
    initialData: initialCategories, // This is the initial data
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  const { data, refetch } = trpc.getPostById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  //state
  const [editorContentState, setEditorContentState] = useState<string>(
    data?.content || ''
  );

  const { refetch: refetchData } = trpc.getPosts.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  // trpc mutation for updating the item
  const updateData = trpc.updatePost.useMutation({
    onSuccess: () => {
      toast.success('Data updated successfully');
      refetch(); // refetch the item data after a successful update
      refetchData(); //refetch the data list
      router.push('/post/list'); // Navigate back to the data list
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
      categoryId: data?.postCategoryId || '',
      title: data?.title || '',
      content: data?.content || '',
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editorContentState === '') {
      toast.error('Content is required');
      return;
    }

    // Sanitize the editor content
    const sanitizedContent = sanitizeContent(editorContentState);
    values.content = sanitizedContent;

    updateData.mutate({
      id: dataId,
      categoryId: values.categoryId,
      title: values.title,
      content: values.content,
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

        {/* Category */}
        <FormField
          control={form.control}
          name='categoryId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a category' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
        {/* show editorContentState */}
        {/* <div className='flex justify-end'>
          <span className='text-sm text-gray-500'>{editorContentState}</span>
        </div> */}

        {/* Tiptap Editor */}
        <label className='block text-sm font-medium md:text-lg'>Content</label>
        <TipTap
          setEditorContentState={setEditorContentState}
          initialContent={data?.content}
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
