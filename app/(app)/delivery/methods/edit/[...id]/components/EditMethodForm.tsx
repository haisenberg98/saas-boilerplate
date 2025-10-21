'use client';

import React, { useEffect } from 'react';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

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
    deliveryZoneId: z.string(),
    methodId: z.string().min(2, { message: 'Method ID is required' }),
    label: z.string().min(2, { message: 'Label must be at least 2 characters' }),
    price: z.coerce.number().min(0, { message: 'Price must be 0 or greater' }),
    estimatedDays: z.string().min(1, { message: 'Estimated days is required' }),
    isFreeEligible: z.boolean(),
    isActive: z.boolean(),
    sortOrder: z.coerce.number().min(0, { message: 'Sort order must be 0 or greater' })
});

const EditMethodForm = () => {
    const router = useRouter();
    const params = useParams();
    const methodId = Array.isArray(params.id) ? params.id[0] : params.id;

    // Get zones and methods data
    const { data: zones } = trpc.getDeliveryZones.useQuery();

    // Find the method across all zones
    const method = zones?.flatMap((zone) => zone.shippingMethods).find((m) => m.id === methodId);
    const currentZone = zones?.find((zone) => zone.shippingMethods.some((m) => m.id === methodId));

    const updateMethod = trpc.updateShippingMethod.useMutation();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            deliveryZoneId: '',
            methodId: '',
            label: '',
            price: 0,
            estimatedDays: '',
            isFreeEligible: false,
            isActive: true,
            sortOrder: 0
        }
    });

    // Populate form when method data is loaded
    useEffect(() => {
        if (method && currentZone) {
            form.reset({
                deliveryZoneId: currentZone.id,
                methodId: method.methodId,
                label: method.label,
                price: method.price,
                estimatedDays: method.estimatedDays,
                isFreeEligible: method.isFreeEligible,
                isActive: method.isActive,
                sortOrder: method.sortOrder
            });
        }
    }, [method, currentZone, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!methodId) return;

        updateMethod.mutate(
            { id: methodId, ...values },
            {
                onError: (error) => {
                    if (error instanceof TRPCClientError) {
                        const cause = error.cause as
                            | { zodError?: { fieldErrors?: Record<string, string[]> } }
                            | undefined;
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
                    toast.success('Shipping method updated successfully');
                    router.push('/delivery/zones');
                }
            }
        );
    }

    if (!method || !currentZone) {
        return <div>Loading...</div>;
    }

    return (
        <section className='w-full space-y-4 px-2 sm:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                <h3 className='text-lg font-semibold sm:text-xl md:text-2xl'>Edit Shipping Method</h3>
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
                                        <Select
                                            key={`${zones?.length ?? 0}-${field.value ?? 'none'}`}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}>
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
                                        <Input placeholder='e.g., nz_tracked' {...field} />
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
                                        <Input placeholder='e.g., Economy' {...field} />
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
                                        <Input type='number' placeholder='14' {...field} />
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
                                        <Input placeholder='e.g., 1-3 business days' {...field} />
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
                                disabled={updateMethod.isLoading}>
                                {updateMethod.isLoading ? 'Updating...' : 'Update Shipping Method'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </section>
    );
};

export default EditMethodForm;
