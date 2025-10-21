'use client';

import React from 'react';

import { trpc } from '@/app/_trpc/client';
import { CartItem } from '@/lib/types';

interface DeliveryTimeframeProps {
    cartItems: CartItem[];
    className?: string;
}

const DeliveryTimeframe = ({ cartItems, className = '' }: DeliveryTimeframeProps) => {
    const { data: providers } = trpc.getShops.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    // Get unique providers from cart items with delivery info
    const getShopDeliveryInfo = () => {
        const providerIds = [...new Set(cartItems.map((item) => item.providerId))];

        return providerIds
            .map((providerId) => {
                const provider = providers?.find((s) => s.id === providerId);
                if (!provider) return null;

                const minDays = provider.minDeliveryTime || 3;
                const maxDays = provider.maxDeliveryTime || 5;

                return {
                    shopName: provider.name,
                    deliveryTime: minDays === maxDays ? `${minDays} days` : `${minDays}-${maxDays} days`
                };
            })
            .filter(Boolean);
    };

    const deliveryInfo = getShopDeliveryInfo();

    if (deliveryInfo.length === 0) {
        return null;
    }

    return (
        <div className={`rounded-md pt-8 ${className}`}>
            <h4 className='mb-2 text-sm font-semibold '>Estimated Delivery</h4>
            {deliveryInfo.map((shopInfo, index) => (
                <div key={index} className='flex justify-between text-sm text-gray-600'>
                    <span>{shopInfo?.shopName}</span>
                    <span>{shopInfo?.deliveryTime}</span>
                </div>
            ))}
            {deliveryInfo.length > 1 && (
                <div className='mt-2 text-xs text-customLightGray'>Multiple providers - items may arrive separately</div>
            )}
        </div>
    );
};

export default DeliveryTimeframe;
