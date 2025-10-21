'use client';
import React, { useRef, useState } from 'react';
import { toast } from 'react-toastify';

//ui
import { Input } from '@/components/ui/input';
import { compressImage, formatFileSize, isImageFile } from '@/lib/imageCompression';
//icons
import { FaCamera } from 'react-icons/fa';

//types
type ImageUploadProps = {
  refetchProduct: () => void;
  itemId: string;
  productImages?: { url: string; isPrimary: boolean }[]; // Update type here
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

const ImageUpload = ({
  refetchProduct,
  itemId,
  productImages,
}: ImageUploadProps) => {
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
      }

      if (processedFiles.length > 0) {
        // UPLOAD COMPRESSED IMAGES
        const formData = new FormData();
        processedFiles.forEach(file => {
          formData.append('images', file);
          formData.append('itemId', itemId);
          formData.append('isEdit', 'true');
        });
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          toast.success('Images uploaded successfully');
          refetchProduct();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          toast.error(`Upload failed: ${errorData.message || errorData.error || 'Server error'}`);
          console.error('Upload error:', response.status, errorData);
        }
      }
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process images');
      if (e.target) e.target.value = '';
    } finally {
      setIsCompressing(false);
    }
  };

  // Handler for deleting an image
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, itemId }),
      });

      if (response.ok) {
        toast.success('Image deleted successfully');
        refetchProduct(); // Refetch item data after deletion
      } else {
        toast.error('Failed to delete image');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to delete image: ${error.message}`);
      } else {
        toast.error('Failed to delete image due to an unknown error');
      }
    }
  };

  const handleSetAsPrimary = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/set-primary-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, itemId }),
      });

      if (response.ok) {
        toast.success('Image set as primary successfully');
        refetchProduct(); // Refetch item data after setting as primary
      } else {
        toast.error('Failed to set image as primary');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to set image as primary: ${error.message}`);
      } else {
        toast.error('Failed to set image as primary due to an unknown error');
      }
    }
  };

  return (
    <div className='flex space-x-4'>
      {productImages && productImages?.length > 0 && (
        <div className='flex flex-wrap space-x-2'>
          {productImages.map((image, index) => (
            <div key={index}>
              <img
                src={image.url}
                alt='Item Image'
                className='w-20 h-20 object-cover'
              />
              <div className='flex flex-col'>
                <button
                  type='button'
                  onClick={() => handleDeleteImage(image.url)}
                >
                  Delete
                </button>
                {/* set as primary */}
                {!image.isPrimary && (
                  <button
                    type='button'
                    onClick={() => handleSetAsPrimary(image.url)}
                  >
                    Set as primary
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className='relative md:flex md:justify-center'>
        <label htmlFor='image' className={`cursor-pointer ${isCompressing ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className='flex items-center justify-center w-20 h-20 bg-[#dddddd] rounded-md'>
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
        onChange={e => handleFileChange(e)}
      />
    </div>
  );
};

export default ImageUpload;
