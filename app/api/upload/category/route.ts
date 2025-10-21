import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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
        const categoryId = formData.get('categoryId') as string;
        const imageFile = formData.get('image') as File;

        if (!categoryId) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        if (!imageFile) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { name: true, image: true },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        const categoryName = slugify(category.name || 'category');

        console.log('Processing category image:', imageFile.name, 'Size:', imageFile.size);

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
            imageNamePrefix: categoryName || 'category',
            destinationFolder: 'uploads/categories',
            fileSize: imageFile.size,
            preserveFormat: true,
        };

        // Upload to Google Cloud Storage
        const uploadResult = await uploadImageToGCS(uploadParams);

        // Check if upload was successful (following item pattern)
        if (!uploadResult.success) {
            console.error('Failed to upload image:', uploadResult.message);
            return NextResponse.json(
                { error: uploadResult.message || 'Failed to upload image to storage' },
                { status: 500 }
            );
        }

        // Delete old image from Google Cloud Storage if it exists
        if (category?.image) {
            try {
                // Extract filename from URL
                const oldImageUrl = category.image;
                if (oldImageUrl.includes('storage.googleapis.com')) {
                    const urlParts = oldImageUrl.split('/');
                    const bucketName = urlParts[urlParts.indexOf('storage.googleapis.com') + 1];
                    const fileName = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');

                    // Delete from Google Cloud Storage
                    const { bucket } = await import('@/lib/googleStorage');
                    await bucket.file(fileName).delete();
                    console.log('Old category image deleted from storage:', fileName);
                }
            } catch (error) {
                console.error('Failed to delete old image from storage:', error);
                // Continue with update even if deletion fails
            }
        }

        // Update category with new image URL
        await prisma.category.update({
            where: { id: categoryId },
            data: {
                image: uploadResult.url,
                updatedAt: new Date()
            }
        });

        console.log('Category image uploaded successfully:', uploadResult.url);

        // Revalidate cached pages that display category imagery
        revalidatePath('/');
        revalidatePath('/categories');
        revalidatePath(`/category/${categoryId}/${categoryName}`);

        return NextResponse.json({
            message: 'Category image uploaded successfully',
            imageUrl: uploadResult.url
        });

    } catch (error) {
        console.error('Error in category image upload:', error);
        return NextResponse.json(
            { error: 'Internal server error during category image upload' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const isAdmin = await checkUserRole('ADMIN');

        if (!isAdmin) {
            return NextResponse.json(
                { error: 'You do not have permission to delete files here' },
                { status: 403 }
            );
        }

        const { categoryId } = await request.json();

        if (!categoryId) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        // Update category to remove image
        const updatedCategory = await prisma.category.update({
            where: { id: categoryId },
            data: {
                image: null,
                updatedAt: new Date()
            },
            select: { name: true }
        });

        console.log('Category image deleted successfully for category:', categoryId);

        // Revalidate cached pages to remove stale category imagery
        revalidatePath('/');
        revalidatePath('/categories');
        const categorySlug = slugify(updatedCategory?.name || 'category');
        revalidatePath(`/category/${categoryId}/${categorySlug}`);

        return NextResponse.json({
            message: 'Category image deleted successfully'
        });

    } catch (error) {
        console.error('Error in category image deletion:', error);
        return NextResponse.json(
            { error: 'Internal server error during category image deletion' },
            { status: 500 }
        );
    }
}
