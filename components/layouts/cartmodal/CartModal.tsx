'use client';

import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import Button from '@/components/global/Button';
import QuantityCounter from '@/components/global/QuantityCounter';
import DeliveryTimeframe from '@/components/global/DeliveryTimeframe';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useCurrency } from '@/hooks/useCurrency';
import { displayPrice } from '@/lib/money';
import type { ModalProps } from '@/lib/types';
import { clearCart, deleteCartItem } from '@/redux/slices/cartSlice';

import CheckOut from './CheckOutButton';
import PageForm from './components/PageForm';
import { FaTrash } from 'react-icons/fa';
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { toast } from 'react-toastify';

const CartModal = ({ handleCloseModal }: ModalProps) => {
    const dispatch = useAppDispatch();
    const currency = useCurrency();

    const cart = useAppSelector((state) => state.cart);
    const cartItems = cart.cartItems;
    const cartPreTotalPrice = cart.preTotalPrice;
    const priceAfterDiscount = cart.priceAfterDiscount;
    const cartTotalItems = cart.totalItems;
    const cartDiscountMessage = cart.discountInfo?.discountMessage || '';


    // 🔑 always recalc discount from preTotal - afterDiscount
    const discountValue = Number((cart.preTotalPrice - cart.priceAfterDiscount).toFixed(2));

    const handleDeleteCartItem = (e: React.MouseEvent, itemId: string) => {
        e.preventDefault();
        dispatch(deleteCartItem(itemId));
        toast.success('Item removed from cart');
    };

    const handleClearCart = () => {
        dispatch(clearCart());
        toast.success('Cart cleared');
    };


    return (
        <div className='search-results md:px-4'>
            <button className='absolute left-0 top-0 ml-4 mt-4' onClick={(e) => handleCloseModal(e)}>
                <IoIosCloseCircleOutline size={50} />
            </button>

            <div className='mt-24 flex flex-col px-4 md:mt-24'>
                <div className='flex items-center justify-between'>
                    <h3 className='text-center'>Shopping Cart ({cartTotalItems})</h3>
                    {cartItems.length !== 0 && (
                        <Button
                            className='rounded-md bg-customPrimary px-4 py-2 text-white lg:text-sm'
                            onClick={handleClearCart}>
                            Clear Cart
                        </Button>
                    )}
                </div>

                <div className='mt-4 space-y-4'>
                    {cartItems.length !== 0 ? (
                        cartItems?.map((item, index) => (
                            <div key={index}>
                                <div className='divider first:hidden'></div>
                                <div className='grid w-full cursor-pointer grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_3fr] md:items-start'>
                                    <div className='h-16 w-16 md:h-32 md:w-32'>
                                        <Link href={`/item/${item?.id}/${item.name}`}>
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    width={128}
                                                    height={128}
                                                    className='h-16 w-16 rounded object-cover md:h-32 md:w-32'
                                                />
                                            ) : (
                                                <div className='flex h-16 w-16 items-center justify-center rounded bg-gray-200 md:h-32 md:w-32'>
                                                    <span className='text-xs text-customPrimary md:text-sm'>
                                                        No Image
                                                    </span>
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                    <div className='flex flex-col space-y-1'>
                                        <div className='flex items-center justify-between'>
                                            <Link href={`/item/${item?.id}/${item.name}`}>
                                                <span className='flex-grow font-bold'>{item.name}</span>
                                            </Link>
                                            <FaTrash
                                                onClick={(e) => handleDeleteCartItem(e, item.id)}
                                                className='text-lg lg:text-2xl'
                                            />
                                        </div>
                                        <div className='grid grid-cols-2'>
                                            <div className='flex flex-col'>
                                                <span>Price: {displayPrice(item.price, currency)}</span>
                                                <div className='mt-2'>
                                                    <QuantityCounter itemId={item.id} />
                                                </div>
                                            </div>
                                            <span>Subtotal: {displayPrice(item.subTotal, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Your cart is empty.</p>
                    )}
                </div>

                {cartItems.length !== 0 && (
                    <>
                        <div className='mt-8'>
                            <PageForm />

                            {discountValue > 0 && (
                                <div className='mt-2 flex justify-between text-base font-bold text-customGreen'>
                                    <span>{cartDiscountMessage}</span>
                                    <span className='mr-1 text-customGreen'>
                                        -{displayPrice(discountValue, currency)}
                                    </span>
                                </div>
                            )}

                            <div className='mt-2 flex justify-between text-lg font-bold'>
                                <span>Total</span>
                                <span className='mr-1'>
                                    {discountValue > 0 && (
                                        <span className='mr-2 line-through'>
                                            {displayPrice(cartPreTotalPrice, currency)}
                                        </span>
                                    )}
                                    {displayPrice(priceAfterDiscount, currency)}
                                </span>
                            </div>

                            <DeliveryTimeframe cartItems={cartItems} />
                        </div>
                        <CheckOut handleCloseModal={handleCloseModal} />
                    </>
                )}
            </div>
        </div>
    );
};

export default CartModal;
