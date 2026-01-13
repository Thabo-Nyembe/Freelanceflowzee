'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  ArrowLeft,
  DollarSign
} from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { formatCurrency, getStatusColor } from '@/lib/client-zone-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// DATABASE QUERIES
import { disputeInvoice } from '@/lib/client-zone-queries'

const logger = createFeatureLogger('ClientZoneInvoices')

// Type Definitions
interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}

interface Invoice {
  id: number
  number: string
  project: string
  amount: number
  items: InvoiceItem[]
  dueDate: string
  issueDate: string
  paidDate?: string
  status: 'paid' | 'pending' | 'overdue' | 'disputed'
  description: string
  clientName: string
  clientEmail: string
  notes?: string
  paymentMethod?: string
}

// Mock Invoice Data
const INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'INV-001',
    project: 'Brand Identity Package',
    amount: 3500,
    items: [
      { description: 'Logo Design', quantity: 1, unitPrice: 1500, total: 1500 },
      {
        description: 'Brand Guidelines',
        quantity: 1,
        unitPrice: 1200,
        total: 1200
      },
      {
        description: 'Business Card Design',
        quantity: 1,
        unitPrice: 800,
        total: 800
      }
    ],
    dueDate: '2024-01-30',
    issueDate: '2024-01-15',
    status: 'pending',
    description: 'Brand Identity Redesign - Phase 1',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    notes: 'Please remit payment within 15 days of invoice date'
  },
  {
    id: 2,
    number: 'INV-002',
    project: 'Website Development',
    amount: 12000,
    items: [
      {
        description: 'Website Design & UX',
        quantity: 1,
        unitPrice: 5000,
        total: 5000
      },
      { description: 'CMS Integration', quantity: 1, unitPrice: 4000, total: 4000 },
      { description: 'Testing & QA', quantity: 1, unitPrice: 3000, total: 3000 }
    ],
    dueDate: '2024-01-15',
    issueDate: '2024-01-01',
    paidDate: '2024-01-15',
    status: 'paid',
    description: 'Website Development - Complete Project',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    paymentMethod: 'Credit Card',
    notes: 'Thank you for prompt payment'
  },
  {
    id: 3,
    number: 'INV-003',
    project: 'Brand Identity Redesign',
    amount: 5000,
    items: [
      {
        description: 'Color Palette Development',
        quantity: 1,
        unitPrice: 2000,
        total: 2000
      },
      {
        description: 'Typography Selection',
        quantity: 1,
        unitPrice: 1500,
        total: 1500
      },
      {
        description: 'Brand Asset Creation',
        quantity: 1,
        unitPrice: 1500,
        total: 1500
      }
    ],
    dueDate: '2024-02-10',
    issueDate: '2024-01-25',
    status: 'overdue',
    description: 'Brand Identity Redesign - Phase 2',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    notes: 'This invoice is now overdue. Please remit payment immediately.'
  },
  {
    id: 4,
    number: 'INV-004',
    project: 'Marketing Collateral',
    amount: 2500,
    items: [
      {
        description: 'Brochure Design (Tri-fold)',
        quantity: 2,
        unitPrice: 750,
        total: 1500
      },
      {
        description: 'Social Media Templates',
        quantity: 1,
        unitPrice: 1000,
        total: 1000
      }
    ],
    dueDate: '2024-02-20',
    issueDate: '2024-02-05',
    status: 'pending',
    description: 'Marketing Collateral Design',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    notes: 'Editable template files included'
  },
  {
    id: 5,
    number: 'INV-005',
    project: 'Website Development',
    amount: 3000,
    items: [
      {
        description: 'Maintenance & Support (Monthly)',
        quantity: 3,
        unitPrice: 1000,
        total: 3000
      }
    ],
    dueDate: '2024-01-20',
    issueDate: '2024-01-05',
    paidDate: '2024-01-20',
    status: 'paid',
    description: 'Website Maintenance & Support - Q1 2024',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    paymentMethod: 'Bank Transfer',
    notes: 'Recurring monthly service'
  },
  {
    id: 6,
    number: 'INV-006',
    project: 'Brand Identity Redesign',
    amount: 1500,
    items: [
      {
        description: 'Additional Logo Revisions',
        quantity: 3,
        unitPrice: 500,
        total: 1500
      }
    ],
    dueDate: '2024-02-05',
    issueDate: '2024-01-20',
    status: 'disputed',
    description: 'Additional Services - Logo Revisions',
    clientName: 'Acme Corporation',
    clientEmail: 'john@acme.com',
    notes: 'Client disputed charges for revisions'
  }
]

