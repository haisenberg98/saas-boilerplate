'use client';

import React from 'react';

//trpc
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

import DataCard from './DataCard';
//redux
import { useDispatch } from 'react-redux';

const DataList = ({ initialData }: { initialData: Awaited<ReturnType<(typeof serverClient)['getPosts']>> }) => {
    const dispatch = useDispatch();

    const { data } = trpc.getPosts.useQuery(undefined, {
        initialData: initialData,
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    return (
        <>
            {/* {isFetching ? (
        <Loader className='flex justify-center mx-auto container pt-4' />
      ) : ( */}
            <>
                {data?.length > 0 ? (
                    <>
                        <div className='grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 md:px-3 lg:grid-cols-2 lg:pl-6 xl:grid-cols-3'>
                            {data?.map((item, index) => (
                                <div
                                    className='item-card-wrapper thin-border-bottom flex-none px-4 last:border-b-0'
                                    key={item.id || index} // Using a unique identifier if available, otherwise falling back to index
                                >
                                    {item && <DataCard data={item} />}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className='block min-w-full px-4 pt-4 md:px-6'>
                        <p>No data found.</p>
                    </div>
                )}
            </>
            {/* )} */}
        </>
    );
};
export default DataList;
