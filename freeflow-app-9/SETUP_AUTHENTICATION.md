# 🔐 Authentication Setup Guide

**Last Updated:** December 10, 2025
**Status:** ✅ Code Complete - Ready for Setup

---

## ✅ What's Already Done

All authentication code is implemented and ready to use:
- ✅ NextAuth.js configuration
- ✅ Authentication API routes
- ✅ Login page updated
- ✅ Signup page updated
- ✅ SessionProvider added to layout
- ✅ Middleware protection configured
- ✅ Database migration created

**Now you just need to configure the environment and run the migration!**

---

## 📋 Step-by-Step Setup (15 minutes)

### Step 1: Generate NEXTAUTH_SECRET (2 minutes)

Open your terminal and run:

```bash
openssl rand -base64 32
```

This will output something like:
```
K7x9mP2vQ4wR5sT6uY8zA3bC1dE0fG7hI9jK2lM4nP6q
```

**Copy this value - you'll need it in the next step.**

---

### Step 2: Update .env.local File (3 minutes)

Open or create `.env.local` in the project root and add these variables:

```bash
# ============================================
# AUTHENTICATION (NextAuth.js)
# ============================================

# Paste the secret you generated above
NEXTAUTH_SECRET=K7x9mP2vQ4wR5sT6uY8zA3bC1dE0fG7hI9jK2lM4nP6q

# For local development
NEXTAUTH_URL=http://localhost:9323

# For production (add this in Vercel)
# NEXTAUTH_URL=https://your-domain.vercel.app

# ============================================
# DATABASE (Supabase)
# ============================================

# Get these from Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://gcinvwprtlnwuwuvmrux.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# OPTIONAL: OAuth Providers
# ============================================

# Google OAuth (if you want Google login)
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth (if you want GitHub login)
# GITHUB_CLIENT_ID=your-github-client-id
# GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

### Step 3: Get Your Supabase Credentials (5 minutes)

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `gcinvwprtlnwuwuvmrux`

2. **Get API Keys:**
   - Click **Settings** (gear icon in sidebar)
   - Click **API** tab
   - Copy the following:
     - `Project URL` → use as `NEXT_PUBLIC_SUPABASE_URL`
     - `anon/public` key → use as `SUPABASE_ANON_KEY`
     - `service_role` key → use as `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

3. **Update .env.local** with the copied values

---

### Step 4: Run Database Migration (5 minutes)

#### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Open the migration file: `supabase/migrations/20251210000001_auth_users_table.sql`
6. Copy the entire contents
7. Paste into SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)
9. Wait for "Success" message

#### Option B: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (first time only)
supabase link --project-ref gcinvwprtlnwuwuvmrux

# Push migrations
supabase db push
```

---

### Step 5: Verify Setup (2 minutes)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:9323

3. **Test Authentication:**
   - Go to: http://localhost:9323/signup
   - Create a test account
   - Check if you receive success message
   - Go to: http://localhost:9323/login
   - Log in with your test account
   - Verify you're redirected to dashboard

---

## 🧪 Testing Checklist

After setup, test these flows:

### Signup Flow
- [ ] Visit `/signup`
- [ ] Fill in all fields
- [ ] Submit form
- [ ] See "Account created successfully" toast
- [ ] Redirected to `/login`

### Login Flow
- [ ] Visit `/login`
- [ ] Enter email and password
- [ ] Submit form
- [ ] See "Login successful" toast
- [ ] Redirected to `/dashboard`

### Protected Routes
- [ ] Try visiting `/dashboard` without logging in
- [ ] Should redirect to `/login`
- [ ] After logging in, should access `/dashboard`

### Session Persistence
- [ ] Log in successfully
- [ ] Refresh the page
- [ ] Should still be logged in
- [ ] Session should persist

### Logout
- [ ] Click logout button (if available)
- [ ] Should redirect to `/login`
- [ ] Trying to access `/dashboard` should redirect to `/login`

---

## 🔍 Troubleshooting

### Error: "NEXTAUTH_SECRET is not defined"

**Solution:** Make sure you added `NEXTAUTH_SECRET` to `.env.local` and restarted the dev server.

```bash
# Stop the server (Ctrl+C)
# Restart it
npm run dev
```

---

### Error: "Invalid email or password"

**Possible causes:**
1. User doesn't exist in database yet (sign up first)
2. Wrong password
3. Database migration not run

**Solution:**
1. Check if user exists in Supabase: Dashboard > Table Editor > users
2. Try creating a new account via signup
3. Verify migration ran successfully

---

### Error: "Failed to create account"

**Possible causes:**
1. Email already exists
2. Database migration not run
3. Supabase keys incorrect

**Solution:**
1. Try a different email
2. Run the database migration
3. Verify Supabase keys in `.env.local`

---

### Error: "Cannot read property 'user' of null"

**Possible cause:** SessionProvider not working

**Solution:**
1. Verify `SessionProvider` is in `app/layout.tsx`
2. Restart the dev server
3. Clear browser cache and cookies

---

### Database Connection Error

**Possible cause:** Wrong Supabase credentials

**Solution:**
1. Double-check credentials in `.env.local`
2. Make sure you copied `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
3. Verify project URL is correct

---

## 🚀 Production Deployment (Vercel)

When you're ready to deploy:

### 1. Add Environment Variables to Vercel

```bash
# Go to Vercel Dashboard
# Select your project
# Go to Settings > Environment Variables
# Add all variables from .env.local

# IMPORTANT: Change NEXTAUTH_URL to production URL
NEXTAUTH_URL=https://your-app.vercel.app
```

### 2. Deploy

```bash
git add .
git commit -m "feat: production authentication system"
git push

# Vercel will auto-deploy
```

### 3. Run Migration on Production Database

- Go to your **production** Supabase project
- Run the same migration in SQL Editor
- Or use CLI: `supabase db push --project-ref <prod-project-ref>`

---

## 📊 What Happens After Setup

Once authentication is configured:

1. **Users can sign up** with email/password
2. **Users can log in** and access dashboard
3. **Sessions persist** for 30 days
4. **Protected routes** require authentication
5. **User data** is stored securely in Supabase
6. **Passwords** are hashed with bcrypt (12 rounds)
7. **JWTs** are signed and verified automatically
8. **Middleware** protects all dashboard routes

---

## 🎯 Next Steps After Authentication Works

Once authentication is working:

1. ✅ **Task 1 Complete!** - Authentication ✅
2. 🔄 **Move to Task 2** - Payment Webhooks
3. 🔄 **Then Task 3** - Cloud Storage
4. 🔄 **Then Task 4** - Database Audit
5. 🔄 **Then Task 5** - Environment Config

---

## 📞 Need Help?

### Quick Checks
1. Is the dev server running? (`npm run dev`)
2. Did you restart after adding env variables?
3. Did you run the database migration?
4. Are Supabase keys correct?

### Documentation
- NextAuth.js: https://next-auth.js.org/getting-started/example
- Supabase Auth: https://supabase.com/docs/guides/auth
- Our Implementation: See `AUTH_IMPLEMENTATION_COMPLETE.md`

---

## ✅ Success Indicators

You'll know it's working when:

✅ No errors in terminal when starting `npm run dev`
✅ `/signup` page works and creates accounts
✅ `/login` page works and redirects to dashboard
✅ `/dashboard` requires login
✅ Users appear in Supabase Table Editor > users table
✅ Sessions persist across page refreshes

---

**Last Updated:** December 10, 2025
**Next Document:** `SETUP_PAYMENTS.md` (after Task 1 complete)
