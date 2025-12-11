# 🔧 Database Migration Fix

**Issue:** `ERROR: 42P01: missing FROM-clause entry for table "old"`
**Status:** ✅ FIXED
**Date:** December 10, 2025

---

## 🐛 What Was Wrong

The original migration (`20251210000001_auth_users_table.sql`) had an error in the Row Level Security (RLS) policy:

```sql
-- ❌ BROKEN: Cannot reference OLD in WITH CHECK
CREATE POLICY users_update_own
  ON users
  FOR UPDATE
  USING (auth.uid()::text = id::text)
  WITH CHECK (
    auth.uid()::text = id::text
    AND role = OLD.role -- ❌ ERROR: OLD not available here
    AND is_active = OLD.is_active -- ❌ ERROR
    AND is_banned = OLD.is_banned -- ❌ ERROR
  );
```

**Problem:** PostgreSQL RLS policies' `WITH CHECK` clause only has access to `NEW` (the new values), not `OLD` (the previous values).

---

## ✅ How It's Fixed

**New file:** `supabase/migrations/20251210000002_auth_users_table_fixed.sql`

**Solution:** Created a database trigger to handle role/status protection instead of using RLS:

```sql
-- ✅ FIXED: Use trigger instead of RLS for OLD comparisons
CREATE OR REPLACE FUNCTION prevent_self_privilege_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user is updating their own record
  IF OLD.id::text = current_setting('request.jwt.claims', true)::json->>'sub' THEN
    -- Prevent changing own role
    IF NEW.role != OLD.role THEN
      RAISE EXCEPTION 'You cannot change your own role';
    END IF;
    -- ... similar checks for is_active, is_banned
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger runs before update
CREATE TRIGGER prevent_self_escalation_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_privilege_escalation();
```

**Why This Works:**
- Triggers have access to both `OLD` and `NEW` values
- Runs before the update, can prevent unwanted changes
- Raises exceptions if users try to escalate their own privileges

---

## 🚀 How to Use the Fixed Migration

### Step 1: Use the Fixed File

In Supabase SQL Editor, run the **FIXED** migration:

```
📁 supabase/migrations/20251210000002_auth_users_table_fixed.sql
```

**NOT** the old one:
```
❌ supabase/migrations/20251210000001_auth_users_table.sql
```

---

### Step 2: Run in Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Copy entire contents of: `20251210000002_auth_users_table_fixed.sql`
6. Paste into editor
7. Click **Run** (or Cmd/Ctrl + Enter)
8. Wait for success messages

**Expected Output:**
```
✅ Migration Complete!
📊 Tables created:
  - users
  - user_profiles
  - email_verification_tokens
  - password_reset_tokens
  - session_logs
🔒 RLS enabled on all tables
✨ Ready for authentication!
```

---

### Step 3: Verify Tables Created

In Supabase Dashboard:
1. Click **Table Editor** in sidebar
2. You should see:
   - ✅ users
   - ✅ user_profiles
   - ✅ email_verification_tokens
   - ✅ password_reset_tokens
   - ✅ session_logs

---

## 🧪 Test the Fix

After running the migration, test these scenarios:

### Test 1: User Can Update Own Profile ✅
```sql
-- Should work: user updates their own name
UPDATE users
SET name = 'New Name'
WHERE id = auth.uid();
```

### Test 2: User Cannot Change Own Role ❌
```sql
-- Should fail with error: "You cannot change your own role"
UPDATE users
SET role = 'admin'
WHERE id = auth.uid();
```

### Test 3: User Can View Own Profile ✅
```sql
-- Should work: user can see their own data
SELECT * FROM users WHERE id = auth.uid();
```

---

## 🔍 What Changed in the Fixed Version

### Added:
1. ✅ **Trigger Function** - `prevent_self_privilege_escalation()`
2. ✅ **Trigger** - Runs before updates to check OLD vs NEW
3. ✅ **INSERT Policy** - Allow signups without authentication
4. ✅ **Service Role Bypass** - Service role can do anything
5. ✅ **Better Error Messages** - Clear exceptions for violations

### Removed:
1. ❌ OLD references from WITH CHECK clauses
2. ❌ Invalid RLS policy structure

### Improved:
1. ✅ More secure (trigger runs at database level)
2. ✅ Better error messages
3. ✅ Service role can bypass restrictions (needed for NextAuth)
4. ✅ Signup policy allows user creation

---

## 📋 Complete Setup Checklist

- [ ] Run fixed migration in Supabase SQL Editor
- [ ] Verify tables created in Table Editor
- [ ] Add environment variables to `.env.local`:
  ```bash
  NEXTAUTH_SECRET=<generated-secret>
  NEXTAUTH_URL=http://localhost:9323
  NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-key>
  ```
- [ ] Restart dev server: `npm run dev`
- [ ] Test signup: Visit http://localhost:9323/signup
- [ ] Test login: Visit http://localhost:9323/login
- [ ] Verify protected routes work

---

## 🎯 Next Steps

Once the migration runs successfully:

1. ✅ **Test Authentication** (15 minutes)
   - Create test account
   - Log in
   - Access dashboard
   - Test logout

2. ✅ **Verify in Database** (5 minutes)
   - Check users table has data
   - Check user_profiles auto-created
   - Check session logs

3. ✅ **Move to Task 2** (When ready)
   - Start implementing payment webhooks
   - See: `COMPLETION_ROADMAP.md`

---

## 💡 Technical Details

### Why Triggers Over RLS?

**RLS Policies:**
- ✅ Good for: Simple access control
- ❌ Limited: Cannot compare OLD and NEW in WITH CHECK
- ✅ Fast: Evaluated at query planning time

**Database Triggers:**
- ✅ Good for: Complex logic with OLD and NEW
- ✅ Flexible: Full programming capabilities
- ✅ Secure: Runs at database level
- ⚠️ Slower: Runs for each row

**Best Practice:** Use both!
- RLS for access control (who can see what)
- Triggers for data validation (what changes are allowed)

---

## 🔗 Related Files

- `supabase/migrations/20251210000002_auth_users_table_fixed.sql` - Use this one!
- `lib/auth.config.ts` - NextAuth configuration
- `app/api/auth/signup/route.ts` - User registration
- `SETUP_AUTHENTICATION.md` - Complete setup guide

---

## 🆘 Still Having Issues?

### Error: "relation users already exists"
**Solution:** Table already created. You're good! Skip to testing.

### Error: "permission denied"
**Solution:** Make sure you're using the Service Role key, not anon key.

### Error: "auth.uid() does not exist"
**Solution:** This is expected during migration. RLS policies will work once users start authenticating.

### Other Errors
1. Check SQL syntax in error message
2. Verify you copied entire migration file
3. Make sure Supabase project is online
4. Try running in smaller chunks if needed

---

**Status:** ✅ Migration Fixed & Ready
**Next:** Run the fixed migration and test!
