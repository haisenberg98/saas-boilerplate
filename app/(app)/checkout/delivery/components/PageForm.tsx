'use client';

import React, { useEffect, useMemo } from 'react';

import { useRouter } from 'next/navigation';

// trpc
import { trpc } from '@/app/_trpc/client';
// ui
import Button from '@/components/global/Button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
// redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useCurrency } from '@/hooks/useCurrency';
import { displayPrice, fmtNZD } from '@/lib/money';
import { saveDeliveryInfo } from '@/redux/slices/cartSlice';
import { lockCurrency, unlockCurrency } from '@/redux/slices/currencySlice';
import { useUser } from '@clerk/clerk-react';
// form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';

import { countries } from 'countries-list';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

/* ----------------------------- helpers/setup ----------------------------- */

const SUPPORTED = ['NZ', 'AU']; // add more later
const NEEDS_REGION: Record<string, boolean> = { AU: true, NZ: false };

const POSTCODE_PATTERNS: Record<string, RegExp> = {
    NZ: /^[0-9]{4}$/, // 1010
    AU: /^[0-9]{4}$/ // 3000
};

const countryList = Object.entries(countries)
    .map(([code, c]) => ({ code, name: c.name }))
    .filter((c) => SUPPORTED.includes(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));

const phoneLooksValid = (v: string) => /^[+0-9][0-9\s()-]{7,}$/.test(v.trim());

/* ----------------------------- helpers/setup ----------------------------- */

// Shipping method type to match database structure
type ShippingMethod = {
    id: string;
    methodId: string;
    label: string;
    price: number;
    estimatedDays: string;
    isFreeEligible: boolean;
    isActive: boolean;
    sortOrder: number;
};

/* --------------------------------- schema -------------------------------- */

const formSchema = z
    .object({
        firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
        lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
        phone: z
            .string()
            .refine(phoneLooksValid, { message: 'Enter a valid phone number (with country code if possible)' }),
        address: z.string().min(10, { message: 'Address must be at least 10 characters' }),
        suburb: z.string().min(2, { message: 'Suburb must be at least 2 characters' }),
        city: z.string().min(2, { message: 'City must be at least 2 characters' }),
        postCode: z.string().min(3, { message: 'Enter a valid postcode' }),
        country: z.string().min(2, { message: 'Select a country' }),
        region: z.string().optional(),
        deliveryInstructions: z.string().optional(),
        deliveryMethod: z.string().default('nz_tracked')
    })
    .superRefine((vals, ctx) => {
        const pat = POSTCODE_PATTERNS[vals.country];
        if (pat && !pat.test(vals.postCode.toUpperCase().trim())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['postCode'],
                message: 'Invalid postcode for selected country'
            });
        }
        if (NEEDS_REGION[vals.country] && !vals.region) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['region'],
                message: 'State/Region is required'
            });
        }
    });

/* -------------------------------- component ------------------------------- */

const PageForm = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { deliveryInfo, preTotalPrice } = useAppSelector((s) => s.cart);
    const { user } = useUser();
    const addDeliveryDetails = trpc.addDeliveryDetails.useMutation();

    const country = useAppSelector((s) => s.cart.deliveryInfo?.country ?? 'NZ');
    const currency = useCurrency();

    const [hydrated, setHydrated] = React.useState(false);
    useEffect(() => {
        setHydrated(true);
    }, []);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: deliveryInfo?.firstName ?? '',
            lastName: deliveryInfo?.lastName ?? '',
            phone: deliveryInfo?.phone ?? '',
            address: deliveryInfo?.address ?? '',
            suburb: deliveryInfo?.suburb ?? '',
            city: deliveryInfo?.city ?? '',
            postCode: deliveryInfo?.postCode ?? '',
            country: deliveryInfo?.country ?? SUPPORTED[0] ?? 'NZ', // pick saved country first
            region: deliveryInfo?.region ?? '',
            deliveryInstructions: deliveryInfo?.deliveryInstructions ?? '',
            deliveryMethod: deliveryInfo?.deliveryMethod ?? 'nz_tracked'
        }
    });

    // (moved below after currentDeliveryZone declaration)

    // Prefill from local/clerk
    useEffect(() => {
        if (deliveryInfo) {
            form.reset(deliveryInfo);
        } else if (user) {
            form.reset({
                ...form.getValues(),
                firstName: user.firstName || '',
                lastName: user.lastName || ''
            });
        }
    }, [user, deliveryInfo]);

const selectedCountry = form.watch('country');

