/**
 * ============================================
 * BRANDING & THEME CONFIGURATION
 * ============================================
 *
 * Configure your app's look and feel.
 * Easily rebrand the entire application by changing these values.
 */

export const brandingConfig = {
  // ============================================
  // COLORS (Tailwind CSS Variables)
  // ============================================
  colors: {
    // Primary brand color
    primary: '#42413D',
    primaryLight: '#51595e',
    primaryDark: '#262626',

    // Secondary/Accent color
    secondary: '#f7f5ec',
    secondaryLight: '#ffffff',
    secondaryDark: '#e5e3da',

    // Accent colors
    accent: '#dc3522',
    accentLight: '#eb2121',
    accentDark: '#c72c1f',

    // Semantic colors
    success: '#4d9457',
    warning: '#f59e0b',
    error: '#dc2626',
    info: '#3b82f6',

    // Neutral colors
    gray: '#dddddd',
    lightGray: 'rgba(100, 117, 137, 0.7)',
    darkGray: '#51595e',

    // Transparent overlays
    transparentPrimary: '#2626263d',
    transparentBG: '#FFFFFF1A',
    transparentBorder: '#FFFFFF26',
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Font families
    fontPrimary: 'var(--font-primary)', // Headings
    fontSecondary: 'var(--font-secondary)', // Body text

    // Font sizes (Tailwind classes)
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },

    // Font weights
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    },
  },

  // ============================================
  // SPACING & LAYOUT
  // ============================================
  layout: {
    // Container max widths
    containerMaxWidth: '1400px',

    // Common spacing values
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      '2xl': '4rem',
    },

    // Border radius
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px',
    },
  },

  // ============================================
  // IMAGES & ASSETS
  // ============================================
  assets: {
    // Logos
    logo: {
      light: '/logo.png',
      dark: '/logo-dark.png',
      icon: '/icon.png',
      width: 150,
      height: 40,
    },

    // Favicon
    favicon: {
      ico: '/favicon.ico',
      svg: '/favicon.svg',
      apple: '/apple-touch-icon.png',
    },

    // Social sharing
    ogImage: '/og-image.png',
    twitterImage: '/twitter-image.png',

    // Placeholder images
    placeholders: {
      item: '/placeholder-item.png',
      user: '/placeholder-user.png',
      provider: '/placeholder-provider.png',
    },

    // Background images
    backgrounds: {
      hero: '/hero-bg.jpg',
      pattern: '/pattern-bg.svg',
    },
  },

  // ============================================
  // COMPONENTS STYLING
  // ============================================
  components: {
    // Buttons
    button: {
      primary: 'bg-customPrimary text-customSecondary hover:bg-customPrimaryLight',
      secondary: 'bg-customSecondary text-customPrimary hover:bg-customSecondaryDark',
      accent: 'bg-customTertiary text-white hover:bg-customTertiaryDark',
      ghost: 'bg-transparent hover:bg-customTransparentPrimary',
    },

    // Cards
    card: {
      default: 'bg-white rounded-lg shadow-md',
      elevated: 'bg-white rounded-lg shadow-lg',
      outline: 'bg-white rounded-lg border border-customGray',
    },

    // Inputs
    input: {
      default: 'border border-customGray rounded-md focus:ring-2 focus:ring-customPrimary',
      error: 'border border-red-500 focus:ring-2 focus:ring-red-500',
    },

    // Badges
    badge: {
      primary: 'bg-customPrimary text-white',
      success: 'bg-customGreen text-white',
      warning: 'bg-yellow-500 text-white',
      error: 'bg-red-500 text-white',
    },
  },

  // ============================================
  // ANIMATIONS & TRANSITIONS
  // ============================================
  animations: {
    // Transition durations (in ms)
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
    },

    // Easing functions
    easing: {
      default: 'ease-in-out',
      in: 'ease-in',
      out: 'ease-out',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ============================================
  // CUSTOM STYLES
  // ============================================
  custom: {
    // Custom shadows
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      custom: '0px 5px 25px 0px #eb21213d', // Product card hover
    },

    // Custom gradients
    gradients: {
      primary: 'linear-gradient(135deg, #42413D 0%, #51595e 100%)',
      accent: 'linear-gradient(135deg, #dc3522 0%, #eb2121 100%)',
    },

    // Custom borders
    borders: {
      thin: '0.25px solid #dddfe7',
    },
  },
} as const

/**
 * Helper function to get color value
 */
export function getColor(colorKey: keyof typeof brandingConfig.colors): string {
  return brandingConfig.colors[colorKey]
}

/**
 * Type exports
 */
export type BrandingConfig = typeof brandingConfig
