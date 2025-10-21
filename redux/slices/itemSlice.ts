import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

type ItemState = {
    selectedCategory: string;
};

const initialState: ItemState = {
    selectedCategory: 'Filters'
};

export const itemSlice = createSlice({
    name: 'item',
    initialState: initialState,
    reducers: {
        setSelectedCategory: (state, action: PayloadAction<string>) => {
            state.selectedCategory = action.payload;
        }
    }
});

export const { setSelectedCategory } = itemSlice.actions;

export const selectSelectedCategory = (state: { item: ItemState }) => state.item.selectedCategory;

export default itemSlice.reducer;
