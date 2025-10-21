'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//ui
import Button from '@/components/global/Button';
import TipTap from '@/components/global/TipTap';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
//utils
import { sanitizeContent } from '@/lib/utils';
//form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';

//components
import ImageUpload from './ImageUpload';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    categoryId: z.string().min(1, { message: 'Category is required' }),
    providerId: z.string().min(1, { message: 'Provider is required' }),
    images: z.array(z.string()),
    name: z.string().min(2, { message: 'Item name must be at least 2 characters' }),
    price: z.coerce
        .number({
            message: 'Price must be a number'
        })
        .gte(1, 'Must be 1 and above'),
    soldCount: z.coerce
        .number({
            message: 'Sold count must be a number'
        })
        .gte(0, 'Must be 0 and above'),
    clickCounts: z.coerce.number({
        message: 'Click Counts must be a number'
    }),
    description: z.string(),
    specification: z.string()
});

//types
type PageFormProps = {
    initialCategories: Awaited<ReturnType<(typeof serverClient)['getCategories']>>;
    initialProduct: Awaited<ReturnType<(typeof serverClient)['getProductById']>>;
    itemId: string;
};

const PageForm = ({ initialCategories, initialProduct, itemId }: PageFormProps) => {
    //router
    const router = useRouter();

    //trpc
    const { data: categories } = trpc.getCategories.useQuery(undefined, {
        initialData: initialCategories, // This is the initial data
        refetchOnMount: false, //prevent refetching on mount
        refetchOnReconnect: false //prevent refetching on reconnect
    });

    const { data: providers } = trpc.getShops.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const { data: item, refetch } = trpc.getProductById.useQuery(itemId, {
        initialData: initialProduct,
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    //state
    const [editorContentState, setEditorContentState] = useState<string>(item?.specification || '');

    const { refetch: refetchProducts } = trpc.getProducts.useQuery(undefined, {
        refetchOnMount: false, //prevent refetching on mount
        refetchOnReconnect: false //prevent refetching on reconnect
    });

    // trpc mutation for updating the item
    const updateProduct = trpc.updateProduct.useMutation({
        onSuccess: () => {
            toast.success('Item updated successfully');
            refetch(); // refetch the item data after a successful update
            refetchProducts(); //refetch the item list
            router.push('/item/list'); // Navigate back to the item list
        },
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                toast.error('Something went wrong: ' + error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        }
    });

    //define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: item?.name || '',
            images: [],
            categoryId: item?.category?.id || '',
            providerId: item?.provider?.id || '',
            price: item?.price || 0,
            soldCount: item?.soldCount || 0,
            clickCounts: item?.clickCounts || 0,
            description: item?.description || '',
            specification: item?.specification || ''
        }
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

        updateProduct.mutate({
            id: itemId,
            name: values.name,
            categoryId: values.categoryId,
            providerId: values.providerId,
            price: values.price,
            soldCount: values.soldCount,
            clickCounts: values.clickCounts,
            description: values.description,
            specification: values.specification
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-2'>
                {/* images upload */}
                <ImageUpload itemId={itemId} productImages={item?.images} refetchProduct={refetch} />
                {/* category */}
                <FormField
                    control={form.control}
                    name='categoryId'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a category' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories?.map((category) => (
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a provider' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {providers?.map((provider) => (
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
                    name='clickCounts'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Click Counts</FormLabel>
                            <FormControl>
                                <Input type='text' {...field} />
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
                                <Textarea {...field} rows={7} />
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
                <Textarea {...field} rows={8} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}
                {/* Tiptap Editor */}
                <label className='block text-sm font-medium md:text-lg'>Specifications</label>
                <TipTap setEditorContentState={setEditorContentState} initialContent={item?.specification || ''} />
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
