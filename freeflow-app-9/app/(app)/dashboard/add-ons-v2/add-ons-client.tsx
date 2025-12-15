'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  useAddOns,
  getAddOnStatusColor,
  getCategoryColor,
  getPricingColor,
  formatPrice,
  formatDownloads,
  formatRating,
  formatFileSize,
  type AddOn
} from '@/lib/hooks/use-add-ons'

type StatusFilter = 'all' | 'installed' | 'available' | 'disabled' | 'deprecated'
type CategoryFilter = 'all' | 'feature' | 'integration' | 'theme' | 'tool' | 'analytics' | 'security'
type PricingFilter = 'all' | 'free' | 'paid' | 'freemium' | 'subscription'
type ViewMode = 'grid' | 'list'

interface AddOnsClientProps {
  initialAddOns: AddOn[]
}

export default function AddOnsClient({ initialAddOns }: AddOnsClientProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [pricingFilter, setPricingFilter] = useState<PricingFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const { addOns, stats, isLoading, installAddOn, uninstallAddOn, disableAddOn } = useAddOns(initialAddOns, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    category: categoryFilter === 'all' ? undefined : categoryFilter,
    pricingType: pricingFilter === 'all' ? undefined : pricingFilter
  })

  const filteredAddOns = addOns.filter(addOn => {
    if (statusFilter !== 'all' && addOn.status !== statusFilter) return false
    if (categoryFilter !== 'all' && addOn.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && addOn.pricing_type !== pricingFilter) return false
    return true
  })

  const topAddOns = [...filteredAddOns]
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 5)
    .map((addOn, index) => ({
      rank: index + 1,
      label: addOn.name,
      value: formatDownloads(addOn.subscribers),
      change: `${formatRating(addOn.rating)}★`
    }))

  const handleInstall = async (addOnId: string) => {
    try {
      await installAddOn(addOnId)
    } catch (error) {
      console.error('Failed to install add-on:', error)
    }
  }

  const handleUninstall = async (addOnId: string) => {
    try {
      await uninstallAddOn(addOnId)
    } catch (error) {
      console.error('Failed to uninstall add-on:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              Add-ons
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Enhance your platform with premium add-ons and features
            </p>
          </div>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300">
            Browse Marketplace
          </button>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Add-ons',
              value: stats.total.toString(),
              change: '+12%',
              trend: 'up' as const,
              subtitle: 'available'
            },
            {
              label: 'Installed',
              value: stats.installed.toString(),
              change: '+8%',
              trend: 'up' as const,
              subtitle: 'active'
            },
            {
              label: 'Total Downloads',
              value: formatDownloads(stats.totalDownloads),
              change: '+24%',
              trend: 'up' as const,
              subtitle: 'all time'
            },
            {
              label: 'Avg Rating',
              value: formatRating(stats.avgRating),
              change: '+0.2',
              trend: 'up' as const,
              subtitle: 'stars'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Browse Add-ons', icon: '🛍️', onClick: () => {} },
            { label: 'My Add-ons', icon: '📦', onClick: () => {} },
            { label: 'Subscriptions', icon: '💳', onClick: () => {} },
            { label: 'Billing', icon: '💰', onClick: () => {} },
            { label: 'Trial Add-ons', icon: '🎁', onClick: () => {} },
            { label: 'Marketplace', icon: '🏪', onClick: () => {} },
            { label: 'Developer Portal', icon: '💻', onClick: () => {} },
            { label: 'Support', icon: '💬', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <PillButton label="All Status" isActive={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <PillButton label="Installed" isActive={statusFilter === 'installed'} onClick={() => setStatusFilter('installed')} />
            <PillButton label="Available" isActive={statusFilter === 'available'} onClick={() => setStatusFilter('available')} />
            <PillButton label="Disabled" isActive={statusFilter === 'disabled'} onClick={() => setStatusFilter('disabled')} />
          </div>
          <div className="flex items-center gap-2">
            <PillButton label="All Categories" isActive={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')} />
            <PillButton label="Feature" isActive={categoryFilter === 'feature'} onClick={() => setCategoryFilter('feature')} />
            <PillButton label="Integration" isActive={categoryFilter === 'integration'} onClick={() => setCategoryFilter('integration')} />
            <PillButton label="Security" isActive={categoryFilter === 'security'} onClick={() => setCategoryFilter('security')} />
          </div>
          <div className="flex items-center gap-2">
            <PillButton label="All Pricing" isActive={pricingFilter === 'all'} onClick={() => setPricingFilter('all')} />
            <PillButton label="Free" isActive={pricingFilter === 'free'} onClick={() => setPricingFilter('free')} />
            <PillButton label="Freemium" isActive={pricingFilter === 'freemium'} onClick={() => setPricingFilter('freemium')} />
            <PillButton label="Subscription" isActive={pricingFilter === 'subscription'} onClick={() => setPricingFilter('subscription')} />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Add-ons List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Available Add-ons ({filteredAddOns.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-slate-100 dark:bg-slate-800'}`}
                  >
                    List
                  </button>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : filteredAddOns.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  No add-ons found matching your filters.
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {filteredAddOns.map(addOn => (
                    <div
                      key={addOn.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 dark:hover:border-orange-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10 bg-white dark:bg-slate-800/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{addOn.name}</h3>
                          <p className="text-xs text-slate-500 mb-2">
                            v{addOn.version} • {formatFileSize(addOn.size_bytes)} • {addOn.provider}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                            {addOn.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getAddOnStatusColor(addOn.status)}`}>
                          {addOn.status}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(addOn.category)}`}>
                          {addOn.category}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(addOn.pricing_type)}`}>
                          {addOn.pricing_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="text-xs">
                          <div className="text-slate-600 dark:text-slate-400">Subscribers</div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {formatDownloads(addOn.subscribers)}
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="text-slate-600 dark:text-slate-400">Price</div>
                          <div className="font-semibold text-orange-600">
                            {addOn.pricing_type === 'free' ? 'Free' : formatPrice(addOn.price, addOn.currency)}
                          </div>
                        </div>
                      </div>

                      {addOn.features && addOn.features.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Key Features</div>
                          <div className="flex flex-wrap gap-1">
                            {addOn.features.slice(0, 3).map((feature, index) => (
                              <span key={index} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{formatRating(addOn.rating)}</span>
                          <span className="text-slate-500">({addOn.reviews_count})</span>
                        </div>
                        {addOn.has_trial && addOn.trial_days > 0 && (
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            {addOn.trial_days}-day trial
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                        {addOn.status === 'installed' ? (
                          <>
                            <button className="flex-1 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all">
                              Manage
                            </button>
                            <button
                              onClick={() => handleUninstall(addOn.id)}
                              className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-all"
                            >
                              Uninstall
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleInstall(addOn.id)}
                              className="flex-1 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-all"
                            >
                              {addOn.has_trial ? 'Start Trial' : 'Install'}
                            </button>
                            <button className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-600 transition-all">
                              Learn More
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI label="Installed" value={stats.installed.toString()} trend="up" change="+8" />
              <MiniKPI label="Available" value={stats.available.toString()} trend="up" change="+12" />
              <MiniKPI label="Free" value={stats.free.toString()} trend="same" change="0" />
              <MiniKPI label="Paid" value={stats.paid.toString()} trend="up" change="+5" />
            </div>

            {/* Top Add-ons */}
            <RankingList
              title="Most Popular Add-ons"
              items={topAddOns.map(item => ({
                label: item.label,
                value: item.value,
                rank: item.rank,
                trend: 'up' as const
              }))}
            />

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Add-on installed',
                  subject: 'Premium Analytics Suite',
                  time: '6 min ago',
                  type: 'success'
                },
                {
                  action: 'Trial started',
                  subject: 'AI Content Generator',
                  time: '14 min ago',
                  type: 'info'
                },
                {
                  action: 'Subscription renewed',
                  subject: 'Security Pack',
                  time: '1 hour ago',
                  type: 'success'
                },
                {
                  action: 'New review received',
                  subject: 'Cloud Storage 5-star',
                  time: '2 hours ago',
                  type: 'info'
                }
              ]}
            />

            {/* Category Distribution */}
            <ProgressCard
              title="Add-on Categories"
              items={[
                { label: 'Feature', value: filteredAddOns.filter(a => a.category === 'feature').length, total: filteredAddOns.length, color: 'blue' },
                { label: 'Integration', value: filteredAddOns.filter(a => a.category === 'integration').length, total: filteredAddOns.length, color: 'green' },
                { label: 'Security', value: filteredAddOns.filter(a => a.category === 'security').length, total: filteredAddOns.length, color: 'red' },
                { label: 'Theme', value: filteredAddOns.filter(a => a.category === 'theme').length, total: filteredAddOns.length, color: 'purple' }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
