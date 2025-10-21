'use client';
import React, { useEffect, useRef } from 'react';
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { openPageModal, setSelectedPost } from '@/redux/slices/modalSlice';

//components
import Loader from '@/components/global/Loader';

type DataDetailsProps = {
  initialData: Awaited<ReturnType<(typeof serverClient)['getPostById']>>;
  dataId: string;
};

const Details = ({ initialData, dataId }: DataDetailsProps) => {
  const dispatch = useAppDispatch();
  const { data, isFetching } = trpc.getPostById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const updateDataViewCount = trpc.updatePostViewCount.useMutation();

  // Use a ref to ensure the click count is updated only once
  const hasUpdatedViewCount = useRef(false);

  useEffect(() => {
    dispatch(openPageModal('data-details'));
    dispatch(setSelectedPost(data));
  }, [data, dispatch]);

  useEffect(() => {
    if (!hasUpdatedViewCount.current && dataId) {
      updateDataViewCount.mutate(dataId);
      hasUpdatedViewCount.current = true; // Set to true to prevent future updates
    }
  }, [dataId, updateDataViewCount]); // Only depend on dataId and mutation

  return (
    <section
      id={data?.title}
      className='w-full px-4 space-y-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'
    >
      {isFetching && (
        <Loader className='flex justify-center mx-auto container' />
      )}
      {data && (
        <div className='flex flex-col items-center justify-center'>
          <h1 className='text-2xl font-bold hidden'>{data.title}</h1>
        </div>
      )}
    </section>
  );
};

export default Details;
