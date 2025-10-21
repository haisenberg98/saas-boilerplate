'use client';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

//utils
import { sanitizeContent } from '@/lib/utils';

//trpc
import { trpc } from '@/app/_trpc/client';
import { TRPCError } from '@trpc/server';
import { TRPCClientError } from '@trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

//form
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { set, z } from 'zod';

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

const formSchema = z.object({
  categoryId: z.string().min(1, { message: 'Category is required' }),
  providerId: z.string().min(1, { message: 'Provider is required' }),
  images: z.array(z.string()),
  name: z
    .string()
    .min(2, { message: 'Item name must be at least 2 characters' }),
  price: z.coerce
    .number({
      message: 'Price must be a number',
    })
    .gte(1, 'Must be 1 and above'),
  soldCount: z.coerce
    .number({
      message: 'Sold count must be a number',
    })
    .gte(0, 'Must be 0 and above'),
  description: z.string(),
  specification: z.string(),
});

const PageForm = ({
  initialCategories,
  initialShops,
}: {
  initialCategories: Awaited<
    ReturnType<(typeof serverClient)['getCategories']>
  >;
  initialShops: Awaited<ReturnType<(typeof serverClient)['getShops']>>;
}) => {
  //trpc
  const { data: categories } = trpc.getCategories.useQuery(undefined, {
    initialData: initialCategories, // This is the initial data
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });
  const { data: providers } = trpc.getShops.useQuery(undefined, {
    initialData: initialShops, // This is the initial data
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });

  const addProduct = trpc.addProduct.useMutation();

  //states
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // State to store selected files
  const [editorContentState, setEditorContentState] = useState<string>('');

  //define form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      images: [],
      categoryId: '',
      providerId: '',
      price: 0,
      soldCount: 0,
      description: '',
      specification: '',
    },
  });

  //submit
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (editorContentState === '') {
      toast.error('Specs is required');
      return;
    }
    // Sanitize the editor content
    const sanitizedContent = sanitizeContent(editorContentState);
    values.specification = sanitizedContent;

    addProduct.mutate(values, {
      onError: error => {
        if (error instanceof TRPCClientError) {
          toast.error('Something went wrong');
        }
        if (error instanceof TRPCError) {
          toast.error(error.message);
        }
      },
      onSuccess: async data => {
        //add item images
        try {
          //UPLOAD IMAGES
          const formData = new FormData();
          selectedFiles.forEach(file => {
            formData.append('images', file); // 'files' is the key, you can change it to 'file' if uploading one by one
            formData.append('itemId', data.id);
          });
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            toast.success('Item added successfully');
            form.reset({
              name: '',
              images: [],
              categoryId: '',
              providerId: '',
              price: 0,
              soldCount: 0,
              description: '',
              specification: '',
            }); // Reset the form fields
            setSelectedFiles([]);
            setImagePreviews([]);
            setEditorContentState('');
          } else {
            toast.error('Failed to create item');
          }
        } catch (error) {
          if (error instanceof Error) {
            toast.error(`Failed to create item: ${error.message}`);
          } else {
            toast.error('Failed to create item due to an unknown error');
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
        {/* images upload */}
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
        {/* provider */}
        <FormField
          control={form.control}
          name='providerId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Select a provider' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {providers?.map(provider => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
          name='price'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type='text' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='soldCount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sold Count</FormLabel>
              <FormControl>
                <Input type='number' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name='specification'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specifications</FormLabel>
              <FormControl>
                <Textarea {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
        <label className='block text-sm font-medium md:text-lg'>
          Specifications
        </label>
        <TipTap setEditorContentState={setEditorContentState} />

        <div className='pt-6 md:flex md:justify-center'>
          <Button className='w-full md:w-auto md:px-14' type='submit'>
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PageForm;
