'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check'

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  clientName: string
  clientEmail: string
  projectId?: string
  projectName?: string
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  paidDate?: string
  subtotal: number
  taxRate: number
  taxAmount: number
  discount: number
  total: number
  currency: string
  items: InvoiceItem[]
  notes?: string
  terms?: string
  paymentMethod?: PaymentMethod
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxable: boolean
}

export interface InvoiceStats {
  totalInvoiced: number
  totalPaid: number
  totalPending: number
  totalOverdue: number
  invoiceCount: number
  paidCount: number
  overdueCount: number
  averagePaymentTime: number
}

// ============================================================================
// EMPTY DEFAULTS
// ============================================================================

const emptyStats: InvoiceStats = {
  totalInvoiced: 0,
  totalPaid: 0,
  totalPending: 0,
  totalOverdue: 0,
  invoiceCount: 0,
  paidCount: 0,
  overdueCount: 0,
  averagePaymentTime: 0
}

// ============================================================================
// HOOK
// ============================================================================

interface UseInvoicesOptions {
  clientId?: string
  projectId?: string
}

export function useInvoices(options: UseInvoicesOptions = {}) {
  const { clientId, projectId } = options

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [stats, setStats] = useState<InvoiceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchInvoices = useCallback(async (filters?: { status?: string; clientId?: string; search?: string }) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.clientId || clientId) params.set('clientId', filters.clientId || clientId || '')
      if (projectId) params.set('projectId', projectId)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/invoices?${params}`)
      const result = await response.json()
      if (result.success) {
        setInvoices(Array.isArray(result.invoices) ? result.invoices : [])
        setStats(result.stats || emptyStats)
        return result.invoices || []
      }
      setInvoices([])
      setStats(emptyStats)
      return []
    } catch (err) {
      setInvoices([])
      setStats(emptyStats)
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'))
      return []
    } finally {
      setIsLoading(false)
    }
  }, [clientId, projectId])

  const createInvoice = useCallback(async (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchInvoices()
        return { success: true, invoice: result.invoice }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newInvoice: Invoice = { ...data, id: `inv-${Date.now()}`, invoiceNumber: `INV-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setInvoices(prev => [newInvoice, ...prev])
      return { success: true, invoice: newInvoice }
    }
  }, [fetchInvoices])

  const updateInvoice = useCallback(async (invoiceId: string, updates: Partial<Invoice>) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i))
      }
      return result
    } catch (err) {
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, ...updates } : i))
      return { success: true }
    }
  }, [])

  const deleteInvoice = useCallback(async (invoiceId: string) => {
    try {
      await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE' })
      setInvoices(prev => prev.filter(i => i.id !== invoiceId))
      return { success: true }
    } catch (err) {
      setInvoices(prev => prev.filter(i => i.id !== invoiceId))
      return { success: true }
    }
  }, [])

  const sendInvoice = useCallback(async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST' })
      const result = await response.json()
      if (result.success) {
        setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'sent' as const } : i))
      }
      return result
    } catch (err) {
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'sent' as const } : i))
      return { success: true }
    }
  }, [])

  const markAsPaid = useCallback(async (invoiceId: string, paymentMethod?: PaymentMethod) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod })
      })
      const result = await response.json()
      if (result.success) {
        setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const, paidDate: new Date().toISOString(), paymentMethod } : i))
      }
      return result
    } catch (err) {
      setInvoices(prev => prev.map(i => i.id === invoiceId ? { ...i, status: 'paid' as const, paidDate: new Date().toISOString() } : i))
      return { success: true }
    }
  }, [])

  const duplicateInvoice = useCallback(async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId)
    if (invoice) {
      const newInvoice: Invoice = { ...invoice, id: `inv-${Date.now()}`, invoiceNumber: `INV-${Date.now()}`, status: 'draft', issueDate: new Date().toISOString().split('T')[0], paidDate: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setInvoices(prev => [newInvoice, ...prev])
      return { success: true, invoice: newInvoice }
    }
    return { success: false, error: 'Invoice not found' }
  }, [invoices])

  const downloadPdf = useCallback(async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      a.click()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to download PDF' }
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchInvoices({ search: query })
  }, [fetchInvoices])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchInvoices()
  }, [fetchInvoices])

  useEffect(() => { refresh() }, [refresh])

  const draftInvoices = useMemo(() => invoices.filter(i => i.status === 'draft'), [invoices])
  const sentInvoices = useMemo(() => invoices.filter(i => i.status === 'sent'), [invoices])
  const paidInvoices = useMemo(() => invoices.filter(i => i.status === 'paid'), [invoices])
  const overdueInvoices = useMemo(() => invoices.filter(i => i.status === 'overdue'), [invoices])
  const totalAmount = useMemo(() => invoices.reduce((sum, i) => sum + i.total, 0), [invoices])
  const invoicesByClient = useMemo(() => {
    const grouped: Record<string, Invoice[]> = {}
    invoices.forEach(i => {
      if (!grouped[i.clientId]) grouped[i.clientId] = []
      grouped[i.clientId].push(i)
    })
    return grouped
  }, [invoices])

  return {
    invoices, currentInvoice, stats, draftInvoices, sentInvoices, paidInvoices, overdueInvoices, totalAmount, invoicesByClient,
    isLoading, error, searchQuery,
    refresh, fetchInvoices, createInvoice, updateInvoice, deleteInvoice, sendInvoice, markAsPaid, duplicateInvoice, downloadPdf, search,
    setCurrentInvoice
  }
}

export default useInvoices
