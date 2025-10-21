import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import prisma from '@/lib/prisma';

// Configure route for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 30;

//utils
import { slugify } from '@/lib/utils';
import { fileFilter, checkUserRole } from '@/lib/serverUtils';
import { uploadImageToGCS } from '@/lib/googleUtils';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkUserRole('ADMIN');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to upload file here' },
        { status: 403 }
      );
    }
    const formData = await request.formData();
    const itemId = formData.get('itemId') as string;
    const isEdit = formData.get('isEdit') as string;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: { name: true },
    });

    const productName = slugify(item?.name || 'item');

    // Collect all upload promises
    const uploadPromises: Promise<any>[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log('Processing file:', value.name, 'Size:', value.size);

        // File size should be pre-compressed on client, but add safety check
        const maxSize = 2 * 1024 * 1024; // 2MB safety limit
        if (value.size > maxSize) {
          return NextResponse.json(
            { error: 'File size exceeds 2MB limit after processing' },
            { status: 400 }
          );
        }

        if (!fileFilter(value)) {
          return NextResponse.json(
            { error: 'Invalid file type' },
            { status: 400 }
          );
        }

        // Convert the file to buffer
        const buffer = await value.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const originalExtension = path.extname(value.name);

        // Prepare parameters for uploadImageToGCS
        const uploadParams = {
          fileBuffer: fileBuffer,
          contentType: value.type,
          originalExtension: originalExtension,
          imageNamePrefix: productName || 'item',
          destinationFolder: 'uploads/items',
          fileSize: value.size,
          preserveFormat: true,
        };

        // Add upload promise to the array
        uploadPromises.push(uploadImageToGCS(uploadParams));
      } else {
        // If the entry is not a File, skip it
        console.warn('Skipping non-file entry:', key, value);
        continue;
      }
    }

    // Wait for all uploads to finish
    const uploadResults = await Promise.all(uploadPromises);

    // Check upload results and save URLs to ProductImages table
    const imageSavePromises = uploadResults.map(async (uploadResult, index) => {
      if (uploadResult.success) {
        return prisma.itemImage.create({
          data: {
            url: uploadResult.url!,
            itemId: itemId,
            isPrimary: isEdit ? false : index === 0, // Only set the first image as primary if it's not an edit
          },
        });
      } else {
        console.error('Failed to upload image:', uploadResult.message);
        throw new Error('Failed to upload one or more images');
      }
    });

    // Wait for all image saves to complete
    await Promise.all(imageSavePromises);

    return NextResponse.json(
      { message: 'Item added and images uploaded successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Internal Error: ', err);
    return NextResponse.json(
      {
        error: `Internal Server Error: ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
