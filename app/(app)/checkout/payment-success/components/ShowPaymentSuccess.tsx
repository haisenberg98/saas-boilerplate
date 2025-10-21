'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

//components
import Loader from '@/components/global/Loader';
//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
//hooks
import { useCurrency } from '@/hooks/useCurrency';
//utils
import { displayPrice } from '@/lib/money';
import { clearCart, clearDeliveryInfo } from '@/redux/slices/cartSlice';

type ShowPaymentSuccessProps = {
    amount: string; // always coming in NZD (backend)
    paymentIntent: string;
};

const ShowPaymentSuccess = ({ amount, paymentIntent }: ShowPaymentSuccessProps) => {
    const router = useRouter();
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch();
    const currency = useCurrency(); // NZD or AUD

    useEffect(() => {
        const hasSeenPage = localStorage.getItem('paymentSeen');

        if (hasSeenPage === paymentIntent) {
            router.replace('/');
        } else {
            const validatePayment = async () => {
                try {
                    const res = await fetch('/api/validate-payment', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            paymentIntentId: paymentIntent
                        })
                    });

                    const data = await res.json();
                    if (data.success) {
                        localStorage.setItem('paymentSeen', paymentIntent);
                        setIsValid(true);
                        dispatch(clearCart());
                        dispatch(clearDeliveryInfo());
                    } else {
                        router.replace('/');
                    }
                } catch (error) {
                    console.error('Error validating payment:', error);
                    router.replace('/');
                } finally {
                    setLoading(false);
                }
            };

            validatePayment();
        }
    }, [paymentIntent, router, dispatch]);

    if (loading) {
        return (
            <div className='mt-20 flex w-full flex-col items-center px-4'>
                <Loader />
            </div>
        );
    }

    if (!isValid) {
        return null;
    }

    const amountNumber = Number(amount) || 0;

    return (
        <div className='mt-20 flex w-full flex-col items-center px-4'>
            <h1 className='text-3xl font-bold'>Thank you!</h1>
            <span className='mt-4'>You successfully paid</span>
            <div className='mt-8 w-full rounded-md bg-customPrimary py-2 text-center text-3xl font-bold text-customSecondary md:flex md:w-auto md:items-center md:px-14'>
                <span className='text-center'>{displayPrice(amountNumber, currency)}</span>
            </div>
            <span className='mt-8'>We have sent a receipt to your email.</span>
        </div>
    );
};

export default ShowPaymentSuccess;
