'use client';

import React, { useEffect } from 'react';

//components
import Breadcrumbs from '@/components/seo/Breadcrumbs';
//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { openPageModal } from '@/redux/slices/modalSlice';

const CoffeeAIDetails = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(openPageModal('coffee-ai'));
    }, [dispatch]);

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='hidden'>
                <Breadcrumbs productName='Coffee AI Assistant' categoryName='AI Tools' />
            </div>
            <div className='flex flex-col items-center justify-center'>
                <h1 className='hidden text-2xl font-bold'>Coffee AI Assistant</h1>
                <p className='hidden'>Get personalized coffee brewing advice and recipes from Kofe&apos;s AI expert</p>
            </div>
        </section>
    );
};

export default CoffeeAIDetails;
