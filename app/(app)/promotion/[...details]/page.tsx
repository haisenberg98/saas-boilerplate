import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';

import { serverClient } from '@/app/_trpc/serverClient';

import {
  WithContext,
  BlogPosting,
  NewsArticle,
  Article,
  Action,
} from 'schema-dts';

//utils
import { stripTagsAndExtractText, stripTags } from '@/lib/utils';

//components
import Details from './components/Details';
import { slugify } from '@/lib/utils';
import { start } from 'repl';

type DataDetailsProps = {
  params: {
    details: string[];
  };
};

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export async function generateMetadata({
  params,
}: DataDetailsProps): Promise<Metadata> {
  const dataId = params.details[0];
  const data = await serverClient.getPromotionById(dataId);
  const dataName = data?.title || '';
  const dataDescription = data?.description || '';

  if (!data) {
    notFound();
  }

  // Strip tags and extract part of the text for SEO purposes
  const cleanDescription = stripTagsAndExtractText(dataDescription, 160);
  return {
    title: dataName ? `${dataName}` : 'Promotion',
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
      dataName,
    ],
    openGraph: {
      description: cleanDescription,
      title: dataName,
      type: 'website',
      url: `${baseUrl}/promotion/${dataId}/${slugify(dataName)}`,
      siteName: 'Kofe',
      images: [
        {
          url: data?.image || '',
          alt: dataName,
        },
      ],
    },
  };
}

const PostDetails = async ({ params }: DataDetailsProps) => {
  const dataId = params.details[0];
  const data = await serverClient.getPromotionById(dataId);
  const dataDescription = data?.description || '';
  const cleanDescription = stripTags(dataDescription);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement', // Use SpecialAnnouncement for general promotions
    name: data?.title,
    text: cleanDescription,
    description: cleanDescription,
    datePosted: data?.startDate,
    expires: data?.endDate,
    url: `${baseUrl}/promotion/${dataId}/${slugify(data?.title || '')}`,
    image: data?.image,
    announcementLocation: {
      '@type': 'Place',
      name: 'Kofe New Zealand',
    },
    // category:
    //   promotionType === 'freeShipping'
    //     ? 'Free Shipping'
    //     : `${discountValue}% Discount`,
    publisher: {
      '@type': 'Organization',
      name: 'Kofe',
    },
  };

  return (
    <>
      <Script
        id='promotion-schema'
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Details initialData={data} dataId={dataId} />
    </>
  );
};

export default PostDetails;
