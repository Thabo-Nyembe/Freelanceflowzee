/**
 * Invoice & Billing Utilities
 * Helper functions and mock data for invoice management
 */

import {
  Invoice,
  InvoiceItem,
  InvoiceStatus,
  Payment,
  PaymentStatus,
  PaymentMethod,
  BillingStats,
  InvoiceTemplate,
  Currency,
  BillingCycle
} from './invoice-types'

// ============================================================================
// MOCK DATA - REMOVED (Migration Batch #15)
// ============================================================================
// MIGRATED: Batch #15 - Removed mock data, using database hooks

export const MOCK_INVOICES: Invoice[] = []
export const MOCK_PAYMENTS: Payment[] = []
export const MOCK_INVOICE_TEMPLATES: InvoiceTemplate[] = []
export const MOCK_BILLING_STATS: BillingStats = {
  totalRevenue: 0,
  pendingInvoices: 0,
  pendingAmount: 0,
  paidInvoices: 0,
  paidAmount: 0,
  overdueInvoices: 0,
  overdueAmount: 0,
  averageInvoiceValue: 0,
  averagePaymentTime: 0,
  paymentSuccessRate: 0,
  recurringRevenue: 0,
  revenueByMonth: [],
  revenueByClient: [],
  paymentMethodDistribution: []
}

// Helper Functions
export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function getInvoiceStatusColor(status: InvoiceStatus): string {
  const colors = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    viewed: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    paid: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    refunded: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
  }
  return colors[status]
}

export function getPaymentStatusColor(status: PaymentStatus): string {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-orange-100 text-orange-700'
  }
  return colors[status]
}

export function getPaymentMethodIcon(method: PaymentMethod): string {
  const icons = {
    'credit-card': '💳',
    'bank-transfer': '🏦',
    'paypal': '💰',
    'stripe': '💳',
    'crypto': '₿',
    'cash': '💵',
    'check': '📝'
  }
  return icons[method]
}

export function calculateInvoiceTotal(items: InvoiceItem[], taxRate: number = 0, discount: number = 0): {
  subtotal: number
  taxAmount: number
  total: number
} {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discount), 0)
  const discountedSubtotal = subtotal - discount
  const taxAmount = (discountedSubtotal * taxRate) / 100
  const total = discountedSubtotal + taxAmount

  return { subtotal, taxAmount, total }
}

export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status === 'paid' || invoice.status === 'cancelled' || invoice.status === 'refunded') {
    return false
  }
  return new Date() > new Date(invoice.dueDate)
}

export function getDaysUntilDue(dueDate: Date): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getDaysOverdue(dueDate: Date): number {
  const days = getDaysUntilDue(dueDate)
  return days < 0 ? Math.abs(days) : 0
}

export function generateInvoiceNumber(prefix: string = 'INV'): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `${prefix}-${year}-${random}`
}

export function calculateProcessingFee(amount: number, percentage: number = 2.9, fixed: number = 0.30): number {
  return (amount * percentage / 100) + fixed
}

export function calculateNetAmount(amount: number, processingFee: number): number {
  return amount - processingFee
}

export function getBillingCycleLabel(cycle: BillingCycle): string {
  const labels = {
    'one-time': 'One-time',
    'weekly': 'Weekly',
    'monthly': 'Monthly',
    'quarterly': 'Quarterly',
    'annually': 'Annually'
  }
  return labels[cycle]
}

export function calculateNextInvoiceDate(lastDate: Date, cycle: BillingCycle): Date {
  const next = new Date(lastDate)

  switch (cycle) {
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'annually':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}

export function filterInvoicesByStatus(invoices: Invoice[], status: InvoiceStatus[]): Invoice[] {
  return invoices.filter(inv => status.includes(inv.status))
}

export function sortInvoicesByDate(invoices: Invoice[], order: 'asc' | 'desc' = 'desc'): Invoice[] {
  return [...invoices].sort((a, b) => {
    const dateA = new Date(a.issueDate).getTime()
    const dateB = new Date(b.issueDate).getTime()
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

export function getOverdueInvoices(invoices: Invoice[]): Invoice[] {
  return invoices.filter(inv => isInvoiceOverdue(inv))
}

export function calculateTotalRevenue(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)
}

export function calculatePendingAmount(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'viewed')
    .reduce((sum, inv) => sum + inv.total, 0)
}

export function calculateOverdueAmount(invoices: Invoice[]): number {
  return invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)
}

export function groupInvoicesByMonth(invoices: Invoice[]): Record<string, Invoice[]> {
  return invoices.reduce((groups, invoice) => {
    const month = new Date(invoice.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!groups[month]) {
      groups[month] = []
    }
    groups[month].push(invoice)
    return groups
  }, {} as Record<string, Invoice[]>)
}
