'use client';

import { useEffect, useState } from 'react';

import { type Currency, SUPPORTED } from '@/lib/money';

const useCurrency = (defaultCurrency: Currency = 'NZD') => {
    const [currency, setCurrency] = useState<Currency>(defaultCurrency);

    useEffect(() => {
        const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith('currency='))
            ?.split('=')[1];

        if (cookie && SUPPORTED.includes(cookie as Currency)) {
            setCurrency(cookie as Currency);
        }
    }, []);

    return currency;
};

export { useCurrency };
export default useCurrency;
