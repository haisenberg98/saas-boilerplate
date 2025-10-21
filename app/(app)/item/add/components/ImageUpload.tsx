'use client';

import React, { useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { compressImage, formatFileSize, isImageFile } from '@/lib/imageCompression';

//icons
import { FaCamera } from 'react-icons/fa';
import { toast } from 'react-toastify';

//types
type ImageUploadProps = {
    imagePreviews: string[];
    setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
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

const ImageUpload = ({ imagePreviews, setImagePreviews, setSelectedFiles }: ImageUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // Handler for file input change
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const files = Array.from(e.target.files);

        // Validate image types first
        if (!validateImageType(files)) {
            if (e.target) e.target.value = '';
            return;
        }

        setIsCompressing(true);
        
        try {
            const processedFiles: File[] = [];
            const newPreviews: string[] = [];

            for (const file of files) {
                const originalSize = formatFileSize(file.size);
                
                if (!isImageFile(file)) {
                    toast.error(`${file.name} is not a valid image file`);
                    continue;
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

                processedFiles.push(compressedFile);
                newPreviews.push(URL.createObjectURL(compressedFile));
            }

            if (processedFiles.length > 0) {
                setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
                setSelectedFiles((prevFiles) => [...prevFiles, ...processedFiles]);
            }

        } catch (error) {
            console.error('Error processing images:', error);
            toast.error('Failed to process images');
            if (e.target) e.target.value = '';
        } finally {
            setIsCompressing(false);
        }
    };

    // Handler for deleting an image preview
    const handleDeleteImage = (index: number) => {
        setImagePreviews((prevPreviews) => {
            const updatedPreviews = [...prevPreviews];
            const removedPreview = updatedPreviews.splice(index, 1);

            // Clean up memory for the specific deleted image
            URL.revokeObjectURL(removedPreview[0]);

            return updatedPreviews;
        });

        setSelectedFiles((prevFiles) => {
            const updatedFiles = [...prevFiles];
            updatedFiles.splice(index, 1); // Remove the file as well

            return updatedFiles;
        });
    };

    return (
        <div className='flex space-x-4'>
            {imagePreviews.length > 0 && (
                <div className='flex flex-wrap space-x-2'>
                    {imagePreviews.map((preview, index) => (
                        <div key={index}>
                            <img key={index} src={preview} alt='preview' className='h-20 w-20 object-cover' />
                            <button onClick={() => handleDeleteImage(index)}>Delete</button>
                        </div>
                    ))}
                </div>
            )}
            <div className='relative md:flex md:justify-center'>
                <label htmlFor='image' className={`cursor-pointer ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className='flex h-20 w-20 items-center justify-center rounded-md bg-customGray'>
                        {isCompressing ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-500"></div>
                        ) : (
                            <FaCamera className='text-2xl text-gray-500' />
                        )}
                    </div>
                </label>
            </div>
            <Input
                id='image'
                name='images'
                type='file'
                multiple
                accept='image/jpeg,image/jpg,image/png,image/webp'
                className='hidden'
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e)}
            />
        </div>
    );
};

export default ImageUpload;
