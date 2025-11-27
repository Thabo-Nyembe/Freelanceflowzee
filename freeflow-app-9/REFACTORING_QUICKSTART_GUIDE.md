# REFACTORING QUICK START GUIDE
## Kazi Platform - From Mock Data to Real Database

**Last Updated**: November 27, 2025
**Purpose**: Step-by-step guide to refactor any page from mock data to real Supabase integration

---

## BEFORE YOU START

### Prerequisites Checklist
```bash
□ Database migrations applied (52 systems, 480 tables)
□ Supabase credentials in .env.local
□ Logger system in place (/lib/logger.ts)
□ Supabase client setup (/lib/supabase/client.ts)
□ Development server running (npm run dev)
□ Supabase project accessible
```

### Verify Database Status
```bash
# Check migrations are applied
supabase db push

# OR check Supabase dashboard
# Navigate to: Table Editor
# You should see 480+ tables
```

---

## THE 10-STEP REFACTORING PROCESS

### STEP 1: Choose Your Feature
Pick from priority list in `COMPREHENSIVE_AUDIT_REPORT.md`

**Tier 1 (Start here)**:
- Dashboard Overview
- Projects Hub
- Clients Management
- Video Studio
- Files Hub
- Gallery
- Messages
- Bookings/Calendar

### STEP 2: Open the Page File
```bash
# Example: Projects Hub
code /Users/thabonyembe/Documents/freeflow-app-9/app/(app)/dashboard/projects-hub/page.tsx
```

### STEP 3: Add Supabase Import
**At the top of the file, add**:
```typescript
import { createClient } from '@/lib/supabase/client'
```

**Inside the component**:
```typescript
export default function FeaturePage() {
  const supabase = createClient()
  // ... rest of component
}
```

### STEP 4: Identify Mock Data Source
**Look for patterns like**:
```typescript
// Pattern 1: Direct import
import { mockProjects } from '@/lib/projects-hub-utils'
const [items, setItems] = useState(mockProjects)

// Pattern 2: Mock data in useState
const [items, setItems] = useState([
  { id: '1', name: 'Example', ... },
  { id: '2', name: 'Another', ... }
])

// Pattern 3: Mock data from utility file
const mockData = getMockData()
```

**Replace with**:
```typescript
const [items, setItems] = useState([])
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)
```

### STEP 5: Add Data Fetching (useEffect)
**Template**:
```typescript
useEffect(() => {
  async function fetchData() {
    setIsLoading(true)
    setError(null)

    try {
      // Find table name from migration files
      // Look in: /supabase/migrations/20251126_[feature]_system.sql
      const { data, error } = await supabase
        .from('table_name')  // Replace with actual table name
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setItems(data || [])
      logger.info('Data fetched successfully', { count: data?.length })
      announce(`Loaded ${data?.length || 0} items`)
    } catch (err) {
      logger.error('Failed to fetch data', { error: err })
      setError('Failed to load data')
      toast.error('Failed to load data. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  fetchData()
}, [])
```

**Tips**:
- Find table name in migration file: `/supabase/migrations/20251126_[feature]_system.sql`
- Common table names follow pattern: `feature_name` (e.g., `projects`, `clients`, `bookings`)
- Use `.select('*')` to get all columns, or specify columns for optimization

### STEP 6: Wire CREATE Operation
**Find the create handler** (usually named `handleCreate`, `handleAdd`, `onSubmit`, etc.):

**BEFORE** (Mock):
```typescript
const handleCreate = () => {
  const newItem = { ...formData, id: generateId() }
  setItems([...items, newItem])
  toast.success("Item created!")
}
```

**AFTER** (Real):
```typescript
const handleCreate = async (formData: any) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .insert({
        // Map form fields to database columns
        name: formData.name,
        description: formData.description,
        // Add all relevant fields
      })
      .select()
      .single()

    if (error) throw error

    // Update local state
    setItems([data, ...items])

    // Show success with REAL data
    toast.success(`${data.name} created successfully!`)
    logger.info('Item created', { itemId: data.id })

    // Close dialog/form
    setShowCreateDialog(false)

    return data
  } catch (error) {
    logger.error('Failed to create item', { error })
    toast.error('Failed to create item. Please try again.')
    throw error
  }
}
```

