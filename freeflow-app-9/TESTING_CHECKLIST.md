# 🧪 Complete Testing Checklist

**Date:** January 23, 2025
**Features to Test:** Onboarding, Integrations, API Keys, Settings

---

## 🎯 Testing Plan

### 1. Easy Onboarding Wizard

**Route:** `/onboarding`

#### Test Cases

**Step 1: Welcome Screen**
- [ ] Page loads without errors
- [ ] Shows welcome message and benefits
- [ ] "Get Started" button works
- [ ] Progress bar not shown yet
- [ ] Animations play smoothly

**Step 2: Profile Setup**
- [ ] Form fields render correctly
- [ ] Avatar upload works
- [ ] First name validation (required)
- [ ] Last name validation (required)
- [ ] Email validation (required)
- [ ] Phone is optional
- [ ] Bio textarea works
- [ ] Location input works
- [ ] Website URL input works
- [ ] "Back" button goes to welcome
- [ ] "Continue" disabled without required fields
- [ ] Progress bar shows 25% (step 2/8)

**Step 3: Business Information**
- [ ] Business name input works (required)
- [ ] Business type radio buttons work
  - [ ] Freelancer
  - [ ] Agency
  - [ ] Consultant
  - [ ] Studio
- [ ] Industry dropdown works
- [ ] Team size select works
- [ ] Monthly revenue select works
- [ ] "Back" button works
- [ ] "Continue" disabled without business name
- [ ] Progress bar shows ~37% (step 3/8)

**Step 4: Goals & Challenges**
- [ ] Primary goal radio buttons work
  - [ ] Automation
  - [ ] Client management
  - [ ] Project tracking
  - [ ] Invoicing
  - [ ] All of the above
- [ ] Weekly hours input works
- [ ] Challenge checkboxes work (multi-select)
- [ ] "Back" button works
- [ ] "Continue" button works
- [ ] Progress bar shows ~50% (step 4/8)

**Step 5: Import Data from Competitors** ⭐ KEY FEATURE
- [ ] Shows all 13 competitor apps
- [ ] Apps grouped by category:
  - [ ] Freelance (Upwork, Fiverr, Freelancer)
  - [ ] Project Management (Trello, Asana, Monday, Notion)
  - [ ] CRM (HubSpot, Salesforce)
  - [ ] Time Tracking (Toggl, Harvest)
  - [ ] Invoicing (FreshBooks, QuickBooks)
- [ ] Each card shows:
  - [ ] App icon & name
  - [ ] Description
  - [ ] Importable data badges
  - [ ] Market share
  - [ ] Setup time
  - [ ] Popular badge (where applicable)
- [ ] "Import" button works
- [ ] Progress bar shows during import
- [ ] Success toast after import
- [ ] "Connected" badge appears
- [ ] Can import multiple apps
- [ ] "Skip for now" button works
- [ ] "Continue" button works
- [ ] Progress bar shows ~62% (step 5/8)

**Step 6: Integrations Setup**
- [ ] Placeholder message shows
- [ ] "Continue" button works
- [ ] Progress bar shows ~75% (step 6/8)

**Step 7: Templates**
- [ ] Placeholder message shows
- [ ] "Complete Setup" button works
- [ ] Progress bar shows ~87% (step 7/8)

**Step 8: Completion**
- [ ] Success animation plays
- [ ] Shows profile summary
- [ ] Shows business summary
- [ ] Shows imported apps count
- [ ] Next steps cards display
- [ ] "Go to Dashboard" button works
- [ ] Redirects to /dashboard
- [ ] Progress bar shows 100%

**API Integration:**
- [ ] POST /api/onboarding/complete saves data
- [ ] GET /api/onboarding/complete checks status
- [ ] POST /api/onboarding/import imports data
- [ ] GET /api/onboarding/import shows history

---

### 2. Easy Integration Setup

**Route:** `/dashboard/integrations/setup`

#### Test Cases

