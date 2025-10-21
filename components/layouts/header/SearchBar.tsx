'use client';

import { useEffect, useState } from 'react';

import { trpc } from '@/app/_trpc/client';
//redux
import { useAppSelector } from '@/hooks/reduxHooks';
import { setSearchBarFocused, setSearchedItems } from '@/redux/slices/itemSearchSlice';

import type { ItemWithImage } from './SearchResults';
//icons
import { FaChevronLeft, FaSearch } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { useDebouncedCallback } from 'use-debounce';

const SearchBar = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    //query items with debounce
    const { data: searchedItems, isSuccess } = trpc.getSearchedProducts.useQuery(debouncedSearchTerm, {
        enabled: debouncedSearchTerm.length > 0 // only fetch when there's a search term
    });

    //search bar focus state
    const isSearchBarFocused = useAppSelector((state) => state.search.isSearchBarFocused);
    const setIsFocused = (isFocused: boolean) => {
        dispatch(setSearchBarFocused(isFocused));
    };

    const fetchWithDebounce = useDebouncedCallback((value) => {
        setDebouncedSearchTerm(value);
    }, 600);

    const handleChangeTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setSearchTerm(e.target.value); // Update value for the input to be responsive
        fetchWithDebounce(e.target.value);
    };

    useEffect(() => {
        if (isSuccess) {
            const parsed = searchedItems.map((item) => ({
                ...item,
                createdAt: new Date(item.createdAt),
                updatedAt: item.updatedAt ? new Date(item.updatedAt) : null
            })) as ItemWithImage[];

            dispatch(setSearchedItems(parsed));
        } else {
            dispatch(setSearchedItems([]));
        }
    }, [searchedItems, isSuccess, dispatch]);

    return (
        <div
            className={`${
                isSearchBarFocused ? 'search-bar-focused' : ''
            } search-bar container md:px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl`}>
            <div className='relative flex items-center'>
                <input
                    type='text'
                    placeholder='Search for a item..'
                    value={searchTerm}
                    onChange={(e) => handleChangeTerm(e)}
                    onFocus={() => setIsFocused(true)}
                    className='w-full rounded-md px-12 py-3 text-base shadow-md outline-none placeholder:text-customLightGray md:px-14 md:py-4 md:placeholder:text-lg'
                />
                {isSearchBarFocused ? (
                    <FaChevronLeft className='input-icon' onClick={() => setIsFocused(false)} />
                ) : (
                    <FaSearch className='input-icon' />
                )}
            </div>
        </div>
    );
};

export default SearchBar;
