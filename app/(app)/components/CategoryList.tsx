'use client';

import Image from 'next/image';
import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//components
import SliderFreeMode from '@/components/global/SliderFreeMode';
// import Loader from '@/components/global/Loader';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';
//libs
import { cn, slugify } from '@/lib/utils';
import { setSelectedCategory } from '@/redux/slices/itemSlice';

import { useDispatch } from 'react-redux';
import 'swiper/css';
import 'swiper/css/free-mode';
//Swiper
import { SwiperSlide } from 'swiper/react';

const CategoryList = ({
    initialCategories
}: {
    initialCategories: Awaited<ReturnType<(typeof serverClient)['getCategories']>>;
}) => {
    const { data: categories } = trpc.getCategories.useQuery(undefined, {
        initialData: initialCategories, // This is the initial data
        refetchOnMount: false, //prevent refetching on mount
        refetchOnReconnect: false //prevent refetching on reconnect
    });
    const dispatch = useDispatch();
    const selectedCategory = useAppSelector((state) => state.item.selectedCategory);

    const handleCategoryClick = (category: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (category) {
            dispatch(setSelectedCategory(category));
        }
    };

    return (
        <>
            {/* {isFetching ? (
        <Loader className='flex justify-center mx-auto container' />
      ) : ( */}
            <div
                id='category-list'
                className='flex pb-3 pt-2 md:justify-between md:pl-0 md:pt-0 lg:justify-start lg:pb-5 lg:pl-6'>
                <SliderFreeMode>
                    {categories?.map((item, index) => (
                        <SwiperSlide key={index}>
                            <div className='flex-none pr-6 text-customDarkGray last:pr-0 md:pt-0'>
                                <button
                                    onClick={(e) => handleCategoryClick(item.name, e)}
                                    className='flex w-full flex-col items-center lg:items-start'>
                                    <div className='flex flex-col items-center justify-center'>
                                        <Image
                                            width={80}
                                            height={80}
                                            src={item.image || ''}
                                            alt={item.name}
                                            className='max-h-16 max-w-16 object-cover md:max-h-24 md:max-w-24'
                                        />
                                        <span
                                            className={cn(
                                                `mt-1 text-center text-sm md:mt-2 md:text-base`,
                                                item.name === selectedCategory ? 'text-customTertiary' : ''
                                            )}>
                                            {item.name}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </SwiperSlide>
                    ))}
                </SliderFreeMode>
            </div>
            {/* )} */}
        </>
    );
};

export default CategoryList;