**Page Load:**
- [ ] Page loads without errors
- [ ] Shows all 8 integrations
- [ ] Progress bar shows X/8 connected
- [ ] Category tabs work

**Integration Cards:**
- [ ] Gmail card shows correctly
  - [ ] Icon, name, description
  - [ ] "Easy" difficulty badge
  - [ ] "2 minutes" time estimate
  - [ ] "One-Click" OAuth badge
  - [ ] Benefits list
  - [ ] "Connect Now" button
- [ ] OpenAI card shows correctly
  - [ ] Required badge
  - [ ] API Key setup type
  - [ ] "3 minutes" estimate
  - [ ] Free tier info ($18 credits)
- [ ] All 8 cards render:
  - [ ] Gmail
  - [ ] Outlook
  - [ ] OpenAI
  - [ ] Anthropic
  - [ ] Google Calendar
  - [ ] Stripe
  - [ ] Twilio
  - [ ] HubSpot

**Category Filtering:**
- [ ] "All" tab shows 8 integrations
- [ ] "Email" tab shows Gmail, Outlook
- [ ] "AI" tab shows OpenAI, Anthropic
- [ ] "Calendar" tab shows Google Calendar
- [ ] "Payments" tab shows Stripe
- [ ] "SMS" tab shows Twilio
- [ ] "CRM" tab shows HubSpot

**OAuth Integration (Gmail):**
- [ ] Click "Connect Now"
- [ ] Popup window opens (simulated)
- [ ] Loading state shows "Connecting..."
- [ ] Success toast appears
- [ ] Card shows "Connected" badge
- [ ] Green border appears
- [ ] Progress updates to X+1/8

**API Key Integration (OpenAI):**
- [ ] Click "Connect Now"
- [ ] Modal opens with:
  - [ ] Setup instructions (4 steps)
  - [ ] Link to platform.openai.com
  - [ ] Free tier alert ($18 credits)
  - [ ] API key password input
  - [ ] Nickname input (optional)
  - [ ] Environment select (prod/test)
- [ ] Enter fake key "sk-test123..."
- [ ] Click "Connect OpenAI"
- [ ] Shows "Testing Connection..."
- [ ] Format validation works
- [ ] Success/error toast appears
- [ ] Modal closes on success
- [ ] Card shows "Connected"

**Connection Status:**
- [ ] Real-time status updates
- [ ] Green border for connected
- [ ] Badge shows "✓ Connected"
- [ ] Settings button appears
- [ ] Disconnect button appears

**API Routes:**
- [ ] GET /api/integrations/status works
- [ ] POST /api/integrations/test works
- [ ] POST /api/integrations/save works

---

### 3. API Key Manager (BYOK)

**Route:** `/dashboard/api-keys`

#### Test Cases

**Page Load:**
- [ ] Page loads without errors
- [ ] Shows "API Key Manager" title
- [ ] Benefits banner displays
- [ ] Stats cards show:
  - [ ] Connected Services (0/12)
  - [ ] Estimated Monthly Cost ($0.00)
  - [ ] Total API Calls (0)
- [ ] Category tabs render
- [ ] All 12 service cards display

**Service Cards:**
- [ ] OpenAI card shows:
  - [ ] 🤖 icon
  - [ ] Name & description
  - [ ] "Required" badge
  - [ ] Pricing: $0.01 - $0.10/request
  - [ ] Free tier: $18 credits
  - [ ] Setup time: 2 minutes
  - [ ] Difficulty: Easy
  - [ ] Benefits: 4 items
  - [ ] "Add Key" button
  - [ ] Documentation link
- [ ] All 12 services render correctly

**Add API Key Flow (OpenAI):**
- [ ] Click "Add Key" on OpenAI card
- [ ] Modal opens with:
  - [ ] Title: "Add OpenAI API Key"
  - [ ] Setup instructions (4 steps)
  - [ ] Link to platform.openai.com
  - [ ] Free tier alert ($18 credits)
  - [ ] API key password input
  - [ ] Nickname input (optional)
  - [ ] Environment dropdown
