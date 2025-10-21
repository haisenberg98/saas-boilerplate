'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

//icons
import { FaPencilAlt } from 'react-icons/fa';
//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { closePageModal } from '@/redux/slices/modalSlice';

const ClientLink = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const selectedProduct = useAppSelector(state => state.modal.selectedProduct);

  const handleLinkCloseModal = (e: React.MouseEvent, link: string) => {
    e.preventDefault();
    dispatch(closePageModal());
    router.push(link);
  };
  return (
    <button
      className='absolute z-50 top-0 right-0 mt-20 mr-6 '
      onClick={e =>
        handleLinkCloseModal(e, `/item/edit/${selectedProduct?.id}`)
      }
    >
      <FaPencilAlt size={30} />
    </button>
  );
};

export default ClientLink;
