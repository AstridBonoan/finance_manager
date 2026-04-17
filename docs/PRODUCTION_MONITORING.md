# Production Monitoring & Observability Guide

## Overview

This guide covers monitoring, logging, alerting, and observability for the Finance Manager application in production.

## Monitoring Stack

```
Application
  ├── Logs → Vercel Logs / Railway Logs
  ├── Metrics → Prometheus / Datadog
  ├── Errors → Sentry / Rollbar
  ├── Performance → Web Vitals / Lighthouse
  └── Uptime → UptimeRobot / Healthchecks
```

## Application Health Checks

### Backend Health Endpoint

Add to NestJS API:

```typescript
// apps/api/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };
  }

  @Get('db')
  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { db: 'connected' };
    } catch (e) {
      return { db: 'failed', error: e.message };
    }
  }
}
```

### Monitor Health Endpoint

```bash
# Test endpoint
curl https://api.yourdomain.com/health
# Response:
# {
#   "status": "ok",
#   "timestamp": "2026-04-17T...",
#   "uptime": 3600,
#   "memory": {...}
# }
```

## Log Aggregation

### Vercel Frontend Logs

Automatic logs available:
- Build logs: `Deployments → [Deployment] → Logs`
- Function logs: `Deployments → Logs`
- Edge function logs

Access:
```bash
# Via Vercel CLI
vercel logs

# Watch logs
vercel logs --tail
```

### Railway Backend Logs

```bash
# Via Railway CLI
railway logs

# Watch logs (tail mode)
railway logs --tail

# Filter by service
railway logs --service api

# Search in logs
railway logs | grep error
```

### Structured Logging

Add to backend:

```typescript
// apps/api/src/main.ts
import { Logger } from '@nestjs/common';

const logger = new Logger();

app.use((req, res, next) => {
  logger.log({
    method: req.method,
    path: req.path,
    timestamp: new Date(),
    ip: req.ip,
  });
  next();
});

// In services
logger.log('Transaction created', { transactionId, userId });
logger.error('Database error', error.message);
```

### Winston Logger (Production)

```bash
pnpm add winston
```

```typescript
// apps/api/src/common/logger.service.ts
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});
```

## Error Tracking with Sentry

### Setup

```bash
pnpm add @sentry/nextjs @sentry/node
```

### Frontend Configuration

```typescript
// apps/web/next.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Backend Configuration

```typescript
// apps/api/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Catch all errors
process.on('unhandledRejection', (reason) => {
  Sentry.captureException(reason);
});
```

### Sentry Dashboard

1. Go to https://sentry.io
2. Create project
3. Get DSN
4. Add to GitHub Secrets:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
   ```

## Performance Monitoring

### Web Vitals

```typescript
// apps/web/src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Core Web Vitals

Vercel Dashboard shows:
- **LCP** (Largest Contentful Paint) - < 2.5s
- **FID** (First Input Delay) - < 100ms
- **CLS** (Cumulative Layout Shift) - < 0.1

Target:
- ✅ LCP: < 2.5s
- ✅ FID: < 100ms
- ✅ CLS: < 0.1

### API Performance

```typescript
// Track API response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  next();
});
```

## Alerting

### Vercel Alerts

1. Dashboard → Settings → Alerts
2. Configure:
   - Build failures
   - Deployment failures
   - Performance degradation

### Railway Alerts

1. Dashboard → Environment → Alerts
2. Set up:
   - CPU usage > 80%
   - Memory usage > 85%
   - Deploy failures
   - Health check failures

### Email Alerts

```bash
# Vercel
Settings → Notification Preferences
→ Enable email for deployments

# Railway
Notifications → Email
→ Select alert types
```

### Slack Integration

**Vercel + Slack:**

1. Go to https://vercel.com/integrations/slack
2. Install
3. Connect Vercel project
4. Select channel
5. Choose notification types

**Railway + Slack:**

1. Go to Railway project → Settings
2. Integrations → Slack
3. Connect workspace
4. Select channel

### Uptime Monitoring

Use UptimeRobot:

1. Go to https://uptimerobot.com
2. Add monitors:
   - Frontend: https://yourdomain.com
   - API: https://api.yourdomain.com/health
3. Set alert contacts (email, Slack, SMS)
4. Check interval: 5 minutes

```bash
# Add to status page
https://stats.uptimerobot.com/your-id
```

## Metrics Collection

### Prometheus

```bash
pnpm add prom-client
```

```typescript
// apps/api/src/metrics/metrics.controller.ts
import { register, Counter, Histogram } from 'prom-client';

