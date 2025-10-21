import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { paths, revalidateAll } = await request.json();

        if (!paths || !Array.isArray(paths)) {
            return NextResponse.json({ error: 'Paths array is required' }, { status: 400 });
        }

        const revalidatedPaths = [];

        // Revalidate each specified path
        for (const path of paths) {
            if (typeof path === 'string') {
                revalidatePath(path);
                revalidatedPaths.push(path);
                console.log(`Revalidated path: ${path}`);

                // If revalidateAll is true and path is /category, revalidate all category pages
                if (revalidateAll && path === '/category') {
                    revalidatePath('/category/[...details]', 'page');
                    revalidatedPaths.push('/category/[...details] (layout)');
                    console.log('Revalidated all category pages');
                }
            }
        }

        return NextResponse.json({
            message: 'Pages revalidated successfully',
            revalidated: revalidatedPaths,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Revalidation error:', error);

        return NextResponse.json({ error: 'Failed to revalidate pages' }, { status: 500 });
    }
}
