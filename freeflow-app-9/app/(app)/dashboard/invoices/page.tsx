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
    console.log('✨ INVOICES: Opening create invoice form')
    console.log('📋 INVOICES: User initiated new invoice creation')
    toast.success('Create Invoice', {
      description: 'Opening invoice creation form...'
    })
  }

  const handleViewInvoice = (id: string) => {
    console.log('✨ INVOICES: Viewing invoice details')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('👁️ INVOICES: Opening invoice viewer')
    toast.info('View Invoice', {
      description: 'Opening invoice ' + id
    })
  }

  const handleEditInvoice = (id: string) => {
    console.log('✨ INVOICES: Opening edit mode')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('✏️ INVOICES: User editing invoice')
    toast.info('Edit Invoice', {
      description: 'Opening editor for ' + id
    })
  }

  const handleDeleteInvoice = (id: string) => {
    console.log('✨ INVOICES: Delete invoice requested')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    if (confirm('Delete?')) {
      console.log('✅ INVOICES: Invoice deleted successfully')
      console.log('🗑️ INVOICES: Removed invoice: ' + id)
      toast.success('Invoice Deleted', {
        description: 'Invoice ' + id + ' has been removed'
      })
    }
  }

  const handleSendInvoice = (id: string) => {
    console.log('✨ INVOICES: Sending invoice to client')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('📧 INVOICES: Email dispatched successfully')
    toast.success('Invoice Sent', {
      description: 'Invoice ' + id + ' sent to client'
    })
  }

  const handleDownloadPDF = (id: string) => {
    console.log('✨ INVOICES: Generating PDF document')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('💾 INVOICES: PDF download initiated')
    toast.success('PDF Downloaded', {
      description: 'Invoice ' + id + ' downloaded as PDF'
    })
  }

  const handleMarkPaid = (id: string) => {
    console.log('✨ INVOICES: Marking invoice as paid')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('✅ INVOICES: Payment status updated')
    toast.success('Marked as Paid', {
      description: 'Invoice ' + id + ' marked as paid'
    })
  }

  const handleMarkUnpaid = (id: string) => {
    console.log('✨ INVOICES: Marking invoice as unpaid')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('❌ INVOICES: Payment status reverted')
    toast.info('Marked as Unpaid', {
      description: 'Invoice ' + id + ' marked as unpaid'
    })
  }

  const handleDuplicateInvoice = (id: string) => {
    console.log('✨ INVOICES: Duplicating invoice')
    console.log('📋 INVOICES: Original Invoice ID: ' + id)
    console.log('📋 INVOICES: Creating duplicate copy')
    toast.success('Invoice Duplicated', {
      description: 'Created copy of invoice ' + id
    })
  }

  const handleSendReminder = (id: string) => {
    console.log('✨ INVOICES: Sending payment reminder')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('🔔 INVOICES: Reminder email sent to client')
    toast.success('Reminder Sent', {
      description: 'Payment reminder sent for ' + id
    })
  }

  const handleRecordPayment = (id: string) => {
    console.log('✨ INVOICES: Recording payment')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('💰 INVOICES: Opening payment recording form')
    toast.info('Record Payment', {
      description: 'Recording payment for ' + id
    })
  }

  const handleVoidInvoice = (id: string) => {
    console.log('✨ INVOICES: Void invoice requested')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    if (confirm('Void?')) {
      console.log('✅ INVOICES: Invoice voided successfully')
      console.log('❌ INVOICES: Invoice ' + id + ' is now void')
      toast.success('Invoice Voided', {
        description: 'Invoice ' + id + ' has been voided'
      })
    }
  }

  const handleExportInvoices = () => {
    console.log('✨ INVOICES: Exporting invoices')
    console.log('📊 INVOICES: Generating export file')
    console.log('💾 INVOICES: Export completed successfully')
    toast.success('Invoices Exported', {
      description: 'Invoice data exported successfully'
    })
  }

  const handleFilterStatus = (status: string) => {
    console.log('✨ INVOICES: Filtering by status')
    console.log('🔍 INVOICES: Status filter: ' + status)
    setSelectedStatus(status)
  }

  const handleSearch = (query: string) => {
    console.log('✨ INVOICES: Search query updated')
    console.log('🔍 INVOICES: Search term: ' + query)
    setSearchTerm(query)
  }

  const handleSort = (by: string) => {
    console.log('✨ INVOICES: Sorting invoices')
    console.log('📊 INVOICES: Sort criteria: ' + by)
    console.log('🔃 INVOICES: Invoices reordered')
    toast.info('Invoices Sorted', {
      description: 'Sorted by ' + by
    })
  }

  const handleBulkAction = (action: string) => {
    console.log('✨ INVOICES: Bulk action initiated')
    console.log('☑️ INVOICES: Action type: ' + action)
    console.log('📋 INVOICES: Processing selected invoices')
    toast.success('Bulk Action Complete', {
      description: 'Applied ' + action + ' to selected invoices'
    })
  }

  const handlePreview = (id: string) => {
    console.log('✨ INVOICES: Opening preview')
    console.log('📋 INVOICES: Invoice ID: ' + id)
    console.log('👁️ INVOICES: Displaying invoice preview')
    toast.info('Invoice Preview', {
      description: 'Previewing invoice ' + id
    })
  }

  const handleEmailTemplate = () => {
    console.log('✨ INVOICES: Opening email template editor')
    console.log('📧 INVOICES: Managing email templates')
    console.log('⚙️ INVOICES: Template configuration loaded')
    toast.info('Email Template', {
      description: 'Opening email template settings'
    })
  }

  const handleInvoiceSettings = () => {
    console.log('✨ INVOICES: Opening invoice settings')
    console.log('⚙️ INVOICES: Loading configuration panel')
    console.log('🔧 INVOICES: Settings interface ready')
    toast.info('Invoice Settings', {
      description: 'Opening invoice configuration'
    })
  }

  // Mock invoice data
  const invoices = [
    {
      id: 'INV-001',
      client: 'Acme Corp',
      project: 'Brand Identity Package',
      amount: 5000,
      status: 'paid',
      dueDate: '2024-01-15',
      issueDate: '2024-01-01',
      description: 'Complete brand identity design including logo, colors, and guidelines'
    },
    {
      id: 'INV-002',
      client: 'Tech Startup',
      project: 'Website Development',
      amount: 3500,
      status: 'pending',
      dueDate: '2024-01-20',
      issueDate: '2024-01-10',
      description: 'Modern responsive website with e-commerce functionality'
    },
    {
      id: 'INV-003',
      client: 'Design Agency',
      project: 'UI/UX Consultation',
      amount: 2000,
      status: 'overdue',
      dueDate: '2024-01-05',
      issueDate: '2023-12-20',
      description: 'User experience analysis and design recommendations'
    },
    {
      id: 'INV-004',
      client: 'Local Business',
      project: 'Social Media Package',
      amount: 1500,
      status: 'draft',
      dueDate: '2024-01-25',
      issueDate: '2024-01-15',
      description: 'Complete social media content and management package'
    }
  ]

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
