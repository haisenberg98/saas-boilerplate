# 🚀 SaaS Boilerplate - Multi-Vendor Marketplace Platform

A production-ready, feature-rich SaaS boilerplate for building multi-tenant marketplace applications. Clone this boilerplate to quickly launch your next marketplace, service platform, e-commerce site, or booking system.

## ✨ Features

### **Core Infrastructure**
- ⚡ **Next.js 14** with App Router
- 🔷 **TypeScript** for type safety
- 🗄️ **Prisma ORM** with PostgreSQL
- 🔐 **Clerk** authentication
- 💳 **Stripe** payments (test mode ready)
- 📦 **Google Cloud Storage** for file uploads
- 📧 **Resend** for transactional emails
- 🎨 **Tailwind CSS** + **Shadcn UI** components

### **Marketplace Features**
- 🏪 **Multi-vendor/Multi-provider** support
- 🛍️ **Item/Service catalog** with categories
- 🛒 **Shopping cart** with Redis state management
- 💰 **Flexible pricing models** (per-item, per-weight, subscription-ready)
- 🚚 **Delivery zones** with multiple shipping methods
- 📦 **Order management** with fulfillment tracking
- ⭐ **Review system** (items + providers)
- 🎟️ **Discount codes** and promotions
- 📰 **Blog/Content management** system
- 📮 **Newsletter** subscriptions

### **Admin Features**
- 📊 **Admin dashboard**
- 👥 **User management** with role-based access
- 🏷️ **Category management**
- 📝 **Content management** (posts, promotions)
- 💬 **Review moderation**
- 🔍 **Search analytics** (tracked keywords)

