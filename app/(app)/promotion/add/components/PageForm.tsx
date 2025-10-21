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
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  images: z.array(z.string()),

  title: z
    .string()
    .min(2, { message: 'Promotion title must be at least 2 characters' }),
  hasLink: z.boolean(),
  published: z.boolean(),
  description: z.string(),
});

const PageForm = ({
  initialData,
}: {
  initialData: Awaited<ReturnType<(typeof serverClient)['getAllPromotions']>>;
}) => {
  const router = useRouter();

  //TRPC
  const { refetch } = trpc.getAllPromotions.useQuery(undefined, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  //state
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State to store selected files
  const [editorContentState, setEditorContentState] = useState<string>('');

  const addData = trpc.addPromotion.useMutation();

  // Define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      images: [],
      title: '',
      hasLink: false,
      published: false,
      description: '',
    },
  });

  // Submit the form
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editorContentState === '') {
      toast.error('Description is required');
      return;
    }

    // Sanitize the editor content
    const sanitizedContent = sanitizeContent(editorContentState);
    values.description = sanitizedContent;

    addData.mutate(values, {
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
          const response = await fetch('/api/upload-promotion-image', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            toast.success('Data added successfully');
            form.reset({
              title: '',
              description: '',
            });
            setEditorContentState('');
            refetch();
            router.push('/promotion/list');
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
        <FormField
          control={form.control}
          name='published'
          render={({ field }) => (
            <FormItem>
              <div className='space-y-1 leading-none'>
                <FormLabel>Publish</FormLabel>
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
        <label className='block text-sm font-medium md:text-lg'>
          Description
        </label>
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
