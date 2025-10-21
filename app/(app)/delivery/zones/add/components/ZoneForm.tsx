"use client";

import React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// trpc
import { trpc } from '@/app/_trpc/client';
// ui
import Button from '@/components/global/Button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(2, { message: 'Zone name must be at least 2 characters' }),
    countryCode: z.string().min(2, { message: 'Country code is required' }),
    currency: z.enum(['NZD', 'AUD']),
    freeThreshold: z.coerce.number().min(0, { message: 'Free threshold must be 0 or greater' }),
    isActive: z.boolean()
});

const ZoneForm = () => {
    const router = useRouter();
    const createZone = trpc.createDeliveryZone.useMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            countryCode: '',
            currency: 'NZD',
            freeThreshold: 150,
            isActive: true
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        createZone.mutate(values, {
            onError: (error) => {
                if (error instanceof TRPCClientError) {
                    const cause = error.cause as { zodError?: { fieldErrors?: Record<string, string[]> } } | undefined;
                    const zodErrors = cause?.zodError?.fieldErrors;

                    if (zodErrors) {
                        for (const field in zodErrors) {
                            const message = zodErrors[field]?.[0];
                            if (message) toast.error(message);
                        }
                    } else {
                        toast.error(error.message);
                    }
                }
            },
            onSuccess: () => {
                toast.success('Delivery zone created successfully');
                router.push('/delivery/zones');
            }
        });
    }

    return (
        <section className='w-full space-y-4 px-2 sm:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                <h3 className='text-lg font-semibold sm:text-xl md:text-2xl'>Add Delivery Zone</h3>
                <Button className='w-fit'>
                    <Link href='/delivery/zones' className='text-sm sm:text-base'>
                        Back to Zones
                    </Link>
                </Button>
            </div>

            <div className='rounded-lg bg-white p-4 shadow-md sm:p-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-2'>
                        <FormField
                            name='name'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Zone Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., New Zealand' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='countryCode'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., NZ' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='currency'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select currency' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='NZD'>NZD</SelectItem>
                                                <SelectItem value='AUD'>AUD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='freeThreshold'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Free Shipping Threshold</FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='150' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='isActive'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 '>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel>Enable this delivery zone</FormLabel>
                                        <p className='text-muted-foreground text-sm'>
                                            When enabled, customers will see this zone&apos;s shipping options during
                                            checkout
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className='pt-6 md:flex md:justify-center'>
                            <Button className='w-full md:w-auto md:px-14' type='submit' disabled={createZone.isLoading}>
                                {createZone.isLoading ? 'Creating...' : 'Create Delivery Zone'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default ZoneForm;
