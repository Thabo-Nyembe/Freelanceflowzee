# Kazi Database Wiring Guide

## 🎯 Quick Start (5 Minutes)

Your Kazi database is ready to be wired! Follow these simple steps:

### Step 1: Apply Master Schema (2 min)

The SQL has been **copied to your clipboard** automatically!

1. **Supabase SQL Editor should be open** in your browser
   - If not, open: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new

2. **Paste** the SQL (Cmd+V or Ctrl+V)

3. **Run** the query (Click "Run" button or press Cmd+Enter)

4. **Wait** for success message (~30 seconds)

---

### Step 2: Apply AI Features Schema (1 min)

1. Run this command to copy the AI migration:
   ```bash
   cat supabase/migrations/20251125_ai_features.sql | pbcopy
   ```

2. **Open** a new SQL query: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new

3. **Paste** and **Run**

4. **Wait** for success

---

### Step 3: Set Up Storage Buckets (2 min)

1. **Open** Storage: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/storage/buckets

2. **Create** these 6 buckets:

| Bucket Name | Public | Description |
|-------------|--------|-------------|
| `avatars` | ✅ Public | User profile pictures |
| `files` | 🔒 Private | User uploaded files |
| `videos` | 🔒 Private | Video projects |
| `images` | ✅ Public | Public images |
| `documents` | 🔒 Private | Documents and PDFs |
| `exports` | 🔒 Private | Exported files |

3. **Add storage policies** (for private buckets):
   - Policy name: "Users can manage their own files"
   - Definition: `(auth.uid() = owner)`
   - Allowed operations: SELECT, INSERT, UPDATE, DELETE

---

### Step 4: Verify Setup (1 min)

1. **Open** Table Editor: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/editor

2. **Check** these tables exist:

#### Core Tables ✅
- ✓ `profiles` - User profiles
- ✓ `clients` - Client management
- ✓ `projects` - Project management
- ✓ `invoices` - Invoicing system
- ✓ `files` - File management
- ✓ `tasks` - Task tracking
- ✓ `messages` - Messaging
- ✓ `notifications` - Notifications

#### AI Tables ✅
- ✓ `investor_metrics_events` - Business events
- ✓ `revenue_intelligence` - AI revenue insights
- ✓ `lead_scores` - AI lead scoring
- ✓ `growth_playbooks` - Growth strategies
- ✓ `ai_feature_usage` - AI usage tracking
- ✓ `ai_recommendations` - AI recommendations
- ✓ `user_metrics_aggregate` - Aggregated metrics

---

## ✅ Test the Connection

Run this to verify database is connected:

```bash
npm run test:db
```

Expected output:
```
✅ Database connected!
✅ Found X tables
✅ RLS enabled
✅ Storage buckets configured
```

---

## 🚀 Start Development

Once verified:

```bash
npm run dev
```

Visit: http://localhost:9323

---

## 📊 What Just Happened?

### Database Schema Created

- **15+ Core Tables**: Projects, Clients, Tasks, Files, Invoices, etc.
- **7 AI Tables**: Revenue Intelligence, Lead Scoring, Growth Playbooks
- **Row Level Security (RLS)**: All tables secured
- **Indexes**: Optimized for performance
- **Functions**: Helper functions for calculations

### Storage Configured

- **6 Buckets**: Organized file storage
- **Policies**: Secure file access
- **Public/Private**: Proper access control

### Features Now Available

All dashboard features can now connect to real data:

✅ My Day - Real tasks and goals
✅ Projects Hub - Real project management
✅ Clients - Real client data
✅ Bookings - Real booking system
✅ Files Hub - Real file storage
✅ Invoicing - Real invoice generation
✅ Analytics - Real metrics
✅ AI Features - Real AI recommendations
✅ Messaging - Real communication
✅ And 80+ more features!

---

## 🔧 Troubleshooting

### "Relation already exists" errors?
✅ **Normal!** It means tables were already created. Continue to next migration.

### "Permission denied"?
- Check you're logged into Supabase Dashboard
- Verify project ref matches: `gcinvwprtlnwuwuvmrux`

### Tables not showing?
- Refresh the Table Editor page
- Check "public" schema is selected
- Try running: `SELECT tablename FROM pg_tables WHERE schemaname='public'`

### RLS errors in app?
- Make sure you're authenticated (logged in)
- Check policies are enabled on tables
- Verify `auth.uid()` matches your user ID

---

## 📝 Next Steps

### 1. Create Test User

```bash
# Sign up at:
http://localhost:9323/auth/signup

# Or use Supabase Auth:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/users
```

### 2. Add Sample Data

```sql
-- Run in SQL Editor to add sample project:
INSERT INTO projects (user_id, title, description, status)
VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Sample Project',
  'This is a test project',
  'active'
);
```

### 3. Test Features

Visit each dashboard page and test:
- Create a project
- Add a client
- Upload a file
- Send a message
- Create a booking

---

## 🎨 Features Ready to Wire

Now that database is set up, these features are ready for full wiring:

### Phase 1 (This Week)
- [ ] Projects CRUD operations
- [ ] Clients CRUD operations
- [ ] Files upload/download
- [ ] Tasks management
- [ ] Real-time messaging

### Phase 2 (Next Week)
- [ ] Invoice generation
- [ ] Bookings system
- [ ] Analytics dashboard
- [ ] AI recommendations
- [ ] Time tracking

### Phase 3 (Future)
- [ ] Video studio integration
- [ ] Payment processing
- [ ] Email automation
- [ ] Advanced reporting

---

## 📚 Documentation Links

- **Supabase Docs**: https://supabase.com/docs
- **Database Schema**: See `/supabase/migrations/MASTER_COMPLETE_SETUP.sql`
- **AI Features**: See `/supabase/migrations/20251125_ai_features.sql`
- **API Reference**: See `/lib/supabase/ai-features.ts`
- **Hooks**: See `/hooks/use-ai-data.ts`

---

## 🆘 Need Help?

1. **Check console errors** in browser DevTools
2. **Check Network tab** for failed requests
3. **Verify environment variables** in `.env.local`
4. **Test connection** with `npm run test:db`
5. **Check Supabase logs** in Dashboard

---

## ✨ Success Checklist

Before starting development, verify:

- [ ] All migrations applied successfully
- [ ] All storage buckets created
- [ ] Tables visible in Supabase Dashboard
- [ ] Test connection passes
- [ ] Dev server starts without errors
- [ ] Can sign up/login
- [ ] Dashboard pages load

**If all checked ✅ - You're ready to code! 🎉**

---

*Last updated: November 25, 2025*
*Project: Kazi (formerly FreeFlow)*
*Database: gcinvwprtlnwuwuvmrux.supabase.co*
