'use client';

//trpc
import { serverClient } from '@/app/_trpc/serverClient';

import Link from 'next/link';
import Image from 'next/image';

//icons
import { FaInfoCircle } from 'react-icons/fa';

//helper
import { slugify } from '@/lib/utils';

const DataCard = ({
  item,
}: {
  item: Awaited<ReturnType<(typeof serverClient)['getPromotionById']>>;
}) => {
  const title = slugify(item?.title || '');
  return (
    <div
      className='flex flex-col w-full last:pr-0 last:mb-0'
      onClick={e => e.stopPropagation()}
    >
      {item?.hasLink ? (
        <Link href={`/promotion/${item?.id}/${title}`}>
          <Image
            className='w-full h-24 object-cover rounded-lg md:h-42'
            src={item?.image || ''}
            alt={item?.title || ''}
            width={980}
            height={980}
          />
        </Link>
      ) : (
        <Image
          className='w-full h-24 object-cover rounded-lg md:h-42'
          src={item?.image || ''}
          alt={item?.title || ''}
          width={980}
          height={980}
        />
      )}
    </div>
  );
};

export default DataCard;
