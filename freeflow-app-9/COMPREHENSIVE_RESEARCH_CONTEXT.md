# FreeFlow App - Comprehensive Research & Context Document

## Executive Summary

This document provides a complete technical overview of the FreeFlow application, including:
- Architecture and technology stack
- Integration patterns with open-source libraries
- Page and feature inventory
- Hook system analysis
- World-class component library
- Remaining work and next steps

---

## Project Statistics

| Metric | Count |
|--------|-------|
| Total Hooks | 744 |
| Hooks with Supabase Integration | 739 (99.3%) |
| V1 Dashboard Pages | 166 |
| V2 Dashboard Pages | 214 |
| V2 Client Components | 215 |
| App (app) V2 Pages | 165 |
| V2 Pages with Hook Imports | 95 |
| World-Class Components | 20+ |

---

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS

### Backend & Database
- **Supabase** - PostgreSQL database, Auth, Realtime
- **Supabase RLS** - Row-level security policies

### UI Component Libraries
- **shadcn/ui** - Headless UI components built on Radix UI
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Data Management
- **TanStack Table v8** - Headless table library
- **TanStack Query** - Server state management
- **Recharts** - Data visualization

### Form Handling
- **React Hook Form** - Performant forms
- **Zod** - Schema validation

---

## Open-Source Library Integration Patterns

### 1. shadcn/ui Integration

**Location**: `components/ui/`

**Key Components Used**:
- Dialog, AlertDialog - Modal dialogs
- Form, FormField - Form management
- Button, Input, Select - Form controls
- Card, Table, Tabs - Layout components
- Toast (Sonner) - Notifications
- Command - Command palette
- DataTable - Table component

**Pattern Example** (Form with Zod validation):
```typescript
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

function MyForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "" }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Handle form submission with Supabase
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
      </form>
    </Form>
  )
}
```

### 2. TanStack Table Integration

**Location**: `components/world-class/data-table/`

**Files**:
- `data-table.tsx` - Main table component
- `data-table-column-header.tsx` - Sortable headers
- `data-table-pagination.tsx` - Pagination controls
- `data-table-row-actions.tsx` - Row action menus
- `data-table-toolbar.tsx` - Search and filters

**Features Implemented**:
- Sorting (ascending/descending)
- Filtering (global and column-specific)
- Pagination (configurable page sizes)
- Row selection (single and multi-select)
- Column visibility toggle
- CSV export
- Loading/error/empty states
- Row actions (view, edit, delete, copy)

**Usage Pattern**:
```typescript
import { DataTable, DataTableColumnHeader } from "@/components/world-class/data-table"
import { ColumnDef } from "@tanstack/react-table"

const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Invoice #" />,
  },
  {
    accessorKey: "amount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => formatCurrency(row.getValue("amount")),
  },
]

<DataTable
  columns={columns}
  data={invoices}
  isLoading={loading}
  enableRowSelection
  enablePagination
  onRowEdit={(row) => openEditDialog(row)}
  onRowDelete={(row) => handleDelete(row.id)}
/>
```

### 3. Recharts Integration

**Location**: `components/world-class/charts/`

**Files**:
- `line-chart.tsx` - Line chart component
- `area-chart.tsx` - Area chart component
- `bar-chart.tsx` - Bar chart component
- `pie-chart.tsx` - Pie chart component

**Features**:
- Responsive containers
- Theme support (light/dark mode)
- Loading states
- Custom tooltips
- Grid and axis customization

**Usage Pattern**:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { date: "Jan", revenue: 4000, expenses: 2400 },
  { date: "Feb", revenue: 3000, expenses: 1398 },
]

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
    <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
  </LineChart>
