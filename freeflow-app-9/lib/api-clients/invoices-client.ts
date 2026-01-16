/**
 * Invoices API Client
 *
 * Provides typed API access to invoice management
 * Includes Stripe integration for payment processing
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface Invoice {
  id: string
  user_id: string
  client_id: string | null
  project_id: string | null
  invoice_number: string
  title: string
  description: string | null
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date: string | null
  currency: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  total: number
  amount_paid: number
  amount_due: number
  notes: string | null
  terms: string | null
  footer: string | null
  payment_method: 'stripe' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other' | null
  stripe_payment_intent_id: string | null
  stripe_invoice_id: string | null
  pdf_url: string | null
  line_items: InvoiceLineItem[]
  created_at: string
  updated_at: string
  sent_at: string | null
  viewed_at: string | null
}

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  tax_rate?: number
  tax_amount?: number
}

export interface CreateInvoiceData {
  client_id?: string
  project_id?: string
  title: string
  description?: string
  status?: 'draft' | 'sent'
  issue_date: string
  due_date: string
  currency?: string
  tax_rate?: number
  discount_amount?: number
  notes?: string
  terms?: string
  footer?: string
  line_items: Omit<InvoiceLineItem, 'id'>[]
}

export interface UpdateInvoiceData extends Partial<CreateInvoiceData> {
  status?: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
  paid_date?: string
  amount_paid?: number
  payment_method?: 'stripe' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other'
  stripe_payment_intent_id?: string
}

export interface InvoiceFilters {
  status?: ('draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled')[]
  client_id?: string
  project_id?: string
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string // Search by invoice number, title, client name
  payment_method?: ('stripe' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other')[]
}

export interface InvoiceStats {
  total: number
  draft: number
  sent: number
  paid: number
  overdue: number
  cancelled: number
  totalRevenue: number
  paidRevenue: number
  outstandingRevenue: number
  overdueRevenue: number
  averageInvoiceValue: number
  averagePaymentTime: number // days
  paymentRate: number // percentage
  recentInvoices: Array<{
    id: string
    invoice_number: string
    title: string
    total: number
    status: string
    due_date: string
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    invoices: number
  }>
}

class InvoicesApiClient extends BaseApiClient {
  /**
   * Get all invoices with pagination and filters
   */
  async getInvoices(
    page: number = 1,
    pageSize: number = 10,
    filters?: InvoiceFilters
  ) {
    const supabase = createClient()

    let query = supabase
      .from('invoices')
      .select('*, clients(name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status)
      }

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id)
      }

      if (filters.project_id) {
        query = query.eq('project_id', filters.project_id)
      }

      if (filters.start_date) {
        query = query.gte('issue_date', filters.start_date)
      }

      if (filters.end_date) {
        query = query.lte('issue_date', filters.end_date)
      }

      if (filters.min_amount !== undefined) {
        query = query.gte('total', filters.min_amount)
      }

      if (filters.max_amount !== undefined) {
        query = query.lte('total', filters.max_amount)
      }

      if (filters.payment_method && filters.payment_method.length > 0) {
        query = query.in('payment_method', filters.payment_method)
      }

      if (filters.search) {
        query = query.or(
          `invoice_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%`
        )
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: {
        data: data as Invoice[],
        pagination: {
          page,
          pageSize,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      },
      error: null
    }
  }

  /**
   * Get single invoice by ID
   */
  async getInvoice(id: string) {
    const supabase = createClient()

    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(name, email, company), projects(title)')
      .eq('id', id)
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Invoice,
      error: null
    }
  }

  /**
   * Create new invoice
   */
  async createInvoice(invoiceData: CreateInvoiceData) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Calculate totals
    const subtotal = invoiceData.line_items.reduce((sum, item) => sum + item.amount, 0)
    const tax_amount = subtotal * ((invoiceData.tax_rate || 0) / 100)
    const total = subtotal + tax_amount - (invoiceData.discount_amount || 0)

    // Generate invoice number
    const invoice_number = await this.generateInvoiceNumber()

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoiceData,
        user_id: user.id,
        invoice_number,
        status: invoiceData.status || 'draft',
        currency: invoiceData.currency || 'USD',
        subtotal,
        tax_rate: invoiceData.tax_rate || 0,
        tax_amount,
        discount_amount: invoiceData.discount_amount || 0,
        total,
        amount_paid: 0,
        amount_due: total
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Invoice,
      error: null
    }
  }

  /**
   * Update existing invoice
   */
  async updateInvoice(id: string, updates: UpdateInvoiceData) {
    const supabase = createClient()

    // Recalculate totals if line items changed
    let calculatedFields = {}
    if (updates.line_items) {
      const subtotal = updates.line_items.reduce((sum, item) => sum + item.amount, 0)
      const tax_amount = subtotal * ((updates.tax_rate || 0) / 100)
      const total = subtotal + tax_amount - (updates.discount_amount || 0)

      calculatedFields = {
        subtotal,
        tax_amount,
        total,
        amount_due: total - (updates.amount_paid || 0)
      }
    }

    const { data, error } = await supabase
      .from('invoices')
      .update({
        ...updates,
        ...calculatedFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: data as Invoice,
      error: null
    }
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id: string) {
    const supabase = createClient()

    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      data: null,
      error: null
    }
  }

  /**
   * Mark invoice as sent
   */
  async sendInvoice(id: string) {
    return this.updateInvoice(id, {
      status: 'sent',
      sent_at: new Date().toISOString()
    })
  }

  /**
   * Mark invoice as paid
   */
  async markAsPaid(
    id: string,
    payment_method: 'stripe' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other',
    amount_paid: number
  ) {
    const supabase = createClient()

    // Get current invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select('total')
      .eq('id', id)
      .single()

    if (!invoice) {
      return {
        success: false,
        error: 'Invoice not found',
        data: null
      }
    }

    return this.updateInvoice(id, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      payment_method,
      amount_paid,
      amount_due: invoice.total - amount_paid
    })
  }

  /**
   * Generate PDF for invoice
   */
  async generatePDF(id: string) {
    // This would integrate with PDF generation service
    // For now, return a placeholder
    return {
      success: true,
      data: {
        pdf_url: `/api/invoices/${id}/pdf`
      },
      error: null
    }
  }

  /**
   * Get invoice statistics
   */
  async getInvoiceStats() {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Get all invoices for current user
    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Calculate statistics
    const stats: InvoiceStats = {
      total: invoices.length,
      draft: invoices.filter(i => i.status === 'draft').length,
      sent: invoices.filter(i => i.status === 'sent').length,
      paid: invoices.filter(i => i.status === 'paid').length,
      overdue: invoices.filter(i => i.status === 'overdue').length,
      cancelled: invoices.filter(i => i.status === 'cancelled').length,
      totalRevenue: invoices.reduce((sum, i) => sum + (i.total || 0), 0),
      paidRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.amount_paid || 0), 0),
      outstandingRevenue: invoices.filter(i => ['sent', 'viewed', 'overdue'].includes(i.status)).reduce((sum, i) => sum + (i.amount_due || 0), 0),
      overdueRevenue: invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + (i.amount_due || 0), 0),
      averageInvoiceValue: invoices.length > 0
        ? invoices.reduce((sum, i) => sum + (i.total || 0), 0) / invoices.length
        : 0,
      averagePaymentTime: this.calculateAveragePaymentTime(invoices),
      paymentRate: invoices.length > 0
        ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100
        : 0,
      recentInvoices: invoices
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
        .map(i => ({
          id: i.id,
          invoice_number: i.invoice_number,
          title: i.title,
          total: i.total,
          status: i.status,
          due_date: i.due_date
        })),
      revenueByMonth: this.calculateRevenueByMonth(invoices)
    }

    return {
      success: true,
      data: stats,
      error: null
    }
  }

  /**
   * Helper: Generate unique invoice number
   */
  private async generateInvoiceNumber(): Promise<string> {
    const prefix = 'INV'
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}-${timestamp}${random}`
  }

  /**
   * Helper: Calculate average payment time in days
   */
  private calculateAveragePaymentTime(invoices: any[]): number {
    const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paid_date && i.issue_date)
    if (paidInvoices.length === 0) return 0

    const totalDays = paidInvoices.reduce((sum, i) => {
      const issued = new Date(i.issue_date)
      const paid = new Date(i.paid_date)
      const days = Math.floor((paid.getTime() - issued.getTime()) / (1000 * 60 * 60 * 24))
      return sum + days
    }, 0)

    return totalDays / paidInvoices.length
  }

  /**
   * Helper: Calculate revenue by month
   */
  private calculateRevenueByMonth(invoices: any[]): Array<{ month: string; revenue: number; invoices: number }> {
    const monthlyData: Record<string, { revenue: number; invoices: number }> = {}

    invoices.forEach(invoice => {
      const date = new Date(invoice.issue_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, invoices: 0 }
      }

      monthlyData[monthKey].revenue += invoice.total || 0
      monthlyData[monthKey].invoices += 1
    })

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        invoices: data.invoices
      }))
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12) // Last 12 months
  }
}

export const invoicesClient = new InvoicesApiClient()
