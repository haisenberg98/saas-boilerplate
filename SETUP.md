# 🚀 Quick Setup Guide

This guide helps you set up this SaaS boilerplate on a new machine or for a new project.

---

## Prerequisites

- Node.js (v18+)
- Git
- Database account (Neon.tech or PostgreSQL)
- Clerk account (for authentication)
- Stripe account (for payments)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <this-repo-url> my-project
cd my-project

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Set up database
npx prisma generate
npx prisma migrate dev --name init

# 5. Start development server
npm run dev
```

Visit http://localhost:3000

---

## Configuration

### 1. App Configuration
Edit `config/app.config.ts` to customize:
- App name and description
- Business model type
- Terminology (labels used throughout app)
- Pricing model
- Features to enable/disable

### 2. Branding
Edit `config/branding.config.ts` to customize:
- Brand colors
- Logo paths
- Typography
- Component styling

### 3. Features
Edit `config/features.config.ts` to enable/disable features

---

## Environment Variables

Create `.env.local` with these required variables:

```env
# Database (Neon.tech or PostgreSQL)
POSTGRES_PRISMA_URL="postgresql://..."
POSTGRES_URL_NON_POOLING="postgresql://..."
DATABASE_URL="postgresql://..."
POSTGRES_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Payments (Stripe)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."

# Storage (Google Cloud Storage - Optional)
GCLOUD_SERVICE_ACCOUNT_JSON="base64_encoded_json..."

# Email (Resend - Optional)
RESEND_API_KEY="re_..."

# App Configuration
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
NODE_ENV="development"
```

See `.env.example` for detailed setup instructions for each service.

---

## Customization for Your Project

1. **Update Configuration**
   - Edit `config/app.config.ts` with your app details
   - Edit `config/branding.config.ts` with your brand colors

2. **Add Logo & Assets**
   - Replace files in `/public` folder
   - Update logo paths in `config/branding.config.ts`

3. **Customize Database Schema**
   - Edit `prisma/schema.prisma` to add your specific fields
   - Run `npx prisma migrate dev --name your_migration_name`

4. **Update Metadata**
   - SEO settings in `config/app.config.ts`
   - Verify `app/(app)/page.tsx` uses correct metadata

---

## Documentation

- **Full Documentation**: See [docs/README.md](docs/README.md)
- **Cloning Guide**: See [docs/CLONING_GUIDE.md](docs/CLONING_GUIDE.md)
- **Configuration Details**: Check inline comments in `/config` files

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### Database connection errors
- Verify `.env.local` has correct connection strings
- Ensure database exists and is accessible

### Port 3000 already in use
```bash
npx kill-port 3000
```

---

## Next Steps

1. Test the application locally
2. Customize for your use case
3. Deploy to production (Vercel recommended)

For detailed instructions, see [docs/CLONING_GUIDE.md](docs/CLONING_GUIDE.md)
