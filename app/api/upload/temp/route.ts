import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

// Configure route for larger file uploads
export const runtime = 'nodejs';
export const maxDuration = 30;

//utils
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
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        console.log('Processing temp image:', imageFile.name, 'Size:', imageFile.size);

        // File size should be pre-compressed on client, but add safety check
        const maxSize = 2 * 1024 * 1024; // 2MB safety limit
        if (imageFile.size > maxSize) {
            return NextResponse.json(
                { error: 'File size exceeds 2MB limit after processing' },
                { status: 400 }
            );
        }

        if (!fileFilter(imageFile)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only images are allowed.' },
                { status: 400 }
            );
        }

        // Convert the file to buffer (following item upload pattern)
        const buffer = await imageFile.arrayBuffer();
        const fileBuffer = Buffer.from(buffer);
        const originalExtension = path.extname(imageFile.name);

        // Prepare parameters for uploadImageToGCS (same as item upload)
        const uploadParams = {
            fileBuffer: fileBuffer,
            contentType: imageFile.type,
            originalExtension: originalExtension,
            imageNamePrefix: 'temp-category',
            destinationFolder: 'uploads/temp/categories',
            fileSize: imageFile.size,
            preserveFormat: true,
        };

        // Upload to Google Cloud Storage in temp folder
        const uploadResult = await uploadImageToGCS(uploadParams);

        // Check if upload was successful (following item pattern)
        if (!uploadResult.success) {
            console.error('Failed to upload image:', uploadResult.message);
            return NextResponse.json(
                { error: uploadResult.message || 'Failed to upload image to storage' },
                { status: 500 }
            );
        }

        console.log('Temp image uploaded successfully:', uploadResult.url);

        return NextResponse.json({
            message: 'Image uploaded successfully',
            imageUrl: uploadResult.url
        });

    } catch (error) {
        console.error('Error in temp image upload:', error);
        return NextResponse.json(
            { error: 'Internal server error during image upload' },
            { status: 500 }
        );
    }
}