'use server';
import path from 'path';
import sharp from 'sharp';
import prisma from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

// File filter function to check if file is an image
export const fileFilter = (file: File) => {
  // Define allowed file types
  const filetypes = /jpeg|jpg|png|webp/;
  // Check file extension
  const extname = filetypes.test(path.extname(file.name).toLowerCase());
  // Check MIME type
  const mimetype = filetypes.test(file.type);

  return extname && mimetype;
};

// This function now accepts a buffer and returns a compressed buffer
export const compressImage = async (buffer: Buffer) => {
  try {
    const compressedBuffer = await sharp(buffer)
      .rotate() // Automatically adjust orientation based on EXIF data
      .resize(1920, 1920, { 
        fit: 'inside', 
        withoutEnlargement: true 
      }) // Resize to max 1920x1920 while maintaining aspect ratio
      .jpeg({ 
        quality: 80, // Higher quality for better image retention
        progressive: true, // Progressive JPEG for faster web loading
        mozjpeg: true // Use mozjpeg encoder for better compression
      })
      .toBuffer();
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

// New function that preserves original format
export const compressImagePreserveFormat = async (buffer: Buffer, originalContentType: string) => {
  try {
    const baseSharp = sharp(buffer, { animated: true });
    const metadata = await baseSharp.metadata();
    const format = metadata.format?.toLowerCase();

    let sharpInstance = sharp(buffer, { animated: true });

    if (format === 'png') {
      const needsResize =
        metadata.width !== undefined &&
        metadata.height !== undefined &&
        (metadata.width > 1920 || metadata.height > 1920);

      if (!needsResize) {
        return buffer;
      }

      sharpInstance = sharpInstance
        .ensureAlpha()
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png({
          force: true,
          compressionLevel: 9,
          adaptiveFiltering: true,
          palette: false,
        })
        .withMetadata();
    } else if (format === 'webp' || originalContentType === 'image/webp') {
      sharpInstance = sharpInstance
        .rotate() // Automatically adjust orientation based on EXIF data
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({
          quality: 80
        });
    } else {
      // Default to JPEG for all other formats (including JPEG)
      sharpInstance = sharpInstance
        .rotate() // Automatically adjust orientation based on EXIF data
        .resize(1920, 1920, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 80,
          progressive: true,
          mozjpeg: true
        });
    }

    const compressedBuffer = await sharpInstance.toBuffer();
    return compressedBuffer;
  } catch (error) {
    console.error('Error compressing image:', error);
    throw new Error('Failed to compress image');
  }
};

// Function to check if a user has a specific role
export async function checkUserRole(
  role: 'ADMIN' | 'USER' | 'MODERATOR'
): Promise<boolean> {
  const currentUserData = await currentUser();
  const email = currentUserData?.primaryEmailAddress?.emailAddress || '';
  const user = await prisma.user.findUnique({
    where: { email: email },
    select: { role: true },
  });

  // Check if the user exists and has the specified role
  return user?.role === role;
}
