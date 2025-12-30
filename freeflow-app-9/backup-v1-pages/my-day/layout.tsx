"use client"

import { usePathname, useRouter } from 'next/navigation'
import { Calendar, Clock, Brain, BarChart3, Briefcase, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface TabItem {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  badge?: number
}

const MAIN_TABS: TabItem[] = [
  { id: 'today', name: "Today's Tasks", icon: Calendar, path: '/dashboard/my-day' },
  { id: 'schedule', name: 'Time Blocks', icon: Clock, path: '/dashboard/my-day/schedule' },
  { id: 'insights', name: 'AI Insights', icon: Brain, path: '/dashboard/my-day/insights', badge: 3 },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/dashboard/my-day/analytics' },
  { id: 'projects', name: 'Projects', icon: Briefcase, path: '/dashboard/my-day/projects' },
  { id: 'goals', name: 'Goals', icon: Target, path: '/dashboard/my-day/goals' }
]

export default function MyDayLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    if (path === '/dashboard/my-day') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Day</h1>
        <p className="text-gray-600">
          Plan, track, and optimize your daily workflow with AI-powered insights
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="grid w-full grid-cols-6 bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl p-2 shadow-xl">
        {MAIN_TABS.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.path)

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`
                flex items-center justify-center gap-2 rounded-2xl px-4 py-2 transition-all
                ${active
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden lg:inline">{tab.name}</span>
              {tab.badge && (
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
  )
}
