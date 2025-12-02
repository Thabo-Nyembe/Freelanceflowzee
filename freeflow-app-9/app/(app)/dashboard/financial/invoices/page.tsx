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
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
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
  Mail,
  Loader2
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  getInvoiceStatusColor,
  getDaysUntilDue,
  filterInvoicesByStatus,
  type Invoice
} from '@/lib/financial-hub-utils'

const logger = createFeatureLogger('InvoicesPage')

// Map database invoice to UI invoice type
function mapDbInvoiceToUi(dbInvoice: any): Invoice {
  return {
    id: dbInvoice.id,
    number: dbInvoice.invoice_number || `INV-${dbInvoice.id.slice(0, 8)}`,
    client: dbInvoice.client_name,
    clientEmail: dbInvoice.client_email,
    project: dbInvoice.description || 'N/A',
    amount: dbInvoice.amount,
    currency: dbInvoice.currency || 'USD',
    status: dbInvoice.status,
    issueDate: dbInvoice.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    dueDate: dbInvoice.due_date,
    paidDate: dbInvoice.paid_date,
    items: dbInvoice.line_items || [],
    taxRate: dbInvoice.tax_rate || 0,
    discount: dbInvoice.discount || 0,
    notes: dbInvoice.notes
  }
}

interface InvoiceFormData {
  client_name: string
  client_email: string
  description: string
  amount: number
  currency: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  tax_rate: number
  discount: number
  notes?: string
}