### STEP 7: Wire UPDATE Operation
**Find update handler** (usually `handleUpdate`, `handleEdit`, `onUpdate`):

**BEFORE** (Mock):
```typescript
const handleUpdate = (id: string, updates: any) => {
  setItems(items.map(item => item.id === id ? { ...item, ...updates } : item))
  toast.success("Updated!")
}
```

**AFTER** (Real):
```typescript
const handleUpdate = async (id: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('table_name')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Update local state
    setItems(items.map(item => item.id === id ? data : item))

    toast.success(`${data.name} updated successfully!`)
    logger.info('Item updated', { itemId: id })

    return data
  } catch (error) {
    logger.error('Failed to update item', { error, itemId: id })
    toast.error('Failed to update item.')
    throw error
  }
}
```

### STEP 8: Wire DELETE Operation
**Find delete handler** (usually `handleDelete`, `onDelete`, `handleRemove`):

**BEFORE** (Mock):
```typescript
const handleDelete = (id: string) => {
  setItems(items.filter(item => item.id !== id))
  toast.success("Deleted!")
}
```

**AFTER** (Real):
```typescript
const handleDelete = async (id: string) => {
  // Optional: Get item name for toast message
  const itemName = items.find(i => i.id === id)?.name

  try {
    const { error } = await supabase
      .from('table_name')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Update local state
    setItems(items.filter(item => item.id !== id))

    toast.success(`${itemName} deleted successfully`)
    logger.info('Item deleted', { itemId: id })
  } catch (error) {
    logger.error('Failed to delete item', { error, itemId: id })
    toast.error('Failed to delete item.')
    throw error
  }
}
```

### STEP 9: Add Loading & Error States
**Ensure these render conditions exist**:

```typescript
// At the top of the component return
if (isLoading) {
  return <DashboardSkeleton />
  // OR
  return <CardSkeleton count={3} />
}

if (error) {
  return (
    <ErrorEmptyState
      message={error}
      onRetry={() => window.location.reload()}
    />
  )
}

if (items.length === 0) {
  return (
    <NoDataEmptyState
      title="No items yet"
      description="Get started by creating your first item."
      actionLabel="Create Item"
      onAction={() => setShowCreateDialog(true)}
    />
  )
}

// Regular render with data
return <div>...</div>
```

### STEP 10: Test Everything
**Manual Testing Checklist**:
```bash
□ Page loads without errors
□ Data fetches and displays
□ Loading state shows during fetch
□ Create button works
□ Update/Edit button works
□ Delete button works
□ Toast messages show with real data
□ Error handling works (disconnect internet, test)
□ Empty state shows when no data
□ Console has no errors
□ Logger messages appear in console
```

---

## COMMON PATTERNS & SOLUTIONS

### Pattern 1: Fetching with Relationships
**When you need related data** (e.g., project with client name):

```typescript
const { data, error } = await supabase
  .from('projects')
  .select(`
    *,
    clients:client_id (id, name, email),
    team_members:project_members (
      user:user_id (id, name, avatar)
    )
  `)
  .order('created_at', { ascending: false })
```

**Check migration file** to see foreign key relationships.

### Pattern 2: Search & Filter
**Client-side filter** (for small datasets):
```typescript
const filteredItems = items.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
)
```

**Server-side search** (for large datasets):
```typescript
const { data } = await supabase
  .from('table_name')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
  .limit(50)
```

### Pattern 3: Pagination
```typescript
const PAGE_SIZE = 20

const { data, error } = await supabase
  .from('table_name')
  .select('*', { count: 'exact' })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
  .order('created_at', { ascending: false })
```

