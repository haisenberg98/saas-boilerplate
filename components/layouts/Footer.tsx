import React from 'react';
import Link from 'next/link';

const Footer = () => {
  const getYear = new Date().getFullYear();
  return (
    <footer className='flex flex-col justify-center items-center mb-10 py-4 pb-16 md:mb-0 '>
      <div className='flex space-x-3 pb-12 text-sm'>
        <p>
          <Link className='underline underline-offset-2' href='/store-policy'>
            Store Policy
          </Link>
        </p>
        <p>
          <Link className='underline underline-offset-2' href='/faqs'>
            FAQs
          </Link>
        </p>
        <p>
          <Link className='underline underline-offset-2' href='/return-policy'>
            Return Policy
          </Link>
        </p>
      </div>
      <div className='flex flex-col justify-center items-center'>
        <p className='md:text-sm'>
          Email us:{' '}
          <Link
            className='underline underline-offset-2 md:text-sm'
            href='mailto:support@kofe.co.nz'
          >
            support@kofe.co.nz
          </Link>
        </p>
        <p className='md:text-sm mt-4'>
          &copy; {getYear} Kofe Limited. All rights reserved.
        </p>
        <p className='md:text-sm mt-4'>
          Website by{' '}
          <Link
            className='underline underline-offset-2 md:text-sm text-xs'
            href='https://dennyshu.com'
            target='_blank'
          >
            Denny Shu
          </Link>
          .
        </p>
      </div>
    </footer>
  );
};

export default Footer;
