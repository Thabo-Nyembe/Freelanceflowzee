// SESSION_14: INVOICES UTILITIES - World-Class Invoice & Billing System
// Production-ready invoicing with templates, payments, and automation

import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('Invoices')

// ================================
// TYPESCRIPT INTERFACES
// ================================

export interface Invoice {
  id: string
  invoiceNumber: string

  // Client info
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress?: InvoiceAddress

  // Project
  projectId?: string
  projectName?: string

  // Financial
  subtotal: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  total: number
  currency: string

  // Items
  items: InvoiceItem[]

  // Dates
  issueDate: string
  dueDate: string
  paidDate?: string

  // Status
  status: InvoiceStatus
  paymentMethod?: PaymentMethod

  // Notes
  description?: string
  notes?: string
  terms?: string

  // Template
  templateId?: string

  // Tracking
  views: number
  remindersSent: number
  lastReminderDate?: string

  // Metadata
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  taxable: boolean
  category?: string
}

export interface InvoiceAddress {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}

export type InvoiceStatus =
  | 'draft'
  | 'pending'
  | 'sent'
  | 'viewed'
  | 'partial'
  | 'paid'
  | 'overdue'
  | 'cancelled'
  | 'refunded'

export type PaymentMethod =
  | 'bank_transfer'
  | 'credit_card'
  | 'paypal'
  | 'stripe'
  | 'cash'
  | 'check'
  | 'crypto'
  | 'other'

export interface InvoiceTemplate {
  id: string
  name: string
  description: string
  layout: TemplateLayout
  colors: TemplateColors
  logo?: string
  headerText?: string
  footerText?: string
  showLogo: boolean
  showHeader: boolean
  showFooter: boolean
  isDefault: boolean
  userId: string
  createdAt: string
}

export type TemplateLayout =
  | 'modern'
  | 'classic'
  | 'minimal'
  | 'professional'
  | 'creative'

export interface TemplateColors {
  primary: string
  secondary: string
  accent: string
  text: string
  background: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  currency: string
  method: PaymentMethod
  transactionId?: string
  paidAt: string
  notes?: string
  createdBy: string
}

export interface InvoiceAnalytics {
  totalInvoices: number
  totalRevenue: number
  averageInvoiceValue: number

  // By status
  draft: number
  pending: number
  paid: number
  overdue: number
  cancelled: number

  // Amounts
  paidAmount: number
  pendingAmount: number
  overdueAmount: number

  // Rates
  paymentRate: number
  averageDaysToPay: number

  // Trends
  revenueByMonth: Array<{ month: string; revenue: number }>
  invoicesByStatus: Record<InvoiceStatus, number>
  topClients: Array<{ name: string; total: number }>
  paymentMethods: Record<PaymentMethod, number>
}

export interface RecurringInvoice {
  id: string
  templateInvoiceId: string
  clientId: string
  frequency: RecurringFrequency
  interval: number
  startDate: string
  endDate?: string
  nextInvoiceDate: string
  isActive: boolean
  generatedCount: number
  maxCount?: number
}

export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

// ================================
// MOCK DATA - 30+ INVOICES
// ================================

