'use client';
import React, { useEffect, useRef } from 'react';
import { trpc } from '@/app/_trpc/client';
import { serverClient } from '@/app/_trpc/serverClient';

//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { openPageModal, setSelectedPromotion } from '@/redux/slices/modalSlice';

//components
import Loader from '@/components/global/Loader';

type DataDetailsProps = {
  initialData: Awaited<ReturnType<(typeof serverClient)['getPromotionById']>>;
  dataId: string;
};

const Details = ({ initialData, dataId }: DataDetailsProps) => {
  const dispatch = useAppDispatch();
  const { data, isFetching } = trpc.getPromotionById.useQuery(dataId, {
    initialData: initialData,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    dispatch(openPageModal('promotion-details'));
    dispatch(setSelectedPromotion(data));
  }, [data, dispatch]);

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
