'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//ui
import Button from '@/components/global/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
//form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    code: z.string().min(2, { message: 'Code must be at least 2 characters' }),
    discountValue: z.coerce
        .number({
            message: 'Discount Value must be a number'
        })
        .gte(1, 'Must be 1 and above'),
    isPercentage: z.boolean(),
    isPublished: z.boolean(),
    maxUsage: z.coerce
        .number({
            message: 'Max Usage must be a number'
        })
        .gte(1, 'Must be 1 and above')
});

const PageForm = ({ initialData }: { initialData: Awaited<ReturnType<(typeof serverClient)['getDiscountCodes']>> }) => {
    const router = useRouter();
    //trpc
    const { refetch } = trpc.getDiscountCodes.useQuery(undefined, {
        initialData: initialData, // This is the initial data
        refetchOnMount: false, //prevent refetching on mount
        refetchOnReconnect: false //prevent refetching on reconnect
    });

    const addData = trpc.addDiscountCode.useMutation();

    //define form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            code: '',
            discountValue: 0,
            isPercentage: false,
            isPublished: false,
            maxUsage: 0
        }
    });

    //submit
    async function onSubmit(values: z.infer<typeof formSchema>) {
        addData.mutate(values, {
            onError: (error) => {
                if (error instanceof TRPCClientError) {
                    toast.error(error.message);
                }
                if (error instanceof TRPCError) {
                    toast.error(error.message);
                }
            },
            onSuccess: async (data) => {
                try {
                    toast.success('Data added successfully');
                    form.reset({
                        code: '',
                        discountValue: 0,
                        isPercentage: false,
                        isPublished: false,
                        maxUsage: 0
                    }); // Reset the form fields
                    refetch(); // Refetch the data
                    router.push('/discount/list'); // Redirect to the list page
                } catch (error) {
                    if (error instanceof Error) {
                        toast.error(`Failed to add data: ${error.message}`);
                    } else {
                        toast.error('Failed to add data due to an unknown error');
                    }
                }
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-2'>
                <FormField
                    control={form.control}
                    name='code'
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
                    name='discountValue'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                                <Input type='number' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='isPercentage'
                    render={({ field }) => (
                        <FormItem>
                            <div className='space-y-1 leading-none'>
                                <FormLabel>Is Percentage Discount</FormLabel>
                            </div>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className='ml-2' />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='isPublished'
                    render={({ field }) => (
                        <FormItem>
                            <div className='space-y-1 leading-none'>
                                <FormLabel>Publish</FormLabel>
                            </div>
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} className='ml-2' />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='maxUsage'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Max Usage</FormLabel>
                            <FormControl>
                                <Input type='number' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

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
