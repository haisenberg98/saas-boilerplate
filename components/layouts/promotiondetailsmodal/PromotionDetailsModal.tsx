import React from 'react';

import { toast } from 'react-toastify';

import { useAppSelector } from '@/hooks/reduxHooks';

//icons
import { IoIosCloseCircleOutline } from 'react-icons/io';
import { IoShareOutline } from 'react-icons/io5';

//components

type DataDetailsProps = {
  handleCloseModal: (e: React.MouseEvent) => void;
};

const DataDetailsModal = ({ handleCloseModal }: DataDetailsProps) => {
  const selectedData = useAppSelector(state => state.modal.selectedPromotion);

  const handleShare = async () => {
    const url = window.location.href;
    const title = selectedData?.title || 'Promotion';
    const text = `Check out this promotion: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy link');
      }
    }
  };
  return (
    <>
      <div className='w-full relative'>
        <button
          className='absolute z-50 top-0 left-0 mt-4 ml-4'
          onClick={e => handleCloseModal(e)}
        >
          <IoIosCloseCircleOutline size={50} />
        </button>
        <button
          onClick={handleShare}
          className='absolute z-50 top-0 right-0 mt-4 mr-4'
        >
          <IoShareOutline size={40} />
        </button>
      </div>
      <div className='flex flex-col px-4 md:px-6 pt-16'>
        {/* details */}
        <div className='flex justify-end'>
          <div className='flex flex-col '>
            {/* <h4 className='line-clamp-2 md:text-xl'>{selectedData?.title}</h4> */}
          </div>
        </div>
        <div className='flex flex-col mt-4 space-y-4 md:space-y-6'>
          {/* content here */}
          <div
            className='tiptap-show'
            dangerouslySetInnerHTML={{
              __html: selectedData?.description || '',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default DataDetailsModal;
