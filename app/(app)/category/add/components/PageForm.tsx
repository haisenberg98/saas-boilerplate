'use client';

import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

//trpc
import { trpc } from '@/app/_trpc/client';
//ui
import Button from '@/components/global/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
//form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';

//components
import CategoryImageUpload from './CategoryImageUpload';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Category name must be at least 2 characters' }),
    orderNumber: z.coerce
        .number({
            message: 'Order number must be a number'
        })
        .int()
        .min(0, 'Order number must be 0 or above')
        .optional()
});

const PageForm = () => {
    const router = useRouter();
    const [categoryImage, setCategoryImage] = useState<string | null>(null);

    const addCategory = trpc.addCategory.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: () => {
            toast.success('Category created successfully');
            router.push('/category/list');
        }
    });

    //define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            orderNumber: 0
        }
    });

    //handle form submit
    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            addCategory.mutate({
                ...values,
                image: categoryImage ?? undefined
            });
        } catch (error) {
            console.error('Form submission error:', error);
            toast.error('Failed to create category');
        }
    }

    const handleImageUpload = (imageUrl: string) => {
        setCategoryImage(imageUrl);
    };

    const handleImageDelete = () => {
        setCategoryImage(null);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                {/* Category Image Upload */}
                <CategoryImageUpload
                    currentImage={categoryImage}
                    onImageUpload={handleImageUpload}
                    onImageDelete={handleImageDelete}
                />

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Category Name */}
                    <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category Name</FormLabel>
                                <FormControl>
                                    <Input placeholder='Enter category name' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Order Number */}
                    <FormField
                        control={form.control}
                        name='orderNumber'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Order Number</FormLabel>
                                <FormControl>
                                    <Input type='number' placeholder='0' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className='flex flex-col space-y-4 pt-4 sm:flex-row sm:justify-between sm:space-y-0'>
                    <Button type='button' onClick={() => router.push('/category/list')} className='w-full sm:w-auto'>
                        Cancel
                    </Button>
                    <Button type='submit' disabled={addCategory.isLoading} className='w-full sm:w-auto'>
                        {addCategory.isLoading ? 'Creating...' : 'Create Category'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PageForm;
