import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

type CurrencyState = {
    selectedCurrency: string;
    lockedCurrency: string | null;
};

const initialState: CurrencyState = {
    selectedCurrency: 'NZD',
    lockedCurrency: null
};

export const currencySlice = createSlice({
    name: 'currency',
    initialState,
    reducers: {
        setCurrency: (state, action: PayloadAction<string>) => {
            if (!state.lockedCurrency) {
                state.selectedCurrency = action.payload;
            }
        },
        lockCurrency: (state, action: PayloadAction<string>) => {
            state.lockedCurrency = action.payload;
            state.selectedCurrency = action.payload;
        },
        unlockCurrency: (state) => {
            state.lockedCurrency = null;
        }
    }
});

export const { setCurrency, lockCurrency, unlockCurrency } = currencySlice.actions;

// Selectors
export const selectSelectedCurrency = (state: { currency: CurrencyState }) => state.currency.selectedCurrency;
export const selectLockedCurrency = (state: { currency: CurrencyState }) => state.currency.lockedCurrency;

export default currencySlice.reducer;
