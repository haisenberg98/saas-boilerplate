/**
 * High-quality client-side image compression utility
 * Compresses images while maintaining visual quality
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  // Preserve PNG files to keep transparency intact. Server-side processing
  // already handles resizing/compression while retaining alpha channels.
  if (file.type === 'image/png') {
    return file;
  }

  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85, // High quality (85%)
    maxSizeMB = 3.5  // Target under 4MB for Vercel
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    img.onload = () => {
      // Calculate optimal dimensions while maintaining aspect ratio
      let { width, height } = calculateDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      canvas.width = width;
      canvas.height = height;

      // Enable high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw image with high quality
      ctx.drawImage(img, 0, 0, width, height);

      // Try different quality levels to meet size target
      compressToTarget(canvas, file.name, quality, maxSizeMB * 1024 * 1024)
        .then(resolve)
        .catch(reject);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
) => {
  let width = originalWidth;
  let height = originalHeight;

  // Only resize if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const aspectRatio = width / height;

    if (width > height) {
      width = maxWidth;
      height = width / aspectRatio;
    } else {
      height = maxHeight;
      width = height * aspectRatio;
    }

    // Ensure we don't exceed either dimension
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
  }

  return { width: Math.round(width), height: Math.round(height) };
};

const compressToTarget = async (
  canvas: HTMLCanvasElement,
  fileName: string,
  initialQuality: number,
  maxSizeBytes: number
): Promise<File> => {
  let quality = initialQuality;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', quality);
    });

    if (!blob) {
      throw new Error('Failed to compress image');
    }

    // If size is acceptable or we've tried enough times, return the file
    if (blob.size <= maxSizeBytes || attempts === maxAttempts - 1) {
      const compressedFile = new File([blob], fileName, {
        type: 'image/jpeg',
        lastModified: Date.now(),
      });
      
      console.log(`Image compressed: ${(blob.size / 1024 / 1024).toFixed(2)}MB (quality: ${Math.round(quality * 100)}%)`);
      return compressedFile;
    }

    // Reduce quality for next attempt
    quality = Math.max(0.1, quality - 0.15);
    attempts++;
  }

  throw new Error('Could not compress image to target size');
};

export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
