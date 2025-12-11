# FreeFlow Analysis - Quick Reference Guide

## Where to Find Things

### Critical Issues
- **Workflow Builder TODOs** → `/app/(app)/dashboard/workflow-builder/page.tsx` (lines 109-143)
- **Video Studio TODOs** → `/app/(app)/dashboard/video-studio/page.tsx` (500+ line comments)
- **Incomplete Handlers** → `handleCreateWorkflow()`, `handleEditWorkflow()`, `handleToggleWorkflow()`, etc.

### Key Files to Review

**Most Important:**
1. `/app/(app)/dashboard/files-hub/page.tsx` - 2067 lines, FULLY WORKING
2. `/app/(app)/dashboard/client-zone/page.tsx` - 2024 lines, FULLY WORKING
3. `/app/(app)/dashboard/workflow-builder/page.tsx` - Needs completion

**Next Priority:**
1. `/app/(app)/dashboard/video-studio/page.tsx` - Many TODOs
2. `/app/(app)/dashboard/admin-overview/page.tsx` - Incomplete
3. `/app/(app)/dashboard/email-agent/page.tsx` - Partial

### Component Organization

**UI Components:** `/components/ui/` (100+ files)
- button.tsx, card.tsx, dialog.tsx, tabs.tsx
- liquid-glass-card.tsx, text-shimmer.tsx, scroll-reveal.tsx
- badge.tsx, avatar.tsx, progress.tsx

**Feature Components:** `/components/[feature]/`
- `/components/files-hub/` - File hub UI
- `/components/client-zone/` - Client zone UI
- `/components/collaboration/` - Collab features
- `/components/storage/` - Cloud storage UI
- `/components/video/` - Video studio UI
- `/components/ai/` - AI features

**Navigation:** `/components/navigation.tsx`, `/components/marketing/enhanced-navigation`

### State Management Patterns

**Redux-like Pattern (useReducer):**
```typescript
// Files Hub - Complex state management
const [state, dispatch] = useReducer(filesHubReducer, initialState)
dispatch({ type: 'ADD_FILE', file: newFile })
```

**Simple Pattern (useState):**
```typescript
// Client Zone - Simple state
const [activeTab, setActiveTab] = useState('projects')
const [newMessage, setNewMessage] = useState('')
```

**Authentication:**
```typescript
// All pages
const { userId, loading } = useCurrentUser()
```

### Database Queries

All queries are in: `/lib/*-queries.ts`

**Examples:**
- `/lib/files-hub-queries.ts` - File operations
- `/lib/workflow-builder-queries.ts` - Workflow operations
- `/lib/projects-hub-queries.ts` - Project operations
- `/lib/clients-queries.ts` - Client data

### API Routes

All endpoints in: `/app/api/`

**Major Categories:**
- `/api/projects/manage` - Project CRUD
- `/api/payments/*` - Payment processing
- `/api/collaboration/*` - Collaboration features
- `/api/ai/*` - AI operations
- `/api/video/*` - Video operations
- `/api/chat/*` - Messaging

### Dashboard Page Categories

**190+ Pages Organized By Function:**

| Category | Count | Status | Key Pages |
|----------|-------|--------|-----------|
| Admin | 12 | Partial | admin-overview, admin/agents |
| AI & Automation | 14 | Complete | ai-create, ai-design, ai-assistant |
| Analytics | 6 | Partial | analytics, projects, revenue |
| Bookings | 8 | Complete | bookings, bookings/calendar |
| Collaboration | 9 | Complete | collaboration, canvas, meetings |
| Client Zone | 14 | Complete | client-zone, client-zone/files |
| Financial | 9 | Complete | invoices, escrow, financial-hub |
| Projects | 9 | Complete | projects-hub, cv-portfolio |
| Community | 9 | Partial | community-hub, messaging |
| Media | 8 | Partial | video-studio, audio-studio |
| Settings | 9 | Partial | settings, profile, api-keys |
| Reports | 7 | Partial | reports, audit-trail |
| Additional | 50+ | Stubs | storage, calendar, widgets |

### Hooks Usage Reference

**Authentication:**
```typescript
import { useCurrentUser } from '@/hooks/use-ai-data'
const { userId, loading } = useCurrentUser()
```

**Accessibility:**
```typescript
import { useAnnouncer } from '@/lib/accessibility'
const { announce } = useAnnouncer()
announce('Message', 'polite')
```

