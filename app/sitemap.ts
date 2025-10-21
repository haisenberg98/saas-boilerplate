import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { slugify } from '@/lib/utils';

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static important pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 1,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/coffee-ai`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/post`,
            lastModified: new Date(),
            changeFrequency: 'daily' as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.3,
        },
    ];

    // Items - high priority for ecommerce
    const items = await prisma.item.findMany({
        where: { published: true },
        select: {
            id: true,
            name: true,
            updatedAt: true,
            createdAt: true,
        },
        orderBy: { updatedAt: 'desc' }
    });

    const productPages = items.map((item) => ({
        url: `${baseUrl}/item/${item.id}/${slugify(item.name)}`,
        lastModified: item.updatedAt || item.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Categories - important for navigation and SEO
    const categories = await prisma.category.findMany({
        where: {
            items: {
                some: { published: true }
            }
        },
        select: {
            id: true,
            name: true,
            updatedAt: true,
            createdAt: true,
        },
    });

    const categoryPages = categories.map((category) => ({
        url: `${baseUrl}/category/${category.id}/${slugify(category.name)}`,
        lastModified: category.updatedAt || category.createdAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // Blog posts - good for content marketing
    const posts = await prisma.post.findMany({
        select: {
            id: true,
            title: true,
            updatedAt: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
    });

    const postPages = posts.map((post) => ({
        url: `${baseUrl}/post/${post.id}/${slugify(post.title)}`,
        lastModified: post.updatedAt || post.createdAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    // Providers/Suppliers - useful for brand pages
    const providers = await prisma.provider.findMany({
        where: {
            items: {
                some: { published: true }
            }
        },
        select: {
            id: true,
            name: true,
        },
    });

    const shopPages = providers.map((provider) => ({
        url: `${baseUrl}/provider/${provider.id}/${slugify(provider.name)}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.5,
    }));

    return [
        ...staticPages,
        ...productPages,
        ...categoryPages,
        ...postPages,
        ...shopPages,
    ];
}
