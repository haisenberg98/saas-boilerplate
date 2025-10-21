'use client';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

//ui
import { Input } from '@/components/ui/input';
import { compressImage, formatFileSize, isImageFile } from '@/lib/imageCompression';
//icons
import { FaCamera, FaTrash } from 'react-icons/fa';

//types
type CategoryImageUploadProps = {
    refetchCategory: () => void;
    categoryId: string;
    categoryImage?: string | null;
};

function validateImageType(files: File[]) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only JPEG, PNG, JPG, and WEBP images are allowed');
            return false;
        }
    }

    return true;
}

const CategoryImageUpload = ({
    refetchCategory,
    categoryId,
    categoryImage,
}: CategoryImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Handler for file input change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0]; // Only handle single file for category

        // Validate image type first
        if (!validateImageType([file])) {
            if (e.target) e.target.value = '';
            return;
        }

        setIsCompressing(true);

        try {
            const originalSize = formatFileSize(file.size);

            if (!isImageFile(file)) {
                toast.error(`${file.name} is not a valid image file`);
                setIsCompressing(false);
                return;
            }

            // Show compression start message for files over 2MB
            if (file.size > 2 * 1024 * 1024) {
                toast.info(`Compressing ${file.name} (${originalSize})...`);
            }

            // Compress the image
            const compressedFile = await compressImage(file, {
                maxWidth: 1920,
                maxHeight: 1920,
                quality: 0.80,
                maxSizeMB: 1.8
            });

            const compressedSize = formatFileSize(compressedFile.size);

            // Show compression result for files over 2MB
            if (file.size > 2 * 1024 * 1024) {
                toast.success(`Compressed ${file.name}: ${originalSize} → ${compressedSize}`);
            }

            // UPLOAD COMPRESSED IMAGE
            const formData = new FormData();
            formData.append('image', compressedFile);
            formData.append('categoryId', categoryId);

            const response = await fetch('/api/upload/category', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            toast.success('Category image uploaded successfully');
            refetchCategory();

        } catch (error) {
            console.error('Error uploading category image:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setIsCompressing(false);
            if (e.target) e.target.value = '';
        }
    };

    // Handler for deleting category image
    const handleDeleteImage = async () => {
        if (!categoryImage) return;

        if (!confirm('Are you sure you want to delete this category image?')) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch('/api/upload/category', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    categoryId: categoryId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Delete failed');
            }

            toast.success('Category image deleted successfully');
            refetchCategory();

        } catch (error) {
            console.error('Error deleting category image:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to delete image');
        } finally {
            setIsDeleting(false);
        }
    };

    // Handler for opening file dialog
    const handleImageUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className='space-y-4'>
            <div className='flex items-center justify-between'>
                <h4 className='text-sm font-medium'>Category Image</h4>
                {categoryImage && (
                    <button
                        type='button'
                        onClick={handleDeleteImage}
                        disabled={isDeleting}
                        className='flex items-center space-x-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50'>
                        <FaTrash size={12} />
                        <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                    </button>
                )}
            </div>

            {/* Current Image Display */}
            {categoryImage && (
                <div className='flex justify-center'>
                    <div className='relative h-32 w-32 overflow-hidden rounded-lg border'>
                        <img
                            src={categoryImage}
                            alt='Category'
                            className='h-full w-full object-cover'
                        />
                    </div>
                </div>
            )}

            {/* Upload Section */}
            <div className='flex flex-col items-center space-y-2'>
                <button
                    type='button'
                    onClick={handleImageUploadClick}
                    disabled={isCompressing}
                    className='flex items-center space-x-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-2 text-sm hover:border-customPrimary hover:bg-gray-50 disabled:opacity-50'>
                    <FaCamera />
                    <span>
                        {isCompressing
                            ? 'Processing...'
                            : categoryImage
                            ? 'Change Image'
                            : 'Upload Image'}
                    </span>
                </button>

                <p className='text-xs text-gray-500'>
                    PNG, JPG, JPEG, WEBP up to 2MB
                </p>

                <Input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    onChange={handleFileChange}
                    disabled={isCompressing}
                    className='hidden'
                />
            </div>
        </div>
    );
};

export default CategoryImageUpload;