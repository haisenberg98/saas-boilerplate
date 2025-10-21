'use client';
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

//helpers
import { convertToCents } from '@/lib/utils';

//components
import StripeCheckoutForm from './StripeCheckoutForm';

if (process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY === undefined) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

//redux
import { useAppSelector } from '@/hooks/reduxHooks';

const StripeComponent = () => {
  const amount = useAppSelector(state => state.cart.totalPrice);

  const [amountToPay, setAmountToPay] = useState<number>(0);

  useEffect(() => {
    setAmountToPay(amount);
  }, [amount]);

  return (
    <>
      {amountToPay !== 0 ? (
        <Elements
          stripe={stripePromise}
          options={{
            mode: 'payment',
            amount: convertToCents(amountToPay), //cents
            currency: 'nzd',
          }}
        >
          <StripeCheckoutForm />
        </Elements>
      ) : (
        <p>No payment amount.</p>
      )}
    </>
  );
};

export default StripeComponent;
