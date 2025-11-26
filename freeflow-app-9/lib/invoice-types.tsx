/**
 * Invoice System Types
 *
 * Comprehensive type definitions for invoicing, billing, and payment management.
 */

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'crypto'
export type BillingCycle = 'one_time' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
export type TaxType = 'percentage' | 'fixed'
export type DiscountType = 'percentage' | 'fixed'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxRate?: number
  taxAmount?: number
}

export interface Invoice {
  id: string
  userId: string
  invoiceNumber: string
  clientId?: string
  clientName: string
  clientEmail: string
  clientAddress?: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  discountType?: DiscountType
  total: number
  currency: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  notes?: string
  terms?: string
  recurringConfig?: RecurringConfig
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface RecurringConfig {
  enabled: boolean
  cycle: BillingCycle
  startDate: string
  endDate?: string
  nextInvoiceDate?: string
  occurrences?: number
  currentOccurrence?: number
}

export interface Payment {
  id: string
  invoiceId: string
  userId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  reference?: string
  paidAt?: string
  failureReason?: string
  metadata?: Record<string, any>
  createdAt: string
}

export interface InvoiceTemplate {
  id: string
  userId: string
  name: string
  description?: string
  items: InvoiceItem[]
  defaultTerms?: string
  defaultNotes?: string
  taxRate: number
  currency: string
  isDefault: boolean
  usageCount: number
  createdAt: string
  updatedAt: string
}

export interface BillingStats {
  userId: string
  totalRevenue: number
  pendingAmount: number
  overdueAmount: number
  averageInvoiceValue: number
  totalInvoices: number
  paidInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  cancelledInvoices: number
  revenueByMonth: MonthlyRevenue[]
  revenueByClient: ClientRevenue[]
  paymentMethods: PaymentMethodStats[]
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  invoiceCount: number
}

export interface ClientRevenue {
  clientId: string
  clientName: string
  revenue: number
  invoiceCount: number
}

export interface PaymentMethodStats {
  method: PaymentMethod
  count: number
  totalAmount: number
}