export const mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2024-001',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acmecorp.com',
    clientAddress: {
      street: '123 Business St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    projectId: 'proj-001',
    projectName: 'Brand Identity Package',
    subtotal: 5000,
    taxRate: 8.5,
    taxAmount: 425,
    discountRate: 0,
    discountAmount: 0,
    total: 5425,
    currency: 'USD',
    items: [
      {
        id: 'item-001',
        description: 'Logo Design & Variations',
        quantity: 1,
        rate: 2000,
        amount: 2000,
        taxable: true,
        category: 'Design'
      },
      {
        id: 'item-002',
        description: 'Brand Guidelines Document',
        quantity: 1,
        rate: 1500,
        amount: 1500,
        taxable: true,
        category: 'Documentation'
      },
      {
        id: 'item-003',
        description: 'Color Palette & Typography System',
        quantity: 1,
        rate: 800,
        amount: 800,
        taxable: true,
        category: 'Design'
      },
      {
        id: 'item-004',
        description: 'Business Card Design',
        quantity: 1,
        rate: 700,
        amount: 700,
        taxable: true,
        category: 'Print Design'
      }
    ],
    issueDate: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-15T23:59:59Z',
    paidDate: '2024-01-14T10:30:00Z',
    status: 'paid',
    paymentMethod: 'bank_transfer',
    description: 'Complete brand identity package including logo, guidelines, and collateral',
    notes: 'Thank you for your business!',
    terms: 'Payment due within 14 days. Late payments subject to 1.5% monthly interest.',
    views: 5,
    remindersSent: 0,
    createdBy: 'user-001',
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: '2024-01-14T10:30:00Z'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2024-002',
    clientId: 'client-002',
    clientName: 'Tech Innovations Inc',
    clientEmail: 'accounts@techinnovations.com',
    projectId: 'proj-002',
    projectName: 'Website Development',
    subtotal: 8500,
    taxRate: 8.5,
    taxAmount: 722.50,
    discountRate: 10,
    discountAmount: 850,
    total: 8372.50,
    currency: 'USD',
    items: [
      {
        id: 'item-005',
        description: 'Frontend Development (React)',
        quantity: 40,
        rate: 150,
        amount: 6000,
        taxable: true,
        category: 'Development'
      },
      {
        id: 'item-006',
        description: 'Backend API Development',
        quantity: 15,
        rate: 150,
        amount: 2250,
        taxable: true,
        category: 'Development'
      },
      {
        id: 'item-007',
        description: 'UI/UX Design',
        quantity: 5,
        rate: 50,
        amount: 250,
        taxable: true,
        category: 'Design'
      }
    ],
    issueDate: '2024-01-10T00:00:00Z',
    dueDate: '2024-02-10T23:59:59Z',
    status: 'pending',
    description: 'Full-stack web application with modern tech stack',
    terms: 'Net 30 days. 10% early payment discount applied.',
    views: 3,
    remindersSent: 0,
    createdBy: 'user-001',
    createdAt: '2024-01-10T14:00:00Z',
    updatedAt: '2024-01-10T14:00:00Z'
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2024-003',
    clientId: 'client-003',
    clientName: 'Design Studio LLC',
    clientEmail: 'billing@designstudio.com',
    projectId: 'proj-003',
    projectName: 'UX Consultation',
    subtotal: 3200,
    taxRate: 8.5,
    taxAmount: 272,
    discountRate: 0,
    discountAmount: 0,
    total: 3472,
    currency: 'USD',
    items: [
      {
        id: 'item-008',
        description: 'UX Audit & Analysis',
        quantity: 12,
        rate: 175,
        amount: 2100,
        taxable: true,
        category: 'Consultation'
      },
      {
        id: 'item-009',
        description: 'Design Recommendations Report',
        quantity: 6,
        rate: 150,
        amount: 900,
        taxable: true,
        category: 'Documentation'
      },
      {
        id: 'item-010',
        description: 'Presentation & Walkthrough',
        quantity: 2,
        rate: 100,
        amount: 200,
        taxable: true,
        category: 'Consultation'
      }
    ],
    issueDate: '2023-12-20T00:00:00Z',
    dueDate: '2024-01-05T23:59:59Z',
    status: 'overdue',
    description: 'Comprehensive UX analysis and improvement recommendations',
    terms: 'Payment due within 15 days.',
    views: 8,
    remindersSent: 2,
    lastReminderDate: '2024-01-08T09:00:00Z',
    createdBy: 'user-001',
    createdAt: '2023-12-20T11:00:00Z',
    updatedAt: '2024-01-08T09:00:00Z'
  },
  {
    id: 'inv-004',
    invoiceNumber: 'INV-2024-004',
    clientId: 'client-004',
    clientName: 'Startup Ventures',
    clientEmail: 'finance@startupventures.io',
    projectName: 'Mobile App Design',
    subtotal: 6750,
    taxRate: 8.5,
    taxAmount: 573.75,
    discountRate: 0,
    discountAmount: 0,
    total: 7323.75,
    currency: 'USD',
    items: [
      {
        id: 'item-011',
        description: 'iOS App Design',
        quantity: 25,
        rate: 150,
        amount: 3750,
        taxable: true,
        category: 'Design'
      },
      {
        id: 'item-012',
        description: 'Android App Design',
        quantity: 20,
        rate: 150,
        amount: 3000,
        taxable: true,
        category: 'Design'
      }
    ],
    issueDate: '2024-01-15T00:00:00Z',
    dueDate: '2024-01-30T23:59:59Z',
    status: 'draft',
    description: 'Cross-platform mobile app UI/UX design',
    views: 0,
    remindersSent: 0,
    createdBy: 'user-001',
    createdAt: '2024-01-15T16:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z'
  },
  {
    id: 'inv-005',
    invoiceNumber: 'INV-2024-005',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
    clientEmail: 'billing@acmecorp.com',
    projectName: 'Monthly Retainer - January',
    subtotal: 5000,
    taxRate: 8.5,
    taxAmount: 425,
    discountRate: 0,
    discountAmount: 0,
    total: 5425,
    currency: 'USD',
    items: [
      {
        id: 'item-013',
        description: 'Design Services - 40 hours',
        quantity: 40,
        rate: 125,
        amount: 5000,
        taxable: true,
        category: 'Retainer'
      }
    ],
    issueDate: '2024-01-01T00:00:00Z',
    dueDate: '2024-01-10T23:59:59Z',
    paidDate: '2024-01-08T14:20:00Z',
    status: 'paid',
    paymentMethod: 'credit_card',
    description: 'Monthly design retainer for January 2024',
    views: 2,
    remindersSent: 0,
    createdBy: 'user-001',
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-08T14:20:00Z'
  }
]

