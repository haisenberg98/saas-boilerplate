# 🔄 Cloning Guide: SaaS Boilerplate → New Project

This guide walks you through cloning the boilerplate for a new project using **Bilas Laundry** as an example.

---

## 📋 Table of Contents

1. [Quick Clone Checklist](#quick-clone-checklist)
2. [Detailed Step-by-Step Guide](#detailed-step-by-step-guide)
3. [Configuration Examples](#configuration-examples)
4. [Common Use Cases](#common-use-cases)

---

## ✅ Quick Clone Checklist

Use this checklist when cloning:

- [ ] Clone repository
- [ ] Update `config/app.config.ts` (name, terminology, business model)
- [ ] Update `config/branding.config.ts` (colors, logos)
- [ ] Create new database and update `.env.local`
- [ ] Run database migrations
- [ ] Replace branding assets (`/public` folder)
- [ ] Update metadata in `app/(app)/page.tsx`
- [ ] Add domain-specific database fields (if needed)
- [ ] Test locally
- [ ] Deploy to production

---

## 📖 Detailed Step-by-Step Guide

### **Example: Creating "Bilas Laundry" Marketplace**

---

### **Step 1: Clone & Setup** (5 minutes)

```bash
# Clone the boilerplate
git clone <boilerplate-repo-url> bilas-laundry
cd bilas-laundry

# Install dependencies
npm install

# Remove old git history (start fresh)
rm -rf .git
git init
git add .
git commit -m "Initial commit from SaaS boilerplate"
```

---

### **Step 2: Configure Application** (10 minutes)

#### **2.1: Update Main Configuration**

Edit `config/app.config.ts`:

```typescript
export const appConfig = {
  // ============================================
  // APP IDENTITY
  // ============================================
  appName: 'Bilas Laundry',
  appDescription: 'On-demand laundry service marketplace connecting customers with local laundry shops',
  appVersion: '1.0.0',

  domain: {
    production: 'https://bilas-laundry.com',
    development: 'http://localhost:3000',
  },

  // ============================================
  // BUSINESS MODEL
  // ============================================
  businessModel: {
    type: 'marketplace',        // Multi-vendor marketplace
    offeringType: 'services',   // Selling services (not products)
    multiVendor: true,          // Multiple laundry shops
    vendorApprovalRequired: false,
  },

  // ============================================
  // PRICING & MONETIZATION
  // ============================================
  pricing: {
    model: 'per_weight',        // ⚠️ Changed from per_item to per_weight
    defaultCurrency: 'NZD',
    supportedCurrencies: ['NZD', 'AUD'],
    platformCommission: {
      enabled: false,           // Set to true if taking commission
      percentage: 10,
    },
  },

  // ============================================
  // TERMINOLOGY (Dynamic Labels)
  // ============================================
  terminology: {
    // What you're selling
    item: 'Laundry Service',
    items: 'Laundry Services',

    // Who provides it
    provider: 'Laundry Shop',
    providers: 'Laundry Shops',

    // Order/Transaction
    order: 'Order',
    orders: 'Orders',

    // Fulfillment/Delivery
    fulfillment: 'Pickup & Delivery',
    fulfillments: 'Pickups & Deliveries',

    // Classification
    category: 'Service Type',
    categories: 'Service Types',

    // User types
    customer: 'Customer',
    customers: 'Customers',
    vendor: 'Laundry Partner',
    vendors: 'Laundry Partners',
  },

  // ============================================
  // SEO & METADATA
  // ============================================
  seo: {
    defaultTitle: 'Bilas Laundry - On-Demand Laundry Service',
    titleTemplate: '%s | Bilas Laundry',
    defaultDescription: 'Professional laundry services at your doorstep. Fast pickup and delivery from trusted local laundry shops.',
    keywords: ['laundry', 'dry cleaning', 'wash and fold', 'pickup delivery'],
    ogImage: '/og-image-bilas.png',
    twitterHandle: '@bilaslaundry',
  },

  // ============================================
  // BRANDING
  // ============================================
  branding: {
    logo: '/bilas-logo.png',
    logoDark: '/bilas-logo-dark.png',
    favicon: '/favicon.ico',

    organization: {
      name: 'Bilas Laundry',
      legalName: 'Bilas Laundry Limited',
      url: 'https://bilas-laundry.com',
      email: 'hello@bilas-laundry.com',
      phone: '+64 21 XXX XXXX',
      address: {
        street: '123 Clean Street',
        city: 'Auckland',
        country: 'New Zealand',
        postalCode: '1010',
      },
    },
  },

  // ============================================
  // INTEGRATIONS
  // ============================================
  integrations: {
    email: {
      provider: 'resend',
      fromEmail: 'noreply@bilas-laundry.com',
      fromName: 'Bilas Laundry',
    },
    storage: {
      provider: 'gcs',
      bucket: 'bilas-laundry-storage',
    },
  },
}
```

#### **2.2: Update Feature Flags (Optional)**

Edit `config/features.config.ts` if you want to disable certain features:

```typescript
export const featureFlags = {
  customer: {
    wishlist: false,  // Disable wishlist for laundry service
    compareItems: false,
  },
  experimental: {
    aiRecommendations: true,  // Enable AI-based service recommendations
  },
}
```

#### **2.3: Update Branding**

Edit `config/branding.config.ts`:

```typescript
export const brandingConfig = {
  colors: {
    // Update to Bilas Laundry brand colors
    primary: '#2563eb',      // Blue
    secondary: '#f8fafc',    // Light gray
    accent: '#10b981',       // Green
  },
  assets: {
    logo: {
      light: '/bilas-logo.png',
      dark: '/bilas-logo-dark.png',
      width: 180,
      height: 45,
    },
  },
}
```

---

### **Step 3: Environment Setup** (5 minutes)

#### **3.1: Create New Database**

1. Go to [Neon.tech](https://neon.tech) or your database provider
2. Create new database: `bilas-laundry-dev`
3. Get connection strings

#### **3.2: Setup Environment Variables**

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Database
POSTGRES_PRISMA_URL=postgresql://user:pass@host/bilas-laundry-dev?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://user:pass@host/bilas-laundry-dev?sslmode=require

# Clerk (create new Clerk app: "Bilas Laundry")
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Stripe (use test mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Cloud Storage (create new bucket: bilas-laundry-storage)
GCLOUD_SERVICE_ACCOUNT_JSON="base64_encoded_json..."

# Resend
RESEND_API_KEY=re_...

# App Configuration
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
NODE_ENV="development"
```

---

### **Step 4: Database Customization** (10 minutes)

Add laundry-specific fields to `prisma/schema.prisma`:

```prisma
model Item {
  id            String   @id @default(cuid())
  name          String
  price         Float
  description   String
  // ... existing fields

  // 🧺 LAUNDRY-SPECIFIC FIELDS
  weightBased       Boolean?  @default(true)
  pricePerKg        Float?
  minimumWeight     Float?    @default(2)
  maximumWeight     Float?    @default(50)
  turnaroundTime    Int?      // hours
  turnaroundTimeMax Int?
  serviceType       String?   // "wash", "dry", "iron", "dry-clean"
  fabricTypes       String[]  // ["cotton", "silk", "wool", "synthetic"]
  careInstructions  String?
  acceptsSpecialItems Boolean? @default(false)  // carpets, curtains, etc.

  @@map("items")
}

model Order {
  id            String   @id @default(cuid())
  // ... existing fields

  // 🧺 LAUNDRY-SPECIFIC FIELDS
  pickupDateTime    DateTime?
  deliveryDateTime  DateTime?
  totalWeight       Float?
  specialInstructions String?
  stainDetails      String?
  urgentService     Boolean?  @default(false)

  @@map("orders")
}

model OrderItem {
  id         String   @id @default(cuid())
  // ... existing fields

  // 🧺 LAUNDRY-SPECIFIC FIELDS
  weight         Float?
  garmentType    String?  // "shirt", "pants", "dress", etc.
  color          String?
  stainNotes     String?

  @@map("order_items")
}
```

Then migrate:

```bash
npx prisma migrate dev --name add_laundry_fields
npx prisma generate
```

---

### **Step 5: Update Branding Assets** (5 minutes)

Replace files in `/public`:

```bash
# Remove old branding
rm public/logo.png public/kofe-logo.png

# Add Bilas Laundry branding
cp /path/to/bilas-logo.png public/
cp /path/to/bilas-favicon.ico public/favicon.ico
cp /path/to/og-image-bilas.png public/og-image.png
```

---

### **Step 6: Update Metadata** (2 minutes)

The configuration in `config/app.config.ts` should already handle most metadata, but verify `app/(app)/page.tsx` uses it correctly.

---

### **Step 7: Test Locally** (5 minutes)

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Verify:
# - Branding shows "Bilas Laundry"
# - Terminology is correct (Services, Laundry Shops, etc.)
# - Colors match brand
# - Database connections work
```

---

### **Step 8: Deploy to Production** (10 minutes)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel

# Or deploy to your platform of choice
```

**Set environment variables in production dashboard!**

---

## 🎯 Configuration Examples

### **Example 1: E-commerce Store**

```typescript
// config/app.config.ts
export const appConfig = {
  appName: 'Awesome Store',
  businessModel: {
    type: 'single-vendor',      // Not a marketplace
    offeringType: 'products',   // Selling products
    multiVendor: false,
  },
  terminology: {
    item: 'Product',
    provider: 'Store',
    fulfillment: 'Shipping',
  },
  pricing: {
    model: 'per_item',
  },
}
```

### **Example 2: Booking Platform**

```typescript
export const appConfig = {
  appName: 'BookNow',
  businessModel: {
    type: 'marketplace',
    offeringType: 'bookings',
    multiVendor: true,
  },
  terminology: {
    item: 'Service',
    provider: 'Professional',
    fulfillment: 'Appointment',
  },
  pricing: {
    model: 'per_hour',
  },
}
```

### **Example 3: Course Platform**

```typescript
export const appConfig = {
  appName: 'LearnHub',
  businessModel: {
    type: 'marketplace',
    offeringType: 'courses',
    multiVendor: true,
  },
  terminology: {
    item: 'Course',
    provider: 'Instructor',
    fulfillment: 'Enrollment',
  },
  pricing: {
    model: 'subscription',  // Monthly subscription
  },
}
```

---

## 🚀 Common Use Cases

| Use Case | offeringType | multiVendor | pricing.model | Notes |
|----------|-------------|-------------|---------------|-------|
| **Laundry Service** | `services` | `true` | `per_weight` | Add weight fields |
| **E-commerce** | `products` | `false` | `per_item` | Standard setup |
| **Marketplace** | `products` | `true` | `per_item` | Multi-vendor |
| **Booking Platform** | `bookings` | `true` | `per_hour` | Add time slots |
| **Course Platform** | `courses` | `true` | `subscription` | Add enrollment |
| **Rental Service** | `services` | `true` | `per_hour` | Add duration |

---

## ✅ Post-Clone Checklist

After cloning, verify:

- [ ] App name displays correctly everywhere
- [ ] Logo and branding assets are correct
- [ ] Database connection works
- [ ] Authentication works (Clerk)
- [ ] Payment flow works (Stripe test mode)
- [ ] Terminology is correct throughout app
- [ ] SEO metadata is updated
- [ ] Email templates have correct branding
- [ ] Mobile responsive design still works
- [ ] All core flows work (browse, cart, checkout, order)

---

## 🆘 Troubleshooting

### **"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

### **Database connection errors**
- Verify `.env.local` has correct connection strings
- Check database is accessible from your IP
- Ensure database exists

### **Clerk authentication not working**
- Create new Clerk application
- Use test/development keys
- Configure authorized domains in Clerk dashboard

### **Stripe payments not working**
- Ensure using test mode keys (`pk_test_...`, `sk_test_...`)
- Configure webhooks in Stripe dashboard

---

**Need help?** Check the [main documentation](./README.md) or [open an issue](https://github.com/your-repo/issues).

---

**Happy Cloning! 🎉**
