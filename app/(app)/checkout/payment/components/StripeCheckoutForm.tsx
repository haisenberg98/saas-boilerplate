'use client';

import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

//trpc
import { trpc } from '@/app/_trpc/client';
//components
import Button from '@/components/global/Button';
import Loader from '@/components/global/Loader';
//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useCurrency } from '@/hooks/useCurrency';
import { displayPrice } from '@/lib/money';
//helpers
import { convertToCents, getFullName } from '@/lib/utils';
//clerk
import { useUser } from '@clerk/clerk-react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

import { toast } from 'react-toastify';

const StripeCheckoutForm = () => {
    const amount = useAppSelector((state) => state.cart.totalPrice);
    const stripe = useStripe();
    const elements = useElements();
    const cart = useAppSelector((state) => state.cart);
    const currency = useCurrency();

    //local state
    const [amountToPay, setAmountToPay] = useState<number>(0);
    const [clientSecret, setClientSecret] = useState<string | ''>('');
    const [paymentIntentId, setPaymentIntentId] = useState<string | ''>('');
    const [loading, setLoading] = useState<boolean>(false);

    //clerk (current logged in user)
    const { user } = useUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || '';
    // const userFirstName = user?.firstName || '';
    // const userLastName = user?.lastName || '';

    //trpc
    const { data: userInfo } = trpc.getUser.useQuery(userEmail || '');
    // const addUser = trpc.addUser.useMutation();
    const addOrder = trpc.addOrder.useMutation();
    const updateOrderPaymentStatus = trpc.updateOrderPaymentStatus.useMutation();
    const discountValue = Number((cart.preTotalPrice - cart.priceAfterDiscount).toFixed(2));
    console.log(discountValue);

    useEffect(() => {
        setAmountToPay(amount);
        setLoading(true);

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: convertToCents(amount) })
        })
            .then((res) => {
                return res.json(); // return json() for chaining
            })
            .then((data) => {
                setClientSecret(data.clientSecret);
                setPaymentIntentId(data.paymentIntentId); // for validating payment later
                setLoading(false);

                return; // return undefined to avoid ESLint warning
            })
            .catch((err) => {
                toast.error(err.message);

                return; // return undefined to avoid unhandled promise
            });
    }, [amount]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        if (!stripe || !elements) {
            return;
        }

        const { error: submitError } = await elements.submit();

        if (submitError) {
            console.log(submitError);
            toast.error(submitError.message);
            setLoading(false);

            return;
        }

        //get order items
        const orderItems = cart?.cartItems.map((item) => ({
            itemId: item.id,
            quantity: item.quantity,
            price: item.price,
            providerId: item.providerId
        }));

        if (userInfo?.id === '') {
            toast.error('Something went wrong, please try again');

            return;
        }

        console.log('Submitting order with:', {
            userId: userInfo?.id,
            totalPrice: amount,
            preTotalPrice: cart.preTotalPrice,
            priceAfterDiscount: cart.priceAfterDiscount,
            discountCode: cart.discountInfo?.code,
            discountAmount: discountValue,
            deliveryInfo: cart.deliveryInfo,
            orderItems
        });
        //save order to database
        addOrder.mutate(
            {
                userId: userInfo?.id || '',
                totalPrice: amount || 0,
                paymentMethod: 'CARD',
                shippingFullName: getFullName(cart.deliveryInfo?.firstName || '', cart.deliveryInfo?.lastName || ''),
                shippingAddress: cart.deliveryInfo?.address || '',
                shippingSuburb: cart.deliveryInfo?.suburb || '',
                shippingCity: cart.deliveryInfo?.city || '',
                shippingPostCode: cart.deliveryInfo?.postCode || '',
                shippingCountry: cart.deliveryInfo?.country || '',
                shippingPhone: cart.deliveryInfo?.phone || '',
                deliveryInstructions: cart.deliveryInfo?.deliveryInstructions || '',
                shippingMethod: cart.deliveryInfo?.deliveryMethod || '',
                shippingMethodLabel: cart.deliveryInfo?.deliveryMethodLabel || '',
                deliveryFee: cart.deliveryInfo?.deliveryFee || 0,
                paymentIntentId: paymentIntentId || '',
                preTotalPrice: cart.preTotalPrice || 0,
                discountCode: cart.discountInfo?.code || '',
                discountAmount: discountValue || 0,
                discountApplied: cart.discountInfo?.discountMessage || '',
                priceAfterDiscount: cart.priceAfterDiscount || 0,
                currency,
                orderItems: orderItems
            },
            {
                onSuccess: async (data) => {
                    // Confirm payment after orderId is set
                    if (data?.id) {
                        // console.log('Confirming payment with Stripe...');
                        const { error: paymentError } = await stripe.confirmPayment({
                            elements,
                            clientSecret,
                            confirmParams: {
                                return_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout/payment-success?amount=${amountToPay}`
                            }
                        });

                        if (paymentError) {
                            console.error('Payment error:', paymentError);
                            updateOrderPaymentStatus.mutate(
                                {
                                    orderId: data.id,
                                    PaymentStatus: 'FAILED'
                                },
                                {
                                    onSuccess: () => {
                                        console.log('Order payment status updated to failed');
                                        setLoading(false);
                                    },
                                    onError: (error) => {
                                        console.error('Failed to update order payment status:', error);
                                    }
                                }
                            );
                            toast.error(paymentError.message);
                            setLoading(false);
                        } else {
                            console.log('Payment confirmed successfully');
                        }
                    }
                },
                onError: (error) => {
                    console.error('Something wrong when saving order: ', error);
                    toast.error(error.message || 'Something went wrong');
                }
            }
        );
    };

    if (!clientSecret || !stripe || !elements) {
        return <Loader className='mx-auto' />;
    }

    return (
        <form onSubmit={(e) => handleSubmit(e)} className='flex flex-col'>
            <div className='md:container md:mx-auto md:max-w-2xl'>
                {clientSecret && (
                    <PaymentElement
                        options={{
                            defaultValues: {
                                billingDetails: {
                                    address: {
                                        country: cart.deliveryInfo?.country || 'NZ' // prefill NZ or AU
                                    }
                                }
                            }
                        }}
                    />
                )}
            </div>
            <div className='flex items-center justify-center space-x-2 pt-4'>
                <span className='text-sm'>Guaranteed secure payment </span>
                <Link href='https://www.stripe.com' target='_blank'>
                    <Image src={`/stripe.png`} width={200} height={100} alt='stripe' className='h-7 w-28' />
                </Link>
            </div>
            <div className='flex md:flex md:justify-center'>
                <Button
                    className='mt-4 flex w-full justify-center md:w-auto md:px-14'
                    disabled={!stripe || loading}
                    type='submit'>
                    {/* {!loading ? `Pay $${amountToPay.toFixed(2)}` : 'Processing...'} */}
                    {!loading ? `Pay ${displayPrice(amountToPay, currency)}` : 'Processing...'}
                </Button>
            </div>
        </form>
    );
};

export default StripeCheckoutForm;