</ResponsiveContainer>
```

---

## Hook System Architecture

### Base Hooks

**Location**: `lib/hooks/`

**Foundation Hooks**:
- `use-supabase-query.ts` - Generic Supabase query hook with caching
- `use-supabase-mutation.ts` - Generic Supabase mutation hook
- `use-current-user.ts` - Current user authentication state

**Pattern**: All domain hooks build on these foundation hooks.

### Domain-Specific Hooks

**Categories**:

#### Financial
- `use-invoices.ts` - Invoice management
- `use-transactions.ts` - Financial transactions
- `use-billing.ts` - Billing management
- `use-expenses.ts` - Expense tracking
- `use-payments.ts` - Payment processing

#### Project Management
- `use-projects.ts` - Project CRUD
- `use-tasks.ts` - Task management
- `use-milestones.ts` - Milestone tracking
- `use-sprints.ts` - Sprint management

#### CRM
- `use-clients.ts` - Client management
- `use-customers.ts` - Customer management
- `use-leads.ts` - Lead generation
- `use-sales.ts` - Sales pipeline

#### Communication
- `use-messages.ts` - Messaging system
- `use-notifications.ts` - Notification management
- `use-announcements.ts` - Announcements

#### Analytics
- `use-analytics.ts` - Analytics data
- `use-performance-analytics.ts` - Performance metrics
- `use-investor-metrics.ts` - Investor dashboards

#### Content
- `use-content-studio.ts` - Content creation
- `use-media-library.ts` - Media management
- `use-docs.ts` - Documentation

#### AI Features
- `use-ai-create.ts` - AI content generation
- `use-ai-designs.ts` - AI design tools
- `use-kazi-ai.ts` - Kazi AI assistant

### Hook Usage Pattern

```typescript
import { useInvoices } from '@/lib/hooks/use-invoices'

