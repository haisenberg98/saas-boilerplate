'use client';

import { useEffect, useState } from 'react';

import { useAppSelector } from '@/hooks/reduxHooks';
import { useDispatch } from 'react-redux';
import { setCurrency } from '@/redux/slices/currencySlice';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// const SUPPORTED = ['NZD', 'AUD', 'USD', 'EUR', 'GBP', 'IDR'];
const SUPPORTED = ['NZD', 'AUD'];

export default function CurrencySwitcher() {
    const dispatch = useDispatch();
    const currency = useAppSelector((s) => s.currency.selectedCurrency);
    const locked = useAppSelector((s) => s.currency.lockedCurrency !== null);

    useEffect(() => {
        const local = localStorage.getItem('currency');
        if (local && SUPPORTED.includes(local)) {
            dispatch(setCurrency(local));
            // Sync cookie on initial load
            document.cookie = `currency=${local}; path=/; max-age=31536000`;
        }
    }, [dispatch]);

    const handleChange = (selected: string) => {
        dispatch(setCurrency(selected));
        localStorage.setItem('currency', selected);
        document.cookie = `currency=${selected}; path=/; max-age=31536000`;
        location.reload(); // Refresh to apply
    };

    return (
        <Select 
            value={currency} 
            onValueChange={handleChange} 
            disabled={locked}
        >
            <SelectTrigger className="w-[80px] text-customPrimary">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {SUPPORTED.map((c) => (
                    <SelectItem key={c} value={c}>
                        {c}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
