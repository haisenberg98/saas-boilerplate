'use client';

//trpc
import Image from 'next/image';
import Link from 'next/link';

import { serverClient } from '@/app/_trpc/serverClient';
import { useCurrency } from '@/hooks/useCurrency';
import { displayPrice } from '@/lib/money';
//helper
import { slugify, truncate } from '@/lib/utils';

import AddToCart from './AddToCartButton';
//components
import Favorite from './Favorite';

//icons

const ItemCard = ({ item }: { item: Awaited<ReturnType<(typeof serverClient)['getProductById']>> }) => {
    const productName = slugify(item?.name || '');
    const currency = useCurrency();

    // Calculate average rating
    const reviewCount = item?.reviews?.length || 0;
    const averageRating =
        reviewCount > 0 && item?.reviews
            ? item.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
            : 0;

    return (
        <div className='mb-2 flex w-full flex-col last:mb-0 last:pr-0' onClick={(e) => e.stopPropagation()}>
            <div>
                <Link href={`/item/${item?.id}/${productName}`}>
                    {item?.image ? (
                        <Image
                            className='h-44 w-full rounded-t-lg object-cover md:h-52'
                            src={item?.image || ''}
                            alt={item?.name || ''}
                            width={400}
                            height={200}
                        />
                    ) : (
                        <div className='flex h-44 w-full items-center justify-center rounded-t-lg bg-gray-200 md:h-52'>
                            <span className='text-customPrimary'>No Image</span>
                        </div>
                    )}
                </Link>
                <div className='pb-1 pt-2 md:pb-2 md:pt-2'>
                    <div className='flex justify-between'>
                        <Link href={`/item/${item?.id}/${productName}`}>
                            <h4 className='line-clamp-1 text-sm font-medium md:text-lg'>
                                {truncate(item?.name || '', 35)}
                            </h4>
                        </Link>
                        {/* <Favorite /> */}
                    </div>

                    {/* Price and Add to Cart - Stacked on mobile, side-by-side on desktop */}
                    <div className='pb-2 '>
                        {/* Price Section */}
                        <div>
                            <span className='text-lg font-bold'>{displayPrice(item?.price, currency)}</span>
                        </div>

                        {/* Sold Count and Rating */}
                        <div className='mb-2 flex items-center space-x-2'>
                            {/* Sold Count */}
                            {item?.soldCount != null && item.soldCount > 0 && (
                                <span className='text-sm text-customPrimary'>
                                    {item.soldCount.toLocaleString()} sold
                                </span>
                            )}
                            {/* Rating */}
                            {reviewCount > 0 && (
                                <div className='flex items-center space-x-1'>
                                    <span className='text-sm text-yellow-500'>★</span>
                                    <span className='text-sm font-medium'>{averageRating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart Button - Full width on mobile, auto width on desktop */}
                        <div className='w-full md:w-auto'>
                            <AddToCart item={item} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