// Get current delivery zone for selected country
const { data: currentDeliveryZone } = trpc.getDeliveryZoneByCountry.useQuery(selectedCountry, {
    refetchOnMount: false,
    refetchOnReconnect: false
});

    // Lock currency based on Delivery Zone config (admin-managed)
    useEffect(() => {
        const zoneCurrency = currentDeliveryZone?.currency as 'NZD' | 'AUD' | undefined;
        if (!zoneCurrency) return; // wait for zone to load
        dispatch(lockCurrency(zoneCurrency));

        return () => {
            dispatch(unlockCurrency()); // cleanup when leaving checkout
        };
    }, [currentDeliveryZone?.currency, dispatch]);

    // Dynamic shipping methods from database
    const shippingMethods: ShippingMethod[] = useMemo(() => {
        if (!currentDeliveryZone?.shippingMethods) return [];

        return currentDeliveryZone.shippingMethods.map((method) => {
            // Apply free shipping if eligible and over threshold
            if (method.isFreeEligible && preTotalPrice >= currentDeliveryZone.freeThreshold) {
                return { ...method, price: 0 };
            }

            return method;
        });
    }, [currentDeliveryZone, preTotalPrice]);

    // Use existing MinimumOrder system
    const { data: minOrderData } = trpc.getMinimumOrder.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const minOrder = useMemo(() => {
        // Only enforce when DB returns a valid positive number
        const val = minOrderData?.amount;

        return typeof val === 'number' && isFinite(val) && val > 0 ? val : null;
    }, [minOrderData]);

    // Ensure a valid shipping method for the selected country
    useEffect(() => {
        const current = form.getValues('deliveryMethod');
        const validIds = new Set(shippingMethods.map((m) => m.methodId));
        if (!validIds.has(current)) {
            const first = shippingMethods[0]?.methodId;
            if (first) form.setValue('deliveryMethod', first, { shouldValidate: true });
        }
    }, [shippingMethods, form]);

    // Enforce minimum order per country
    useEffect(() => {
        // Guard with hydration so reloads use persisted cart before enforcing
        if (!hydrated) return;
        if (minOrder != null && preTotalPrice < minOrder) {
            toast.info(
                `Minimum order for ${selectedCountry === 'AU' ? 'Australia' : 'New Zealand'} is ${fmtNZD(minOrder)}`
            );
            router.push('/');
        }
    }, [hydrated, preTotalPrice, minOrder, selectedCountry, router]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (minOrder != null && preTotalPrice < minOrder) {
            toast.info(
                `Minimum order for ${selectedCountry === 'AU' ? 'Australia' : 'New Zealand'} is ${fmtNZD(minOrder)}`
            );

            return;
        }

        const payload = {
            ...values,
            postCode: values.postCode.toUpperCase().trim(),
            phone: values.phone.trim(),
            country: values.country.trim(),
            deliveryInstructions: values.deliveryInstructions ?? '',
            region: values.region ?? ''
        };

        // Get selected shipping method from current delivery zone
        const selectedMethod = currentDeliveryZone?.shippingMethods.find((m) => m.methodId === payload.deliveryMethod);

        let deliveryFee = selectedMethod?.price ?? 0;

        // Apply free shipping if above threshold and method is eligible
        if (selectedMethod?.isFreeEligible && preTotalPrice >= (currentDeliveryZone?.freeThreshold ?? Infinity)) {
            deliveryFee = 0;
        }

        addDeliveryDetails.mutate(payload, {
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
                // Save label + id + fee
                dispatch(
                    saveDeliveryInfo({
                        ...payload,
                        deliveryFee,
                        deliveryMethodLabel: selectedMethod?.label ?? payload.deliveryMethod
                    })
                );
                router.push('/checkout/payment');
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='flex w-full flex-col space-y-2'>
                <FormField
                    name='firstName'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='lastName'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='phone'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormDescription className='hidden lg:flex'>
                                Include country code (e.g. +64 for NZ, +61 for AU)
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    name='address'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='suburb'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Suburb</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='city'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='postCode'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Post Code</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>

                            {/* Prevent hydration mismatch */}
                            {hydrated && (
                                <FormDescription>
                                    {selectedCountry === 'NZ'
                                        ? 'NZ: 4 digits (e.g. 1010)'
                                        : selectedCountry === 'AU'
                                          ? 'AU: 4 digits (e.g. 3000)'
                                          : ''}
                                </FormDescription>
                            )}

                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <FormField
                    name='country'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value}
                                    onValueChange={(v) => {
                                        field.onChange(v);

                                        // Clear region if switching to a country that doesn't need it
                                        if (!NEEDS_REGION[v]) {
                                            form.setValue('region', '', { shouldValidate: false });
                                        }

                                        form.trigger(['postCode', 'region']); // revalidate these when country changes
                                    }}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select a country' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {countryList.map((c) => (
                                            <SelectItem key={c.code} value={c.code}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                {hydrated && NEEDS_REGION[selectedCountry] && (
                    <FormField
                        name='region'
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>State / Region</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                    Required for Australian addresses (e.g. NSW, VIC, QLD)
                                </FormDescription>
                                <FormMessage className='mt-1' />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    name='deliveryInstructions'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Delivery Instructions</FormLabel>
                            <FormControl>
                                <Textarea {...field} />
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                {/* ---------- Shipping methods (dynamic by country & subtotal) ---------- */}
                <FormField
                    name='deliveryMethod'
                    control={form.control}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Shipping Method</FormLabel>
                            <FormControl>
                                <RadioGroup
                                    value={field.value}
                                    onValueChange={(val) => field.onChange(val)}
                                    className='grid gap-2'>
                                    {shippingMethods.map((m) => (
                                        <div key={m.methodId} className='flex items-start gap-3 rounded-md border p-3'>
                                            <RadioGroupItem value={m.methodId} id={m.methodId} className='mt-1' />
                                            <label htmlFor={m.methodId} className='cursor-pointer'>
                                                <div className='text-base font-medium'>
                                                    {m.label} —{' '}
                                                    {m.price === 0 ? 'FREE' : displayPrice(m.price, currency)}
                                                </div>
                                                <div className='text-muted-foreground text-xs'>
                                                    Estimated delivery: {m.estimatedDays}
                                                </div>
                                                {m.isFreeEligible && currentDeliveryZone && m.price > 0 && (
                                                    <div className='text-muted-foreground text-xs'>
                                                        Free over{' '}
                                                        {displayPrice(currentDeliveryZone.freeThreshold, currency)}.
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage className='mt-1' />
                        </FormItem>
                    )}
                />

                <div className='pt-6 md:flex md:justify-center'>
                    <Button className='w-full md:w-auto md:px-14' type='submit'>
                        Continue
                    </Button>
                </div>

                <p className='text-muted-foreground pt-2 text-xs'>
                    We currently ship to New Zealand & Australia. Want us in your country? Contact us and we will
                    arrange it.
                </p>
            </form>
        </Form>
    );
};

export default PageForm;
