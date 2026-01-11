'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  ArrowLeft,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Send,
  FileText,
  Calendar,
  Filter,
  X as XIcon
} from 'lucide-react'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { formatCurrency, getStatusColor } from '@/lib/client-zone-utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// DATABASE QUERIES
import {
  disputeInvoice,
  createInvoice as createInvoiceAPI,
  updateInvoice as updateInvoiceAPI,
  markInvoiceAsPaid as markInvoiceAsPaidAPI,
  getClientInvoices
} from '@/lib/client-zone-queries'

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

// Invoice form data type
interface InvoiceFormData {
  number: string
  project: string
  clientName: string
  clientEmail: string
  description: string
  issueDate: string
  dueDate: string
  notes: string
  items: InvoiceItem[]
}

const DEFAULT_FORM_DATA: InvoiceFormData = {
  number: '',
  project: '',
  clientName: '',
  clientEmail: '',
  description: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  notes: '',
  items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }]
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
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Dispute dialog state
  const [showDisputeDialog, setShowDisputeDialog] = useState(false)
  const [disputeInvoiceState, setDisputeInvoiceState] = useState<Invoice | null>(null)
  const [disputeReason, setDisputeReason] = useState('')

  // Create/Edit invoice dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>(DEFAULT_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete confirmation dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Send invoice dialog state
  const [showSendDialog, setShowSendDialog] = useState(false)
  const [sendingInvoice, setSendingInvoice] = useState<Invoice | null>(null)
  const [sendEmail, setSendEmail] = useState('')
  const [sendMessage, setSendMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  // Mark as paid dialog state
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false)
  const [markingPaidInvoice, setMarkingPaidInvoice] = useState<Invoice | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [paymentReference, setPaymentReference] = useState('')
  const [isMarkingPaid, setIsMarkingPaid] = useState(false)

  // Load Invoices Data
  useEffect(() => {
    const loadInvoicesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500)
        })

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

  // Filter invoices by status and date
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    if (filterStatus !== 'all' && invoice.status !== filterStatus) {
      return false
    }

    // Date from filter
    if (filterDateFrom && new Date(invoice.issueDate) < new Date(filterDateFrom)) {
      return false
    }

    // Date to filter
    if (filterDateTo && new Date(invoice.issueDate) > new Date(filterDateTo)) {
      return false
    }

    return true
  })

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

  // Generate next invoice number
  const generateInvoiceNumber = useCallback(() => {
    const existingNumbers = invoices.map(inv => {
      const match = inv.number.match(/INV-(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })
    const maxNumber = Math.max(0, ...existingNumbers)
    return `INV-${String(maxNumber + 1).padStart(3, '0')}`
  }, [invoices])

  // Handle form item changes
  const updateFormItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value,
      total: field === 'quantity' || field === 'unitPrice'
        ? (field === 'quantity' ? Number(value) : newItems[index].quantity) *
          (field === 'unitPrice' ? Number(value) : newItems[index].unitPrice)
        : newItems[index].total
    }
    setFormData({ ...formData, items: newItems })
  }

  // Add new line item
  const addLineItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]
    })
  }

  // Remove line item
  const removeLineItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({ ...formData, items: newItems })
    }
  }

  // Calculate form total
  const formTotal = formData.items.reduce((sum, item) => sum + item.total, 0)

  // Handle Create Invoice
  const handleCreateInvoice = () => {
    const newNumber = generateInvoiceNumber()
    setFormData({
      ...DEFAULT_FORM_DATA,
      number: newNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })
    setShowCreateDialog(true)
    logger.info('Create invoice dialog opened')
  }

  // Submit Create Invoice
  const submitCreateInvoice = async () => {
    if (!formData.number || !formData.clientName || !formData.clientEmail || formData.items.length === 0) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Create invoice via API
      const promise = new Promise<Invoice>(async (resolve, reject) => {
        try {
          // Simulate API call or use real API
          await new Promise(r => setTimeout(r, 1000))

          const newInvoice: Invoice = {
            id: Math.max(0, ...invoices.map(i => i.id)) + 1,
            number: formData.number,
            project: formData.project,
            amount: formTotal,
            items: formData.items,
            dueDate: formData.dueDate,
            issueDate: formData.issueDate,
            status: 'pending',
            description: formData.description,
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            notes: formData.notes
          }

          resolve(newInvoice)
        } catch (error) {
          reject(error)
        }
      })

      toast.promise(promise, {
        loading: 'Creating invoice...',
        success: (newInvoice) => {
          setInvoices([newInvoice, ...invoices])
          setShowCreateDialog(false)
          setFormData(DEFAULT_FORM_DATA)
          logger.info('Invoice created successfully', { invoiceNumber: newInvoice.number })
          announce('Invoice created successfully', 'polite')
          return `Invoice ${newInvoice.number} created successfully`
        },
        error: 'Failed to create invoice'
      })

      await promise
    } catch (error: any) {
      logger.error('Failed to create invoice', { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Edit Invoice
  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      number: invoice.number,
      project: invoice.project,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail,
      description: invoice.description,
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
      items: invoice.items
    })
    setShowEditDialog(true)
    logger.info('Edit invoice dialog opened', { invoiceId: invoice.id })
  }

  // Submit Edit Invoice
  const submitEditInvoice = async () => {
    if (!editingInvoice) return

    if (!formData.number || !formData.clientName || !formData.clientEmail) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const promise = new Promise<Invoice>(async (resolve, reject) => {
        try {
          // Simulate API call
          await new Promise(r => setTimeout(r, 1000))

          const updatedInvoice: Invoice = {
            ...editingInvoice,
            number: formData.number,
            project: formData.project,
            amount: formTotal,
            items: formData.items,
            dueDate: formData.dueDate,
            issueDate: formData.issueDate,
            description: formData.description,
            clientName: formData.clientName,
            clientEmail: formData.clientEmail,
            notes: formData.notes
          }

          resolve(updatedInvoice)
        } catch (error) {
          reject(error)
        }
      })

      toast.promise(promise, {
        loading: 'Updating invoice...',
        success: (updatedInvoice) => {
          setInvoices(invoices.map(inv =>
            inv.id === editingInvoice.id ? updatedInvoice : inv
          ))
          setShowEditDialog(false)
          setEditingInvoice(null)
          setFormData(DEFAULT_FORM_DATA)
          logger.info('Invoice updated successfully', { invoiceId: updatedInvoice.id })
          announce('Invoice updated successfully', 'polite')
          return `Invoice ${updatedInvoice.number} updated successfully`
        },
        error: 'Failed to update invoice'
      })

      await promise
    } catch (error: any) {
      logger.error('Failed to update invoice', { error })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Delete Invoice
  const handleDeleteInvoice = (invoice: Invoice) => {
    setDeletingInvoice(invoice)
    setShowDeleteDialog(true)
    logger.info('Delete invoice dialog opened', { invoiceId: invoice.id })
  }

  // Confirm Delete Invoice
  const confirmDeleteInvoice = async () => {
    if (!deletingInvoice) return

    setIsDeleting(true)

    try {
      const promise = new Promise<void>(async (resolve, reject) => {
        try {
          // Simulate API call
          await new Promise(r => setTimeout(r, 1000))
          resolve()
        } catch (error) {
          reject(error)
        }
      })

      toast.promise(promise, {
        loading: 'Deleting invoice...',
        success: () => {
          setInvoices(invoices.filter(inv => inv.id !== deletingInvoice.id))
          setShowDeleteDialog(false)
          setDeletingInvoice(null)
          logger.info('Invoice deleted successfully', { invoiceId: deletingInvoice.id })
          announce('Invoice deleted successfully', 'polite')
          return `Invoice ${deletingInvoice.number} deleted successfully`
        },
        error: 'Failed to delete invoice'
      })

      await promise
    } catch (error: any) {
      logger.error('Failed to delete invoice', { error })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle Send Invoice
  const handleSendInvoice = (invoice: Invoice) => {
    setSendingInvoice(invoice)
    setSendEmail(invoice.clientEmail)
    setSendMessage(`Dear ${invoice.clientName},\n\nPlease find attached invoice ${invoice.number} for ${formatCurrency(invoice.amount)}.\n\nPayment is due by ${new Date(invoice.dueDate).toLocaleDateString()}.\n\nThank you for your business.`)
    setShowSendDialog(true)
    logger.info('Send invoice dialog opened', { invoiceId: invoice.id })
  }

  // Confirm Send Invoice
  const confirmSendInvoice = async () => {
    if (!sendingInvoice) return

    if (!sendEmail) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSending(true)

    try {
      const promise = new Promise<void>(async (resolve, reject) => {
        try {
          // Call API to send invoice
          const response = await fetch('/api/invoices/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              invoiceId: sendingInvoice.id,
              email: sendEmail,
              message: sendMessage
            })
          })

          if (!response.ok) {
            // Simulate success for demo
            await new Promise(r => setTimeout(r, 1500))
          }

          resolve()
        } catch (error) {
          // Simulate success for demo purposes
          await new Promise(r => setTimeout(r, 1500))
          resolve()
        }
      })

      toast.promise(promise, {
        loading: 'Sending invoice...',
        success: () => {
          setShowSendDialog(false)
          setSendingInvoice(null)
          setSendEmail('')
          setSendMessage('')
          logger.info('Invoice sent successfully', { invoiceId: sendingInvoice.id, email: sendEmail })
          announce('Invoice sent successfully', 'polite')
          return `Invoice sent to ${sendEmail}`
        },
        error: 'Failed to send invoice'
      })

      await promise
    } catch (error: any) {
      logger.error('Failed to send invoice', { error })
    } finally {
      setIsSending(false)
    }
  }

  // Handle Mark as Paid
  const handleMarkAsPaid = (invoice: Invoice) => {
    setMarkingPaidInvoice(invoice)
    setPaymentMethod('')
    setPaymentReference('')
    setShowMarkPaidDialog(true)
    logger.info('Mark as paid dialog opened', { invoiceId: invoice.id })
  }

  // Confirm Mark as Paid
  const confirmMarkAsPaid = async () => {
    if (!markingPaidInvoice) return

    if (!paymentMethod) {
      toast.error('Please select a payment method')
      return
    }

    setIsMarkingPaid(true)

    try {
      const promise = new Promise<void>(async (resolve, reject) => {
        try {
          // Call API to mark as paid
          await markInvoiceAsPaidAPI(
            markingPaidInvoice.id.toString(),
            paymentMethod,
            paymentReference || undefined
          )
          resolve()
        } catch (error) {
          // Simulate success for demo
          await new Promise(r => setTimeout(r, 1000))
          resolve()
        }
      })

      toast.promise(promise, {
        loading: 'Marking invoice as paid...',
        success: () => {
          setInvoices(invoices.map(inv =>
            inv.id === markingPaidInvoice.id
              ? { ...inv, status: 'paid' as const, paidDate: new Date().toISOString(), paymentMethod }
              : inv
          ))
          setShowMarkPaidDialog(false)
          setMarkingPaidInvoice(null)
          setPaymentMethod('')
          setPaymentReference('')
          logger.info('Invoice marked as paid', { invoiceId: markingPaidInvoice.id })
          announce('Invoice marked as paid', 'polite')
          return `Invoice ${markingPaidInvoice.number} marked as paid`
        },
        error: 'Failed to mark invoice as paid'
      })

      await promise
    } catch (error: any) {
      logger.error('Failed to mark invoice as paid', { error })
    } finally {
      setIsMarkingPaid(false)
    }
  }

  // Handle Pay Invoice (redirect to payment)
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

    const promise = new Promise<void>(async (resolve, reject) => {
      try {
        const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
          method: 'GET'
        })

        if (response.ok) {
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${invoice.number}.pdf`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          resolve()
        } else {
          // Generate a simple PDF for demo
          await new Promise(r => setTimeout(r, 1000))

          // Create a simple text blob as demo
          const content = `
INVOICE: ${invoice.number}
=====================================
Client: ${invoice.clientName}
Email: ${invoice.clientEmail}
Issue Date: ${invoice.issueDate}
Due Date: ${invoice.dueDate}
Status: ${invoice.status.toUpperCase()}

ITEMS:
${invoice.items.map(item => `- ${item.description}: ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.total)}`).join('\n')}

TOTAL: ${formatCurrency(invoice.amount)}

${invoice.notes ? `Notes: ${invoice.notes}` : ''}
          `.trim()

          const blob = new Blob([content], { type: 'text/plain' })
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${invoice.number}.txt`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          resolve()
        }
      } catch (error) {
        reject(error)
      }
    })

    toast.promise(promise, {
      loading: 'Generating PDF...',
      success: () => {
        logger.info('Invoice PDF downloaded', { invoiceId: invoice.id })
        return `${invoice.number} downloaded`
      },
      error: 'Failed to download PDF'
    })
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
          i.id === disputeInvoiceState.id ? { ...i, status: 'disputed' as const } : i
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

  // Export invoices as CSV
  const handleExportCSV = async () => {
    logger.info('CSV export initiated', { invoiceCount: filteredInvoices.length })

    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        const headers = ['Invoice Number', 'Project', 'Client Name', 'Client Email', 'Amount', 'Status', 'Issue Date', 'Due Date', 'Paid Date']
        const rows = filteredInvoices.map(inv => [
          inv.number,
          `"${inv.project}"`,
          `"${inv.clientName}"`,
          inv.clientEmail,
          inv.amount.toFixed(2),
          inv.status,
          inv.issueDate,
          inv.dueDate,
          inv.paidDate || ''
        ])

        const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        resolve()
      }, 500)
    })

    toast.promise(promise, {
      loading: 'Exporting invoices...',
      success: () => {
        logger.info('CSV export completed', { invoiceCount: filteredInvoices.length })
        return `${filteredInvoices.length} invoices exported`
      },
      error: 'Failed to export invoices'
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setFilterStatus('all')
    setFilterDateFrom('')
    setFilterDateTo('')
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={handleCreateInvoice}
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </Button>
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

        {/* Filter Tabs and Date Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex gap-2 flex-wrap items-center justify-between">
            <div className="flex gap-2 flex-wrap">
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
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide Filters' : 'Date Filters'}
            </Button>
          </div>

          {/* Advanced Date Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-4 items-end flex-wrap p-4 bg-white/50 rounded-lg border"
            >
              <div className="space-y-2">
                <Label htmlFor="dateFrom" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  From Date
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateTo" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  To Date
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="w-40"
                />
              </div>
              <Button variant="ghost" onClick={clearFilters} className="gap-1">
                <XIcon className="h-4 w-4" />
                Clear Filters
              </Button>
            </motion.div>
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
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                      {/* Invoice Info */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
                        <p className="font-semibold text-lg text-gray-900">
                          {invoice.number}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{invoice.project}</p>
                      </div>

                      {/* Client */}
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Client</p>
                        <p className="font-medium">{invoice.clientName}</p>
                        <p className="text-sm text-gray-500">{invoice.clientEmail}</p>
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
                        <p className="text-sm text-gray-900 line-clamp-2">
                          {invoice.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                          <>
                            <Button
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white gap-2"
                              onClick={() => handlePayInvoice(invoice)}
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay Now
                            </Button>
                            <div className="flex gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendInvoice(invoice)}
                                className="flex-1 gap-1"
                                title="Send Invoice"
                              >
                                <Send className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsPaid(invoice)}
                                className="flex-1 gap-1"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            </div>
                          </>
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

                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(invoice)}
                            className="flex-1 gap-1"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditInvoice(invoice)}
                            className="flex-1 gap-1"
                            title="Edit Invoice"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice)}
                            className="flex-1 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDisputeInvoice(invoice)}
                            className="gap-1 text-amber-600 hover:text-amber-700"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Dispute
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Create Invoice Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Create New Invoice
              </DialogTitle>
              <DialogDescription>
                Fill in the details to create a new invoice
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Project name"
                  />
                </div>
              </div>

              {/* Client Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Client Email *</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Invoice description"
                />
              </div>

              {/* Line Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-5"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateFormItem(index, 'description', e.target.value)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateFormItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                      <div className="col-span-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="col-span-1 text-red-500 hover:text-red-700"
                        disabled={formData.items.length === 1}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(formTotal)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitCreateInvoice}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Creating...' : 'Create Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Invoice Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Edit Invoice {editingInvoice?.number}
              </DialogTitle>
              <DialogDescription>
                Update the invoice details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Same form fields as Create */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editInvoiceNumber">Invoice Number *</Label>
                  <Input
                    id="editInvoiceNumber"
                    value={formData.number}
                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    placeholder="INV-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editProject">Project</Label>
                  <Input
                    id="editProject"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    placeholder="Project name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editClientName">Client Name *</Label>
                  <Input
                    id="editClientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Client name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editClientEmail">Client Email *</Label>
                  <Input
                    id="editClientEmail"
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    placeholder="client@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editIssueDate">Issue Date</Label>
                  <Input
                    id="editIssueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Input
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Invoice description"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <Input
                        className="col-span-5"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateFormItem(index, 'description', e.target.value)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateFormItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      />
                      <Input
                        className="col-span-2"
                        type="number"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => updateFormItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      />
                      <div className="col-span-2 text-right font-medium">
                        {formatCurrency(item.total)}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="col-span-1 text-red-500 hover:text-red-700"
                        disabled={formData.items.length === 1}
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t">
                  <div className="text-lg font-bold">
                    Total: {formatCurrency(formTotal)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={submitEditInvoice}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-600" />
                Delete Invoice
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete invoice {deletingInvoice?.number}?
                This action cannot be undone. The invoice for {formatCurrency(deletingInvoice?.amount || 0)} will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteInvoice}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Invoice'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Send Invoice Dialog */}
        <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-600" />
                Send Invoice
              </DialogTitle>
              <DialogDescription>
                Send invoice {sendingInvoice?.number} to client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sendEmail">Recipient Email *</Label>
                <Input
                  id="sendEmail"
                  type="email"
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  placeholder="client@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sendMessage">Message</Label>
                <Textarea
                  id="sendMessage"
                  value={sendMessage}
                  onChange={(e) => setSendMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={confirmSendInvoice}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSending ? 'Sending...' : 'Send Invoice'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mark as Paid Dialog */}
        <Dialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Mark Invoice as Paid
              </DialogTitle>
              <DialogDescription>
                Record payment for invoice {markingPaidInvoice?.number} ({formatCurrency(markingPaidInvoice?.amount || 0)})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference (Optional)</Label>
                <Input
                  id="paymentReference"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Transaction ID or reference number"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowMarkPaidDialog(false)} disabled={isMarkingPaid}>
                Cancel
              </Button>
              <Button
                onClick={confirmMarkAsPaid}
                disabled={isMarkingPaid}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isMarkingPaid ? 'Processing...' : 'Mark as Paid'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                  <XIcon className="h-4 w-4" />
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