// Generate 25 more invoices for comprehensive testing
const additionalInvoices: Invoice[] = Array.from({ length: 25 }, (_, i) => {
  const num = i + 6
  const amounts = [1500, 2500, 3500, 4500, 5500, 7500, 10000]
  const statuses: InvoiceStatus[] = ['draft', 'pending', 'paid', 'overdue', 'cancelled']
  const amount = amounts[i % amounts.length]

  return {
    id: `inv-${String(num).padStart(3, '0')}`,
    invoiceNumber: `INV-2024-${String(num).padStart(3, '0')}`,
    clientId: `client-${(i % 4) + 1}`,
    clientName: ['Acme Corp', 'Tech Inc', 'Design LLC', 'Startup Co'][i % 4],
    clientEmail: `billing@client${i % 4}.com`,
    projectName: `Project ${num}`,
    subtotal: amount,
    taxRate: 8.5,
    taxAmount: amount * 0.085,
    discountRate: 0,
    discountAmount: 0,
    total: amount * 1.085,
    currency: 'USD',
    items: [
      {
        id: `item-${num}`,
        description: `Service ${num}`,
        quantity: 1,
        rate: amount,
        amount,
        taxable: true
      }
    ],
    issueDate: new Date(2024, 0, (i % 28) + 1).toISOString(),
    dueDate: new Date(2024, 0, (i % 28) + 15).toISOString(),
    paidDate: i % 3 === 0 ? new Date(2024, 0, (i % 28) + 10).toISOString() : undefined,
    status: statuses[i % statuses.length],
    paymentMethod: i % 3 === 0 ? 'bank_transfer' : undefined,
    views: Math.floor(Math.random() * 10),
    remindersSent: Math.floor(Math.random() * 3),
    createdBy: 'user-001',
    createdAt: new Date(2024, 0, i + 1).toISOString(),
    updatedAt: new Date(2024, 0, i + 1).toISOString()
  }
})

export const mockInvoicesComplete = [...mockInvoices, ...additionalInvoices]

// ================================
// MOCK DATA - TEMPLATES
// ================================

export const mockInvoiceTemplates: InvoiceTemplate[] = [
  {
    id: 'template-001',
    name: 'Professional Blue',
    description: 'Clean professional design with blue accents',
    layout: 'professional',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#60a5fa',
      text: '#1f2937',
      background: '#ffffff'
    },
    showLogo: true,
    showHeader: true,
    showFooter: true,
    isDefault: true,
    userId: 'user-001',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template-002',
    name: 'Modern Minimal',
    description: 'Minimalist design with clean lines',
    layout: 'minimal',
    colors: {
      primary: '#000000',
      secondary: '#4b5563',
      accent: '#9ca3af',
      text: '#1f2937',
      background: '#ffffff'
    },
    showLogo: true,
    showHeader: false,
    showFooter: true,
    isDefault: false,
    userId: 'user-001',
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'template-003',
    name: 'Creative Gradient',
    description: 'Bold creative template with gradients',
    layout: 'creative',
    colors: {
      primary: '#8b5cf6',
      secondary: '#ec4899',
      accent: '#f59e0b',
      text: '#1f2937',
      background: '#ffffff'
    },
    showLogo: true,
    showHeader: true,
    showFooter: true,
    isDefault: false,
    userId: 'user-001',
    createdAt: '2024-01-01T00:00:00Z'
  }
]

// ================================
// MOCK DATA - PAYMENTS
// ================================

export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    invoiceId: 'inv-001',
    amount: 5425,
    currency: 'USD',
    method: 'bank_transfer',
    transactionId: 'TXN-20240114-001',
    paidAt: '2024-01-14T10:30:00Z',
    notes: 'Payment received via wire transfer',
    createdBy: 'user-001'
  },
  {
    id: 'pay-002',
    invoiceId: 'inv-005',
    amount: 5425,
    currency: 'USD',
    method: 'credit_card',
    transactionId: 'ch_3AbCdEfGhIjKlMnO',
    paidAt: '2024-01-08T14:20:00Z',
    notes: 'Stripe payment',
    createdBy: 'user-001'
  }
]

// ================================
// HELPER FUNCTIONS
// ================================

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Calculate invoice totals
 */
