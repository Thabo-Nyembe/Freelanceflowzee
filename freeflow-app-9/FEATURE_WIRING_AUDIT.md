# Feature Wiring Audit Report

**Generated:** 2026-01-12
**Total Files Audited:** 279+ V2 pages + components
**Issues Found:** 65+ placeholder handlers

---

## Executive Summary

Comprehensive audit of V2 dashboard pages and shared components revealed **65+ placeholder button handlers** that need real functionality. The majority use `toast.info/success` without actual API calls, `console.log` statements, or empty arrow functions.

### Priority Breakdown
| Priority | Count | Description |
|----------|-------|-------------|
| Critical | 12 | Authentication, data deletion, API keys |
| High | 28 | CRUD operations, integrations, forms |
| Medium | 18 | UI toggles, filters, exports |
| Low | 7 | Coming soon features, preview actions |

---

## Critical Issues (P0)

### 1. Authentication - main-navigation.tsx
**File:** `components/navigation/main-navigation.tsx:143`
```tsx
// BEFORE - Missing onClick
<Button variant="ghost" size="sm">
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</Button>
```
**Fix Required:** Wire to Supabase auth signOut

### 2. Notification Center - notification-center.tsx
**File:** `components/communication/notification-center.tsx`
| Line | Handler | Issue |
|------|---------|-------|
| 264 | Reply | `/* TODO: Implement reply to notification */` |
| 273 | Forward | `/* TODO: Implement forward notification */` |
| 282 | Save | `/* TODO: Implement save notification */` |

### 3. API Key Operations - sales-v2, invoices-v2
- Line 2341: `handleRegenerateApiKey()` - may lack API call
- Line 2445: `handleClearAllPipeline()` - confirmation without deletion
- Line 2455: `handleResetCRM()` - no actual cleanup

---

## High Priority Issues (P1)

### Customers-V2 (6 handlers)
**File:** `app/(app)/dashboard/customers-v2/customers-client.tsx`

| Line | Handler | Current State | Fix Needed |
|------|---------|---------------|------------|
| 851 | Activity Log | `// TODO: Implement activity log modal` | Create modal with API |
| 2022 | Slack Connect | `toast.success('Connecting to Slack')` | OAuth flow |
| 2033 | Zapier Connect | `toast.success('Connecting to Zapier')` | OAuth flow |
| 2044 | LinkedIn | `toast.success('Connecting to LinkedIn')` | OAuth flow |
| 2369 | Email | `window.location.href = 'mailto:'` | Log activity to API |
| 2370 | Call | `window.location.href = 'tel:'` | Log activity to API |

### Employees-V2 (5 handlers)
**File:** `app/(app)/dashboard/employees-v2/employees-client.tsx`

| Line | Handler | Current State | Fix Needed |
|------|---------|---------------|------------|
| 2401-2403 | Edit Profile | `// TODO: Implement profile editor` | Profile edit API |
| 2399 | Email Contact | Toast only | Log interaction |
| 1425-1426 | Course Link | Generic toast | Track enrollment |
| 1943-1945 | Integration | Toast only | Setup flow |
| 1970-1972 | Config | Toast only | Settings UI |

### Projects-Hub-V2 (5 handlers)
**File:** `app/(app)/dashboard/projects-hub-v2/projects-hub-client.tsx`

| Line | Handler | Current State | Fix Needed |
|------|---------|---------------|------------|
| 1412 | Webhook Delete | `toast.success('Webhook deleted')` | API deletion |
| 1485 | API Token Copy | Clipboard only | Validate token |
| 1582 | Custom Field Delete | `toast.success('Custom field deleted')` | API deletion |
| 2170 | Filter Apply | `toast.success('Filters applied')` | Apply filters |

### Sales-V2 (7 handlers)
**File:** `app/(app)/dashboard/sales-v2/sales-client.tsx`

| Line | Handler | Current State | Fix Needed |
|------|---------|---------------|------------|
| 1637 | Phone Call | `tel:` link + toast | Call logging |
| 1638 | Email Copy | Clipboard + toast | Activity log |
| 1639 | LinkedIn | Window open + toast | Connection track |
| 2341 | API Key Regen | Confirm only | API call |
| 2445 | Clear Pipeline | Confirm only | Deletion API |
| 2455 | Reset CRM | Confirm only | Reset API |
| 2634 | Copy Quote | Clipboard only | Track action |

