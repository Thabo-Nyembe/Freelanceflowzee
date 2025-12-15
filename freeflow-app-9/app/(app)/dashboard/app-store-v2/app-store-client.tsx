'use client'

import { useState, useEffect } from 'react'
import StatGrid from '@/app/components/dashboard/StatGrid'
import BentoQuickAction from '@/app/components/dashboard/BentoQuickAction'
import PillButton from '@/app/components/dashboard/PillButton'
import MiniKPI from '@/app/components/dashboard/MiniKPI'
import ActivityFeed from '@/app/components/dashboard/ActivityFeed'
import RankingList from '@/app/components/dashboard/RankingList'
import ProgressCard from '@/app/components/dashboard/ProgressCard'
import { useStoreApps, StoreApp, getStatusColor, getCategoryColor, getPricingColor, formatDownloads } from '@/lib/hooks/use-store-apps'

type AppStatus = 'installed' | 'available' | 'updating' | 'trial' | 'suspended'
type AppCategory = 'business' | 'productivity' | 'creative' | 'finance' | 'education' | 'utilities' | 'developer' | 'social'
type AppPricing = 'free' | 'freemium' | 'paid' | 'subscription' | 'enterprise'

interface AppStoreClientProps {
  initialApps: StoreApp[]
  initialStats: {
    total: number
    installed: number
    available: number
    trial: number
    totalDownloads: number
    avgRating: number
  }
}

