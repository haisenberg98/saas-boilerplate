// lib/money.ts

export const SUPPORTED = ['NZD', 'AUD'] as const;
export type Currency = (typeof SUPPORTED)[number];

// Manual FX rates relative to NZD
export const FX_FROM_NZD: Record<Currency, number> = {
    NZD: 1,
    AUD: 0.9
};

// Convert NZD → target currency
export function convertNZD(price: number, currency: Currency): number {
    if (currency === 'NZD') return price;
    const rate = FX_FROM_NZD[currency];

    return price * rate;
}

// Stripe needs integer "minor units" (cents)
export function toMinor(amount: number) {
    return Math.round(amount * 100);
}

// Format nicely for UI
export function fmt(amount: number, currency: Currency, locale?: string) {
    const formatted = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2, // ✅ Always show .00
        maximumFractionDigits: 2
    }).format(amount);

    // Override for AUD to make it "AU$10.00"
    if (currency === 'AUD') {
        return formatted.replace('A$', 'AU$');
    }

    return formatted;
}

export function displayPrice(nzdPrice: number | undefined, currency: Currency, fallback = '-') {
    if (typeof nzdPrice !== 'number') return fallback;
    const converted = convertNZD(nzdPrice, currency);

    return fmt(converted, currency);
}

export const fmtNZD = (n: number) =>
    new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(n);
