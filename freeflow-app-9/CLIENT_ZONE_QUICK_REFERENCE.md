# Client Zone Tab Pages - Quick Reference

## File Structure
```
/app/(app)/dashboard/client-zone/
├── gallery/
│   └── page.tsx (747 lines)
├── calendar/
│   └── page.tsx (772 lines)
├── invoices/
│   └── page.tsx (821 lines)
└── payments/
    └── page.tsx (828 lines)
```

## Key Features at a Glance

| Page | Main Features | Key Functions | API Endpoints |
|------|---------------|---------------|---------------|
| **Gallery** | Grid/List view, Filter, Sort, Multi-select, Download, Share, Delete | handleDownload, handleShare, handleDelete, handleBulkDownload | /api/gallery/* |
| **Calendar** | Upcoming/Past, Filter, Join Meeting, Schedule, Reschedule, Cancel, Reminder | handleJoinMeeting, handleScheduleMeeting, handleReschedule, handleCancelMeeting, handleSetReminder | /api/meetings/* |
| **Invoices** | Summary Cards, Filter, Pay (Stripe), Download PDF, View Details, Dispute | handlePayInvoice, handleDownloadPDF, handleViewDetails, handleDisputeInvoice | /api/invoices/* |
| **Payments** | Milestones, Escrow, Release, Dispute, History, Receipts | handleReleasePayment, handleDisputePayment, handleDownloadReceipt | /api/payments/* |

## Common Patterns

### Loading State
```typescript
if (isLoading) {
  return <LoadingSkeletons />
}
```

### Error State
```typescript
if (error) {
  return <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
}
```

### API Call Template
```typescript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed')
  logger.info('Success', { details })
  toast.success('Message', { description: 'Details' })
} catch (error) {
  logger.error('Failed', { error })
  toast.error('Error', { description: error.message })
}
```

### Toast Notifications
```typescript
toast.success('Title', { description: 'Message' })
toast.error('Error', { description: 'Details' })
toast.info('Loading...', { description: 'Please wait' })
```

### Logger Calls
```typescript
logger.info('Action', { context: value })
logger.error('Failed', { error, context })
logger.debug('Debug message')
```

## Component Imports
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { formatCurrency, getStatusColor } from '@/lib/client-zone-utils'
```

## Type Definitions

### Gallery
```typescript
interface GalleryItem {
  id: number
  name: string
  project: string
  uploadedBy: string
  uploadDate: string
  fileSize: string
  imageUrl?: string
  type: 'image' | 'video' | 'document'
  description: string
  status: 'approved' | 'pending-review' | 'revision-needed'
}
```

### Calendar
```typescript
interface Meeting {
  id: number
  title: string
  date: string
  time: string
  duration: number
  meetingType: 'video-call' | 'in-person' | 'phone-call'
  attendees: string[]
  meetingUrl?: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
}
```

### Invoices
```typescript
interface Invoice {
  id: number
  number: string
  project: string
  amount: number
  items: InvoiceItem[]
  dueDate: string
  status: 'paid' | 'pending' | 'overdue' | 'disputed'
}
```

### Payments
```typescript
interface Milestone {
  id: number
  name: string
  amount: number
  status: 'completed' | 'in-escrow' | 'released' | 'disputed'
  dueDate: string
}

interface PaymentHistory {
  id: number
  date: string
  amount: number
  type: 'release' | 'hold' | 'return'
  status: 'completed' | 'pending'
  transactionId: string
}
```

## Utility Functions (from lib/client-zone-utils.ts)

```typescript
formatCurrency(amount: number): string
// Returns: "$1,234.56"

getStatusColor(status: string): string
// Returns CSS class for badge color

getStatusIcon(status: string): ReactNode
// Returns icon component based on status
```

## State Management Template

```typescript
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState<Type[]>([])
const [filter, setFilter] = useState('all')
const { announce } = useAnnouncer()
const router = useRouter()
const logger = createFeatureLogger('PageName')
```

## Framer Motion Patterns

```typescript
// Page entry
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.1 }}
>
  Content
</motion.div>

// List items
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  whileHover={{ x: 4 }}
>
  Card
</motion.div>

// Modal
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
>
  Modal Content
</motion.div>
```

## Button Patterns

```typescript
// Primary Action
<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
  Action
</Button>

// Danger Action
<Button className="text-red-600 hover:text-red-700" variant="outline">
  Delete
</Button>

// With Icon
<Button className="gap-2">
  <Icon className="h-4 w-4" />
  Label
</Button>
```

## Badge Patterns

```typescript
// Using getStatusColor
<Badge className={getStatusColor(status)}>
  {status}
</Badge>

// Color-specific
<Badge className="bg-green-100 text-green-800">Approved</Badge>
<Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
<Badge className="bg-red-100 text-red-800">Overdue</Badge>
```

## Filter Tab Pattern

```typescript
<div className="flex gap-2">
  {(['all', 'active', 'completed'] as const).map((status) => (
    <Button
      key={status}
      variant={filterStatus === status ? 'default' : 'outline'}
      onClick={() => setFilterStatus(status)}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Button>
  ))}
</div>
```

## Empty State Patterns

```typescript
// Loading
if (isLoading) return <div className="space-y-6"><CardSkeleton /></div>

// Error
if (error) return <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />

// No Data
if (data.length === 0) return <NoDataEmptyState title="No items" description="Start by creating one" />
```

## API Integration Checklist

- [ ] Endpoint defined and documented
- [ ] Request body structured correctly
- [ ] Error handling with try-catch
- [ ] Logger.info for success
- [ ] Logger.error for failures
- [ ] Toast notification for user feedback
- [ ] State update after success
- [ ] Type safety with interfaces
- [ ] Loading state management
- [ ] User confirmation for destructive actions

## Testing Checklist

- [ ] Page loads with data
- [ ] Loading skeleton displays
- [ ] Error state displays correctly
- [ ] Filters work properly
- [ ] API calls succeed
- [ ] Toast notifications appear
- [ ] Logger calls appear in console
- [ ] Buttons trigger correct handlers
- [ ] Modal dialogs work (invoices)
- [ ] Pagination/expansion works (payments)
- [ ] Responsive on mobile
- [ ] Accessibility features work

## Performance Considerations

1. **Data Limiting**: Mock data uses realistic amounts (5-6 items)
2. **Memoization**: Consider wrapping handlers in useCallback for frequent re-renders
3. **Lazy Loading**: Images use imageUrl with fallback icon
4. **Pagination**: Ready for implementation in list views
5. **Filtering**: Done client-side for quick response

## Security Notes

1. **API Confirmation**: Destructive actions require confirmation
2. **Type Safety**: Full TypeScript prevents type errors
3. **Error Handling**: No sensitive data in error messages
4. **Logging**: Detailed logs for audit trail
5. **User Feedback**: Clear messages prevent mistakes

---

**Quick Start**: Copy any pattern, update endpoint/types, test with mock data, then connect to backend API.
