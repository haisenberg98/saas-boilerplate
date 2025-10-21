import type { Metadata } from 'next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

//types
import { LayoutProps } from '@/lib/types';

const baseUrl = new URL(process.env.NEXT_PUBLIC_DOMAIN || '');

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: 'Log in or Register | Kofe',
    template: '',
  },
  description:
    'Create an account or log into Kofe. Start getting your coffee equipments and supplies. We sell cheap and high quality coffee equipments and supplies. We have a wide range of coffee equipments and supplies.',
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
    'best coffee gear for Kiwi coffee lovers',
  ],
};

export default function AuthLayout({ children }: LayoutProps) {
  return (
    <>
      <main className='bg-customSecondary flex justify-center mb-10 md:mb-20 py-4 pb-16 min-h-screen lg:mb-0'>
        {children}
      </main>
      <ToastContainer />
    </>
  );
}
