import { configureStore } from '@reduxjs/toolkit';

import { apiSlice } from './slices/apiSlice';
import cartSlice from './slices/cartSlice';
import currencySlice from './slices/currencySlice';
import modalSlice from './slices/modalSlice';
import itemSearchSlice from './slices/itemSearchSlice';
import itemSlice from './slices/itemSlice';

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        cart: cartSlice,
        search: itemSearchSlice,
        item: itemSlice,
        modal: modalSlice,
        currency: currencySlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

export default store;
