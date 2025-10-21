'use client';

import React from 'react';

// trpc
import { trpc } from '@/app/_trpc/client';
// ui
import Button from '@/components/global/Button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
// redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { saveDiscountInfo } from '@/redux/slices/cartSlice';
// form
import { zodResolver } from '@hookform/resolvers/zod';
import { TRPCClientError } from '@trpc/client';
import { TRPCError } from '@trpc/server';

import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    discountCode: z.string().min(2, { message: 'Discount code must be at least 2 characters' }),
    totalPrice: z.coerce
        .number({
            message: 'Total price must be a number'
        })
        .gte(1, 'Must be 1 and above')
});

const PageForm = () => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const cartPreTotalPrice = cart.preTotalPrice;

    const checkDiscountCode = trpc.checkDiscountCode.useMutation();
    const alreadyHasDiscount = !!cart.discountInfo;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            discountCode: '',
            totalPrice: cartPreTotalPrice
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        values.totalPrice = cartPreTotalPrice;

        checkDiscountCode.mutate(values, {
            onError: (error) => {
                if (error instanceof TRPCClientError || error instanceof TRPCError) {
                    toast.error(error.message);
                }
            },
            onSuccess: (data) => {
                // ✅ Only save the discount rule to Redux — never the appliedAmount
                const discountInfo = {
                    code: values.discountCode,
                    discountAmount: data.discountAmount, // 10 (percentage) or $15 (flat)
                    isPercentageDiscount: data.isPercentageDiscount,
                    discountMessage: data.discountMessage
                };

                // ✅ Optional: display appliedAmount locally (never save to Redux)
                if (data.appliedAmount !== undefined) {
                    console.log(`Applied discount value (for info only): $${data.appliedAmount}`);
                }

                form.reset();
                toast.success(data.discountMessage);

                dispatch(saveDiscountInfo(discountInfo)); // This will trigger total recalculation
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='mb-4 flex flex-col'>
                <label htmlFor='discountCode' className='mb-1 text-sm'>
                    Discount code
                </label>
                <div className='flex items-start md:items-center'>
                    <FormField
                        control={form.control}
                        name='discountCode'
                        render={({ field }) => (
                            <FormItem className='flex w-full grid-cols-2 flex-col'>
                                <FormControl>
                                    <Input type='text' {...field} />
                                </FormControl>
                                <FormMessage className='mt-1' />
                            </FormItem>
                        )}
                    />

                    <div className='pl-2 pt-1 md:flex md:justify-center md:pt-0'>
                        <Button
                            className='w-full text-xs md:w-auto md:px-14 md:py-1'
                            type='submit'
                            disabled={alreadyHasDiscount}>
                            Apply
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default PageForm;