### **Developer Experience**
- 🎯 **tRPC** for end-to-end type-safe APIs
- 🔄 **Redux Toolkit** for state management
- 🎨 **Centralized configuration** (`/config` folder)
- 🔧 **Feature flags** for easy customization
- 📱 **Responsive design** (mobile-first)
- 🌍 **Multi-currency support** (NZD, AUD)
- 🎨 **Themeable** design system

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration](#configuration)
3. [Project Structure](#project-structure)
4. [Cloning for New Project](#cloning-for-new-project)
5. [Customization Guide](#customization-guide)
6. [Deployment](#deployment)
7. [Contributing](#contributing)

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- PostgreSQL database (Neon, Vercel, or local)
- Clerk account (free tier available)
- Stripe account (test mode)
- Google Cloud Storage bucket (optional)

### **Installation**

```bash
# Clone the repository
git clone <your-boilerplate-repo>
cd saas-boilerplate

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see the homepage!

---

## ⚙️ Configuration

The boilerplate uses a centralized configuration system in the `/config` folder:

### **Main Configuration Files:**

#### **1. `config/app.config.ts`** - Core Application Settings
```typescript
export const appConfig = {
  appName: 'Your SaaS Name',
  businessModel: {
    type: 'marketplace',           // 'marketplace' | 'single-vendor' | 'saas-subscription'
    offeringType: 'services',      // 'products' | 'services' | 'bookings' | 'courses'
    multiVendor: true,
  },
  terminology: {
    item: 'Service',               // What you're selling
    provider: 'Shop',              // Who provides it
    fulfillment: 'Delivery',       // How it's delivered
  },
  pricing: {
    model: 'per_item',             // 'per_item' | 'per_weight' | 'per_hour' | 'subscription'
    defaultCurrency: 'NZD',
  },
  // ... and more
}
```

#### **2. `config/features.config.ts`** - Feature Toggles
Turn features on/off without code changes:
```typescript
export const featureFlags = {
  customer: {
    cart: true,
    wishlist: true,
    reviews: true,
  },
  vendor: {
    itemCreation: true,
    promotions: true,
  },
  // ... and more
}
```

#### **3. `config/branding.config.ts`** - Theme & Design
Customize colors, fonts, logos:
```typescript
export const brandingConfig = {
  colors: {
    primary: '#42413D',
    secondary: '#f7f5ec',
    accent: '#dc3522',
  },
  assets: {
    logo: '/logo.png',
    ogImage: '/og-image.png',
  },
  // ... and more
}
```

**See [CONFIGURATION.md](./CONFIGURATION.md) for full details.**

---

## 📁 Project Structure

```
saas-boilerplate/
├── app/                    # Next.js App Router
│   ├── (app)/             # Main application routes
│   │   ├── item/          # Item/Service management
│   │   ├── provider/      # Provider/Vendor management
│   │   ├── orders/        # Order management
│   │   ├── checkout/      # Checkout flow
│   │   └── ...
│   ├── api/               # API routes (tRPC, webhooks)
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── global/           # Global components (cards, buttons, etc)
│   ├── layouts/          # Layout components (header, footer, modals)
│   └── ui/               # Shadcn UI components
├── config/               # 🎯 Configuration files (START HERE!)
│   ├── app.config.ts     # Main app configuration
│   ├── features.config.ts # Feature flags
│   └── branding.config.ts # Theme & design
├── lib/                  # Utility functions
├── prisma/               # Database schema & migrations
│   └── schema.prisma     # Database models
├── redux/                # Redux state management
│   └── slices/           # Redux slices (cart, search, etc)
├── server/               # tRPC server & API logic
│   └── index.ts          # tRPC procedures
├── types/                # TypeScript type definitions
├── docs/                 # 📚 Documentation
└── public/               # Static assets
```

---

## 🔄 Cloning for New Project

### **Example: Creating "Bilas Laundry" from Boilerplate**

**Step 1: Clone the Boilerplate**
```bash
git clone saas-boilerplate bilas-laundry
cd bilas-laundry
npm install
```

**Step 2: Configure for Your Business**

Edit `config/app.config.ts`:
```typescript
export const appConfig = {
  appName: 'Bilas Laundry',
  businessModel: {
    type: 'marketplace',
    offeringType: 'services',
    multiVendor: true,
  },
  terminology: {
    item: 'Laundry Service',
    items: 'Laundry Services',
    provider: 'Laundry Shop',
    providers: 'Laundry Shops',
    fulfillment: 'Pickup & Delivery',
  },
  pricing: {
    model: 'per_weight',  // Weight-based pricing for laundry
    defaultCurrency: 'NZD',
  },
  // Update branding, SEO, etc.
}
```

**Step 3: Customize Database Schema (if needed)**

Add domain-specific fields to `prisma/schema.prisma`:
```prisma
model Item {
  // ... existing fields

  // Laundry-specific fields
  weightBased     Boolean?
  turnaroundTime  Int?
  fabricTypes     String[]?
  careInstructions String?
}
```

Then migrate:
```bash
npx prisma migrate dev --name add_laundry_fields
```

**Step 4: Update Branding**
- Replace logos in `/public`
- Update colors in `config/branding.config.ts`
- Update metadata in `app/(app)/page.tsx`

**Step 5: Environment Setup**
```bash
cp .env.local.example .env.local
# Add your Bilas Laundry credentials
```

**Step 6: Deploy!**
```bash
npm run build
# Deploy to Vercel, Railway, or your platform of choice
```

**See [CLONING.md](./CLONING.md) for detailed step-by-step guide.**

---

## 🎨 Customization Guide

### **Common Customizations:**

#### **1. Change Pricing Model**
```typescript
// config/app.config.ts
pricing: {
  model: 'subscription',  // Enable subscription-based pricing
}
```

#### **2. Disable Multi-Vendor**
```typescript
businessModel: {
  multiVendor: false,  // Single-vendor mode
}
```

#### **3. Add New Features**
```typescript
// config/features.config.ts
experimental: {
  aiRecommendations: true,  // Enable AI features
  loyaltyPoints: true,       // Add gamification
}
```

#### **4. Change Theme Colors**
```typescript
// config/branding.config.ts
colors: {
  primary: '#your-brand-color',
  secondary: '#your-secondary-color',
}
```

**See [CUSTOMIZATION.md](./CUSTOMIZATION.md) for advanced customization.**

---

## 🚀 Deployment

### **Recommended: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### **Other Platforms:**
- **Railway**: Supports Next.js + PostgreSQL
- **AWS Amplify**: Full Next.js support
- **DigitalOcean App Platform**: Easy deployment
- **Self-hosted**: Docker + nginx

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for platform-specific guides.**

---

## 📚 Documentation

- [Configuration Guide](./CONFIGURATION.md) - All config options explained
- [Cloning Guide](./CLONING.md) - Step-by-step cloning instructions
- [Customization Guide](./CUSTOMIZATION.md) - Advanced customization
- [Database Schema](./DATABASE.md) - Understanding the data model
- [API Reference](./API.md) - tRPC procedures documentation
- [Deployment Guide](./DEPLOYMENT.md) - Deploy to production

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14, React 18 |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **API** | tRPC (type-safe) |
| **Auth** | Clerk |
| **Payments** | Stripe |
| **Storage** | Google Cloud Storage |
| **Email** | Resend |
| **State** | Redux Toolkit |
| **Styling** | Tailwind CSS + Shadcn UI |
| **Deployment** | Vercel (recommended) |

---

## 📄 License

[Your License Here]

---

## 🤝 Support

- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Community Discord](https://discord.gg/your-server)

---

## 🎉 Success Stories

Built with this boilerplate:
- **Bilas Laundry** - Multi-vendor laundry marketplace
- [Your project here!]

---

**Happy Building! 🚀**
