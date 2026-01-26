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

## Batch 10: Announcements Dashboard
**File:** `app/(app)/dashboard/announcements-v2/announcements-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleDeleteWebhook | [x] | Deletes webhook configuration |
| handleRegenerateApiKey | [x] | Regenerates API key for announcements |
| handleExportData | [x] | Exports announcements data |
| handleImportData | [x] | Imports announcements from file |
| handleClearCache | [x] | Clears announcement cache |
| handleResetSettings | [x] | Resets all settings to defaults |

---

## Batch 11: Compliance Dashboard
**File:** `app/(app)/dashboard/compliance-v2/compliance-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleRunAudit | [x] | Runs compliance audit check |
| handleGenerateReport | [x] | Generates compliance report |
| handleExportData | [x] | Exports compliance data |
| handleRegenerateApiToken | [x] | Regenerates API token |
| handleResetControls | [x] | Resets compliance controls |

---

## Batch 12: Logistics Dashboard
**File:** `app/(app)/dashboard/logistics-v2/logistics-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleBatchPrint | [x] | Batch print with shipping labels generation |

---

## Batch 13: Maintenance Dashboard
**File:** `app/(app)/dashboard/maintenance-v2/maintenance-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleAddPart | [x] | Adds new part to inventory |
| handleAddTechnician | [x] | Adds new technician |
| handleResetSettings | [x] | Resets maintenance settings |

---

## Batch 14: Roles Dashboard
**File:** `app/(app)/dashboard/roles-v2/roles-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSaveGeneralSettings | [x] | Persists general settings to localStorage |
| handleSaveSecuritySettings | [x] | Persists security settings to localStorage |
| handleSavePermissionSettings | [x] | Persists permission settings to localStorage |
| handleSaveNotificationSettings | [x] | Persists notification settings to localStorage |
| handleSaveAdvancedSettings | [x] | Persists advanced settings to localStorage |
| handleRunPermissionAudit | [x] | Runs permission audit and generates report |

---

## Batch 15: Lead Generation Dashboard
**File:** `app/(app)/dashboard/lead-generation-v2/lead-generation-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSendEmailBlast | [x] | Opens email blast dialog with recipient selection |
| handleApplyAdvancedFilters | [x] | Opens advanced filters dialog |
| handleManageSegments | [x] | Opens segment management dialog |
| handleCreateDeal | [x] | Opens deal creation dialog |
| handleCreateTask | [x] | Opens task creation dialog |
| handleCreateCampaign | [x] | Opens campaign creation dialog |

---

## Batch 16: Renewals Dashboard (Extended)
**File:** `app/(app)/dashboard/renewals-v2/renewals-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleExportJSON | [x] | Exports renewals data as JSON |
| handleExportCSV | [x] | Exports renewals data as CSV |
| handleScheduleRenewal | [x] | Opens renewal scheduling dialog |
| handleSaveSettings | [x] | Persists settings to localStorage |

---

## Batch 17: Invoicing Dashboard
**File:** `app/(app)/dashboard/invoicing-v2/invoicing-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handlePrintInvoice | [x] | Prints selected invoice |
| handleCreateInvoice | [x] | Opens invoice creation dialog |
| handleExportInvoices | [x] | Exports invoices data |

---

## Batch 18: Subscriptions Dashboard
**File:** `app/(app)/dashboard/subscriptions-v2/subscriptions-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleFilterPersistence | [x] | Persists filter state to localStorage |
| handleContactSupport | [x] | Opens support contact dialog |

---

## Batch 19: Stock Dashboard
**File:** `app/(app)/dashboard/stock-v2/stock-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleExportCSV | [x] | Exports stock data as CSV |
| handleExportJSON | [x] | Exports stock data as JSON |
| handleExportXLSX | [x] | Exports stock data as XLSX |

---

## Batch 20: Email Marketing Dashboard
**File:** `app/(app)/dashboard/email-marketing-v2/email-marketing-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCreateCampaign | [x] | Opens campaign creation dialog |
| handleExportSubscribers | [x] | Exports subscriber list |

---

## Batch 21: Business Intelligence Dashboard
**File:** `app/(app)/dashboard/business-intelligence-v2/business-intelligence-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleExportData | [x] | Exports BI data |
| handleSaveSettings | [x] | Persists settings to localStorage |
| handleFilterPersistence | [x] | Persists filter state to localStorage |

---

## Batch 22: Reporting Dashboard
**File:** `app/(app)/dashboard/reporting-v2/reporting-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleExportData | [x] | Exports report data |

---

## Batch 23: Features Dashboard
**File:** `app/(app)/dashboard/features-v2/features-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCreateFeature | [x] | Opens feature creation dialog |
| handleExportRoadmap | [x] | Exports feature roadmap |

---

## Batch 24: Docs Dashboard
**File:** `app/(app)/dashboard/docs-v2/docs-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCreateDocument | [x] | Opens document creation dialog |
| handleExportDocs | [x] | Exports documentation |

---

## Batch 25: Capacity Dashboard
**File:** `app/(app)/dashboard/capacity-v2/capacity-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSaveSettings | [x] | Persists capacity settings to localStorage |

---

## Batch 26: My Day Dashboard
**File:** `app/(app)/dashboard/my-day-v2/my-day-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSaveSettings | [x] | Persists my day settings to localStorage |

---

## Batch 27: Desktop App Dashboard
**File:** `app/(app)/dashboard/desktop-app-v2/desktop-app-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleSavePreferences | [x] | Persists desktop app preferences to localStorage |

