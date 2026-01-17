/**
 * Shared Column Definitions for EnhancedDataTable
 *
 * TanStack Table column definitions for common V2 dashboard pages
 * Import these into pages and use with <EnhancedDataTable columns={...} data={...} />
 *
 * Based on TanStack Table patterns: https://tanstack.com/table
 */

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  Download,
  Send,
  Copy,
  Calendar,
  DollarSign,
  Building2,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Truck,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(dateString)
}

// ============================================================================
// SORTABLE HEADER COMPONENT
// ============================================================================

interface SortableHeaderProps {
  column: any
  children: React.ReactNode
}

export function SortableHeader({ column, children }: SortableHeaderProps) {
  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      className="-ml-4"
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

// ============================================================================
// SELECTION COLUMN (CHECKBOX)
// ============================================================================

export const selectionColumn: ColumnDef<any> = {
  id: 'select',
  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected() ||
        (table.getIsSomePageRowsSelected() && 'indeterminate')
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all"
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),
  enableSorting: false,
  enableHiding: false,
}

// ============================================================================
// CLIENT COLUMNS
// ============================================================================

export interface ClientTableRow {
  id: string
  company: string
  name: string
  email: string
  phone?: string
  industry: string
  status: 'lead' | 'prospect' | 'opportunity' | 'customer' | 'churned' | 'inactive'
  revenue: number
  projects: number
  health_score: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  lastActivity: string
  createdAt: string
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'customer':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    case 'prospect':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    case 'lead':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
    case 'opportunity':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
    case 'churned':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }
}

const getTierBadgeVariant = (tier: string) => {
  switch (tier) {
    case 'platinum':
      return 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
    case 'gold':
      return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
    case 'silver':
      return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
    default:
      return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'
  }
}

