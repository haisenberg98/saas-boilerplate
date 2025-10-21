'use client';

import React, { useMemo, useState } from 'react';

import Link from 'next/link';

import { trpc } from '@/app/_trpc/client';
import { truncate } from '@/lib/utils';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { Category, Item } from '@prisma/client';
import { TRPCClientError } from '@trpc/client';

import { FaChevronLeft, FaChevronRight, FaGripVertical, FaPencilAlt, FaSearch, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';

export type CategoryWithProducts = Category & {
    items?: Item[];
};

const DataList = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const utils = trpc.useUtils();
    const { data: categories, refetch } = trpc.getCategories.useQuery(undefined, {
        refetchOnMount: true,
        refetchOnReconnect: true
    });

    const deleteCategory = trpc.deleteCategory.useMutation({
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
            toast.success('Category deleted successfully');
            refetch();
        }
    });

    const updateCategoryOrder = trpc.updateCategoryOrder.useMutation({
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
            toast.success('Category order updated successfully');
            refetch();
        }
    });

    const handleDelete = async (e: React.MouseEvent, categoryId: string) => {
        e.preventDefault();
        if (confirm('Are you sure you want to delete this category?')) {
            deleteCategory.mutate(categoryId);
        }
    };

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !categories) {
            return;
        }

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        if (sourceIndex === destIndex) {
            return;
        }

        // Create a copy of categories sorted by order number
        const sortedCategories = [...categories].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));

        // Reorder the array
        const reorderedCategories = Array.from(sortedCategories);
        const [removed] = reorderedCategories.splice(sourceIndex, 1);
        reorderedCategories.splice(destIndex, 0, removed);

        // Update order numbers based on new positions
        const updatedOrder = reorderedCategories.map((category, index) => ({
            id: category.id,
            orderNumber: index
        }));

        // Call the API to update order
        updateCategoryOrder.mutate(updatedOrder);
    };

    return (
        <section className='w-full space-y-4 px-4 lg:mx-auto lg:max-w-4xl xl:max-w-7xl'>
            <div className='flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0'>
                <h3 className='text-xl md:text-2xl'>All categories</h3>
                <div className='flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0'>
                    <Link
                        href='/category/add'
                        className='flex w-full items-center justify-center space-x-2 rounded bg-customPrimary px-4 py-2 text-sm text-white hover:bg-customPrimary/90 sm:w-auto sm:text-base'>
                        <span>+</span>
                        <span>Add Category</span>
                    </Link>
                </div>
            </div>

            {/* Search */}
            <SearchComponent searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Paginated Table with Drag and Drop */}
            <DragAndDropTable
                categories={(categories || []) as unknown as CategoryWithProducts[]}
                handleDelete={handleDelete}
                searchTerm={searchTerm}
                onDragEnd={handleDragEnd}
                isDragDisabled={!!searchTerm} // Disable drag when searching
            />
        </section>
    );
};

// Drag and Drop Table Component
interface DragAndDropTableProps {
    categories: CategoryWithProducts[];
    handleDelete: (e: React.MouseEvent, categoryId: string) => void;
    searchTerm: string;
    onDragEnd: (result: DropResult) => void;
    isDragDisabled: boolean;
}

