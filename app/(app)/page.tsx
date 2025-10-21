import Script from 'next/script';

import { serverClient } from '@/app/_trpc/serverClient';

//components
import CategoryList from './components/CategoryList';
import ItemList from './components/ItemList';
import PromotionList from './components/PromotionList';
import { Organization, WithContext } from 'schema-dts';

export const metadata = {
    name: 'SaaS Boilerplate',
    title: 'SaaS Boilerplate - Multi-Vendor Marketplace Platform',
    description: `A production-ready SaaS boilerplate with multi-tenant marketplace capabilities. Built with Next.js, TypeScript, Prisma, and modern best practices. Perfect for launching your next marketplace, service platform, or e-commerce project.`,
    openGraph: {
        title: 'SaaS Boilerplate',
        description:
            'A production-ready SaaS boilerplate with multi-tenant marketplace capabilities. Built with Next.js, TypeScript, Prisma, and modern best practices.'
    }
};

export default async function Home() {
    //default data
    const categories = await serverClient.getCategories();
    const items = await serverClient.getItemsByCategory('Filters'); //default category
    const promotions = await serverClient.getPromotions();

    const jsonLd: WithContext<Organization> = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'SaaS Boilerplate Inc',
        url: 'https://yoursaas.com',
        logo: 'https://yoursaas.com/logo.png',
        sameAs: []
    };

    return (
        <>
            <Script
                id='home-schema'
                type='application/ld+json'
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <section className='container flex flex-col space-y-2 md:space-y-2 lg:space-y-0'>
                <CategoryList initialCategories={categories} />
                <PromotionList initialPromotions={promotions} />
                <ItemList initialProducts={items} />
            </section>
        </>
    );
}
