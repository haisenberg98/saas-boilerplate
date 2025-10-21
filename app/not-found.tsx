import React from 'react';
import Link from 'next/link';

const NotFound = () => {
  return (
    <main className='bg-customSecondary flex justify-center mb-10 md:mb-20 py-4 pb-16 min-h-screen lg:mb-0'>
      <div className='flex flex-col text-center container mx-auto pt-20'>
        <h1 className='text-4xl font-bold'>404</h1>
        <div className='flex justify-center'>
          <span>Page not found.</span>
          <Link href='/'>
            <span className='ml-2 cursor-pointer text-customPrimary'>
              Go back
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
