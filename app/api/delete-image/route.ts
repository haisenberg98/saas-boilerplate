import { NextRequest, NextResponse } from 'next/server';
import { bucket } from '@/lib/googleStorage';
import prisma from '@/lib/prisma';
import { checkUserRole } from '@/lib/serverUtils';

export async function DELETE(request: NextRequest) {
  try {
    const { imageUrl, itemId } = await request.json();

    const isAdmin = await checkUserRole('ADMIN');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to delete images' },
        { status: 403 }
      );
    }

    if (!imageUrl || !itemId) {
      return NextResponse.json(
        { error: 'Missing image URL or item ID' },
        { status: 400 }
      );
    }

    // Extract the filename from the URL
    const fileName = imageUrl.split('/').pop();
    const filePath = `uploads/items/${fileName}`;

    // Delete the image from Google Cloud Storage
    await bucket.file(filePath).delete();

    // Delete the image from the database
    await prisma.itemImage.deleteMany({
      where: {
        url: imageUrl,
        itemId: itemId,
      },
    });

    return NextResponse.json(
      { message: 'Image deleted successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error deleting image:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
