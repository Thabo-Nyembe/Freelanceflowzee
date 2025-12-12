"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  FileText,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Send,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  CreditCard,
  Users
} from 'lucide-react'

/**
 * Invoices V2 - Invoice Management System
 * Manages invoices, payments, and billing
 */
export default function InvoicesV2() {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'draft'>('all')

  const stats = [
    { label: 'Total Invoices', value: '8,473', change: 18.4, icon: <FileText className="w-5 h-5" /> },
    { label: 'Total Billed', value: '$2.4M', change: 32.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Outstanding', value: '$247K', change: -12.3, icon: <AlertCircle className="w-5 h-5" /> },
    { label: 'Paid This Month', value: '$847K', change: 24.5, icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const invoices = [
    {
      id: 'INV-2024-0847',
      client: 'Acme Corporation',
      email: 'billing@acme.com',
      avatar: 'AC',
      amount: 12500,
      status: 'paid',
      issueDate: '2024-02-01',
      dueDate: '2024-02-15',
      paidDate: '2024-02-10',
      items: 5,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'INV-2024-0846',
      client: 'TechStart Inc',
      email: 'accounts@techstart.com',
      avatar: 'TS',
      amount: 8950,
      status: 'pending',
      issueDate: '2024-02-05',
      dueDate: '2024-02-19',
      paidDate: null,
      items: 3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'INV-2024-0845',
      client: 'Global Solutions',
      email: 'finance@global.com',
      avatar: 'GS',
      amount: 24750,
      status: 'overdue',
      issueDate: '2024-01-20',
      dueDate: '2024-02-03',
      paidDate: null,
      items: 8,
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'INV-2024-0844',
      client: 'Innovation Labs',
      email: 'billing@innovation.com',
      avatar: 'IL',
      amount: 15200,
      status: 'paid',
      issueDate: '2024-02-02',
      dueDate: '2024-02-16',
      paidDate: '2024-02-12',
      items: 6,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'INV-2024-0843',
      client: 'DataViz Pro',
      email: 'accounts@dataviz.com',
      avatar: 'DV',
      amount: 6780,
      status: 'pending',
      issueDate: '2024-02-07',
      dueDate: '2024-02-21',
      paidDate: null,
      items: 2,
      color: 'from-cyan-500 to-teal-500'
    },
    {
      id: 'INV-2024-0842',
      client: 'Creative Agency',
      email: 'billing@creative.com',
      avatar: 'CA',
      amount: 18900,
      status: 'paid',
      issueDate: '2024-01-25',
      dueDate: '2024-02-08',
      paidDate: '2024-02-05',
      items: 7,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: 'INV-2024-0841',
      client: 'Enterprise Co',
      email: 'payments@enterprise.com',
      avatar: 'EC',
      amount: 32450,
      status: 'overdue',
      issueDate: '2024-01-15',
      dueDate: '2024-01-29',
      paidDate: null,
      items: 12,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'INV-2024-0840',
      client: 'StartupX',
      email: 'finance@startupx.com',
      avatar: 'SX',
      amount: 4250,
      status: 'draft',
      issueDate: null,
      dueDate: null,
      paidDate: null,
      items: 3,
      color: 'from-gray-500 to-gray-400'
    }
  ]

  const topClients = [
    { rank: 1, name: 'Enterprise Co', avatar: 'EC', value: '$124K', change: 42.3 },
    { rank: 2, name: 'Acme Corporation', avatar: 'AC', value: '$98K', change: 32.1 },
    { rank: 3, name: 'Global Solutions', avatar: 'GS', value: '$87K', change: 28.7 },
    { rank: 4, name: 'Innovation Labs', avatar: 'IL', value: '$76K', change: 24.5 },
    { rank: 5, name: 'TechStart Inc', avatar: 'TS', value: '$64K', change: 18.9 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Invoice INV-2024-0847 paid', time: '10m ago', type: 'success' as const },
    { icon: <Send className="w-4 h-4" />, title: 'Invoice INV-2024-0846 sent', time: '1h ago', type: 'info' as const },
    { icon: <AlertCircle className="w-4 h-4" />, title: 'Payment reminder sent', time: '3h ago', type: 'warning' as const },
    { icon: <FileText className="w-4 h-4" />, title: 'New invoice created', time: '5h ago', type: 'info' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Paid' }
      case 'pending':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'Pending' }
      case 'overdue':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: <AlertCircle className="w-3 h-3" />, label: 'Overdue' }
      case 'draft':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <FileText className="w-3 h-3" />, label: 'Draft' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <FileText className="w-3 h-3" />, label: status }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-600" />
              Invoices
            </h1>
            <p className="text-muted-foreground">Manage invoices, payments, and billing</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => console.log('Create invoice')}>
            <FileText className="w-5 h-5 mr-2" />
            New Invoice
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<CheckCircle />} title="Paid" description="Completed" onClick={() => setSelectedStatus('paid')} />
          <BentoQuickAction icon={<Clock />} title="Pending" description="Awaiting" onClick={() => setSelectedStatus('pending')} />
          <BentoQuickAction icon={<AlertCircle />} title="Overdue" description="Past due" onClick={() => setSelectedStatus('overdue')} />
          <BentoQuickAction icon={<FileText />} title="Draft" description="Not sent" onClick={() => setSelectedStatus('draft')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedStatus === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('all')}>
            All Invoices
          </PillButton>
          <PillButton variant={selectedStatus === 'paid' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('paid')}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Paid
          </PillButton>
          <PillButton variant={selectedStatus === 'pending' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('pending')}>
            <Clock className="w-4 h-4 mr-2" />
            Pending
          </PillButton>
          <PillButton variant={selectedStatus === 'overdue' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('overdue')}>
            <AlertCircle className="w-4 h-4 mr-2" />
            Overdue
          </PillButton>
          <PillButton variant={selectedStatus === 'draft' ? 'primary' : 'ghost'} onClick={() => setSelectedStatus('draft')}>
            <FileText className="w-4 h-4 mr-2" />
            Draft
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Invoice List</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {invoices.map((invoice) => {
                  const statusBadge = getStatusBadge(invoice.status)

                  return (
                    <div key={invoice.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${invoice.color} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                              {invoice.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{invoice.id}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{invoice.client}</p>
                              <p className="text-xs text-muted-foreground">{invoice.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-emerald-600">${(invoice.amount / 1000).toFixed(1)}K</p>
                            <p className="text-xs text-muted-foreground">{invoice.items} items</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground mb-1">Issue Date</p>
                            <p className="font-semibold">{invoice.issueDate || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Due Date</p>
                            <p className="font-semibold">{invoice.dueDate || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Paid Date</p>
                            <p className="font-semibold">{invoice.paidDate || 'Not paid'}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Amount</p>
                            <p className="font-semibold text-emerald-600">${invoice.amount.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <ModernButton variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </ModernButton>
                          <ModernButton variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </ModernButton>
                          {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                            <ModernButton variant="primary" size="sm">
                              <Send className="w-3 h-3 mr-1" />
                              Send Reminder
                            </ModernButton>
                          ) : invoice.status === 'draft' ? (
                            <ModernButton variant="primary" size="sm">
                              <Send className="w-3 h-3 mr-1" />
                              Send Invoice
                            </ModernButton>
                          ) : null}
                          <ModernButton variant="ghost" size="sm">
                            <MoreVertical className="w-3 h-3" />
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Paid</p>
                  </div>
                  <p className="text-2xl font-bold">4,247</p>
                  <p className="text-xs text-green-600 mt-1">$1.8M collected</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Pending</p>
                  </div>
                  <p className="text-2xl font-bold">2,134</p>
                  <p className="text-xs text-blue-600 mt-1">$423K awaiting</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm font-medium">Overdue</p>
                  </div>
                  <p className="text-2xl font-bold">892</p>
                  <p className="text-xs text-red-600 mt-1">$247K past due</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <p className="text-sm font-medium">Draft</p>
                  </div>
                  <p className="text-2xl font-bold">1,200</p>
                  <p className="text-xs text-gray-600 mt-1">Not yet sent</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="💰 Top Clients" items={topClients} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Invoice Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Invoices" value="8,473" change={18.4} />
                <MiniKPI label="Total Billed" value="$2.4M" change={32.7} />
                <MiniKPI label="Outstanding" value="$247K" change={-12.3} />
                <MiniKPI label="Paid This Month" value="$847K" change={24.5} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Collection Goal"
              value={1800}
              target={2000}
              label="K collected this month"
              color="from-emerald-500 to-teal-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Status</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Paid</span>
                    </div>
                    <span className="text-xs font-semibold">4,247 (50%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '50%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-xs font-semibold">2,134 (25%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '25%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm">Draft</span>
                    </div>
                    <span className="text-xs font-semibold">1,200 (14%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-gray-500 to-gray-400" style={{ width: '14%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Overdue</span>
                    </div>
                    <span className="text-xs font-semibold">892 (11%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: '11%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
