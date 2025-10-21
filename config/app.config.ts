/**
 * ============================================
 * SAAS BOILERPLATE - MAIN CONFIGURATION
 * ============================================
 *
 * This is the central configuration file for your SaaS application.
 * Modify these values when cloning the boilerplate for a new project.
 *
 * IMPORTANT: After changing config, restart your dev server
 */

export const appConfig = {
  // ============================================
  // APP IDENTITY
  // ============================================
  appName: 'SaaS Boilerplate',
  appDescription: 'A modern multi-tenant SaaS marketplace boilerplate',
  appVersion: '1.0.0',

  // Domain configuration
  domain: {
    production: 'https://yoursaas.com',
    development: 'http://localhost:3000',
  },

  // ============================================
  // BUSINESS MODEL
  // ============================================
  businessModel: {
    // Type of platform: 'marketplace' | 'single-vendor' | 'saas-subscription'
    type: 'marketplace' as const,

    // What are you selling: 'products' | 'services' | 'bookings' | 'courses'
    offeringType: 'services' as const,

    // Multi-vendor support
    multiVendor: true,

    // Require vendor approval to join platform
    vendorApprovalRequired: false,
  },

  // ============================================
  // PRICING & MONETIZATION
  // ============================================
  pricing: {
    // Pricing model: 'per_item' | 'per_weight' | 'per_hour' | 'subscription' | 'tiered'
    model: 'per_item' as const,

    // Default currency
    defaultCurrency: 'NZD' as const,

    // Supported currencies
    supportedCurrencies: ['NZD', 'AUD'] as const,

    // Platform takes commission from vendors
    platformCommission: {
      enabled: false,
      percentage: 0,
    },
  },

  // ============================================
  // FEATURES TOGGLES
  // ============================================
  features: {
    // Core features
    authentication: true,
    payments: true,
    reviews: true,
    cart: true,
    wishlist: true,

    // Advanced features
    multiCurrency: true,
    deliveryTracking: true,
    realTimeNotifications: false,
    chatSupport: false,
    analytics: false,

    // Content features
    blog: true,
    newsletter: true,
    promotions: true,
    discountCodes: true,

    // Vendor features
    vendorDashboard: true,
    inventoryManagement: true,

    // Admin features
    adminDashboard: true,

    // Experimental features
    aiRecommendations: false,
    subscriptions: false,
  },

  // ============================================
  // PAYMENT METHODS
  // ============================================
  paymentMethods: {
    stripe: true,
    cash: false,
    bankTransfer: false,
    ewallet: false,
    cryptocurrency: false,
  },

  // ============================================
  // TERMINOLOGY (Dynamic Labels)
  // ============================================
  // Change these to match your business domain
  terminology: {
    // What you're selling
    item: 'Item',
    items: 'Items',

    // Who provides it
    provider: 'Provider',
    providers: 'Providers',

    // Order/Transaction
    order: 'Order',
    orders: 'Orders',

    // Fulfillment/Delivery
    fulfillment: 'Fulfillment',
    fulfillments: 'Fulfillments',

    // Classification
    category: 'Category',
    categories: 'Categories',

    // User types
    customer: 'Customer',
    customers: 'Customers',
    vendor: 'Vendor',
    vendors: 'Vendors',
  },

  // ============================================
  // SEO & METADATA
  // ============================================
  seo: {
    defaultTitle: 'SaaS Boilerplate - Modern Marketplace Platform',
    titleTemplate: '%s | SaaS Boilerplate',
    defaultDescription: 'A production-ready SaaS boilerplate with multi-tenant marketplace capabilities',
    keywords: ['saas', 'marketplace', 'boilerplate', 'nextjs'],

    // Social media
    ogImage: '/og-image.png',
    twitterHandle: '@yoursaas',
  },

  // ============================================
  // BRANDING
  // ============================================
  branding: {
    logo: '/logo.png',
    logoDark: '/logo-dark.png',
    favicon: '/favicon.ico',

    // Organization info
    organization: {
      name: 'SaaS Boilerplate Inc',
      legalName: 'SaaS Boilerplate Limited',
      url: 'https://yoursaas.com',
      email: 'hello@yoursaas.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        city: 'Your City',
        country: 'Your Country',
        postalCode: '12345',
      },
    },
  },

  // ============================================
  // REGIONAL SETTINGS
  // ============================================
  regional: {
    defaultLocale: 'en',
    supportedLocales: ['en'],
    timezone: 'Pacific/Auckland',
    dateFormat: 'dd/MM/yyyy',
    timeFormat: '24h' as const,
  },

  // ============================================
  // INTEGRATIONS
  // ============================================
  integrations: {
    analytics: {
      google: {
        enabled: false,
        measurementId: '',
      },
    },

    email: {
      provider: 'resend',
      fromEmail: 'noreply@yoursaas.com',
      fromName: 'SaaS Boilerplate',
    },

    storage: {
      provider: 'gcs', // 'gcs' | 's3' | 'local'
      bucket: 'your-bucket-name',
    },

    maps: {
      provider: 'google', // 'google' | 'mapbox' | 'none'
      enabled: false,
    },
  },

  // ============================================
  // LIMITS & CONSTRAINTS
  // ============================================
  limits: {
    maxImageSize: 5 * 1024 * 1024, // 5MB
    maxImagesPerItem: 10,
    maxItemsPerOrder: 100,
    minOrderAmount: 0,
    maxOrderAmount: 999999,
  },
} as const

// ============================================
// TYPE EXPORTS
// ============================================
export type AppConfig = typeof appConfig
export type BusinessModelType = typeof appConfig.businessModel.type
export type OfferingType = typeof appConfig.businessModel.offeringType
export type PricingModel = typeof appConfig.pricing.model
export type Currency = typeof appConfig.pricing.supportedCurrencies[number]
