# ⚡ OAuth Setup - Quick Start (30 Minutes)

## Priority Setup Order

Start with these 3 most popular providers first:

### 1. Google OAuth (5 minutes) ⭐
Most users have Google accounts. Highest success rate.

**Quick Steps:**
1. https://console.cloud.google.com/
2. Create project → Credentials → OAuth client ID
3. Add redirect: `https://gcinvwprtlnwuwuvmrux.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret to Supabase

### 2. GitHub OAuth (3 minutes) ⭐
Perfect for developer users.

**Quick Steps:**
1. https://github.com/settings/developers
2. New OAuth App
3. Callback: `https://gcinvwprtlnwuwuvmrux.supabase.co/auth/v1/callback`
4. Copy Client ID + Secret to Supabase

### 3. LinkedIn OAuth (5 minutes) ⭐
Best for professional/B2B platform.

**Quick Steps:**
1. https://www.linkedin.com/developers/apps
2. Create app
3. Auth tab → Add redirect URL
4. Copy credentials to Supabase

---

## One Command to Copy All URLs

```bash
echo "https://gcinvwprtlnwuwuvmrux.supabase.co/auth/v1/callback" | pbcopy
```

Use this callback URL for ALL providers! ☝️

---

## Supabase Dashboard

Configure providers here:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/auth/providers

---

## Test After Setup

```bash
npm run dev
```

Visit: http://localhost:9323/auth/login

Try signing in with each provider you configured.

---

## Full Setup Guide

See [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) for detailed instructions for all 9 providers.

---

**Start with Google, GitHub, and LinkedIn - get 80% coverage in 15 minutes!** 🚀