- [ ] Enter test key: "sk-test123456789012345678901234567890123456789012"
- [ ] Add nickname: "Test Key"
- [ ] Select environment: "Test"
- [ ] Click "Add & Test Key"
- [ ] Shows "Testing..." spinner
- [ ] Validates key format ✓
- [ ] Tests connection (simulated)
- [ ] Success toast appears
- [ ] Modal closes
- [ ] Card shows "Connected" badge
- [ ] Stats update: 1/12 connected

**Connected Key Display:**
- [ ] Key shown masked: "sk-**...***"
- [ ] Show/hide toggle works
- [ ] Copy to clipboard works
- [ ] Usage count shows: "Used 0 times"
- [ ] Environment badge shows: "Test"
- [ ] "Docs" button links to OpenAI docs
- [ ] "Remove" button works

**Remove API Key:**
- [ ] Click "Remove" button
- [ ] Confirmation dialog? (if implemented)
- [ ] Key removed from storage
- [ ] Card shows "Add Key" again
- [ ] Stats update: 0/12 connected
- [ ] Success toast appears

**Category Filtering:**
- [ ] "All" shows 12 services
- [ ] "AI" shows OpenAI, Anthropic (2)
- [ ] "Email" shows Resend, SendGrid (2)
- [ ] "SMS" shows Twilio (1)
- [ ] "Payment" shows Stripe (1)
- [ ] "Analytics" shows Google Analytics, Mixpanel (2)
- [ ] "Storage" shows AWS S3, Cloudinary (2)

**API Routes:**
- [ ] GET /api/user/api-keys lists keys
- [ ] POST /api/user/api-keys adds key
- [ ] PUT /api/user/api-keys updates key
- [ ] DELETE /api/user/api-keys/[id] removes key
- [ ] POST /api/user/api-keys/test validates key

**Key Testing:**
- [ ] OpenAI test calls /v1/models
- [ ] Anthropic test sends message
- [ ] Resend test checks API access
- [ ] SendGrid test gets profile
- [ ] Stripe test gets balance
- [ ] Generic format validation for others

---

### 4. Settings Page Integration

**Route:** `/dashboard/settings` → Advanced Tab

#### Test Cases

**Integrations Section:**
- [ ] "Manage Integrations" card displays
- [ ] Shows gradient blue-to-purple background
- [ ] "Easy Setup" badge present
- [ ] Description: "Connect Gmail, AI, Calendar & more in minutes"
- [ ] "Manage" button works → `/dashboard/integrations`
- [ ] "Quick Setup" button works → `/dashboard/integrations/setup`

**API Keys Section:**
- [ ] "API Keys (BYOK)" card displays
- [ ] Shows gradient purple-to-pink background
- [ ] "Your Own Keys" badge present
- [ ] Description: "Use your own API keys for full control & unlimited usage"
- [ ] "Manage API Keys" button works → `/dashboard/api-keys`

**Navigation:**
- [ ] Clicking "Quick Setup" → `/dashboard/integrations/setup`
- [ ] Clicking "Manage" → `/dashboard/integrations`
- [ ] Clicking "Manage API Keys" → `/dashboard/api-keys`

---

## 🔍 Integration Testing

### End-to-End User Journey

**New User Flow:**
1. [ ] Sign up → Redirected to `/onboarding`
2. [ ] Complete onboarding (8 steps)
3. [ ] Import data from Upwork
4. [ ] Land on dashboard with imported data
5. [ ] Navigate to Settings → Advanced
6. [ ] Click "Quick Setup"
7. [ ] Connect Gmail (OAuth)
8. [ ] Connect OpenAI (API key)
9. [ ] Navigate to API Keys
10. [ ] Add own OpenAI key (BYOK)
11. [ ] System uses user's key instead of platform key

