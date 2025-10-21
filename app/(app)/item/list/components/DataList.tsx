'use client';

import React, { useMemo, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';
import { slugify, truncate } from '@/lib/utils';
import { Category, Item, Provider } from '@prisma/client';
import { Button } from '@react-email/components';
import { TRPCClientError } from '@trpc/client';

import {
    FaChartLine,
    FaChevronLeft,
    FaChevronRight,
    FaEye,
    FaEyeSlash,
    FaPencilAlt,
    FaSearch,
    FaStar,
    FaTimes,
    FaTrash,
    FaTrashAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export type ProductWithImageAndRelations = Item & {
    image: string | null;
    provider?: Provider | null;
    category?: Category | null;
};

const DataList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedShop, setSelectedShop] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const utils = trpc.useUtils();
    const { data: items, refetch } = trpc.getAllProducts.useQuery(undefined, {
        refetchOnMount: true,
        refetchOnReconnect: true
    });

    const deleteProduct = trpc.deleteProduct.useMutation({
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
            toast.success('Item deleted successfully');
            refetch();
        }
    });

    const togglePublish = trpc.toggleProductPublish.useMutation({
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
            toast.success('Item status updated successfully');
            refetch();
        }
    });

    const bulkToggleProducts = trpc.bulkToggleProductsByShop.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: (result) => {
            toast.success(result.message);
            // Revalidate both item list and provider data immediately
            refetch();
            refetchShopsData();
        }
    });

    const { data: shopsData, refetch: refetchShopsData } = trpc.getShopsWithProductCounts.useQuery();
    const {
        data: subscriberEmails,
        refetch: refetchSubscriberEmails,
        isFetching: isFetchingEmails
    } = trpc.getNewsletterEmails.useQuery(undefined, { enabled: false });

    const seedSoldCounts = trpc.seedProductSoldCounts.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: (data) => {
            toast.success(`Successfully seeded sold counts for ${data.count} items!`);
            refetch(); // Refresh item list to show updated counts
        }
    });

    const seedReviews = trpc.seedProductReviews.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: (data) => {
            toast.success(`Successfully seeded ${data.count} reviews!`);
        }
    });

    const seedSingleProductReviews = trpc.seedProductReviewsForSingle.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: (data) => {
            if (data.count > 0) {
                toast.success(`Added ${data.count} review${data.count > 1 ? 's' : ''} for ${data.productName}!`);
            } else {
                toast.info(
                    `No new reviews added for ${data.productName} - users may have already reviewed this item.`
                );
            }
        }
    });

    const fixDuplicateReviews = trpc.fixDuplicateReviews.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: (data) => {
            if (data.deletedReviews > 0) {
                toast.success(
                    `Fixed ${data.duplicateGroups} duplicate user-item combinations by deleting ${data.deletedReviews} duplicate reviews!`
                );
            } else {
                toast.info('No duplicate reviews found - each user has only one review per item.');
            }
        }
    });

    const deleteAllProducts = trpc.deleteAllProductsForShop.useMutation({
        onError: (error) => {
            if (error instanceof TRPCClientError) {
                console.error('TRPC Client Error:', error);
                toast.error('Something went wrong: ' + error.message);
            } else {
                console.error('Unexpected Error:', error);
                toast.error('An unexpected error occurred');
            }
        },
        onSuccess: async (data) => {
            toast.success(`Successfully deleted ${data.count} items from ${data.shopName}!`);
            refetch(); // Refresh item list
            refetchShopsData(); // Refresh provider counts

            // Revalidate all relevant queries
            await utils.getAllProducts.invalidate();
            await utils.getShopsWithProductCounts.invalidate();
            await utils.getShops.invalidate();
            await utils.getCategories.invalidate();
            await utils.getItemsByCategory.invalidate();
        }
    });

    const handleTogglePublish = async (e: React.MouseEvent, itemId: string) => {
        e.preventDefault();
        const item = items?.find((p) => p.id === itemId);
        const action = item?.published ? 'unpublish' : 'publish';

        if (confirm(`Are you sure you want to ${action} this item?`)) {
            togglePublish.mutate(itemId);
        }
    };

    const handleDelete = async (e: React.MouseEvent, itemId: string) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this item?')) {
            deleteProduct.mutate(itemId);
        }
    };

    const handleBulkToggle = async (providerId: string, action: 'publish' | 'unpublish') => {
        const provider = shopsData?.find((s) => s.id === providerId);
        if (!provider) {
            toast.error('Provider not found');

            return;
        }

        const count = action === 'publish' ? provider.unpublishedProducts : provider.publishedProducts;
        if (count === 0) {
            toast.info(`No items to ${action} for ${provider.name}`);

            return;
        }

        const actionText = action === 'publish' ? 'publish' : 'unpublish';
        if (confirm(`Are you sure you want to ${actionText} ${count} items from ${provider.name}?`)) {
            bulkToggleProducts.mutate({ providerId, action });
        }
    };

    const handleSeedSoldCounts = async (providerId: string) => {
        const provider = shopsData?.find((s) => s.id === providerId);
        if (!provider) {
            toast.error('Provider not found');

            return;
        }

        const message = `Are you sure you want to seed sold counts (2-10) for ${provider.name}? This will update sold counts for all items in this provider.`;
        if (confirm(message)) {
            seedSoldCounts.mutate({ providerId });
        }
    };

    const handleSeedReviews = async (providerId?: string) => {
        const provider = providerId ? shopsData?.find((s) => s.id === providerId) : null;
        const shopName = provider ? provider.name : 'all providers';
        const message = provider
            ? `Are you sure you want to seed 2-3 reviews for ${shopName}? This will create fake reviews for all items in this provider.`
            : 'Are you sure you want to seed 2-3 reviews for all providers? This will create fake reviews for all items.';

        if (confirm(message)) {
            seedReviews.mutate({ providerId });
        }
    };

    const handleFixDuplicateReviews = async () => {
        if (
            confirm(
                'Are you sure you want to fix duplicate reviews? This will DELETE duplicate reviews where the same user has reviewed the same item multiple times. Only the oldest review from each user per item will be kept.'
            )
        ) {
            fixDuplicateReviews.mutate();
        }
    };

    const handleCopySubscriberEmails = async () => {
        try {
            console.log('Starting copy subscriber emails...');
            const result = await refetchSubscriberEmails();
            console.log('Refetch result:', result);

            const emails = result.data || subscriberEmails || [];
            console.log('Emails found:', emails);

            if (!emails || emails.length === 0) {
                toast.info('No subscriber emails found');

                return;
            }

            // Ensure emails is an array of strings
            const emailStrings = Array.isArray(emails)
                ? emails.filter((email) => typeof email === 'string' && email.trim().length > 0)
                : [];
            console.log('Filtered email strings:', emailStrings);

            if (emailStrings.length === 0) {
                toast.info('No valid subscriber emails found');

                return;
            }

            const joined = emailStrings.join(', ');
            console.log('Joined emails string:', joined);

            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(joined);
                console.log('Successfully copied using clipboard API');
            } else {
                console.log('Using fallback copy method');
                const ta = document.createElement('textarea');
                ta.value = joined;
                ta.style.position = 'fixed';
                ta.style.left = '-9999px';
                document.body.appendChild(ta);
                ta.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(ta);
                console.log('Fallback copy successful:', successful);
                if (!successful) {
                    throw new Error('Failed to copy using fallback method');
                }
            }
            toast.success(`Copied ${emailStrings.length} subscriber emails`);
        } catch (err) {
            console.error('Copy emails failed:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
            toast.error(`Failed to copy emails: ${errorMessage}`);
        }
    };

    const handleDeleteAllProducts = async (providerId: string) => {
        const provider = shopsData?.find((s) => s.id === providerId);
        if (!provider) {
            toast.error('Provider not found');

            return;
        }

        if (provider.totalProducts === 0) {
            toast.info(`No items found for ${provider.name}`);

            return;
        }

        const message = `⚠️ DANGER: Are you sure you want to DELETE ALL ${provider.totalProducts} items from ${provider.name}? This action CANNOT be undone and will permanently remove all items, images, and related data.

Type "DELETE" to confirm this destructive action.`;

        const confirmation = prompt(message);
        if (confirmation === 'DELETE') {
            deleteAllProducts.mutate({ providerId });
        } else if (confirmation !== null) {
            toast.error('Deletion cancelled. You must type "DELETE" exactly to confirm.');
        }
    };

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
                <h3 className='text-xl md:text-2xl'>All items</h3>
                <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0'>
                    <Link
                        href='/item/add'
                        className='flex w-full items-center justify-center space-x-2 rounded bg-customPrimary px-4 py-2 text-sm text-white hover:bg-customPrimary/90 sm:w-auto sm:text-base'>
                        <span>+</span>
                        <span>Add Item</span>
                    </Link>
                    <Link
                        href='/item/add/bulk'
                        className='flex w-full items-center justify-center space-x-2 rounded bg-customPrimary px-4 py-2 text-sm text-white hover:hover:bg-customPrimary/90 sm:w-auto sm:text-base'>
                        <span>Bulk Upload</span>
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <SearchAndFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedShop={selectedShop}
                setSelectedShop={setSelectedShop}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                providers={shopsData || []}
            />

            {/* Paginated Table */}
            <PaginatedTable
                items={(items || []) as unknown as ProductWithImageAndRelations[]}
                handleDelete={handleDelete}
                handleTogglePublish={handleTogglePublish}
                searchTerm={searchTerm}
                selectedShop={selectedShop}
                statusFilter={statusFilter}
                seedSingleProductReviews={seedSingleProductReviews}
            />

            <div className='flex flex-col space-y-3 pt-2'>
                {/* Management Links */}
                <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                    <h4 className=' font-semibold'>Manage Tools:</h4>
                    <div className='flex flex-wrap gap-2 text-sm sm:text-base'>
                        <Link href='/promotion/list' className='rounded px-3 '>
                            Promotions
                        </Link>
                        <Link href='/discount/list' className='rounded  px-3 '>
                            Discount
                        </Link>
                        <Link href='/item-review/list' className='rounded  px-3 '>
                            Reviews
                        </Link>
                        <Link href='/item/minimum-order' className='rounded  px-3 '>
                            Minimum Order
                        </Link>
                        <Link href='/category/list' className='rounded  px-3 '>
                            Categories
                        </Link>
                    </div>
                </div>

                {/* Review Tools */}
                <div className='flex flex-col space-y-2 pt-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                    <h4 className=' font-semibold'>Other Tools:</h4>
                    <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0'>
                        <button
                            onClick={() => handleSeedReviews()}
                            disabled={seedReviews.isLoading}
                            className='w-full rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50 sm:w-auto'>
                            {seedReviews.isLoading ? 'Seeding...' : 'Seed All Reviews'}
                        </button>
                        <button
                            onClick={handleFixDuplicateReviews}
                            disabled={fixDuplicateReviews.isLoading}
                            className='w-full rounded bg-orange-600 px-3 py-2 text-sm text-white hover:bg-orange-700 disabled:opacity-50 sm:w-auto'>
                            {fixDuplicateReviews.isLoading ? 'Fixing...' : 'Fix Duplicate Reviews'}
                        </button>
                        <button
                            type='button'
                            onClick={handleCopySubscriberEmails}
                            disabled={isFetchingEmails}
                            className='w-full rounded bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 sm:w-auto'>
                            {isFetchingEmails ? 'Copying…' : 'Copy Subscriber Emails'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Provider-specific bulk actions */}
            {shopsData && shopsData.length > 0 && (
                <div className='rounded-lg pt-2 shadow-sm'>
                    <h4 className='mb-3 font-semibold'>Bulk Actions by Supplier:</h4>
                    <div className='space-y-3'>
                        {shopsData.map((provider) => (
                            <div key={provider.id} className='rounded bg-white p-3 shadow-sm'>
                                {/* Provider Info */}
                                <div className='mb-3 flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0'>
                                    <span className='text-lg font-medium'>{provider.name}</span>
                                    <span className='text-sm text-customPrimary'>
                                        {provider.totalProducts} items ({provider.publishedProducts} published,{' '}
                                        {provider.unpublishedProducts} unpublished)
                                    </span>
                                </div>

                                {/* Buttons Grid - Improved Mobile Layout */}
                                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap lg:gap-2'>
                                    {provider.unpublishedProducts > 0 && (
                                        <button
                                            onClick={() => handleBulkToggle(provider.id, 'publish')}
                                            disabled={bulkToggleProducts.isLoading}
                                            className='flex items-center justify-center space-x-2 rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50 lg:flex-none'>
                                            <FaEye size={12} />
                                            <span className='hidden sm:inline'>Publish All</span>
                                            <span className='sm:hidden'>Publish</span>
                                            <span>({provider.unpublishedProducts})</span>
                                        </button>
                                    )}
                                    {provider.publishedProducts > 0 && (
                                        <button
                                            onClick={() => handleBulkToggle(provider.id, 'unpublish')}
                                            disabled={bulkToggleProducts.isLoading}
                                            className='flex items-center justify-center space-x-2 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 lg:flex-none'>
                                            <FaEyeSlash size={12} />
                                            <span className='hidden sm:inline'>Unpublish All</span>
                                            <span className='sm:hidden'>Unpublish</span>
                                            <span>({provider.publishedProducts})</span>
                                        </button>
                                    )}
                                    {provider.totalProducts > 0 && (
                                        <button
                                            onClick={() => handleSeedSoldCounts(provider.id)}
                                            disabled={seedSoldCounts.isLoading}
                                            className='flex items-center justify-center space-x-2 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 lg:flex-none'>
                                            <FaChartLine size={12} />
                                            <span className='hidden sm:inline'>Seed Sold Counts</span>
                                            <span className='sm:hidden'>Seed Counts</span>
                                        </button>
                                    )}
                                    {provider.totalProducts > 0 && (
                                        <button
                                            onClick={() => handleSeedReviews(provider.id)}
                                            disabled={seedReviews.isLoading}
                                            className='flex items-center justify-center space-x-2 rounded bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 lg:flex-none'>
                                            <FaChartLine size={12} />
                                            <span className='hidden sm:inline'>Seed Reviews</span>
                                            <span className='sm:hidden'>Seed Reviews</span>
                                        </button>
                                    )}
                                    {provider.totalProducts > 0 && (
                                        <button
                                            onClick={() => handleDeleteAllProducts(provider.id)}
                                            disabled={deleteAllProducts.isLoading}
                                            className='flex items-center justify-center space-x-2 rounded bg-red-800 px-3 py-2 text-sm text-white hover:bg-red-900 disabled:opacity-50 lg:flex-none'>
                                            <FaTrashAlt size={12} />
                                            <span className='hidden sm:inline'>Delete All Items</span>
                                            <span className='sm:hidden'>Delete All</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

// Pagination Component
interface PaginatedTableProps {
    items: ProductWithImageAndRelations[];
    handleDelete: (e: React.MouseEvent, itemId: string) => void;
    handleTogglePublish: (e: React.MouseEvent, itemId: string) => void;
    searchTerm: string;
    selectedShop: string;
    statusFilter: string;
    seedSingleProductReviews: {
        mutate: (input: { itemId: string }) => void;
        isLoading: boolean;
    };
}

const PaginatedTable: React.FC<PaginatedTableProps> = ({
    items,
    handleDelete,
    handleTogglePublish,
    searchTerm,
    selectedShop,
    statusFilter,
    seedSingleProductReviews
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10; // 10 items per page

    // Filter items based on search and filters
    const filteredProducts = useMemo(() => {
        return items.filter((item) => {
            const matchesSearch =
                searchTerm === '' ||
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.provider?.name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesShop = selectedShop === '' || item.provider?.id === selectedShop;

            const matchesStatus =
                statusFilter === '' ||
                (statusFilter === 'published' && item.published) ||
                (statusFilter === 'draft' && !item.published);

            return matchesSearch && matchesShop && matchesStatus;
        });
    }, [items, searchTerm, selectedShop, statusFilter]);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedShop, statusFilter]);

    const { paginatedData, totalPages, startIndex, endIndex } = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginated = filteredProducts.slice(start, end);
        const total = Math.ceil(filteredProducts.length / itemsPerPage);

        return {
            paginatedData: paginated,
            totalPages: total,
            startIndex: start + 1,
            endIndex: Math.min(end, filteredProducts.length)
        };
    }, [filteredProducts, currentPage, itemsPerPage]);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages: number[] = [];
        const showPages = 5; // Show 5 page numbers at most

        let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
        const endPage = Math.min(totalPages, startPage + showPages - 1);

        // Adjust if we're near the end
        if (endPage - startPage + 1 < showPages) {
            startPage = Math.max(1, endPage - showPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    if (filteredProducts.length === 0) {
        if (searchTerm || selectedShop || statusFilter) {
            return (
                <div className='py-12 text-center text-gray-500'>
                    <div className='mb-2'>No items match your search criteria.</div>
                    <div className='text-sm'>Try adjusting your search or filters.</div>
                </div>
            );
        }

        return <div className='py-12 text-center text-gray-500'>No items found.</div>;
    }

    return (
        <div className='w-full'>
            {/* Table */}
            <div className='min-w-full overflow-x-auto'>
                <table className='min-w-full border-collapse text-left'>
                    <thead>
                        <tr className='border-b bg-gray-50'>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Image</th>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Name</th>
                            <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 sm:table-cell sm:px-4 sm:text-sm'>
                                Provider
                            </th>
                            <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Price</th>
                            <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 lg:table-cell lg:px-4 lg:text-sm'>
                                Clicks
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
                                <td className='px-2 py-3 sm:px-4'>
                                    <Link href={`/item/${item.id}/${slugify(item.name)}`}>
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={200}
                                                height={200}
                                                className='h-8 w-8 rounded-lg object-cover sm:h-12 sm:w-12'
                                            />
                                        ) : (
                                            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 sm:h-12 sm:w-12'>
                                                <span className='text-xs text-customPrimary'>No Image</span>
                                            </div>
                                        )}
                                    </Link>
                                </td>
                                <td className='px-2 py-3 sm:px-4'>
                                    <Link
                                        className='text-xs hover:text-customPrimary sm:text-sm lg:text-base'
                                        href={`/item/edit/${item.id}`}>
                                        {truncate(item.name, 20)}
                                    </Link>
                                    <div className='block text-xs text-gray-500 sm:hidden'>{item.provider?.name}</div>
                                </td>
                                <td className='hidden px-2 py-3 text-xs text-gray-600 sm:table-cell sm:px-4 sm:text-sm'>
                                    {item.provider?.name}
                                </td>
                                <td className='px-2 py-3 text-xs font-medium sm:px-4 sm:text-sm'>${item.price}</td>
                                <td className='hidden px-2 py-3 text-xs text-gray-600 lg:table-cell lg:px-4 lg:text-sm'>
                                    {item.clickCounts}
                                </td>
                                <td className='px-2 py-3 sm:px-4'>
                                    <div className='flex space-x-1 sm:space-x-3'>
                                        <Link
                                            href={`/item/edit/${item.id}`}
                                            className='rounded p-1 hover:bg-gray-100'>
                                            <FaPencilAlt size={14} className='text-gray-600 sm:size-4' />
                                        </Link>
                                        <button
                                            type='button'
                                            onClick={(e) => handleDelete(e, item.id)}
                                            className='rounded p-1 hover:bg-gray-100'>
                                            <FaTrash size={14} className='text-red-600 sm:size-4' />
                                        </button>
                                        <button
                                            type='button'
                                            onClick={(e) => handleTogglePublish(e, item.id)}
                                            title={item.published ? 'Unpublish' : 'Publish'}
                                            className='rounded p-1 hover:bg-gray-100'>
                                            {item.published ? (
                                                <FaEyeSlash size={14} className='text-yellow-600 sm:size-4' />
                                            ) : (
                                                <FaEye size={14} className='text-green-600 sm:size-4' />
                                            )}
                                        </button>
                                        <button
                                            type='button'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (confirm(`Seed 1-2 reviews for "${item.name}"?`)) {
                                                    seedSingleProductReviews.mutate({ itemId: item.id });
                                                }
                                            }}
                                            title='Seed Reviews (1-2)'
                                            disabled={seedSingleProductReviews.isLoading}
                                            className='rounded p-1 hover:bg-gray-100 disabled:opacity-50'>
                                            <FaStar size={14} className='text-purple-600 sm:size-4' />
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
                    {/* Results info */}
                    <div className='text-sm text-gray-600'>
                        Showing {startIndex}-{endIndex} of {filteredProducts.length} items
                        {(searchTerm || selectedShop || statusFilter) && filteredProducts.length < items.length && (
                            <span className='ml-1 text-gray-400'>({items.length} total)</span>
                        )}
                    </div>

                    {/* Pagination controls */}
                    <div className='flex items-center space-x-1'>
                        {/* Previous button */}
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className='flex items-center justify-center rounded-md border px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50 sm:px-3 sm:py-2'>
                            <FaChevronLeft size={12} />
                            <span className='ml-1 hidden sm:inline'>Previous</span>
                        </button>

                        {/* Page numbers */}
                        <div className='flex space-x-1'>
                            {/* First page if not visible */}
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

                            {/* Visible page numbers */}
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

                            {/* Last page if not visible */}
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

                        {/* Next button */}
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
    selectedShop: string;
    setSelectedShop: (provider: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
    providers: Array<{
        id: string;
        name: string;
        totalProducts: number;
        publishedProducts: number;
        unpublishedProducts: number;
    }>;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
    searchTerm,
    setSearchTerm,
    selectedShop,
    setSelectedShop,
    statusFilter,
    setStatusFilter,
    providers
}) => {
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedShop('');
        setStatusFilter('');
    };

    const hasActiveFilters = searchTerm || selectedShop || statusFilter;

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
                            placeholder='Search by item name or provider...'
                            className='block w-full rounded-md border border-gray-300 py-1 pl-10 pr-3 text-lg placeholder:text-lg focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className='flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0'>
                    <span className='text-sm font-medium text-gray-700 sm:w-20'>Filters:</span>
                    <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0'>
                        {/* Provider Filter */}
                        <select
                            value={selectedShop}
                            onChange={(e) => setSelectedShop(e.target.value)}
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'>
                            <option value=''>All Providers</option>
                            {providers.map((provider) => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.name} ({provider.totalProducts})
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        {/* <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className='rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'>
                            <option value=''>All Status</option>
                            <option value='published'>Published</option>
                            <option value='draft'>Draft</option>
                        </select> */}

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
                        {selectedShop && (
                            <span className='inline-flex items-center space-x-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'>
                                <span>Provider: {providers.find((s) => s.id === selectedShop)?.name}</span>
                                <button onClick={() => setSelectedShop('')} className='hover:text-green-600'>
                                    <FaTimes size={10} />
                                </button>
                            </span>
                        )}
                        {statusFilter && (
                            <span className='inline-flex items-center space-x-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800'>
                                <span>Status: {statusFilter === 'published' ? 'Published' : 'Draft'}</span>
                                <button onClick={() => setStatusFilter('')} className='hover:text-purple-600'>
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
