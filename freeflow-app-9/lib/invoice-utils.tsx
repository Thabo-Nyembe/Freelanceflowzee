/**
 * Invoice System Utilities
 *
 * Comprehensive invoicing and billing management with recurring invoices,
 * payment tracking, and revenue analytics.
 */

import { createFeatureLogger } from '@/lib/logger'
import {
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  PaymentMethod,
  InvoiceTemplate,
  BillingStats,
  InvoiceItem,
  BillingCycle,
  MonthlyRevenue,
  ClientRevenue
} from '@/lib/invoice-types'

const logger = createFeatureLogger('InvoiceUtils')

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    userId: 'user-1',
    invoiceNumber: 'INV-2024-001',
    clientName: 'TechCorp Inc.',
    clientEmail: 'billing@techcorp.com',
    clientAddress: '123 Tech Street, San Francisco, CA 94105',
    items: [
      {
        id: 'item-1',
        description: 'Website Design & Development',
        quantity: 1,
        unitPrice: 5000,
        total: 5000
      },
      {
        id: 'item-2',
        description: 'SEO Optimization',
        quantity: 3,
        unitPrice: 500,
        total: 1500
      }
    ],
    subtotal: 6500,
    taxRate: 10,
    taxAmount: 650,
    discount: 0,
    total: 7150,
    currency: 'USD',
    status: 'paid',
    issueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Thank you for your business!',
    terms: 'Net 30',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv-002',
    userId: 'user-1',
    invoiceNumber: 'INV-2024-002',
    clientName: 'StartupXYZ',
    clientEmail: 'founder@startupxyz.com',
    items: [
      {
        id: 'item-3',
        description: 'Logo Design',
        quantity: 1,
        unitPrice: 1500,
        total: 1500
      }
    ],
    subtotal: 1500,
    taxRate: 10,
    taxAmount: 150,
    discount: 150,
    discountType: 'fixed',
    total: 1500,
    currency: 'USD',
    status: 'overdue',
    issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Early payment discount applied',
    createdAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'inv-003',
    userId: 'user-1',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Global Enterprises',
    clientEmail: 'accounts@global-ent.com',
    items: [
      {
        id: 'item-4',
        description: 'Monthly Consulting - January',
        quantity: 20,
        unitPrice: 150,
        total: 3000
      }
    ],
    subtotal: 3000,
    taxRate: 10,
    taxAmount: 300,
    discount: 0,
    total: 3300,
    currency: 'USD',
    status: 'sent',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    recurringConfig: {
      enabled: true,
      cycle: 'monthly',
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      nextInvoiceDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    invoiceId: 'inv-001',
    userId: 'user-1',
    amount: 7150,
    currency: 'USD',
    method: 'credit_card',
    status: 'completed',
    transactionId: 'txn_1234567890',
    paidAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const MOCK_INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'tpl-001',
    userId: 'user-1',
    name: 'Website Development',
    description: 'Standard website development package',
    items: [
      {
        id: 'item-tpl-1',
        description: 'Website Design & Development',
        quantity: 1,
        unitPrice: 5000,
        total: 5000
      }
    ],
    defaultTerms: 'Net 30',
    defaultNotes: 'Thank you for your business!',
    taxRate: 10,
    currency: 'USD',
    isDefault: true,
    usageCount: 5,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export const MOCK_BILLING_STATS: BillingStats = {
  userId: 'user-1',
  totalRevenue: 45000,
  pendingAmount: 8500,
  overdueAmount: 1500,
  averageInvoiceValue: 2500,
  totalInvoices: 18,
  paidInvoices: 12,
  pendingInvoices: 4,
  overdueInvoices: 2,
  cancelledInvoices: 0,
  revenueByMonth: [
    { month: 'Jan', revenue: 5000, invoiceCount: 3 },
    { month: 'Feb', revenue: 7500, invoiceCount: 4 },
    { month: 'Mar', revenue: 6000, invoiceCount: 2 },
    { month: 'Apr', revenue: 8000, invoiceCount: 5 },
    { month: 'May', revenue: 9500, invoiceCount: 4 }
  ],
  revenueByClient: [
    { clientId: 'client-1', clientName: 'TechCorp Inc.', revenue: 15000, invoiceCount: 5 },
    { clientId: 'client-2', clientName: 'Global Enterprises', revenue: 12000, invoiceCount: 4 },
    { clientId: 'client-3', clientName: 'StartupXYZ', revenue: 8000, invoiceCount: 3 }
  ],
  paymentMethods: [
    { method: 'credit_card', count: 8, totalAmount: 25000 },
    { method: 'bank_transfer', count: 4, totalAmount: 15000 },
    { method: 'paypal', count: 2, totalAmount: 5000 }
  ]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  const colors: Record<InvoiceStatus, string> = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-blue-100 text-blue-700',
    viewed: 'bg-purple-100 text-purple-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-500',
    refunded: 'bg-orange-100 text-orange-700'
  }
  return colors[status]
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors: Record<PaymentStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-700',
    cancelled: 'bg-gray-100 text-gray-500'
  }
  return colors[status]
}

