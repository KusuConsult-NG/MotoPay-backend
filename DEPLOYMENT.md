# MotoPay Backend - Production Deployment Guide

## Overview
This guide covers deploying the MotoPay backend API to Vercel with proper database and environment configuration.

## Prerequisites
- Vercel account
- Database solution (Vercel Postgres recommended)
- Paystack account with live API keys
- SendGrid account for email

## Environment Variables

Set these in your Vercel project settings (**Settings → Environment Variables**):

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` or `file:./prod.db` | Database connection string |
| `FRONTEND_URL` | `https://moto-pay.vercel.app` | Frontend URL for CORS |
| `JWT_SECRET` | Strong random string | JWT signing secret |
| `REFRESH_TOKEN_SECRET` | Strong random string | Refresh token secret |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` | Paystack secret key (live) |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` | Paystack public key (live) |
| `SENDGRID_API_KEY` | Your SendGrid key | Email service API key |
| `EMAIL_FROM` | `noreply@motopay.pl.gov.ng` | Sender email address |
| `ADMIN_EMAIL` | `admin@psirs.gov.ng` | Admin login email |
| `ADMIN_PASSWORD` | Strong password | Admin login password |

### Optional Variables

| Variable | Value | Default | Description |
|----------|-------|---------|-------------|
| `NODE_ENV` | `production` | `development` | Environment mode |
| `PORT` | `5000` | `5000` | Server port |
| `API_VERSION` | `v1` | `v1` | API version |

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to your project dashboard
2. Click **Storage** → **Create Database**
3. Select **Postgres**
4. Copy the `DATABASE_URL` from dashboard
5. Add to environment variables

### Option 2: External PostgreSQL

Use any PostgreSQL provider (Railway, Supabase, etc.):

```bash
DATABASE_URL=postgresql://username:password@hostname:5432/database
```

### Option 3: SQLite (Development Only)

**Not recommended for production**, but possible for testing:

```bash
DATABASE_URL=file:./prod.db
```

## Deployment Steps

### 1. Run Migrations

After setting `DATABASE_URL`, run migrations via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Run migration command
vercel env pull .env.production
npx prisma migrate deploy
```

Or configure in `package.json`:

```json
{
  "scripts": {
    "build": "tsc && npx prisma generate && npx prisma migrate deploy"
  }
}
```

### 2. Seed Initial Data

For first deployment, seed the database:

```bash
npx tsx prisma/seed.ts
```

This creates:
- Admin user (`admin@psirs.gov.ng` / password from `ADMIN_PASSWORD`)
- Sample agent user
- Compliance items
- Sample vehicle data

### 3. Deploy

```bash
vercel --prod
```

## Verification

### 1. Check API Health

```bash
curl https://moto-pay-backend.vercel.app/
```

Expected response:
```json
{
  "success": true,
  "message": "Welcome to MotoPay API",
  "version": "v1"
}
```

### 2. Test Authentication Endpoint

```bash
curl -X POST https://moto-pay-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@psirs.gov.ng","password":"YOUR_PASSWORD"}'
```

### 3. Check CORS

From frontend domain:
- API requests should succeed without CORS errors
- Verify in browser DevTools → Network tab

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] `FRONTEND_URL` matches actual frontend domain  
- [ ] Database created and accessible
- [ ] Migrations run successfully (`npx prisma migrate deploy`)
- [ ] Database seeded with initial data
- [ ] `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are strong, unique values
- [ ] Paystack keys are **live** keys (not test)
- [ ] SendGrid configured and email sending works
- [ ] Admin user can login
- [ ] API health check returns success

## Security Best Practices

### 1. Use Strong Secrets

Generate cryptographically secure secrets:

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Rotate Secrets Regularly

- Change JWT secrets periodically
- Update in Vercel environment variables
- Redeploy application

### 3. Rate Limiting

Already configured in the app:
- Auth endpoints: 5 requests per 15 minutes
- General API: 100 requests per 15 minutes

### 4. Database Backups

- Vercel Postgres: Automatic backups included
- External DB: Configure according to provider

## Monitoring & Logs

### View Logs

```bash
vercel logs https://moto-pay-backend.vercel.app
```

Or in Vercel Dashboard:
- Go to **Deployments**
- Click on a deployment
- View **Build Logs** and **Function Logs**

### Error Tracking

Consider integrating Sentry:

```bash
npm install @sentry/node
```

## Custom Domain

To use custom domain like `api.motopay.pl.gov.ng`:

1. **Project Settings → Domains**
2. Add domain
3. Configure DNS records
4. Update `FRONTEND_URL` CORS to use new frontend domain

## Database Migrations

When updating the schema:

1. Update `prisma/schema.prisma`
2. Create migration locally:
   ```bash
   npx prisma migrate dev --name description
   ```
3. Commit migration files
4. Push to GitHub
5. Migrations run automatically on deployment (if configured in build script)

Or manually:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Troubleshooting

### "Database does not exist"

**Solution**: Run migrations
```bash
npx prisma migrate deploy
```

### "CORS Error"

**Solution**: Verify `FRONTEND_URL` environment variable
- Should match frontend domain exactly
- No trailing slash

### "JWT Error"

**Solution**: Ensure `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are set

### Build Fails

- Check Vercel build logs
- Verify all dependencies are in `package.json`
- Ensure TypeScript compiles locally (`npm run build`)

## Support

- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs
- GitHub Issues: Link to your repo issues
