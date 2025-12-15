'use client'

import { useState, useEffect } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ProgressCard,
  ActivityFeed,
  MiniKPI,
  ComparisonCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  FileText,
  Plus,
  Search,
  Download,
  Send,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Settings,
  Filter,
  Eye,
  Trash2
} from 'lucide-react'
import { useInvoices } from '@/lib/hooks/use-invoices'
import { createInvoice, deleteInvoice, markInvoicePaid, sendInvoice } from '@/app/actions/invoices'

interface InvoicingClientProps {
  initialInvoices: any[]
  initialStats: {
    total: number
    paid: number
    pending: number
    overdue: number
    totalRevenue: number
    pendingAmount: number
  }
}

export default function InvoicingClient({ initialInvoices, initialStats }: InvoicingClientProps) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddInvoice, setShowAddInvoice] = useState(false)
  const [newInvoice, setNewInvoice] = useState({
    invoice_number: '',
    client_name: '',
    amount: '',
    due_date: ''
  })

  const { invoices, stats, refetch } = useInvoices()
  const displayInvoices = invoices.length > 0 ? invoices : initialInvoices
  const displayStats = stats?.total > 0 ? stats : initialStats

  const filteredInvoices = displayInvoices.filter(invoice => {
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'paid' && invoice.status === 'paid') ||
      (selectedFilter === 'pending' && (invoice.status === 'pending' || invoice.status === 'sent')) ||
      (selectedFilter === 'overdue' && invoice.status === 'overdue')
    const matchesSearch = invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client_name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const statsDisplay = [
    { label: 'Total Revenue', value: `$${(displayStats.totalRevenue / 1000).toFixed(1)}K`, change: 15.2, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Pending', value: `$${(displayStats.pendingAmount / 1000).toFixed(1)}K`, change: 8.3, icon: <Clock className="w-5 h-5" /> },
    { label: 'Paid Invoices', value: String(displayStats.paid), change: 12.5, icon: <CheckCircle2 className="w-5 h-5" /> },
    { label: 'Collection Rate', value: displayStats.total > 0 ? `${Math.round((displayStats.paid / displayStats.total) * 100)}%` : '0%', change: 5.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const recentActivity = displayInvoices.slice(0, 4).map(inv => ({
    icon: inv.status === 'paid' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />,
    title: inv.invoice_number || 'Invoice',
    description: `$${(inv.total_amount || inv.amount || 0).toLocaleString()} - ${inv.status}`,
    time: new Date(inv.updated_at || inv.created_at).toLocaleDateString(),
    status: inv.status === 'paid' ? 'success' as const : inv.status === 'overdue' ? 'warning' as const : 'info' as const
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': case 'sent': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'draft': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCreateInvoice = async () => {
    if (!newInvoice.invoice_number.trim() || !newInvoice.amount) return
    try {
      await createInvoice({
        invoice_number: newInvoice.invoice_number,
        amount: parseFloat(newInvoice.amount),
        due_date: newInvoice.due_date || undefined,
        status: 'draft'
      })
      setNewInvoice({ invoice_number: '', client_name: '', amount: '', due_date: '' })
      setShowAddInvoice(false)
      refetch()
    } catch (error) {
      console.error('Error creating invoice:', error)
    }
  }

  const handleDeleteInvoice = async (id: string) => {
    try {
      await deleteInvoice(id)
      refetch()
    } catch (error) {
      console.error('Error deleting invoice:', error)
    }
  }

  const handleMarkPaid = async (id: string) => {
    try {
      await markInvoicePaid(id)
      refetch()
    } catch (error) {
      console.error('Error marking invoice paid:', error)
    }
  }

  const handleSendInvoice = async (id: string) => {
    try {
      await sendInvoice(id)
      refetch()
    } catch (error) {
      console.error('Error sending invoice:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-emerald-950 dark:via-teal-950/30 dark:to-cyan-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-600" />
              Invoicing
            </h1>
            <p className="text-muted-foreground">Manage invoices and track payments</p>
          </div>
          <div className="flex items-center gap-3">
            <IconButton icon={<Filter />} ariaLabel="Filter" variant="ghost" size="md" />
            <IconButton icon={<Settings />} ariaLabel="Settings" variant="ghost" size="md" />
            <GradientButton from="emerald" to="teal" onClick={() => setShowAddInvoice(true)}>
              <Plus className="w-5 h-5 mr-2" />
              New Invoice
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statsDisplay} />

        {/* Add Invoice Form */}
        {showAddInvoice && (
          <BentoCard className="p-6">
            <h3 className="text-xl font-semibold mb-4">Create New Invoice</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newInvoice.invoice_number}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, invoice_number: e.target.value }))}
                placeholder="Invoice number *"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <input
                type="number"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount *"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                value={newInvoice.due_date}
                onChange={(e) => setNewInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2">
                <ModernButton variant="primary" onClick={handleCreateInvoice}>Create</ModernButton>
                <ModernButton variant="ghost" onClick={() => setShowAddInvoice(false)}>Cancel</ModernButton>
              </div>
            </div>
          </BentoCard>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus className="w-6 h-6" />} title="Create Invoice" description="New invoice" onClick={() => setShowAddInvoice(true)} />
          <BentoQuickAction icon={<Send className="w-6 h-6" />} title="Send Reminders" description="Pending invoices" onClick={() => console.log('Reminders')} />
          <BentoQuickAction icon={<Download className="w-6 h-6" />} title="Export Report" description="Financial data" onClick={() => console.log('Export')} />
          <BentoQuickAction icon={<Settings className="w-6 h-6" />} title="Settings" description="Configure" onClick={() => window.location.href = '/dashboard/settings-v2'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>All</PillButton>
                <PillButton variant={selectedFilter === 'paid' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('paid')}>Paid</PillButton>
                <PillButton variant={selectedFilter === 'pending' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('pending')}>Pending</PillButton>
                <PillButton variant={selectedFilter === 'overdue' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('overdue')}>Overdue</PillButton>
              </div>
            </div>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Invoices</h3>
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
                  <ModernButton variant="primary" onClick={() => setShowAddInvoice(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </ModernButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{invoice.invoice_number}</h4>
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(invoice.status)}`}>
                              {invoice.status}
                            </span>
                          </div>
                          {invoice.client_name && (
                            <p className="text-sm text-muted-foreground mb-2">{invoice.client_name}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${(invoice.total_amount || invoice.amount || 0).toLocaleString()}
                            </div>
                            {invoice.due_date && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due {new Date(invoice.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          {invoice.status !== 'paid' && (
                            <>
                              <ModernButton variant="outline" size="sm" onClick={() => handleSendInvoice(invoice.id)}>
                                <Send className="w-3 h-3 mr-1" />
                                Send
                              </ModernButton>
                              <ModernButton variant="outline" size="sm" onClick={() => handleMarkPaid(invoice.id)}>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mark Paid
                              </ModernButton>
                            </>
                          )}
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            ariaLabel="Delete"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvoice(invoice.id)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Monthly Revenue Goal"
              current={displayStats.totalRevenue}
              goal={50000}
              unit="$"
              icon={<DollarSign className="w-5 h-5" />}
            />

            <ComparisonCard
              title="Payment Status"
              leftLabel="Paid"
              leftValue={`$${(displayStats.totalRevenue / 1000).toFixed(1)}K`}
              rightLabel="Pending"
              rightValue={`$${(displayStats.pendingAmount / 1000).toFixed(1)}K`}
              icon={<DollarSign className="w-5 h-5" />}
            />

            {recentActivity.length > 0 && (
              <ActivityFeed title="Recent Activity" activities={recentActivity} />
            )}

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Invoice Value" value={displayStats.total > 0 ? `$${((displayStats.totalRevenue + displayStats.pendingAmount) / displayStats.total / 1000).toFixed(1)}K` : '$0'} change={12.5} />
                <MiniKPI label="Payment Time" value="8.5 days" change={-15.2} />
                <MiniKPI label="Overdue Rate" value={displayStats.total > 0 ? `${Math.round((displayStats.overdue / displayStats.total) * 100)}%` : '0%'} change={-8.3} />
                <MiniKPI label="Total Invoices" value={String(displayStats.total)} change={5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