**Storage Onboarding:**
```typescript
import { useStorageOnboarding } from '@/lib/hooks/use-storage-onboarding'
const { showWizard, setShowWizard } = useStorageOnboarding()
```

**Real-time:**
```typescript
import { useRealtime } from '@/hooks/use-realtime'
// Real-time subscriptions
```

### Common Patterns

**Loading States:**
```typescript
if (isLoading) return <CardSkeleton />
if (error) return <ErrorEmptyState error={error} onRetry={...} />
if (data.length === 0) return <NoDataEmptyState ... />
```

**Button Handlers:**
```typescript
const handleAction = async () => {
  try {
    setIsSaving(true)
    const response = await fetch('/api/endpoint', { ... })
    if (!response.ok) throw new Error('...')
    toast.success('Success')
    announce('Action completed', 'polite')
  } catch (error) {
    toast.error('Error', { description: error.message })
    announce('Error occurred', 'assertive')
  } finally {
    setIsSaving(false)
  }
}
```

**Modal Management:**
```typescript
const [isDialogOpen, setIsDialogOpen] = useState(false)
<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent>...</DialogContent>
</Dialog>
```

### Testing Commands

```bash
# E2E Tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed

# Specific tests
npm run test:dashboard
npm run test:payment
npm run test:accessibility

# Comprehensive testing
npm run test:comprehensive
npm run test:production-ready
```

### Important Routes

**Protected Routes (require auth):**
- `/dashboard/*` - All dashboard pages
- `/api/*` - All API endpoints (server-side auth)

**Public Routes:**
- `/` - Home page
- `/app/(marketing)/features` - Features page
- `/app/(marketing)/guest-upload` - Guest upload
- `/app/(marketing)/guest-download/[uploadLink]` - Guest download

### Common Issues & Solutions

**Issue:** Button not working
- **Check:** Handler function exists (not just TODO)
- **Files:** workflow-builder/page.tsx lines 109-143
- **Solution:** Implement missing handler

**Issue:** Missing data on page load
- **Check:** useEffect dependencies correct
- **Check:** userId available before fetching
- **Solution:** Wait for useCurrentUser() to load

**Issue:** Component not rendering
- **Check:** Component file exists
- **Check:** Import path correct
- **Files:** Verify in `/components/` structure
- **Solution:** Add missing component or fix import

**Issue:** Styling not applied
- **Check:** Tailwind classes valid
- **Check:** Component passes className prop
- **Solution:** Use LiquidGlassCard or custom styling

### Performance Tips

1. **Lazy load heavy pages:**
   - Use dynamic imports for dashboard pages
   - Video studio, 3D modeling, motion graphics

2. **Optimize re-renders:**
   - Use React.memo for list items
   - useMemo for expensive calculations
   - useCallback for event handlers

3. **Database queries:**
   - Use indexes on frequently queried columns
   - Implement pagination for large datasets
   - Cache query results with SWR or React Query

4. **Component optimization:**
   - Split large files (500+ lines)
   - Extract components from files-hub (2067 lines)
   - Extract components from client-zone (2024 lines)

---

## File Size Warning

These files are large and may need refactoring:
- `/app/(app)/dashboard/files-hub/page.tsx` - 2067 lines
- `/app/(app)/dashboard/client-zone/page.tsx` - 2024 lines
- `/app/(app)/dashboard/video-studio/page.tsx` - 1000+ lines

**Recommendation:** Extract modular sub-components

---

## Quick Debug Commands

```bash
# Check for TypeScript errors
npm run lint

# Find all TODOs
grep -r "TODO" app/

# Find all incomplete handlers
grep -r "TODO:" app/ | grep "handler"

# Find console.logs
grep -r "console\." app/ | grep -v "node_modules"

# Find hardcoded test data
grep -r "KAZI_CLIENT_DATA\|MOCK_\|TEST_" app/
```

---

## Contact Points

**Database Queries:** All in `/lib/`
**Component Issues:** Check `/components/`
**Page Issues:** Check `/app/(app)/dashboard/`
**API Issues:** Check `/app/api/`
**State Issues:** Check hooks in `/hooks/` or contexts in `/components/`

---

*Last Updated: December 5, 2025*
*Full Analysis: See FREEFLOW_COMPREHENSIVE_ANALYSIS.md*
