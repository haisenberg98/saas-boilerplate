'use client';

import React from 'react';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//components
import DataCard from '@/components/global/PromotionCard';
import SliderFreeMode from '@/components/global/SliderFreeMode';

import 'swiper/css';
import 'swiper/css/free-mode';
//Swiper
import { SwiperSlide } from 'swiper/react';

const PromotionList = ({
    initialPromotions
}: {
    initialPromotions: Awaited<ReturnType<(typeof serverClient)['getPromotions']>>;
}) => {
    const { data: promotions } = trpc.getPromotions.useQuery(undefined, {
        initialData: initialPromotions,
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    return (
        <>
            {promotions?.length > 0 ? (
                <>
                    <div className='grid pb-3 lg:pl-3'>
                        <SliderFreeMode
                            extraSmallSlidePerView={1}
                            smallSlidePerView={1}
                            mediumSlidePerView={3}
                            largeSlidePerView={3}
                            xlSlidePerView={3}>
                            {promotions?.map((item, index) => (
                                <SwiperSlide key={index}>
                                    <div
                                        className=' thin-border-bottom flex-none px-4 last:border-b-0'
                                        key={item.id || index} // Using a unique identifier if available, otherwise falling back to index
                                    >
                                        {item && <DataCard item={item} />}
                                    </div>
                                </SwiperSlide>
                            ))}
                        </SliderFreeMode>
                    </div>
                </>
            ) : null}
        </>
    );
};
export default PromotionList;
