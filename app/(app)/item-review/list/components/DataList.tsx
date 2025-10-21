'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';
import Button from '@/components/global/Button';
import { TRPCClientError } from '@trpc/client';

import {
    FaChevronLeft,
    FaChevronRight,
    FaPencilAlt,
    FaPlus,
    FaSearch,
    FaStar,
    FaTimes,
    FaTrash
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// Define review type with relationships
type ReviewWithRelations = {
    id: string;
    rating: number;
    review: string;
    createdAt: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    item: {
        name: string;
    };
};

const DataList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const { data: listData, refetch } = trpc.getProductReviews.useQuery(undefined, {
        refetchOnMount: false,
        refetchOnReconnect: false
    });

    const deleteData = trpc.deleteProductReview.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: () => {
            toast.success('Review deleted successfully');
            refetch();
        }
    });

    const handleDelete = async (e: React.MouseEvent, dataId: string) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this review?')) {
            deleteData.mutate(dataId);
        }
    };

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
                <h3 className='text-xl md:text-2xl'>All Reviews</h3>
                <Link href='/item-review/add' className='w-full sm:w-auto'>
                    <Button className='flex w-full items-center justify-center space-x-2 sm:w-auto'>
                        <FaPlus size={16} />
                        <span className='whitespace-nowrap'>Add Fake Review</span>
                    </Button>
                </Link>
            </div>

            {/* Search and Filters */}
            <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                ratingFilter={ratingFilter}
                setRatingFilter={setRatingFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
            />

            {/* Paginated Table */}
            <PaginatedTable
                reviews={(listData || []) as ReviewWithRelations[]}
                handleDelete={handleDelete}
                searchTerm={searchTerm}
                ratingFilter={ratingFilter}
                sortBy={sortBy}
            />
        </section>
    );
};

// Pagination Component
interface PaginatedTableProps {
    reviews: ReviewWithRelations[];
    handleDelete: (e: React.MouseEvent, reviewId: string) => void;
    searchTerm: string;
    ratingFilter: string;
    sortBy: string;
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
    reviews,
    handleDelete,
    searchTerm,
    ratingFilter,
    sortBy
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15; // 15 reviews per page

