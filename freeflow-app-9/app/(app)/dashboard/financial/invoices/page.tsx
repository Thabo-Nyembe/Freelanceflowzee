"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Download,
  CheckCircle,
  FileText,
  Search,
  Printer,
  Mail
} from 'lucide-react'
import {
  MOCK_INVOICES,
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getDaysUntilDue,
  filterInvoicesByStatus,
  type Invoice
} from '@/lib/financial-hub-utils'

const logger = createFeatureLogger('InvoicesPage')

export default function InvoicesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<Invoice['status'] | 'all'>('all')

  useEffect(() => {
    loadInvoices()
  }, [])

  const loadInvoices = async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading invoices')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))

      setInvoices(MOCK_INVOICES)
      setIsLoading(false)

      logger.info('Invoices loaded successfully', {
        count: MOCK_INVOICES.length
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load invoices', { error: err })
    }
  }

  const filteredInvoices = useMemo(() => {
    logger.debug('Filtering invoices', { searchTerm, filterStatus })

    let filtered = invoices.filter(inv =>
      inv.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.number.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (filterStatus !== 'all') {
      filtered = filterInvoicesByStatus(filtered, filterStatus)
    }

    return filtered
  }, [invoices, searchTerm, filterStatus])

  const handleCreateInvoice = async () => {
    logger.info('Create invoice initiated')

    try {
      const response = await fetch('/api/financial/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            client: 'New Client',
            project: 'New Project',
            items: [
              {
                description: 'Professional Services',
                quantity: 1,
                rate: 0,
                amount: 0
              }
            ],
            taxRate: 0,
            currency: 'USD',
            status: 'draft'
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create invoice')

      const result = await response.json()

      toast.success('Invoice created', {
        description: `Invoice ${result.invoiceNumber} • Draft mode`
      })

      logger.info('Invoice created successfully', {
        invoiceNumber: result.invoiceNumber,
        invoiceId: result.invoiceId
      })

      await loadInvoices()
    } catch (error: any) {
      logger.error('Failed to create invoice', { error })
      toast.error('Failed to create invoice', {
        description: error.message
      })
    }
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    logger.info('Send invoice initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    try {
      const response = await fetch('/api/financial/invoices/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          clientEmail: invoice.clientEmail || 'client@example.com'
        })
      })

      if (!response.ok) throw new Error('Failed to send invoice')

      const result = await response.json()

      toast.success('Invoice sent', {
        description: `${invoice.number} sent to ${invoice.client}`
      })

      logger.info('Invoice sent successfully', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        recipient: invoice.client
      })

      await loadInvoices()
    } catch (error: any) {
      logger.error('Failed to send invoice', { error, invoiceId: invoice.id })
      toast.error('Failed to send invoice', {
        description: error.message
      })
    }
  }

  const handleDownloadPDF = async (invoice: Invoice) => {
    logger.info('Download PDF initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    try {
      const response = await fetch('/api/financial/invoices/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id
        })
      })

      if (!response.ok) throw new Error('Failed to generate PDF')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice.number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('PDF downloaded', {
        description: `${invoice.number}.pdf`
      })

      logger.info('PDF downloaded successfully', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number
      })
    } catch (error: any) {
      logger.error('Failed to download PDF', { error, invoiceId: invoice.id })
      toast.error('Failed to download PDF', {
        description: error.message
      })
    }
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    logger.info('Mark as paid initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    if (!confirm(`Mark ${invoice.number} as paid?`)) return

    try {
      const response = await fetch('/api/financial/invoices/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          paidAmount: invoice.amount,
          paidDate: new Date().toISOString().split('T')[0]
        })
      })

      if (!response.ok) throw new Error('Failed to mark as paid')

      toast.success('Invoice marked as paid', {
        description: `${invoice.number} • ${formatCurrency(invoice.amount)}`
      })

      logger.info('Invoice marked as paid', {
        invoiceId: invoice.id,
        amount: invoice.amount
      })

      await loadInvoices()
    } catch (error: any) {
      logger.error('Failed to mark as paid', { error, invoiceId: invoice.id })
      toast.error('Failed to mark as paid', {
        description: error.message
      })
    }
  }

  const handleEditInvoice = async (invoiceId: string) => {
    logger.info('Edit invoice initiated', { invoiceId })
    toast.info('Edit invoice', {
      description: 'Invoice editor coming soon'
    })
  }

  const handleDeleteInvoice = async (invoice: Invoice) => {
    logger.info('Delete invoice initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    if (!confirm(`Delete ${invoice.number}?\n\nThis action cannot be undone.`)) return

    try {
      const response = await fetch('/api/financial/invoices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          invoiceId: invoice.id
        })
      })

      if (!response.ok) throw new Error('Failed to delete invoice')

      toast.success('Invoice deleted', {
        description: invoice.number
      })

      logger.info('Invoice deleted', { invoiceId: invoice.id })

      await loadInvoices()
    } catch (error: any) {
      logger.error('Failed to delete invoice', { error, invoiceId: invoice.id })
      toast.error('Failed to delete invoice', {
        description: error.message
      })
    }
  }

  const handleSendReminder = async (invoice: Invoice) => {
    logger.info('Send payment reminder', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    try {
      const response = await fetch('/api/financial/invoices/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id
        })
      })

      if (!response.ok) throw new Error('Failed to send reminder')

      toast.success('Payment reminder sent', {
        description: `Reminder sent to ${invoice.client}`
      })

      logger.info('Payment reminder sent', {
        invoiceId: invoice.id,
        client: invoice.client
      })
    } catch (error: any) {
      logger.error('Failed to send reminder', { error, invoiceId: invoice.id })
      toast.error('Failed to send reminder', {
        description: error.message
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={6} />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: loadInvoices
        }}
      />
    )
  }

  if (invoices.length === 0) {
    return (
      <NoDataEmptyState
        entityName="invoices"
        description="Create your first invoice to start billing clients"
        action={{
          label: 'Create Invoice',
          onClick: handleCreateInvoice
        }}
      />
    )
  }

  const statusCounts = {
    paid: invoices.filter(i => i.status === 'paid').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    draft: invoices.filter(i => i.status === 'draft').length
  }

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = filteredInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const totalOutstanding = totalAmount - totalPaid

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalAmount)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{filteredInvoices.length} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalPaid)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{statusCounts.paid} invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(totalOutstanding)}
            </div>
            <p className="text-sm text-gray-500 mt-1">{statusCounts.sent} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {statusCounts.overdue}
            </div>
            <p className="text-sm text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search invoices, clients, projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                Showing {filteredInvoices.length} invoices
              </CardDescription>
            </div>
            <Button size="sm" onClick={handleCreateInvoice}>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredInvoices.length === 0 ? (
              <NoDataEmptyState
                entityName="invoices"
                description="No invoices match your search criteria"
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('')
                    setFilterStatus('all')
                  }
                }}
              />
            ) : (
              filteredInvoices.map((invoice, index) => {
                const daysUntilDue = getDaysUntilDue(invoice.dueDate)
                const isOverdue = invoice.status !== 'paid' && daysUntilDue < 0

                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold">{invoice.number}</p>
                            <Badge className={getInvoiceStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                            {isOverdue && (
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                {Math.abs(daysUntilDue)} days overdue
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">{invoice.client}</p>
                          <p className="text-sm text-gray-500">{invoice.project}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-gray-500">
                              Issued: {formatDate(invoice.issueDate)}
                            </span>
                            <span className="text-sm text-gray-500">
                              Due: {formatDate(invoice.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(invoice.amount)}
                          </p>
                          {invoice.status === 'paid' && invoice.paidDate && (
                            <p className="text-sm text-green-600">Paid {formatDate(invoice.paidDate)}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {invoice.status !== 'paid' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendInvoice(invoice)}
                                title="Send invoice"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsPaid(invoice)}
                                title="Mark as paid"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              {invoice.status === 'overdue' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendReminder(invoice)}
                                  title="Send reminder"
                                >
                                  <Mail className="h-4 w-4 text-orange-600" />
                                </Button>
                              )}
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPDF(invoice)}
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice.id)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
