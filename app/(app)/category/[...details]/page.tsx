import React from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { serverClient } from '@/app/_trpc/serverClient';
import ItemCard from '@/components/global/ItemCard';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { slugify } from '@/lib/utils';

type CategoryDetailsProps = {
    params: {
        details: string[];
    };
};

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export async function generateMetadata({ params }: CategoryDetailsProps): Promise<Metadata> {
    const categoryId = params.details[0];

    // Get category with items
    const category = await serverClient.getCategoryById(categoryId);

    if (!category) {
        notFound();
    }

    const productCount = category.items?.filter((item) => item.published).length || 0;

    return {
        title: `${category.name} Coffee Equipment - ${productCount} Items | Kofe`,
        description: `Discover our collection of ${category.name.toLowerCase()} coffee equipment. Browse ${productCount} high-quality items for home brewing and outdoor adventures. Free shipping across NZ & AU.`,
        keywords: [
            `${category.name.toLowerCase()} coffee equipment`,
            `buy ${category.name.toLowerCase()} online`,
            `${category.name.toLowerCase()} coffee gear NZ`,
            `${category.name.toLowerCase()} brewing equipment`,
            'coffee equipment New Zealand',
            'coffee gear Australia'
        ],
        openGraph: {
            title: `${category.name} Coffee Equipment | Kofe`,
            description: `Browse our ${category.name.toLowerCase()} collection - ${productCount} premium coffee items with fast shipping to NZ & Australia.`,
            type: 'website',
            url: `${baseUrl}/category/${categoryId}/${slugify(category.name)}`,
            siteName: 'Kofe',
            images: category.image ? [{ url: category.image, alt: category.name }] : []
        }
    };
}

const CategoryDetails = async ({ params }: CategoryDetailsProps) => {
    const categoryId = params.details[0];
    const category = await serverClient.getCategoryById(categoryId);

    if (!category) {
        notFound();
    }

    const publishedProducts = await serverClient.getItemsByCategory(category.name);

    return (
        <section className='container flex flex-col space-y-2 md:space-y-2 lg:space-y-0'>
            <div className='flex pb-3 pt-2 md:justify-between md:px-6  md:pt-0 lg:justify-start lg:pb-5 lg:pl-6'>
                <Breadcrumbs categoryName={category.name} />
            </div>

            <div className='mb-8 px-4 md:px-6 lg:pl-6'>
                <h3 className='mb-6'>{category.name} Coffee Equipment</h3>

                {category.image && (
                    <div className='mb-8 flex '>
                        <img
                            src={category.image}
                            alt={category.name}
                            className='h-32 w-32 object-contain md:h-40 md:w-40'
                        />
                    </div>
                )}

                <p className='mb-8 max-w-3xl'>
                    Explore our curated collection of {category.name.toLowerCase()} coffee equipment. Perfect for both
                    home brewing enthusiasts and outdoor adventure seekers. We offer {publishedProducts.length}{' '}
                    high-quality items in this category with fast shipping across New Zealand and Australia.
                </p>

                <div className='mb-6 flex items-center justify-between border-b border-gray-200 pb-4'>
                    <p className='text-sm text-customPrimary'>
                        Showing {publishedProducts.length} item{publishedProducts.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {publishedProducts.length > 0 ? (
                <div className='grid grid-cols-2 gap-2 px-4  md:grid-cols-3 md:gap-3 md:px-3 lg:grid-cols-4 lg:gap-4 lg:px-6 xl:grid-cols-5'>
                    {publishedProducts.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            ) : (
                <div className='block min-w-full px-4 pt-2 md:px-6 lg:pl-6'>
                    <h3 className='mb-2'>No items available</h3>
                    <p>We&apos;re working on adding items to this category. Check back soon!</p>
                </div>
            )}

            {/* SEO Content Section */}
            <div className='max-w-none px-4 pt-16 md:px-6 lg:pl-6'>
                <h2 className='mb-6'>Why Choose {category.name} Equipment from Kofe?</h2>
                <p className='mb-8'>
                    At Kofe, we specialize in providing premium {category.name.toLowerCase()} coffee equipment for
                    coffee enthusiasts across New Zealand and Australia. Our carefully selected items are perfect for
                    both indoor brewing and outdoor adventures.
                </p>

                <h3 className='mb-4'>Features & Benefits:</h3>
                <ul className='mb-8 ml-6 list-disc space-y-2'>
                    <li>High-quality, durable construction built to last</li>
                    <li>Perfect for home use and outdoor adventures</li>
                    <li>Fast shipping across New Zealand and Australia</li>
                    <li>Competitive prices with excellent customer service</li>
                    <li>Suitable for beginners and experienced coffee enthusiasts</li>
                </ul>

                <h3 className='mb-4'>Shipping & Delivery</h3>
                <p>
                    We offer reliable shipping services across New Zealand and Australia. Most orders are processed
                    within 1-2 business days, with delivery times varying based on your location and selected shipping
                    method.
                </p>
            </div>
        </section>
    );
};

export default CategoryDetails;