### Pattern 4: Real-time Updates
**For features like Messages, Notifications**:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'messages' },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setItems(prev => [payload.new, ...prev])
          toast.info('New message received')
        }
      }
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

### Pattern 5: File Upload (Files Hub, Gallery, Video Studio)
```typescript
const handleUpload = async (file: File) => {
  try {
    // 1. Upload to storage
    const fileName = `${Date.now()}-${file.name}`
    const { error: uploadError } = await supabase
      .storage
      .from('files')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    // 2. Get public URL
    const { data: urlData } = supabase
      .storage
      .from('files')
      .getPublicUrl(fileName)

    // 3. Create database record
    const { data, error } = await supabase
      .from('files')
      .insert({
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type
      })
      .select()
      .single()

    if (error) throw error

    setFiles([data, ...files])
    toast.success(`${file.name} uploaded!`)
  } catch (error) {
    toast.error('Upload failed')
    logger.error('Upload failed', { error })
  }
}
```

---

## TROUBLESHOOTING

### Error: "relation does not exist"
**Problem**: Table not created in database
**Solution**:
1. Check migration file exists in `/supabase/migrations/`
2. Run `supabase db push` to apply migrations
3. Verify table name matches exactly (case-sensitive)

### Error: "new row violates row-level security policy"
**Problem**: RLS policy blocking insert/update/delete
**Solution**:
1. Check RLS policies in migration file
2. Ensure user is authenticated
3. Verify `user_id` or `created_by` column matches current user
4. For testing, temporarily disable RLS:
   ```sql
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

### Error: "Cannot read properties of null"
**Problem**: Data not loading before render
**Solution**: Add loading state check:
```typescript
if (isLoading) return <DashboardSkeleton />
```

### Error: "Function not defined"
**Problem**: Database function doesn't exist
**Solution**:
1. Check migration file for function definitions
2. Run migrations
3. Call function correctly:
   ```typescript
   const { data } = await supabase.rpc('function_name', { param: value })
   ```

### Performance Issues
**Problem**: Slow queries, large datasets
**Solutions**:
1. Add pagination (see Pattern 3 above)
2. Add indexes (already in migration files)
3. Optimize select queries (only fetch needed columns)
4. Use count queries separately if not needed

---

## QUICK REFERENCE COMMANDS

### Database Commands
```bash
# Apply migrations
supabase db push

# Reset database (CAREFUL!)
supabase db reset

# Check migration status
supabase migration list

# Generate TypeScript types
supabase gen types typescript --local > lib/database.types.ts
```

### Supabase Dashboard
```bash
# Open Supabase dashboard
open https://supabase.com/dashboard/project/[your-project-id]

# View tables: Table Editor tab
# View auth users: Authentication tab
# View storage buckets: Storage tab
# View logs: Logs & Analytics tab
```

### Development Server
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

---

## TEMPLATE FILES

### Complete Page Template
Save this as a reference when starting new refactoring:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { useAnnouncer } from '@/lib/accessibility'
import { DashboardSkeleton, CardSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'

// UI components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const logger = createFeatureLogger('FeatureName')

export default function FeaturePage() {
  const supabase = createClient()
  const { announce } = useAnnouncer()

  // State
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [formData, setFormData] = useState({})

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('table_name')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        setItems(data || [])
        announce(`Loaded ${data?.length || 0} items`)
        logger.info('Data fetched', { count: data?.length })
      } catch (err) {
        logger.error('Fetch failed', { error: err })
        setError('Failed to load data')
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Create
  const handleCreate = async () => {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .insert(formData)
        .select()
        .single()

      if (error) throw error

      setItems([data, ...items])
      toast.success(`${data.name} created!`)
      logger.info('Item created', { itemId: data.id })
      setShowCreateDialog(false)
      setFormData({})
    } catch (error) {
      logger.error('Create failed', { error })
      toast.error('Failed to create item')
    }
  }

  // Update
  const handleUpdate = async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('table_name')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setItems(items.map(item => item.id === id ? data : item))
      toast.success('Updated successfully!')
      logger.info('Item updated', { itemId: id })
    } catch (error) {
      logger.error('Update failed', { error })
      toast.error('Failed to update')
    }
  }

  // Delete
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('table_name')
        .delete()
        .eq('id', id)

      if (error) throw error

      setItems(items.filter(item => item.id !== id))
      toast.success('Deleted successfully')
      logger.info('Item deleted', { itemId: id })
    } catch (error) {
      logger.error('Delete failed', { error })
      toast.error('Failed to delete')
    }
  }

  // Render states
  if (isLoading) return <DashboardSkeleton />
  if (error) return <ErrorEmptyState message={error} />
  if (items.length === 0) {
    return (
      <NoDataEmptyState
        title="No items yet"
        description="Create your first item to get started"
        actionLabel="Create Item"
        onAction={() => setShowCreateDialog(true)}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Feature Name</h1>
        <Button onClick={() => setShowCreateDialog(true)}>
          Create New
        </Button>
      </div>

      {/* List */}
      <div className="grid gap-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{item.description}</p>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => handleUpdate(item.id, { ...item })}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
          </DialogHeader>
          {/* Form fields */}
          <Button onClick={handleCreate}>Create</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

---

## DAILY CHECKLIST

Print this and check off as you work:

```
SESSION: _____ | FEATURE: _______________ | DATE: _______

