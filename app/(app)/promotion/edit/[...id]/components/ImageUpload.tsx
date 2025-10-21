'use client';
import React, { useRef } from 'react';
import { toast } from 'react-toastify';

//ui
import { Input } from '@/components/ui/input';
//icons
import { FaCamera } from 'react-icons/fa';

//types
type ImageUploadProps = {
  refetchData: () => void;
  dataId: string;
  dataImages?: { url: string; isPrimary: boolean }[]; // Update type here
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

const ImageUpload = ({ refetchData, dataId, dataImages }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input

  // Handler for file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }

    //validate image type
    if (!validateImageType(Array.from(e.target.files))) return;

    const files = Array.from(e.target.files);

    //UPLOAD IMAGES
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file); // 'files' is the key, you can change it to 'file' if uploading one by one
        formData.append('dataId', dataId);
        formData.append('isEdit', 'true');
      });
      const response = await fetch('/api/upload-promotion-image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Images uploaded successfully');
        refetchData(); // Refetch the item data after upload
      } else {
        toast.error('Failed to upload images');
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to upload images: ${error.message}`);
      } else {
        toast.error('Failed to upload images due to an unknown error');
      }
    }
  };

  // Handler for deleting an image
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/delete-promotion-image', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, dataId }),
      });

      if (response.ok) {
        toast.success('Image deleted successfully');
        refetchData(); // Refetch item data after deletion
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
      const response = await fetch('/api/set-promotion-primary-image', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, dataId }),
      });

      if (response.ok) {
        toast.success('Image set as primary successfully');
        refetchData(); // Refetch item data after setting as primary
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

  const handleCopyLink = async (imageUrl: string) => {
    try {
      await navigator.clipboard.writeText(imageUrl); // Copy to clipboard
      toast.success('Link copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy the link');
    }
  };

  return (
    <div className='flex space-x-4'>
      {dataImages && dataImages?.length > 0 && (
        <div className='flex flex-wrap space-x-2'>
          {dataImages.map((image, index) => (
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
                {/* get link */}
                <button type='button' onClick={() => handleCopyLink(image.url)}>
                  Copy link
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className='relative md:flex md:justify-center'>
        <label htmlFor='image' className='cursor-pointer'>
          <div className='flex items-center justify-center w-20 h-20 bg-[#dddddd] rounded-md'>
            <FaCamera className='text-2xl text-gray-500' />
          </div>
        </label>
      </div>
      <Input
        id='image'
        name='images'
        type='file'
        multiple
        accept='image/*'
        className='hidden'
        ref={fileInputRef}
        onChange={e => handleFileChange(e)}
      />
    </div>
  );
};

export default ImageUpload;