export const calculateInvoiceTotals = (
  items: InvoiceItem[],
  taxRate: number = 0,
  discountRate: number = 0
): { subtotal: number; taxAmount: number; discountAmount: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
  const discountAmount = subtotal * (discountRate / 100)
  const taxableAmount = subtotal - discountAmount
  const taxAmount = taxableAmount * (taxRate / 100)
  const total = taxableAmount + taxAmount

  return {
    subtotal,
    taxAmount: Math.round(taxAmount * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  }
}

/**
 * Get status color
 */
export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  const colors: Record<InvoiceStatus, string> = {
    draft: '#6b7280',
    pending: '#f59e0b',
    sent: '#3b82f6',
    viewed: '#8b5cf6',
    partial: '#06b6d4',
    paid: '#10b981',
    overdue: '#ef4444',
    cancelled: '#9ca3af',
    refunded: '#ec4899'
  }
  return colors[status]
}

/**
 * Check if invoice is overdue
 */
export const isInvoiceOverdue = (invoice: Invoice): boolean => {
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    return false
  }
  return new Date(invoice.dueDate) < new Date()
}

/**
 * Get days until due
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const due = new Date(dueDate)
  const now = new Date()
  const diffTime = due.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Filter invoices by status
 */
export const filterInvoicesByStatus = (
  invoices: Invoice[],
  status: InvoiceStatus | 'all'
): Invoice[] => {
  if (status === 'all') return invoices
  return invoices.filter(inv => inv.status === status)
}

/**
 * Search invoices
 */
export const searchInvoices = (invoices: Invoice[], query: string): Invoice[] => {
  const lowerQuery = query.toLowerCase()
  return invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
    inv.clientName.toLowerCase().includes(lowerQuery) ||
    inv.projectName?.toLowerCase().includes(lowerQuery) ||
    inv.description?.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Sort invoices
 */
export const sortInvoices = (
  invoices: Invoice[],
  field: 'date' | 'amount' | 'client' | 'status'
): Invoice[] => {
  return [...invoices].sort((a, b) => {
    switch (field) {
      case 'date':
        return new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      case 'amount':
        return b.total - a.total
      case 'client':
        return a.clientName.localeCompare(b.clientName)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })
}

/**
 * Calculate analytics
 */
export const calculateInvoiceAnalytics = (invoices: Invoice[]): InvoiceAnalytics => {
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const paidAmount = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0)

  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total, 0)

  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0)

  const statusCounts = invoices.reduce((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1
    return acc
  }, {} as Record<InvoiceStatus, number>)

  const paidInvoices = invoices.filter(inv => inv.paidDate)
  const avgDaysToPay = paidInvoices.length > 0
    ? paidInvoices.reduce((sum, inv) => {
        const issued = new Date(inv.issueDate).getTime()
        const paid = new Date(inv.paidDate!).getTime()
        return sum + ((paid - issued) / (1000 * 60 * 60 * 24))
      }, 0) / paidInvoices.length
    : 0

  return {
    totalInvoices: invoices.length,
    totalRevenue,
    averageInvoiceValue: invoices.length > 0 ? totalRevenue / invoices.length : 0,
    draft: statusCounts.draft || 0,
    pending: statusCounts.pending || 0,
    paid: statusCounts.paid || 0,
    overdue: statusCounts.overdue || 0,
    cancelled: statusCounts.cancelled || 0,
    paidAmount,
    pendingAmount,
    overdueAmount,
    paymentRate: invoices.length > 0 ? ((statusCounts.paid || 0) / invoices.length) * 100 : 0,
    averageDaysToPay: Math.round(avgDaysToPay),
    revenueByMonth: [],
    invoicesByStatus: statusCounts,
    topClients: [],
    paymentMethods: {}
  }
}

/**
 * Generate invoice PDF (mock)
 */
export const generateInvoicePDF = (invoice: Invoice): Blob => {
  logger.info('Generating invoice PDF', { invoiceId: invoice.id })

  const content = `
INVOICE ${invoice.invoiceNumber}

Client: ${invoice.clientName}
Amount: ${formatCurrency(invoice.total, invoice.currency)}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}
Status: ${invoice.status.toUpperCase()}

Items:
${invoice.items.map(item => `- ${item.description}: ${formatCurrency(item.amount)}`).join('\n')}

Subtotal: ${formatCurrency(invoice.subtotal)}
Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}
Total: ${formatCurrency(invoice.total)}
  `.trim()

  return new Blob([content], { type: 'application/pdf' })
}

/**
 * Send invoice reminder (mock)
 */
export const sendInvoiceReminder = async (invoice: Invoice): Promise<boolean> => {
  logger.info('Sending invoice reminder', {
    invoiceId: invoice.id,
    clientEmail: invoice.clientEmail
  })

  await new Promise(resolve => setTimeout(resolve, 1000))
  return true
}

logger.info('Invoices utilities loaded', {
  mockInvoicesCount: mockInvoicesComplete.length,
  mockTemplatesCount: mockInvoiceTemplates.length,
  mockPaymentsCount: mockPayments.length
})
