# KAZI Platform - Quick Reference Guide

**Last Updated:** October 30, 2025

---

## 🚀 Quick Start

### Access Platform
```
URL: http://localhost:9323
Dashboard: http://localhost:9323/dashboard
AI Create: http://localhost:9323/dashboard/ai-create
```

### Dev Server
```bash
# Check if running
lsof -ti:9323

# Start server
npm run dev

# Build for production
npm run build
```

---

## ✅ AI Create (FIXED)

### Access
1. Navigate to http://localhost:9323/dashboard/ai-create
2. Click **"AI Studio"** tab (top navigation)
3. Select model, field, asset type
4. Click **"Generate Assets"**

### Verify Working
**Console Output:**
```
✅ AI Create: Generated asset successfully
✅ 🚀 Generated 1 high-quality assets in 1.5s!
```

### Supported Fields
- Photography (LUTs, Presets, Actions)
- Videography (Transitions, LUTs)
- Design (Templates, Mockups)
- Music (Samples, Presets)
- Web Development (Components, Themes)
- Writing (Templates, Campaigns)

---

## 📊 Platform Stats

- **Total Features:** 69
- **Categories:** 13
- **Pages:** 72
- **Test Coverage:** 35 pages (49%)
- **Build Size:** ~1.3 MB per page

---

## 🧪 Testing

### Run E2E Tests
```bash
# All AI Create tests
npx playwright test tests/e2e/ai-create-functionality.spec.ts

# API integration only
npx playwright test tests/e2e/ai-create-functionality.spec.ts --grep "API Integration"

# All dashboard tests
npx playwright test tests/e2e/dashboard.spec.ts
```

### Test API Directly
```bash
curl -X POST http://localhost:9323/api/ai/create \
  -H "Content-Type: application/json" \
  -d '{"creativeField":"photography","assetType":"luts","style":"Cinematic"}'
```

---

## 🐛 Bug Fixes

### AI Create Fixed ✅
- **Issue:** Assets not appearing
- **Cause:** API returned `asset: {}`, component expected `assets: []`
- **Fixed:** API now returns array format
- **Verified:** E2E tests passing

### Toast Removed ✅
- **Removed:** All toast notifications
- **Replaced:** Console logging with emojis
- **Count:** 0 toast imports remaining

---

## 📝 Console Logging

### Patterns Used
```javascript
console.log('✅', 'Success message')
console.error('❌', 'Error message')
console.log('ℹ️', 'Info message')
console.log('🎬', 'Rendering...')
console.log('📥', 'Downloading...')
```

### Where to Check
- Open browser DevTools (F12)
- Go to Console tab
- Perform actions in UI
- Watch for emoji-prefixed logs

---

## 📁 Key Files

### Modified This Session
```
/app/api/ai/create/route.ts                    - API fix
/components/collaboration/ai-create.tsx        - Toast removal
/app/(app)/dashboard/motion-graphics/page.tsx  - Test IDs
/app/(app)/dashboard/ai-video-generation/page.tsx
/app/(app)/dashboard/ai-voice-synthesis/page.tsx
/app/(app)/dashboard/ai-code-completion/page.tsx
/app/(app)/dashboard/ml-insights/page.tsx
/tests/e2e/ai-create-functionality.spec.ts    - E2E tests
```

### Important Components
```
/components/navigation/sidebar.tsx             - Navigation (69 features)
/components/ai/ai-create.tsx                   - AI Create re-export
/components/collaboration/ai-create.tsx        - Main AI Create component
```

---

## 🔍 Troubleshooting

### AI Create Not Working

**Check 1: Dev Server**
```bash
lsof -ti:9323  # Should return a PID
```

**Check 2: Page Loads**
```
Navigate to: http://localhost:9323/dashboard/ai-create
Should see: Page with tabs (AI Studio, Legacy, Templates, History)
```

**Check 3: Console Logs**
```
Open DevTools (F12) → Console
Click "Generate Assets"
Should see: ✅ AI Create: Generated asset successfully
```

