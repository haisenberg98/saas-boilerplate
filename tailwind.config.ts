import type { Config } from 'tailwindcss';
import TailwindAnimate from 'tailwindcss-animate';

const config = {
    darkMode: ['class'],
    content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
    prefix: '',
    theme: {
        container: {
            center: true,
            screens: {
                '2xl': '1400px'
            }
        },
        extend: {
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            },
            colors: {
                customPrimary: '#42413D',
                customTransparentPrimary: '#2626263d',
                customSecondary: '#f7f5ec',
                customTertiary: '#dc3522',
                customGreen: '#4d9457',
                customDarkGray: '#51595e',
                customGray: '#dddddd',
                customLightGray: 'rgba(100, 117, 137, 0.7)',
                customTransparentBG: '#FFFFFF1A',
                customTransparentBorder: '#FFFFFF26'
            }
        }
    },
    plugins: [TailwindAnimate]
} satisfies Config;

export default config;
