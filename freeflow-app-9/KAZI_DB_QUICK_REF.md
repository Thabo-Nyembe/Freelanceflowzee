# 🚀 Kazi Database - Quick Reference Card

## ✅ Status: 100% COMPLETE

```
Tables:  15/15 ✅  |  Buckets: 6/6 ✅  |  RLS: Enabled ✅
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Dashboard** | https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux |
| **Tables** | https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/editor |
| **Storage** | https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/storage/buckets |
| **SQL Editor** | https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql |
| **Auth** | https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/users |
| **Local App** | http://localhost:9323 |

---

## 📊 Database Tables

### Core (8 tables):
`profiles` • `clients` • `projects` • `invoices` • `files` • `tasks` • `messages` • `notifications`

### AI (7 tables):
`investor_metrics_events` • `revenue_intelligence` • `lead_scores` • `growth_playbooks` • `ai_feature_usage` • `ai_recommendations` • `user_metrics_aggregate`

---

## 📦 Storage Buckets

**Public:** `avatars` • `images`
**Private:** `files` • `videos` • `documents` • `exports`

---

## 💻 Quick Code Snippets

### Connect
```typescript
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Query
```typescript
const { data } = await supabase.from('projects').select('*')
```

### Insert
```typescript
const { data } = await supabase.from('tasks').insert({ title: 'New task', user_id })
```

### Upload
```typescript
const { data } = await supabase.storage.from('files').upload(`${userId}/file.pdf`, file)
```

### Real-time
```typescript
supabase.channel('messages')
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, callback)
  .subscribe()
```

---

## 🛠️ Commands

```bash
# Verify database
node scripts/verify-database.js

# Start dev server
npm run dev

# Check logs
# Supabase Dashboard > Logs
```

---

## 📚 Full Docs

- [DATABASE_WIRING_COMPLETE.md](DATABASE_WIRING_COMPLETE.md) - Complete reference
- [DATABASE_COMPLETE.md](DATABASE_COMPLETE.md) - Feature guide
- [QUICK_REFERENCE_AI_WIRING.md](QUICK_REFERENCE_AI_WIRING.md) - AI features

---

**🎉 Ready to build features!**
