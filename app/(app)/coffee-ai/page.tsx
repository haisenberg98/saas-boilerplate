import React from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import CoffeeAIDetails from './components/CoffeeAIDetails';

export const metadata: Metadata = {
    title: 'Coffee AI Assistant - Kofe | Personalized Brewing Advice & Quick Recipes',
    description: 'Get instant coffee brewing advice with Kofe\'s AI assistant. Choose Quick Recipe mode for instant brewing guides or AI Chat for personalized advice. Master AeroPress, French Press, Pour-over, and more brewing techniques with expert guidance.',
    keywords: [
        'coffee AI assistant',
        'coffee brewing guide',
        'AI coffee recipes',
        'personalized coffee advice',
        'quick coffee recipes',
        'AI chat coffee',
        'AeroPress brewing',
        'French Press guide',
        'Pour-over coffee',
        'V60 brewing',
        'coffee equipment NZ',
        'brewing guide AI',
        'Kofe AI assistant',
        'coffee expert advice',
        'brewing techniques',
        'instant coffee recipes',
        'coffee brewing tips',
        'barista advice AI',
        'coffee recipe generator',
        'brew ratio calculator',
        'coffee strength guide',
        'coffee grind size',
        'water temperature coffee',
        'brewing time guide',
        'coffee extraction tips'
    ],
    openGraph: {
        title: 'Coffee AI Assistant - Get Perfect Brewing Advice | Kofe',
        description: 'Master coffee brewing with AI-powered guidance. Get instant recipes for AeroPress, French Press, Pour-over, and more. Expert advice tailored to your equipment and preferences.',
        type: 'website',
        url: '/coffee-ai',
        siteName: 'Kofe - Coffee Equipment NZ',
        images: [
            {
                url: '/coffee-ai-preview.jpg',
                width: 1200,
                height: 630,
                alt: 'Coffee AI Assistant - Perfect Brewing Recipes and Expert Advice'
            }
        ],
        locale: 'en_NZ',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Coffee AI Assistant - Perfect Brewing Every Time | Kofe',
        description: 'Master coffee brewing with AI guidance. Get instant AeroPress, French Press, and Pour-over recipes tailored to your equipment and taste preferences.',
        images: ['/coffee-ai-preview.jpg'],
        site: '@kofebrews',
        creator: '@kofebrews',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_DOMAIN || 'https://kofe.co.nz'}/coffee-ai`,
    },
    other: {
        'application-name': 'Kofe Coffee AI',
        'theme-color': '#42413D',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no',
    },
};

const CoffeeAIPage = () => {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Coffee AI Assistant',
        description: 'AI-powered coffee brewing assistant providing personalized brewing advice, quick recipes, and expert guidance for AeroPress, French Press, Pour-over, and more brewing methods.',
        url: `${process.env.NEXT_PUBLIC_DOMAIN || 'https://kofe.co.nz'}/coffee-ai`,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web Browser',
        author: {
            '@type': 'Organization',
            name: 'Kofe Limited',
            url: process.env.NEXT_PUBLIC_DOMAIN || 'https://kofe.co.nz',
            logo: 'https://storage.googleapis.com/kofe_bucket/uploads/assets/kofe-logo-background.png'
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'NZD',
            availability: 'https://schema.org/InStock'
        },
        featureList: [
            'Quick Recipe Mode for instant brewing guides',
            'AI Chat for personalized coffee advice',
            'AeroPress brewing instructions',
            'French Press guidance',
            'Pour-over techniques',
            'V60 brewing tips',
            'Coffee equipment recommendations',
            'Brew ratio calculations',
            'Water temperature guidance',
            'Grind size recommendations'
        ],
        audience: {
            '@type': 'Audience',
            audienceType: 'Coffee enthusiasts, home baristas, outdoor adventurers'
        }
    };

    return (
        <>
            <Script
                id="coffee-ai-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <CoffeeAIDetails />
        </>
    );
};

export default CoffeeAIPage;