'use client';

import React from 'react';

import { trpc } from '@/app/_trpc/client';
//components
import Button from '@/components/global/Button';
//redux
import { useAppDispatch } from '@/hooks/reduxHooks';
import { clearDeliveryInfo } from '@/redux/slices/cartSlice';

import { FaTrash } from 'react-icons/fa';

const ClearForm = () => {
    const dispatch = useAppDispatch();

    const handleClearForm = () => {
        dispatch(clearDeliveryInfo());
    };

    // const handleDeleteOrders = () => {
    //   deleteOrders.mutate();
    // };
    return (
        <>
            <Button
                onClick={() => {
                    handleClearForm();
                }}>
                <FaTrash />
            </Button>
            {/* <button
        type='button'
        onClick={() => {
          handleDeleteOrders();
        }}
        className='text-sm text-gray-500'
      >
        Delete Orders
      </button> */}
        </>
    );
};

export default ClearForm;
