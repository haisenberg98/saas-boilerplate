import React from 'react';

//components
import PageForm from './PageForm';

const OrderActions = () => {
  return (
    <div className='flex flex-col pt-10'>
      <div className='flex justify-between items-center'>
        <h3 className='text-center'>Order Actions</h3>
      </div>
      <div className='flex flex-col pt-4 space-y-1'>
        <PageForm />
      </div>
    </div>
  );
};

export default OrderActions;
