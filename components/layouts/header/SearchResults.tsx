'use client';

import { useEffect } from 'react';

import Image from 'next/image';
import Link from 'next/link';

//redux
import { useAppSelector } from '@/hooks/reduxHooks';
//helper
import { slugify } from '@/lib/utils';
import { Item } from '@prisma/client';

export type ItemWithImage = Item & {
    image: string | null;
};

type productSearchState = {
    isSearchBarFocused: boolean;
    searchTerm: string;
    searchedItems: ItemWithImage[]; // Use extended type
};

const SearchResults = () => {
    const isSearchBarFocused = useAppSelector((state) => state.search.isSearchBarFocused);
    const searchedItems = useAppSelector((state) => state.search.searchedItems);

    // Disable body scroll when search is active
    useEffect(() => {
        if (isSearchBarFocused) {
            // Disable body scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable body scroll
            document.body.style.overflow = 'unset';
        }

        // Cleanup function to ensure scroll is re-enabled when component unmounts
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSearchBarFocused]);

    if (!isSearchBarFocused) return null;

    // Only enable scrolling when there are more than 6 results
    const hasManyResults = searchedItems.length > 6;
    const overflowClass = hasManyResults ? 'overflow-y-auto' : 'overflow-y-hidden';

    return (
        <div className={`search-results md:px-4 ${overflowClass}`}>
            <div className='container grid grid-cols-1 gap-4 p-4 pt-20 md:pt-24 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
                {searchedItems.length !== 0 ? (
                    searchedItems?.map((item, index) => (
                        <Link href={`/item/${item.id}/${slugify(item.name)}`} key={item.id}>
                            <div className='grid w-full cursor-pointer grid-cols-[auto_1fr] items-center gap-4 md:grid-cols-[auto_3fr] md:items-start'>
                                <div className='h-16 w-16 md:h-32 md:w-32'>
                                    {item.image ? (
                                        <Image
                                            width={100}
                                            height={100}
                                            src={item.image}
                                            alt={item.name}
                                            className='h-full w-full rounded-md object-cover'
                                        />
                                    ) : (
                                        <div className='flex h-16 w-16 items-center justify-center rounded-md bg-gray-200 md:h-32 md:w-32'>
                                            <span className='text-xs text-customPrimary md:text-sm'>No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className='flex flex-col space-y-1'>
                                    <h4>{item.name}</h4>
                                    <p className='line-clamp-2 md:line-clamp-none'>{item.description}</p>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className='container  lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>No search results found.</p>
                )}
            </div>
        </div>
    );
};
export default SearchResults;
