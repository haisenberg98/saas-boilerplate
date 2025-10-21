// lib/getCurrency.ts
import { cookies } from 'next/headers';

import { Currency, SUPPORTED } from './money';

export function getCurrency(): Currency {
    const cookie = cookies().get('currency')?.value;

    return SUPPORTED.includes(cookie as Currency) ? (cookie as Currency) : 'NZD';
}
