# Monitoring Setup Guide - Arthawork

## 1. Sentry Error Tracking

### Current Status: ✅ Configured

Sentry is already set up in `src/lib/sentry.ts` with:
- Browser tracing for performance
- Session replay for debugging
- Error filtering (ResizeObserver, network errors)

### Setup Steps (if not done):

1. **Create Sentry account**: https://sentry.io
2. **Create new project** (React)
3. **Get DSN** from Project Settings → Client Keys
4. **Add to Vercel env vars**:
   ```
   VITE_SENTRY_DSN=https://xxx@o123.ingest.sentry.io/123
   ```
5. **Redeploy** to activate

---

## 2. Uptime Monitoring

### Setup Uptime Robot (Free):

1. Go to: https://uptimerobot.com
2. Sign up (free tier = 50 monitors)
3. Click "Add New Monitor"
4. Configure:
   - **Monitor Type**: HTTPS
   - **Friendly Name**: Arthawork Production
   - **URL**: `https://arthawork.vercel.app`
   - **Monitoring Interval**: 5 minutes
5. Add alert contacts (email, WhatsApp, etc.)

---

## 3. Key Metrics to Watch

| Metric | Tool | Alert Threshold |
|--------|------|-----------------|
| Uptime | Uptime Robot | < 99.9% |
| Error Rate | Sentry | > 1% of sessions |
| Page Load | Sentry Performance | > 3 seconds |
| API Latency | Supabase Dashboard | > 500ms |

---

## 4. Supabase Monitoring

Built-in monitoring at: https://supabase.com/dashboard/project/sfkcncwbsoaqqteqguyf/reports

Check:
- Database connections
- API request count
- Storage usage

---

## Quick Verification Checklist

- [ ] `VITE_SENTRY_DSN` set in Vercel
- [ ] Uptime Robot configured
- [ ] Test error appears in Sentry
- [ ] Downtime alert works

---

*Last updated: January 3, 2026*