export default function AppStoreClient({ initialApps, initialStats }: AppStoreClientProps) {
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<AppCategory | 'all'>('all')
  const [pricingFilter, setPricingFilter] = useState<AppPricing | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const {
    apps,
    stats,
    isLoading,
    error,
    fetchApps,
    installApp,
    uninstallApp,
    startTrial,
    updateApp
  } = useStoreApps(initialApps)

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  const filteredApps = apps.filter(app => {
    if (statusFilter !== 'all' && app.status !== statusFilter) return false
    if (categoryFilter !== 'all' && app.category !== categoryFilter) return false
    if (pricingFilter !== 'all' && app.pricing_type !== pricingFilter) return false
    return true
  })

  const displayStats = [
    { label: 'Total Apps', value: String(stats.total || initialStats.total), trend: '+156', trendLabel: 'this month' },
    { label: 'Installed Apps', value: String(stats.installed || initialStats.installed), trend: '+3', trendLabel: 'vs last week' },
    { label: 'Total Downloads', value: formatDownloads(stats.totalDownloads || initialStats.totalDownloads), trend: '+52%', trendLabel: 'vs last month' },
    { label: 'Avg Rating', value: `${(stats.avgRating || initialStats.avgRating).toFixed(1)}/5`, trend: '+0.2', trendLabel: 'improvement' }
  ]

  const quickActions = [
    { label: 'Browse All', icon: '🏪', onClick: () => console.log('Browse All') },
    { label: 'My Apps', icon: '📱', onClick: () => console.log('My Apps') },
    { label: 'Featured', icon: '⭐', onClick: () => console.log('Featured') },
    { label: 'Top Charts', icon: '📊', onClick: () => console.log('Top Charts') },
    { label: 'Categories', icon: '📂', onClick: () => console.log('Categories') },
    { label: 'Wishlist', icon: '❤️', onClick: () => console.log('Wishlist') },
    { label: 'Updates', icon: '🔄', onClick: () => console.log('Updates') },
    { label: 'Settings', icon: '⚙️', onClick: () => console.log('Settings') }
  ]

  const recentActivity = [
    { label: 'TaskFlow Pro updated to v5.2.1', time: '6 min ago', type: 'update' },
    { label: 'New app: SmartNotes AI installed', time: '14 min ago', type: 'install' },
    { label: 'DesignStudio Max trial started (14 days)', time: '28 min ago', type: 'trial' },
    { label: 'MeetingRoom Pro reached 1M downloads', time: '1 hour ago', type: 'milestone' },
    { label: 'FinanceHub subscription renewed', time: '2 hours ago', type: 'billing' },
    { label: '5 apps added to wishlist', time: '3 hours ago', type: 'wishlist' }
  ]

  const topApps = filteredApps
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 5)
    .map((app, index) => ({
      rank: index + 1,
      label: app.name,
      value: formatDownloads(app.downloads),
      change: index === 0 ? '+52%' : index === 1 ? '+45%' : index === 2 ? '+38%' : index === 3 ? '+32%' : '+28%'
    }))

  const handleInstall = async (appId: string) => {
    try {
      await installApp(appId)
    } catch (err) {
      console.error('Failed to install app:', err)
    }
  }

  const handleUninstall = async (appId: string) => {
    if (confirm('Are you sure you want to uninstall this app?')) {
      try {
        await uninstallApp(appId)
      } catch (err) {
        console.error('Failed to uninstall app:', err)
      }
    }
  }

  const handleStartTrial = async (appId: string) => {
    try {
      await startTrial(appId, 14)
    } catch (err) {
      console.error('Failed to start trial:', err)
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            App Store
          </h1>
          <p className="text-gray-600 mt-1">Discover and install powerful applications</p>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow">
          Browse Apps
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <StatGrid stats={displayStats} />

      {/* Quick Actions */}
      <BentoQuickAction actions={quickActions} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex gap-2">
          <PillButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</PillButton>
          <PillButton active={statusFilter === 'installed'} onClick={() => setStatusFilter('installed')}>Installed</PillButton>
          <PillButton active={statusFilter === 'trial'} onClick={() => setStatusFilter('trial')}>Trial</PillButton>
          <PillButton active={statusFilter === 'available'} onClick={() => setStatusFilter('available')}>Available</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={categoryFilter === 'all'} onClick={() => setCategoryFilter('all')}>All Categories</PillButton>
          <PillButton active={categoryFilter === 'business'} onClick={() => setCategoryFilter('business')}>Business</PillButton>
          <PillButton active={categoryFilter === 'productivity'} onClick={() => setCategoryFilter('productivity')}>Productivity</PillButton>
          <PillButton active={categoryFilter === 'creative'} onClick={() => setCategoryFilter('creative')}>Creative</PillButton>
        </div>
        <div className="flex gap-2">
          <PillButton active={pricingFilter === 'all'} onClick={() => setPricingFilter('all')}>All Pricing</PillButton>
          <PillButton active={pricingFilter === 'free'} onClick={() => setPricingFilter('free')}>Free</PillButton>
          <PillButton active={pricingFilter === 'freemium'} onClick={() => setPricingFilter('freemium')}>Freemium</PillButton>
          <PillButton active={pricingFilter === 'subscription'} onClick={() => setPricingFilter('subscription')}>Subscription</PillButton>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apps List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Available Apps ({filteredApps.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100'}`}
                >
                  List
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                {filteredApps.map(app => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {app.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{app.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{app.tagline}</p>
                        <p className="text-xs text-gray-500">{app.developer}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{app.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(app.category)}`}>
                        {app.category}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPricingColor(app.pricing_type)}`}>
                        {app.pricing_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="text-xs">
                        <div className="text-gray-500">Downloads</div>
                        <div className="font-semibold">{formatDownloads(app.downloads)}</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Price</div>
                        <div className="font-semibold text-indigo-600">
                          {app.price === 0 ? 'Free' : `$${app.price}/${app.pricing_type === 'subscription' ? 'mo' : ''}`}
                        </div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Size</div>
                        <div className="font-semibold">{(app.size_bytes / 1048576).toFixed(1)} MB</div>
                      </div>
                      <div className="text-xs">
                        <div className="text-gray-500">Version</div>
                        <div className="font-semibold">v{app.version}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{app.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({app.reviews_count.toLocaleString()})</span>
                      </div>
                      <span className="text-gray-500">{app.languages} languages</span>
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      {app.status === 'installed' ? (
                        <>
                          <button className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100">
                            Open
                          </button>
                          <button
                            onClick={() => handleUninstall(app.id)}
                            className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100"
                          >
                            Uninstall
                          </button>
                        </>
                      ) : app.status === 'trial' ? (
                        <>
                          <button className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100">
                            Purchase
                          </button>
                          <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                            Details
                          </button>
                        </>
                      ) : app.status === 'updating' ? (
                        <button disabled className="flex-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded text-xs font-medium">
                          Updating...
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleInstall(app.id)}
                            className="flex-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100"
                          >
                            Install
                          </button>
                          {app.trial_days > 0 && (
                            <button
                              onClick={() => handleStartTrial(app.id)}
                              className="flex-1 px-3 py-1.5 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100"
                            >
                              Start Trial
                            </button>
                          )}
                          <button className="flex-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded text-xs font-medium hover:bg-gray-100">
                            Details
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <MiniKPI label="Installed Apps" value={String(stats.installed || initialStats.installed)} />
              <MiniKPI label="Active Trials" value={String(stats.trial || initialStats.trial)} />
              <MiniKPI label="Monthly Spend" value="$287" />
              <MiniKPI label="Updates Available" value="5" />
            </div>
          </div>

          {/* Top Apps */}
          <RankingList title="Most Downloaded Apps" items={topApps} />

          {/* Recent Activity */}
          <ActivityFeed title="Recent Activity" activities={recentActivity} />

          {/* Category Distribution */}
          <ProgressCard
            title="App Categories"
            items={[
              { label: 'Business', value: 26, color: 'from-blue-400 to-blue-600' },
              { label: 'Productivity', value: 24, color: 'from-green-400 to-green-600' },
              { label: 'Creative', value: 18, color: 'from-purple-400 to-purple-600' },
              { label: 'Finance', value: 16, color: 'from-teal-400 to-teal-600' },
              { label: 'Utilities', value: 16, color: 'from-indigo-400 to-indigo-600' }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
