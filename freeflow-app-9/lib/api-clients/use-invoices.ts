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
import { invoicesClient, type Invoice, type CreateInvoiceData, type UpdateInvoiceData, type InvoiceFilters } from './invoices-client'
import { toast } from 'sonner'
import { STALE_TIMES, userDataQueryOptions, analyticsQueryOptions, invalidationPatterns } from '@/lib/query-client'

/**
 * Get all invoices with pagination and filters
 */
export function useInvoices(
  page: number = 1,
  pageSize: number = 10,
  filters?: InvoiceFilters,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['invoices', page, pageSize, filters],
    queryFn: async () => {
      const response = await invoicesClient.getInvoices(page, pageSize, filters)

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch invoices')
      }

      return response.data
    },
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
  return useQuery({
    queryKey: ['invoice-stats'],
    queryFn: async () => {
      const response = await invoicesClient.getInvoiceStats()

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch invoice stats')
      }

      return response.data
    },
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
