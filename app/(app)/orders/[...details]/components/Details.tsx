'use client';

import React, { useEffect } from 'react';

import { notFound } from 'next/navigation';

import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//components
import Loader from '@/components/global/Loader';
//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { openPageModal, setIsAdmin, setSelectedOrder } from '@/redux/slices/modalSlice';

type ProductDetailsProps = {
    initialData: Awaited<ReturnType<(typeof serverClient)['getUserOrderById']>>;
    dataId: string;
    isAdmin: boolean;
};

const Details = ({ initialData, dataId, isAdmin }: ProductDetailsProps) => {
    const dispatch = useAppDispatch();

    const { data: order, isFetching } = trpc.getUserOrderById.useQuery(dataId, {
        initialData: initialData,
        refetchOnMount: false,
        refetchOnReconnect: false
    });
    useEffect(() => {
        if (order) {
            dispatch(openPageModal('order-details'));
            dispatch(setSelectedOrder(order));
            dispatch(setIsAdmin(isAdmin));
        } else {
            notFound();
        }
    }, [order, dispatch, isAdmin]);

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            {isFetching && <Loader className='container mx-auto flex justify-center' />}
        </section>
    );
};

export default Details;
