import React from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { serverClient } from '@/app/_trpc/serverClient';
import { slugify } from '@/lib/utils';

//components
import Details from './components/Details';
import { Item, WithContext } from 'schema-dts';

type ProductDetailsProps = {
    params: {
        details: string[];
    };
};

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export async function generateMetadata({ params }: ProductDetailsProps): Promise<Metadata> {
    const itemId = params.details[0];
    const data = await serverClient.getProductById(itemId);
    const productName = data?.name || '';
    const productDescription = data?.description || '';

    if (!data) {
        notFound();
    }

    return {
        title: data?.name ? `${data.name}` : 'Item Details',
        // You can add other metadata properties dynamically if needed
        description: productDescription,
        keywords: [
            // General keywords from your homepage
            'outdoor coffee equipment',
            'portable coffee makers',
            'home coffee brewing equipment',
            'buy coffee equipment online',
            'high-quality coffee gear',
            // Item-specific keywords
            productName,
            productDescription,
            `${productName} for outdoor coffee brewing`,
            `buy ${productName} online`,
            `${productName} reviews`
        ],
        openGraph: {
            description: productDescription,
            title: productName,
            type: 'website',
            url: `${baseUrl}/item/${itemId}/${slugify(productName)}`,
            siteName: 'Kofe',
            images: [
                {
                    url: data?.image || '',
                    alt: productName
                }
            ]
        }
    };
}

const ProductDetails = async ({ params }: ProductDetailsProps) => {
    const itemId = params.details[0];
    const data = await serverClient.getProductById(itemId);

    // Calculate average rating and review count
    const reviewCount = data?.reviews?.length || 0;
    const ratingValue =
        reviewCount > 0 && data?.reviews
            ? data.reviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
            : 0;

    // Construct JSON-LD structured data
    const jsonLd: WithContext<Item> = {
        '@context': 'https://schema.org',
        '@type': 'Item',

        name: data?.name || '',
        image: data?.image || '',
        description: data?.description || '',
        brand: {
            '@type': 'Brand',
            name: 'Kofe'
        },
        offers: {
            '@type': 'Offer',
            url: `${process.env.NEXT_PUBLIC_DOMAIN}/items/${itemId}/${slugify(data?.name || '')}`,
            priceCurrency: 'NZD',
            price: data?.price || '',
            itemCondition: 'https://schema.org/NewCondition',
            availability: 'https://schema.org/InStock'
        },
        aggregateRating:
            reviewCount > 0
                ? {
                      '@type': 'AggregateRating',
                      ratingCount: ratingValue, // Ensure it's passed as a string for JSON-LD
                      ratingValue: ratingValue.toFixed(1),
                      reviewCount: reviewCount // Pass reviewCount as a number, not a string
                  }
                : undefined, // Only add aggregateRating if there are reviews
        review: data?.reviews
            ?.filter((review) => review.user.firstName !== null) // Filter out reviews with null names
            .map((review) => ({
                '@type': 'Review',
                author: {
                    '@type': 'Person',
                    name: review.user.firstName as string // Ensure name is a string
                },
                reviewRating: {
                    '@type': 'Rating',
                    ratingValue: review.rating.toString() // Pass ratingValue as a string
                },
                reviewBody: review.review
            }))
    };

    return (
        <>
            <Script
                id='item-schema'
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Details initialProduct={data} itemId={itemId} />
        </>
    );
};

export default ProductDetails;
