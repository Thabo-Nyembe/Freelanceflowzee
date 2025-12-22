'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TextShimmer } from '@/components/ui/text-shimmer'
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  FolderOpen,
  Users,
  Brain,
  Activity,
  ArrowRight
} from 'lucide-react'
import { KAZI_ANALYTICS_DATA, formatCurrency } from '@/lib/analytics-utils'

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    {
      value: '/dashboard/analytics',
      label: 'Overview',
      icon: BarChart3,
      badge: 'Live',
      badgeColor: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700'
    },
    {
      value: '/dashboard/analytics/revenue',
      label: 'Revenue',
      icon: DollarSign,
      badge: formatCurrency(KAZI_ANALYTICS_DATA.overview.monthlyRevenue),
      badgeColor: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    },
    {
      value: '/dashboard/analytics/projects',
      label: 'Projects',
      icon: FolderOpen,
      badge: KAZI_ANALYTICS_DATA.overview.totalProjects.toString(),
      badgeColor: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    },
    {
      value: '/dashboard/analytics/clients',
      label: 'Clients',
      icon: Users,
      badge: `${KAZI_ANALYTICS_DATA.overview.totalClients} active`,
      badgeColor: 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
    },
    {
      value: '/dashboard/analytics/intelligence',
      label: 'Intelligence',
      icon: Brain,
      badge: 'AI',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
    },
    {
      value: '/dashboard/analytics/performance',
      label: 'Performance',
      icon: Activity,
      badge: null,
      badgeColor: ''
    }
  ]

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleTabClick = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-gray-100 dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  Analytics Dashboard
                </TextShimmer>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                Comprehensive business intelligence and performance metrics
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleBackToDashboard}
                data-testid="back-to-dashboard-btn"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 rounded-3xl p-2 shadow-xl">
            <div className="grid grid-cols-6 gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = pathname === tab.value

                return (
                  <button
                    key={tab.value}
                    onClick={() => handleTabClick(tab.value)}
                    className={`
                      flex items-center justify-center gap-2 rounded-2xl px-4 py-3 transition-all
                      ${isActive
                        ? 'bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-gray-100'
                        : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                      }
                    `}
                    data-testid={`tab-${tab.value.split('/').pop()}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">{tab.label}</span>
                    {tab.badge && (
                      <Badge
                        variant="outline"
                        className={`ml-1 ${tab.badgeColor}`}
                      >
                        {tab.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