export default function InvoicesPage() {
  const router = useRouter()

  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'disputed'>('all')

  // Dispute dialog state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeInvoiceState, setDisputeInvoiceState] = useState<Invoice | null>(null)
  const [disputeReason, setDisputeReason] = useState('')

  // Load Invoices Data
  useEffect(() => {
    const loadInvoicesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load invoices from API
        const response = await fetch('/api/client-zone/invoices')
        if (!response.ok) throw new Error('Failed to load invoices')

        setInvoices(INVOICES)
        setIsLoading(false)
        announce('Invoices loaded successfully', 'polite')
        logger.info('Invoices data loaded', {
          invoiceCount: INVOICES.length
        })
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load invoices'
        setError(errorMsg)
        setIsLoading(false)
        announce('Error loading invoices', 'assertive')
        logger.error('Failed to load invoices', { error: err })
      }
    }

    loadInvoicesData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filter invoices
  const filteredInvoices =
    filterStatus === 'all'
      ? invoices
      : invoices.filter((i) => i.status === filterStatus)

  // Calculate summary
  const summaryStats = {
    totalInvoiced: invoices.reduce((sum, i) => sum + i.amount, 0),
    totalPaid: invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0),
    totalPending: invoices
      .filter((i) => i.status === 'pending')
      .reduce((sum, i) => sum + i.amount, 0),
    totalOverdue: invoices
      .filter((i) => i.status === 'overdue')
      .reduce((sum, i) => sum + i.amount, 0)
  }

  // Handle Pay Invoice
  const handlePayInvoice = async (invoice: Invoice) => {
    logger.info('Payment initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      project: invoice.project
    })

    try {
      const response = await fetch('/api/invoices/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: invoice.id,
          invoiceNumber: invoice.number,
          amount: invoice.amount,
          currency: 'USD'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      logger.info('Stripe payment session created', {
        invoiceId: invoice.id
      })

      toast.success('Redirecting to payment...', {
        description: `Invoice ${invoice.number} - ${formatCurrency(invoice.amount)}`
      })

      // In a real app, redirect to Stripe checkout
      setTimeout(() => {
        window.open('https://stripe.com/checkout', '_blank')
      }, 1000)
    } catch (error: any) {
      logger.error('Failed to initiate payment', { error, invoiceId: invoice.id })
      toast.error('Failed to initiate payment', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle Download PDF
  const handleDownloadPDF = async (invoice: Invoice) => {
    logger.info('PDF download initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      logger.info('Invoice PDF generated', { invoiceId: invoice.id })

      // Create blob and download
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
        description: `${invoice.number} saved to downloads`
      })
    } catch (error: any) {
      logger.error('Failed to download PDF', { error, invoiceId: invoice.id })
      toast.error('Failed to download PDF', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Handle View Details
  const handleViewDetails = (invoice: Invoice) => {
    logger.info('Invoice details viewed', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })
    setSelectedInvoice(invoice)
  }

  // Handle Dispute Invoice
  const handleDisputeInvoice = (invoice: Invoice) => {
    logger.info('Invoice dispute initiated', {
      invoiceId: invoice.id,
      invoiceNumber: invoice.number
    })
    setDisputeInvoiceState(invoice)
    setDisputeReason('')
    setShowDisputeDialog(true)
  }

  // Confirm Dispute Invoice
  const confirmDisputeInvoice = async () => {
    if (!disputeInvoiceState) return

    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute')
      return
    }

    try {
      // Use database function to dispute invoice
      const result = await disputeInvoice(
        disputeInvoiceState.id.toString(),
        disputeReason.trim()
      )

      if (result.error) {
        throw result.error
      }

      // Update local state
      setInvoices(
        invoices.map((i) =>
          i.id === disputeInvoiceState.id ? { ...i, status: 'disputed' } : i
        )
      )

      logger.info('Invoice dispute submitted', { invoiceId: disputeInvoiceState.id })
      toast.success('Dispute submitted', {
        description: 'Our team will review and contact you within 24 hours'
      })
      announce('Dispute submitted successfully', 'polite')
      setShowDisputeDialog(false)
      setDisputeInvoiceState(null)
      setDisputeReason('')
    } catch (error: any) {
      logger.error('Failed to submit dispute', { error, invoiceId: disputeInvoiceState.id })
      toast.error('Failed to submit dispute', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={5} />
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
        <div className="container mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices & Billing</h1>
              <p className="text-gray-600 mt-1">
                View, download, and manage all project invoices
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(summaryStats.totalInvoiced)}
              </p>
              <p className="text-sm text-gray-600">Total Invoiced</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summaryStats.totalPaid)}
              </p>
              <p className="text-sm text-gray-600">Paid</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(summaryStats.totalPending)}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summaryStats.totalOverdue)}
              </p>
              <p className="text-sm text-gray-600">Overdue</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 flex-wrap"
        >
          {(['all', 'paid', 'pending', 'overdue', 'disputed'] as const).map(
            (status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                onClick={() => setFilterStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Invoices' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            )
          )}
        </motion.div>

        {/* Invoices List */}
        {filteredInvoices.length === 0 ? (
          <NoDataEmptyState
            title="No invoices found"
            description="No invoices match your current filter."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {filteredInvoices.map((invoice) => (
              <motion.div
                key={invoice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
              >
                <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      {/* Invoice Info */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                        <p className="font-semibold text-lg text-gray-900">
                          {invoice.number}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{invoice.project}</p>
                      </div>

                      {/* Dates */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Issued</p>
                        <p className="font-medium">
                          {new Date(invoice.issueDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Due</p>
                        <p className="font-medium">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Amount */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </p>
                        <Badge
                          className={`mt-2 ${getStatusColor(invoice.status)}`}
                        >
                          {invoice.status.charAt(0).toUpperCase() +
                            invoice.status.slice(1)}
                        </Badge>
                      </div>

                      {/* Description */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Description</p>
                        <p className="text-sm text-gray-900">
                          {invoice.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                          <Button
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                            onClick={() => handlePayInvoice(invoice)}
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </Button>
                        ) : invoice.status === 'paid' ? (
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadPDF(invoice)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        ) : null}

                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(invoice)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>

                        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                          <Button
                            variant="outline"
                            onClick={() => handleDisputeInvoice(invoice)}
                            className="gap-2 text-amber-600 hover:text-amber-700"
                          >
                            <AlertCircle className="h-4 w-4" />
                            Dispute
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Dispute Invoice Dialog */}
        <Dialog open={showDisputeDialog} onOpenChange={setShowDisputeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Dispute Invoice
              </DialogTitle>
              <DialogDescription>
                {disputeInvoiceState && (
                  <>Dispute invoice {disputeInvoiceState.number} ({formatCurrency(disputeInvoiceState.amount)})</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="disputeReason">Reason for Dispute</Label>
                <Textarea
                  id="disputeReason"
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Please provide a detailed explanation of why you are disputing this invoice..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDisputeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={confirmDisputeInvoice}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Submit Dispute
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Invoice Details Modal */}
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Invoice {selectedInvoice.number}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Bill To</p>
                    <p className="font-semibold">{selectedInvoice.clientName}</p>
                    <p className="text-sm text-gray-600">
                      {selectedInvoice.clientEmail}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Invoice Details</p>
                    <p className="font-semibold text-lg">
                      {formatCurrency(selectedInvoice.amount)}
                    </p>
                    <Badge
                      className={`mt-2 ${getStatusColor(selectedInvoice.status)}`}
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </div>
                </div>

                {/* Line Items */}
                <div>
                  <h3 className="font-semibold mb-4">Line Items</h3>
                  <div className="space-y-2 mb-4 border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 font-semibold text-sm">
                      <span>Description</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Total</span>
                    </div>
                    {selectedInvoice.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-4 gap-4 p-4 border-t text-sm"
                      >
                        <span>{item.description}</span>
                        <span className="text-right">{item.quantity}</span>
                        <span className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </span>
                        <span className="text-right font-semibold">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-end mb-4">
                    <div className="w-48">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(selectedInvoice.amount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Notes</p>
                    <p className="text-sm">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2"
                    onClick={() => {
                      handleDownloadPDF(selectedInvoice)
                      setSelectedInvoice(null)
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  {selectedInvoice.status === 'pending' ||
                  selectedInvoice.status === 'overdue' ? (
                    <Button
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                      onClick={() => {
                        handlePayInvoice(selectedInvoice)
                        setSelectedInvoice(null)
                      }}
                    >
                      <CreditCard className="h-4 w-4" />
                      Pay Invoice
                    </Button>
                  ) : null}
                  <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Helper for X icon
function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6l-12 12M6 6l12 12" />
    </svg>
  )
}
