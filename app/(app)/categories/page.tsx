import React from 'react';

import type { Metadata } from 'next';
import Link from 'next/link';

import { serverClient } from '@/app/_trpc/serverClient';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { slugify } from '@/lib/utils';

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export const metadata: Metadata = {
    title: 'Coffee Equipment Categories - Browse by Type | Kofe',
    description:
        'Explore our coffee equipment categories including grinders, espresso machines, brewing accessories, and more. Find the perfect gear for your coffee journey.',
    keywords: [
        'coffee equipment categories',
        'coffee gear types',
        'espresso equipment',
        'coffee grinders',
        'brewing accessories',
        'portable coffee makers',
        'coffee equipment NZ',
        'coffee gear Australia'
    ],
    openGraph: {
        title: 'Coffee Equipment Categories | Kofe',
        description:
            'Browse our coffee equipment by category. From portable brewing gear to professional espresso equipment.',
        type: 'website',
        url: `${baseUrl}/categories`,
        siteName: 'Kofe'
    }
};

const CategoriesPage = async () => {
    // Get all categories with item counts
    const categories = await serverClient.getCategories();

    return (
        <section className='container flex flex-col space-y-2 md:space-y-2 lg:space-y-0'>
            <div className='flex pb-3 pt-2 md:justify-between md:px-6  md:pt-0 lg:justify-start lg:pb-5 lg:pl-6'>
                <Breadcrumbs />
            </div>

            <div className='mb-8 px-4 md:px-6 lg:pl-6'>
                <h3 className='mb-6'>Coffee Equipment Categories</h3>
                <p className='mb-8 max-w-3xl'>
                    Browse our complete range of coffee equipment organized by category. Whether you&apos;re looking for
                    portable gear for outdoor adventures or professional equipment for home brewing, we have everything
                    you need.
                </p>
            </div>

            {categories && categories.length > 0 ? (
                <div className='grid grid-cols-2 gap-2 px-4  md:grid-cols-3 md:gap-3 md:px-3 lg:grid-cols-4 lg:gap-4  xl:grid-cols-5'>
                    {categories.map((category) => {
                        const productCount = category.items?.filter((p) => p.published).length || 0;

                        return (
                            <Link
                                key={category.id}
                                href={`/category/${category.id}/${slugify(category.name)}`}
                                className='flex flex-col items-center text-center'>
                                <div className='mb-2 flex h-28 w-28 items-center justify-center rounded-lg bg-customSecondary p-4 md:h-32 md:w-32 md:p-4'>
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className='h-full w-full object-contain'
                                        />
                                    ) : (
                                        <div className='flex h-full w-full items-center justify-center'>
                                            <span className='text-xs text-customPrimary'>No Icon</span>
                                        </div>
                                    )}
                                </div>

                                <div className='space-y-1'>
                                    <h4 className='line-clamp-2 font-medium leading-tight'>{category.name}</h4>
                                    <span className='text-sm text-customPrimary'>
                                        {productCount} item{productCount !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className='block min-w-full px-4 pt-2 md:px-6 lg:pl-6'>
                    <p>No categories available. We&apos;re setting up our item categories. Check back soon!</p>
                </div>
            )}

            {/* SEO Content Section */}
            <div className='max-w-none px-4 pt-16 md:px-6 lg:pl-6'>
                <h2 className='mb-6'>Find the Perfect Coffee Equipment for Your Needs</h2>
                <p className='mb-8'>
                    At Kofe, we organize our premium coffee equipment into easy-to-browse categories, making it simple
                    to find exactly what you&apos;re looking for. Whether you&apos;re a beginner just starting your
                    coffee journey or an experienced enthusiast looking to upgrade your setup, our categories help you
                    discover the perfect gear.
                </p>

                <h3 className='mb-4'>Popular Categories:</h3>
                <ul className='mb-8 ml-6 list-disc space-y-2'>
                    <li>
                        <span className='font-bold'>Portable Coffee Makers</span> - Perfect for camping, hiking, and
                        travel
                    </li>
                    <li>
                        <span className='font-bold'>Coffee Grinders</span> - From manual travel grinders to electric
                        burr grinders
                    </li>
                    <li>
                        <span className='font-bold'>Espresso Equipment</span> - Everything you need for café-quality
                        espresso at home
                    </li>
                    <li>
                        <span className='font-bold'>Brewing Accessories</span> - Scales, filters, and other essential
                        tools
                    </li>
                    <li>
                        <span className='font-bold'>French Press & Pour Over</span> - Classic brewing methods for rich,
                        flavorful coffee
                    </li>
                </ul>

                <h3 className='mb-4'>Why Provider by Category?</h3>
                <p>
                    Shopping by category helps you compare similar items and find the best option for your specific
                    needs and budget. Each category page includes detailed item information, customer reviews, and
                    expert recommendations to help you make an informed decision.
                </p>
            </div>
        </section>
    );
};

export default CategoriesPage;
