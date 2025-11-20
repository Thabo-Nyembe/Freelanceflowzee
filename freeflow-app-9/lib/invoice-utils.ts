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

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    status: 'paid',
    clientId: 'client-1',
    clientName: 'TechCorp Inc',
    clientEmail: 'billing@techcorp.com',
    items: [
      {
        id: 'item-1',
        description: 'Website Design & Development',
        quantity: 1,
        unitPrice: 5000,
        discount: 0,
        taxRate: 10,
        total: 5500
      },
      {
        id: 'item-2',
        description: 'SEO Optimization',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        taxRate: 10,
        total: 1650
      }
    ],
    subtotal: 6500,
    taxRate: 10,
    taxAmount: 650,
    discount: 0,
    total: 7150,
    currency: 'USD',
    dueDate: new Date('2024-07-15'),
    issueDate: new Date('2024-06-15'),
    paidDate: new Date('2024-07-10'),
    createdBy: 'user-1',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-07-10'),
    sentAt: new Date('2024-06-15'),
    viewedAt: new Date('2024-06-16'),
    paymentMethod: 'stripe',
    paymentDetails: {
      transactionId: 'ch_1234567890',
      paymentMethod: 'stripe',
      paymentDate: new Date('2024-07-10'),
      amount: 7150,
      processingFee: 178.75,
      netAmount: 6971.25,
      status: 'completed'
    },
    metadata: {
      remindersSent: 1,
      autoPayEnabled: false,
      latePaymentFee: 0,
      earlyPaymentDiscount: 0
    }
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    status: 'sent',
    clientId: 'client-2',
    clientName: 'Creative Studios',
    clientEmail: 'accounts@creativestudios.com',
    items: [
      {
        id: 'item-3',
        description: 'Brand Identity Design',
        quantity: 1,
        unitPrice: 3500,
        discount: 350,
        taxRate: 10,
        total: 3465
      }
    ],
    subtotal: 3500,
    taxRate: 10,
    taxAmount: 315,
    discount: 350,
    total: 3465,
    currency: 'USD',
    dueDate: new Date('2024-08-01'),
    issueDate: new Date('2024-07-01'),
    createdBy: 'user-1',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01'),
    sentAt: new Date('2024-07-01'),
    viewedAt: new Date('2024-07-02'),
    metadata: {
      remindersSent: 0,
      autoPayEnabled: false,
      latePaymentFee: 0,
      earlyPaymentDiscount: 10
    }
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    status: 'overdue',
    clientId: 'client-3',
    clientName: 'StartupXYZ',
    clientEmail: 'billing@startupxyz.com',
    items: [
      {
        id: 'item-4',
        description: 'Mobile App Development',
        quantity: 1,
        unitPrice: 12000,
        discount: 0,
        taxRate: 10,
        total: 13200
      }
    ],
    subtotal: 12000,
    taxRate: 10,
    taxAmount: 1200,
    discount: 0,
    total: 13200,
    currency: 'USD',
    dueDate: new Date('2024-06-30'),
    issueDate: new Date('2024-05-30'),
    createdBy: 'user-1',
    createdAt: new Date('2024-05-30'),
    updatedAt: new Date('2024-06-01'),
    sentAt: new Date('2024-05-30'),
    viewedAt: new Date('2024-05-31'),
    metadata: {
      remindersSent: 3,
      lastReminderDate: new Date('2024-07-05'),
      autoPayEnabled: false,
      latePaymentFee: 200,
      earlyPaymentDiscount: 0
    }
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2024-004',
    status: 'draft',
    clientId: 'client-4',
    clientName: 'Global Marketing Co',
    clientEmail: 'invoices@globalmarketing.com',
    items: [
      {
        id: 'item-5',
        description: 'Marketing Campaign Strategy',
        quantity: 1,
        unitPrice: 4500,
        discount: 0,
        taxRate: 10,
        total: 4950
      },
      {
        id: 'item-6',
        description: 'Social Media Management (3 months)',
        quantity: 3,
        unitPrice: 800,
        discount: 0,
        taxRate: 10,
        total: 2640
      }
    ],
    subtotal: 6900,
    taxRate: 10,
    taxAmount: 690,
    discount: 0,
    total: 7590,
    currency: 'USD',
    dueDate: new Date('2024-08-20'),
    issueDate: new Date('2024-07-20'),
    createdBy: 'user-1',
    createdAt: new Date('2024-07-18'),
    updatedAt: new Date('2024-07-18'),
    metadata: {
      remindersSent: 0,
      autoPayEnabled: false,
      latePaymentFee: 0,
      earlyPaymentDiscount: 0
    }
  },
  {
    id: 'inv-5',
    invoiceNumber: 'INV-2024-005',
    status: 'paid',
    clientId: 'client-5',
    clientName: 'Enterprise Solutions Ltd',
    clientEmail: 'ap@enterprise.com',
    items: [
      {
        id: 'item-7',
        description: 'Monthly Subscription - Enterprise Plan',
        quantity: 1,
        unitPrice: 999,
        discount: 0,
        taxRate: 10,
        total: 1098.9
      }
    ],
    subtotal: 999,
    taxRate: 10,
    taxAmount: 99.9,
    discount: 0,
    total: 1098.9,
    currency: 'USD',
    dueDate: new Date('2024-07-25'),
    issueDate: new Date('2024-07-01'),
    paidDate: new Date('2024-07-20'),
    createdBy: 'user-1',
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-20'),
    sentAt: new Date('2024-07-01'),
    paymentMethod: 'credit-card',
    recurringConfig: {
      enabled: true,
      cycle: 'monthly',
      startDate: new Date('2024-07-01'),
      nextInvoiceDate: new Date('2024-08-01'),
      lastInvoiceDate: new Date('2024-07-01')
    },
    paymentDetails: {
      transactionId: 'cc_9876543210',
      paymentMethod: 'credit-card',
      paymentDate: new Date('2024-07-20'),
      amount: 1098.9,
      processingFee: 31.97,
      netAmount: 1066.93,
      status: 'completed'
    },
    metadata: {
      remindersSent: 0,
      autoPayEnabled: true,
      latePaymentFee: 0,
      earlyPaymentDiscount: 0
    }
  }
]

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    invoiceId: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client-1',
    clientName: 'TechCorp Inc',
    amount: 7150,
    currency: 'USD',
    method: 'stripe',
    status: 'completed',
    transactionId: 'ch_1234567890',
    processingFee: 178.75,
    netAmount: 6971.25,
    paymentDate: new Date('2024-07-10'),
    createdAt: new Date('2024-07-10'),
    updatedAt: new Date('2024-07-10')
  },
  {
    id: 'pay-2',
    invoiceId: 'inv-5',
    invoiceNumber: 'INV-2024-005',
    clientId: 'client-5',
    clientName: 'Enterprise Solutions Ltd',
    amount: 1098.9,
    currency: 'USD',
    method: 'credit-card',
    status: 'completed',
    transactionId: 'cc_9876543210',
    processingFee: 31.97,
    netAmount: 1066.93,
    paymentDate: new Date('2024-07-20'),
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-20')
  }
]