const httpRequests = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpDuration = new Histogram({
  name: 'http_duration_ms',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status_code'],
});

@Controller('metrics')
export class MetricsController {
  @Get()
  metrics() {
    return register.metrics();
  }
}
```

### Datadog Integration

Alternative: Use Datadog for full observability

```typescript
// Install Datadog
pnpm add @datadog/browser-rum @datadog/browser-logs

// Initialize in frontend
import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
  applicationId: process.env.NEXT_PUBLIC_DD_APP_ID,
  clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN,
  site: 'datadoghq.com',
  service: 'finance-manager',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION,
  sessionSampleRate: 100,
  sessionReplaySampleRate: 20,
  trackUserInteractions: true,
});
```

## Dashboard Setup

### Grafana Dashboard

Connect to Prometheus/metrics:

```json
{
  "dashboard": {
    "title": "Finance Manager Production",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "API Response Time",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_duration_ms)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(errors_total[5m])"
          }
        ]
      },
      {
        "title": "Database Connections",
        "targets": [
          {
            "expr": "db_connections_active"
          }
        ]
      }
    ]
  }
}
```

## Observability Checklist

### Daily Checks (Automated)

- [ ] Uptime check - UptimeRobot
- [ ] Error rate - Sentry
- [ ] Performance - Vercel Analytics
- [ ] Database health - Railway dashboard

### Weekly Reviews

- [ ] Error trends
- [ ] Performance degradation
- [ ] Resource usage
- [ ] Traffic patterns
- [ ] Cost analysis

### Monthly Analysis

- [ ] Full system health
- [ ] Capacity planning
- [ ] Cost optimization
- [ ] Security audit
- [ ] Performance optimization

## Common Issues & Solutions

### High Error Rate

```
Issue: Sentry shows > 5% errors
Fix:
1. Check recent deployments
2. Review error logs
3. Check database connectivity
4. Verify API rate limits
5. Rollback if needed
```

### Slow API Response

```
Issue: API response time > 2s
Fix:
1. Check database query performance
2. Review N+1 query problems
3. Enable database indexes
4. Add caching layer (Redis)
5. Scale API instance
```

### Memory Leak

```
Issue: Memory usage constantly increasing
Fix:
1. Review log files for patterns
2. Check for unreleased connections
3. Verify garbage collection
4. Profile with Node inspector
5. Restart service if critical
```

### Database Locked

```
Issue: Frequent "database locked" errors
Fix:
1. Check active connections
2. Terminate long-running queries
3. Increase connection pool size
4. Optimize slow queries
5. Upgrade database instance
```

## Runbooks

### Deploy with Monitoring

```bash
# Before deploy
1. Check error rate (< 1%)
2. Check API response time (< 1s)
3. Verify database is healthy
4. Create backup

# During deploy
1. Monitor errors
2. Monitor performance
3. Check user reports

# After deploy
1. Run smoke tests
2. Monitor for 30 minutes
3. Alert if issues detected
```

### Emergency Rollback

```bash
# 1. Immediate action
git revert <commit-hash>
git push origin master

# 2. Monitor
vercel deployments
railway logs --tail

# 3. Verify
curl https://yourdomain.com
curl https://api.yourdomain.com/health
```

## SLA Target

```
Availability: 99.9% (30 min downtime/month)
Response Time: < 200ms (p95)
Error Rate: < 0.1%
Update Frequency: < 15 min
```

## Monitoring Tools Summary

| Tool | Purpose | Cost |
|------|---------|------|
| Vercel | Frontend monitoring | Included |
| Railway | Backend logs | Included |
| Sentry | Error tracking | Free tier + pro |
| UptimeRobot | Uptime monitoring | Free tier |
| Datadog | Full observability | ~$15/month |
| Grafana | Metrics dashboard | Free |

## Next Steps

1. Set up Sentry account
2. Configure email/Slack alerts
3. Add UptimeRobot monitoring
4. Create monitoring dashboard
5. Document alert procedures
6. Train team on monitoring

---

**Last Updated:** April 17, 2026  
**Status:** Production Ready  
**Review Schedule:** Monthly
