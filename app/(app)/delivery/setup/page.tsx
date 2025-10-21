'use client';

import React, { useState } from 'react';

import { trpc } from '@/app/_trpc/client';
import Button from '@/components/global/Button';

import { toast } from 'react-toastify';

const DeliverySetupPage = () => {
    const [isSeeding, setIsSeeding] = useState(false);

    const seedDeliveryData = trpc.seedDeliveryData.useMutation();
    const { data: deliveryZones, refetch } = trpc.getDeliveryZones.useQuery();
    const { data: minOrderData } = trpc.getMinimumOrder.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    // Normalize undefined -> [] so TS can narrow safely
    const zones = deliveryZones ?? [];
    const hasZones = zones.length > 0;

    const handleSeedData = async () => {
        setIsSeeding(true);

        seedDeliveryData.mutate(undefined, {
            onSuccess: (result) => {
                toast.success(result.message || 'Delivery data seeded successfully!');
                refetch(); // Refresh the delivery zones list
                setIsSeeding(false);
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to seed delivery data');
                setIsSeeding(false);
            }
        });
    };

    return (
        <div className='container mx-auto max-w-4xl px-3 py-6 sm:px-4 sm:py-8'>
            <div className='mb-6 sm:mb-8'>
                <h1 className='mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl'>Delivery Setup</h1>
                <p className='text-sm text-gray-600 sm:text-base'>
                    Set up and manage your delivery zones and shipping methods.
                </p>
            </div>

            {/* Seed Data Section */}
            <div className='mb-6 rounded-lg bg-white p-4 shadow-md sm:mb-8 sm:p-6'>
                <h2 className='mb-3 text-lg font-semibold sm:mb-4 sm:text-xl'>Initialize Delivery Data</h2>
                <p className='mb-4 text-sm text-gray-600 sm:text-base'>
                    This will create the default delivery zones (New Zealand & Australia) with your current shipping
                    methods and pricing.
                </p>

                <Button
                    onClick={handleSeedData}
                    disabled={isSeeding || hasZones}
                    className='mb-4 w-full text-sm sm:w-auto sm:text-base'>
                    {isSeeding ? 'Seeding Data...' : 'Seed Delivery Data'}
                </Button>

                {hasZones && (
                    <p className='text-xs text-green-600 sm:text-sm'>
                        ✅ Delivery zones already exist ({zones.length} zones configured)
                    </p>
                )}
            </div>

            {/* Current Zones Display */}
            {hasZones && (
                <div className='rounded-lg bg-white p-4 shadow-md sm:p-6'>
                    <h2 className='mb-3 text-lg font-semibold sm:mb-4 sm:text-xl'>Current Delivery Zones</h2>

                    <div className='space-y-4'>
                        {zones.map((zone) => (
                            <div key={zone.id} className='rounded-lg border p-3 sm:p-4'>
                                <div className='mb-3 flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0'>
                                    <div className='flex-1'>
                                        <h3 className='text-base font-semibold sm:text-lg'>
                                            {zone.name} ({zone.countryCode})
                                        </h3>
                                        <div className='mt-1 flex flex-wrap gap-1 text-xs text-gray-600 sm:text-sm'>
                                            <span>Currency: {zone.currency}</span>
                                            <span className='hidden sm:inline'>|</span>
                                            <span>Free: ${zone.freeThreshold}</span>
                                            <span className='hidden sm:inline'>|</span>
                                            <span>
                                                Min: ${minOrderData?.amount !== undefined ? minOrderData.amount : '-'}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`w-fit rounded px-2 py-1 text-xs ${zone.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {zone.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>

                                <div className='space-y-2'>
                                    <h4 className='text-xs font-medium sm:text-sm'>Shipping Methods:</h4>
                                    {zone.shippingMethods.map((method) => (
                                        <div
                                            key={method.id}
                                            className='flex flex-col space-y-1 rounded bg-gray-50 p-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:p-3'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <span className='text-sm font-medium'>{method.label}</span>
                                                <span className='text-xs text-gray-600'>({method.estimatedDays})</span>
                                            </div>
                                            <div className='flex items-center space-x-2 text-sm'>
                                                <span className='font-medium'>${method.price}</span>
                                                {method.isFreeEligible && (
                                                    <span className='rounded bg-green-50 px-1 py-0.5 text-xs text-green-600'>
                                                        Free Eligible
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Test Instructions */}
            <div className='mt-6 rounded-lg bg-blue-50 p-4 sm:mt-8 sm:p-6'>
                <h2 className='mb-3 text-lg font-semibold text-blue-800 sm:mb-4 sm:text-xl'>Testing Instructions</h2>
                <div className='space-y-2 text-sm text-blue-700 sm:text-base'>
                    <p>1. After seeding data, go to your checkout flow</p>
                    <p>2. Add items to cart and proceed to delivery page</p>
                    <p>3. Try different countries (NZ/AU) to see dynamic shipping methods</p>
                    <p>4. Test free shipping thresholds by adjusting cart totals</p>
                    <p>5. Verify all prices and delivery estimates are correct</p>
                </div>
            </div>
        </div>
    );
};

export default DeliverySetupPage;
