'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, Clock, Users, Target, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextShimmer } from '@/components/ui/text-shimmer'

interface BookingsLayoutProps {
  children: ReactNode
}

const tabs = [
  {
    name: 'Upcoming',
    href: '/dashboard/bookings',
    icon: Calendar,
    exact: true
  },
  {
    name: 'Calendar',
    href: '/dashboard/bookings/calendar',
    icon: Calendar,
    exact: false
  },
  {
    name: 'Availability',
    href: '/dashboard/bookings/availability',
    icon: Clock,
    exact: false
  },
  {
    name: 'Services',
    href: '/dashboard/bookings/services',
    icon: Target,
    exact: false
  },
  {
    name: 'Clients',
    href: '/dashboard/bookings/clients',
    icon: Users,
    exact: false
  },
  {
    name: 'History',
    href: '/dashboard/bookings/history',
    icon: Clock,
    exact: false
  },
  {
    name: 'Analytics',
    href: '/dashboard/bookings/analytics',
    icon: BarChart3,
    exact: false
  }
]

export default function BookingsLayout({ children }: BookingsLayoutProps) {
  const pathname = usePathname()

  const isActive = (tab: typeof tabs[0]) => {
    if (tab.exact) {
      return pathname === tab.href
    }
    return pathname.startsWith(tab.href)
  }

  return (
    <div className="kazi-bg-light min-h-screen py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-bolt/10">
            <Calendar className="h-6 w-6 kazi-text-primary" />
          </div>
          <div>
            <TextShimmer className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-transparent">
              Bookings
            </TextShimmer>
            <p className="text-muted-foreground text-sm">
              Manage appointments, services and client bookings
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 mb-6">
        <div className="border-b border-gray-200 bg-white/70 backdrop-blur-sm rounded-lg p-2">
          <nav className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const active = isActive(tab)

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors',
                    active
                      ? 'bg-violet-bolt/10 text-violet-bolt'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  data-testid={`tab-${tab.name.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  )
}
