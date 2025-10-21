'use client';

import React, { useEffect } from 'react';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { DeliveryInfo } from '@/lib/types';
//helpers
import { getFullName } from '@/lib/utils';

const DeliveryDetails = () => {
    const { deliveryInfo } = useAppSelector((state) => state.cart);

    //set local state
    const [user, setUser] = React.useState<DeliveryInfo>();

    useEffect(() => {
        if (deliveryInfo) {
            setUser(deliveryInfo);
        }
    }, [deliveryInfo]);

    return (
        // delivery summary
        <div className='flex flex-col pt-4 text-end'>
            {user ? (
                <>
                    <span className='font-bold'>
                        {getFullName(deliveryInfo?.firstName || '', deliveryInfo?.lastName || '')}
                    </span>
                    <span>{deliveryInfo?.address}</span>
                    <span>
                        {deliveryInfo?.suburb}, {deliveryInfo?.city} {deliveryInfo?.postCode}
                        {deliveryInfo?.region ? `, ${deliveryInfo.region}` : ''}
                    </span>
                    <span>{deliveryInfo?.country}</span>
                    <span>Phone: {deliveryInfo?.phone}</span>
                    {deliveryInfo?.deliveryInstructions && (
                        <span className='mt-4 font-bold'>Delivery notes: {deliveryInfo.deliveryInstructions}</span>
                    )}
                </>
            ) : (
                <p>No delivery details.</p>
            )}
        </div>
    );
};

export default DeliveryDetails;
