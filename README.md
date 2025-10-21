# 🚀 SaaS Boilerplate - Multi-Vendor Marketplace Platform

> A production-ready, fully-featured SaaS boilerplate for building multi-tenant marketplace applications.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-brightgreen)](https://www.prisma.io/)

---

## ⚡ Quick Start

```bash
# Clone
git clone <repo-url>
cd saas-boilerplate

# Install
npm install

# Setup environment
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Database
npx prisma migrate dev
npx prisma generate

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## ✨ What's Included?

### **Tech Stack**
- ⚡ **Next.js 14** + **TypeScript**
- 🗄️ **Prisma** + **PostgreSQL**
- 🔐 **Clerk** - Authentication
- 💳 **Stripe** - Payments
- 🎨 **Tailwind CSS** + **Shadcn UI**
- 📦 **Google Cloud Storage**
- 📧 **Resend** - Emails
- 🎯 **tRPC** - Type-safe APIs

### **Features**
- ✅ Multi-vendor marketplace
- ✅ Item/Service catalog
- ✅ Shopping cart & checkout
- ✅ Order management & tracking
- ✅ Review system
- ✅ Discount codes & promotions
- ✅ Admin dashboard
- ✅ Blog/Content management
- ✅ Multi-currency support

---

## 📖 Documentation

- **[Full Documentation](./docs/README.md)**
- **[Cloning Guide](./docs/CLONING_GUIDE.md)** - Clone for new project
- **[Refactoring Progress](./REFACTORING_PROGRESS.md)** - Current status

---

## 🔧 Centralized Configuration

All customization in `/config`:

```typescript
// config/app.config.ts
export const appConfig = {
  appName: 'Your SaaS',
  terminology: {
    item: 'Product',      // Customize terminology
    provider: 'Vendor',
  },
  pricing: {
    model: 'per_item',    // Flexible pricing
  },
}
```

---

## 🚀 Perfect For

- 🏪 Marketplaces
- 🧺 Service Platforms (laundry, cleaning)
- 📚 Course Platforms
- 📅 Booking Systems
- 🏠 Rental Platforms

---

## 🔄 Clone for New Project

See [CLONING_GUIDE.md](./docs/CLONING_GUIDE.md) for step-by-step instructions.

---

**Built with ❤️ for fast development.**
