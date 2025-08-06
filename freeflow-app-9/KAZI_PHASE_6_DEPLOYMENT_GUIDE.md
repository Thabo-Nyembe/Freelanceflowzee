# KAZI – Phase 6 Deployment Guide  
_Comprehensive instructions for rolling out the Enterprise-grade enhancements while keeping full cost control_

---

## Table of Contents
1. Pre-deployment Cost Analysis & Warnings  
2. Step-by-Step Deployment Checklist  
3. Environment Variable Configuration  
4. Database Setup & Migrations  
5. Cost Monitoring Setup  
6. Feature Flag Configuration  
7. Testing & Validation Procedures  
8. Post-deployment Monitoring  
9. Troubleshooting Common Issues  
10. Performance Optimisation Tips  
11. Cost Optimisation Recommendations  
12. Rollback Procedures  

---

## 1   Pre-deployment Cost Analysis & Warnings
| Resource | Free Tier (Hobby) | Projected Usage* | Over-age Risk | Mitigation |
|----------|------------------|------------------|---------------|------------|
| Function Executions | 100 k / mo | ~45 k (sampling on) | Low | Sampling, matcher-based middleware |
| Image Optimisations | 1 k / mo | **0** | None | next/image cache, no dynamic sizes |
| Bandwidth | 100 GB / mo | 25 GB | Medium | Enable CDN cache headers |
| Build Minutes | 100 / mo | 30 | Low | Incremental builds |

\*Based on `PRODUCTION_PRESET` in `config/cost-optimization.ts`.

**Critical Warnings**
* Enabling `serverAnalytics` or disabling sampling may 10× execution count.  
* Edge Middleware runs on _every_ matched request—verify `middleware.matcher` before going live.  
* Upptime checks default to **12 × 24 × 30 = 8 640** exec/mo – keep or move to GitHub-hosted runners.

---

## 2   Step-by-Step Deployment Checklist
1. **Sync `main`**  
   ```bash
   git pull origin main
   pnpm install   # or npm / yarn
   ```
2. **Set Runtime Config**  
   ```bash
   cp .env.example .env.production
   # fill values – see Section 3
   ```
3. **Prepare DB** – run SQL in Section 4 on Supabase.  
4. **Feature Flags** – edit `config/cost-optimization.ts` (Section 6).  
5. **Build & Test Locally**  
   ```bash
   NEXT_PUBLIC_ENVIRONMENT=production pnpm build
   pnpm start
   # visit http://localhost:9323
   ```
6. **Create Vercel Project (if new)**  
   - Link Git repo.  
   - Set Environment Variables (Section 3).  
7. **Enable Edge Functions**  
   - `vercel project link` → Project Settings → **Functions** → Edge Runtime.  
8. **Deploy**  
   ```bash
   vercel --prod
   ```  
9. **Smoke-test Production** (Section 7).  
10. **Activate Upptime** – push `.upptimerc.yml` to monitoring repo.  
11. **Announce GA** – internal Slack, status page.

---

## 3   Environment Variable Configuration
| Variable | Example | Feature |
|----------|---------|---------|
| `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` | `prj_123` | Analytics (free) |
| `SUPABASE_URL` | `https://xyz.supabase.co` | All data |
| `SUPABASE_ANON_KEY` | `public-key` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | `service-key` | Security audit jobs |
| `REDIS_URL` | `rediss://:<pw>@eu1.upstash.io` | Rate-limiting |
| `OPENAI_API_KEY` | `sk-...` | AI translation |
| `SENTRY_DSN` | `https://abc@o0.ingest.sentry.io/0` | Error tracing |
| `UPPTIME_GH_TOKEN` | GitHub PAT | SLA checks |
| `SLACK_WEBHOOK_URL` | `https://hooks.slack.com/...` | Cost / uptime alerts |
| `COST_ALERT_SLACK_WEBHOOK` | same | Cost module |

_Optional_: `PD_SERVICE_KEY`, `NEXT_PUBLIC_APP_VERSION`, etc.

---

## 4   Database Setup & Migrations
1. Open Supabase SQL Editor.  
2. Execute:

