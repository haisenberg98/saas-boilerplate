'use client';

import React, { useEffect } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
    deliveryZoneId: z.string().min(1, { message: 'Delivery zone is required' }),
    methodId: z.string().min(2, { message: 'Method ID is required' }),
    label: z.string().min(2, { message: 'Label must be at least 2 characters' }),
    price: z.coerce.number().min(0, { message: 'Price must be 0 or greater' }),
    estimatedDays: z.string().min(1, { message: 'Estimated days is required' }),
    isFreeEligible: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().min(0, { message: 'Sort order must be 0 or greater' })
});

const AddMethodForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedZoneId = searchParams.get('zoneId');

    // Get zones data
    const { data: zones } = trpc.getDeliveryZones.useQuery();
    const createMethod = trpc.createShippingMethod.useMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deliveryZoneId: preselectedZoneId || '',
            methodId: '',
            label: '',
            price: 0,
            estimatedDays: '',
            isFreeEligible: false,
            isActive: true,
            sortOrder: 1
        }
    });

    // Set preselected zone if available
    useEffect(() => {
        if (preselectedZoneId) {
            form.setValue('deliveryZoneId', preselectedZoneId);
        }
    }, [preselectedZoneId, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        createMethod.mutate(values, {
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
                toast.success('Shipping method created successfully');
                router.push('/delivery/zones');
            }
        });
    }

    return (
        <section className='w-full space-y-4 px-2 sm:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                <h3 className='text-lg font-semibold sm:text-xl md:text-2xl'>Add Shipping Method</h3>
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
                            name='deliveryZoneId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Delivery Zone</FormLabel>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select delivery zone' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {zones?.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.id}>
                                                        {zone.name} ({zone.countryCode})
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
                            name='methodId'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Method ID</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., nz_express' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='label'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Label</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., Express' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='price'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price</FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='18' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='estimatedDays'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estimated Days</FormLabel>
                                    <FormControl>
                                        <Input placeholder='e.g., 1-2 business days' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='sortOrder'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Sort Order</FormLabel>
                                    <FormControl>
                                        <Input type='number' placeholder='1' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='isFreeEligible'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel>Free shipping eligible</FormLabel>
                                        <p className='text-muted-foreground text-sm'>
                                            This method can be free when order reaches the free shipping threshold
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            name='isActive'
                            control={form.control}
                            render={({ field }) => (
                                <FormItem className='flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4'>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className='space-y-1 leading-none'>
                                        <FormLabel>Active shipping method</FormLabel>
                                        <p className='text-muted-foreground text-sm'>
                                            When enabled, customers will see this shipping method option
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <div className='pt-6 md:flex md:justify-center'>
                            <Button
                                className='w-full md:w-auto md:px-14'
                                type='submit'
                                disabled={createMethod.isLoading}>
                                {createMethod.isLoading ? 'Creating...' : 'Create Shipping Method'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default AddMethodForm;
