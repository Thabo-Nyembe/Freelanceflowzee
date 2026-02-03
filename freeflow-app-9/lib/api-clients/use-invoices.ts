/**
 * React hooks for Invoices API
 *
 * Uses TanStack Query for caching, loading states, and error handling
 * Replaces useEffect + setTimeout patterns
 *
 * Caching Strategy:
 * - Invoices list: 5 min staleTime (user data)
 * - Single invoice: 5 min staleTime (user data)
 * - Invoice stats: 2 min staleTime (analytics)
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import { invoicesClient, type CreateInvoiceData, type UpdateInvoiceData, type InvoiceFilters, type Invoice } from './invoices-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'
import { isDemoMode } from './base-client'

// Demo invoices data for showcase
function getDemoInvoices() {
  const now = new Date()
  const invoices: Invoice[] = [
      {
        id: 'demo-inv-1',
        user_id: 'demo',
        client_id: 'client-1',
        project_id: null,
        invoice_number: 'INV-2024-001',
        title: 'Website Redesign - Phase 1',
        description: 'Initial design and development',
        status: 'paid',
        issue_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paid_date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        currency: 'USD',
        subtotal: 5000,
        tax_rate: 10,
        tax_amount: 500,
        discount_amount: 0,
        total: 5500,
        amount_paid: 5500,
        amount_due: 0,
        notes: null,
        terms: null,
        footer: null,
        payment_method: 'stripe',
        stripe_payment_intent_id: null,
        stripe_invoice_id: null,
        pdf_url: null,
        line_items: [],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sent_at: null,
        viewed_at: null
      },
      {
        id: 'demo-inv-2',
        user_id: 'demo',
        client_id: 'client-2',
        project_id: null,
        invoice_number: 'INV-2024-002',
        title: 'Mobile App Development',
        description: 'iOS and Android app',
        status: 'sent',
        issue_date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString(),
        paid_date: null,
        currency: 'USD',
        subtotal: 12000,
        tax_rate: 10,
        tax_amount: 1200,
        discount_amount: 500,
        total: 12700,
        amount_paid: 0,
        amount_due: 12700,
        notes: null,
        terms: null,
        footer: null,
        payment_method: null,
        stripe_payment_intent_id: null,
        stripe_invoice_id: null,
        pdf_url: null,
        line_items: [],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sent_at: null,
        viewed_at: null
      },
      {
        id: 'demo-inv-3',
        user_id: 'demo',
        client_id: 'client-1',
        project_id: null,
        invoice_number: 'INV-2024-003',
        title: 'SEO Optimization Package',
        description: 'Monthly SEO services',
        status: 'overdue',
        issue_date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        due_date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paid_date: null,
        currency: 'USD',
        subtotal: 2500,
        tax_rate: 10,
        tax_amount: 250,
        discount_amount: 0,
        total: 2750,
        amount_paid: 0,
        amount_due: 2750,
        notes: null,
        terms: null,
        footer: null,
        payment_method: null,
        stripe_payment_intent_id: null,
        stripe_invoice_id: null,
        pdf_url: null,
        line_items: [],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        sent_at: null,
        viewed_at: null
      }
    ]

  return {
    data: invoices,
    pagination: {
      page: 1,
      pageSize: 10,
      total: invoices.length,
      totalPages: 1
    }
  }
}

/**
 * Get all invoices with pagination and filters
 */
export function useInvoices(
  page: number = 1,
  pageSize: number = 10,
  filters?: InvoiceFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  const isDemo = isDemoMode()
  const emptyData = { data: [], pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 } }

  return useQuery({
    queryKey: ['invoices', page, pageSize, filters],
    queryFn: async () => {
      // Demo mode: return demo invoices
      if (isDemo) {
        return getDemoInvoices()
      }

      // Regular users: fetch from API
      try {
        const response = await invoicesClient.getInvoices(page, pageSize, filters)

        if (!response.success || !response.data) {
          // Return empty data for regular users (not demo data)
          return emptyData
        }

        return response.data
      } catch {
        // Return empty data on exception
        return emptyData
      }
    },
    // Only use demo placeholder for demo mode
    placeholderData: isDemo ? getDemoInvoices() : emptyData,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions,
    ...options
  })
}

/**
 * Get single invoice by ID
 */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const response = await invoicesClient.getInvoice(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch invoice')
      }

      return response.data
    },
    enabled: !!id,
    staleTime: STALE_TIMES.USER_DATA,
    ...userDataQueryOptions
  })
}

/**
 * Create new invoice
 */
