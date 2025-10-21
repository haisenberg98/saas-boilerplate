'use client';
import React from 'react';
import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';

//components
import Loader from '@/components/global/Loader';

const DataList = () => {
  const { data: orders, isFetching } = trpc.getUserOrders.useQuery(undefined, {
    refetchOnMount: false, //prevent refetching on mount
    refetchOnReconnect: false, //prevent refetching on reconnect
  });
  return (
    <section className='w-full px-4 space-y-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
      <div className='flex justify-between items-center'>
        <h3 className='md:text-2xl'>Your orders</h3>
      </div>
      <div className='overflow-x-auto scroll-smooth flex flex-col justify-center min-w-full'>
        {orders && orders.length > 0 ? (
          <table className='min-w-full text-left border-collapse'>
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
                        index % 2 === 1
                          ? 'bg-white'
                          : 'bg-customTransparentPrimary'
                      }`}
                    >
                      <td className='pl-4 border-b cursor-pointer'>
                        <div className='flex items-center h-[48px] truncate '>
                          <Link
                            href={`/orders/details/${order?.orderCode?.toLowerCase()}`}
                          >
                            <span className='underline'>
                              {order?.orderCode}
                            </span>
                          </Link>
                        </div>
                      </td>
                      <td className='border-b'>
                        <div className='flex items-center h-[48px] min-w-28'>
                          {order.orderStatus}
                        </div>
                      </td>
                      <td className='border-b text-center lg:text-left'>
                        <div className='flex items-center text-center h-[48px]'>
                          ${order.totalPrice.toFixed(2)}
                        </div>
                      </td>
                      <td className='border-b'>
                        <div className='flex items-center h-[48px]'>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className='border-b'>
                        <div className='flex items-center h-[48px]'>
                          {new Date(order.updatedAt).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))
                : isFetching && (
                    <tr>
                      <td colSpan={5} className='text-center py-4'>
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
