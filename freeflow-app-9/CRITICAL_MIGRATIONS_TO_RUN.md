# CRITICAL MIGRATIONS TO RUN

**Priority:** Execute BEFORE Production Launch
**Order:** Must run in order (dependencies exist)
**Last Updated:** December 11, 2025

---

## Quick Reference

| # | Migration | Status | Dependencies |
|---|-----------|--------|--------------|
| 1 | Auth Users Table | Pending | None |
| 2 | Stripe Webhooks Tables | Pending | Users table |
| 3 | Phase 5 AI Features | **NEW** | Users table |

---

## Migration 1: Authentication System

**File:** `supabase/migrations/CLEAN_INSTALL_auth_users.sql`

**Tables Created:**
- `users` - Main authentication table
- `user_profiles` - Extended user data
- `email_verification_tokens` - Email verification
- `password_reset_tokens` - Password reset
- `session_logs` - Login audit trail

**How to Run:**
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Copy the ENTIRE contents of `CLEAN_INSTALL_auth_users.sql`
5. Paste and click **RUN**

**Expected Output:**
```
✅ MIGRATION SUCCESSFUL!
📊 Tables: users, user_profiles, email_verification_tokens, password_reset_tokens, session_logs
🔒 RLS enabled on all tables
✨ Ready for authentication!
```

**Verification:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('users', 'user_profiles');
```

---

## Migration 2: Stripe Payment System

**File:** `supabase/migrations/20251210000010_stripe_webhooks_tables.sql`

**Tables Created:**
- `stripe_webhook_events` - Webhook audit trail
- `payments` - One-time payment records
- `subscriptions` - Recurring subscriptions
- `invoices` - Invoice tracking
- `project_access` - Content access control

**How to Run:**
1. **IMPORTANT:** Run Migration 1 first (depends on `users` table)
2. Open Supabase Dashboard
3. Go to **SQL Editor** → **New Query**
4. Copy the ENTIRE contents of `20251210000010_stripe_webhooks_tables.sql`
5. Paste and click **RUN**

**Expected Output:**
```
CREATE TABLE (x5)
CREATE INDEX (multiple)
CREATE POLICY (multiple)
ALTER TABLE (add stripe_customer_id to users)
```

**Verification:**
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('stripe_webhook_events', 'payments', 'subscriptions', 'invoices', 'project_access');
```

---

## Post-Migration Verification

After running both migrations, verify the complete setup:

```sql
-- Check all Phase 1 tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN ('users', 'user_profiles', 'email_verification_tokens', 'password_reset_tokens', 'session_logs') THEN 'Auth'
    WHEN table_name IN ('stripe_webhook_events', 'payments', 'subscriptions', 'invoices', 'project_access') THEN 'Payments'
    ELSE 'Other'
  END as system
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'users', 'user_profiles', 'email_verification_tokens', 'password_reset_tokens', 'session_logs',
  'stripe_webhook_events', 'payments', 'subscriptions', 'invoices', 'project_access'
)
ORDER BY system, table_name;
```

**Expected Result:** 10 tables (5 Auth + 5 Payments)

---

## API Verification

After migrations, test the API endpoints:

### 1. Auth System
```bash
# Test database connection
curl http://localhost:9323/api/auth/test-db

# Expected: {"success": true, "message": "✅ Database connection working!", "userCount": 0}
```

### 2. Payment Webhook
```bash
# Check webhook endpoint
curl http://localhost:9323/api/payments/webhooks

# Expected: {"message": "Stripe webhook endpoint", "webhookSecretConfigured": true/false, ...}
```

---

## Troubleshooting

