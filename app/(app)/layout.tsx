import type { Metadata } from 'next';

import { SyncActiveOrganization } from '@/components/global/SyncActiveOrganization';
import Footer from '@/components/layouts/Footer';
//components
import Header from '@/components/layouts/Header';
import Navigation from '@/components/layouts/Navigation';
import PageModal from '@/components/layouts/PageModal';
import NewsletterModalWrapper from '@/components/global/NewsletterModalWrapper';
//types
import { LayoutProps } from '@/lib/types';
//clerk
import { auth } from '@clerk/nextjs/server';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export const metadata: Metadata = {
    metadataBase: baseUrl,
    title: {
        default: 'Buy Coffee Equipment For Home And Travel NZ | Kofe',
        template: '%s | Kofe'
    },
    description:
        'Kofe Limited offers high-quality coffee equipment and supplies for both outdoor adventures and home brewing enthusiasts in New Zealand. Explore our wide range of portable coffee makers, grinders, and brewing kits, perfect for camping, hiking, or enjoying the perfect cup at home. With affordable prices, durable gear, and everything you need for your coffee journey, Kofe is your go-to source for brewing solutions across New Zealand.',
    keywords: [
        // Outdoor Coffee Equipment
        'portable coffee makers for camping',
        'outdoor coffee brewing kits',
        'travel coffee grinders',
        'coffee equipment for hiking',
        'compact coffee makers for outdoor use',
        'camping coffee equipment',
        'portable espresso machines',
        'lightweight coffee brewing gear',
        'adventure coffee brewing kits',
        'durable coffee makers for camping',

        // Home Coffee Enthusiasts
        'coffee makers for home brewing',
        'best coffee grinders for home',
        'home barista coffee equipment',
        'espresso machines for home use',
        'french press for home brewing',
        'aeropress for home brewing',
        'high-quality coffee makers for home',
        'manual coffee grinders for home use',
        'best coffee brewing kits for home',

        // General Keywords
        'buy coffee equipment online',
        'coffee brewing gear for home and travel',
        'versatile coffee brewing equipment',
        'affordable coffee equipment',
        'top-rated coffee equipment for home and camping',

        // New Zealand Targeted Keywords
        'buy coffee equipment online in New Zealand',
        'coffee brewing tools in New Zealand',
        'high-quality coffee makers for New Zealand customers',
        'best coffee gear for Kiwi coffee lovers'
    ]
};

export default function HomeLayout({ children }: LayoutProps) {
    const { sessionClaims } = auth();

    return (
        <>
            <SyncActiveOrganization membership={sessionClaims?.membership} />
            <Header />
            <main className='mb-10 flex min-h-screen justify-center bg-customSecondary pb-16 pt-4 lg:container md:mb-20 md:pt-6 lg:mx-auto lg:mb-0 lg:max-w-4xl lg:px-0 lg:pt-8 xl:max-w-7xl'>
                <Navigation />
                {children}
            </main>
            <Footer />
            <PageModal />
            <NewsletterModalWrapper />
            <ToastContainer />
        </>
    );
}
