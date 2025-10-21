'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

//redux
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';

import { closePageModal } from '@/redux/slices/modalSlice';

//components
import ProductDetailsModal from '@/components/layouts/productdetailsmodal/ProductDetailsModal';
import CartModal from '@/components/layouts/cartmodal/CartModal';
import OrderModal from '@/components/layouts/ordermodal/OrderModal';
import DataDetailsModal from '@/components/layouts/datadetailsmodal/DataDetailsModal';
import PromotionDetailsModal from '@/components/layouts/promotiondetailsmodal/PromotionDetailsModal';
import CoffeeAIModal from '@/components/layouts/coffeeaimodal/CoffeeAIModal';

// import ServeCounter from '@/components/recipedetailsmodal/ServeCounter';

const PageModal = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { isPageModalOpen, modalName } = useAppSelector(state => state.modal);

  // Freeze background scroll when modal is open
  useEffect(() => {
    if (isPageModalOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Prevent scrolling on body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scrolling
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      
      // Restore scroll position
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isPageModalOpen]);

  const handleCloseModal = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(closePageModal());

    switch (modalName) {
      case 'cart':
        break;
      case 'coffee-ai':
        // Always navigate away from coffee-ai page when closing modal
        const currentUrl = window.location.pathname + window.location.search;
        if (currentUrl.includes('/coffee-ai')) {
          // Try to go back to previous non-coffee-ai page
          let foundPreviousPage = false;
          
          // Check if we can go back in history
          if (window.history?.length && window.history.length > 1) {
            try {
              // Go back, but if it fails or we're still on coffee-ai, go to home
              router.back();
              
              // Set a timeout to check if we're still on coffee-ai page after navigation
              setTimeout(() => {
                if (window.location.pathname.includes('/coffee-ai')) {
                  router.push('/');
                }
              }, 100);
            } catch (error) {
              console.error('Navigation error:', error);
              router.push('/');
            }
          } else {
            // No history, go to home page
            router.push('/');
          }
        } else {
          // If somehow not on coffee-ai page, go back or home
          if (window.history?.length && window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
        }
        break;
      default: //if the modal is not cart or coffee-ai, it will go back to the previous page
        if (window.history?.length && window.history.length > 2) {
          router.back();
        } else {
          try {
            router.push('/');
          } catch (error) {
            console.error('Navigation error:', error);
          }
        }
    }
  };

  return (
    <div
      className={`modal-overlay   ${
        isPageModalOpen ? 'active scrollbar-hide' : ''
      }`}
      onClick={handleCloseModal}
    >
      <div
        className={`modal-content xl:max-w-4xl xl:container xl:mx-auto ${
          isPageModalOpen ? 'active scrollbar-hide' : ''
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* if you want dynamic modal, you can create a condition with state here */}
        {modalName === 'item-details' && (
          <ProductDetailsModal handleCloseModal={handleCloseModal} />
        )}
        {modalName === 'cart' && (
          <CartModal handleCloseModal={handleCloseModal} />
        )}
        {modalName === 'order-details' && (
          <OrderModal handleCloseModal={handleCloseModal} />
        )}
        {modalName === 'data-details' && (
          <DataDetailsModal handleCloseModal={handleCloseModal} />
        )}
        {modalName === 'promotion-details' && (
          <PromotionDetailsModal handleCloseModal={handleCloseModal} />
        )}
        {modalName === 'coffee-ai' && (
          <CoffeeAIModal handleCloseModal={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default PageModal;
