/**
 * ============================================
 * CONFIGURATION INDEX
 * ============================================
 *
 * Central export point for all configuration files.
 * Import from here in your application code.
 *
 * Usage:
 *   import { appConfig, featureFlags, brandingConfig } from '@/config'
 */

export { appConfig } from './app.config'
export type { AppConfig, BusinessModelType, OfferingType, PricingModel, Currency } from './app.config'

export { featureFlags, isFeatureEnabled } from './features.config'
export type { FeatureFlags } from './features.config'

export { brandingConfig, getColor } from './branding.config'
export type { BrandingConfig } from './branding.config'

/**
 * Helper function to get the current domain
 */
export function getCurrentDomain(): string {
  const isDevelopment = process.env.NODE_ENV === 'development'
  return isDevelopment ? appConfig.domain.development : appConfig.domain.production
}

/**
 * Helper function to get terminology
 */
export function getTerminology() {
  return appConfig.terminology
}

/**
 * Helper to check if multi-vendor mode is enabled
 */
export function isMultiVendor(): boolean {
  return appConfig.businessModel.multiVendor
}

/**
 * Helper to get pricing model
 */
export function getPricingModel() {
  return appConfig.pricing.model
}
