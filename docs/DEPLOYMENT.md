# Finance Manager - Deployment Guide

## Overview

This guide covers deploying Finance Manager to production using GitHub Actions, Docker, and cloud platforms.

## Deployment Architecture

```
GitHub Repository
  └── Main Branch
      └── GitHub Actions CI/CD
          ├── Type Check
          ├── Build
          ├── Test
          └── Deploy (optional)
              ├── Docker Build & Push
              ├── Database Migrations
              └── Service Deployment
                  ├── API Server (Vercel, Heroku, AWS)
                  └── Web App (Vercel, Netlify, AWS)
```

## Supported Platforms

### Frontend Deployment Options

1. **Vercel** (Recommended) - Easiest for Next.js
2. **Netlify** - Static + serverless
3. **AWS Amplify** - Full AWS integration
4. **DigitalOcean** - Self-hosted
5. **Render** - Simple deployment

### Backend Deployment Options

1. **Vercel** - Serverless functions
2. **Heroku** - Simple PaaS
3. **Railway** - Modern PaaS
4. **DigitalOcean App Platform** - Containerized
5. **AWS ECS** - Scalable containers
6. **Google Cloud Run** - Serverless containers

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Build succeeds locally
- [ ] Environment variables documented
- [ ] Database migrations tested
- [ ] Secrets configured in CI/CD
- [ ] Branch protection enabled
- [ ] Monitoring configured
- [ ] Rollback plan documented

## Step 1: Prepare for Deployment

### Create Deployment Branch

```bash
git checkout master
git pull origin master
git checkout -b release/v1.0.0

# Update version
# Commit
git push -u origin release/v1.0.0
```

### Update .env for Production

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_URL=https://yourdomain.com
JWT_EXPIRATION=24h
```

## Step 2: Deploy Frontend with Vercel

### Initial Setup

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

### Vercel Dashboard Configuration

1. Go to https://vercel.com
2. Import GitHub repository
3. Configure Project Settings:
   - **Framework**: Next.js
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `pnpm install`

### Environment Variables in Vercel

```bash
# In Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXTAUTH_SECRET=[from GitHub Secrets]
NEXTAUTH_URL=https://yourdomain.com
```

### Deploy via Git

Push to main branch - Vercel auto-deploys:

```bash
git push origin master
# → Vercel automatically builds and deploys
# → View deployment at https://yourdomain.vercel.app
```

## Step 3: Deploy Backend with Railway

### Railway Setup

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Create project
railway init

# 4. Link GitHub repository
# In Railway Dashboard → Deployments → GitHub

# 5. Configure environment
railway variables set DATABASE_URL "postgresql://..."
railway variables set JWT_SECRET "..."
railway variables set NODE_ENV "production"
```

### Railway Dashboard Configuration

1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Connect GitHub repository
5. Configure build settings:
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm run build`
   - **Start Command**: `pnpm run prod`

### Railway Environment Variables

```bash
railway variables set DATABASE_URL "postgresql://user:pass@host/db"
railway variables set JWT_SECRET "your-secret"
railway variables set CORS_ORIGIN "https://yourdomain.com"
```

## Step 4: Database Migration in Production

### Before First Deployment

```bash
# 1. Ensure PostgreSQL is accessible
psql -U user -h production-host -d finance_manager -c "SELECT 1;"

# 2. Run migrations
DATABASE_URL="postgresql://..." pnpm db:migrate:prod

# 3. Verify
psql -U user -h production-host -d finance_manager -c "\dt"
```

### Ongoing Migrations

Create GitHub Action for migrations:

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production
on:
  push:
    branches: [master]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run migrations
        run: pnpm db:migrate:prod
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
```

## Step 5: Setup Custom Domain

### Vercel Frontend

1. Go to Vercel Dashboard → Settings → Domains
2. Add domain
3. Update DNS records:
   ```
   CNAME vercel.com
   ```

### Railway Backend

1. Go to Railway Dashboard → Settings → Domains
2. Add domain
3. Update DNS records based on provider

### DNS Configuration

```
# Frontend: example.com
example.com              CNAME    yourdomain.vercel.app
www.example.vercel.app   CNAME    yourdomain.vercel.app

# Backend: api.example.com
api.example.com          CNAME    yourdomain-api.railway.app
```

## Step 6: SSL/TLS Certificate

