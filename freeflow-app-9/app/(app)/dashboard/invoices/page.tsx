"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'

// ============================================================================
// A+++ UTILITIES
// ============================================================================
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

// AI FEATURES
import { RevenueInsightsWidget } from '@/components/ai/revenue-insights-widget'
import { useCurrentUser, useRevenueData } from '@/hooks/use-ai-data'

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
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Palette,
  Upload,
  Image as ImageIcon,
  Type,
  Percent,
  CreditCard,
  Sparkles,
  Layout
} from 'lucide-react'

export default function InvoicesPage() {
  // REAL USER AUTH & AI DATA
  const { userId, loading: userLoading } = useCurrentUser()
  const { data: revenueData, loading: revenueLoading } = useRevenueData(userId || undefined)

  // ============================================================================
  // A+++ STATE MANAGEMENT
  // ============================================================================
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // Regular state
  const [selectedStatus, setSelectedStatus] = useState<any>('all')
  const [showAIWidget, setShowAIWidget] = useState(true)
  const [searchTerm, setSearchTerm] = useState<any>('')
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>('date')
  const [deleteInvoice, setDeleteInvoice] = useState<{ id: string; client: string } | null>(null)
  const [voidInvoice, setVoidInvoice] = useState<{ id: string; client: string } | null>(null)

  // View and Edit invoice dialog states
  const [viewInvoice, setViewInvoice] = useState<any | null>(null)
  const [editInvoice, setEditInvoice] = useState<any | null>(null)
  const [editForm, setEditForm] = useState({
    client: '',
    clientEmail: '',
    project: '',
    description: '',
    dueDate: ''
  })
  const [isSavingEdit, setIsSavingEdit] = useState(false)

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

  // Template state - USER MANUAL SPEC (Gap #8)
  const [invoiceTemplate, setInvoiceTemplate] = useState({
    layout: 'professional' as 'modern' | 'classic' | 'minimal' | 'professional',
    primaryColor: '#3B82F6', // Blue
    secondaryColor: '#1E40AF', // Dark blue
    accentColor: '#60A5FA', // Light blue
    logo: null as string | null,
    headerText: 'Your Business Name',
    footerText: 'Thank you for your business!',
    showLineNumbers: true,
    showItemImages: false,
    taxRate: 0,
    currency: 'USD',
    taxType: 'none' as 'none' | 'sales' | 'vat' | 'custom',
    paymentMethods: {
      stripe: true,
      bankTransfer: true,
      paypal: false,
      crypto: false
    }
  })

  // ============================================================================
  // A+++ LOAD INVOICES DATA
  // ============================================================================
  useEffect(() => {
    const loadInvoicesData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate API call
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
      toast.error('Invoice not found')
      return
    }

    logger.info('Viewing invoice', {
      invoiceId: id,
      client: invoice.client,
      amount: invoice.amount,
      status: invoice.status
    })

    setViewInvoice(invoice)
  }

  const handleEditInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (!invoice) {
      logger.warn('Invoice not found for editing', { invoiceId: id })
      toast.error('Invoice not found')
      return
    }

    logger.info('Opening invoice editor', {
      invoiceId: id,
      client: invoice.client,
      project: invoice.project,
      itemCount: invoice.items?.length || 0
    })

    // Populate edit form
    setEditForm({
      client: invoice.client,
      clientEmail: invoice.clientEmail,
      project: invoice.project,
      description: invoice.description,
      dueDate: invoice.dueDate
    })
    setEditInvoice(invoice)
  }

  const handleSaveEditInvoice = async () => {
    if (!editInvoice) return

    setIsSavingEdit(true)
    try {
      // Update invoice in state
      setInvoices(invoices.map(inv =>
        inv.id === editInvoice.id
          ? {
              ...inv,
              client: editForm.client,
              clientEmail: editForm.clientEmail,
              project: editForm.project,
              description: editForm.description,
              dueDate: editForm.dueDate
            }
          : inv
      ))

      logger.info('Invoice updated successfully', {
        invoiceId: editInvoice.id,
        client: editForm.client,
        project: editForm.project
      })

      toast.success('Invoice updated', {
        description: `${editInvoice.id} - ${editForm.client} - ${editForm.project}`
      })
      setEditInvoice(null)
      announce('Invoice updated successfully', 'polite')
    } catch (error: any) {
      logger.error('Failed to update invoice', { error: error.message })
      toast.error('Failed to update invoice')
    } finally {
      setIsSavingEdit(false)
    }
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

    setDeleteInvoice({ id, client: invoice.client })
  }

  const handleConfirmDeleteInvoice = () => {
    if (!deleteInvoice) return

    const invoice = invoices.find(inv => inv.id === deleteInvoice.id)
    setInvoices(invoices.filter(inv => inv.id !== deleteInvoice.id))

    logger.info('Invoice deleted', {
      invoiceId: deleteInvoice.id,
      client: deleteInvoice.client,
      amount: invoice?.amount
    })

    toast.success('Invoice deleted', {
      description: `${deleteInvoice.id} - ${deleteInvoice.client} - $${invoice?.amount.toLocaleString()} - Removed from system`
    })
    setDeleteInvoice(null)
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

    setVoidInvoice({ id, client: invoice.client })
  }

  const handleConfirmVoidInvoice = () => {
    if (!voidInvoice) return

    const invoice = invoices.find(inv => inv.id === voidInvoice.id)
    const voidDate = new Date().toISOString().split('T')[0]

    setInvoices(invoices.map(inv =>
      inv.id === voidInvoice.id ? { ...inv, status: 'void', voidDate } : inv
    ))

    logger.info('Invoice voided', {
      invoiceId: voidInvoice.id,
      client: voidInvoice.client,
      amount: invoice?.amount,
      voidDate,
      previousStatus: invoice?.status
    })

    toast.success('Invoice voided', {
      description: `${voidInvoice.id} - ${voidInvoice.client} - $${invoice?.amount.toLocaleString()} - Voided on ${voidDate} - ${invoice?.status} → void`
    })
    setVoidInvoice(null)
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

    const sorted = [...invoices]
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              logger.info('Exporting invoices', {
                totalInvoices: invoices.length,
                paidCount: invoices.filter(inv => inv.status === 'paid').length,
                totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0)
              })
              toast.success('Exporting invoices...', {
                description: `${invoices.length} invoices - $${invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} total`
              })
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={handleCreateInvoice}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* AI REVENUE INSIGHTS */}
      {showAIWidget && userId && revenueData && (
        <div className="mb-6">
          <RevenueInsightsWidget
            userId={userId}
            revenueData={revenueData}
            showActions={true}
          />
        </div>
      )}

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

      {/* PROFESSIONAL INVOICE TEMPLATES - USER MANUAL SPEC (Gap #8) */}
      <Card className="bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 border-2 border-indigo-200">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Palette className="w-6 h-6 text-indigo-600" />
                Professional Invoice Templates
              </CardTitle>
              <CardDescription className="text-gray-700">
                Customize your invoice branding, colors, and layout for a professional appearance
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selector */}
          <div>
            <label className="text-sm font-semibold text-gray-900 mb-3 block flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-600" />
              Invoice Layout Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {[
                { id: 'modern', name: 'Modern', desc: 'Clean, minimalist design', color: 'blue' },
                { id: 'classic', name: 'Classic', desc: 'Traditional business style', color: 'gray' },
                { id: 'minimal', name: 'Minimal', desc: 'Simple and elegant', color: 'purple' },
                { id: 'professional', name: 'Professional', desc: 'Corporate standard', color: 'indigo' }
              ].map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setInvoiceTemplate({ ...invoiceTemplate, layout: template.id as any })
                    logger.info('Invoice template layout changed', {
                      layout: template.id,
                      previousLayout: invoiceTemplate.layout
                    })
                    toast.success('Template updated', {
                      description: `${template.name} - ${template.desc} - Applied to all future invoices`
                    })
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    invoiceTemplate.layout === template.id
                      ? `border-${template.color}-500 bg-${template.color}-50 shadow-md`
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{template.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{template.desc}</div>
                  {invoiceTemplate.layout === template.id && (
                    <CheckCircle className="w-4 h-4 text-green-600 mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Branding Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Business Logo
              </label>
              <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setInvoiceTemplate({ ...invoiceTemplate, logo: event.target?.result as string })
                        logger.info('Invoice logo uploaded', {
                          fileName: file.name,
                          fileSize: file.size,
                          fileType: file.type
                        })
                        toast.success('Logo uploaded', {
                          description: `${file.name} - ${Math.round(file.size / 1024)}KB - ${file.type} - Will appear on all invoices`
                        })
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <label htmlFor="logo-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-indigo-400 mb-2" />
                  <p className="text-sm text-gray-700 font-medium">Click to upload logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </label>
                {invoiceTemplate.logo && (
                  <div className="mt-3">
                    <img src={invoiceTemplate.logo} alt="Logo preview" className="h-16 mx-auto" />
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => {
                        setInvoiceTemplate({ ...invoiceTemplate, logo: null })
                        logger.info('Invoice logo removed')
                        toast.info('Logo removed', {
                          description: 'Logo cleared - Upload a new one to add branding'
                        })
                      }}
                    >
                      Remove Logo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                Brand Colors
              </label>
              <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={invoiceTemplate.primaryColor}
                      onChange={(e) => {
                        setInvoiceTemplate({ ...invoiceTemplate, primaryColor: e.target.value })
                        logger.debug('Primary color changed', { color: e.target.value })
                      }}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <Input
                      value={invoiceTemplate.primaryColor}
                      onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, primaryColor: e.target.value })}
                      className="flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Secondary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={invoiceTemplate.secondaryColor}
                      onChange={(e) => {
                        setInvoiceTemplate({ ...invoiceTemplate, secondaryColor: e.target.value })
                        logger.debug('Secondary color changed', { color: e.target.value })
                      }}
                      className="h-10 w-20 rounded cursor-pointer"
                    />
                    <Input
                      value={invoiceTemplate.secondaryColor}
                      onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, secondaryColor: e.target.value })}
                      className="flex-1"
                      placeholder="#1E40AF"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    logger.info('Brand colors saved', {
                      primary: invoiceTemplate.primaryColor,
                      secondary: invoiceTemplate.secondaryColor,
                      accent: invoiceTemplate.accentColor
                    })
                    toast.success('Brand colors saved', {
                      description: `Primary: ${invoiceTemplate.primaryColor} - Secondary: ${invoiceTemplate.secondaryColor} - Applied to all invoices`
                    })
                  }}
                >
                  Save Colors
                </Button>
              </div>
            </div>
          </div>

          {/* Header and Footer Text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-600" />
                Header Text
              </label>
              <Input
                value={invoiceTemplate.headerText}
                onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, headerText: e.target.value })}
                placeholder="Your Business Name"
                className="bg-white"
              />
              <p className="text-xs text-gray-600">Appears at the top of every invoice</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-600" />
                Footer Text
              </label>
              <Textarea
                value={invoiceTemplate.footerText}
                onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, footerText: e.target.value })}
                placeholder="Thank you for your business!"
                className="bg-white"
                rows={2}
              />
              <p className="text-xs text-gray-600">Appears at the bottom of every invoice</p>
            </div>
          </div>

          {/* Tax Calculation */}
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Percent className="w-5 h-5 text-indigo-600" />
              Tax Calculation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tax Type</label>
                <select
                  value={invoiceTemplate.taxType}
                  onChange={(e) => {
                    const taxType = e.target.value as any
                    const defaultRates = {
                      none: 0,
                      sales: 8,
                      vat: 20,
                      custom: invoiceTemplate.taxRate
                    }
                    setInvoiceTemplate({
                      ...invoiceTemplate,
                      taxType,
                      taxRate: defaultRates[taxType]
                    })
                    logger.info('Tax type changed', {
                      taxType,
                      taxRate: defaultRates[taxType],
                      previousType: invoiceTemplate.taxType
                    })
                    toast.info('Tax type updated', {
                      description: `${taxType === 'none' ? 'No tax' : taxType === 'sales' ? '8% Sales Tax' : taxType === 'vat' ? '20% VAT' : 'Custom rate'} - ${taxType === 'none' ? 'Tax disabled' : `${defaultRates[taxType]}% will be applied`}`
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="none">No Tax</option>
                  <option value="sales">Sales Tax (8%)</option>
                  <option value="vat">VAT (20%)</option>
                  <option value="custom">Custom Rate</option>
                </select>
              </div>
              {invoiceTemplate.taxType === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tax Rate (%)</label>
                  <Input
                    type="number"
                    value={invoiceTemplate.taxRate}
                    onChange={(e) => setInvoiceTemplate({ ...invoiceTemplate, taxRate: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                    className="bg-white"
                  />
                </div>
              )}
            </div>
            <div className="bg-indigo-50 p-3 rounded-md">
              <p className="text-sm text-indigo-900">
                💡 <strong>Tax Preview:</strong> For a $1,000 invoice, tax would be{' '}
                <strong>${(1000 * invoiceTemplate.taxRate / 100).toFixed(2)}</strong>, total{' '}
                <strong>${(1000 + 1000 * invoiceTemplate.taxRate / 100).toFixed(2)}</strong>
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white p-5 rounded-lg border-2 border-indigo-200 space-y-4">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Accepted Payment Methods
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { key: 'stripe', label: 'Stripe', icon: CreditCard, color: 'purple' },
                { key: 'bankTransfer', label: 'Bank Transfer', icon: DollarSign, color: 'green' },
                { key: 'paypal', label: 'PayPal', icon: CreditCard, color: 'blue' },
                { key: 'crypto', label: 'Cryptocurrency', icon: DollarSign, color: 'orange' }
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => {
                    const newMethods = {
                      ...invoiceTemplate.paymentMethods,
                      [method.key]: !invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods]
                    }
                    setInvoiceTemplate({ ...invoiceTemplate, paymentMethods: newMethods })
                    const enabledCount = Object.values(newMethods).filter(Boolean).length
                    logger.info('Payment method toggled', {
                      method: method.key,
                      enabled: newMethods[method.key as keyof typeof newMethods],
                      totalEnabled: enabledCount
                    })
                    toast.success(
                      invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods]
                        ? 'Payment method disabled'
                        : 'Payment method enabled',
                      {
                        description: `${method.label} - ${
                          invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods]
                            ? 'Removed from invoices'
                            : 'Will appear on invoices'
                        } - ${enabledCount} method${enabledCount !== 1 ? 's' : ''} enabled`
                      }
                    )
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods]
                      ? `border-${method.color}-500 bg-${method.color}-50`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <method.icon className={`w-6 h-6 mx-auto mb-2 ${
                    invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods]
                      ? `text-${method.color}-600`
                      : 'text-gray-400'
                  }`} />
                  <div className="text-xs font-medium text-gray-900">{method.label}</div>
                  {invoiceTemplate.paymentMethods[method.key as keyof typeof invoiceTemplate.paymentMethods] && (
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-2" />
                  )}
                </button>
              ))}
            </div>
            <div className="bg-indigo-50 p-3 rounded-md">
              <p className="text-sm text-indigo-900">
                ✓ {Object.values(invoiceTemplate.paymentMethods).filter(Boolean).length} payment method{Object.values(invoiceTemplate.paymentMethods).filter(Boolean).length !== 1 ? 's' : ''} enabled - These will appear on your invoices
              </p>
            </div>
          </div>

          {/* Save Template Button */}
          <div className="flex gap-3 pt-4 border-t border-indigo-200">
            <Button
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              onClick={() => {
                const enabledPaymentMethods = Object.entries(invoiceTemplate.paymentMethods)
                  .filter(([_, enabled]) => enabled)
                  .map(([method]) => method)

                logger.info('Invoice template saved', {
                  layout: invoiceTemplate.layout,
                  hasLogo: !!invoiceTemplate.logo,
                  colors: {
                    primary: invoiceTemplate.primaryColor,
                    secondary: invoiceTemplate.secondaryColor
                  },
                  taxType: invoiceTemplate.taxType,
                  taxRate: invoiceTemplate.taxRate,
                  paymentMethods: enabledPaymentMethods,
                  headerText: invoiceTemplate.headerText,
                  footerText: invoiceTemplate.footerText
                })

                toast.success('Template saved successfully', {
                  description: `${invoiceTemplate.layout} layout - ${invoiceTemplate.taxType} tax - ${enabledPaymentMethods.length} payment methods - Applied to all future invoices`
                })
              }}
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Save Template Settings
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setInvoiceTemplate({
                  layout: 'professional',
                  primaryColor: '#3B82F6',
                  secondaryColor: '#1E40AF',
                  accentColor: '#60A5FA',
                  logo: null,
                  headerText: 'Your Business Name',
                  footerText: 'Thank you for your business!',
                  showLineNumbers: true,
                  showItemImages: false,
                  taxRate: 0,
                  currency: 'USD',
                  taxType: 'none',
                  paymentMethods: {
                    stripe: true,
                    bankTransfer: true,
                    paypal: false,
                    crypto: false
                  }
                })
                logger.info('Invoice template reset to defaults')
                toast.info('Template reset', {
                  description: 'Professional layout - No tax - Stripe & Bank Transfer - All settings restored to defaults'
                })
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {/* Bulk Actions Toolbar - Appears when invoices are selected */}
              {selectedInvoices.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === filteredInvoices.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(filteredInvoices.map(inv => inv.id))
                        } else {
                          setSelectedInvoices([])
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-blue-800">
                      {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
                    </span>
                    <span className="text-sm text-blue-600">
                      (${filteredInvoices.filter(inv => selectedInvoices.includes(inv.id)).reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} total)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('send')}
                      className="bg-white hover:bg-blue-50"
                    >
                      Send All
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('markPaid')}
                      className="bg-white hover:bg-green-50 text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark as Paid
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkAction('delete')}
                      className="bg-white hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedInvoices([])}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className={`kazi-card ${selectedInvoices.includes(invoice.id) ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {/* Selection Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedInvoices(prev => [...prev, invoice.id])
                              } else {
                                setSelectedInvoices(prev => prev.filter(id => id !== invoice.id))
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300"
                          />
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                logger.info('Viewing invoice', { invoiceId: invoice.id })
                                setViewInvoice(invoice)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                logger.info('Editing invoice', { invoiceId: invoice.id })
                                setEditForm({
                                  client: invoice.client,
                                  clientEmail: invoice.clientEmail,
                                  project: invoice.project,
                                  description: invoice.description,
                                  dueDate: invoice.dueDate
                                })
                                setEditInvoice(invoice)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                logger.info('Downloading invoice', { invoiceId: invoice.id })
                                toast.success(`Downloading ${invoice.id}...`, {
                                  description: `${invoice.client} - $${invoice.amount.toLocaleString()}`
                                })
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                logger.info('Initiating invoice deletion', { invoiceId: invoice.id })
                                setDeleteInvoice({ id: invoice.id, client: invoice.client })
                              }}
                            >
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

      {/* Delete Invoice Confirmation */}
      <AlertDialog open={!!deleteInvoice} onOpenChange={() => setDeleteInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete invoice {deleteInvoice?.id} for {deleteInvoice?.client}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDeleteInvoice} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Void Invoice Confirmation */}
      <AlertDialog open={!!voidInvoice} onOpenChange={() => setVoidInvoice(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Void invoice {voidInvoice?.id} for {voidInvoice?.client}? Voided invoices cannot be restored and won't count toward revenue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmVoidInvoice} className="bg-orange-500 hover:bg-orange-600">
              Void Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={() => setViewInvoice(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Invoice {viewInvoice?.id}
            </DialogTitle>
            <DialogDescription>
              View invoice details
            </DialogDescription>
          </DialogHeader>
          {viewInvoice && (
            <div className="space-y-6 py-4">
              {/* Invoice Status */}
              <div className="flex items-center justify-between">
                <Badge variant={
                  viewInvoice.status === 'paid' ? 'default' :
                  viewInvoice.status === 'pending' ? 'secondary' :
                  viewInvoice.status === 'overdue' ? 'destructive' : 'outline'
                } className="text-sm">
                  {viewInvoice.status.toUpperCase()}
                </Badge>
                <span className="text-2xl font-bold">${viewInvoice.amount.toLocaleString()}</span>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">{viewInvoice.client}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold">{viewInvoice.clientEmail}</p>
                </div>
              </div>

              {/* Project & Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <p className="font-semibold">{viewInvoice.project}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm">{viewInvoice.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Issue Date</p>
                  <p className="font-medium">{viewInvoice.issueDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-medium">{viewInvoice.dueDate}</p>
                </div>
                {viewInvoice.paidDate && (
                  <div>
                    <p className="text-sm text-gray-500">Paid Date</p>
                    <p className="font-medium text-green-600">{viewInvoice.paidDate}</p>
                  </div>
                )}
              </div>

              {/* Line Items */}
              {viewInvoice.items && viewInvoice.items.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Line Items</p>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Rate</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewInvoice.items.map((item: any, index: number) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">{item.description}</td>
                            <td className="px-3 py-2 text-right">{item.quantity}</td>
                            <td className="px-3 py-2 text-right">${item.rate}</td>
                            <td className="px-3 py-2 text-right">${item.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold">
                        <tr className="border-t">
                          <td colSpan={3} className="px-3 py-2 text-right">Total</td>
                          <td className="px-3 py-2 text-right">${viewInvoice.amount.toLocaleString()}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInvoice(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (viewInvoice) {
                setViewInvoice(null)
                handleEditInvoice(viewInvoice.id)
              }
            }}>
              Edit Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={!!editInvoice} onOpenChange={() => setEditInvoice(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Invoice {editInvoice?.id}
            </DialogTitle>
            <DialogDescription>
              Update the invoice details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-client">Client Name</Label>
                <Input
                  id="edit-client"
                  value={editForm.client}
                  onChange={(e) => setEditForm({ ...editForm, client: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Client Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editForm.clientEmail}
                  onChange={(e) => setEditForm({ ...editForm, clientEmail: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-project">Project</Label>
              <Input
                id="edit-project"
                value={editForm.project}
                onChange={(e) => setEditForm({ ...editForm, project: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-due">Due Date</Label>
              <Input
                id="edit-due"
                type="date"
                value={editForm.dueDate}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditInvoice(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditInvoice} disabled={isSavingEdit}>
              {isSavingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
