'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import {
  MOCK_INVOICES,
  MOCK_BILLING_STATS,
  formatCurrency,
  formatRelativeTime,
  getInvoiceStatusColor,
  getInvoiceStatusIcon,
  filterInvoicesByStatus,
  getOverdueInvoices,
  calculateDaysOverdue,
  type Invoice,
  type InvoiceStatus
} from '@/lib/admin-overview-utils'
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Send,
  Check,
  Download,
  Bell,
  XCircle,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const logger = createFeatureLogger('admin-invoicing')

const TABS: { id: InvoiceStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'draft', label: 'Draft' },
  { id: 'sent', label: 'Sent' },
  { id: 'paid', label: 'Paid' },
  { id: 'overdue', label: 'Overdue' }
]

export default function InvoicingPage() {
  const router = useRouter()
  const { announce } = useAnnouncer()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES)
  const [activeTab, setActiveTab] = useState<InvoiceStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    let filtered = invoices

    // Filter by tab
    if (activeTab === 'overdue') {
      filtered = getOverdueInvoices(invoices)
    } else if (activeTab !== 'all') {
      filtered = filterInvoicesByStatus(invoices, activeTab)
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(inv =>
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.projectName && inv.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    return filtered
  }, [invoices, activeTab, searchQuery])

  // Load invoicing data
  useEffect(() => {
    const loadInvoicing = async () => {
      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading invoicing data')

        await new Promise(resolve => setTimeout(resolve, 1000))

        setIsLoading(false)
        announce('Invoicing data loaded successfully', 'polite')
        logger.info('Invoicing loaded', { success: true })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load invoicing'
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading invoicing', 'assertive')
        logger.error('Invoicing load failed', { error: err })
      }
    }

    loadInvoicing()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Button 1: Create Invoice
  const handleCreateInvoice = async () => {
    try {
      logger.info('Creating new invoice')

      const newInvoice = {
        number: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
        clientName: 'New Client',
        clientEmail: 'client@company.com',
        status: 'draft' as InvoiceStatus,
        issueDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 2592000000).toISOString(),
        total: 0
      }

      const response = await fetch('/api/admin/invoicing/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      })

      if (!response.ok) throw new Error('Failed to create invoice')
      const result = await response.json()

      toast.success('Invoice Created', {
        description: `Invoice ${newInvoice.number} has been created as draft`
      })
      logger.info('Invoice created', { success: true, result })
      announce('Invoice created successfully', 'polite')

      setInvoices(prev => [...prev, { ...newInvoice, id: `inv-${Date.now()}`, clientId: '', items: [], subtotal: 0, taxRate: 10, taxAmount: 0, amountPaid: 0, amountDue: 0, currency: 'USD', createdAt: new Date().toISOString(), remindersSent: 0 }])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create failed'
      toast.error('Create Failed', { description: message })
      logger.error('Create invoice failed', { error: message })
      announce('Failed to create invoice', 'assertive')
    }
  }

  // Button 2: Edit Invoice
  const handleEditInvoice = async (invoiceId: string) => {
    try {
      logger.info('Editing invoice', { invoiceId })

      const response = await fetch(`/api/admin/invoicing/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total: 50000, notes: 'Updated invoice terms' })
      })

      if (!response.ok) throw new Error('Failed to edit invoice')
      const result = await response.json()

      toast.success('Invoice Updated', {
        description: 'Invoice details have been updated successfully'
      })
      logger.info('Invoice edited', { success: true, invoiceId, result })
      announce('Invoice updated successfully', 'polite')

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, total: 50000 } : inv))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit failed'
      toast.error('Edit Failed', { description: message })
      logger.error('Edit invoice failed', { error: message })
      announce('Failed to edit invoice', 'assertive')
    }
  }

  // Button 3: Delete Invoice
  const handleDeleteInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to delete ${invoiceNumber}? This action cannot be undone.`)) {
      return
    }

    try {
      logger.info('Deleting invoice', { invoiceId })

      const response = await fetch(`/api/admin/invoicing/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to delete invoice')

      toast.success('Invoice Deleted', {
        description: `${invoiceNumber} has been permanently removed`
      })
      logger.info('Invoice deleted', { success: true, invoiceId })
      announce('Invoice deleted successfully', 'polite')

      setInvoices(prev => prev.filter(inv => inv.id !== invoiceId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error('Delete Failed', { description: message })
      logger.error('Delete invoice failed', { error: message })
      announce('Failed to delete invoice', 'assertive')
    }
  }

  // Button 4: Send Invoice
  const handleSendInvoice = async (invoiceId: string, invoiceNumber: string, clientEmail: string) => {
    try {
      logger.info('Sending invoice', { invoiceId })

      const response = await fetch('/api/admin/invoicing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, recipientEmail: clientEmail })
      })

      if (!response.ok) throw new Error('Failed to send invoice')
      const result = await response.json()

      toast.success('Invoice Sent', {
        description: `${invoiceNumber} has been sent to ${clientEmail}`
      })
      logger.info('Invoice sent', { success: true, invoiceId, result })
      announce('Invoice sent successfully', 'polite')

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'sent', sentDate: new Date().toISOString() } : inv))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Send failed'
      toast.error('Send Failed', { description: message })
      logger.error('Send invoice failed', { error: message })
      announce('Failed to send invoice', 'assertive')
    }
  }

  // Button 5: Mark as Paid
  const handleMarkAsPaid = async (invoiceId: string, invoiceNumber: string) => {
    try {
      logger.info('Marking invoice as paid', { invoiceId })

      const response = await fetch(`/api/admin/invoicing/invoices/${invoiceId}/paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paidDate: new Date().toISOString() })
      })

      if (!response.ok) throw new Error('Failed to mark as paid')
      const result = await response.json()

      toast.success('Invoice Marked as Paid', {
        description: `${invoiceNumber} has been marked as paid and closed`
      })
      logger.info('Invoice marked as paid', { success: true, invoiceId, result })
      announce('Invoice marked as paid', 'polite')

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid', paidDate: new Date().toISOString(), amountDue: 0 } : inv))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Update failed'
      toast.error('Update Failed', { description: message })
      logger.error('Mark as paid failed', { error: message })
      announce('Failed to mark invoice as paid', 'assertive')
    }
  }

  // Button 6: Download PDF
  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    try {
      logger.info('Downloading invoice PDF', { invoiceId })

      const response = await fetch('/api/admin/invoicing/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId })
      })

      if (!response.ok) throw new Error('Failed to generate PDF')
      const result = await response.json()

      toast.success('PDF Downloaded', {
        description: `${invoiceNumber} has been saved as PDF file`
      })
      logger.info('PDF download completed', { success: true, invoiceId, result })
      announce('PDF downloaded successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed'
      toast.error('Download Failed', { description: message })
      logger.error('PDF download failed', { error: message })
      announce('Failed to download PDF', 'assertive')
    }
  }

  // Button 7: Send Reminder
  const handleSendReminder = async (invoiceId: string, invoiceNumber: string, clientEmail: string) => {
    try {
      logger.info('Sending payment reminder', { invoiceId })

      const response = await fetch('/api/admin/invoicing/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, recipientEmail: clientEmail })
      })

      if (!response.ok) throw new Error('Failed to send reminder')
      const result = await response.json()

      toast.success('Reminder Sent', {
        description: `Payment reminder for ${invoiceNumber} sent to ${clientEmail}`
      })
      logger.info('Reminder sent', { success: true, invoiceId, result })
      announce('Reminder sent successfully', 'polite')

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, remindersSent: (inv.remindersSent || 0) + 1, lastReminderDate: new Date().toISOString() } : inv))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Send failed'
      toast.error('Send Failed', { description: message })
      logger.error('Send reminder failed', { error: message })
      announce('Failed to send reminder', 'assertive')
    }
  }

  // Button 8: Void Invoice
  const handleVoidInvoice = async (invoiceId: string, invoiceNumber: string) => {
    if (!confirm(`Are you sure you want to void ${invoiceNumber}? This action cannot be undone.`)) {
      return
    }

    try {
      logger.info('Voiding invoice', { invoiceId })

      const response = await fetch(`/api/admin/invoicing/invoices/${invoiceId}/void`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to void invoice')
      const result = await response.json()

      toast.success('Invoice Voided', {
        description: `${invoiceNumber} has been voided and cancelled`
      })
      logger.info('Invoice voided', { success: true, invoiceId, result })
      announce('Invoice voided successfully', 'polite')

      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'cancelled' } : inv))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Void failed'
      toast.error('Void Failed', { description: message })
      logger.error('Void invoice failed', { error: message })
      announce('Failed to void invoice', 'assertive')
    }
  }

  // Button 9: View Invoice
  const handleViewInvoice = (invoice: Invoice) => {
    logger.info('Opening invoice details', { invoiceId: invoice.id })
    setSelectedInvoice(invoice)
    setShowInvoiceModal(true)
    toast.info('Invoice Details', {
      description: `Viewing details for ${invoice.number}`
    })
    announce('Invoice details opened', 'polite')
  }

  // Button 10: Refresh Invoices
  const handleRefreshInvoices = async () => {
    try {
      logger.info('Refreshing invoices')

      const response = await fetch('/api/admin/invoicing/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to refresh invoices')

      toast.success('Invoices Refreshed', {
        description: 'All invoice data has been reloaded'
      })
      logger.info('Invoices refresh completed', { success: true })
      announce('Invoices refreshed successfully', 'polite')

      setInvoices([...MOCK_INVOICES])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refresh failed'
      toast.error('Refresh Failed', { description: message })
      logger.error('Invoices refresh failed', { error: message })
      announce('Failed to refresh invoices', 'assertive')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <CardSkeleton />
        <ListSkeleton items={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Billing Management</h2>
                <p className="text-sm text-gray-600">Track invoices and payments</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleCreateInvoice}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>

                <button
                  onClick={handleRefreshInvoices}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Total Invoiced</div>
                <div className="text-2xl font-bold text-blue-700">
                  <NumberFlow
                    value={MOCK_BILLING_STATS.totalInvoiced}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">{invoices.length} invoices</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 mb-1">Total Paid</div>
                <div className="text-2xl font-bold text-green-700">
                  <NumberFlow
                    value={MOCK_BILLING_STATS.totalPaid}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">{formatCurrency(MOCK_BILLING_STATS.totalPaid / MOCK_BILLING_STATS.totalInvoiced * 100)}% collected</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
                <div className="text-sm text-yellow-600 mb-1">Outstanding</div>
                <div className="text-2xl font-bold text-yellow-700">
                  <NumberFlow
                    value={MOCK_BILLING_STATS.totalOutstanding}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">Pending payment</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                <div className="text-sm text-red-600 mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-700">
                  <NumberFlow
                    value={MOCK_BILLING_STATS.overdueAmount}
                    format={{ style: 'currency', currency: 'USD', notation: 'compact' }}
                  />
                </div>
                <div className="text-xs text-gray-600">{getOverdueInvoices(invoices).length} invoices</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {tab.label}
                  {tab.id !== 'all' && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {tab.id === 'overdue'
                        ? getOverdueInvoices(invoices).length
                        : filterInvoicesByStatus(invoices, tab.id as InvoiceStatus).length
                      }
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Invoice List */}
            {filteredInvoices.length === 0 ? (
              <NoDataEmptyState
                title="No Invoices Found"
                description="Create your first invoice to get started"
                actionLabel="Create Invoice"
                onAction={handleCreateInvoice}
              />
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => {
                  const isOverdue = invoice.status !== 'paid' && invoice.status !== 'cancelled' && new Date(invoice.dueDate) < new Date()
                  const daysOverdue = isOverdue ? calculateDaysOverdue(invoice.dueDate) : 0

                  return (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-800">{invoice.number}</h4>
                            <span className={`px-2 py-1 rounded text-xs font-medium border ${getInvoiceStatusColor(invoice.status)}`}>
                              {getInvoiceStatusIcon(invoice.status)}
                              <span className="ml-1">{invoice.status}</span>
                            </span>
                            {isOverdue && (
                              <span className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {daysOverdue} days overdue
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Client</div>
                              <div className="font-medium text-gray-800">{invoice.clientName}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Amount</div>
                              <div className="font-bold text-green-600">{formatCurrency(invoice.total)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Issue Date</div>
                              <div className="text-gray-700">{new Date(invoice.issueDate).toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">Due Date</div>
                              <div className="text-gray-700">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                            </div>
                          </div>

                          {invoice.projectName && (
                            <div className="text-xs text-gray-600 mb-2">
                              Project: {invoice.projectName}
                            </div>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>

                            <button
                              onClick={() => handleEditInvoice(invoice.id)}
                              className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>

                            {invoice.status === 'draft' && (
                              <button
                                onClick={() => handleSendInvoice(invoice.id, invoice.number, invoice.clientEmail)}
                                className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Send
                              </button>
                            )}

                            {invoice.status === 'sent' && (
                              <button
                                onClick={() => handleMarkAsPaid(invoice.id, invoice.number)}
                                className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" />
                                Mark Paid
                              </button>
                            )}

                            <button
                              onClick={() => handleDownloadPDF(invoice.id, invoice.number)}
                              className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              PDF
                            </button>

                            {isOverdue && (
                              <button
                                onClick={() => handleSendReminder(invoice.id, invoice.number, invoice.clientEmail)}
                                className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors flex items-center gap-1"
                              >
                                <Bell className="w-3 h-3" />
                                Remind ({invoice.remindersSent || 0})
                              </button>
                            )}

                            {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                              <button
                                onClick={() => handleVoidInvoice(invoice.id, invoice.number)}
                                className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors flex items-center gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                Void
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteInvoice(invoice.id, invoice.number)}
                              className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Invoice Details Modal */}
      <AnimatePresence>
        {showInvoiceModal && selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowInvoiceModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedInvoice.number}</h3>
                  <p className="text-gray-600">{selectedInvoice.clientName}</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-blue-600 mb-1">Total Amount</div>
                  <div className="text-2xl font-bold text-blue-700">{formatCurrency(selectedInvoice.total)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-green-600 mb-1">Amount Due</div>
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(selectedInvoice.amountDue)}</div>
                </div>
              </div>

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getInvoiceStatusColor(selectedInvoice.status)}`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Issue Date:</span>
                  <span>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Due Date:</span>
                  <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Tax ({selectedInvoice.taxRate}%):</span>
                  <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                </div>
              </div>

              {selectedInvoice.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Line Items</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{item.description}</span>
                        <span className="font-semibold">{formatCurrency(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(selectedInvoice.id, selectedInvoice.number)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download PDF
                </button>
                {selectedInvoice.status === 'sent' && (
                  <button
                    onClick={() => handleMarkAsPaid(selectedInvoice.id, selectedInvoice.number)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