**Returning User Flow:**
1. [ ] Login → Dashboard
2. [ ] Settings → Advanced → "Manage API Keys"
3. [ ] View connected API keys
4. [ ] Add new key (Stripe)
5. [ ] Test Stripe key
6. [ ] Key works correctly
7. [ ] Remove old key
8. [ ] Add replacement key

---

## 🐛 Error Handling

### Test Error Scenarios

**Onboarding:**
- [ ] Empty required fields → Validation error
- [ ] Invalid email format → Email error
- [ ] Network error during import → Error toast
- [ ] API failure on complete → Error message

**Integrations:**
- [ ] Invalid API key format → Format error
- [ ] Failed connection test → Connection error
- [ ] Network timeout → Timeout error
- [ ] Already connected → Duplicate warning

**API Keys:**
- [ ] Invalid key format → Format validation fails
- [ ] Wrong API key → Test fails with clear message
- [ ] Expired key → "Invalid" status shown
- [ ] Network error → Graceful error handling
- [ ] Delete fails → Error toast

---

## ⚡ Performance Testing

### Load Times
- [ ] Onboarding loads in < 3 seconds
- [ ] Integration setup loads in < 2 seconds
- [ ] API keys page loads in < 2 seconds
- [ ] Settings page loads in < 2 seconds

### Responsiveness
- [ ] All pages work on mobile (< 768px)
- [ ] All pages work on tablet (768-1024px)
- [ ] All pages work on desktop (> 1024px)
- [ ] Touch targets are large enough (44x44px min)
- [ ] Scrolling is smooth

### Animations
- [ ] No janky animations
- [ ] Smooth transitions between steps
- [ ] Progress bar animates smoothly
- [ ] Modal open/close is smooth

---

## 🔒 Security Testing

### Data Protection
- [ ] API keys never logged to console
- [ ] Passwords are masked in UI
- [ ] API keys encrypted before storage (in prod)
- [ ] No sensitive data in URLs
- [ ] HTTPS enforced

### Access Control
- [ ] User can only see own API keys
- [ ] User can only see own onboarding data
- [ ] Proper authentication required
- [ ] Session validation works

---

## 📱 Cross-Browser Testing

### Browsers to Test
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Features to Verify
- [ ] All pages load correctly
- [ ] Animations work
- [ ] Forms submit correctly
- [ ] OAuth popups work
- [ ] Copy to clipboard works
- [ ] Local storage works

---

## ✅ Acceptance Criteria

### Must Pass (P0)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All pages load without crashes
- [ ] Core flows work (onboarding, integration setup)
- [ ] API key management works
- [ ] Data saves correctly

### Should Pass (P1)
- [ ] All animations smooth
- [ ] Mobile responsive
- [ ] Error handling graceful
- [ ] Loading states show
- [ ] Success/error toasts appear

### Nice to Have (P2)
- [ ] Smooth transitions
- [ ] Accessibility features work
- [ ] Performance optimized
- [ ] Cross-browser compatible

---

## 🎯 Test Results

### Build Status
**Command:** `npm run build`
**Status:** [RUNNING...]

### Manual Testing
**Date:** [TO BE TESTED]
**Tester:** [YOUR NAME]

**Results:**
- Onboarding: [ ] PASS [ ] FAIL
- Integrations: [ ] PASS [ ] FAIL
- API Keys: [ ] PASS [ ] FAIL
- Settings: [ ] PASS [ ] FAIL

**Issues Found:**
1.
2.
3.

**Notes:**

---

## 📝 Next Steps After Testing

1. [ ] Fix any critical bugs (P0)
2. [ ] Fix major bugs (P1)
3. [ ] Document known issues (P2)
4. [ ] Update README with features
5. [ ] Deploy to staging
6. [ ] User acceptance testing
7. [ ] Deploy to production

---

**Testing Status:** 🔄 In Progress
**Last Updated:** January 23, 2025
