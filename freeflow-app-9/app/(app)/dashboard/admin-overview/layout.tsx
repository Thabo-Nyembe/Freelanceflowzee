'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { NumberFlow } from '@/components/ui/number-flow'
import { MOCK_ADMIN_DASHBOARD_STATS, formatCurrency, formatPercentage } from '@/lib/admin-overview-utils'
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileText,
  Target,
  Cog,
  Zap,
  RefreshCw,
  Download,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

const logger = createFeatureLogger('admin-overview-layout')

interface AdminOverviewLayoutProps {
  children: React.ReactNode
}

export default function AdminOverviewLayout({ children }: AdminOverviewLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [stats, setStats] = useState(MOCK_ADMIN_DASHBOARD_STATS)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Navigation tabs configuration
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard/admin-overview',
      icon: LayoutDashboard,
      exact: true
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/dashboard/admin-overview/analytics',
      icon: BarChart3
    },
    {
      id: 'crm',
      label: 'CRM',
      path: '/dashboard/admin-overview/crm',
      icon: Users
    },
    {
      id: 'invoicing',
      label: 'Invoicing',
      path: '/dashboard/admin-overview/invoicing',
      icon: FileText
    },
    {
      id: 'marketing',
      label: 'Marketing',
      path: '/dashboard/admin-overview/marketing',
      icon: Target
    },
    {
      id: 'operations',
      label: 'Operations',
      path: '/dashboard/admin-overview/operations',
      icon: Cog
    },
    {
      id: 'automation',
      label: 'Automation',
      path: '/dashboard/admin-overview/automation',
      icon: Zap
    }
  ]

  // Check if tab is active
  const isActiveTab = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.path
    }
    return pathname?.startsWith(tab.path)
  }

  // Handle refresh data
  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true)
      logger.info('Refreshing admin overview data', { timestamp: new Date().toISOString() })

      // Simulate API call
      const response = await fetch('/api/admin/overview/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: new Date().toISOString() })
      })

      if (!response.ok) {
        throw new Error('Failed to refresh data')
      }

      // Update last updated time
      setLastUpdated(new Date())

      toast.success('Data Refreshed', {
        description: 'All admin metrics have been updated successfully'
      })
      logger.info('Data refresh completed', { success: true })
    } catch (error) {
      toast.error('Refresh Failed', {
        description: error instanceof Error ? error.message : 'Unable to refresh data'
      })
      logger.error('Data refresh failed', { error })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle export report
  const handleExportReport = async () => {
    try {
      logger.info('Exporting admin overview report', { format: 'PDF' })

      const response = await fetch('/api/admin/overview/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'pdf',
          sections: ['stats', 'analytics', 'crm', 'invoicing', 'marketing'],
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      // Simulate file download
      toast.success('Report Exported', {
        description: 'Admin overview report has been generated and downloaded'
      })
      logger.info('Report export completed', { success: true })
    } catch (error) {
      toast.error('Export Failed', {
        description: error instanceof Error ? error.message : 'Unable to export report'
      })
      logger.error('Report export failed', { error })
    }
  }

  // Handle settings
  const handleSettings = () => {
    logger.info('Opening admin settings')
    router.push('/dashboard/settings')
    toast.info('Opening Settings', {
      description: 'Navigating to admin settings page'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <div className="max-w-[1800px] mx-auto p-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <LiquidGlassCard>
            <div className="p-6">
              {/* Title and Actions */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <TextShimmer className="text-3xl font-bold mb-2">
                    Business Admin Intelligence
                  </TextShimmer>
                  <p className="text-gray-600">
                    Comprehensive business metrics and operational insights
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Updated: {lastUpdated.toLocaleTimeString()}
                  </span>

                  <button
                    onClick={handleRefreshData}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </button>

                  <button
                    onClick={handleExportReport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export Report
                  </button>

                  <button
                    onClick={handleSettings}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
              </div>

              {/* Key Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Revenue */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-green-600 font-medium mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-green-700">
                        <NumberFlow
                          value={stats.totalRevenue}
                          format={{
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">
                      +{formatPercentage(stats.revenueGrowth)}
                    </span>
                    <span className="text-green-500">this month</span>
                  </div>
                </div>

                {/* Active Clients */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-blue-600 font-medium mb-1">Active Clients</div>
                      <div className="text-2xl font-bold text-blue-700">
                        <NumberFlow value={stats.activeClients} />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">
                      +{formatPercentage(stats.clientGrowth)}
                    </span>
                    <span className="text-blue-500">growth rate</span>
                  </div>
                </div>

                {/* Hot Leads */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-red-600 font-medium mb-1">Hot Leads</div>
                      <div className="text-2xl font-bold text-red-700">
                        <NumberFlow value={stats.hotLeads} />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-red-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">
                      +{formatPercentage(stats.leadGrowth)}
                    </span>
                    <span className="text-red-500">conversion ready</span>
                  </div>
                </div>

                {/* Email Open Rate */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm text-purple-600 font-medium mb-1">Email Open Rate</div>
                      <div className="text-2xl font-bold text-purple-700">
                        <NumberFlow value={stats.emailOpenRate} suffix="%" />
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-600">
                    <TrendingUp className="w-3 h-3" />
                    <span className="font-medium">
                      +{formatPercentage(stats.openRateChange)}
                    </span>
                    <span className="text-purple-500">above average</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                  const isActive = isActiveTab(tab)
                  const Icon = tab.icon

                  return (
                    <button
                      key={tab.id}
                      onClick={() => router.push(tab.path)}
                      className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                        ${isActive
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </LiquidGlassCard>
        </motion.div>

        {/* Page Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
