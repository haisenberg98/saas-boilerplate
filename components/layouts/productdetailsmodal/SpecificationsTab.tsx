import React from 'react';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';

const SpecificationsTab = () => {
  const { selectedProduct } = useAppSelector(state => state.modal);
  if (!selectedProduct) return null;

  return (
    <div className='grid grid-cols-1 gap-4 max-w-full overflow-y-auto'>
      {selectedProduct?.specification ? (
        <div
          dangerouslySetInnerHTML={{
            __html: selectedProduct?.specification || '',
          }}
          className='tiptap-show'
        />
      ) : (
        <span>No specifications available.</span>
      )}
    </div>
  );
};

export default SpecificationsTab;