export function getPaymentMethodIcon(method: PaymentMethod): string {
  const icons: Record<PaymentMethod, string> = {
    credit_card: '💳',
    debit_card: '💳',
    bank_transfer: '🏦',
    paypal: '🅿️',
    stripe: '💵',
    cash: '💵',
    check: '✅',
    crypto: '₿'
  }
  return icons[method]
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getDaysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const now = new Date()
  const diff = now.getTime() - due.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function isInvoiceOverdue(dueDate: string): boolean {
  return getDaysOverdue(dueDate) > 0
}

export function getBillingCycleLabel(cycle: BillingCycle): string {
  const labels: Record<BillingCycle, string> = {
    one_time: 'One-time',
    weekly: 'Weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly'
  }
  return labels[cycle]
}

export function calculateInvoiceTotal(items: InvoiceItem[], taxRate: number, discount: number = 0): {
  subtotal: number
  taxAmount: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal - discount) * (taxRate / 100)
  const total = subtotal + taxAmount - discount

  return {
    subtotal,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear()
  const maxNumber = existingInvoices
    .filter(inv => inv.invoiceNumber.startsWith(`INV-${year}`))
    .reduce((max, inv) => {
      const num = parseInt(inv.invoiceNumber.split('-')[2])
      return num > max ? num : max
    }, 0)

  return `INV-${year}-${String(maxNumber + 1).padStart(3, '0')}`
}

export function calculateNextInvoiceDate(startDate: string, cycle: BillingCycle): string {
  const date = new Date(startDate)

  switch (cycle) {
    case 'weekly':
      date.setDate(date.getDate() + 7)
      break
    case 'monthly':
      date.setMonth(date.getMonth() + 1)
      break
    case 'quarterly':
      date.setMonth(date.getMonth() + 3)
      break
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1)
      break
    default:
      break
  }

  return date.toISOString()
}

export function filterInvoicesByStatus(invoices: Invoice[], status: InvoiceStatus | 'all'): Invoice[] {
  if (status === 'all') return invoices
  return invoices.filter(inv => inv.status === status)
}

export function searchInvoices(invoices: Invoice[], query: string): Invoice[] {
  const lowerQuery = query.toLowerCase()
  return invoices.filter(
    inv =>
      inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
      inv.clientName.toLowerCase().includes(lowerQuery) ||
      inv.clientEmail.toLowerCase().includes(lowerQuery)
  )
}

export function sortInvoicesByDate(invoices: Invoice[], direction: 'asc' | 'desc' = 'desc'): Invoice[] {
  return [...invoices].sort((a, b) => {
    const dateA = new Date(a.issueDate).getTime()
    const dateB = new Date(b.issueDate).getTime()
    return direction === 'desc' ? dateB - dateA : dateA - dateB
  })
}

export function getOutstandingAmount(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.total, 0)
}

export function getTotalRevenue(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
}

export function getAverageInvoiceValue(invoices: Invoice[]): number {
  if (invoices.length === 0) return 0
  const total = invoices.reduce((sum, inv) => sum + inv.total, 0)
  return total / invoices.length
}

export function getInvoicesByDateRange(
  invoices: Invoice[],
  startDate: string,
  endDate: string
): Invoice[] {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()

  return invoices.filter(inv => {
    const issueDate = new Date(inv.issueDate).getTime()
    return issueDate >= start && issueDate <= end
  })
}

export function groupInvoicesByMonth(invoices: Invoice[]): MonthlyRevenue[] {
  const grouped = new Map<string, { revenue: number; count: number }>()

  invoices.forEach(inv => {
    if (inv.status === 'paid') {
      const month = new Date(inv.paidDate || inv.issueDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      })

      const existing = grouped.get(month) || { revenue: 0, count: 0 }
      grouped.set(month, {
        revenue: existing.revenue + inv.total,
        count: existing.count + 1
      })
    }
  })

  return Array.from(grouped.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    invoiceCount: data.count
  }))
}

export function groupInvoicesByClient(invoices: Invoice[]): ClientRevenue[] {
  const grouped = new Map<string, { name: string; revenue: number; count: number }>()

  invoices.forEach(inv => {
    if (inv.status === 'paid') {
      const clientId = inv.clientId || inv.clientEmail
      const existing = grouped.get(clientId) || { name: inv.clientName, revenue: 0, count: 0 }

      grouped.set(clientId, {
        name: inv.clientName,
        revenue: existing.revenue + inv.total,
        count: existing.count + 1
      })
    }
  })

  return Array.from(grouped.entries())
    .map(([clientId, data]) => ({
      clientId,
      clientName: data.name,
      revenue: data.revenue,
      invoiceCount: data.count
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

export function validateInvoice(invoice: Partial<Invoice>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!invoice.clientName) errors.push('Client name is required')
  if (!invoice.clientEmail) errors.push('Client email is required')
  if (!invoice.items || invoice.items.length === 0) errors.push('At least one item is required')
  if (!invoice.dueDate) errors.push('Due date is required')

  if (invoice.items) {
    invoice.items.forEach((item, index) => {
      if (!item.description) errors.push(`Item ${index + 1}: Description is required`)
      if (item.quantity <= 0) errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      if (item.unitPrice < 0) errors.push(`Item ${index + 1}: Unit price must be non-negative`)
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

logger.info('Invoice utilities initialized', {
  mockInvoices: MOCK_INVOICES.length,
  mockPayments: MOCK_PAYMENTS.length,
  mockTemplates: MOCK_INVOICE_TEMPLATES.length,
  utilityFunctions: 20
})