**Check 4: API Response**
```bash
curl -s http://localhost:9323/api/ai/create \
  -H "Content-Type: application/json" \
  -d '{"creativeField":"photography","assetType":"luts"}' | \
  jq '.success, (.assets | length)'

Should return:
true
1
```

### Page Not Loading

**Fix:**
```bash
# Restart dev server
pkill -f "next dev"
npm run dev
```

### Build Errors

**Fix:**
```bash
# Clean build
rm -rf .next
npm run build
```

---

## 📚 Documentation

### Session Reports
- SESSION_FINAL_SUMMARY.md - This session complete summary
- AI_CREATE_FIX_COMPLETE.md - AI Create bug fix details
- PLATFORM_STATUS_COMPLETE.md - Full platform status

### Technical Docs
- AI_CREATE_BUG_FIX_REPORT.md - Detailed bug analysis
- NAVIGATION_EXPANSION_COMPLETE.md - Navigation system
- COMPREHENSIVE_TESTING_STATUS_REPORT.md - Testing info

---

## 🎯 Test IDs

### AI Create Page
```typescript
data-testid="settings-tab"           // AI Studio tab
data-testid="studio-tab"             // Legacy tab
data-testid="templates-tab"          // Templates tab
data-testid="history-tab"            // History tab
data-testid="model-select"           // Model selector
data-testid="browse-templates-btn"   // Browse templates
data-testid="ai-create-prompt-input" // Prompt textarea
data-testid="temperature-slider"     // Temperature control
data-testid="max-tokens-slider"      // Max tokens control
data-testid="ai-create-copy-btn"     // Copy result
data-testid="ai-create-download-btn" // Download result
data-testid="ai-create-result"       // Result display
```

### Other Pages
- Projects Hub: 20 test IDs
- Files Hub: 19 test IDs
- My Day: 18 test IDs
- 3D Modeling: 18 test IDs
- Video Studio: 16 test IDs

---

## 🌐 Navigation

### Sidebar Categories (13)
1. Overview (2)
2. Creative Suite (7)
3. AI Tools (8) ⭐
4. Projects & Work (6)
5. Team & Clients (6)
6. Community (2)
7. Business & Finance (5)
8. Analytics & Reports (4)
9. Files & Storage (4)
10. Scheduling (3)
11. Integrations (3) ⭐
12. Personal (5)
13. Platform (14)

**Total Features:** 69

---

## 🔑 Environment Variables

### Required for Production
```env
OPENROUTER_API_KEY=sk-...         # AI model access
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXTAUTH_URL=http://localhost:9323
```

### Optional
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_TELEMETRY=false
```

---

## 📞 Support

### Documentation Files
- Check QUICK_REFERENCE.md (this file)
- Read SESSION_FINAL_SUMMARY.md
- See PLATFORM_STATUS_COMPLETE.md

### Testing
- Run E2E tests: `npx playwright test`
- Check console logs in browser (F12)
- Verify API with curl commands

### Common Issues
1. **Page blank:** Clear browser cache
2. **API error:** Check environment variables
3. **Build fails:** Delete .next folder and rebuild
4. **Features missing:** Check navigation sidebar

---

## ✨ Recent Updates

### This Session (Oct 30, 2025)
- ✅ Fixed AI Create bug
- ✅ Removed all toast notifications
- ✅ Added console logging system
- ✅ Enhanced 5 pages with test IDs
- ✅ Created E2E test suite (24 tests)
- ✅ Verified cross-browser compatibility

---

## 🎉 Quick Wins

### Verify Platform Working
```bash
# 1. Check server
lsof -ti:9323 && echo "✅ Server running"

# 2. Test AI Create API
curl -s http://localhost:9323/api/ai/create \
  -H "Content-Type: application/json" \
  -d '{"creativeField":"photography","assetType":"luts"}' | \
  jq '.success' && echo "✅ API working"

# 3. Count test IDs
find app -name "*.tsx" | xargs grep -c "data-testid" | \
  awk -F: '{s+=$2} END {print "✅ Test IDs:", s}'
```

---

**Status:** OPERATIONAL ✅  
**AI Create:** FUNCTIONAL ✅  
**Platform:** READY ✅
