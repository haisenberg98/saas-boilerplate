'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';
const CheckCartItem = () => {
  const { cartItems } = useAppSelector(state => state.cart);
  const router = useRouter();
  const initialCartItemsRef = useRef(cartItems);

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/');
    }
  }, [cartItems]);

  useEffect(() => {
    // Check if the cartItems have changed compared to the initial load
    if (cartItems !== initialCartItemsRef.current) {
      router.back(); // Navigate to the previous page
    }
  }, [cartItems]);

  return null;
};

export default CheckCartItem;