### Error: "already exists"
The migrations use `DROP IF EXISTS` so this shouldn't happen. If it does:
1. Run the migration again (it's idempotent)
2. Or manually drop the conflicting object first

### Error: "foreign key constraint"
Run migrations in order:
1. Auth (creates `users` table)
2. Payments (references `users` table)

### Error: "permission denied"
Make sure you're using the service role key in Supabase SQL Editor (not the anon key).

---

## Next Steps After Migrations

1. **Test Auth Flow:**
   ```bash
   npm run test:e2e -- tests/auth-nextauth-test.spec.ts --project=chromium
   ```

2. **Configure Stripe Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/payments/webhooks`
   - Copy webhook secret
   - Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

3. **Test Stripe Webhook:**
   ```bash
   stripe listen --forward-to localhost:9323/api/payments/webhooks
   stripe trigger payment_intent.succeeded
   ```

---

## Files Reference

| Purpose | File |
|---------|------|
| Auth Migration | `supabase/migrations/CLEAN_INSTALL_auth_users.sql` |
| Payments Migration | `supabase/migrations/20251210000010_stripe_webhooks_tables.sql` |
| Auth Setup Guide | `SETUP_AUTHENTICATION.md` |
| Stripe Setup Guide | `STRIPE_WEBHOOK_SETUP_GUIDE.md` |
| Full Status | `PHASE_1_STATUS_UPDATE.md` |

---

---

## Migration 3: Phase 5 AI Features

**File:** `supabase/migrations/20251211000001_phase5_ai_features.sql`

**Tables Created (28 tables):**

**AI Content Generation:**
- `ai_content_templates` - Reusable content templates
- `ai_generated_content` - Content history with SEO scores
- `ai_content_variations` - Content variations

**AI Design Tools:**
- `ai_brand_assets` - Brand asset library
- `ai_color_palettes` - Color palette management
- `ai_design_concepts` - Design concepts/mockups
- `ai_brand_guidelines` - Brand guidelines

**AI Copywriting:**
- `ai_brand_voices` - Brand voice profiles
- `ai_swipe_file` - Swipe file collection
- `ai_generated_copy` - Generated copy history
- `ai_email_sequences` - Email sequence templates

**AI Image Generation:**
- `ai_generated_images` - Image history
- `ai_image_collections` - Image collections
- `ai_collection_images` - Collection junction
- `ai_image_presets` - Generation presets

**AI Analytics:**
- `analytics_events` - Event tracking
- `analytics_metrics` - Metrics storage
- `analytics_reports` - Saved reports
- `analytics_alerts` - Alert configurations
- `audience_analytics` - Audience insights
- `revenue_analytics` - Revenue tracking
- `content_analytics` - Content performance
- `engagement_metrics` - Engagement data
- `user_cohorts` - Cohort analysis
- `attribution_touchpoints` - Attribution data
- `churn_analytics` - Churn tracking
- `customer_ltv` - LTV calculations

**AI Recommendations:**
- `recommendation_feedback` - User feedback
- `recommendation_history` - Implementation tracking
- `recommendation_preferences` - User preferences

**How to Run:**
1. **IMPORTANT:** Run Migration 1 first (depends on `users` table)
2. Open Supabase Dashboard
3. Go to **SQL Editor** → **New Query**
4. Copy the ENTIRE contents of `20251211000001_phase5_ai_features.sql`
5. Paste and click **RUN**

**Expected Output:**
```
CREATE TABLE (x28)
CREATE INDEX (30+)
CREATE POLICY (multiple)
CREATE FUNCTION (SEO scoring, event tracking, recommendation summary)
CREATE TRIGGER (auto-update timestamps)
```

**Verification:**
```sql
SELECT COUNT(*) as ai_tables FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ai_%' OR table_name LIKE 'analytics_%' OR table_name LIKE 'recommendation_%';
-- Expected: 28+ tables
```

---

## Post-Migration Verification (Updated)

After running all migrations, verify the complete setup:

```sql
-- Check all tables exist
SELECT
  table_name,
  CASE
    WHEN table_name IN ('users', 'user_profiles', 'email_verification_tokens', 'password_reset_tokens', 'session_logs') THEN 'Auth'
    WHEN table_name IN ('stripe_webhook_events', 'payments', 'subscriptions', 'invoices', 'project_access') THEN 'Payments'
    WHEN table_name LIKE 'ai_%' THEN 'AI Features'
    WHEN table_name LIKE 'analytics_%' THEN 'Analytics'
    WHEN table_name LIKE 'recommendation_%' THEN 'Recommendations'
    ELSE 'Other'
  END as system
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY system, table_name;
```

**Expected Result:** 40+ tables (5 Auth + 5 Payments + 28 AI)

---

**Document Created:** December 11, 2025
**Last Updated:** December 11, 2025 - Added Phase 5 AI Features migration