### Vercel
- Automatic with Let's Encrypt
- No configuration needed

### Railway
- Automatic with Let's Encrypt
- No configuration needed

Verify:
```bash
curl -I https://yourdomain.com
# Should show: SSL certificate is valid
```

## Step 7: Monitoring & Alerts

### Vercel Analytics

1. Dashboard → Analytics
2. View performance metrics
3. Set up alerts

### Railway Logs

```bash
# View live logs
railway logs --prod

# Tail specific service
railway logs --service api
```

### Error Tracking

Add Sentry for error monitoring:

```typescript
// apps/web/next.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Step 8: Backup & Disaster Recovery

### Daily Backups

```bash
# Set up automated backups
# Option 1: Railway automatically backs up database
# Option 2: AWS RDS automated backups
# Option 3: Manual backup script

0 2 * * * pg_dump -U $USER $DB > /backups/backup-$(date +\%Y-\%m-\%d).sql
```

### Restore from Backup

```bash
# Restore to point-in-time
psql -U user -d finance_manager < /backups/backup-2026-04-17.sql

# Verify
psql -U user -d finance_manager -c "SELECT COUNT(*) FROM \"Transaction\";"
```

## Step 9: Rollback Procedure

### If Deployment Fails

```bash
# 1. Vercel - Automatic previous build
#    Dashboard → Deployments → Previous → Promote to Production

# 2. Railway - Revert deployment
#    Dashboard → Deployments → Previous → Deploy

# 3. Database - Restore from backup
DATABASE_URL="..." psql < /backups/backup-previous.sql

# 4. Verify services
curl https://api.yourdomain.com/health
curl https://yourdomain.com
```

## Step 10: Production Checklist

### Pre-Launch
- [ ] All tests passing
- [ ] No build errors
- [ ] Environment variables set
- [ ] Database configured
- [ ] SSL certificate valid
- [ ] Backups working
- [ ] Monitoring enabled
- [ ] Error tracking working
- [ ] Team notified

### Post-Launch
- [ ] Monitor logs for errors
- [ ] Check performance metrics
- [ ] Verify user can login
- [ ] Test critical workflows
- [ ] Monitor database connections
- [ ] Check API response times
- [ ] Verify payment processing (if enabled)

## Performance Optimization

### Frontend (Vercel)

```js
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    minimumCacheTTL: 60,
    formats: ['image/avif', 'image/webp'],
  },
};
```

### Backend (Railway)

```bash
# Enable compression
NODE_ENV=production pnpm run prod

# Set memory limits
NODE_OPTIONS="--max-old-space-size=1024"
```

## Security Hardening

### Frontend
- Enable Content Security Policy
- Set secure HTTP headers
- Disable X-Frame-Options

### Backend
- Enable CORS properly
- Use HTTPS everywhere
- Implement rate limiting
- Add request validation
- Use helmet.js

```typescript
// Backend security
import helmet from 'helmet';
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
```

## Scaling for Growth

### When Traffic Increases

**Vercel Frontend**
- Automatic, no action needed
- Scales from 0 to millions of requests

**Railway Backend**
- Upgrade instance size
- Add more replicas
- Use database connection pooling

**Database**
- Enable read replicas
- Add caching layer (Redis)
- Archive old data

## Deployment Summary

| Component | Platform | Auto-Deploy | Downtime |
|-----------|----------|-------------|----------|
| Frontend | Vercel | Yes | ~30s |
| Backend | Railway | No | Configurable |
| Database | Railway | N/A | N/A |

## Emergency Contacts

- Vercel Support: support@vercel.com
- Railway Support: support@railway.app
- GitHub Support: support@github.com

## Useful Commands

```bash
# View deployment history
railway deployments

# View current logs
railway logs --tail

# Open Railway dashboard
railway open

# Deploy specific branch
git push origin feature/branch

# Rollback to previous
railway rollback

# Check system status
curl https://api.yourdomain.com/health
```

## Next Steps

1. Choose deployment platforms
2. Configure Vercel account
3. Configure Railway account
4. Set up custom domains
5. Enable monitoring and alerts
6. Create runbooks for common operations
7. Schedule team training
8. Monitor metrics for 1-2 weeks

---

**Last Updated:** April 17, 2026  
**Status:** Production Ready  
**Estimated Deploy Time:** 5-10 minutes
