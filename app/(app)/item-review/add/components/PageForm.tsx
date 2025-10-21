'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    rating: z.coerce
        .number({
            message: 'Rating must be a number'
        })
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5'),
    review: z.string().min(2, { message: 'Review must be at least 2 characters' }),
    itemId: z.string().min(1, { message: 'Please select a item' }),
    userId: z.string().min(1, { message: 'Please select a user' })
});

const PageForm = () => {
    //router
    const router = useRouter();

    //trpc
    const { data: items } = trpc.getProducts.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const { data: users } = trpc.getUsers.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const { refetch: refetchReviews } = trpc.getProductReviews.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    // trpc mutation for creating the review
    const createReview = trpc.createProductReview.useMutation({
        onSuccess: () => {
            toast.success('Fake review created successfully');
            refetchReviews(); //refetch the reviews list
            router.push('/item-review/list'); // Navigate back to the reviews list
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
            rating: 5,
            review: '',
            itemId: '',
            userId: ''
        }
    });

    //submit
    async function onSubmit(values: z.infer<typeof formSchema>) {
        createReview.mutate({
            rating: values.rating,
            review: values.review,
            itemId: values.itemId,
            userId: values.userId
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-4'>
                {/* Item Selection */}
                <FormField
                    control={form.control}
                    name='itemId'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Item</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className='block w-full rounded-md border border-gray-300 px-4 py-2 text-base shadow-sm focus-visible:ring-slate-950 sm:text-sm'>
                                    <option value='' disabled>
                                        Select a item
                                    </option>
                                    {items?.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* User Selection */}
                <FormField
                    control={form.control}
                    name='userId'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User (Review Author)</FormLabel>
                            <FormControl>
                                <select
                                    {...field}
                                    className='block w-full rounded-md border border-gray-300 px-4 py-2 text-base shadow-sm focus-visible:ring-slate-950 sm:text-sm'>
                                    <option value='' disabled>
                                        Select a user
                                    </option>
                                    {users?.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
                                    className='block w-full rounded-md border border-gray-300 px-4 py-2 text-base shadow-sm focus-visible:ring-slate-950 sm:text-sm'
                                    value={field.value || ''}>
                                    <option value='' disabled>
                                        Select rating
                                    </option>
                                    {[1, 2, 3, 4, 5].map((item) => (
                                        <option key={item} value={item}>
                                            {item} star{item > 1 ? 's' : ''}
                                        </option>
                                    ))}
                                </select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Review Text */}
                <FormField
                    control={form.control}
                    name='review'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Review Text</FormLabel>
                            <FormControl>
                                <Textarea {...field} className='h-40' placeholder='Write the fake review content here...' />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className='pt-6 md:flex md:justify-center'>
                    <Button
                        className='w-full md:w-auto md:px-14'
                        type='submit'
                        disabled={createReview.isLoading}>
                        {createReview.isLoading ? 'Creating...' : 'Create Fake Review'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default PageForm;