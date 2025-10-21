'use client';

import React, { useEffect, useRef } from 'react';

import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';
//components
import Loader from '@/components/global/Loader';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { openPageModal, setSelectedProduct } from '@/redux/slices/modalSlice';

type ProductDetailsProps = {
    initialProduct: Awaited<ReturnType<(typeof serverClient)['getProductById']>>;
    itemId: string;
};

const Details = ({ initialProduct, itemId }: ProductDetailsProps) => {
    const dispatch = useAppDispatch();
    const { data: item, isFetching } = trpc.getProductById.useQuery(itemId, {
        initialData: initialProduct,
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const updateProductClickCount = trpc.updateProductClickCount.useMutation();

    // Use a ref to ensure the click count is updated only once
    const hasUpdatedClickCount = useRef(false);

    useEffect(() => {
        dispatch(openPageModal('item-details'));
        dispatch(setSelectedProduct(item));
    }, [item, dispatch]);

    useEffect(() => {
        if (!hasUpdatedClickCount.current && itemId) {
            updateProductClickCount.mutate(itemId);
            hasUpdatedClickCount.current = true; // Set to true to prevent future updates
        }
    }, [itemId, updateProductClickCount]); // Only depend on itemId and mutation

    return (
        <section id={item?.name} className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            {item && (
                <div className='hidden'>
                    <Breadcrumbs 
                        productName={item.name}
                        categoryName={item.category?.name}
                    />
                </div>
            )}
            {isFetching && <Loader className='container mx-auto flex justify-center' />}
            {item && (
                <div className='flex flex-col items-center justify-center'>
                    <h1 className='hidden text-2xl font-bold'>{item.name}</h1>
                    <p className='hidden'>{item.description}</p>
                </div>
            )}
        </section>
    );
};

export default Details;