    // Filter and sort reviews based on search and filters
    const filteredReviews = useMemo(() => {
        let filtered = reviews.filter((review) => {
            const matchesSearch =
                searchTerm === '' ||
                review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                review.item.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesRating = ratingFilter === '' || review.rating.toString() === ratingFilter;

            return matchesSearch && matchesRating;
        });

        // Sort reviews
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            case 'oldest':
                filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case 'highest':
                filtered.sort((a, b) => b.rating - a.rating);
                break;
            case 'lowest':
                filtered.sort((a, b) => a.rating - b.rating);
                break;
            default:
                break;
        }

        return filtered;
    }, [reviews, searchTerm, ratingFilter, sortBy]);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, ratingFilter, sortBy]);

    const { paginatedData, totalPages, startIndex, endIndex } = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginated = filteredReviews.slice(start, end);
        const total = Math.ceil(filteredReviews.length / itemsPerPage);

        return {
            paginatedData: paginated,
            totalPages: total,
            startIndex: start + 1,
            endIndex: Math.min(end, filteredReviews.length)
        };
    }, [filteredReviews, currentPage, itemsPerPage]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        const showPages = 5;

        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        const endPage = Math.min(totalPages, startPage + showPages - 1);

        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (filteredReviews.length === 0) {
        if (searchTerm || ratingFilter) {
            return (
                <div className='py-12 text-center text-gray-500'>
                    <div className='mb-2'>No reviews match your search criteria.</div>
                    <div className='text-sm'>Try adjusting your search or filters.</div>
                </div>
            );
        }

        return <div className='py-12 text-center text-gray-500'>No reviews found.</div>;
    }

    return (
        <div className='w-full'>
            {/* Table */}
            <div className='min-w-full overflow-x-auto'>
                <table className='min-w-full border-collapse text-left'>
                    <thead>
                        <tr className='border-b bg-gray-50'>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Review</th>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Rating</th>
                            <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 sm:table-cell sm:px-4 sm:text-sm'>
                                User
                            </th>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Item</th>
                            <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 lg:table-cell lg:px-4 lg:text-sm'>
                                Date
                            </th>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Actions</th>
                        </tr>
                    </thead>
                    <tbody className='bg-white'>
                        {paginatedData.map((item, index) => (
                            <tr
                                key={item.id}
                                className={`border-b hover:bg-gray-50 ${
                                    index % 2 === 1 ? 'bg-white' : 'bg-customTransparentPrimary'
                                }`}>
                                <td className='w-[200px] px-2 py-3 sm:px-4'>
                                    <span className='line-clamp-2 text-xs sm:text-sm'>
                                        {item.review.length > 80 ? `${item.review.slice(0, 80)}...` : item.review}
                                    </span>
                                </td>
                                <td className='px-2 py-3 sm:px-4'>
                                    <div className='flex items-center space-x-1'>
                                        <span className='text-xs font-medium sm:text-sm'>{item.rating}</span>
                                        <FaStar className='h-3 w-3 text-yellow-400' />
                                    </div>
                                </td>
                                <td className='hidden px-2 py-3 text-xs text-gray-600 sm:table-cell sm:px-4 sm:text-sm'>
                                    <div>
                                        <div className='font-medium'>{item.user.firstName} {item.user.lastName}</div>
                                        <div className='text-xs text-gray-400'>{item.user.email}</div>
                                    </div>
                                </td>
                                <td className='px-2 py-3 sm:px-4'>
                                    <span className='line-clamp-1 text-xs sm:text-sm'>
                                        {item.item.name.length > 30
                                            ? `${item.item.name.slice(0, 30)}...`
                                            : item.item.name}
                                    </span>
                                    <div className='block text-xs text-gray-500 sm:hidden'>
                                        {item.user.firstName} {item.user.lastName}
                                    </div>
                                </td>
                                <td className='hidden px-2 py-3 text-xs text-gray-600 lg:table-cell lg:px-4 lg:text-sm'>
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </td>
                                <td className='px-2 py-3 sm:px-4'>
                                    <div className='flex space-x-1 sm:space-x-3'>
                                        <Link
                                            href={`/item-review/edit/${item.id}`}
                                            className='rounded p-1 hover:bg-gray-100'>
                                            <FaPencilAlt size={14} className='text-gray-600 sm:size-4' />
                                        </Link>
                                        <button
                                            type='button'
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className='rounded p-1 hover:bg-gray-100'>
                                            <FaTrash size={14} className='text-red-600 sm:size-4' />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='mt-6 flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0'>
                    <div className='text-sm text-gray-600'>
                        Showing {startIndex}-{endIndex} of {filteredReviews.length} reviews
                        {(searchTerm || ratingFilter) && filteredReviews.length < reviews.length && (
                            <span className='ml-1 text-gray-400'>({reviews.length} total)</span>
                        )}
                    </div>

                    <div className='flex items-center space-x-1'>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className='flex items-center justify-center rounded-md border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2'>
                            <FaChevronLeft size={12} />
                            <span className='ml-1 hidden sm:inline'>Previous</span>
                        </button>

                        <div className='flex space-x-1'>
                            {getPageNumbers()[0] > 1 && (
                                <>
                                    <button
                                        onClick={() => goToPage(1)}
                                        className='rounded-md border px-2 py-1 text-sm hover:bg-gray-50 sm:px-3 sm:py-2'>
                                        1
                                    </button>
                                    {getPageNumbers()[0] > 2 && (
                                        <span className='px-2 py-1 text-sm text-gray-500'>...</span>
                                    )}
                                </>
                            )}

                            {getPageNumbers().map((pageNum) => (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`rounded-md border px-2 py-1 text-sm sm:px-3 sm:py-2 ${
                                        currentPage === pageNum ? 'bg-customPrimary text-white' : 'hover:bg-gray-50'
                                    }`}>
                                    {pageNum}
                                </button>
                            ))}

                            {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                                <>
                                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                                        <span className='px-2 py-1 text-sm text-gray-500'>...</span>
                                    )}
                                    <button
                                        onClick={() => goToPage(totalPages)}
                                        className='rounded-md border px-2 py-1 text-sm hover:bg-gray-50 sm:px-3 sm:py-2'>
                                        {totalPages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className='flex items-center justify-center rounded-md border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2'>
                            <span className='mr-1 hidden sm:inline'>Next</span>
                            <FaChevronRight size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// Search and Filters Component
interface SearchAndFiltersProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    ratingFilter: string;
    setRatingFilter: (rating: string) => void;
    sortBy: string;
    setSortBy: (sort: string) => void;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    ratingFilter,
    setRatingFilter,
    sortBy,
    setSortBy
}) => {
    const clearFilters = () => {
        setSearchTerm('');
        setRatingFilter('');
        setSortBy('newest');
    };

    const hasActiveFilters = searchTerm || ratingFilter || sortBy !== 'newest';

    return (
        <div className='rounded-lg border bg-white p-4 shadow-sm'>
            <div className='flex flex-col space-y-4'>
                {/* Search Bar */}
                <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                    <label className='text-sm font-medium text-gray-700 sm:w-20'>Search:</label>
                    <div className='relative flex-1'>
                        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                            <FaSearch className='h-4 w-4 text-gray-400' />
                        </div>
                        <input
                            type='text'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder='Search by review text, user name, email, or item...'
                            className='block w-full rounded-md border border-gray-300 py-1 pl-10 pr-3 text-lg placeholder:text-lg focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                    <span className='text-sm font-medium text-gray-700 sm:w-20'>Filters:</span>
                    <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0'>
                        {/* Rating Filter */}
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'>
                            <option value=''>All Ratings</option>
                            <option value='5'>5 Stars</option>
                            <option value='4'>4 Stars</option>
                            <option value='3'>3 Stars</option>
                            <option value='2'>2 Stars</option>
                            <option value='1'>1 Star</option>
                        </select>

                        {/* Sort Filter */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'>
                            <option value='newest'>Newest First</option>
                            <option value='oldest'>Oldest First</option>
                            <option value='highest'>Highest Rating</option>
                            <option value='lowest'>Lowest Rating</option>
                        </select>

                        {/* Clear Filters Button */}
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className='flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'>
                                <FaTimes size={12} />
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {hasActiveFilters && (
                    <div className='flex flex-wrap gap-2'>
                        {searchTerm && (
                            <span className='inline-flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'>
                                <span>Search: &quot;{searchTerm}&quot;</span>
                                <button onClick={() => setSearchTerm('')} className='hover:text-blue-600'>
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        )}
                        {ratingFilter && (
                            <span className='inline-flex items-center space-x-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800'>
                                <span>Rating: {ratingFilter} Stars</span>
                                <button onClick={() => setRatingFilter('')} className='hover:text-yellow-600'>
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        )}
                        {sortBy !== 'newest' && (
                            <span className='inline-flex items-center space-x-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800'>
                                <span>
                                    Sort: {sortBy === 'oldest' ? 'Oldest First' : sortBy === 'highest' ? 'Highest Rating' : 'Lowest Rating'}
                                </span>
                                <button onClick={() => setSortBy('newest')} className='hover:text-purple-600'>
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataList;