export function createClientColumns(handlers?: {
  onView?: (client: ClientTableRow) => void
  onEdit?: (client: ClientTableRow) => void
  onDelete?: (client: ClientTableRow) => void
  onEmail?: (client: ClientTableRow) => void
  onCall?: (client: ClientTableRow) => void
}): ColumnDef<ClientTableRow>[] {
  return [
    selectionColumn,
    {
      accessorKey: 'company',
      header: ({ column }) => <SortableHeader column={column}>Company</SortableHeader>,
      cell: ({ row }) => {
        const client = row.original
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs">
                {client.company.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{client.company}</div>
              <div className="text-xs text-muted-foreground">{client.industry}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Contact</SortableHeader>,
      cell: ({ row }) => {
        const client = row.original
        return (
          <div>
            <div className="font-medium">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge className={getStatusBadgeVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'tier',
      header: 'Tier',
      cell: ({ row }) => {
        const tier = row.getValue('tier') as string
        return (
          <Badge className={getTierBadgeVariant(tier)}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'revenue',
      header: ({ column }) => <SortableHeader column={column}>Revenue</SortableHeader>,
      cell: ({ row }) => {
        const amount = row.getValue('revenue') as number
        return <div className="font-medium">{formatCurrency(amount)}</div>
      },
    },
    {
      accessorKey: 'projects',
      header: ({ column }) => <SortableHeader column={column}>Projects</SortableHeader>,
      cell: ({ row }) => <div className="text-center">{row.getValue('projects')}</div>,
    },
    {
      accessorKey: 'health_score',
      header: 'Health',
      cell: ({ row }) => {
        const score = row.getValue('health_score') as number
        const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
        return (
          <div className="flex items-center gap-2 w-24">
            <Progress value={score} className={`h-2 ${color}`} />
            <span className="text-xs">{score}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'lastActivity',
      header: ({ column }) => <SortableHeader column={column}>Last Activity</SortableHeader>,
      cell: ({ row }) => formatRelativeTime(row.getValue('lastActivity')),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const client = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlers?.onView?.(client)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onEdit?.(client)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Client
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlers?.onEmail?.(client)}>
                <Mail className="mr-2 h-4 w-4" /> Send Email
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onCall?.(client)}>
                <Phone className="mr-2 h-4 w-4" /> Call
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handlers?.onDelete?.(client)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// ============================================================================
// INVOICE COLUMNS
// ============================================================================

export interface InvoiceTableRow {
  id: string
  invoice_number: string
  client_name: string
  client_email: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partial'
  due_date: string
  created_at: string
  paid_at?: string
  items_count: number
}

const getInvoiceStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return { icon: CheckCircle2, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
    case 'sent':
      return { icon: Send, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' }
    case 'draft':
      return { icon: Edit, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' }
    case 'overdue':
      return { icon: AlertCircle, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' }
    case 'cancelled':
      return { icon: XCircle, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' }
    case 'partial':
      return { icon: Clock, className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' }
    default:
      return { icon: Clock, className: 'bg-gray-100 text-gray-800' }
  }
}

export function createInvoiceColumns(handlers?: {
  onView?: (invoice: InvoiceTableRow) => void
  onEdit?: (invoice: InvoiceTableRow) => void
  onDelete?: (invoice: InvoiceTableRow) => void
  onSend?: (invoice: InvoiceTableRow) => void
  onDownload?: (invoice: InvoiceTableRow) => void
  onDuplicate?: (invoice: InvoiceTableRow) => void
  onMarkPaid?: (invoice: InvoiceTableRow) => void
}): ColumnDef<InvoiceTableRow>[] {
  return [
    selectionColumn,
    {
      accessorKey: 'invoice_number',
      header: ({ column }) => <SortableHeader column={column}>Invoice #</SortableHeader>,
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.getValue('invoice_number')}</div>
      ),
    },
    {
      accessorKey: 'client_name',
      header: ({ column }) => <SortableHeader column={column}>Client</SortableHeader>,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="font-medium">{invoice.client_name}</div>
              <div className="text-xs text-muted-foreground">{invoice.client_email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => <SortableHeader column={column}>Amount</SortableHeader>,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <div className="font-semibold">
            {formatCurrency(invoice.amount, invoice.currency)}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const { icon: Icon, className } = getInvoiceStatusBadge(status)
        return (
          <Badge className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
      cell: ({ row }) => {
        const dueDate = new Date(row.getValue('due_date'))
        const isOverdue = dueDate < new Date() && row.original.status !== 'paid'
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            {formatDate(row.getValue('due_date'))}
            {isOverdue && <span className="text-xs ml-1">(Overdue)</span>}
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
      cell: ({ row }) => formatDate(row.getValue('created_at')),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const invoice = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlers?.onView?.(invoice)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onEdit?.(invoice)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onDownload?.(invoice)}>
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {invoice.status === 'draft' && (
                <DropdownMenuItem onClick={() => handlers?.onSend?.(invoice)}>
                  <Send className="mr-2 h-4 w-4" /> Send to Client
                </DropdownMenuItem>
              )}
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handlers?.onMarkPaid?.(invoice)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Paid
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handlers?.onDuplicate?.(invoice)}>
                <Copy className="mr-2 h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handlers?.onDelete?.(invoice)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// ============================================================================
// ORDER COLUMNS
// ============================================================================

export interface OrderTableRow {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed'
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'
  total: number
  currency: string
  items_count: number
  shipping_method: string
  tracking_number?: string
  created_at: string
}

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case 'delivered':
      return { icon: CheckCircle2, className: 'bg-green-100 text-green-800' }
    case 'shipped':
      return { icon: Truck, className: 'bg-blue-100 text-blue-800' }
    case 'processing':
      return { icon: Package, className: 'bg-purple-100 text-purple-800' }
    case 'confirmed':
      return { icon: CheckCircle2, className: 'bg-blue-100 text-blue-800' }
    case 'pending':
      return { icon: Clock, className: 'bg-amber-100 text-amber-800' }
    case 'cancelled':
      return { icon: XCircle, className: 'bg-gray-100 text-gray-800' }
    case 'refunded':
      return { icon: AlertCircle, className: 'bg-red-100 text-red-800' }
    default:
      return { icon: Clock, className: 'bg-gray-100 text-gray-800' }
  }
}

export function createOrderColumns(handlers?: {
  onView?: (order: OrderTableRow) => void
  onEdit?: (order: OrderTableRow) => void
  onFulfill?: (order: OrderTableRow) => void
  onCancel?: (order: OrderTableRow) => void
  onRefund?: (order: OrderTableRow) => void
  onPrintLabel?: (order: OrderTableRow) => void
}): ColumnDef<OrderTableRow>[] {
  return [
    selectionColumn,
    {
      accessorKey: 'order_number',
      header: ({ column }) => <SortableHeader column={column}>Order #</SortableHeader>,
      cell: ({ row }) => (
        <div className="font-mono font-medium">{row.getValue('order_number')}</div>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: ({ column }) => <SortableHeader column={column}>Customer</SortableHeader>,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div>
            <div className="font-medium">{order.customer_name}</div>
            <div className="text-xs text-muted-foreground">{order.customer_email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const { icon: Icon, className } = getOrderStatusBadge(status)
        return (
          <Badge className={className}>
            <Icon className="mr-1 h-3 w-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'payment_status',
      header: 'Payment',
      cell: ({ row }) => {
        const status = row.getValue('payment_status') as string
        const variant =
          status === 'paid'
            ? 'bg-green-100 text-green-800'
            : status === 'refunded'
            ? 'bg-red-100 text-red-800'
            : 'bg-amber-100 text-amber-800'
        return (
          <Badge className={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'total',
      header: ({ column }) => <SortableHeader column={column}>Total</SortableHeader>,
      cell: ({ row }) => {
        const order = row.original
        return <div className="font-semibold">{formatCurrency(order.total, order.currency)}</div>
      },
    },
    {
      accessorKey: 'items_count',
      header: 'Items',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-muted-foreground" />
          {row.getValue('items_count')}
        </div>
      ),
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => formatDate(row.getValue('created_at')),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handlers?.onView?.(order)}>
                <Eye className="mr-2 h-4 w-4" /> View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onEdit?.(order)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Order
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {order.fulfillment_status !== 'fulfilled' && order.status !== 'cancelled' && (
                <DropdownMenuItem onClick={() => handlers?.onFulfill?.(order)}>
                  <Package className="mr-2 h-4 w-4" /> Fulfill Order
                </DropdownMenuItem>
              )}
              {order.status === 'shipped' && order.tracking_number && (
                <DropdownMenuItem onClick={() => handlers?.onPrintLabel?.(order)}>
                  <Truck className="mr-2 h-4 w-4" /> Print Label
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {order.status !== 'cancelled' && order.status !== 'refunded' && (
                <>
                  <DropdownMenuItem
                    onClick={() => handlers?.onCancel?.(order)}
                    className="text-orange-600"
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Cancel Order
                  </DropdownMenuItem>
                  {order.payment_status === 'paid' && (
                    <DropdownMenuItem
                      onClick={() => handlers?.onRefund?.(order)}
                      className="text-red-600"
                    >
                      <AlertCircle className="mr-2 h-4 w-4" /> Issue Refund
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// ============================================================================
// TASK COLUMNS
// ============================================================================

export interface TaskTableRow {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  project?: string
  due_date?: string
  created_at: string
}

export function createTaskColumns(handlers?: {
  onView?: (task: TaskTableRow) => void
  onEdit?: (task: TaskTableRow) => void
  onDelete?: (task: TaskTableRow) => void
  onToggleComplete?: (task: TaskTableRow) => void
}): ColumnDef<TaskTableRow>[] {
  return [
    selectionColumn,
    {
      accessorKey: 'title',
      header: ({ column }) => <SortableHeader column={column}>Task</SortableHeader>,
      cell: ({ row }) => {
        const task = row.original
        return (
          <div>
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-xs text-muted-foreground truncate max-w-xs">
                {task.description}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const variants: Record<string, string> = {
          todo: 'bg-gray-100 text-gray-800',
          in_progress: 'bg-blue-100 text-blue-800',
          review: 'bg-purple-100 text-purple-800',
          done: 'bg-green-100 text-green-800',
          blocked: 'bg-red-100 text-red-800',
        }
        return (
          <Badge className={variants[status] || variants.todo}>
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => {
        const priority = row.getValue('priority') as string
        const variants: Record<string, string> = {
          low: 'bg-gray-100 text-gray-800',
          medium: 'bg-blue-100 text-blue-800',
          high: 'bg-amber-100 text-amber-800',
          urgent: 'bg-red-100 text-red-800',
        }
        return (
          <Badge className={variants[priority] || variants.medium}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'assignee',
      header: 'Assignee',
      cell: ({ row }) => {
        const assignee = row.getValue('assignee') as string
        return (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {assignee.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{assignee}</span>
          </div>
        )
      },
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
      cell: ({ row }) => {
        const dueDate = row.getValue('due_date') as string | undefined
        if (!dueDate) return <span className="text-muted-foreground">-</span>
        const isOverdue = new Date(dueDate) < new Date() && row.original.status !== 'done'
        return (
          <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(dueDate)}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlers?.onView?.(task)}>
                <Eye className="mr-2 h-4 w-4" /> View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onEdit?.(task)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              {task.status !== 'done' && (
                <DropdownMenuItem onClick={() => handlers?.onToggleComplete?.(task)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Mark Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handlers?.onDelete?.(task)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}

// ============================================================================
// PROJECT COLUMNS
// ============================================================================

export interface ProjectTableRow {
  id: string
  name: string
  description?: string
  client?: string
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'archived'
  progress: number
  budget: number
  spent: number
  start_date: string
  due_date?: string
  team_size: number
  tasks_count: number
  completed_tasks: number
}

export function createProjectColumns(handlers?: {
  onView?: (project: ProjectTableRow) => void
  onEdit?: (project: ProjectTableRow) => void
  onDelete?: (project: ProjectTableRow) => void
  onArchive?: (project: ProjectTableRow) => void
}): ColumnDef<ProjectTableRow>[] {
  return [
    selectionColumn,
    {
      accessorKey: 'name',
      header: ({ column }) => <SortableHeader column={column}>Project</SortableHeader>,
      cell: ({ row }) => {
        const project = row.original
        return (
          <div>
            <div className="font-medium">{project.name}</div>
            {project.client && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {project.client}
              </div>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        const variants: Record<string, string> = {
          planning: 'bg-purple-100 text-purple-800',
          active: 'bg-green-100 text-green-800',
          on_hold: 'bg-amber-100 text-amber-800',
          completed: 'bg-blue-100 text-blue-800',
          archived: 'bg-gray-100 text-gray-800',
        }
        return (
          <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'progress',
      header: 'Progress',
      cell: ({ row }) => {
        const progress = row.getValue('progress') as number
        const project = row.original
        return (
          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span>{progress}%</span>
              <span className="text-muted-foreground">
                {project.completed_tasks}/{project.tasks_count}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )
      },
    },
    {
      accessorKey: 'budget',
      header: ({ column }) => <SortableHeader column={column}>Budget</SortableHeader>,
      cell: ({ row }) => {
        const project = row.original
        const percentUsed = (project.spent / project.budget) * 100
        const isOverBudget = percentUsed > 100
        return (
          <div>
            <div className={isOverBudget ? 'text-red-600 font-medium' : ''}>
              {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentUsed.toFixed(0)}% used
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'due_date',
      header: ({ column }) => <SortableHeader column={column}>Due Date</SortableHeader>,
      cell: ({ row }) => {
        const dueDate = row.getValue('due_date') as string | undefined
        if (!dueDate) return <span className="text-muted-foreground">-</span>
        const isOverdue =
          new Date(dueDate) < new Date() && row.original.status !== 'completed'
        return (
          <div className={isOverdue ? 'text-red-600' : ''}>
            {formatDate(dueDate)}
          </div>
        )
      },
    },
    {
      accessorKey: 'team_size',
      header: 'Team',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          {row.getValue('team_size')}
        </div>
      ),
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const project = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlers?.onView?.(project)}>
                <Eye className="mr-2 h-4 w-4" /> View Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlers?.onEdit?.(project)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handlers?.onArchive?.(project)}>
                <Package className="mr-2 h-4 w-4" /> Archive
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlers?.onDelete?.(project)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
