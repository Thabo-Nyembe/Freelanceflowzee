'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  MOCK_INVOICES,
  MOCK_PAYMENTS,
  MOCK_INVOICE_TEMPLATES,
  MOCK_BILLING_STATS,
  formatCurrency,
  getInvoiceStatusColor,
  getPaymentStatusColor,
  getPaymentMethodIcon,
  getDaysUntilDue,
  getDaysOverdue,
  getBillingCycleLabel,
  isInvoiceOverdue
} from '@/lib/invoice-utils'
import {
  Invoice,
  InvoiceStatus,
  Payment,
  InvoiceTemplate,
  BillingCycle
} from '@/lib/invoice-types'

// A+++ UTILITIES
import { CardSkeleton, DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

type ViewMode = 'overview' | 'invoices' | 'payments' | 'templates' | 'create'

export default function InvoicingPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedInvoices, setSelectedInvoices] = useState<Invoice[]>(MOCK_INVOICES)
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'all'>('all')

  // A+++ LOAD INVOICING DATA
  useEffect(() => {
    const loadInvoicingData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(null)
          }, 500) // Reduced from 1000ms to 500ms for faster loading
        })

        setIsLoading(false)
        announce('Invoicing dashboard loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoicing data')
        setIsLoading(false)
        announce('Error loading invoicing dashboard', 'assertive')
      }
    }

    loadInvoicingData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'invoices', label: 'Invoices', icon: '📄' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'create', label: 'Create Invoice', icon: '➕' }
  ]

  const statusOptions: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']

  const filteredInvoices = filterStatus === 'all'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(inv => inv.status === filterStatus)

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(MOCK_BILLING_STATS.totalRevenue)}
                </div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-xs text-muted-foreground">
              All time earnings
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Pending</div>
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(MOCK_BILLING_STATS.pendingAmount)}
                </div>
              </div>
              <div className="text-2xl">⏳</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {MOCK_BILLING_STATS.pendingInvoices} invoices
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Overdue</div>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(MOCK_BILLING_STATS.overdueAmount)}
                </div>
              </div>
              <div className="text-2xl">🚨</div>
            </div>
            <div className="text-xs text-red-500">
              {MOCK_BILLING_STATS.overdueInvoices} invoices
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Avg Invoice</div>
                <div className="text-2xl font-bold text-purple-500">
                  {formatCurrency(MOCK_BILLING_STATS.averageInvoiceValue)}
                </div>
              </div>
              <div className="text-2xl">📈</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Average value
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Revenue by Month</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {MOCK_BILLING_STATS.revenueByMonth.map((data, index) => {
                const maxRevenue = Math.max(...MOCK_BILLING_STATS.revenueByMonth.map(d => d.revenue))
                const height = (data.revenue / maxRevenue) * 100
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full rounded-t-lg bg-gradient-to-t from-green-600 to-emerald-400 relative group cursor-pointer"
                    >
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                        <div className="font-bold">{formatCurrency(data.revenue)}</div>
                        <div className="text-xs text-gray-300">{data.month}</div>
                      </div>
                    </motion.div>
                    <div className="text-xs text-muted-foreground">{data.month}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-6">Top Clients</h3>
            <div className="space-y-4">
              {MOCK_BILLING_STATS.revenueByClient.slice(0, 5).map((client, index) => (
                <div key={client.clientId} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{client.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(client.revenue)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(client.revenue / MOCK_BILLING_STATS.totalRevenue) * 100}%` }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Recent Invoices */}
      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Invoices</h3>
          <div className="space-y-3">
            {MOCK_INVOICES.slice(0, 5).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-semibold">{invoice.invoiceNumber}</div>
                    <div className="text-sm text-muted-foreground">{invoice.clientName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(invoice.total)}</div>
                    <div className="text-xs text-muted-foreground">
                      Due: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${getInvoiceStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Filter Bar */}
      <LiquidGlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | 'all')}
                className="px-4 py-2 rounded-lg border bg-background text-sm"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                Export CSV
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
                + New Invoice
              </button>
            </div>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const daysUntilDue = getDaysUntilDue(invoice.dueDate)
          const daysOverdue = getDaysOverdue(invoice.dueDate)

          return (
            <LiquidGlassCard key={invoice.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{invoice.invoiceNumber}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getInvoiceStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                      {invoice.recurringConfig?.enabled && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                          🔄 {getBillingCycleLabel(invoice.recurringConfig.cycle)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3">
                      {invoice.clientName} • {invoice.clientEmail}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Issue Date:</span>
                        <div className="font-medium">{new Date(invoice.issueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Due Date:</span>
                        <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-medium">
                          {invoice.status === 'overdue' && (
                            <span className="text-red-500">🚨 {daysOverdue} days overdue</span>
                          )}
                          {invoice.status === 'sent' && daysUntilDue > 0 && (
                            <span className="text-blue-500">Due in {daysUntilDue} days</span>
                          )}
                          {invoice.status === 'paid' && invoice.paidDate && (
                            <span className="text-green-500">Paid on {new Date(invoice.paidDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-500 mb-2">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Subtotal: {formatCurrency(invoice.subtotal)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tax: {formatCurrency(invoice.taxAmount)}
                    </div>
                    {invoice.discount > 0 && (
                      <div className="text-sm text-green-500">
                        Discount: -{formatCurrency(invoice.discount)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm font-semibold mb-3">Items ({invoice.items.length})</div>
                  <div className="space-y-2">
                    {invoice.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex-1">
                          <span className="font-medium">{item.description}</span>
                          <span className="text-muted-foreground ml-2">
                            × {item.quantity}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(item.total)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.unitPrice)} each
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                    {invoice.status === 'draft' && (
                      <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Send Invoice
                      </button>
                    )}
                    {invoice.status === 'overdue' && (
                      <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Send Reminder
                      </button>
                    )}
                    <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                      Download PDF
                    </button>
                    <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                      Duplicate
                    </button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      {/* Payment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Payments</div>
            <div className="text-3xl font-bold text-green-500">
              {formatCurrency(MOCK_BILLING_STATS.paidAmount)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {MOCK_BILLING_STATS.paidInvoices} transactions
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
            <div className="text-3xl font-bold text-blue-500">
              {MOCK_BILLING_STATS.paymentSuccessRate.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Payment success
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Avg Payment Time</div>
            <div className="text-3xl font-bold text-purple-500">
              {MOCK_BILLING_STATS.averagePaymentTime} days
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Average time to pay
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {MOCK_PAYMENTS.map((payment) => (
          <LiquidGlassCard key={payment.id}>
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-2xl">{getPaymentMethodIcon(payment.method)}</div>
                    <div>
                      <div className="font-semibold">{payment.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">{payment.clientName}</div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Payment Date:</span>
                      <div className="font-medium">{new Date(payment.paymentDate).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Method:</span>
                      <div className="font-medium capitalize">{payment.method}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Transaction ID:</span>
                      <div className="font-medium font-mono text-xs">{payment.transactionId || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Processing Fee:</span>
                      <div className="font-medium">{formatCurrency(payment.processingFee)}</div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-bold text-green-500 mb-2">
                    {formatCurrency(payment.amount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Net: {formatCurrency(payment.netAmount)}
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}
      </div>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Invoice Templates</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
          + New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_INVOICE_TEMPLATES.map((template) => {
          const { subtotal, taxAmount, total } = template.items.reduce(
            (acc, item) => ({
              subtotal: acc.subtotal + item.total,
              taxAmount: acc.taxAmount + (item.total * item.taxRate / 100),
              total: acc.total + item.total
            }),
            { subtotal: 0, taxAmount: 0, total: 0 }
          )

          return (
            <LiquidGlassCard key={template.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                  </div>
                  <div className="text-2xl">📋</div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium ml-2">{template.items.length}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Template Value:</span>
                    <span className="font-medium ml-2">{formatCurrency(total)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Usage:</span>
                    <span className="font-medium ml-2">{template.usageCount} times</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      Use Template
                    </button>
                    <button className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  const renderCreate = () => (
    <div className="space-y-6">
      <LiquidGlassCard>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Create New Invoice</h2>

          <div className="space-y-6">
            {/* Client Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Client Name</label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Client Email</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Invoice Number</label>
                <input
                  type="text"
                  placeholder="INV-2024-0001"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Issue Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium">Invoice Items</label>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-12 gap-3 text-sm font-medium text-muted-foreground">
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Quantity</div>
                  <div className="col-span-2">Unit Price</div>
                  <div className="col-span-2">Total</div>
                  <div className="col-span-1"></div>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <input
                    type="text"
                    placeholder="Item description"
                    className="col-span-5 px-4 py-2 rounded-lg border bg-background"
                  />
                  <input
                    type="number"
                    placeholder="1"
                    className="col-span-2 px-4 py-2 rounded-lg border bg-background"
                  />
                  <input
                    type="number"
                    placeholder="0.00"
                    className="col-span-2 px-4 py-2 rounded-lg border bg-background"
                  />
                  <div className="col-span-2 px-4 py-2 rounded-lg border bg-muted/30 flex items-center">
                    $0.00
                  </div>
                  <button className="col-span-1 px-2 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-6">
              <div className="max-w-md ml-auto space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Subtotal:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tax (10%):</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-green-500">$0.00</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                placeholder="Additional notes or payment instructions"
                rows={4}
                className="w-full px-4 py-2 rounded-lg border bg-background"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-6 border-t">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
                Create & Send Invoice
              </button>
              <button className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">
                Save as Draft
              </button>
              <button className="px-6 py-3 bg-muted hover:bg-muted/80 rounded-lg font-medium transition-colors">
                Save as Template
              </button>
            </div>
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Invoice & Billing
              </TextShimmer>
              <p className="text-muted-foreground">
                Professional invoicing and payment management
              </p>
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-colors shadow-lg">
              + Create Invoice
            </button>
          </div>
        </ScrollReveal>

        {/* View Mode Tabs */}
        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-2">
              <div className="flex items-center gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        {/* Content */}
        <ScrollReveal delay={0.2}>
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'invoices' && renderInvoices()}
          {viewMode === 'payments' && renderPayments()}
          {viewMode === 'templates' && renderTemplates()}
          {viewMode === 'create' && renderCreate()}
        </ScrollReveal>
      </div>
    </div>
  )
}
