'use client'

import { useState } from 'react'
import { useCustomers, type Customer, type CustomerSegment } from '@/lib/hooks/use-customers'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Users, UserPlus, Star, TrendingUp, Mail, Phone, MapPin, DollarSign, ShoppingCart } from 'lucide-react'

export default function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [segmentFilter, setSegmentFilter] = useState<CustomerSegment | 'all'>('all')
  const { customers, loading, error } = useCustomers({ segment: segmentFilter })

  const displayCustomers = (customers && customers.length > 0) ? customers : (initialCustomers || [])

  const stats = [
    {
      label: 'Total Customers',
      value: displayCustomers.length.toLocaleString(),
      change: 18.4,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active',
      value: displayCustomers.filter(c => c.segment === 'active').length.toLocaleString(),
      change: 23.7,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Lifetime Value',
      value: `$${(displayCustomers.reduce((sum, c) => sum + c.lifetime_value, 0) / 1000000).toFixed(1)}M`,
      change: 32.5,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Avg Order Value',
      value: displayCustomers.length > 0
        ? `$${(displayCustomers.reduce((sum, c) => sum + c.avg_order_value, 0) / displayCustomers.length).toFixed(0)}`
        : '$0',
      change: 8.9,
      icon: <ShoppingCart className="w-5 h-5" />
    }
  ]

  const getSegmentColor = (segment: CustomerSegment) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'new': return 'bg-blue-100 text-blue-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'at_risk': return 'bg-orange-100 text-orange-800'
      case 'churned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const topCustomers = displayCustomers
    .sort((a, b) => b.lifetime_value - a.lifetime_value)
    .slice(0, 5)
    .map((c, i) => ({
      rank: i + 1,
      label: c.customer_name,
      value: `$${(c.lifetime_value / 1000).toFixed(1)}K`,
      change: c.total_orders
    }))

  const recentActivity = displayCustomers.slice(0, 4).map((c) => ({
    icon: <UserPlus className="w-5 h-5" />,
    title: `${c.segment} customer`,
    description: c.customer_name,
    time: new Date(c.created_at).toLocaleDateString(),
    status: c.status === 'active' ? 'success' as const : 'info' as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-fuchsia-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-violet-600" />
              Customers
            </h1>
            <p className="text-muted-foreground">Manage customer relationships and analytics</p>
          </div>
          <GradientButton from="violet" to="purple" onClick={() => console.log('Add customer')}>
            <UserPlus className="w-5 h-5 mr-2" />
            Add Customer
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3">
          <PillButton variant={segmentFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSegmentFilter('all')}>All</PillButton>
          <PillButton variant={segmentFilter === 'vip' ? 'primary' : 'ghost'} onClick={() => setSegmentFilter('vip')}>VIP</PillButton>
          <PillButton variant={segmentFilter === 'active' ? 'primary' : 'ghost'} onClick={() => setSegmentFilter('active')}>Active</PillButton>
          <PillButton variant={segmentFilter === 'new' ? 'primary' : 'ghost'} onClick={() => setSegmentFilter('new')}>New</PillButton>
          <PillButton variant={segmentFilter === 'at_risk' ? 'primary' : 'ghost'} onClick={() => setSegmentFilter('at_risk')}>At Risk</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayCustomers.map((customer) => (
              <BentoCard key={customer.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {customer.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{customer.customer_name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-md ${getSegmentColor(customer.segment)}`}>
                        {customer.segment}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                        {customer.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{customer.email}</div>}
                        {customer.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{customer.phone}</div>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">${customer.lifetime_value.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">LTV</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Orders</p>
                    <p className="font-semibold">{customer.total_orders}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Spent</p>
                    <p className="font-semibold text-violet-600">${customer.total_spent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Order</p>
                    <p className="font-semibold">${customer.avg_order_value.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Order</p>
                    <p className="font-semibold">{customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </BentoCard>
            ))}

            {displayCustomers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Customers</h3>
                <p className="text-muted-foreground">Add your first customer</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <RankingList title="Top Customers" items={topCustomers} />
            <ActivityFeed title="Recent Activity" activities={recentActivity} />
            <ProgressCard label="Customer Goal" current={displayCustomers.length} target={30000} subtitle="Total customers" />
          </div>
        </div>
      </div>
    </div>
  )
}
