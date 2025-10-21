import React from 'react';

import Image from 'next/image';
import Link from 'next/link';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { displayPrice } from '@/lib/money';
//type
import { ModalProps } from '@/lib/types';
//helpers
import { formatDateFromISO, getFullName, slugify } from '@/lib/utils';

import OrderActions from './orderactions/OrderActions';
import TrackingActions from './trackingactions/TrackingActions';
//icons
import { IoIosCloseCircleOutline } from 'react-icons/io';

const OrderModal = ({ handleCloseModal }: ModalProps) => {
    const { selectedOrder: order, isAdmin } = useAppSelector((state) => state.modal);

    return (
        <div className='search-results md:px-4'>
            <button className='absolute left-0 top-0 ml-4 mt-4' onClick={(e) => handleCloseModal(e)}>
                <IoIosCloseCircleOutline size={50} />
            </button>

            <div className='mt-24 flex flex-col px-4 md:mt-20'>
                <div className='flex flex-col'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-center'>Order Summary</h3>
                    </div>
                    <div className='flex flex-col space-y-1 pt-4'>
                        <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                            <span>Payment Status:</span>
                            <span className='font-semibold'>{order?.paymentStatus}</span>
                        </div>
                        <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                            <span>Email:</span>
                            <span>{order?.user?.email}</span>
                        </div>
                        <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                            <span>Order Code:</span>
                            <span>{order?.orderCode}</span>
                        </div>
                        <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                            <span>Order Date:</span>
                            <span>{formatDateFromISO(order?.createdAt)}</span>
                        </div>
                        {isAdmin && (
                            <>
                                <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                                    <span>Payment Method:</span>
                                    <span>{order?.paymentMethod}</span>
                                </div>
                                <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                                    <span>Shipping Method:</span>
                                    <span>{order?.shippingMethodLabel}</span>
                                </div>
                            </>
                        )}
                        <div className='grid grid-cols-[160px_1fr] gap-x-2'>
                            <span>Order Status:</span>
                            <span className='font-semibold'>{order?.orderStatus}</span>
                        </div>
                    </div>
                </div>
                {/* process order admin only */}
                {isAdmin && <OrderActions />}

                <div className='flex items-center justify-between pt-10'>
                    <h3 className='text-center'>Purchased items</h3>
                </div>
                <div className='mt-4 space-y-4'>
                    {order?.fulfillments?.length !== 0 ? (
                        order?.fulfillments?.map((fulfillment, shipmentIndex) => (
                            <div key={shipmentIndex}>
                                <div>
                                    {/* Display supplier information (fulfillment-related details) */}
                                    <div className='mb-2 text-lg font-bold'>
                                        {fulfillment.provider?.name || 'Unknown Provider'}
                                    </div>

                                    <div>
                                        <span className=''>
                                            Average Delivery Time: {fulfillment.provider.minDeliveryTime || 'Not available'} to{' '}
                                            {''}
                                            {fulfillment.provider.maxDeliveryTime || 'Not available'} days
                                        </span>
                                    </div>
                                    <div>
                                        <span className=''>
                                            Tracking Code:{' '}
                                            <span className='font-semibold'>
                                                {fulfillment.trackingCode || 'Not available'}
                                            </span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className=''>
                                            Shipping Provider: {fulfillment.shippingProvider || 'Not available'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className=''>
                                            Status:{' '}
                                            <span className='font-semibold'>
                                                {fulfillment.shipmentStatus || 'Not available'}
                                            </span>
                                        </span>
                                    </div>
                                    {/* shipping provider website */}
                                    {fulfillment.shippingProviderWebsite && (
                                        <div>
                                            <Link
                                                href={fulfillment.shippingProviderWebsite}
                                                target='_blank'
                                                className='text-blue-500'>
                                                Track your order
                                            </Link>
                                        </div>
                                    )}
                                    <div className='mb-4'></div>
                                    {isAdmin && (
                                        <div key={shipmentIndex}>
                                            <TrackingActions
                                                trackingCode={fulfillment.trackingCode || ''}
                                                shippingProvider={fulfillment.shippingProvider || ''}
                                                shippingProviderWebsite={fulfillment.shippingProviderWebsite || ''}
                                                shopName={fulfillment.provider?.name || ''}
                                                orderId={order?.id || ''}
                                                orderCode={order?.orderCode || ''}
                                                shipmentId={fulfillment.id || ''}
                                            />
                                        </div>
                                    )}

                                    {/* Loop over orderItems within the fulfillment */}
                                    {fulfillment?.orderItems?.map((orderItem, index) => {
                                        const item = orderItem.item;
                                        const price = orderItem.price;
                                        const subTotal = price && orderItem.quantity ? price * orderItem.quantity : 0;
                                        const primaryImageUrl = item?.images?.[0]?.url || null;

                                        return item && price !== undefined ? (
                                            <div key={`${shipmentIndex}-${index}`}>
                                                <div className='divider first:hidden'></div>
                                                <Link
                                                    href={`/item/${item.id}/${slugify(
                                                        item.name || ''
                                                    )}`}>
                                                    <div className='grid w-full cursor-pointer grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_3fr] md:items-start'>
                                                        {primaryImageUrl && (
                                                            <div className='h-16 w-16 md:h-32 md:w-32'>
                                                                {primaryImageUrl ? (
                                                                    <Image
                                                                        src={primaryImageUrl}
                                                                        alt={item.name || ''}
                                                                        width={100}
                                                                        height={100}
                                                                        className='h-full w-full rounded object-cover'
                                                                    />
                                                                ) : (
                                                                    <div className='flex h-12 w-12 items-center justify-center rounded bg-gray-200'>
                                                                        <span className='text-xs text-customPrimary'>
                                                                            No Image
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className='flex flex-col space-y-1'>
                                                            <div className='flex items-center justify-between'>
                                                                <span className='flex-grow font-bold'>
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            <div className='grid grid-cols-2'>
                                                                <div className='flex flex-col'>
                                                                    <span>
                                                                        Price: {displayPrice(price, order.currency)}
                                                                    </span>
                                                                </div>
                                                                <span>Quantity: {orderItem.quantity}</span>
                                                                <span>
                                                                    Subtotal: {displayPrice(subTotal, order.currency)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                                <div className='divider'></div>
                            </div>
                        ))
                    ) : (
                        <div>No items found.</div>
                    )}
                </div>

                <div className='grid gap-y-2 pt-4 text-sm'>
                    {/* Subtotal Row */}
                    <div className='flex justify-between'>
                        <span>Subtotal</span>
                        <span>
                            {order?.discountAmount && order.discountAmount > 0 && (
                                <span className='text-muted-foreground mr-2 text-sm line-through'>
                                    {displayPrice(order?.preTotalPrice, order?.currency ?? 'NZD')}
                                </span>
                            )}
                            {displayPrice(order?.priceAfterDiscount ?? order?.preTotalPrice, order?.currency ?? 'NZD')}
                        </span>
                    </div>

                    {/* Row: Discount */}
                    {order?.discountAmount !== 0 && (
                        <div className='grid grid-cols-[1fr_auto] items-center text-customGreen'>
                            <span>Discount</span>
                            <span className='ml-4 font-medium'>
                                -{displayPrice(order?.discountAmount || 0, order?.currency ?? 'NZD')}
                            </span>
                        </div>
                    )}

                    {/* Row: Shipping */}
                    <div className='grid grid-cols-[1fr_auto] items-center'>
                        <span>Shipping</span>
                        <span className='ml-4'>
                            {order?.deliveryFee && order.deliveryFee > 0
                                ? displayPrice(order.deliveryFee, order.currency)
                                : 'FREE'}
                        </span>
                    </div>

                    {/* Row: Total */}
                    <div className='grid grid-cols-[1fr_auto] items-center pt-2 text-base font-bold'>
                        <span>Total</span>
                        <span className='ml-4'>{displayPrice(order?.totalPrice || 0, order?.currency ?? 'NZD')}</span>
                    </div>
                </div>

                <div className='flex flex-col pt-10 text-end'>
                    <div className='flex items-center justify-between'>
                        <h3 className='text-center'>Delivery details</h3>
                    </div>
                    {order ? (
                        <>
                            <span className='font-bold'>
                                {getFullName(order?.user?.firstName || '', order?.user?.lastName || '')}
                            </span>
                            <span>{order?.shippingAddress}</span>
                            <span>
                                {order?.shippingSuburb}, {order?.shippingCity} {order?.shippingPostCode}
                            </span>
                            <span>{order?.shippingCountry}</span>
                            <span>Phone: {order?.shippingPhone}</span>
                            <span className='mt-4 font-bold'>Delivery notes: {order?.deliveryInstructions}</span>{' '}
                        </>
                    ) : (
                        <p>No delivery details.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderModal;