---

## Batch 28: Workflow Builder Dashboard
**File:** `app/(app)/dashboard/workflow-builder-v2/workflow-builder-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleToggleLiveView | [x] | Toggles live view mode |
| handleToggleFavorites | [x] | Toggles favorites panel visibility |
| handleDuplicateVariable | [x] | Duplicates workflow variable |

---

## Batch 29: Team Hub Dashboard
**File:** `app/(app)/dashboard/team-hub-v2/team-hub-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCreateReminder | [x] | Creates team reminder |

---

## Batch 30: Security Audit Dashboard
**File:** `app/(app)/dashboard/security-audit-v2/security-audit-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleRunSecurityScan | [x] | Runs comprehensive security scan |
| handleExportAudit | [x] | Exports security audit report |

---

## Batch 31: Component Library Dashboard
**File:** `app/(app)/dashboard/component-library-v2/component-library-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleOpenComponentBuilder | [x] | Opens component builder dialog |
| handleConfigureWebhook | [x] | Opens webhook configuration dialog |
| handleDeleteWebhook | [x] | Deletes webhook configuration |

---

## Batch 32: Media Library Dashboard
**File:** `app/(app)/dashboard/media-library-v2/media-library-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleUpgradeStorage | [x] | Opens upgrade storage dialog with pricing tiers |

---

## Batch 33: Integrations Marketplace Dashboard
**File:** `app/(app)/dashboard/integrations-marketplace-v2/integrations-marketplace-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleConfigureWebhook | [x] | Opens webhook configuration dialog |
| handleBlockApp | [x] | Opens app blocker dialog |
| handleUnblockApp | [x] | Unblocks previously blocked app |

---

## Batch 34: Performance Dashboard
**File:** `app/(app)/dashboard/performance-v2/performance-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleCompareTests | [x] | Opens test comparison with visual diff dialog |

---

## Batch 35: Milestones Dashboard (Extended)
**File:** `app/(app)/dashboard/milestones-v2/milestones-client.tsx`

| Handler | Status | Description |
|---------|--------|-------------|
| handleExportTimeline | [x] | Exports milestone timeline data |

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

### Settings Persistence Pattern
```typescript
const handleSaveSettings = () => {
  try {
    localStorage.setItem('dashboard-settings', JSON.stringify(settings))
    toast.success('Settings saved')
  } catch (error) {
    toast.error('Failed to save settings')
  }
}
```

### Dialog Handler Pattern
```typescript
const handleOpenDialog = () => {
  setDialogOpen(true)
}

const handleDialogSubmit = async (data: FormData) => {
  setIsLoading(true)
  try {
    await mutation(data)
    toast.success('Created successfully')
    setDialogOpen(false)
    refetch()
  } catch (error) {
    toast.error('Creation failed')
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
| Leads | useLeads | create, update, remove |
| Announcements | useAnnouncements | create, update, remove |
| Compliance | useCompliance | create, update, remove |

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
Date: 2026-01-26
Status: **All 35 batches complete** - Comprehensive button wiring across all dashboards

## Summary of Changes
- **Bugs**: `handleArchiveBugs` now soft-deletes closed bugs via Supabase
- **Products**: `handleSyncAll` now calls `refetch()` to refresh data from database
- **Renewals**: Added hook integration, report generation exports CSV, archive function soft-deletes old renewals, JSON/CSV export, scheduling dialog
- **Milestones**: All report handlers + CRUD handlers wired to database, timeline export added
- **Sprints**: API key handlers wired to useApiKeys hook with real key generation
- **Analytics**: All handlers already properly wired to Supabase (verified)
- **Customers**: API key management, file import, and danger zone actions fully wired
- **Clients**: Competitive upgrade components wired to real client/activity data
- **API Keys**: Competitive upgrade components computed from real API key stats
- **Announcements**: Webhook delete, API key regen, export/import, cache clear, settings reset
- **Compliance**: Audit run, report generation, export, API token, controls reset
- **Logistics**: Batch print with shipping labels generation
- **Maintenance**: Add part/technician, settings reset
- **Roles**: All settings persistence (general, security, permissions, notifications, advanced), permission audit
- **Lead Generation**: 6 new dialogs (email blast, filters, segments, deals, tasks, campaigns)
- **Invoicing**: Print invoice, create dialog, export
- **Subscriptions**: Filter persistence, contact support
- **Stock**: Multi-format export (CSV/JSON/XLSX)
- **Email Marketing**: Create campaign dialog, subscriber export
- **Business Intelligence**: Export, settings, filter persistence
- **Reporting**: Data export
- **Features**: Create feature dialog, roadmap export
- **Docs**: Create document dialog, docs export
- **Capacity**: Settings persistence
- **My Day**: Settings persistence
- **Desktop App**: Preferences persistence
- **Workflow Builder**: Live view toggle, favorites panel, variable duplication
- **Team Hub**: Reminder creation
- **Security Audit**: Security scan, audit export
- **Component Library**: Component builder, webhook dialogs
- **Media Library**: Upgrade storage dialog with pricing tiers
- **Integrations Marketplace**: Webhook config, app blocker dialogs
- **Performance**: Test comparison with visual diff dialog
