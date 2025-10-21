'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface BreadcrumbItem {
    name: string;
    href: string;
}

interface BreadcrumbsProps {
    items?: BreadcrumbItem[];
    productName?: string;
    categoryName?: string;
    shopName?: string;
}

const Breadcrumbs = ({ items, productName, categoryName, shopName }: BreadcrumbsProps) => {
    const pathname = usePathname();
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

    // Generate breadcrumbs based on URL if not provided
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        if (items) return items;

        const breadcrumbs: BreadcrumbItem[] = [{ name: 'Home', href: '/' }];

        const segments = pathname.split('/').filter((segment) => segment !== '');

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const href = '/' + segments.slice(0, i + 1).join('/');

            if (segment === 'item' && productName) {
                breadcrumbs.push({
                    name: 'Items',
                    href: '/items'
                });
                if (categoryName) {
                    breadcrumbs.push({
                        name: categoryName,
                        href: `/category/${segments[i + 1] || ''}`
                    });
                }
                breadcrumbs.push({
                    name: productName,
                    href
                });
            } else if (segment === 'category') {
                if (categoryName) {
                    breadcrumbs.push({
                        name: 'Categories',
                        href: '/categories'
                    });
                    breadcrumbs.push({
                        name: categoryName,
                        href
                    });
                }
                // Stop processing remaining segments for category pages
                break;
            } else if (segment === 'provider' && shopName) {
                breadcrumbs.push({
                    name: 'Suppliers',
                    href: '/suppliers'
                });
                breadcrumbs.push({
                    name: shopName,
                    href
                });
            } else if (segment === 'post') {
                breadcrumbs.push({
                    name: 'Blog',
                    href: '/blog'
                });
            } else if (segment === 'categories') {
                breadcrumbs.push({
                    name: 'Categories',
                    href: '/categories'
                });
            } else if (segment.length > 20) {
                // Skip very long segments (likely IDs)
                continue;
            } else {
                // Capitalize first letter for generic segments
                breadcrumbs.push({
                    name: segment.charAt(0).toUpperCase() + segment.slice(1),
                    href
                });
            }
        }

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    // Generate structured data for breadcrumbs
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}${item.href}`
        }))
    };

    if (breadcrumbs.length <= 1) return null;

    return (
        <>
            <Script
                id='breadcrumb-schema'
                type='application/ld+json'
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema)
                }}
            />

            <nav
                aria-label='Breadcrumb'
                className='flex px-4 pb-3 md:justify-between md:pl-0 md:pt-0 lg:justify-start lg:px-0 lg:pb-5'>
                {/* Mobile optimized breadcrumbs - show only first and last on very small screens */}
                <ol className='flex w-full items-center space-x-1 text-xs text-customPrimary sm:text-sm'>
                    {breadcrumbs.length > 2 ? (
                        <>
                            {/* Always show first breadcrumb */}
                            <li className='flex items-center'>
                                <Link
                                    href={breadcrumbs[0].href}
                                    className='text-customPrimary hover:text-customPrimary hover:underline'
                                    title={breadcrumbs[0].name}>
                                    {breadcrumbs[0].name}
                                </Link>
                            </li>
                            
                            {/* Show middle items on larger screens, ellipsis on mobile */}
                            {breadcrumbs.length > 3 && (
                                <>
                                    <li className='flex items-center'>
                                        <svg
                                            className='mx-1 h-3 w-3 flex-shrink-0 text-customPrimary'
                                            aria-hidden='true'
                                            fill='currentColor'
                                            viewBox='0 0 20 20'>
                                            <path
                                                fillRule='evenodd'
                                                d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                                                clipRule='evenodd'
                                            />
                                        </svg>
                                        <span className='hidden sm:inline'>
                                            <Link
                                                href={breadcrumbs[1].href}
                                                className='text-customPrimary hover:text-customPrimary hover:underline'
                                                title={breadcrumbs[1].name}>
                                                {breadcrumbs[1].name}
                                            </Link>
                                        </span>
                                        <span className='sm:hidden text-gray-400'>...</span>
                                    </li>
                                </>
                            )}
                            
                            {breadcrumbs.length === 3 && (
                                <li className='flex items-center'>
                                    <svg
                                        className='mx-1 h-3 w-3 flex-shrink-0 text-customPrimary'
                                        aria-hidden='true'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'>
                                        <path
                                            fillRule='evenodd'
                                            d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                    <Link
                                        href={breadcrumbs[1].href}
                                        className='truncate text-customPrimary hover:text-customPrimary hover:underline'
                                        title={breadcrumbs[1].name}>
                                        {breadcrumbs[1].name}
                                    </Link>
                                </li>
                            )}
                            
                            {/* Always show last breadcrumb */}
                            <li className='flex items-center'>
                                <svg
                                    className='mx-1 h-3 w-3 flex-shrink-0 text-customPrimary'
                                    aria-hidden='true'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'>
                                    <path
                                        fillRule='evenodd'
                                        d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                <span className='truncate text-sm font-medium text-customPrimary sm:text-base lg:text-lg' title={breadcrumbs[breadcrumbs.length - 1].name}>
                                    {breadcrumbs[breadcrumbs.length - 1].name}
                                </span>
                            </li>
                        </>
                    ) : (
                        /* For 2 or fewer items, show all */
                        breadcrumbs.map((breadcrumb, index) => (
                            <li key={breadcrumb.href} className='flex items-center'>
                                {index > 0 && (
                                    <svg
                                        className='mx-1 h-3 w-3 flex-shrink-0 text-customPrimary'
                                        aria-hidden='true'
                                        fill='currentColor'
                                        viewBox='0 0 20 20'>
                                        <path
                                            fillRule='evenodd'
                                            d='M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z'
                                            clipRule='evenodd'
                                        />
                                    </svg>
                                )}
                                {index === breadcrumbs.length - 1 ? (
                                    <span className='truncate text-sm font-medium text-customPrimary sm:text-base lg:text-lg' title={breadcrumb.name}>
                                        {breadcrumb.name}
                                    </span>
                                ) : (
                                    <Link
                                        href={breadcrumb.href}
                                        className='truncate text-customPrimary hover:text-customPrimary hover:underline'
                                        title={breadcrumb.name}>
                                        {breadcrumb.name}
                                    </Link>
                                )}
                            </li>
                        ))
                    )}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumbs;
