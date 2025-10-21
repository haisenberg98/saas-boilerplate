'use client';

import React from 'react';

import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';
//components
import Loader from '@/components/global/Loader';
// money util
import { displayPrice } from '@/lib/money';

const DataList = () => {
    const { data: orders, isFetching } = trpc.getUserOrders.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex items-center justify-between'>
                <h3 className='md:text-2xl'>Your orders</h3>
            </div>
            <div className='flex min-w-full flex-col justify-center overflow-x-auto scroll-smooth'>
                {orders && orders.length > 0 ? (
                    <table className='min-w-full border-collapse text-left'>
                        <thead>
                            <tr>
                                <th>Order Code</th>
                                <th>Order Status</th>
                                <th>Total</th>
                                <th>Created</th>
                                <th>Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!isFetching
                                ? orders.map((order, index) => (
                                      <tr
                                          key={index}
                                          className={`border-b ${
                                              index % 2 === 1 ? 'bg-white' : 'bg-customTransparentPrimary'
                                          }`}>
                                          <td className='cursor-pointer border-b pl-4'>
                                              <div className='flex h-[48px] items-center truncate'>
                                                  <Link href={`/orders/details/${order?.orderCode?.toLowerCase()}`}>
                                                      <span className='underline'>{order?.orderCode}</span>
                                                  </Link>
                                              </div>
                                          </td>
                                          <td className='border-b'>
                                              <div className='flex h-[48px] min-w-28 items-center'>
                                                  {order.orderStatus}
                                              </div>
                                          </td>
                                          <td className='border-b text-center lg:text-left'>
                                              <div className='flex h-[48px] items-center text-center'>
                                                  {displayPrice(order.totalPrice, order.currency)}
                                              </div>
                                          </td>
                                          <td className='border-b'>
                                              <div className='flex h-[48px] items-center'>
                                                  {new Date(order.createdAt).toLocaleDateString()}
                                              </div>
                                          </td>
                                          <td className='border-b'>
                                              <div className='flex h-[48px] items-center'>
                                                  {new Date(order.updatedAt).toLocaleDateString()}
                                              </div>
                                          </td>
                                      </tr>
                                  ))
                                : isFetching && (
                                      <tr>
                                          <td colSpan={5} className='py-4 text-center'>
                                              <Loader className='flex justify-center' />
                                          </td>
                                      </tr>
                                  )}
                        </tbody>
                    </table>
                ) : (
                    <div className='text-center'>No orders found.</div>
                )}
            </div>
        </section>
    );
};

export default DataList;
