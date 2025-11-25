"use client"

import { usePathname, useRouter } from 'next/navigation'
import { FolderOpen, Activity, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { TextShimmer as TextShimmerComponent } from '@/components/ui/text-shimmer'
import { calculateStats, mockProjects } from '@/lib/projects-hub-utils'

interface TabItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
}

export default function ProjectsHubLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Calculate stats for badges
  const stats = calculateStats(mockProjects)

  const MAIN_TABS: TabItem[] = [
    { id: 'overview', name: 'Overview', icon: FolderOpen, path: '/dashboard/projects-hub' },
    { id: 'active', name: 'Active Projects', icon: Activity, path: '/dashboard/projects-hub/active', badge: stats.active },
    { id: 'analytics', name: 'Analytics', icon: TrendingUp, path: '/dashboard/projects-hub/analytics' }
  ]

  const isActive = (path: string) => {
    // Special handling for nested routes (create, import, templates)
    if (pathname.includes('/create') || pathname.includes('/import') || pathname.includes('/templates')) {
      return false // Don't highlight any tab for nested routes
    }

    if (path === '/dashboard/projects-hub') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  // Don't show layout for nested routes (create, import, templates)
  if (pathname.includes('/create') || pathname.includes('/import') || pathname.includes('/templates')) {
    return children
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      {/* Floating decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {/* Gradient icon container */}
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <TextShimmerComponent className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Projects Hub
            </TextShimmerComponent>
          </div>
          <p className="text-lg text-gray-600 font-light">
            Manage and track all your creative projects in one place
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.path)

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                data-testid={`${tab.id}-tab`}
                className={`
                  flex items-center justify-center gap-2 rounded-2xl px-4 py-2 transition-all
                  ${active
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden lg:inline">{tab.name}</span>
                {tab.badge !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {tab.badge}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
