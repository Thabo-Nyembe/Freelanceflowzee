/**
 * Invoice & Billing Types
 * Complete type system for invoicing and payment management
 */

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled' | 'refunded'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'credit-card' | 'bank-transfer' | 'paypal' | 'stripe' | 'crypto' | 'cash' | 'check'
export type BillingCycle = 'one-time' | 'weekly' | 'monthly' | 'quarterly' | 'annually'
export type TaxType = 'vat' | 'sales-tax' | 'gst' | 'none'
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'ZAR'

export interface Invoice {
  id: string
  invoiceNumber: string
  status: InvoiceStatus
  clientId: string
  clientName: string
  clientEmail: string
  clientAddress?: Address
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  currency: Currency
  dueDate: Date
  issueDate: Date
  paidDate?: Date
  notes?: string
  terms?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  viewedAt?: Date
  paymentMethod?: PaymentMethod
  paymentDetails?: PaymentDetails
  recurringConfig?: RecurringConfig
  metadata: InvoiceMetadata
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
}

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export interface PaymentDetails {
  transactionId?: string
  paymentMethod: PaymentMethod
  paymentDate: Date
  amount: number
  processingFee: number
  netAmount: number
  status: PaymentStatus
}

export interface RecurringConfig {
  enabled: boolean
  cycle: BillingCycle
  startDate: Date
  endDate?: Date
  nextInvoiceDate: Date
  lastInvoiceDate?: Date
  occurrences?: number
  remainingOccurrences?: number
}

export interface InvoiceMetadata {
  remindersSent: number
  lastReminderDate?: Date
  autoPayEnabled: boolean
  latePaymentFee: number
  earlyPaymentDiscount: number
}

export interface Payment {
  id: string
  invoiceId: string
  invoiceNumber: string
  clientId: string
  clientName: string
  amount: number
  currency: Currency
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string
  processingFee: number
  netAmount: number
  paymentDate: Date
  createdAt: Date
  updatedAt: Date
  notes?: string
  refundDetails?: RefundDetails
}

export interface RefundDetails {
  refundId: string
  amount: number
  reason: string
  refundDate: Date
  processedBy: string
}

export interface BillingStats {
  totalRevenue: number
  pendingInvoices: number
  pendingAmount: number
  paidInvoices: number
  paidAmount: number
  overdueInvoices: number
  overdueAmount: number
  averageInvoiceValue: number
  averagePaymentTime: number
  paymentSuccessRate: number
  recurringRevenue: number
  revenueByMonth: { month: string; revenue: number }[]
  revenueByClient: { clientId: string; clientName: string; revenue: number }[]
  paymentMethodDistribution: { method: PaymentMethod; count: number; amount: number }[]
}

export interface InvoiceTemplate {
  id: string
  name: string
  description?: string
  items: InvoiceItem[]
  terms?: string
  notes?: string
  taxRate: number
  discount: number
  createdAt: Date
  updatedAt: Date
  usageCount: number
}

export interface PaymentReminder {
  id: string
  invoiceId: string
  type: 'before-due' | 'on-due' | 'after-due'
  daysBefore?: number
  daysAfter?: number
  sent: boolean
  sentAt?: Date
  opened: boolean
  openedAt?: Date
}

export interface TaxSettings {
  enabled: boolean
  type: TaxType
  rate: number
  taxId?: string
  applicableRegions: string[]
}

export interface PaymentGateway {
  id: string
  name: string
  type: PaymentMethod
  enabled: boolean
  credentials: Record<string, string>
  fees: {
    percentage: number
    fixed: number
  }
  supportedCurrencies: Currency[]
}

export interface InvoiceFilter {
  status?: InvoiceStatus[]
  clientId?: string[]
  dateRange?: { from: Date; to: Date }
  amountRange?: { min: number; max: number }
  search?: string
}

export interface PaymentFilter {
  status?: PaymentStatus[]
  method?: PaymentMethod[]
  dateRange?: { from: Date; to: Date }
  amountRange?: { min: number; max: number }
  search?: string
}
