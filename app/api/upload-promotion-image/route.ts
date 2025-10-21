import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import prisma from '@/lib/prisma';

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
    const dataId = formData.get('dataId') as string;
    const isEdit = formData.get('isEdit') as string;

    const data = await prisma.post.findUnique({
      where: { id: dataId },
      select: { title: true },
    });

    const dataName = slugify(data?.title || 'promotion');

    // Collect all upload promises
    const uploadPromises: Promise<any>[] = [];

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log('Processing file:', value.name);

        // Convert the file to buffer
        const buffer = await value.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const originalExtension = path.extname(value.name);


        if (!fileFilter(value)) {
          return NextResponse.json(
            { error: 'Invalid file type' },
            { status: 400 }
          );
        }

        // Prepare parameters for uploadImageToGCS
        const uploadParams = {
          fileBuffer: fileBuffer,
          contentType: value.type,
          originalExtension: originalExtension,
          imageNamePrefix: dataName || 'promotion',
          destinationFolder: 'uploads/promotions',
          fileSize: value.size,
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
        return prisma.promotionImages.create({
          data: {
            url: uploadResult.url!,
            promotionId: dataId,
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
      { message: 'Data added and image uploaded successfully' },
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
