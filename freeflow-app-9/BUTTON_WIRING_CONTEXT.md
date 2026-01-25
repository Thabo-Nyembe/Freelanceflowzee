# Button Wiring Context - FreeFlow App

## Overview
This document tracks progress on wiring frontend button handlers to the comprehensive Supabase backend.

## Status Legend
- [ ] Not started
- [~] In progress
- [x] Complete

---

## Batch 1: Bugs Dashboard
**File:** `app/(app)/dashboard/bugs-v2/bugs-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleArchiveBugs | [x] | Archive selected bugs (soft delete via Supabase) |

---

## Batch 2: Products Dashboard
**File:** `app/(app)/dashboard/products-v2/products-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSyncAll | [x] | Refresh/sync all products via refetch() |
| handleCreateProduct | [x] | Opens dialog (form submit handles creation) |
| handleCreateCoupon | [x] | Opens dialog (form submit handles creation) |

---

## Batch 3: Renewals Dashboard
**File:** `app/(app)/dashboard/renewals-v2/renewals-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleGenerateReport | [x] | Generate CSV report with renewal data |
| handleArchiveOldRenewals | [x] | Archive renewals older than 2 years via Supabase |
| handleResetSettings | [x] | Reset filter and form state to defaults |

---

## Batch 4: Milestones Dashboard
**File:** `app/(app)/dashboard/milestones-v2/milestones-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleGenerateProgressReport | [x] | Generate CSV with progress and timeline data |
| handleGenerateStatusReport | [x] | Generate CSV with status and health data |
| handleGenerateBudgetReport | [x] | Generate CSV with budget/schedule data |
| handleGenerateRiskReport | [x] | Generate CSV with at-risk milestones analysis |
| handleAddDeliverable | [x] | Updates milestone deliverables count via Supabase |
| handleAddBudgetItem | [x] | Updates milestone budget via Supabase |
| handleAddDependency | [x] | Updates milestone dependencies via Supabase |
| handleSaveSettings | [x] | Persists settings to localStorage |

---

## Batch 5: Sprints Dashboard
**File:** `app/(app)/dashboard/sprints-v2/sprints-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCopyApiKey | [x] | Copies real API key from useApiKeys hook |
| handleRegenerateApiKey | [x] | Creates new API key via useApiKeys hook |
| API Key Input | [x] | Displays real API key from database |

---

## Batch 6: Analytics Dashboard
**File:** `app/(app)/dashboard/analytics-v2/analytics-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCreateFunnel | [x] | Creates funnel via Supabase (already wired) |
| handleDeleteFunnel | [x] | Deletes funnel via Supabase (already wired) |
| handleCreateReport | [x] | Creates report via Supabase (already wired) |
| handleRunReport | [x] | Runs report via Supabase (already wired) |
| handleDeleteReport | [x] | Deletes report via Supabase (already wired) |
| handleApplyFilters | [x] | Applies filters and refetches data |
| handleClearFilters | [x] | Clears filter state |
| handleSaveCustomReport | [x] | Saves custom report via Supabase |

---

## Batch 7: Customers Dashboard
**File:** `app/(app)/dashboard/customers-v2/customers-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| API Key Regeneration | [x] | Creates new API key via useApiKeys hook |
| API Key Display | [x] | Shows real API key from database |
| File Import | [x] | Parses CSV/JSON and batch inserts contacts |
| Delete All Contacts | [x] | Loops through clients and deletes via hook |
| Clear Activity History | [x] | Clears activities state and localStorage |
| Factory Reset | [x] | Resets all CRM state and localStorage settings |

---

## Batch 8: Clients Dashboard - Props Wiring
**File:** `app/(app)/dashboard/clients-v2/clients-client.tsx`

| Component | Status | Description |
|-----------|--------|-------------|
| CollaborationIndicator | [x] | Wired to filtered clients data |
| ActivityFeed | [x] | Wired to activities state |
| QuickActionsToolbar | [x] | Wired to client action handlers |

---

## Batch 9: API Keys Dashboard - Props Wiring
**File:** `app/(app)/dashboard/api-keys-v2/api-keys-client.tsx`

| Component | Status | Description |
|-----------|--------|-------------|
| AIInsightsPanel | [x] | Computed from real API key stats |
| CollaborationIndicator | [x] | Computed from API key creators |
| PredictiveAnalytics | [x] | Computed from API usage stats |
| ActivityFeed | [x] | Computed from API key data |

---

## Implementation Pattern

### Standard Button Handler Pattern
```typescript
const handleAction = async () => {
  setIsLoading(true)
  try {
    await mutation(data)
    toast.success('Action completed successfully')
    refetch()
  } catch (error) {
    toast.error('Action failed: ' + (error as Error).message)
  } finally {
    setIsLoading(false)
  }
}
```

### Soft Delete Pattern (Archive)
```typescript
const handleArchive = async (ids: string[]) => {
  setIsLoading(true)
  try {
    await Promise.all(ids.map(id => updateItem({ id, deleted_at: new Date().toISOString() })))
    toast.success(`Archived ${ids.length} items`)
    refetch()
  } catch (error) {
    toast.error('Archive failed')
  } finally {
    setIsLoading(false)
  }
}
```

### Report Generation Pattern
```typescript
const handleGenerateReport = async (type: string) => {
  setIsLoading(true)
  try {
    const report = await createReport({ type, data: items })
    toast.success('Report generated')
    // Optionally download or display report
  } catch (error) {
    toast.error('Report generation failed')
  } finally {
    setIsLoading(false)
  }
}
```

---

## Hooks Reference

| Dashboard | Hook | Mutations Available |
|-----------|------|---------------------|
| Bugs | useBugs | create, update, remove |
| Products | useProducts | create, update, remove |
| Renewals | useRenewals | create, update, remove |
| Milestones | useMilestones | create, update, remove |
| Sprints | useSprints | create, update, remove |
| API Keys | useApiKeys | createKey, updateKey, revokeKey |
| Clients | useClients | addClient, updateClient, deleteClient |

---

## Production-Ready Dashboards (No Work Needed)
These dashboards already have fully wired handlers:
- CI/CD (`ci-cd-v2`)
- Deployments (`deployments-v2`)
- Logistics (`logistics-v2`)
- Shipping (`shipping-v2`)
- Warehouse (`warehouse-v2`)
- AI Design (`ai-design-v2`)

---

## Last Updated
Date: 2026-01-25
Status: **All batches complete** - Build passing with 598 pages

## Summary of Changes
- **Bugs**: `handleArchiveBugs` now soft-deletes closed bugs via Supabase
- **Products**: `handleSyncAll` now calls `refetch()` to refresh data from database
- **Renewals**: Added hook integration, report generation exports CSV, archive function soft-deletes old renewals
- **Milestones**: All report handlers + CRUD handlers wired to database
- **Sprints**: API key handlers wired to useApiKeys hook with real key generation
- **Analytics**: All handlers already properly wired to Supabase (verified)
- **Customers**: API key management, file import, and danger zone actions fully wired
- **Clients**: Competitive upgrade components wired to real client/activity data
- **API Keys**: Competitive upgrade components computed from real API key stats