export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await invoicesClient.createInvoice(data)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to create invoice')
      }

      return response.data
    },
    onSuccess: (invoice) => {
      // Use centralized invalidation pattern
      invalidationPatterns.invoices(queryClient)

      // Optimistically update cache
      queryClient.setQueryData(['invoice', invoice.id], invoice)

      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Update existing invoice
 */
export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: UpdateInvoiceData }) => {
      const response = await invoicesClient.updateInvoice(id, updates)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to update invoice')
      }

      return response.data
    },
    onSuccess: (invoice) => {
      // Use centralized invalidation pattern
      invalidationPatterns.invoices(queryClient)
      queryClient.setQueryData(['invoice', invoice.id], invoice)

      toast.success('Invoice updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Delete invoice
 */
export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await invoicesClient.deleteInvoice(id)

      if (!response.success) {
        throw new Error(response.error || 'Failed to delete invoice')
      }

      return id
    },
    onSuccess: (deletedId) => {
      // Use centralized invalidation pattern
      invalidationPatterns.invoices(queryClient)
      // Remove the specific invoice from cache
      queryClient.removeQueries({ queryKey: ['invoice', deletedId] })
      toast.success('Invoice deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Send invoice to client
 */
export function useSendInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await invoicesClient.sendInvoice(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to send invoice')
      }

      return response.data
    },
    onSuccess: (invoice) => {
      // Use centralized invalidation pattern
      invalidationPatterns.invoices(queryClient)
      queryClient.setQueryData(['invoice', invoice.id], invoice)

      toast.success('Invoice sent successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Mark invoice as paid
 */
export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payment_method,
      amount_paid
    }: {
      id: string
      payment_method: 'stripe' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other'
      amount_paid: number
    }) => {
      const response = await invoicesClient.markAsPaid(id, payment_method, amount_paid)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to mark invoice as paid')
      }

      return response.data
    },
    onSuccess: (invoice) => {
      // Use centralized invalidation pattern (also invalidates client stats and revenue)
      invalidationPatterns.invoices(queryClient)
      queryClient.setQueryData(['invoice', invoice.id], invoice)

      toast.success('Invoice marked as paid')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Generate PDF for invoice
 */
export function useGenerateInvoicePDF() {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await invoicesClient.generatePDF(id)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to generate PDF')
      }

      return response.data
    },
    onSuccess: (data) => {
      toast.success('PDF generated successfully')
      // Open PDF in new tab
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })
}

/**
 * Get invoice statistics
 */
export function useInvoiceStats() {
  const isDemo = isDemoMode()
  const demoStats = {
    total_invoices: 24,
    total_revenue: 156750,
    outstanding_amount: 23450,
    overdue_amount: 5200,
    paid_this_month: 45600,
    average_invoice_value: 6531,
    payment_rate: 89,
    status_breakdown: { draft: 3, sent: 8, paid: 10, overdue: 3 },
    monthly_revenue: [
      { month: 'Jan', revenue: 12500, invoices: 4 },
      { month: 'Feb', revenue: 18200, invoices: 5 },
      { month: 'Mar', revenue: 15800, invoices: 4 }
    ]
  }
  const emptyStats = {
    total_invoices: 0,
    total_revenue: 0,
    outstanding_amount: 0,
    overdue_amount: 0,
    paid_this_month: 0,
    average_invoice_value: 0,
    payment_rate: 0,
    status_breakdown: { draft: 0, sent: 0, paid: 0, overdue: 0 },
    monthly_revenue: []
  }

  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      // Demo mode: return demo stats
      if (isDemo) {
        return demoStats
      }

      // Regular users: fetch from API
      try {
        const response = await invoicesClient.getInvoiceStats()

        if (!response.success || !response.data) {
          return emptyStats
        }

        return response.data
      } catch {
        return emptyStats
      }
    },
    placeholderData: isDemo ? demoStats : emptyStats,
    staleTime: STALE_TIMES.ANALYTICS,
    ...analyticsQueryOptions,
    refetchInterval: 60000 // Refetch every minute
  })
}

/**
 * Example component showing how to use these hooks:
 *
 * ```tsx
 * function InvoicesList() {
 *   const { data, isLoading, error } = useInvoices(1, 10, { status: ['sent', 'overdue'] })
 *   const createInvoice = useCreateInvoice()
 *   const updateInvoice = useUpdateInvoice()
 *   const sendInvoice = useSendInvoice()
 *   const markAsPaid = useMarkInvoiceAsPaid()
 *   const generatePDF = useGenerateInvoicePDF()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {data.data.map(invoice => (
 *         <InvoiceCard
 *           key={invoice.id}
 *           invoice={invoice}
 *           onSend={() => sendInvoice.mutate(invoice.id)}
 *           onMarkPaid={() => markAsPaid.mutate({
 *             id: invoice.id,
 *             payment_method: 'stripe',
 *             amount_paid: invoice.total
 *           })}
 *           onGeneratePDF={() => generatePDF.mutate(invoice.id)}
 *         />
 *       ))}
 *
 *       <Button onClick={() => createInvoice.mutate({
 *         title: 'New Invoice',
 *         issue_date: new Date().toISOString(),
 *         due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
 *         line_items: []
 *       })}>
 *         Create Invoice
 *       </Button>
 *     </div>
 *   )
 * }
 * ```
 */