export default function InvoicesPage() {
  // Authentication
  const { userId, loading: userLoading } = useCurrentUser()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<Invoice['status'] | 'all'>('all')

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>({
    client_name: '',
    client_email: '',
    description: '',
    amount: 0,
    currency: 'USD',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'draft',
    tax_rate: 0,
    discount: 0,
  })

  useEffect(() => {
    if (userId) {
      loadInvoices()
    }
  }, [userId])

  const loadInvoices = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading invoices from database', { userId })

      // Import and call real database query
      const { getInvoices } = await import('@/lib/financial-queries')

      // Build filters based on current UI state
      const filters: any = {}
      if (filterStatus !== 'all') {
        filters.status = filterStatus
      }

      const { data, error: dbError } = await getInvoices(userId, filters)

      if (dbError) {
        throw new Error(dbError.message || 'Failed to load invoices')
      }

      // Map database invoices to UI format
      const mappedInvoices = (data || []).map(mapDbInvoiceToUi)
      setInvoices(mappedInvoices)
      setIsLoading(false)

      logger.info('Invoices loaded successfully', {
        count: mappedInvoices.length,
        userId
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load invoices'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load invoices', { error: err, userId })
      toast.error('Failed to load invoices', {
        description: errorMessage
      })
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

  const openAddDialog = () => {
    setEditingInvoice(null)
    setFormData({
      client_name: '',
      client_email: '',
      description: '',
      amount: 0,
      currency: 'USD',
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      tax_rate: 0,
      discount: 0,
    })
    setIsDialogOpen(true)
    logger.info('Add invoice dialog opened')
  }

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      client_name: invoice.client,
      client_email: invoice.clientEmail || '',
      description: invoice.project,
      amount: invoice.amount,
      currency: invoice.currency || 'USD',
      due_date: invoice.dueDate,
      status: invoice.status,
      tax_rate: invoice.taxRate || 0,
      discount: invoice.discount || 0,
      notes: invoice.notes,
    })
    setIsDialogOpen(true)
    logger.info('Edit invoice dialog opened', { invoiceId: invoice.id })
  }

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      setIsSubmitting(true)

      if (editingInvoice) {
        // Update existing invoice
        logger.info('Updating invoice', { invoiceId: editingInvoice.id })

        const { updateInvoice } = await import('@/lib/financial-queries')
        const { data, error } = await updateInvoice(
          editingInvoice.id,
          userId,
          {
            client_name: formData.client_name,
            client_email: formData.client_email,
            description: formData.description,
            amount: formData.amount,
            due_date: formData.due_date,
            status: formData.status,
            tax_rate: formData.tax_rate,
            discount: formData.discount,
          }
        )

        if (error) throw new Error(error.message)

        // Optimistically update UI
        setInvoices(prev =>
          prev.map(inv => (inv.id === editingInvoice.id ? mapDbInvoiceToUi(data!) : inv))
        )

        toast.success('Invoice updated', {
          description: 'Changes saved successfully'
        })

        logger.info('Invoice updated successfully', { invoiceId: editingInvoice.id })
      } else {
        // Create new invoice
        logger.info('Creating new invoice')

        const { createInvoice } = await import('@/lib/financial-queries')
        const { data, error } = await createInvoice(userId, {
          client_name: formData.client_name,
          client_email: formData.client_email,
          description: formData.description,
          amount: formData.amount,
          currency: formData.currency,
          due_date: formData.due_date,
          status: formData.status,
          tax_rate: formData.tax_rate,
          discount: formData.discount,
        })

        if (error) throw new Error(error.message)

        // Optimistically add to UI
        setInvoices(prev => [mapDbInvoiceToUi(data!), ...prev])

        toast.success('Invoice created', {
          description: 'Invoice created successfully'
        })

        logger.info('Invoice created successfully', { invoiceId: data!.id })
      }

      setIsDialogOpen(false)
      setIsSubmitting(false)
    } catch (error: any) {
      logger.error('Failed to save invoice', { error })
      toast.error('Failed to save invoice', {
        description: error.message
      })
      setIsSubmitting(false)
    }
  }

  const handleSendInvoice = async (invoice: Invoice) => {
    if (!userId) return

    logger.info('Send invoice initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    try {
      const { updateInvoice } = await import('@/lib/financial-queries')
      const { data, error } = await updateInvoice(
        invoice.id,
        userId,
        { status: 'sent' }
      )

      if (error) throw new Error(error.message)

      // Optimistically update UI
      setInvoices(prev =>
        prev.map(inv => (inv.id === invoice.id ? mapDbInvoiceToUi(data!) : inv))
      )

      toast.success('Invoice sent', {
        description: `${invoice.number} sent to ${invoice.client}`
      })

      logger.info('Invoice sent successfully', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.number,
        recipient: invoice.client
      })
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

    toast.info('PDF Download', {
      description: 'PDF generation coming soon'
    })
  }

  const handleMarkAsPaid = async (invoice: Invoice) => {
    if (!userId) return

    logger.info('Mark as paid initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    if (!confirm(`Mark ${invoice.number} as paid?`)) return

    try {
      const { updateInvoice } = await import('@/lib/financial-queries')
      const { data, error } = await updateInvoice(
        invoice.id,
        userId,
        {
          status: 'paid',
          paid_date: new Date().toISOString().split('T')[0],
          paid_amount: invoice.amount
        }
      )

      if (error) throw new Error(error.message)

      // Optimistically update UI
      setInvoices(prev =>
        prev.map(inv => (inv.id === invoice.id ? mapDbInvoiceToUi(data!) : inv))
      )

      toast.success('Invoice marked as paid', {
        description: `${invoice.number} • ${formatCurrency(invoice.amount)}`
      })

      logger.info('Invoice marked as paid', {
        invoiceId: invoice.id,
        amount: invoice.amount
      })
    } catch (error: any) {
      logger.error('Failed to mark as paid', { error, invoiceId: invoice.id })
      toast.error('Failed to mark as paid', {
        description: error.message
      })
    }
  }

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!userId) return

    logger.info('Delete invoice initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    if (!confirm(`Delete ${invoice.number}?\n\nThis action cannot be undone.`)) return

    try {
      const { deleteInvoice } = await import('@/lib/financial-queries')
      const { error } = await deleteInvoice(invoice.id, userId)

      if (error) throw new Error(error.message)

      // Optimistically remove from UI
      setInvoices(prev => prev.filter(inv => inv.id !== invoice.id))

      toast.success('Invoice deleted', {
        description: invoice.number
      })

      logger.info('Invoice deleted', { invoiceId: invoice.id })
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

    toast.info('Payment Reminder', {
      description: 'Email reminder feature coming soon'
    })
  }

  // Show loading state while authenticating or loading data
  if (userLoading || isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={6} />
      </div>
    )
  }

  // Show authentication required state
  if (!userId) {
    return (
      <ErrorEmptyState
        error="Authentication required"
        action={{
          label: 'Sign In',
          onClick: () => window.location.href = '/login'
        }}
      />
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
          onClick: openAddDialog
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
            <Button size="sm" onClick={openAddDialog}>
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
                            onClick={() => openEditDialog(invoice)}
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

      {/* Invoice Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmitInvoice}>
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
              </DialogTitle>
              <DialogDescription>
                {editingInvoice
                  ? 'Update invoice details below'
                  : 'Create a new invoice for your client'
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Client Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_name" className="text-right">
                  Client Name
                </Label>
                <Input
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  className="col-span-3"
                  placeholder="Client name"
                  required
                />
              </div>

              {/* Client Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client_email" className="text-right">
                  Client Email
                </Label>
                <Input
                  id="client_email"
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                  className="col-span-3"
                  placeholder="client@example.com"
                />
              </div>

              {/* Description/Project */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Project or service description"
                  required
                />
              </div>

              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Currency */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currency" className="text-right">
                  Currency
                </Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="ZAR">ZAR</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="due_date" className="text-right">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Tax Rate */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tax_rate" className="text-right">
                  Tax Rate (%)
                </Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>

              {/* Discount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">
                  Discount
                </Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.discount}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0.00"
                />
              </div>

              {/* Notes */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingInvoice ? 'Update' : 'Create'} Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