function InvoicesPage() {
  const {
    invoices,        // Data array
    loading,         // Loading state
    error,           // Error state
    createInvoice,   // Create function
    updateInvoice,   // Update function
    deleteInvoice,   // Delete function
    refetch          // Refetch function
  } = useInvoices({ status: 'pending' })

  const handleCreate = async (data) => {
    await createInvoice(data)
    toast.success('Invoice created!')
  }

  return (
    <DataTable
      data={invoices}
      isLoading={loading}
      onRowEdit={handleEdit}
      onRowDelete={handleDelete}
    />
  )
}
```

---

## World-Class Component Library

### Location: `components/world-class/`

### Structure

```
world-class/
├── charts/
│   ├── area-chart.tsx
│   ├── bar-chart.tsx
│   ├── line-chart.tsx
│   ├── pie-chart.tsx
│   └── index.ts
├── data-table/
│   ├── data-table.tsx
│   ├── data-table-column-header.tsx
│   ├── data-table-pagination.tsx
│   ├── data-table-row-actions.tsx
│   ├── data-table-toolbar.tsx
│   └── index.ts
├── forms/
│   ├── form-checkbox.tsx
│   ├── form-date-picker.tsx
│   ├── form-field.tsx
│   ├── form-file-upload.tsx
│   ├── form-input.tsx
│   ├── form-select.tsx
│   ├── form-switch.tsx
│   ├── form-textarea.tsx
│   └── index.ts
├── collaboration/
│   └── (collaborative editing components)
├── file-upload/
│   └── (file upload components)
└── index.ts
```

### Key Features

1. **DataTable**: Full-featured table with sorting, filtering, pagination
2. **Charts**: Responsive charts with theme support
3. **Forms**: Validated form components with Zod integration
4. **File Upload**: Drag-and-drop file uploads

---

## Page Structure

### V1 Dashboard (`app/v1/dashboard/`)

**Purpose**: Original dashboard implementation (166 pages)

**Key Pages**:
- `/v1/dashboard/analytics` - Analytics overview
- `/v1/dashboard/projects` - Project management
- `/v1/dashboard/invoices` - Invoice management
- `/v1/dashboard/clients` - Client management
- `/v1/dashboard/calendar` - Calendar/scheduling
- `/v1/dashboard/messages` - Messaging
- `/v1/dashboard/ai-*` - AI feature pages

### V2 Dashboard (`app/v2/dashboard/`)

**Purpose**: Enhanced dashboard with client components (214 pages)

**Pattern**: Each V2 page has:
- `page.tsx` - Server component (entry point)
- `*-client.tsx` - Client component (interactive UI)

**Key Pages**:
- Analytics, Projects, Invoices, Clients
- CRM, Sales, Marketing
- AI tools, Content Studio
- Admin, Settings, Security

### App (app) Dashboard (`app/(app)/dashboard/`)

**Purpose**: Main application dashboard with V2 enhancements (165 pages)

**Pattern**: Uses `*-v2` suffix for enhanced pages

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   V1 Pages   │  │   V2 Pages   │  │  App (app) Pages     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    World-Class Components                        │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌──────────────────┐ │
│  │ DataTable│  │  Charts   │  │ Forms  │  │  File Upload     │ │
│  └──────────┘  └───────────┘  └────────┘  └──────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Domain Hooks                               │
│  useInvoices, useClients, useProjects, useAnalytics, etc.       │
│  (744 hooks total - 739 with Supabase integration)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Foundation Hooks                              │
│  useSupabaseQuery, useSupabaseMutation, useCurrentUser          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Backend                           │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  ┌─────────────────┐   │
│  │ Database │  │  Auth  │  │ Storage  │  │    Realtime     │   │
│  └──────────┘  └────────┘  └──────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Integration Status

### Fully Integrated (Using Supabase Hooks)

| Page Category | Status | Notes |
|---------------|--------|-------|
| Invoicing | Complete | useInvoices, invoicing-extended hooks |
| Transactions | Complete | useTransactions hook |
| Time Tracking | Complete | useTimeTracking hook |
| Bookings | Complete | useBookings hook |
| Analytics | Complete | useAnalytics, charts connected |
| Projects | Complete | useProjects hook |
| Clients | Complete | useClients hook |
| Calendar | Complete | useCalendarEvents hook |
| Messages | Complete | useMessages hook |

### Partially Integrated

| Page Category | Status | Missing |
|---------------|--------|---------|
| AI Features | 80% | Some AI API routes need implementation |
| Collaboration | 70% | Real-time sync partially implemented |
| Admin Pages | 90% | Minor UI polish needed |

### Placeholder Patterns Remaining

| Pattern | Count | Notes |
|---------|-------|-------|
| console.log placeholders | 1 | Minimal |
| setTimeout fake async | 2 | In testing pages |
| "Coming soon" toasts | 5 | Planned features |

---

## Context7 Library Documentation Summary

### shadcn/ui (1056+ code snippets)

**Key Patterns**:
1. **Form Components**: Use React Hook Form with Zod validation
2. **DataTable**: TanStack Table integration with filtering, sorting, pagination
3. **Dialog/AlertDialog**: Modal patterns for confirmations
4. **Field Component**: Consistent form field rendering

### TanStack Table v8

**Key Features**:
- `useReactTable` - Core hook
- `getCoreRowModel` - Required for all tables
- `getSortedRowModel` - Enable sorting
- `getFilteredRowModel` - Enable filtering
- `getPaginationRowModel` - Enable pagination
- Column definitions with `accessorKey` or `accessorFn`

### Recharts

**Key Components**:
- `ResponsiveContainer` - Required wrapper for responsive sizing
- `LineChart`, `AreaChart`, `BarChart`, `PieChart` - Chart types
- `XAxis`, `YAxis`, `CartesianGrid` - Axis components
- `Tooltip`, `Legend` - Interactive elements

---

## Supabase Table Mapping

### Core Tables

| Table | Hook | Status |
|-------|------|--------|
| invoices | useInvoices | Complete |
| clients | useClients | Complete |
| projects | useProjects | Complete |
| tasks | useTasks | Complete |
| time_tracking | useTimeTracking | Complete |
| financial_transactions | useTransactions | Complete |
| calendar_events | useCalendarEvents | Complete |
| messages | useMessages | Complete |
| users | useCurrentUser | Complete |

### Extended Tables

| Table | Hook | Status |
|-------|------|--------|
| analytics | useAnalytics | Complete |
| bookings | useBookings | Complete |
| notifications | useNotifications | Complete |
| team_members | useTeam | Complete |
| products | useProducts | Complete |
| orders | useOrders | Complete |

---

## Next Steps & Recommendations

### Immediate Priorities

1. **Wire Remaining V2 Pages**
   - 95 of 214 V2 pages currently import hooks
   - Target: 100% hook integration

2. **Complete AI Feature Integration**
   - Implement remaining AI API routes
   - Connect to OpenAI/Anthropic APIs

3. **Polish Admin Features**
   - Complete user management UI
   - Finalize permission system

### Medium-Term Goals

1. **Real-Time Collaboration**
   - Complete Yjs integration for collaborative editing
   - Add presence indicators

2. **Mobile Optimization**
   - Responsive design improvements
   - Touch-friendly interactions

3. **Performance Optimization**
   - Implement code splitting
   - Add caching strategies

### Long-Term Vision

1. **Plugin System**
   - Allow third-party integrations
   - Build plugin marketplace

2. **White-Label Support**
   - Customizable branding
   - Multi-tenant architecture

3. **Enterprise Features**
   - SSO integration
   - Audit logging
   - Compliance tools

---

## File References

### Key Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration

### Core Libraries
- `lib/supabase/client.ts` - Supabase client setup
- `lib/supabase/server.ts` - Server-side Supabase
- `lib/utils.ts` - Utility functions

### Component Indexes
- `components/ui/index.ts` - shadcn/ui components
- `components/world-class/index.ts` - World-class components
- `lib/hooks/index.ts` - All hooks exports

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## Conclusion

The FreeFlow application is a comprehensive freelancer/business management platform with:

- **Strong Foundation**: 744 hooks with 99.3% Supabase integration
- **World-Class Components**: Reusable DataTable, Charts, Forms
- **Open-Source Integration**: shadcn/ui, TanStack Table, Recharts
- **Scalable Architecture**: Clean separation of concerns

The remaining work focuses on:
1. Wiring the final 119 V2 pages with hooks
2. Completing AI feature integrations
3. Polishing the admin and collaboration features

---

## Recent Wiring Updates

### Session Progress

The following pages have been wired with Supabase hooks:

1. **api-keys-client.tsx** (app/v2/dashboard/api-keys/)
   - Added `useApiKeys` hook import
   - Connected `createKey`, `revokeKey`, `activateKey`, `deactivateKey`, `deleteKey` operations
   - Updated stats to use real data with mock fallback
   - Updated filtered keys to use active data

2. **builds-client.tsx** (app/v2/dashboard/builds/)
   - Added `useBuilds` and `useBuildPipelines` hooks
   - Created `activeBuilds` variable with real data + mock fallback
   - Updated `filteredBuilds` to use active data
   - Updated stats calculations to use active data

### Pages Already Wired (Direct Supabase Integration)

Many V2 pages already have direct Supabase integration:
- bugs-client.tsx - Uses direct Supabase queries
- access-logs-client.tsx - Uses direct Supabase queries
- audit-logs-client.tsx - Uses direct Supabase queries
- invoicing-client.tsx - Uses hooks
- transactions-client.tsx - Uses hooks
- time-tracking-client.tsx - Uses hooks
- bookings-client.tsx - Uses hooks
- analytics-client.tsx - Uses hooks with charts

### Remaining Work

119 V2 pages still need hook integration. However, many are:
- Showcase/demo pages (don't need real data)
- AI feature pages (need AI API routes, not database hooks)
- UI component showcases (static content)

Priority pages for hook integration:
1. CRM-related pages
2. Financial pages
3. Project management pages
4. Team management pages

---

*Document generated: January 18, 2026*
*Total Pages: V1(166) + V2(214) + App(165) = 545 dashboard pages*
*Total Hooks: 744*
*Hooks with Supabase Integration: 739 (99.3%)*