SETUP
□ Git branch created: feature/[name]
□ Migration file verified in /supabase/migrations/
□ Table name confirmed: _______________
□ Page file opened: app/(app)/dashboard/___/page.tsx

IMPLEMENTATION
□ Supabase client imported
□ Logger initialized
□ Mock data identified and removed
□ useState for items, isLoading, error added
□ useEffect for fetching added
□ handleCreate converted to async
□ handleUpdate converted to async
□ handleDelete converted to async
□ Toast messages updated with real data
□ console.log replaced with logger

UI STATES
□ Loading state renders DashboardSkeleton
□ Error state renders ErrorEmptyState
□ Empty state renders NoDataEmptyState
□ Data renders correctly

TESTING
□ Page loads without errors
□ Data fetches on mount
□ Create operation works
□ Update operation works
□ Delete operation works
□ Toast notifications work
□ Logger messages appear
□ Error handling works (tested by breaking network)

GIT
□ Changes committed with clear message
□ Pushed to remote branch

NOTES:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## SUCCESS STORIES (Examples)

### Example 1: Projects Hub Refactoring
**Before**: 150 lines of mock data
**After**: 50 lines of Supabase queries
**Time**: 6 hours
**Result**: Full CRUD working with real database

### Example 2: Clients Page
**Before**: Static client list
**After**: Dynamic client management with search
**Time**: 5 hours
**Result**: Real client data, relationships with projects

### Example 3: Gallery
**Before**: Fake image grid
**After**: Real image uploads with Supabase Storage
**Time**: 7 hours
**Result**: Upload, organize, delete images

---

## NEXT STEPS

1. **Read**: `COMPREHENSIVE_AUDIT_REPORT.md` for full context
2. **Choose**: Start with Dashboard Overview (easiest)
3. **Follow**: This guide step-by-step
4. **Test**: Thoroughly before moving to next feature
5. **Document**: Update progress in audit report
6. **Repeat**: Move to next feature in priority order

---

## SUPPORT & RESOURCES

### Documentation
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

### Internal Docs
- `/COMPREHENSIVE_AUDIT_REPORT.md` - Full audit and strategy
- `/NAVIGATION_VERIFICATION_REPORT.md` - Navigation feature docs
- `/DATABASE_INTEGRATION_PLAN.md` - Database architecture

### Key Files
- Logger: `/lib/logger.ts`
- Supabase client: `/lib/supabase/client.ts`
- Accessibility: `/lib/accessibility.ts`
- UI components: `/components/ui/*`

---

**Created**: November 27, 2025
**Last Updated**: November 27, 2025
**Status**: Ready for use - Start refactoring today!
