import React from 'react';

import { serverClient } from '@/app/_trpc/serverClient';
//redux
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
//types
import { CartItem } from '@/lib/types';
import { addToCart, updateQuantity } from '@/redux/slices/cartSlice';

//components
import Button from './Button';
import { toast } from 'react-toastify';

type AddToCartButtonProps = {
    item: Awaited<ReturnType<(typeof serverClient)['getProductById']>>;
};

const AddToCartButton = ({ item }: AddToCartButtonProps) => {
    const dispatch = useAppDispatch();
    const cart = useAppSelector((state) => state.cart);
    const maxQuantity = 5;
    const quantityCount = 1;

    // if no item return null
    if (!item) return null;

    const { id, name, price, image, description, specification, providerId } = item;

    const newProduct: CartItem = {
        id,
        name,
        price,
        image: image || '',
        description,
        specification: specification || '',
        quantity: quantityCount, // default to 1 if no quantity count is available
        providerId: providerId || '',
        subTotal: price * quantityCount
    };

    const handleAddToCart = () => {
        const existingItem = cart.cartItems.find((item) => item.id === id);
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        // Calculate total items currently in the cart
        const totalCurrentItems = cart.cartItems.reduce((total, item) => total + item.quantity, 0);

        const quantityToAdd = 1;

        // Calculate total items after addition, considering the new quantity
        const totalItemsAfterAddition = totalCurrentItems + quantityToAdd;

        if (totalItemsAfterAddition > maxQuantity) {
            toast.error('Max quantity reached');

            return;
        }

        // Add new item or update the existing item's quantity
        if (existingItem) {
            dispatch(updateQuantity({ id, quantity: currentQuantity + quantityToAdd }));
        } else {
            dispatch(addToCart({ ...newProduct, quantity: quantityToAdd }));
        }

        toast.success('Added to cart');
    };

    return (
        <>
            <Button className='rounded-md bg-customPrimary px-4 py-2 text-white lg:text-base' onClick={handleAddToCart}>
                Add to Cart
            </Button>
        </>
    );
};

export default AddToCartButton;
