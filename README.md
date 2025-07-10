# Scriptas Store

This is a Next.js store with authentication, Stripe payments, and invoice management.

## Setup Instructions

1. Install dependencies:
```
npm install
```

2. Setup environment variables in `.env.local` (see below).

3. Run Prisma migrations:
```
npx prisma migrate dev --name init
```

4. Run the development server:
```
npm run dev
```

---

### Environment Variables (`.env.local`):

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your_nextauth_secret_here"
STRIPE_SECRET_KEY="your_stripe_secret_key_here"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="your_stripe_webhook_secret_here"
```

## Git Push

```
git init
git add .
git commit -m "Initial commit: Next.js Scriptas Store setup"
git remote add origin <your_repo_url>
git push -u origin main
```
