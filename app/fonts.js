import { Montserrat, Roboto } from 'next/font/google';

export const primaryFont = Montserrat({
  weight: ['400', '500', '700', '900'],
  variable: '--font-primary',
  subsets: ['latin'],
});

export const secondaryFont = Roboto({
  weight: ['400', '500', '700', '900'],
  variable: '--font-secondary',
  subsets: ['latin'],
});
