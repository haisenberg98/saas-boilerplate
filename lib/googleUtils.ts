'use server';
import { bucket } from '@/lib/googleStorage';
import { compressImage, compressImagePreserveFormat } from '@/lib/serverUtils';

type UploadResponse = {
  success: boolean;
  url?: string;
  message?: string;
};

type UploadImageToGCSParams = {
  fileBuffer: Buffer;
  contentType: string;
  imageNamePrefix: string;
  originalExtension: string;
  destinationFolder: string;
  fileSize: number;
  preserveFormat?: boolean; // New optional parameter
};

export const uploadImageToGCS = async ({
  fileBuffer,
  contentType,
  imageNamePrefix,
  originalExtension,
  destinationFolder,
  fileSize,
  preserveFormat = false,
}: UploadImageToGCSParams): Promise<UploadResponse> => {
  try {
    // Use format-preserving compression if requested, otherwise default compression
    const compressedBuffer = preserveFormat
      ? await compressImagePreserveFormat(fileBuffer, contentType)
      : await compressImage(fileBuffer);

    const timestamp = Date.now();
    const formattedImageName = `${imageNamePrefix
      .replace(/\s+/g, '-')
      .toLowerCase()}-${timestamp}${originalExtension}`;
    const gcsFileName = `${destinationFolder}/${formattedImageName}`;

    const blob = bucket.file(gcsFileName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: { contentType },
    });

    return new Promise<UploadResponse>((resolve, reject) => {
      blobStream.on('error', (error: Error) => {
        console.error('Stream error:', error);
        resolve({
          success: false,
          message: 'Upload failed due to a stream error.',
        });
      });

      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          console.log(`File ${gcsFileName} uploaded and made public.`);
          resolve({
            success: true,
            url: `https://storage.googleapis.com/${bucket.name}/${gcsFileName}`,
          });
        } catch (error) {
          if (error instanceof Error) {
            console.error('Make public error:', error);
            resolve({
              success: false,
              message: 'Uploaded but failed to make the image public.',
            });
          } else {
            console.error(
              'Unknown error occurred while making the file public'
            );
            resolve({
              success: false,
              message:
                'Uploaded but failed to make the image public due to an unknown error.',
            });
          }
        }
      });

      blobStream.end(compressedBuffer);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Upload error:', error);
      return {
        success: false,
        message: `Failed to upload image: ${error.message}`,
      };
    } else {
      console.error('Unknown error during upload');
      return {
        success: false,
        message: 'Failed to upload image due to an unknown error.',
      };
    }
  }
};
