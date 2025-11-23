"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { NumberFlow } from '@/components/ui/number-flow'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Invoices')
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Receipt,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function InvoicesPage() {
  // ============================================================================
  // A+++ STATE MANAGEMENT
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // Regular state
  const [selectedStatus, setSelectedStatus] = useState<any>('all')
  const [searchTerm, setSearchTerm] = useState<any>('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('date')

  // Invoice state with mock data
  const [invoices, setInvoices] = useState([
    {
      id: 'INV-001',
      client: 'Acme Corp',
      clientEmail: 'contact@acmecorp.com',
      project: 'Brand Identity Package',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      paidDate: '2024-01-14',
      description: 'Complete brand identity design including logo, colors, and guidelines',
      items: [
        { description: 'Logo Design', quantity: 1, rate: 2000, amount: 2000 },
        { description: 'Brand Guidelines', quantity: 1, rate: 1500, amount: 1500 },
        { description: 'Color Palette', quantity: 1, rate: 800, amount: 800 },
        { description: 'Typography System', quantity: 1, rate: 700, amount: 700 }
      ]
    },
    {
      id: 'INV-002',
      client: 'Tech Startup',
      clientEmail: 'hello@techstartup.io',
      project: 'Website Development',
      amount: 3500,
      status: 'pending',
      dueDate: '2024-01-20',
      issueDate: '2024-01-10',
      description: 'Modern responsive website with e-commerce functionality',
      items: [
        { description: 'Frontend Development', quantity: 20, rate: 100, amount: 2000 },
        { description: 'Backend Integration', quantity: 10, rate: 150, amount: 1500 }
      ]
    },
    {
      id: 'INV-003',
      client: 'Design Agency',
      clientEmail: 'billing@designagency.com',
      project: 'UI/UX Consultation',
      amount: 2000,
      status: 'overdue',
      dueDate: '2024-01-05',
      issueDate: '2023-12-20',
      description: 'User experience analysis and design recommendations',
      items: [
        { description: 'UX Audit', quantity: 8, rate: 150, amount: 1200 },
        { description: 'Design Recommendations', quantity: 4, rate: 200, amount: 800 }
      ]
    },
    {
      id: 'INV-004',
      client: 'Local Business',
      clientEmail: 'info@localbusiness.com',
      project: 'Social Media Package',
      amount: 1500,
      status: 'draft',
      dueDate: '2024-01-25',
      issueDate: '2024-01-15',
      description: 'Complete social media content and management package',
      items: [
        { description: 'Content Creation', quantity: 10, rate: 100, amount: 1000 },
        { description: 'Account Management', quantity: 5, rate: 100, amount: 500 }
      ]
    }
  ])

  // ============================================================================
  // A+++ LOAD INVOICES DATA
  // ============================================================================
  useEffect(() => {
    const loadInvoicesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call with potential failure
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional errors (5% failure rate)
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load invoices'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)

        // A+++ Accessibility announcement
        announce('Invoices loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoices')
        setIsLoading(false)
        announce('Error loading invoices', 'assertive')
      }
    }

    loadInvoicesData()
  }, [announce])

  // Handlers
  const handleCreateInvoice = () => {
    logger.info('Creating new invoice', {
      currentInvoiceCount: invoices.length,
      nextInvoiceNumber: `INV-${String(invoices.length + 1).padStart(3, '0')}`
    })

    const newInvoiceId = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    const today = new Date().toISOString().split('T')[0]
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const newInvoice = {
      id: newInvoiceId,
      client: 'New Client',
      clientEmail: 'client@example.com',
      project: 'New Project',
      amount: 0,
      status: 'draft',
      dueDate: dueDate,
      issueDate: today,
      description: 'Project description',
      items: []
    }

    setInvoices([...invoices, newInvoice])

    toast.success('Invoice created', {
      description: `${newInvoiceId} - Draft - Due ${dueDate} - Ready to edit`
    })
  }

  const handleViewInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found', { invoiceId: id })
      return
    }

    logger.info('Viewing invoice', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      status: invoice.status
    })

    toast.info('View Invoice', {
      description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - ${invoice.status}`
    })
  }

  const handleEditInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for editing', { invoiceId: id })
      return
    }

    logger.info('Opening invoice editor', {
      invoiceId: id,
      client: invoice.client,
      project: invoice.project,
      itemCount: invoice.items?.length || 0
    })

    toast.info('Edit Invoice', {
      description: `${id} - ${invoice.client} - ${invoice.project} - ${invoice.items?.length || 0} items`
    })
  }

  const handleDeleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for deletion', { invoiceId: id })
      return
    }

    logger.info('Delete invoice requested', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      status: invoice.status
    })

    if (confirm(`Delete invoice ${id} for ${invoice.client}?`)) {
      setInvoices(invoices.filter(inv => inv.id !== id))

      logger.info('Invoice deleted', {
        invoiceId: id,
        client: invoice.client,
        amount: invoice.amount
      })

      toast.success('Invoice deleted', {
        description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - Removed from system`
      })
    }
  }

  const handleSendInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for sending', { invoiceId: id })
      return
    }

    const sentDate = new Date().toISOString()

    setInvoices(invoices.map(inv =>
      inv.id === id ? { ...inv, sentDate, status: inv.status === 'draft' ? 'pending' : inv.status } : inv
    ))

    logger.info('Invoice sent to client', {
      invoiceId: id,
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      sentDate
    })

    toast.success('Invoice sent', {
      description: `${id} - ${invoice.client} - ${invoice.clientEmail} - $${invoice.amount.toLocaleString()} - Due ${invoice.dueDate}`
    })
  }

  const handleDownloadPDF = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for PDF generation', { invoiceId: id })
      return
    }

    // Generate PDF content
    const pdfContent = `
INVOICE ${invoice.id}
======================================
Client: ${invoice.client}
Email: ${invoice.clientEmail}
Project: ${invoice.project}

Issue Date: ${invoice.issueDate}
Due Date: ${invoice.dueDate}

Description: ${invoice.description}

Items:
${invoice.items?.map((item: any) =>
  `${item.description} - Qty: ${item.quantity} x $${item.rate} = $${item.amount}`
).join('\n') || 'No items'}

======================================
TOTAL: $${invoice.amount.toLocaleString()}
Status: ${invoice.status.toUpperCase()}
======================================
`

    const blob = new Blob([pdfContent], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.id}-${invoice.client.replace(/\s+/g, '-')}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    logger.info('PDF generated and downloaded', {
      invoiceId: id,
      client: invoice.client,
      fileSize: blob.size,
      fileName: a.download
    })

    toast.success('PDF downloaded', {
      description: `${invoice.id} - ${invoice.client} - ${Math.round(blob.size / 1024)}KB - ${a.download}`
    })
  }

  const handleMarkPaid = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for payment marking', { invoiceId: id })
      return
    }

    const paidDate = new Date().toISOString().split('T')[0]

    setInvoices(invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'paid', paidDate } : inv
    ))

    logger.info('Invoice marked as paid', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      paidDate,
      previousStatus: invoice.status
    })

    toast.success('Marked as paid', {
      description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - Paid on ${paidDate} - ${invoice.status} → paid`
    })
  }

  const handleMarkUnpaid = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for unpaid marking', { invoiceId: id })
      return
    }

    setInvoices(invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'pending', paidDate: undefined } : inv
    ))

    logger.info('Invoice marked as unpaid', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      previousStatus: invoice.status
    })

    toast.info('Marked as unpaid', {
      description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - ${invoice.status} → pending`
    })
  }

  const handleDuplicateInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for duplication', { invoiceId: id })
      return
    }

    const newInvoiceId = `INV-${String(invoices.length + 1).padStart(3, '0')}`
    const today = new Date().toISOString().split('T')[0]
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const duplicateInvoice = {
      ...invoice,
      id: newInvoiceId,
      status: 'draft',
      issueDate: today,
      dueDate: dueDate,
      paidDate: undefined,
      sentDate: undefined
    }

    setInvoices([...invoices, duplicateInvoice])

    logger.info('Invoice duplicated', {
      originalId: id,
      newId: newInvoiceId,
      client: invoice.client,
      amount: invoice.amount,
      itemCount: invoice.items?.length || 0
    })

    toast.success('Invoice duplicated', {
      description: `${id} → ${newInvoiceId} - ${invoice.client} - $${invoice.amount.toLocaleString()} - ${invoice.items?.length || 0} items copied`
    })
  }

  const handleSendReminder = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for reminder', { invoiceId: id })
      return
    }

    const overdueDays = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    const reminderDate = new Date().toISOString()

    logger.info('Payment reminder sent', {
      invoiceId: id,
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      amount: invoice.amount,
      overdueDays,
      reminderDate
    })

    toast.success('Reminder sent', {
      description: `${id} - ${invoice.client} - ${invoice.clientEmail} - $${invoice.amount.toLocaleString()} - ${overdueDays > 0 ? `${overdueDays} days overdue` : `Due ${invoice.dueDate}`}`
    })
  }

  const handleRecordPayment = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for payment recording', { invoiceId: id })
      return
    }

    const paymentAmount = invoice.amount
    const paymentMethod = 'Bank Transfer'
    const paymentDate = new Date().toISOString().split('T')[0]

    logger.info('Recording payment', {
      invoiceId: id,
      client: invoice.client,
      amount: paymentAmount,
      method: paymentMethod,
      paymentDate
    })

    toast.info('Record Payment', {
      description: `${id} - ${invoice.client} - $${paymentAmount.toLocaleString()} - ${paymentMethod} - Date: ${paymentDate}`
    })
  }

  const handleVoidInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for voiding', { invoiceId: id })
      return
    }

    logger.info('Void invoice requested', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      currentStatus: invoice.status
    })

    if (confirm(`Void invoice ${id} for ${invoice.client}?`)) {
      const voidDate = new Date().toISOString().split('T')[0]

      setInvoices(invoices.map(inv =>
        inv.id === id ? { ...inv, status: 'void', voidDate } : inv
      ))

      logger.info('Invoice voided', {
        invoiceId: id,
        client: invoice.client,
        amount: invoice.amount,
        voidDate,
        previousStatus: invoice.status
      })

      toast.success('Invoice voided', {
        description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - Voided on ${voidDate} - ${invoice.status} → void`
      })
    }
  }

  const handleExportInvoices = () => {
    logger.info('Exporting invoices to CSV', {
      totalInvoices: invoices.length,
      statuses: {
        paid: invoices.filter(inv => inv.status === 'paid').length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        draft: invoices.filter(inv => inv.status === 'draft').length
      }
    })

    const csvContent = `Invoice ID,Client,Email,Project,Amount,Status,Issue Date,Due Date,Paid Date
${invoices.map(inv =>
  `${inv.id},${inv.client},${inv.clientEmail || ''},${inv.project},${inv.amount},${inv.status},${inv.issueDate},${inv.dueDate},${inv.paidDate || ''}`
).join('\n')}`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoices-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0)
    const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)

    toast.success('Invoices exported', {
      description: `${invoices.length} invoices - ${Math.round(blob.size / 1024)}KB - Total: $${totalAmount.toLocaleString()} - Paid: $${paidAmount.toLocaleString()} - ${a.download}`
    })
  }

  const handleFilterStatus = (status: string) => {
    logger.info('Filtering invoices by status', {
      status,
      previousStatus: selectedStatus,
      invoicesMatchingStatus: invoices.filter(inv => status === 'all' || inv.status === status).length
    })

    setSelectedStatus(status)
  }

  const handleSearch = (query: string) => {
    logger.debug('Search query updated', {
      query,
      previousQuery: searchTerm,
      resultsCount: invoices.filter(inv =>
        inv.client.toLowerCase().includes(query.toLowerCase()) ||
        inv.project.toLowerCase().includes(query.toLowerCase()) ||
        inv.id.toLowerCase().includes(query.toLowerCase())
      ).length
    })

    setSearchTerm(query)
  }

  const handleSort = (by: string) => {
    logger.info('Sorting invoices', {
      sortBy: by,
      previousSort: sortBy,
      invoiceCount: invoices.length
    })

    setSortBy(by)

    let sorted = [...invoices]
    if (by === 'date') {
      sorted.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    } else if (by === 'amount') {
      sorted.sort((a, b) => b.amount - a.amount)
    } else if (by === 'client') {
      sorted.sort((a, b) => a.client.localeCompare(b.client))
    } else if (by === 'dueDate') {
      sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    }

    setInvoices(sorted)

    toast.info('Invoices sorted', {
      description: `${invoices.length} invoices - Sorted by ${by} - ${by === 'amount' ? `Highest: $${sorted[0]?.amount.toLocaleString()}` : `First: ${by === 'client' ? sorted[0]?.client : sorted[0]?.issueDate}`}`
    })
  }

  const handleBulkAction = (action: string) => {
    if (selectedInvoices.length === 0) {
      logger.warn('Bulk action attempted with no invoices selected', { action })
      toast.info('No invoices selected', {
        description: 'Please select invoices to apply bulk actions'
      })
      return
    }

    logger.info('Bulk action initiated', {
      action,
      selectedCount: selectedInvoices.length,
      invoiceIds: selectedInvoices
    })

    if (action === 'delete') {
      setInvoices(invoices.filter(inv => !selectedInvoices.includes(inv.id)))
    } else if (action === 'markPaid') {
      const paidDate = new Date().toISOString().split('T')[0]
      setInvoices(invoices.map(inv =>
        selectedInvoices.includes(inv.id) ? { ...inv, status: 'paid', paidDate } : inv
      ))
    } else if (action === 'send') {
      const sentDate = new Date().toISOString()
      setInvoices(invoices.map(inv =>
        selectedInvoices.includes(inv.id) ? { ...inv, sentDate, status: inv.status === 'draft' ? 'pending' : inv.status } : inv
      ))
    }

    const totalAmount = invoices
      .filter(inv => selectedInvoices.includes(inv.id))
      .reduce((sum, inv) => sum + inv.amount, 0)

    toast.success('Bulk action complete', {
      description: `${action} - ${selectedInvoices.length} invoices - Total value: $${totalAmount.toLocaleString()}`
    })

    setSelectedInvoices([])
  }

  const handlePreview = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for preview', { invoiceId: id })
      return
    }

    logger.info('Opening invoice preview', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      itemCount: invoice.items?.length || 0
    })

    toast.info('Invoice Preview', {
      description: `${id} - ${invoice.client} - $${invoice.amount.toLocaleString()} - ${invoice.items?.length || 0} items - ${invoice.status}`
    })
  }

  const handleEmailTemplate = () => {
    const templateCount = 3 // Default, Reminder, Overdue
    const customFields = ['client_name', 'invoice_number', 'amount', 'due_date']

    logger.info('Opening email template editor', {
      templateCount,
      customFieldCount: customFields.length
    })

    toast.info('Email Template', {
      description: `${templateCount} templates - ${customFields.length} custom fields - Customize invoice emails`
    })
  }

  const handleInvoiceSettings = () => {
    const settingsSections = ['General', 'Payment Terms', 'Tax Settings', 'Branding', 'Numbering']

    logger.info('Opening invoice settings', {
      sectionCount: settingsSections.length,
      sections: settingsSections
    })

    toast.info('Invoice Settings', {
      description: `${settingsSections.length} sections - ${settingsSections.join(', ')}`
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'overdue': return <XCircle className="h-4 w-4" />
      case 'draft': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    const matchesSearch = invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)

  // ============================================================================
  // A+++ LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // ============================================================================
  // A+++ ERROR STATE
  // ============================================================================
  if (error) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorEmptyState
            error={error}
            action={{
              label: 'Retry',
              onClick: () => window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // A+++ EMPTY STATE (when no invoices exist)
  // ============================================================================
  if (filteredInvoices.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen relative p-6">
        <div className="max-w-7xl mx-auto">
          <NoDataEmptyState
            entityName="invoices"
            description={
              searchTerm || selectedStatus !== 'all'
                ? "No invoices match your search criteria. Try adjusting your filters."
                : "Get started by creating your first invoice."
            }
            action={{
              label: searchTerm || selectedStatus !== 'all' ? 'Clear Filters' : 'Create Invoice',
              onClick: searchTerm || selectedStatus !== 'all'
                ? () => { setSearchTerm(''); setSelectedStatus('all') }
                : handleCreateInvoice
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Pattern Craft Background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 -z-10 dark:opacity-100 opacity-0" />
      <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse dark:opacity-100 opacity-0"></div>
      <div className="absolute top-1/3 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000 dark:opacity-100 opacity-0"></div>
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />

      <div className="container mx-auto p-6 space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              {/* Gradient icon container */}
              <div className="relative">
                <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 to-indigo-500/50 rounded-lg blur opacity-75" />
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
              </div>
              <TextShimmer className="text-3xl font-bold" duration={2}>
                Invoices
              </TextShimmer>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your invoices and payments
            </p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-blue-500 to-indigo-600" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">${totalAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{invoices.length} invoices</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-green-500 to-emerald-600" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">${paidAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{invoices.filter(inv => inv.status === 'paid').length} paid</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-yellow-500 to-amber-600" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">${pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{invoices.filter(inv => inv.status === 'pending').length} pending</p>
            </CardContent>
          </LiquidGlassCard>
        </div>

        <div className="relative group">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          <LiquidGlassCard className="relative">
            <BorderTrail className="bg-gradient-to-r from-red-500 to-rose-600" size={60} duration={6} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">${overdueAmount.toLocaleString()}</div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{invoices.filter(inv => inv.status === 'overdue').length} overdue</p>
            </CardContent>
          </LiquidGlassCard>
        </div>
      </div>

      {/* Invoice Management */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>Create, track, and manage your invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="grid w-full grid-cols-5 sm:w-auto">
                <TabsTrigger value="all" onClick={() => setSelectedStatus('all')}>All</TabsTrigger>
                <TabsTrigger value="paid" onClick={() => setSelectedStatus('paid')}>Paid</TabsTrigger>
                <TabsTrigger value="pending" onClick={() => setSelectedStatus('pending')}>Pending</TabsTrigger>
                <TabsTrigger value="overdue" onClick={() => setSelectedStatus('overdue')}>Overdue</TabsTrigger>
                <TabsTrigger value="draft" onClick={() => setSelectedStatus('draft')}>Draft</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="kazi-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-lg">{invoice.id}</h3>
                              <Badge className={getStatusColor(invoice.status)}>
                                {getStatusIcon(invoice.status)}
                                <span className="ml-1 capitalize">{invoice.status}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-600 font-medium">{invoice.client}</p>
                            <p className="text-sm text-gray-500">{invoice.project}</p>
                            <p className="text-xs text-gray-400 mt-1">{invoice.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold kazi-text-accent mb-1">
                            ${invoice.amount.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 space-y-1">
                            <p>Issued: {invoice.issueDate}</p>
                            <p>Due: {invoice.dueDate}</p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No invoices found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
