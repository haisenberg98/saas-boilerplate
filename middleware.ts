import { NextResponse } from 'next/server';

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
    '/checkout/delivery',
    '/checkout/payment',
    '/orders',
    '/orders/details/:path*',
    '/product/list',
    '/product/add',
    '/product/edit/:path*',
    '/shop/list',
    '/shop/add',
    '/shop/edit/:path*',
    '/searched-keyword/list',
    '/post/list',
    '/post/add',
    '/post/edit/:path*',
    '/product/minimum-order',
    '/searched-keyword/list',
    '/dicount/list',
    '/discount/add',
    '/discount/edit/:path*',
    '/product-review/list',
    '/product-review/add',
    '/product-review/edit/:path*',
    '/promotion/list',
    '/promotion/add',
    '/promotion/edit/:path*'
]);

const isPublicRoute = createRouteMatcher(['/login', '/register']);

export default clerkMiddleware((auth, request) => {
    const { userId } = auth();

    // Protect routes by checking if the user is authenticated
    if (isProtectedRoute(request)) {
        if (!userId) {
            const loginUrl = new URL('/login', request.url);

            return NextResponse.redirect(loginUrl);
        }
    }

    // Redirect authenticated users away from public routes
    if (userId && isPublicRoute(request)) {
        const homeUrl = new URL('/', request.url);

        return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
};
