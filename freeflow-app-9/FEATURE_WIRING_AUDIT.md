# FreeFlow Kazi - Feature Wiring Audit

> Comprehensive audit of V1/V2 dashboard pages, available hooks, API routes, and integration status.
> Last Updated: 2026-01-13

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Integration Patterns](#integration-patterns)
3. [Available Hooks](#available-hooks)
4. [API Routes](#api-routes)
5. [V2 Dashboard Pages Status](#v2-dashboard-pages-status)
6. [V1 Dashboard Pages Status](#v1-dashboard-pages-status)
7. [Button/UX Component Patterns](#buttonux-component-patterns)
8. [Critical Issues](#critical-issues)
9. [Future Module Integrations](#future-module-integrations)
10. [Wiring Checklist](#wiring-checklist)

---

## Executive Summary

### Page Counts
- **V1 Dashboard Pages**: 108 pages
- **V2 Dashboard Pages**: 214 pages
- **Total Pages**: 322 pages

### Integration Status Summary
| Category | Count | Status |
|----------|-------|--------|
| Pages with setTimeout placeholders | 50+ | Needs wiring |
| Pages with mock data | 37+ | Needs real data |
| Available hooks | 100+ | Ready for use |
| Available API routes | 100+ | Ready for use |
| Placeholder handlers | 65+ | Needs real functionality |

### Priority Breakdown
| Priority | Count | Description |
|----------|-------|-------------|
| Critical | 12 | Authentication, data deletion, API keys |
| High | 28 | CRUD operations, integrations, forms |
| Medium | 18 | UI toggles, filters, exports |
| Low | 7 | Coming soon features, preview actions |

---

## Integration Patterns

### Pattern 1: Hook-Based Data Fetching
```typescript
// Import the appropriate hook
import { useInvoices } from '@/lib/hooks/use-invoices'

// Use in component
export default function InvoicesPage() {
  const { data, loading, error, createInvoice, updateInvoice, deleteInvoice } = useInvoices()

  if (loading) return <CardSkeleton />
  if (error) return <ErrorEmptyState message={error.message} />

  return (
    <div>
      {data.map(invoice => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  )
}
```

### Pattern 2: API Route Integration
```typescript
// Fetch from API route with toast.promise
const handleCreate = async (formData: FormData) => {
  toast.promise(
    fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create')
      return res.json()
    }),
    {
      loading: 'Creating invoice...',
      success: 'Invoice created successfully!',
      error: 'Failed to create invoice'
    }
  )
}
```

### Pattern 3: Toast Notifications (Sonner)
```typescript
import { toast } from 'sonner'

// Success
toast.success('Invoice created successfully')

// Error
toast.error('Failed to create invoice')

// Loading with promise
toast.promise(createInvoice(data), {
  loading: 'Creating invoice...',
  success: 'Invoice created!',
  error: 'Failed to create invoice'
})

// With description
toast.success('Invoice sent', {
  description: 'Email sent to client@example.com'
})
```

### Pattern 4: Form Handling (React Hook Form + Zod)
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const invoiceSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  email: z.string().email('Invalid email address'),
  amount: z.number().min(0, 'Amount must be positive'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function CreateInvoiceForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema)
  })

  const onSubmit = async (data: InvoiceFormData) => {
    await createInvoice(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('clientName')} />
      {errors.clientName && <p className="text-destructive">{errors.clientName.message}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Invoice'}
      </Button>
    </form>
  )
}
```

### Pattern 5: Dialog/Modal Management
```typescript
const [showDialog, setShowDialog] = useState(false)
const [selectedItem, setSelectedItem] = useState<Item | null>(null)

// Open dialog with item
const handleEdit = (item: Item) => {
  setSelectedItem(item)
  setShowDialog(true)
}

// Close and reset
const handleClose = () => {
  setShowDialog(false)
  setSelectedItem(null)
}
```

### Pattern 6: Replace setTimeout Placeholders
```typescript
// BEFORE (placeholder)
const handleRefresh = () => {
  setLoading(true)
  setTimeout(() => {
    setLoading(false)
    toast.success('Data refreshed')
  }, 1000)
}

// AFTER (real implementation)
const handleRefresh = async () => {
  setLoading(true)
  try {
    await refetch() // from hook
    toast.success('Data refreshed')
  } catch (error) {
    toast.error('Failed to refresh data')
  } finally {
    setLoading(false)
  }
}
```

---

## Available Hooks

### Core Business Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useInvoices` | `use-invoices.ts` | Invoice CRUD | `/api/invoices` |
| `useProjects` | `use-projects.ts` | Project management | `/api/projects` |
| `useClients` | `use-clients.ts` | Client management | `/api/clients` |
| `useTasks` | `use-tasks.ts` | Task management | `/api/tasks` |
| `useTeam` | `use-team.ts` | Team management | `/api/team` |
| `useBilling` | `use-billing.ts` | Billing operations | `/api/billing` |
| `useOrders` | `use-orders.ts` | Order management | `/api/orders` |
| `useCustomers` | `use-customers.ts` | Customer management | `/api/customers` |
| `useContracts` | `use-contracts.ts` | Contract management | `/api/contracts` |
| `useTransactions` | `use-transactions.ts` | Financial transactions | `/api/transactions` |

### Analytics & Reporting Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useAnalytics` | `use-analytics.ts` | Dashboard analytics | `/api/analytics` |
| `usePerformance` | `use-performance.ts` | Performance metrics | `/api/performance` |
| `usePerformanceAnalytics` | `use-performance-analytics.ts` | Advanced analytics | `/api/analytics/comprehensive` |
| `useInvestorMetrics` | `use-investor-metrics.ts` | Investor dashboard | `/api/investor` |
| `useGrowthMetrics` | `use-growth-metrics.ts` | Growth tracking | `/api/growth-engine` |
| `useBusinessReports` | `use-business-reports.ts` | Business reports | `/api/financial/reports` |
| `useHealthScores` | `use-health-scores.ts` | Health metrics | `/api/health` |

### Communication Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useMessaging` | `use-messaging.ts` | Messaging system | `/api/messages` |
| `useNotifications` | `use-notifications.ts` | Notifications | `/api/notifications` |
| `useEmailMarketing` | `use-email-marketing.ts` | Email campaigns | `/api/email-marketing/*` |
| `useCommunity` | `use-community.ts` | Community features | `/api/community` |
| `useCollaboration` | `use-collaboration.ts` | Team collaboration | `/api/collaboration/*` |
| `useAnnouncements` | `use-announcements.ts` | Announcements | `/api/announcements` |

### Automation & Workflow Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useAutomations` | `use-automations.ts` | Automation rules | `/api/kazi/automations` |
| `useWorkflows` | `use-workflows.ts` | Workflow builder | `/api/kazi/workflows` |
| `useGrowthAutomation` | `use-growth-automation.ts` | Growth automation | `/api/growth-engine` |
| `useWebhooks` | `use-webhooks.ts` | Webhook management | `/api/webhooks` |

### Security & Admin Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useSecuritySettings` | `use-security-settings.ts` | Security config | `/api/security` |
| `useSecurityAudits` | `use-security-audits.ts` | Security audits | `/api/security/audit` |
| `usePermissions` | `use-permissions.ts` | Permission management | `/api/permissions` |
| `useApiKeys` | `use-api-keys.ts` | API key management | `/api/user/api-keys` |
| `useAccessLogs` | `use-access-logs.ts` | Access logging | `/api/access-logs` |
| `useActivityLogs` | `use-activity-logs.ts` | Activity tracking | `/api/activity` |
| `useVulnerabilityScans` | `use-vulnerability-scans.ts` | Security scanning | `/api/security/scans` |

### Content & Media Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useMediaLibrary` | `use-media-library.ts` | Media management | `/api/media` |
| `useContentStudio` | `use-content-studio.ts` | Content creation | `/api/content` |
| `useAudioStudio` | `use-audio-studio.ts` | Audio processing | `/api/audio` |
| `useVeoVideo` | `use-veo-video.ts` | Video generation | `/api/video` |
| `useAiDesigns` | `use-ai-designs.ts` | AI design tools | `/api/ai/design-analysis` |
| `useAiCreate` | `use-ai-create.ts` | AI content creation | `/api/ai/*` |
| `useKnowledgeBase` | `use-knowledge-base.ts` | Knowledge management | `/api/knowledge-base` |
| `useDocs` | `use-docs.ts` | Documentation | `/api/docs` |

### Feature-Specific Hooks
| Hook | File | Purpose | API Route |
|------|------|---------|-----------|
| `useEvents` | `use-events.ts` | Event management | `/api/events` |
| `useBookings` | `use-bookings.ts` | Booking system | `/api/bookings` |
| `useTickets` | `use-tickets.ts` | Support tickets | `/api/tickets` |
| `usePolls` | `use-polls.ts` | Polls | `/api/polls` |
| `useSurveys` | `use-surveys.ts` | Survey system | `/api/surveys` |
| `useMarketplace` | `use-marketplace.ts` | Marketplace | `/api/marketplace` |
| `useMilestones` | `use-milestones.ts` | Project milestones | `/api/milestones` |
| `useSprints` | `use-sprints.ts` | Sprint management | `/api/sprints` |
| `useDeployments` | `use-deployments.ts` | Deployments | `/api/deployments` |
| `useReleases` | `use-releases.ts` | Release management | `/api/releases` |
| `useBuilds` | `use-builds.ts` | Build tracking | `/api/builds` |

---

## API Routes

### Core API Endpoints
```
/api/invoices                 - Invoice CRUD
/api/projects                 - Project management
/api/clients                  - Client management
/api/tasks                    - Task management
/api/team                     - Team management
/api/user                     - User profile
/api/settings                 - App settings
/api/orders                   - Order management
/api/customers                - Customer CRM
```

### Analytics Endpoints
```
/api/analytics                - Dashboard analytics
/api/analytics/comprehensive  - Advanced analytics
/api/dashboard                - Dashboard data
/api/financial/reports        - Financial reports
/api/growth-engine            - Growth metrics
```

### Communication Endpoints
```
/api/messages                 - Messaging
/api/notifications            - Notifications
/api/email-marketing/*        - Email marketing suite
/api/collaboration/*          - Collaboration features
/api/activity                 - Activity feed
```

### Payment Endpoints
```
/api/payments/*               - Payment processing
/api/stripe/*                 - Stripe integration
/api/checkout                 - Checkout flow
/api/crypto/*                 - Crypto payments
/api/billing/*                - Billing management
```

### Automation Endpoints
```
/api/kazi/automations         - Kazi AI automations
/api/kazi/workflows           - Kazi workflows
/api/workflows                - Workflow management
/api/webhooks                 - Webhook management
```

### Admin Endpoints
```
/api/admin/*                  - Admin operations
/api/permissions              - Permission management
/api/security/*               - Security settings
/api/user/api-keys            - API key management
```

---

## V2 Dashboard Pages Status

### Finance Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `invoices-v2` | `useInvoices` | Wired | None |
| `billing-v2` | `useBilling` | Needs wiring | Connect to Stripe |
| `expenses-v2` | `useTransactions` | Partial | Add create/update |
| `payments-v2` | `usePayments` | Needs wiring | Connect to gateway |
| `financial-v2` | `useAnalytics` | Partial | Add real-time data |
| `payroll-v2` | - | setTimeout | Wire to API |
| `subscriptions-v2` | `useBilling` | Partial | Add management |

### Projects Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `projects-v2` | - | Mock data | Wire useProjects |
| `tasks-v2` | - | Mock data | Wire useTasks |
| `milestones-v2` | `useMilestones` | setTimeout | Wire to API |
| `sprints-v2` | `useSprints` | setTimeout | Wire to API |
| `deployments-v2` | `useDeployments` | Mock data | Wire to API |
| `builds-v2` | `useBuilds` | Mock data | Wire to API |
| `releases-v2` | `useReleases` | Mock data | Wire to API |

### Team & HR Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `team-v2` | `useTeam` | Partial | Add role management |
| `employees-v2` | `useTeam` | Mock data | Wire to API |
| `payroll-v2` | - | setTimeout | Wire to API |
| `training-v2` | `useTraining` | Mock data | Wire to API |
| `performance-v2` | `usePerformance` | Partial | Add evaluations |
| `onboarding-v2` | `useOnboarding` | Mock data | Wire to API |

### Communication Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `messages-v2` | `useMessaging` | Partial | Add real-time |
| `notifications-v2` | `useNotifications` | Partial | Add preferences |
| `email-marketing-v2` | `useEmailMarketing` | setTimeout | Wire to API |
| `broadcasts-v2` | `useAnnouncements` | Mock data | Wire to API |
| `community-v2` | `useCommunity` | setTimeout | Wire to API |

### Analytics Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `analytics-v2` | `useAnalytics` | Partial | Add date filters |
| `reports-v2` | `useBusinessReports` | setTimeout | Wire to API |
| `performance-analytics-v2` | `usePerformanceAnalytics` | setTimeout | Wire to API |
| `business-intelligence-v2` | `useAnalytics` | Mock data | Wire to API |

### Security Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `security-v2` | `useSecuritySettings` | Partial | Add 2FA toggle |
| `api-keys-v2` | `useApiKeys` | Wired | Add regenerate |
| `access-logs-v2` | `useAccessLogs` | setTimeout | Wire to API |
| `audit-v2` | `useActivityLogs` | setTimeout | Wire to API |
| `compliance-v2` | `useCompliance` | Mock data | Wire to API |
| `webhooks-v2` | `useWebhooks` | Partial | Add testing |

### Content Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `media-library-v2` | `useMediaLibrary` | Partial | Add upload |
| `content-studio-v2` | `useContentStudio` | setTimeout | Wire to API |
| `video-studio-v2` | `useVeoVideo` | Partial | Add render |
| `audio-studio-v2` | `useAudioStudio` | Mock data | Wire to API |
| `ai-create-v2` | `useAiCreate` | setTimeout | Wire to AI API |
| `knowledge-base-v2` | `useKnowledgeBase` | setTimeout | Wire to API |

### CRM Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `clients-v2` | `useClients` | Partial | Add import/export |
| `customers-v2` | `useCustomers` | setTimeout | Wire to API |
| `crm-v2` | `useLeads` | Mock data | Wire to API |
| `support-tickets-v2` | `useTickets` | Partial | Add assignment |
| `customer-support-v2` | `useCustomerSuccess` | setTimeout | Wire to API |

### Automation Module
| Page | Hook | Status | Actions Needed |
|------|------|--------|----------------|
| `kazi-automations-v2` | `useAutomations` | setTimeout | Wire to Kazi API |
| `kazi-workflows-v2` | `useWorkflows` | setTimeout | Wire to Kazi API |
| `workflows-v2` | `useWorkflows` | Mock data | Wire to API |
| `integrations-v2` | `useConnectors` | Partial | Add OAuth flow |

---

## V1 Dashboard Pages Status

### Core Pages (Need Migration)
| Page | Current State | Required Hook | Migration Path |
|------|---------------|---------------|----------------|
| `projects` | Uses useCurrentUser + mock | `useProjects` | Import hook, replace mock |
| `invoices` | Mock INVOICES array | `useInvoices` | Import hook, wire forms |
| `clients` | Mock data | `useClients` | Import hook, wire CRUD |
| `tasks` | Mock data | `useTasks` | Import hook, wire CRUD |
| `files` | Mock data | `useMediaLibrary` | Import hook, add upload |
| `calendar` | Mock data | `useEvents` | Import hook, wire sync |
| `settings` | Partial | `useUserSettings` | Wire all settings |
| `notifications` | Mock data | `useNotifications` | Wire real-time |
| `messages` | Mock data | `useMessaging` | Wire real-time |
| `analytics` | setTimeout mock | `useAnalytics` | Wire date filters |
| `bookings` | Mock data | `useBookings` | Wire CRUD |
| `payments` | Mock data | `useTransactions` | Wire to Stripe |
| `video-studio` | Partial | `useVeoVideo` | Wire render |

---

## Button/UX Component Patterns

### Primary Action Button
```typescript
<Button
  onClick={() => handleAction()}
  disabled={loading}
>
  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Create Invoice
</Button>
```

### Destructive Action with Confirmation
```typescript
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete the item.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Dropdown Menu Actions
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">
      <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => handleView(item)}>
      <Eye className="mr-2 h-4 w-4" />
      View
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => handleEdit(item)}>
      <Edit className="mr-2 h-4 w-4" />
      Edit
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem
      onClick={() => handleDelete(item)}
      className="text-destructive"
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Form Dialog Pattern
```typescript
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{isEditing ? 'Edit' : 'Create'} Item</DialogTitle>
    </DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...register('name')} />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### Quick Actions Toolbar
```typescript
const quickActions = [
  {
    id: 'create',
    label: 'Create New',
    icon: Plus,
    shortcut: 'N',
    onClick: () => setShowCreateDialog(true)
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    shortcut: 'E',
    onClick: () => handleExport()
  },
  {
    id: 'refresh',
    label: 'Refresh',
    icon: RefreshCw,
    shortcut: 'R',
    onClick: () => refetch()
  },
]

<QuickActionsToolbar actions={quickActions} />
```

---

## Critical Issues

### 1. Authentication - main-navigation.tsx
**File:** `components/navigation/main-navigation.tsx:143`
```tsx
// BEFORE - Missing onClick
<Button variant="ghost" size="sm">
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</Button>

// AFTER
<Button variant="ghost" size="sm" onClick={handleSignOut}>
  <LogOut className="h-4 w-4 mr-2" />
  Sign Out
</Button>
```

### 2. Notification Center - notification-center.tsx
**File:** `components/communication/notification-center.tsx`
| Line | Handler | Issue |
|------|---------|-------|
| 264 | Reply | `/* TODO: Implement reply */` |
| 273 | Forward | `/* TODO: Implement forward */` |
| 282 | Save | `/* TODO: Implement save */` |

### 3. Command Palette - enhanced-command-palette.tsx
**File:** `components/ui/enhanced-command-palette.tsx`
| Line | Action | Current State |
|------|--------|---------------|
| 191 | Create Project | `console.log('Create new project')` |
| 201 | Global Search | `console.log('Global search')` |
| 211 | Settings | `console.log('Open settings')` |

### 4. Coming Soon System
**File:** `components/ui/coming-soon-system.tsx`
| Line | Handler | Action |
|------|---------|--------|
| 368 | Waitlist | `console.log('Added to waitlist')` |
| 380 | Feedback | `console.log('Share feedback')` |

---

## Future Module Integrations

### Phase 1: Core Business (Priority: High)
1. **Stripe Integration**
   - Connect billing-v2, payments-v2, subscriptions-v2
   - Wire payment intents, webhooks
   - Add invoice payment links

2. **Email Marketing**
   - Connect email-marketing-v2 to SendGrid/Resend
   - Wire campaign creation, subscriber management
   - Add automation triggers

3. **Real-time Collaboration**
   - Connect collaboration-v2 to WebSocket server
   - Wire real-time document editing
   - Add presence indicators

### Phase 2: AI Features (Priority: High)
1. **Kazi AI Automation**
   - Wire kazi-automations-v2 to AI backend
   - Connect workflow triggers
   - Add natural language commands

2. **Content Generation**
   - Wire ai-create-v2 to OpenAI/Anthropic
   - Connect content templates
   - Add image generation (FAL.ai)

3. **Analytics Intelligence**
   - Wire business-intelligence-v2 to ML models
   - Add predictive analytics
   - Connect revenue forecasting

### Phase 3: Integrations (Priority: Medium)
1. **Third-Party Connectors**
   - Slack, Discord, Microsoft Teams
   - Google Workspace, Notion
   - Zapier, Make webhooks

2. **Storage Providers**
   - AWS S3, Google Cloud Storage
   - Dropbox, OneDrive
   - Supabase Storage

3. **Communication Channels**
   - SMS (Twilio)
   - Voice (ElevenLabs)
   - Video conferencing

### Phase 4: Advanced Features (Priority: Low)
1. **Mobile App Integration**
   - Push notifications
   - Offline sync
   - Native features

2. **Desktop App Features**
   - System tray
   - Keyboard shortcuts
   - File system access

3. **White Label**
   - Custom branding
   - Custom domains
   - Theme builder

---

## Wiring Checklist

### For Each Page:
- [ ] Remove setTimeout placeholders
- [ ] Replace mock data with hook calls
- [ ] Add loading states (CardSkeleton, etc.)
- [ ] Add error handling (ErrorEmptyState)
- [ ] Wire form submissions to API
- [ ] Add toast notifications for all actions
- [ ] Implement confirmation dialogs for destructive actions
- [ ] Add keyboard shortcuts where appropriate
- [ ] Test all button actions
- [ ] Verify TypeScript compiles without errors

### API Integration Steps:
1. Import appropriate hook from `@/lib/hooks/use-*`
2. Destructure data, loading, error, and mutation functions
3. Replace mock data usage with hook data
4. Wire form onSubmit to create/update functions
5. Add toast.promise for async operations
6. Handle errors with toast.error
7. Add optimistic updates where appropriate
8. Add refetch after mutations

---

## Quick Reference: Hook → Page Mapping

```
useInvoices       → invoices-v2, financial-v2, billing-v2
useProjects       → projects-v2, projects-hub-v2, deployments-v2
useClients        → clients-v2, crm-v2, customer-support-v2
useTasks          → tasks-v2, my-day-v2, sprints-v2
useTeam           → team-v2, employees-v2, collaboration-v2
useAnalytics      → analytics-v2, dashboard, reports-v2
useMessaging      → messages-v2, inbox-v2, conversations-v2
useNotifications  → notifications-v2, alerts-v2
useAutomations    → kazi-automations-v2, workflows-v2
useWorkflows      → kazi-workflows-v2, workflow-builder-v2
useMediaLibrary   → media-library-v2, files-v2, gallery-v2
useEvents         → events-v2, calendar-v2, bookings-v2
useTickets        → support-tickets-v2, bugs-v2, qa-v2
useOrders         → orders-v2, ecommerce-v2
useCustomers      → customers-v2, crm-v2
useBilling        → billing-v2, subscriptions-v2, payments-v2
useSecuritySettings → security-v2, compliance-v2
useApiKeys        → api-keys-v2, integrations-v2
```

---

*This audit document serves as the central reference for wiring features across the FreeFlow Kazi application.*
*Last updated: 2026-01-13*
