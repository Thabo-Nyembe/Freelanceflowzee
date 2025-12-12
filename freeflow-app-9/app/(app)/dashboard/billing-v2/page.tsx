"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ComparisonCard,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  CreditCard,
  DollarSign,
  Download,
  Calendar,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Settings,
  Award,
  Users,
  Zap
} from 'lucide-react'

/**
 * Billing V2 - Groundbreaking Billing & Subscription Management
 * Showcases billing, invoices, and payment tracking with modern components
 */
export default function BillingV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const stats = [
    { label: 'Monthly Revenue', value: '$24.5K', change: 18.7, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Active Subscriptions', value: '847', change: 25.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Payment Success', value: '98%', change: 5.2, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Average Plan Value', value: '$28.94', change: 12.5, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const subscriptionPlans = [
    {
      id: '1',
      name: 'Starter',
      price: 19,
      subscribers: 247,
      revenue: 4693,
      growth: 15.3,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Professional',
      price: 49,
      subscribers: 342,
      revenue: 16758,
      growth: 28.7,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 99,
      subscribers: 124,
      revenue: 12276,
      growth: 42.1,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '4',
      name: 'Custom',
      price: 199,
      subscribers: 134,
      revenue: 26666,
      growth: 35.2,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const recentInvoices = [
    {
      id: 'INV-2024-0247',
      customer: 'Acme Corporation',
      amount: 499,
      status: 'paid',
      dueDate: '2 days ago',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'INV-2024-0246',
      customer: 'Tech Innovations Ltd',
      amount: 199,
      status: 'paid',
      dueDate: '1 week ago',
      paymentMethod: 'ACH'
    },
    {
      id: 'INV-2024-0245',
      customer: 'StartUp Hub',
      amount: 99,
      status: 'pending',
      dueDate: 'Due in 5 days',
      paymentMethod: 'Credit Card'
    },
    {
      id: 'INV-2024-0244',
      customer: 'Global Enterprises',
      amount: 999,
      status: 'overdue',
      dueDate: '3 days overdue',
      paymentMethod: 'Wire Transfer'
    }
  ]

  const paymentMethods = [
    { type: 'Credit Cards', count: 624, percentage: 74, icon: <CreditCard className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500' },
    { type: 'ACH/Bank', count: 124, percentage: 15, icon: <DollarSign className="w-5 h-5" />, color: 'from-green-500 to-emerald-500' },
    { type: 'Wire Transfer', count: 67, percentage: 8, icon: <TrendingUp className="w-5 h-5" />, color: 'from-purple-500 to-pink-500' },
    { type: 'Other', count: 32, percentage: 3, icon: <Award className="w-5 h-5" />, color: 'from-orange-500 to-red-500' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      case 'cancelled': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Calendar className="w-3 h-3" />
      case 'overdue': return <AlertTriangle className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const maxRevenue = Math.max(...subscriptionPlans.map(p => p.revenue))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50/30 to-teal-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <CreditCard className="w-10 h-10 text-emerald-600" />
              Billing & Payments
            </h1>
            <p className="text-muted-foreground">Manage subscriptions, invoices, and payments</p>
          </div>
          <GradientButton from="emerald" to="green" onClick={() => console.log('New invoice')}>
            <FileText className="w-5 h-5 mr-2" />
            Create Invoice
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<FileText />} title="Invoices" description="All invoices" onClick={() => console.log('Invoices')} />
          <BentoQuickAction icon={<CreditCard />} title="Payments" description="Methods" onClick={() => console.log('Payments')} />
          <BentoQuickAction icon={<Users />} title="Subscribers" description="Manage" onClick={() => console.log('Subscribers')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarterly
          </PillButton>
          <PillButton variant={selectedPeriod === 'year' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('year')}>
            Yearly
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Subscription Plans Performance</h3>
          <div className="space-y-4">
            {subscriptionPlans.map((plan) => {
              const revenuePercent = (plan.revenue / maxRevenue) * 100

              return (
                <div key={plan.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${plan.color} flex items-center justify-center text-white font-bold`}>
                        {plan.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{plan.name}</h4>
                        <p className="text-xs text-muted-foreground">${plan.price}/month</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Subscribers</p>
                        <p className="font-bold">{plan.subscribers}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-bold">${(plan.revenue / 1000).toFixed(1)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-bold text-green-600">+{plan.growth}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${plan.color} transition-all duration-300`}
                      style={{ width: `${revenuePercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Invoices</h3>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-4 rounded-lg border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{invoice.id}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{invoice.customer}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            ${invoice.amount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {invoice.dueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            {invoice.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('View', invoice.id)}>
                          View
                        </ModernButton>
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', invoice.id)}>
                          <Download className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${method.color} flex items-center justify-center text-white`}>
                          {method.icon}
                        </div>
                        <span className="font-medium">{method.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{method.count}</p>
                        <p className="text-xs text-muted-foreground">{method.percentage}%</p>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${method.color}`}
                        style={{ width: `${method.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <ComparisonCard
              title="Revenue Comparison"
              current={{ label: 'This Month', value: 24500 }}
              previous={{ label: 'Last Month', value: 20600 }}
            />

            <ProgressCard
              title="Annual Revenue Target"
              current={294000}
              goal={500000}
              unit="$"
              icon={<DollarSign className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="MRR Growth" value="18.7%" change={12.5} />
                <MiniKPI label="Churn Rate" value="2.1%" change={-8.3} />
                <MiniKPI label="ARPU" value="$28.94" change={15.7} />
                <MiniKPI label="LTV" value="$1,247" change={25.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
