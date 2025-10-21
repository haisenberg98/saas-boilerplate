'use client';

import { useEffect } from 'react';

import Link from 'next/link';

//components
import Button from '@/components/global/Button';
import CheckCartItem from '@/components/global/CheckCartItem';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
//provider
import StripeProvider from '@/providers/StripeProvider';
import { lockCurrency, unlockCurrency } from '@/redux/slices/currencySlice';

import DeliveryDetails from './components/DeliveryDetails';
import OrderSummary from './components/OrderSummary';
import StripeCheckoutForm from './components/StripeCheckoutForm';

export default function Payment() {
    const dispatch = useAppDispatch();
    const country = useAppSelector((s) => s.cart.deliveryInfo?.country ?? 'NZ');
    useEffect(() => {
        const currency = country === 'AU' ? 'AUD' : 'NZD';
        dispatch(lockCurrency(currency));

        return () => {
            dispatch(unlockCurrency()); // cleanup when leaving checkout
        };
    }, [country, dispatch]);

    return (
        <>
            <CheckCartItem />
            <section className='w-full space-y-4 px-4 md:px-4 lg:mx-auto lg:max-w-4xl lg:px-10 xl:max-w-7xl'>
                <div className='flex items-center justify-between'>
                    <h3 className='md:text-2xl'>Payment</h3>
                </div>
                <div className='flex flex-col justify-center pt-2'>
                    {/* Stripe form */}
                    <StripeProvider>
                        <StripeCheckoutForm />
                    </StripeProvider>
                </div>
                <div className='flex flex-col justify-center pt-6'>
                    {/* order summary */}
                    <div className='flex flex-col space-y-2'>
                        <h4 className='text-lg font-semibold'>Order Summary</h4>
                        <OrderSummary />
                    </div>
                    {/* delivery details */}
                    <div className='mt-8 flex flex-col space-y-2'>
                        <div className='flex items-center justify-between'>
                            <h4 className='text-lg font-semibold'>Delivery Details</h4>
                            <Link href='/checkout/delivery'>
                                <Button>Edit</Button>
                            </Link>
                        </div>
                        <DeliveryDetails />
                    </div>
                </div>
            </section>
        </>
    );
}
