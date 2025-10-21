'use client';

import React, { useEffect, useMemo, useState } from 'react';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
import Button from '@/components/global/Button';
//components
import ItemCard from '@/components/global/ItemCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
//redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSelectedCategory } from '@/redux/slices/itemSlice';

import { useDispatch } from 'react-redux';

const ItemList = ({
    initialProducts
}: {
    initialProducts: Awaited<ReturnType<(typeof serverClient)['getItemsByCategory']>>;
}) => {
    const dispatch = useDispatch();
    const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

    const selectedCategory = useAppSelector((state) => state.item.selectedCategory);

    const { data: items } = trpc.getItemsByCategory.useQuery(selectedCategory, {
        initialData: initialProducts,
        refetchOnMount: false,
        refetchOnReconnect: false,
        enabled: selectedCategory !== ''
    });

    // Sort items based on price
    const sortedProducts = useMemo(() => {
        if (!items || sortOrder === 'none') return items;

        return [...items].sort((a, b) => {
            if (sortOrder === 'asc') {
                return a.price - b.price; // Cheapest first
            } else {
                return b.price - a.price; // Most expensive first
            }
        });
    }, [items, sortOrder]);

    const handleResetFilter = (e: React.MouseEvent): void => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(setSelectedCategory('Filters'));
        setSortOrder('none'); // Reset sort when resetting filter
    };

    const handleSortChange = (value: string): void => {
        setSortOrder(value as 'none' | 'asc' | 'desc');
    };

    return (
        <>
            {/* {isFetching ? (
        <Loader className='flex justify-center mx-auto container pt-4' />
      ) : ( */}
            <>
                {sortedProducts?.length > 0 ? (
                    <>
                        <div className='mb-6 flex items-center justify-between px-4 lg:pl-6'>
                            {/* Results Count - Left side */}

                            <h3 className='text-base md:text-xl lg:text-2xl'>{sortedProducts?.length} Results</h3>

                            {/* Controls - Right side */}
                            <div className='flex items-center space-x-2'>
                                <Select value={sortOrder} onValueChange={handleSortChange}>
                                    <SelectTrigger className=' '>
                                        <SelectValue placeholder='Sort by Price' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='none'>Sort by Price</SelectItem>
                                        <SelectItem value='asc'>Price: Low to High</SelectItem>
                                        <SelectItem value='desc'>Price: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleResetFilter} type='button'>
                                    Reset
                                </Button>
                            </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3 px-4 pt-4 md:grid-cols-2 md:px-3 lg:grid-cols-3 lg:pl-6 xl:grid-cols-4'>
                            {sortedProducts?.map((item, index) => (
                                <div
                                    className='item-card-wrapper thin-border-bottom flex-none last:border-b-0'
                                    key={item.id || index}>
                                    {item && <ItemCard item={item} />}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className='block min-w-full px-4 pt-2 md:px-6'>
                        <p>No item match the selected category.</p>
                    </div>
                )}
            </>
            {/* )} */}
        </>
    );
};
export default ItemList;
