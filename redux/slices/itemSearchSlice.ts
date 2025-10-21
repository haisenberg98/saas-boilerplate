import type { Item } from '@prisma/client';
import { type PayloadAction, createSlice } from '@reduxjs/toolkit';

export type ItemWithImage = Item & {
    image: string | null;
};

type ItemSearchState = {
    isSearchBarFocused: boolean;
    searchTerm: string;
    searchedItems: ItemWithImage[];
};

const initialState: ItemSearchState = {
    isSearchBarFocused: false,
    searchTerm: '',
    searchedItems: []
};

export const searchSlice = createSlice({
    name: 'search',
    initialState: initialState,
    reducers: {
        setSearchBarFocused: (state, action: PayloadAction<boolean>) => {
            state.isSearchBarFocused = action.payload;
        },
        setSearchedItems: (state, action: PayloadAction<ItemWithImage[]>) => {
            state.searchedItems = action.payload;
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload;
        }
    }
});

export const { setSearchBarFocused, setSearchedItems, setSearchTerm } = searchSlice.actions;

export const selectIsSearchBarFocused = (state: { search: ItemSearchState }) => state.search.isSearchBarFocused;

export const selectSearchedItems = (state: { search: ItemSearchState }) => state.search.searchedItems;

export default searchSlice.reducer;
