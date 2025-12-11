"use client"

import { useState } from 'react'
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
  Copy
} from 'lucide-react'

/**
 * Invoicing V2 - Groundbreaking Financial Management
 * Showcases invoicing with modern components
 */
export default function InvoicingV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'paid' | 'pending'>('all')

  // Sample invoices
  const invoices = [
    {
      id: 'INV-001',
      client: 'Acme Corp',
      amount: 12500,
      status: 'paid',
      dueDate: '2025-01-10',
      paidDate: '2025-01-08'
    },
    {
      id: 'INV-002',
      client: 'TechStart Inc',
      amount: 8400,
      status: 'pending',
      dueDate: '2025-01-20',
      paidDate: null
    },
    {
      id: 'INV-003',
      client: 'GreenLeaf Co',
      amount: 15600,
      status: 'paid',
      dueDate: '2025-01-05',
      paidDate: '2025-01-04'
    },
    {
      id: 'INV-004',
      client: 'FinanceHub',
      amount: 9200,
      status: 'overdue',
      dueDate: '2025-01-01',
      paidDate: null
    }
  ]

  const paidTotal = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const pendingTotal = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

  const stats = [
    {
      label: 'Total Revenue',
      value: `$${(paidTotal / 1000).toFixed(1)}K`,
      change: 15.2,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Pending',
      value: `$${(pendingTotal / 1000).toFixed(1)}K`,
      change: 8.3,
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Paid Invoices',
      value: invoices.filter(i => i.status === 'paid').length.toString(),
      change: 12.5,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Collection Rate',
      value: '94%',
      change: 5.7,
      icon: <TrendingUp className="w-5 h-5" />
    }
  ]

  const recentActivity = [
    {
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Payment received',
      description: 'INV-001 - $12,500 from Acme Corp',
      time: '2 hours ago',
      status: 'success' as const
    },
    {
      icon: <Send className="w-5 h-5" />,
      title: 'Invoice sent',
      description: 'INV-002 sent to TechStart Inc',
      time: '5 hours ago',
      status: 'info' as const
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Payment overdue',
      description: 'INV-004 from FinanceHub',
      time: '1 day ago',
      status: 'warning' as const
    },
    {
      icon: <Plus className="w-5 h-5" />,
      title: 'Invoice created',
      description: 'New invoice for GreenLeaf Co',
      time: '2 days ago',
      status: 'info' as const
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:from-emerald-950 dark:via-teal-950/30 dark:to-cyan-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <FileText className="w-10 h-10 text-emerald-600" />
              Invoicing
            </h1>
            <p className="text-muted-foreground">
              Manage invoices and track payments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<Filter />}
              ariaLabel="Filter"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
            <GradientButton
              from="emerald"
              to="teal"
              onClick={() => console.log('New invoice')}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Invoice
            </GradientButton>
          </div>
        </div>

        {/* Stats */}
        <StatGrid columns={4} stats={stats} />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction
            icon={<Plus className="w-6 h-6" />}
            title="Create Invoice"
            description="New invoice"
            onClick={() => console.log('Create')}
          />
          <BentoQuickAction
            icon={<Send className="w-6 h-6" />}
            title="Send Reminders"
            description="Pending invoices"
            onClick={() => console.log('Reminders')}
          />
          <BentoQuickAction
            icon={<Download className="w-6 h-6" />}
            title="Export Report"
            description="Financial data"
            onClick={() => console.log('Export')}
          />
          <BentoQuickAction
            icon={<Settings className="w-6 h-6" />}
            title="Settings"
            description="Configure"
            onClick={() => console.log('Settings')}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoices List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <PillButton
                  variant={selectedFilter === 'all' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </PillButton>
                <PillButton
                  variant={selectedFilter === 'paid' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedFilter('paid')}
                >
                  Paid
                </PillButton>
                <PillButton
                  variant={selectedFilter === 'pending' ? 'primary' : 'ghost'}
                  onClick={() => setSelectedFilter('pending')}
                >
                  Pending
                </PillButton>
              </div>
            </div>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{invoice.id}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{invoice.client}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${invoice.amount.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Due {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('View', invoice.id)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </ModernButton>
                        <ModernButton
                          variant="outline"
                          size="sm"
                          onClick={() => console.log('Download', invoice.id)}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            <ProgressCard
              title="Monthly Revenue Goal"
              current={paidTotal}
              goal={50000}
              unit="$"
              icon={<DollarSign className="w-5 h-5" />}
            />

            {/* Comparison */}
            <ComparisonCard
              title="Payment Status"
              leftLabel="Paid"
              leftValue={`$${(paidTotal / 1000).toFixed(1)}K`}
              rightLabel="Pending"
              rightValue={`$${(pendingTotal / 1000).toFixed(1)}K`}
              icon={<DollarSign className="w-5 h-5" />}
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Quick Stats */}
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg. Invoice Value" value="$11.2K" change={12.5} />
                <MiniKPI label="Payment Time" value="8.5 days" change={-15.2} />
                <MiniKPI label="Dispute Rate" value="2%" change={-8.3} />
                <MiniKPI label="Late Payments" value="6%" change={-5.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
