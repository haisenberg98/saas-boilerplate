'use client';

import React, { useState } from 'react';

import Link from 'next/link';

//trpc
import { trpc } from '@/app/_trpc/client';
//components
import Button from '@/components/global/Button';
import { TRPCClientError } from '@trpc/client';

//icons
import { FaChevronDown, FaCog, FaPencilAlt, FaPlus, FaShippingFast, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DataList = () => {
    const [expandedZone, setExpandedZone] = useState<string | null>(null);

    const { data: listData, refetch } = trpc.getDeliveryZones.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    // Auto-expand New Zealand (NZ) zone on first load
    React.useEffect(() => {
        if (!expandedZone && listData && listData.length > 0) {
            const nz = listData.find((z) => z.countryCode === 'NZ');
            if (nz) setExpandedZone(nz.id);
        }
        // only react to initial data load
    }, [listData]);

    //trpc
    const deleteZone = trpc.deleteDeliveryZone.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: () => {
            toast.success('Delivery zone deleted successfully');
            refetch();
        }
    });

    const deleteShippingMethod = trpc.deleteShippingMethod.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                toast.error('Something went wrong: ' + error.message);
            } else {
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: () => {
            toast.success('Shipping method deleted successfully');
            refetch();
        }
    });

    const handleDeleteZone = async (e: React.MouseEvent, zoneId: string) => {
        e.preventDefault();
        if (
            confirm(
                'Are you sure you want to delete this delivery zone? This will also delete all associated shipping methods.'
            )
        ) {
            deleteZone.mutate(zoneId);
        }
    };

    const handleDeleteMethod = async (e: React.MouseEvent, methodId: string) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this shipping method?')) {
            deleteShippingMethod.mutate(methodId);
        }
    };

    const toggleExpand = (zoneId: string) => {
        setExpandedZone(expandedZone === zoneId ? null : zoneId);
    };

    return (
        <section className='w-full space-y-4 px-2 sm:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                <h3 className='text-lg font-semibold sm:text-xl md:text-2xl'>Delivery Zones</h3>
                <div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
                    <Button className='w-full px-3 py-2 text-sm sm:w-auto sm:text-base'>
                        <Link href='/delivery/zones/add' className='flex items-center justify-center gap-2'>
                            <FaPlus className='text-sm' />
                            <span>Add Zone</span>
                        </Link>
                    </Button>
                    <Button className='w-full px-3 py-2 text-sm sm:w-auto sm:text-base'>
                        <Link href='/delivery/setup' className='flex items-center justify-center gap-2'>
                            <FaCog className='text-sm' />
                            <span>Setup</span>
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='flex min-w-full flex-col justify-center overflow-x-auto scroll-smooth'>
                {listData && listData.length > 0 ? (
                    <div className='space-y-4'>
                        {listData.map((zone, index) => (
                            <div
                                key={zone.id}
                                className={`rounded-lg border ${
                                    index % 2 === 1 ? 'bg-white' : 'bg-customTransparentPrimary'
                                }`}>
                                {/* Zone Header */}
                                <div className='cursor-pointer p-3 sm:p-4' onClick={() => toggleExpand(zone.id)}>
                                    <div className='flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                                        <div className='flex items-start justify-between gap-2 sm:items-center sm:justify-start sm:gap-4'>
                                            <h4 className='text-base font-semibold sm:text-lg'>
                                                {zone.name} ({zone.countryCode})
                                            </h4>
                                            <FaChevronDown
                                                className={`mt-0.5 h-4 w-4 transition-transform sm:mt-0 ${expandedZone === zone.id ? 'rotate-180' : ''}`}
                                            />
                                            <span
                                                className={`w-fit rounded px-2 py-1 text-xs ${
                                                    zone.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                {zone.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                                            <div className='flex flex-wrap items-center gap-1 text-xs text-gray-600 sm:text-sm'>
                                                <span>{zone.currency}</span>
                                                <span className='hidden sm:inline'>|</span>
                                                <span>Free: ${zone.freeThreshold}</span>
                                                {/* <span className='hidden sm:inline'>|</span> */}
                                                {/* <span>Min: ${zone.minOrder}</span> */}
                                            </div>
                                            <div className='flex space-x-3'>
                                                <Link href={`/delivery/zones/edit/${zone.id}`}>
                                                    <FaPencilAlt
                                                        size={14}
                                                        className='text-blue-600 hover:text-blue-800 sm:h-4 sm:w-4'
                                                    />
                                                </Link>
                                                <button
                                                    type='button'
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteZone(e, zone.id);
                                                    }}>
                                                    <FaTrash
                                                        size={14}
                                                        className='text-red-600 hover:text-red-800 sm:h-4 sm:w-4'
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Methods - Expandable */}
                                {expandedZone === zone.id && (
                                    <div className='border-t bg-gray-50 p-3 sm:p-4'>
                                        <div className='mb-4 flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                                            <h5 className='flex items-center text-sm font-medium sm:text-base'>
                                                <FaShippingFast className='mr-2 text-sm sm:text-base' />
                                                Shipping Methods ({zone.shippingMethods.length})
                                            </h5>
                                            <Button className='w-full px-3 py-2 text-xs sm:w-fit sm:text-sm'>
                                                <Link
                                                    href={`/delivery/methods/add?zoneId=${zone.id}`}
                                                    className='flex items-center justify-center gap-2'>
                                                    <FaPlus size={10} className='sm:text-xs' />
                                                    <span>Add Method</span>
                                                </Link>
                                            </Button>
                                        </div>

                                        {zone.shippingMethods.length > 0 ? (
                                            <div className='space-y-3'>
                                                {zone.shippingMethods.map((method) => (
                                                    <div
                                                        key={method.id}
                                                        className='flex flex-col space-y-3 rounded border bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                                                        <div className='min-w-0 flex-1'>
                                                            <div className='mb-2 flex flex-wrap items-center gap-2'>
                                                                <span className='text-sm font-medium sm:text-base'>
                                                                    {method.label}
                                                                </span>
                                                                <span className='text-xs text-gray-600 sm:text-sm'>
                                                                    ({method.methodId})
                                                                </span>
                                                                {method.isFreeEligible && (
                                                                    <span className='whitespace-nowrap rounded bg-green-100 px-2 py-0.5 text-xs text-green-800'>
                                                                        Free Eligible
                                                                    </span>
                                                                )}
                                                                {!method.isActive && (
                                                                    <span className='whitespace-nowrap rounded bg-red-100 px-2 py-0.5 text-xs text-red-800'>
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className='flex flex-wrap items-center gap-1 text-xs text-gray-600 sm:text-sm'>
                                                                <span>${method.price}</span>
                                                                <span className='hidden sm:inline'>•</span>
                                                                <span>{method.estimatedDays}</span>
                                                                <span className='hidden sm:inline'>•</span>
                                                                <span>Sort: {method.sortOrder}</span>
                                                            </div>
                                                        </div>
                                                        <div className='flex gap-3 self-start pt-1 sm:self-center'>
                                                            <Link href={`/delivery/methods/edit/${method.id}`}>
                                                                <FaPencilAlt
                                                                    size={16}
                                                                    className='text-blue-600 hover:text-blue-800 sm:h-4 sm:w-4'
                                                                />
                                                            </Link>
                                                            <button
                                                                type='button'
                                                                onClick={(e) => handleDeleteMethod(e, method.id)}>
                                                                <FaTrash
                                                                    size={16}
                                                                    className='text-red-600 hover:text-red-800 sm:h-4 sm:w-4'
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className='py-6 text-center text-sm text-gray-500'>
                                                No shipping methods configured
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className='py-8 text-center'>
                        <div className='mb-4 text-gray-500'>No delivery zones found.</div>
                        <Button>
                            <Link href='/delivery/setup' className='flex items-center space-x-2'>
                                <FaCog />
                                <span>Setup Delivery Zones</span>
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default DataList;
