# 🔍 Debug: Failed to Create User Error

**Issue:** User creation failing during signup
**Let's systematically debug this!**

---

## 📋 Quick Diagnostic Checklist

Run through these to find the issue:

### 1️⃣ Check Browser Console (MOST IMPORTANT)

**Open browser console:**
- Chrome/Edge: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
- Look for red errors

**What to look for:**
```
❌ Failed to create user account
❌ Database insert error
❌ Supabase error
❌ Network error
❌ 500 Internal Server Error
```

**Copy the FULL error message and check below** ⬇️

---

## 🔧 Common Causes & Fixes

### Error 1: "Database insert error" or "relation users does not exist"

**Cause:** Migration didn't run or failed
**Fix:**

1. Go to Supabase Dashboard → SQL Editor
2. Run this to check if table exists:
   ```sql
   SELECT EXISTS (
     SELECT FROM information_schema.tables
     WHERE table_name = 'users'
   );
   ```
3. If returns `false`, run the migration:
   - Open `supabase/migrations/20251210000002_auth_users_table_fixed.sql`
   - Copy entire file
   - Paste in SQL Editor
   - Run

---

### Error 2: "Failed to create user account" (Generic)

**Cause:** Missing or wrong Supabase credentials
**Fix:**

Check your `.env.local` file has:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gcinvwprtlnwuwuvmrux.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

**Get the correct keys:**
1. Supabase Dashboard → Settings → API
2. Copy `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `service_role` key → use as `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ NOT the `anon` key!

**After updating `.env.local`:**
```bash
# Stop the server (Ctrl+C)
npm run dev
```

---

### Error 3: "Invalid email address" or "Email already exists"

**Cause:** User with this email already exists or invalid format
**Fix:**

1. Try a different email
2. Or delete existing user from Supabase:
   ```sql
   DELETE FROM users WHERE email = 'test@example.com';
   ```

---

### Error 4: "Permission denied" or "RLS policy violation"

**Cause:** Row Level Security preventing insert
**Fix:**

The fixed migration should have this policy:
```sql
CREATE POLICY users_insert_signup
  ON users
  FOR INSERT
  WITH CHECK (true);
```

**Verify it exists:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'users';
```

**If missing, add it:**
```sql
CREATE POLICY users_insert_signup
  ON users
  FOR INSERT
  WITH CHECK (true);
```

---

### Error 5: "NEXTAUTH_SECRET is not defined"

**Cause:** Missing environment variable
**Fix:**

Add to `.env.local`:
```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:9323
```

Then restart:
```bash
npm run dev
```

---

## 🧪 Step-by-Step Debug Process

### Step 1: Check Server Logs

Look at your terminal where `npm run dev` is running.

**Look for:**
```
❌ Database insert error
❌ Supabase error
❌ Error: ...
```

**Copy the error and match it to fixes above** ⬆️

---

### Step 2: Test Supabase Connection

Create a test file: `test-supabase.js`

```javascript
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function test() {
  const { data, error } = await supabase
    .from('users')
    .select('count')

  if (error) {
    console.error('❌ Supabase Error:', error)
  } else {
    console.log('✅ Supabase Connected!', data)
  }
}

test()
```

Run:
```bash
node test-supabase.js
```

---

### Step 3: Check Environment Variables Loaded

Add this to your signup API route temporarily:

```typescript
// In app/api/auth/signup/route.ts at the top of POST function
console.log('ENV CHECK:', {
  hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  serviceKeyLength: process.env.SUPABASE_SERVICE_ROLE_KEY?.length
})
```

Check the terminal - you should see:
```
ENV CHECK: {
  hasSupabaseUrl: true,
  hasServiceKey: true,
  supabaseUrl: 'https://...',
  serviceKeyLength: 200+ (long string)
}
```

If any are `false` or `undefined`, env vars aren't loading.

---

### Step 4: Test User Creation Manually

In Supabase Dashboard → SQL Editor:

```sql
-- Try creating a user manually
INSERT INTO users (email, password_hash, name, email_verified)
VALUES (
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5QK5n/A7xEe1a',
  'Test User',
  true
)
RETURNING *;
```

**If this works:** Issue is in the API code
**If this fails:** Issue is in the database/permissions

---

## 🎯 Quick Fix Script

Run this to check everything:

```bash
#!/bin/bash
echo "🔍 Debugging User Creation"
echo ""

# Check env file
echo "1️⃣ Checking .env.local..."
if [ -f .env.local ]; then
  echo "✅ .env.local exists"
  if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
    echo "✅ SUPABASE_SERVICE_ROLE_KEY found"
  else
    echo "❌ SUPABASE_SERVICE_ROLE_KEY missing"
  fi
else
  echo "❌ .env.local not found"
fi

echo ""
echo "2️⃣ Checking node_modules..."
if [ -d node_modules/@supabase ]; then
  echo "✅ Supabase modules installed"
else
  echo "❌ Running npm install..."
  npm install
fi

echo ""
echo "3️⃣ Next steps:"
echo "   - Check browser console for errors"
echo "   - Check terminal for server errors"
echo "   - Verify Supabase migration ran"
```

Save as `debug.sh`, then:
```bash
chmod +x debug.sh
./debug.sh
```

---

## 📞 Need More Help?

**Tell me:**
1. What's the EXACT error message in browser console?
2. What's in the terminal where `npm run dev` is running?
3. Did the migration run successfully? (Any errors?)
4. Can you see the `users` table in Supabase Table Editor?

**With this info, I can give you the exact fix!**

---

## 🚑 Emergency Quick Fixes

### Fix 1: Reset Everything
```bash
# 1. Stop server
# 2. Delete .next folder
rm -rf .next

# 3. Restart
npm run dev
```

### Fix 2: Verify Migration
```sql
-- In Supabase SQL Editor
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'user_profiles');
```

Should return both tables.

### Fix 3: Check Permissions
```sql
-- In Supabase SQL Editor
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_name='users';
```

Should show grants to `authenticated` and `service_role`.

---

## ✅ Once Fixed

After user creation works:
- [ ] Test signup with new email
- [ ] Check user appears in Supabase Table Editor
- [ ] Test login with created user
- [ ] Verify redirect to dashboard

---

**Let me know the exact error message and I'll give you the specific fix!** 🔧
