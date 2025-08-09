# KAZI Platform – Production Deployment Checklist  
**File:** `PRODUCTION_DEPLOYMENT_CHECKLIST.md`  
**Version:** v1.0  
**Date:** 6 Aug 2025  
**Owner:** Platform Engineering · Release Guild  

---

## Legend  
| ✅  | Complete |  
| 🟡 | In-Progress |  
| 🔲 | Pending |  

> Update the “Status / Notes” column during execution.

---

## 1. Pre-deployment Verification
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 1.1 | All **unit, integration & E2E** tests pass (63/63) | QA Lead | 🔲 |
| 1.2 | **Interactive test suite** warnings resolved (≤ 0) | Front-end Lead | 🔲 |
| 1.3 | Build artefacts generated with **`npm run build`** (no errors, no warnings) | DevOps | 🔲 |
| 1.4 | **Database migrations** applied to staging and reviewed | DB Admin | 🔲 |
| 1.5 | **Rollback plan** documented & tested (blue-green) | SRE | 🔲 |
| 1.6 | All **feature flags** toggled for canary strategy (10 % traffic) | Product Ops | 🔲 |
| 1.7 | Legal & compliance sign-off (GDPR, CCPA) | Legal | 🔲 |

---

## 2. Infrastructure Readiness
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 2.1 | **Vercel** production project configured with correct env vars | DevOps | 🔲 |
| 2.2 | **Supabase**: prod instance scaled (compute + storage) | DB Admin | 🔲 |
| 2.3 | **CDN** (Vercel Edge / Cloudflare) caching rules verified | SRE | 🔲 |
| 2.4 | **Object storage buckets** (feedback-attachments, user-uploads) created & lifecycle rules set | DevOps | 🔲 |
| 2.5 | **Redis / Upstash** provisioned for rate-limiting & queues | SRE | 🔲 |
| 2.6 | **Background workers / CRON jobs** scheduled (analytics, AI training) | DevOps | 🔲 |
| 2.7 | **TLS certificates** auto-renew & HSTS enabled | SRE | 🔲 |

---

## 3. Security Audit
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 3.1 | **Pen-test** / vulnerability scan completed – no high CVEs | SecOps | 🔲 |
| 3.2 | **JWT auth & RBAC** confirmed for all API routes | Back-end Lead | 🔲 |
| 3.3 | **CSP, XSS, CSRF, CORS** headers audited | SecOps | 🔲 |
| 3.4 | **Encryption at rest** for DB & storage validated | DB Admin | 🔲 |
| 3.5 | **Secrets management** via Vercel / Supabase env vars | DevOps | 🔲 |
| 3.6 | **GDPR data deletion workflow** operational | Compliance | 🔲 |

---

## 4. Performance Optimization
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 4.1 | **API p95 ≤ 200 ms** in load test (k6 / Artillery) | SRE | 🔲 |
| 4.2 | **Edge caching** configured for static & ISR pages | Front-end Lead | 🔲 |
| 4.3 | **Database indexes & query plans** optimized | DB Admin | 🔲 |
| 4.4 | **AI Gateway** provider-side latency budget verified | AI Lead | 🔲 |
| 4.5 | **Lazy-loading & code-splitting** audited (bundle <300 kB) | FE Perf Eng | 🔲 |
| 4.6 | **Image & video** optimization (next-image, adaptive streaming) | Media Eng | 🔲 |

---

## 5. Monitoring & Analytics
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 5.1 | **Vercel Analytics** dashboards live | DevOps | 🔲 |
| 5.2 | **Sentry** error tracking (release & env tags) | SRE | 🔲 |
| 5.3 | **Log aggregation** (Logtail / Grafana Loki) configured | SRE | 🔲 |
| 5.4 | **Custom business metrics** piped to Predictive-Analytics System | Data Eng | 🔲 |
| 5.5 | **Real-time feedback events** displayed in Ops dashboard | Front-end Lead | 🔲 |
| 5.6 | **Alerting** (PagerDuty / Slack) thresholds set (error rate, latency, cost) | SRE | 🔲 |

---

## 6. User Training & Onboarding
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 6.1 | **User guides & tutorials** published in Help Center | CX | 🔲 |
| 6.2 | **Interactive onboarding tour** activated (intro.js) | Product | 🔲 |
| 6.3 | **Webinar / demo video** recorded & uploaded | Marketing | 🔲 |
| 6.4 | Support **Zendesk / Intercom** chat integrated | CX | 🔲 |
| 6.5 | **FAQ & knowledge base** updated with new features | Tech Writer | 🔲 |

---

## 7. Marketing & Customer Acquisition
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 7.1 | **SEO** metadata & sitemap.xml submitted to GSC | Growth | 🔲 |
| 7.2 | **Product Hunt / Hacker News** launch material prepped | Marketing | 🔲 |
| 7.3 | **Email campaign** scheduled to existing users | Growth | 🔲 |
| 7.4 | **Social media assets** (LinkedIn, X, Insta) ready | Design | 🔲 |
| 7.5 | **Press release & blog post** finalized | PR | 🔲 |
| 7.6 | **Referral program** rules activated | Growth | 🔲 |

---

## 8. Revenue Generation
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 8.1 | **Stripe** live keys & webhook endpoints verified | Finance Eng | 🔲 |
| 8.2 | **Subscription tiers & pricing** live (Pro, Enterprise) | Product | 🔲 |
| 8.3 | **Feature gating** via Stripe entitlements tested | Back-end | 🔲 |
| 8.4 | **Invoice & VAT handling** validated | Finance | 🔲 |
| 8.5 | **Trial conversion funnels** in analytics | Growth | 🔲 |

---

## 9. Post-Launch Monitoring
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 9.1 | **Canary release** (10 %) metrics stable for 2 h | SRE | 🔲 |
| 9.2 | **Full rollout** to 100 % after green canary | SRE | 🔲 |
| 9.3 | **Daily performance & cost** review dashboard | Finance Eng | 🔲 |
| 9.4 | **User feedback** collection (NPS, surveys) | CX | 🔲 |
| 9.5 | **Bug triage** meeting schedule (daily first week) | Eng Mgr | 🔲 |
| 9.6 | **Hot-fix pipeline** validated | DevOps | 🔲 |

---

## 10. Scaling Strategy
| # | Task | Owner | Status / Notes |
|---|------|-------|----------------|
| 10.1 | **Auto-scaling policies** set for Vercel Functions & Edge | SRE | 🔲 |
| 10.2 | **Read replicas** enabled for Supabase (multi-AZ) | DB Admin | 🔲 |
| 10.3 | **Database sharding plan** documented for >1 M users | DB Architect | 🔲 |
| 10.4 | **Global CDN caching** rules for APAC, EU, US | SRE | 🔲 |
| 10.5 | **Chaos testing** run (Gremlin / Litmus) | SRE | 🔲 |
| 10.6 | **Cost-anomaly ML model** alerts wired (Predictive Analytics) | Data Eng | 🔲 |

---

## Final Sign-off  
| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO |  |  |  |
| Head of Engineering |  |  |  |
| Product Lead |  |  |  |
| SRE Lead |  |  |  |
| SecOps Lead |  |  |  |

> **Launch “Go / No-Go” meeting scheduled:** **YYYY-MM-DD HH:MM TZ**  
> All checklist items **must be ✅** before pressing **GO**.  