---

## Medium Priority Issues (P2)

### Command Palette - enhanced-command-palette.tsx
**File:** `components/ui/enhanced-command-palette.tsx`

| Line | Action | Current State |
|------|--------|---------------|
| 191 | Create Project | `console.log('Create new project')` |
| 201 | Global Search | `console.log('Global search')` |
| 211 | Settings | `console.log('Open settings')` |
| 223 | Calculator | `console.log('Open calculator')` |
| 232 | Color Picker | `console.log('Color picker')` |

### Enhanced Shadcn Dashboard
**File:** `components/ui/enhanced-shadcn-dashboard.tsx`

| Line | Button | Issue |
|------|--------|-------|
| 209 | Date Picker | No onClick |
| 224 | Refresh | No onClick |
| 231 | More Options | No onClick |
| 414 | Add New | No onClick |

### Presence Status System
**File:** `components/communication/presence-status-system.tsx:865`
```tsx
onClick={(user) => console.log('View user profile:', user)
```

---

## Low Priority Issues (P3)

### Coming Soon System
**File:** `components/ui/coming-soon-system.tsx`

| Line | Handler | Action |
|------|---------|--------|
| 368 | Waitlist | `console.log('Added to waitlist:', feature.id)` |
| 380 | Feedback | `console.log('Share feedback for:', feature.id)` |

---

## Implementation Patterns

### Pattern 1: Toast with API Call
```tsx
// BEFORE
onClick={() => toast.success('Deleted')}

// AFTER
onClick={async () => {
  toast.promise(
    fetch('/api/resource', { method: 'DELETE' }),
    {
      loading: 'Deleting...',
      success: 'Deleted successfully',
      error: 'Failed to delete'
    }
  )
}}
```

### Pattern 2: Dialog with Form
```tsx
// BEFORE
onClick={() => { /* TODO: Implement */ }}

// AFTER
onClick={() => setShowDialog(true)}
// ... Dialog with react-hook-form
<form onSubmit={form.handleSubmit(onSubmit)}>
```

### Pattern 3: Navigation Action
```tsx
// BEFORE
onClick={() => console.log('Navigate')}

// AFTER
onClick={() => router.push('/dashboard/target-page')}
```

---

## Recommended Fix Order

1. **Session 1 - Critical Auth & Notifications**
   - [ ] main-navigation.tsx Sign Out
   - [ ] notification-center.tsx (3 handlers)

2. **Session 2 - Business Critical Pages**
   - [ ] customers-v2 (6 handlers)
   - [ ] employees-v2 (5 handlers)

3. **Session 3 - Operations**
   - [ ] sales-v2 (7 handlers)
   - [ ] projects-hub-v2 (5 handlers)

4. **Session 4 - UI Components**
   - [ ] command-palette (5 handlers)
   - [ ] coming-soon-system (2 handlers)

---

## API Routes Available

The following API routes are already created and can be used:

| Route | Methods | Use Case |
|-------|---------|----------|
| `/api/employees` | GET, POST, PATCH, DELETE | Employee CRUD |
| `/api/sales` | GET, POST, PATCH, DELETE | Sales deals |
| `/api/campaigns` | GET, POST, PATCH, DELETE | Marketing |
| `/api/customers` | GET, POST, PATCH, DELETE | Customer CRM |
| `/api/permissions` | GET, POST, PATCH, DELETE | Access control |
| `/api/orders` | GET, POST, PATCH, DELETE | Orders |
| `/api/stock` | GET, POST, PATCH, DELETE | Inventory |
| `/api/compliance` | GET, POST, PATCH, DELETE | Compliance |
| `/api/data-export` | GET, POST | Export data |

---

## Testing Checklist

After fixing each handler:
- [ ] Button click triggers expected behavior
- [ ] Loading states show during async operations
- [ ] Success/error toasts display correctly
- [ ] Data updates in UI after mutation
- [ ] No console errors
- [ ] TypeScript compiles without errors
