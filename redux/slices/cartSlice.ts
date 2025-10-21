// cartSlice.ts
import { CartItem, CartState, DeliveryInfo, DiscountInfo } from '@/lib/types';
import { type PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';

/** ---------- money helpers (cents-first to avoid drift) ---------- */
const toCents = (n: number) => Math.round(n * 100);
const fromCents = (c: number) => Number((c / 100).toFixed(2));
const clampMin0 = (n: number) => (n < 0 ? 0 : n);

/** ---------- storage helpers ---------- */
const getLocalStorageItem = (key: string) => {
    if (typeof window !== 'undefined') {
        const storedItem = localStorage.getItem(key);
        if (storedItem && storedItem !== 'null' && storedItem !== 'undefined') {
            try {
                return JSON.parse(storedItem);
            } catch (e) {
                console.error('Error parsing JSON from localStorage for key:', key, e);
            }
        }
    }

    return null;
};

const persistCartState = (state: CartState) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
        localStorage.setItem('totalItems', JSON.stringify(state.totalItems));
        localStorage.setItem('preTotalPrice', JSON.stringify(state.preTotalPrice));
        localStorage.setItem('priceAfterDiscount', JSON.stringify(state.priceAfterDiscount));
        localStorage.setItem('totalPrice', JSON.stringify(state.totalPrice));
        localStorage.setItem('discountInfo', JSON.stringify(state.discountInfo));
        localStorage.setItem('deliveryInfo', JSON.stringify(state.deliveryInfo));
    }
};

/** ---------- calculators (cents) ---------- */
const calculateItemCount = (cartItems: CartItem[]) => cartItems.reduce((total, item) => total + item.quantity, 0);

const calculateSubtotalCents = (cartItems: CartItem[]) =>
    cartItems.reduce((total, item) => total + toCents(item.price) * item.quantity, 0);

const calculateDiscountCents = (discountInfo: DiscountInfo | null, subtotalCents: number) => {
    if (!discountInfo) return 0;
    const raw = discountInfo.isPercentageDiscount
        ? Math.round((subtotalCents * discountInfo.discountAmount) / 100)
        : toCents(discountInfo.discountAmount);

    return clampMin0(raw);
};

const updateCartTotals = (state: CartState) => {
    state.totalItems = calculateItemCount(state.cartItems);

    const subtotalCents = calculateSubtotalCents(state.cartItems);
    const deliveryFeeCents = toCents(state.deliveryInfo?.deliveryFee || 0);
    const discountCents = calculateDiscountCents(state.discountInfo, subtotalCents);

    const priceAfterDiscountCents = clampMin0(subtotalCents - discountCents);
    const totalCents = clampMin0(priceAfterDiscountCents + deliveryFeeCents);

    // Write back to state as dollars (UI-friendly), rounded cleanly
    state.preTotalPrice = fromCents(subtotalCents);
    state.priceAfterDiscount = fromCents(priceAfterDiscountCents);
    state.totalPrice = fromCents(totalCents);

    if (state.discountInfo) {
        state.discountInfo.appliedAmount = fromCents(discountCents); // safe: cents→rounded dollars
    }
    persistCartState(state);
};

/** ---------- initial state ---------- */
const initialState: CartState = {
    cartItems: getLocalStorageItem('cartItems') || [],
    totalItems: getLocalStorageItem('totalItems') || 0,
    discountInfo: getLocalStorageItem('discountInfo') || null,
    preTotalPrice: getLocalStorageItem('preTotalPrice') || 0,
    priceAfterDiscount: getLocalStorageItem('priceAfterDiscount') || 0,
    totalPrice: getLocalStorageItem('totalPrice') || 0,
    deliveryInfo: getLocalStorageItem('deliveryInfo') || null
};

const cartItemsSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        /** Call this once on app bootstrap after store/configureStore to recompute */
        rehydrateFromStorage(state) {
            // Recalculate everything from items/discount/delivery currently in state + storage
            updateCartTotals(state);
        },

        addToCart(state, action: PayloadAction<CartItem>) {
            const existing = state.cartItems.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity += action.payload.quantity;
                existing.subTotal = existing.quantity * existing.price; // keep for UI rows
            } else {
                state.cartItems.push(action.payload);
            }
            updateCartTotals(state);
        },

        updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
            const existing = state.cartItems.find((i) => i.id === action.payload.id);
            if (existing) {
                existing.quantity = action.payload.quantity;
                existing.subTotal = existing.quantity * existing.price;
            }
            updateCartTotals(state);
        },

        deleteCartItem(state, action: PayloadAction<string>) {
            state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
            updateCartTotals(state);
        },

        clearCart(state) {
            state.cartItems = [];
            state.totalItems = 0;
            state.totalPrice = 0;
            state.preTotalPrice = 0;
            state.priceAfterDiscount = 0;
            state.discountInfo = null;
            state.deliveryInfo = null;

            if (typeof window !== 'undefined') {
                localStorage.removeItem('cartItems');
                localStorage.removeItem('totalItems');
                localStorage.removeItem('preTotalPrice');
                localStorage.removeItem('priceAfterDiscount');
                localStorage.removeItem('totalPrice');
                localStorage.removeItem('discountInfo');
                localStorage.removeItem('deliveryInfo');
            }
        },

        saveDeliveryInfo(state, action: PayloadAction<DeliveryInfo>) {
            state.deliveryInfo = action.payload;
            updateCartTotals(state);
        },

        saveDiscountInfo(state, action: PayloadAction<DiscountInfo>) {
            // If you want to allow replacing, remove this guard
            if (state.discountInfo) return;

            const info = action.payload;
            // defensive: preserve explicit fixed amount
            state.discountInfo =
                !info.isPercentageDiscount && info.discountAmount > 0 ? { ...info, isPercentageDiscount: false } : info;

            updateCartTotals(state);
        },

        clearDeliveryInfo(state) {
            state.deliveryInfo = null;
            updateCartTotals(state);
        },

        // keep, but totals are always recomputed by updateCartTotals
        updateTotalPrice(state, action: PayloadAction<number>) {
            state.totalPrice = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('totalPrice', JSON.stringify(state.totalPrice));
            }
        }
    }
});

export const {
    rehydrateFromStorage,
    addToCart,
    clearCart,
    updateQuantity,
    deleteCartItem,
    saveDeliveryInfo,
    clearDeliveryInfo,
    updateTotalPrice,
    saveDiscountInfo
} = cartItemsSlice.actions;

/** ---------- base selectors ---------- */
export const selectCart = (state: { cart: CartState }) => state.cart;
export const selectCartItems = (s: { cart: CartState }) => s.cart.cartItems;
export const selectTotalItems = (s: { cart: CartState }) => s.cart.totalItems;
export const selectPreTotalPrice = (s: { cart: CartState }) => s.cart.preTotalPrice;
export const selectPriceAfterDiscount = (s: { cart: CartState }) => s.cart.priceAfterDiscount;
export const selectTotalPrice = (s: { cart: CartState }) => s.cart.totalPrice;

/** ---------- derived selectors (UI should use these) ---------- */
export const selectDiscountAmountDerived = createSelector(
    [selectPreTotalPrice, selectPriceAfterDiscount],
    (pre, after) => Number((pre - after).toFixed(2))
);

export const selectHasDiscount = createSelector([selectDiscountAmountDerived], (discount) => discount > 0);

export default cartItemsSlice.reducer;
