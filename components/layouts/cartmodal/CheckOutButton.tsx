'use client';

import React from 'react';

import { useRouter } from 'next/navigation';

// trpc
import { trpc } from '@/app/_trpc/client';
// components
import Button from '@/components/global/Button';
// redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { fmtNZD } from '@/lib/money';
// types
import { ModalProps } from '@/lib/types';

import { toast } from 'react-toastify';

const CheckOutButton = ({ handleCloseModal }: ModalProps) => {
    const { data } = trpc.getMinimumOrder.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const router = useRouter();
    const { preTotalPrice, deliveryInfo } = useAppSelector((state) => state.cart);

    const country = deliveryInfo?.country ?? 'NZ'; // for label only
    const dbMin = data?.amount;
    const minOrder = typeof dbMin === 'number' && isFinite(dbMin) && dbMin > 0 ? dbMin : null;

    const handleCloseModalAndRedirect = (e: React.MouseEvent) => {
        e.preventDefault();

        if (minOrder != null && (preTotalPrice ?? 0) < minOrder) {
            const label = country === 'AU' ? 'Australia' : 'New Zealand';
            toast.info(`Minimum order for ${label} is ${fmtNZD(minOrder)}`);

            return;
        }

        handleCloseModal(e);
        router.push('/checkout/delivery');
    };

    return (
        <div className='mt-8 md:flex md:justify-center'>
            <Button className='w-full md:w-auto md:px-14' onClick={handleCloseModalAndRedirect}>
                Check Out
            </Button>
        </div>
    );
};

export default CheckOutButton;
