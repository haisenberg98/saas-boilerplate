import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/item/',
          '/category/',
          '/provider/',
          '/post/',
          '/coffee-ai',
          '/login',
          '/register',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/orders/',
          '/item/list/',
          '/item/add/',
          '/item/edit/',
          '/item/minimum-order/',
          '/provider/list/',
          '/provider/add/',
          '/provider/edit/',
          '/post/list/',
          '/post/add/',
          '/post/edit/',
          '/discount/',
          '/promotion/list/',
          '/promotion/add/',
          '/promotion/edit/',
          '/item-review/list/',
          '/item-review/add/',
          '/item-review/edit/',
          '/searched-keyword/',
          '/*?*', // Block all query parameters
        ],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/item/',
          '/category/',
          '/provider/',
          '/post/',
          '/coffee-ai',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/orders/',
        ],
        crawlDelay: 0.5, // Faster crawling for Google
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
