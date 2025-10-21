import React from 'react';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Script from 'next/script';

import { serverClient } from '@/app/_trpc/serverClient';
//utils
import { slugify, stripTags, stripTagsAndExtractText } from '@/lib/utils';

//components
import Details from './components/Details';
import { Action, Article, BlogPosting, NewsArticle, WithContext } from 'schema-dts';

type PostDetailsProps = {
    params: {
        details: string[];
    };
};

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export async function generateMetadata({ params }: PostDetailsProps): Promise<Metadata> {
    const dataId = params.details[0];
    const data = await serverClient.getPostById(dataId);
    const dataName = data?.title || '';
    const postDescription = data?.content || '';

    if (!data) {
        notFound();
    }

    // Strip tags and extract part of the text for SEO purposes
    const cleanDescription = stripTagsAndExtractText(postDescription, 160);

    return {
        title: dataName ? `${dataName}` : 'Post',
        // You can add other metadata properties dynamically if needed
        description: cleanDescription, //need to remove tag from content
        keywords: [
            'coffee',
            'equipment',
            'supplies',
            'buy coffee equipment',
            'sell coffee equipment',
            'outdoor coffee gear',
            'home coffee brewing equipment',
            'new zealand coffee equipment',
            dataName
        ],
        openGraph: {
            description: cleanDescription,
            title: dataName,
            type: 'article',
            url: `${baseUrl}/post/${dataId}/${slugify(dataName)}`,
            siteName: 'Kofe',
            images: [
                {
                    url: data?.image || '',
                    alt: dataName
                }
            ]
        },
        alternates: {
            canonical: `${baseUrl}/post/${dataId}/${slugify(dataName)}`
        }
    };
}

const PostDetails = async ({ params }: PostDetailsProps) => {
    const dataId = params.details[0];
    const data = await serverClient.getPostById(dataId);
    const postDescription = data?.content || '';

    const cleanDescription = stripTags(postDescription);

    const jsonLd: WithContext<BlogPosting | NewsArticle | Article> = {
        '@context': 'https://schema.org',

        '@type':
            data?.category?.name === 'News'
                ? 'NewsArticle'
                : data?.category?.name === 'Article'
                  ? 'Article'
                  : 'BlogPosting', // Default to BlogPosting for Blog and Tutorial categories

        headline: data?.title || 'Default Title',
        articleBody: cleanDescription || 'Default Content',
        author: {
            '@type': 'Person',
            name: 'Denny Shu',
            url: 'https://dennyshu.com'
        },
        publisher: {
            '@type': 'Organization',
            name: 'Kofe Limited',
            logo: {
                '@type': 'ImageObject',
                url: `https://storage.googleapis.com/kofe_bucket/uploads/assets/kofe-logo-background.png`
            }
        },
        datePublished: data?.createdAt || new Date().toISOString(),
        image: data?.image || '',
        url: `${process.env.NEXT_PUBLIC_DOMAIN}/post/${slugify(data?.title || '')}`,
        interactionStatistic: {
            '@type': 'InteractionCounter',
            interactionType: {
                '@type': 'ViewAction' // Must define interactionType as an Action object
            } as Action, // Explicitly cast as Action
            userInteractionCount: data?.viewCounts || 0
        }
    };

    return (
        <>
            <Script
                id='post-schema'
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Details initialData={data} dataId={dataId} />
        </>
    );
};

export default PostDetails;
