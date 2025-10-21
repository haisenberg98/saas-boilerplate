'use client';

//trpc
import Image from 'next/image';
import Link from 'next/link';

import { serverClient } from '@/app/_trpc/serverClient';
//helper
import { slugify } from '@/lib/utils';

//icons
import { FaInfoCircle } from 'react-icons/fa';

const DataCard = ({ data }: { data: Awaited<ReturnType<(typeof serverClient)['getPostById']>> }) => {
    const title = slugify(data?.title || '');

    return (
        <div className='mb-2 flex w-full flex-col last:mb-0 last:pr-0' onClick={(e) => e.stopPropagation()}>
            <div>
                <Link href={`/post/${data?.id}/${title}`}>
                    <img
                        className='h-44 w-full rounded-t-lg object-cover md:h-52'
                        src={data?.image || ''}
                        alt={data?.title || ''}
                        width={400}
                        height={200}
                    />
                </Link>
                <div className='pb-1 pt-2 md:pb-2 md:pt-4'>
                    <div className='flex justify-between'>
                        <Link href={`/post/${data?.id}/${title}`}>
                            <h4 className='line-clamp-2'>
                                {/* {truncate(item?.name || '', 25)} */}
                                {data?.title}
                            </h4>
                        </Link>
                    </div>
                    <div className='flex justify-between py-2 md:flex-col'>
                        <ul className='flex flex-col'>
                            <li className='flex items-center'>
                                <FaInfoCircle className='text-customPrimary md:text-2xl' />

                                <span className='ml-1 xl:text-lg'>{data?.category?.name}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataCard;
