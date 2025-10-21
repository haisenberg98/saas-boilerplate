'use client';

import React, { useEffect } from 'react';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import DeliveryTimeframe from '@/components/global/DeliveryTimeframe';
import { useAppSelector } from '@/hooks/reduxHooks';
import { useCurrency } from '@/hooks/useCurrency';
import { displayPrice } from '@/lib/money';
import { CartItem } from '@/lib/types';

const OrderSummary = () => {
    const { deliveryInfo, cartItems, preTotalPrice, totalPrice, priceAfterDiscount, discountInfo } = useAppSelector(
        (state) => state.cart
    );

    const currency = useCurrency();
    const router = useRouter();

    const [cart, setCart] = React.useState<CartItem[]>([]);
    useEffect(() => {
        if (cartItems.length > 0) setCart(cartItems);
    }, [cartItems]);

    useEffect(() => {
        if (!deliveryInfo) router.push('/checkout/delivery');
    }, [deliveryInfo, router]);

    const providerIds = [...new Set(cartItems.map((item) => item.providerId))];

    // 🔑 dynamically calculate discount based on current subtotal
    const discountValue = discountInfo?.appliedAmount || 0;

    return (
        <div className='mt-4 space-y-4'>
            {providerIds.length > 1 && (
                <div className='alert alert-info mb-6 max-w-2xl text-sm text-customLightGray'>
                    <strong>Note:</strong> Your order includes items from multiple providers, you may receive separate
                    packages at different times. We&apos;ll provide tracking for each package to help you monitor
                    delivery.
                </div>
            )}

            {cart.length > 0 ? (
                cart.map((item, index) => (
                    <div key={index}>
                        <div className='divider first:hidden'></div>
                        <div className='grid w-full grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_3fr] md:items-start'>
                            <div className='h-16 w-16 md:h-32 md:w-32'>
                                <Image
                                    width={100}
                                    height={100}
                                    src={item.image || ''}
                                    alt={item.name}
                                    className='h-full w-full rounded-md object-cover'
                                />
                            </div>
                            <div className='flex flex-col space-y-1'>
                                <div className='flex items-center justify-between'>
                                    <span className='flex-grow font-bold'>{item.name}</span>
                                </div>
                                <div className='grid grid-cols-2'>
                                    <div className='flex flex-col justify-center'>
                                        <span>Price: {displayPrice(item.price, currency)}</span>
                                        <span>Quantity: {item.quantity}</span>
                                    </div>
                                    <span>Subtotal: {displayPrice(item.subTotal ?? 0, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <p>No order summary.</p>
            )}

            {cart.length > 0 && (
                <div className='flex flex-col space-y-1 pt-4'>
                    {/* Subtotal Row */}
                    <div className='flex justify-between'>
                        <span>Subtotal</span>
                        <span className='mr-1'>
                            {discountValue > 0 && (
                                <span className='text-muted-foreground mr-2 text-sm line-through'>
                                    {displayPrice(preTotalPrice, currency)}
                                </span>
                            )}
                            {displayPrice(priceAfterDiscount ?? preTotalPrice, currency)}
                        </span>
                    </div>

                    {/* Discount Info */}
                    {discountValue > 0 && (
                        <div className='flex justify-between'>
                            <span className='text-customGreen'>{discountInfo?.discountMessage || 'Discount'}</span>
                            <span className='mr-1 text-customGreen'>-{displayPrice(discountValue, currency)}</span>
                        </div>
                    )}

                    {/* Shipping */}
                    <div className='flex justify-between'>
                        <span>
                            Shipping
                            {deliveryInfo?.deliveryMethodLabel ? ` (${deliveryInfo.deliveryMethodLabel})` : ''}
                        </span>
                        <span className='mr-1'>
                            {deliveryInfo?.deliveryFee !== undefined
                                ? deliveryInfo.deliveryFee === 0
                                    ? 'FREE'
                                    : displayPrice(deliveryInfo.deliveryFee, currency)
                                : '-'}
                        </span>
                    </div>

                    {/* Final Total */}
                    <div className='flex justify-between text-lg font-bold'>
                        <span>Total</span>
                        <span className='mr-1'>{displayPrice(totalPrice, currency)}</span>
                    </div>

                    <DeliveryTimeframe cartItems={cartItems} />
                </div>
            )}
        </div>
    );
};

export default OrderSummary;