export const MOCK_INVOICE_TEMPLATES: InvoiceTemplate[] = [
  {
    id: 'template-1',
    name: 'Website Development Package',
    description: 'Standard website development with SEO',
    items: [
      {
        id: 'temp-item-1',
        description: 'Website Design & Development',
        quantity: 1,
        unitPrice: 5000,
        discount: 0,
        taxRate: 10,
        total: 5500
      },
      {
        id: 'temp-item-2',
        description: 'SEO Optimization',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        taxRate: 10,
        total: 1650
      }
    ],
    terms: 'Payment due within 30 days',
    taxRate: 10,
    discount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    usageCount: 5
  },
  {
    id: 'template-2',
    name: 'Monthly Retainer',
    description: 'Ongoing support and maintenance',
    items: [
      {
        id: 'temp-item-3',
        description: 'Monthly Support & Maintenance',
        quantity: 1,
        unitPrice: 1500,
        discount: 0,
        taxRate: 10,
        total: 1650
      }
    ],
    terms: 'Payment due on the 1st of each month',
    taxRate: 10,
    discount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    usageCount: 12
  },
  {
    id: 'template-3',
    name: 'Brand Identity Package',
    description: 'Complete brand identity design',
    items: [
      {
        id: 'temp-item-4',
        description: 'Brand Identity Design',
        quantity: 1,
        unitPrice: 3500,
        discount: 0,
        taxRate: 10,
        total: 3850
      },
      {
        id: 'temp-item-5',
        description: 'Brand Guidelines Document',
        quantity: 1,
        unitPrice: 500,
        discount: 0,
        taxRate: 10,
        total: 550
      }
    ],
    terms: '50% upfront, 50% on completion',
    taxRate: 10,
    discount: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    usageCount: 3
  }
]

export const MOCK_BILLING_STATS: BillingStats = {
  totalRevenue: 28503.9,
  pendingInvoices: 1,
  pendingAmount: 3465,
  paidInvoices: 2,
  paidAmount: 8248.9,
  overdueInvoices: 1,
  overdueAmount: 13200,
  averageInvoiceValue: 6281.08,
  averagePaymentTime: 18,
  paymentSuccessRate: 85.7,
  recurringRevenue: 1098.9,
  revenueByMonth: [
    { month: 'Jan', revenue: 4200 },
    { month: 'Feb', revenue: 5100 },
    { month: 'Mar', revenue: 6300 },
    { month: 'Apr', revenue: 5800 },
    { month: 'May', revenue: 7850 },
    { month: 'Jun', revenue: 8248.9 }
  ],
  revenueByClient: [
    { clientId: 'client-1', clientName: 'TechCorp Inc', revenue: 7150 },
    { clientId: 'client-5', clientName: 'Enterprise Solutions Ltd', revenue: 1098.9 },
    { clientId: 'client-3', clientName: 'StartupXYZ', revenue: 13200 },
    { clientId: 'client-2', clientName: 'Creative Studios', revenue: 3465 }
  ],
  paymentMethodDistribution: [
    { method: 'stripe', count: 1, amount: 7150 },
    { method: 'credit-card', count: 1, amount: 1098.9 },
    { method: 'bank-transfer', count: 0, amount: 0 },
    { method: 'paypal', count: 0, amount: 0 }
  ]
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
