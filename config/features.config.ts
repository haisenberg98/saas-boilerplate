/**
 * ============================================
 * FEATURE FLAGS CONFIGURATION
 * ============================================
 *
 * Granular control over feature availability.
 * Use this to enable/disable features without code changes.
 */

export const featureFlags = {
  // ============================================
  // CUSTOMER FEATURES
  // ============================================
  customer: {
    // Account management
    registration: true,
    socialLogin: false,
    guestCheckout: true,
    profileEditing: true,

    // Shopping features
    search: true,
    filters: true,
    sorting: true,
    cart: true,
    wishlist: true,
    compareItems: false,

    // Order features
    orderTracking: true,
    orderHistory: true,
    reorder: true,
    orderCancellation: true,

    // Reviews & ratings
    submitReviews: true,
    reviewImages: true,
    verifiedPurchaseLabel: true,

    // Communication
    newsletter: true,
    pushNotifications: false,
    emailNotifications: true,
  },

  // ============================================
  // VENDOR FEATURES
  // ============================================
  vendor: {
    // Account management
    vendorRegistration: true,
    vendorVerification: false,

    // Catalog management
    itemCreation: true,
    bulkItemUpload: true,
    categoryManagement: false, // Admin-only by default
    inventoryTracking: true,

    // Order management
    orderManagement: true,
    orderStatusUpdates: true,
    fulfillmentTracking: true,

    // Financial
    revenueReports: true,
    payoutManagement: false,

    // Marketing
    promotions: true,
    discountCodes: true,
    featuredListings: false,
  },

  // ============================================
  // ADMIN FEATURES
  // ============================================
  admin: {
    // User management
    userManagement: true,
    roleManagement: true,
    vendorApproval: false,

    // Content management
    categoryManagement: true,
    postManagement: true,
    pageManagement: false,

    // Platform management
    platformSettings: true,
    emailTemplates: false,
    apiKeys: false,

    // Analytics
    dashboardAnalytics: true,
    advancedReports: false,
    dataExports: true,

    // System
    systemLogs: false,
    maintenanceMode: false,
  },

  // ============================================
  // PLATFORM FEATURES
  // ============================================
  platform: {
    // Discovery
    homepage: true,
    searchEngine: true,
    recommendations: false,
    trendingItems: true,

    // Content
    blog: true,
    faq: true,
    staticPages: true,

    // Marketing
    promotionalBanners: true,
    seasonalThemes: false,
    referralProgram: false,

    // Support
    contactForm: true,
    liveChat: false,
    helpCenter: false,
  },

  // ============================================
  // PAYMENT FEATURES
  // ============================================
  payments: {
    // Payment methods
    stripe: true,
    paypal: false,
    applePay: false,
    googlePay: false,
    cashOnDelivery: false,
    bankTransfer: false,

    // Features
    savedCards: true,
    splitPayments: false,
    installments: false,
    refunds: true,
  },

  // ============================================
  // DELIVERY FEATURES
  // ============================================
  delivery: {
    // Methods
    standardDelivery: true,
    expressDelivery: false,
    scheduledDelivery: false,
    pickup: false,

    // Tracking
    realTimeTracking: false,
    deliveryNotifications: true,
    proofOfDelivery: false,

    // Zones
    multipleZones: true,
    internationalShipping: false,
    freeShippingThreshold: true,
  },

  // ============================================
  // EXPERIMENTAL FEATURES
  // ============================================
  experimental: {
    // AI/ML
    aiSearch: false,
    aiRecommendations: false,
    chatbot: false,

    // AR/VR
    virtualTryOn: false,
    ar3DView: false,

    // Social
    socialSharing: true,
    userGeneratedContent: false,
    communityForum: false,

    // Gamification
    loyaltyPoints: false,
    badges: false,
    leaderboard: false,
  },
} as const

/**
 * Helper function to check if a feature is enabled
 */
export function isFeatureEnabled(featurePath: string): boolean {
  const keys = featurePath.split('.')
  let current: any = featureFlags

  for (const key of keys) {
    if (current[key] === undefined) {
      console.warn(`Feature flag not found: ${featurePath}`)
      return false
    }
    current = current[key]
  }

  return current === true
}

/**
 * Type exports
 */
export type FeatureFlags = typeof featureFlags
