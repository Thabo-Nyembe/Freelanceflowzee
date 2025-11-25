# 🧪 Kazi Testing Setup

## 🔐 Sign Up Disabled for Easy Testing

Sign up has been disabled to make testing easier. You can now use a single test account without worrying about new sign-ups.

---

## 📝 Quick Setup (3 Steps)

### Step 1: Disable Sign Up in Supabase Dashboard

Visit: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/providers

1. Scroll to **"Email"** provider
2. Toggle **"Enable email sign-ups"** to **OFF** ❌
3. Click **"Save"**

### Step 2: Create Test User via Dashboard

**You MUST do this first before running the SQL script!**

1. Go to: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/users
2. Click **"Add user"** (green button top right)
3. Click **"Create new user"**
4. Fill in:
   - **Email:** test@kazi.dev
   - **Password:** Trapster103
   - **Auto-confirm user:** ✅ Yes (IMPORTANT!)
5. Click **"Create user"**

You should see the user appear in the users table.

### Step 3: Run SQL to Create Profile & Sample Data

1. Open SQL Editor: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new
2. Copy the SQL:
   ```bash
   cat scripts/setup-test-user.sql | pbcopy
   ```
3. Paste in SQL Editor (Cmd+V)
4. Click **"Run"** or press Cmd+Enter

This creates:
- ✅ User profile
- ✅ Sample client, project, tasks
- ✅ Sample invoice & notification

---

## ✅ Test User Credentials

```
Email: test@kazi.dev
Password: Trapster103
```

**Important:** Save these credentials! You'll use them for all testing.

---

## 🚀 Start Testing

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Login
Visit: http://localhost:9323/auth/login

Use credentials above.

### 3. Test Features

#### Projects Hub:
- Create a new project
- Edit project details
- Delete a project
- Check database updates in Supabase

#### Files Hub:
- Upload a file
- Download a file
- Delete a file
- Check storage bucket

#### My Day:
- Create tasks
- Mark tasks complete
- Update task priorities
- Check tasks table

#### Messages:
- Send a test message
- Check real-time updates
- Verify messages table

---

## 🧪 Sample Data

Run the test user SQL script to create:
- ✅ 1 test client (Acme Corporation)
- ✅ 1 test project (Website Redesign)
- ✅ 3 sample tasks
- ✅ 1 welcome notification
- ✅ 1 sample invoice

This gives you data to work with immediately!

---

## 🔍 Verify Data

### Check Database:
```sql
-- Run in SQL Editor
SELECT 'Projects' as table_name, COUNT(*) as count FROM projects
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Messages', COUNT(*) FROM messages;
```

### Check Storage:
Visit: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/storage/buckets

Should see your uploaded files in respective buckets.

---

## 🛠️ Reset Test Data

### Clear All Data:
```sql
-- WARNING: This deletes ALL data!
DELETE FROM tasks WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
DELETE FROM messages WHERE sender_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
DELETE FROM projects WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
DELETE FROM clients WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
DELETE FROM invoices WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
DELETE FROM notifications WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@kazi.dev');
```

### Recreate Sample Data:
Run `scripts/setup-test-user.sql` again.

---

## 🎯 Testing Checklist

### Database Operations:
- [ ] Create data (INSERT works)
- [ ] Read data (SELECT works)
- [ ] Update data (UPDATE works)
- [ ] Delete data (DELETE works)
- [ ] RLS enforced (can't see other users' data)

### Storage Operations:
- [ ] Upload files to private buckets
- [ ] Upload files to public buckets
- [ ] Download files
- [ ] Delete files
- [ ] Storage policies enforced

### Real-time Features:
- [ ] Real-time messages update
- [ ] Real-time notifications
- [ ] Subscription works
- [ ] Unsubscribe works

### Auth Features:
- [ ] Login works
- [ ] Logout works
- [ ] Session persists
- [ ] Protected routes work
- [ ] Sign up disabled (should fail)

---

## 🔓 Re-enable Sign Up (Later)

When ready to allow new users:

1. Supabase Dashboard: https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/providers
2. Toggle **"Enable email sign-ups"** to **ON** ✅
3. Update `supabase/config.toml`:
   ```toml
   enable_signup = true
   ```
4. Restart dev server

---

## 📊 Monitor Testing

### Check Logs:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/logs/explorer

### Check Auth Sessions:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/users

### Check Database Queries:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/logs/postgres-logs

---

## 💡 Testing Tips

### Quick Test Commands:
```bash
# Verify database
node scripts/verify-database.js

# Check if logged in
# In browser console:
localStorage.getItem('supabase.auth.token')

# Clear local storage (force logout)
localStorage.clear()
```

### Common Issues:

**Can't login?**
- Check user exists in auth.users
- Verify auto-confirm is enabled
- Check password is correct

**RLS errors?**
- Ensure user is logged in
- Check auth.uid() in browser
- Verify RLS policies are correct

**File upload fails?**
- Check bucket exists
- Verify storage policies
- Check file size limits
- Ensure file path starts with userId

---

## 🎉 Ready to Test!

1. ✅ Sign up disabled
2. ✅ Test user created: test@kazi.dev
3. ✅ Sample data available
4. ✅ All features ready to test

**Start testing:** http://localhost:9323/auth/login

---

*Last Updated: November 25, 2025*
*Test User: test@kazi.dev*
*Password: Trapster103*
