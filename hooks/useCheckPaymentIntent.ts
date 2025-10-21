'use client';
import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { PaymentIntent } from '@stripe/stripe-js';

export const useCheckPaymentIntent = (paymentIntentClientSecret: string) => {
  const stripe = useStripe();
  const [result, setResult] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const checkPaymentIntent = useCallback(
    async (clientSecret: string) => {
      setLoading(true);
      try {
        const response = await stripe?.retrievePaymentIntent(clientSecret);
        setResult(response?.paymentIntent || null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [stripe]
  );

  return { checkPaymentIntent, result, loading, error };
};
