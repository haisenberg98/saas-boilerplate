import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUserRole } from '@/lib/serverUtils';

export async function PUT(request: NextRequest) {
  try {
    const { imageUrl, dataId } = await request.json();

    const isAdmin = await checkUserRole('ADMIN');

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'You do not have permission to update image' },
        { status: 403 }
      );
    }

    if (!imageUrl || !dataId) {
      return NextResponse.json(
        { error: 'Missing image URL or item ID' },
        { status: 400 }
      );
    }

    // Set the specified image as primary and reset others to not primary
    await prisma.$transaction([
      prisma.postImages.updateMany({
        where: { postId: dataId },
        data: { isPrimary: false },
      }),
      prisma.postImages.updateMany({
        where: { postId: dataId, url: imageUrl },
        data: { isPrimary: true },
      }),
    ]);

    return NextResponse.json(
      { message: 'Primary image set successfully' },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error setting primary image:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