```sql
-- === Analytics
create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text,
  properties jsonb,
  created_at timestamptz default now()
);

-- === SLA
create table if not exists uptime_metrics (
  id bigint generated always as identity primary key,
  region text,
  status text,
  response_time_ms int,
  checked_at timestamptz default now()
);

create table if not exists sla_incidents (
  id uuid primary key default gen_random_uuid(),
  severity text,
  description text,
  started_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now()
);
```
3. **RLS Policies**  
   - `analytics_events`: Enable **row level security**; allow insert for `authenticated`.  
   - `uptime_metrics`, `sla_incidents`: service-role only.

---

## 5   Cost Monitoring Setup
1. **Activate cost module**  
   ```ts
   import { logCostDebugReport } from '@/config/cost-optimization';
   if (process.env.NODE_ENV !== 'production') logCostDebugReport();
   ```
2. **Set daily cron on GitHub** to run `node scripts/cost-report.js` which posts `generateCostDebugReport()` to Slack.  
3. **Enable Sentry Performance** – sample rate 0.1.  
4. **Upptime** – schedule every 60 s (edit to 300 s if cost-sensitive).

---

## 6   Feature Flag Configuration
Edit `config/cost-optimization.ts`:

```ts
// Example: disable server analytics
PRODUCTION_PRESET.features.serverAnalytics = false;

// Reduce analytics sampling to 10 %
PRODUCTION_PRESET.sampling.analytics = 10;
```

Staging override:

```bash
NEXT_PUBLIC_ENVIRONMENT=staging
```

---

## 7   Testing & Validation Procedures
1. **Unit & Integration**  
   ```bash
   pnpm test
   ```
2. **E2E (Playwright)**  
   ```bash
   pnpm exec playwright test
   ```
3. **Load Test** – k6 script @ 2× expected peak.  
4. **Manual Smoke Test**  
   - Dashboard loads < 800 ms p95  
   - Login / Logout  
   - AI Tool modal works  
   - Edge Middleware adds CSP header  
   - `/api/health` returns 200 HEAD.  
5. **Localization QA** – switch locale cookie, verify strings.

---

## 8   Post-deployment Monitoring
| Tool | Metric | Alert |
|------|--------|-------|
| Vercel Analytics | Core Web Vitals | Slack (`#web-perf`) |
| Upptime | Uptime < 99.9 % | PagerDuty |
| Sentry | Error rate > 0.5 %/min | Auto-page |
| Cost Module | 80 % daily exec quota | Slack (`#cost-alerts`) |

Run `pnpm run monitor` script (cron) to aggregate.

---

## 9   Troubleshooting Common Issues
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 502 on all routes | Env vars missing | Verify Section 3 in Vercel |
| High latency (>2 s) | Edge cache disabled | Check `Cache-Control` headers |
| Function over-usage | Sampling off | Lower `sampling.*` values |
| Missing translations | Locale file not loaded | Add key to `/locales/{lang}.json` |
| Upptime red | GitHub PAT invalid | Regenerate `UPPTIME_GH_TOKEN` |

---

## 10   Performance Optimisation Tips
1. Enable **stale-while-revalidate** in `NextResponse` for heavy pages.  
2. Autoload heavy components with `next/dynamic` `ssr: false`.  
3. Use `next/image` with `priority` only above the fold.  
4. Offload background jobs to Supabase Functions (cheaper than Vercel).  
5. Cache AI responses in Supabase KV to cut OpenAI usage.

---

## 11   Cost Optimisation Recommendations
* Keep `serverAnalytics` **disabled**; rely on client + free Vercel.  
* Lower Upptime frequency to every 5 min if SLA allows.  
* Run security scans weekly instead of daily for lower execs.  
* Use **PRODUCTION_PRESET** as-is; tweak `sampling` before any campaign spikes.  
* Generate monthly cost report and compare with Vercel dashboard.

---

## 12   Rollback Procedures
1. **Quick Revert**  
   ```bash
   vercel rollback <previous-deployment>
   ```
2. **Disable Costly Features** – set `NEXT_PUBLIC_ENVIRONMENT=development` in Vercel → redeploy (removes middleware).  
3. **Database** – Supabase has point-in-time recovery; restore to T-5 min if migration failed.  
4. **Feature Flags** – flip `features.fullMiddleware = false`, redeploy edge runtime (fast).  
5. **Incident Communication** – update status page via Upptime `npx upptime-comment "rollback"`.

---

### 🎉  You’re ready to ship Phase 6!

Be intentional with each toggle, monitor daily, and you’ll enjoy enterprise-grade power without blowing the budget.