const DragAndDropTable: React.FC<DragAndDropTableProps> = ({
    categories,
    handleDelete,
    searchTerm,
    onDragEnd,
    isDragDisabled
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        return categories.filter((category) => {
            const matchesSearch = searchTerm === '' || category.name.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });
    }, [categories, searchTerm]);

    // Sort categories by order number for consistent display
    const sortedCategories = useMemo(() => {
        return [...filteredCategories].sort((a, b) => (a.orderNumber || 0) - (b.orderNumber || 0));
    }, [filteredCategories]);

    // Reset to first page when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const { paginatedData, totalPages, startIndex, endIndex } = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginated = sortedCategories.slice(start, end);
        const total = Math.ceil(sortedCategories.length / itemsPerPage);

        return {
            paginatedData: paginated,
            totalPages: total,
            startIndex: start + 1,
            endIndex: Math.min(end, sortedCategories.length)
        };
    }, [sortedCategories, currentPage, itemsPerPage]);

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

    if (sortedCategories.length === 0) {
        if (searchTerm) {
            return (
                <div className='py-12 text-center text-gray-500'>
                    <div className='mb-2'>No categories match your search criteria.</div>
                    <div className='text-sm'>Try adjusting your search.</div>
                </div>
            );
        }

        return <div className='py-12 text-center text-gray-500'>No categories found.</div>;
    }

    return (
        <div className='w-full'>
            {/* Table */}
            <div className='min-w-full overflow-x-auto'>
                <DragDropContext onDragEnd={onDragEnd}>
                    <table className='min-w-full border-collapse text-left'>
                        <thead>
                            <tr className='border-b bg-gray-50'>
                                {!isDragDisabled && (
                                    <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>
                                        Order
                                    </th>
                                )}
                                <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>Name</th>
                                <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>
                                    Order #
                                </th>
                                <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 sm:table-cell sm:px-4 sm:text-sm'>
                                    Items
                                </th>
                                <th className='hidden px-2 py-3 text-xs font-medium text-gray-700 lg:table-cell lg:px-4 lg:text-sm'>
                                    Created
                                </th>
                                <th className='px-2 py-3 text-xs font-medium text-gray-700 sm:px-4 sm:text-sm'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <Droppable droppableId='categories' isDropDisabled={isDragDisabled}>
                            {(provided, snapshot) => (
                                <tbody
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`bg-white ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}>
                                    {paginatedData.map((item, index) => (
                                        <Draggable
                                            key={item.id}
                                            draggableId={item.id}
                                            index={index}
                                            isDragDisabled={isDragDisabled}>
                                            {(provided, snapshot) => (
                                                <tr
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={`border-b hover:bg-gray-50 ${
                                                        index % 2 === 1 ? 'bg-white' : 'bg-customTransparentPrimary'
                                                    } ${
                                                        snapshot.isDragging
                                                            ? 'shadow-lg ring-2 ring-blue-500 ring-opacity-50'
                                                            : ''
                                                    }`}>
                                                    {!isDragDisabled && (
                                                        <td className='px-2 py-3 sm:px-4'>
                                                            <div
                                                                {...provided.dragHandleProps}
                                                                className='flex cursor-grab items-center justify-center rounded p-1 hover:bg-gray-200 active:cursor-grabbing'>
                                                                <FaGripVertical className='text-gray-400' size={14} />
                                                            </div>
                                                        </td>
                                                    )}
                                                    <td className='px-2 py-3 sm:px-4'>
                                                        <Link
                                                            className='text-xs hover:text-customPrimary sm:text-sm lg:text-base'
                                                            href={`/category/edit/${item.id}`}>
                                                            {truncate(item.name, 30)}
                                                        </Link>
                                                    </td>
                                                    <td className='px-2 py-3 text-xs font-medium sm:px-4 sm:text-sm'>
                                                        {item.orderNumber}
                                                    </td>
                                                    <td className='hidden px-2 py-3 text-xs text-gray-600 sm:table-cell sm:px-4 sm:text-sm'>
                                                        {item.items?.filter((p) => p.published).length || 0}{' '}
                                                        published
                                                    </td>
                                                    <td className='hidden px-2 py-3 text-xs text-gray-600 lg:table-cell lg:px-4 lg:text-sm'>
                                                        {new Date(item.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className='px-2 py-3 sm:px-4'>
                                                        <div className='flex space-x-1 sm:space-x-3'>
                                                            <Link
                                                                href={`/category/edit/${item.id}`}
                                                                className='rounded p-1 hover:bg-gray-100'>
                                                                <FaPencilAlt
                                                                    size={14}
                                                                    className='text-gray-600 sm:size-4'
                                                                />
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
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </tbody>
                            )}
                        </Droppable>
                    </table>
                </DragDropContext>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className='mt-6 flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0'>
                    {/* Results info */}
                    <div className='text-sm text-gray-600'>
                        Showing {startIndex}-{endIndex} of {sortedCategories.length} categories
                        {searchTerm && sortedCategories.length < categories.length && (
                            <span className='ml-1 text-gray-400'>({categories.length} total)</span>
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

// Search Component
interface SearchComponentProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ searchTerm, setSearchTerm }) => {
    const clearSearch = () => {
        setSearchTerm('');
    };

    const hasActiveSearch = searchTerm;

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
                            placeholder='Search by category name...'
                            className='block w-full rounded-md border border-gray-300 py-1 pl-10 pr-3 text-lg placeholder:text-lg focus:border-customPrimary focus:outline-none focus:ring-1 focus:ring-customPrimary'
                        />
                    </div>
                    {/* Clear Search Button */}
                    {hasActiveSearch && (
                        <button
                            onClick={clearSearch}
                            className='flex items-center space-x-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50'>
                            <FaTimes size={12} />
                            <span>Clear</span>
                        </button>
                    )}
                </div>

                {/* Search Notice */}
                {hasActiveSearch && (
                    <div className='text-sm text-gray-600'>⚠️ Drag and drop reordering is disabled while searching</div>
                )}

                {/* Active Search Display */}
                {hasActiveSearch && (
                    <div className='flex flex-wrap gap-2'>
                        <span className='inline-flex items-center space-x-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800'>
                            <span>Search: &quot;{searchTerm}&quot;</span>
                            <button onClick={() => setSearchTerm('')} className='hover:text-blue-600'>
                                <FaTimes size={10} />
                            </button>
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataList;
