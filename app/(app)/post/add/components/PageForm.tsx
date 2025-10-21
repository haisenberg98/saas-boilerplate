'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';
import { TRPCError } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

//components
import Button from '@/components/global/Button';
import { Input } from '@/components/ui/input';
import TipTap from '@/components/global/TipTap';
import ImageUpload from './ImageUpload';

//utils
import { sanitizeContent } from '@/lib/utils';

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

const formSchema = z.object({
  images: z.array(z.string()),
  categoryId: z.string().min(1, { message: 'Category is required' }),
  title: z
    .string()
    .min(2, { message: 'Post title must be at least 2 characters' }),
  content: z.string(),
});

const PageForm = ({
  initialData,
  initialCategories,
}: {
  initialData: Awaited<ReturnType<(typeof serverClient)['getPosts']>>;
  initialCategories: Awaited<
    ReturnType<(typeof serverClient)['getPostCategories']>
  >;
}) => {
  const router = useRouter();

  //TRPC
  const { data: categories } = trpc.getPostCategories.useQuery(undefined, {
    initialData: initialCategories,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { refetch } = trpc.getPosts.useQuery(undefined, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  //state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State to store selected files
  const [editorContentState, setEditorContentState] = useState<string>('');

  const addPost = trpc.addPost.useMutation();

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      categoryId: '',
      title: '',
      content: '',
    },
  });

  // Submit the form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editorContentState === '') {
      toast.error('Content is required');
      return;
    }

    // Sanitize the editor content
    const sanitizedContent = sanitizeContent(editorContentState);
    values.content = sanitizedContent;

    addPost.mutate(values, {
      onError: error => {
        if (error instanceof TRPCClientError) {
          toast.error('Something went wrong');
        }
        if (error instanceof TRPCError) {
          toast.error(error.message);
        }
      },
      onSuccess: async data => {
        //add images
        try {
          //UPLOAD IMAGES
          const formData = new FormData();
          selectedFiles.forEach(file => {
            formData.append('images', file); // 'files' is the key, you can change it to 'file' if uploading one by one
            formData.append('dataId', data.id);
          });
          const response = await fetch('/api/upload-post-image', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            toast.success('Data added successfully');
            form.reset({
              title: '',
              content: '',
            });
            setEditorContentState('');
            refetch();
            router.push('/post/list');
          } else {
            toast.error('Failed to add data');
          }
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
        {/* image upload */}
        <ImageUpload
          imagePreviews={imagePreviews}
          setImagePreviews={setImagePreviews}
          setSelectedFiles={setSelectedFiles}
        />
        {/* category */}
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

        {/* Tiptap Editor */}
        <label className='block text-sm font-medium md:text-lg'>Content</label>
        <TipTap setEditorContentState={setEditorContentState} />

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
