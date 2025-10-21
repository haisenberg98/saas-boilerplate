'use client';
import React, { useRef } from 'react';
import { toast } from 'react-toastify';

import { Input } from '@/components/ui/input';

//types
type ImageUploadProps = {
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
};
//icons
import { FaCamera } from 'react-icons/fa';

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
  imagePreviews,
  setImagePreviews,
  setSelectedFiles,
}: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Ref for the file input
  // Handler for file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    //validate image type
    if (!validateImageType(Array.from(e.target.files))) return;

    const files = Array.from(e.target.files);
    const newPreviews = files.map(file => URL.createObjectURL(file));

    // Append new previews to existing ones
    setImagePreviews(prevPreviews => [...prevPreviews, ...newPreviews]);
    setSelectedFiles(prevFiles => [...prevFiles, ...files]); // Store files for later upload
  };

  // Handler for deleting an image preview
  const handleDeleteImage = (index: number) => {
    setImagePreviews(prevPreviews => {
      const updatedPreviews = [...prevPreviews];
      const removedPreview = updatedPreviews.splice(index, 1);

      // Clean up memory for the specific deleted image
      URL.revokeObjectURL(removedPreview[0]);

      return updatedPreviews;
    });

    setSelectedFiles(prevFiles => {
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
              <img
                key={index}
                src={preview}
                alt='preview'
                className='w-20 h-20 object-cover'
              />
              <button onClick={() => handleDeleteImage(index)}>Delete</button>
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
