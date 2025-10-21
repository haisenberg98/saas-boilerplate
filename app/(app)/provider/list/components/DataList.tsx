'use client';

import React from 'react';

import Link from 'next/link';

//trpc
import { trpc } from '@/app/_trpc/client';
//components
import Button from '@/components/global/Button';
//utils
import { truncate } from '@/lib/utils';
import { TRPCClientError } from '@trpc/client';

//icons
import { FaPencilAlt, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const DataList = () => {
    const { data: listData, refetch } = trpc.getShops.useQuery(undefined, {
        refetchOnMount: false, //prevent refetching on mount
        refetchOnReconnect: false //prevent refetching on reconnect
    });

    //trpc
    const deleteData = trpc.deleteShop.useMutation({
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
            toast.success('Data deleted successfully');
            refetch(); // refetch item data after delete
        }
    });

    const handleDelete = async (e: React.MouseEvent, dataId: string) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this data?')) {
            deleteData.mutate(dataId);
        }
    };
    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex items-center justify-between'>
                <h3 className='md:text-2xl'>All providers</h3>
                <Button className='px-3 py-1'>
                    <Link href='/provider/add'>
                        <FaPlus />
                    </Link>
                </Button>
            </div>
            <div className='flex min-w-full flex-col justify-center overflow-x-auto scroll-smooth'>
                {listData && listData.length > 0 ? (
                    <table className='min-w-full border-collapse text-left'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listData.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b ${
                                        index % 2 === 1 ? 'bg-white' : 'bg-customTransparentPrimary'
                                    }`}>
                                    <td className='px-4 py-2'>{item.name}</td>
                                    <td className='py-2'>{truncate(item?.address, 15)}</td>
                                    <td className='py-2'>{item.phone}</td>
                                    <td className='flex space-x-4 py-2'>
                                        <Link href={`/provider/edit/${item.id}`}>
                                            <FaPencilAlt size={20} />
                                        </Link>
                                        <button type='button' onClick={(e) => handleDelete(e, item.id)}>
                                            <FaTrash size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className='text-center'>No data found.</div>
                )}
            </div>
        </section>
    );
};

export default DataList;
