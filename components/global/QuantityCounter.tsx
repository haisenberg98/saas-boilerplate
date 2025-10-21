import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { updateQuantity } from '@/redux/slices/cartSlice';
import { toast } from 'react-toastify';

type QuantityCounterProps = {
  itemId: string;
};

import { CartItem, CartState } from '@/lib/types';

function getTotalItemAfterAddition(
  cart: CartState,
  cartItem: CartItem,
  newCount: number
) {
  // Prevent dispatching if the quantity is already at the maximum
  const currentQuantity = cartItem ? cartItem.quantity : 0;
  // Calculate total items currently in the cart
  const totalCurrentItems = cart.cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const totalItemsAfterAddition =
    totalCurrentItems - currentQuantity + newCount;

  return { totalItemsAfterAddition };
}

const QuantityCounter = ({ itemId }: QuantityCounterProps) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(state => state.cart);
  const cartItem = useAppSelector(state =>
    state.cart.cartItems?.find(item => item.id === itemId)
  ) as CartItem;
  const initialQuantityCount = cartItem?.quantity || 1;
  const [quantityCount, setQuantityCount] = useState(initialQuantityCount);
  const maxQuantityCount = 5;
  const minQuantityCount = 1; // Quantity cannot be less than 1

  useEffect(() => {
    setQuantityCount(initialQuantityCount);
  }, [initialQuantityCount]);

  const increment = () => {
    const newCount =
      quantityCount >= maxQuantityCount ? maxQuantityCount : quantityCount + 1;
    setQuantityCount(newCount);

    // Check if the total items after addition exceed the maximum quantity
    const { totalItemsAfterAddition } = getTotalItemAfterAddition(
      cart,
      cartItem,
      newCount
    );
    if (totalItemsAfterAddition > maxQuantityCount) {
      setQuantityCount(quantityCount);

      toast.error('Max quantity reached');
      return;
    }

    dispatch(updateQuantity({ id: itemId, quantity: newCount }));
  };

  const decrement = () => {
    const newCount =
      quantityCount <= minQuantityCount ? minQuantityCount : quantityCount - 1;
    setQuantityCount(newCount);
    dispatch(updateQuantity({ id: itemId, quantity: newCount }));
  };

  return (
    <div className='flex'>
      <button onClick={decrement} className='bg-customPrimary px-2 rounded-l'>
        <div className='serve-counter-buttons'>-</div>
      </button>
      <span className='border px-2 py-1 md:px-4'>{quantityCount}</span>
      <button
        onClick={increment}
        className='bg-customPrimary text-white px-2 rounded-r'
      >
        <div className='serve-counter-buttons'>+</div>
      </button>
    </div>
  );
};

export default QuantityCounter;
