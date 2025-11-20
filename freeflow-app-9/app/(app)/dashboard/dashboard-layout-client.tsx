'use client'

import { User } from '@supabase/supabase-js'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { FloatingThemeToggle } from '@/components/ui/premium-theme-toggle'
import { RouteTransitionWrapper } from '@/components/ui/route-transition-wrapper'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { ROUTE_LABELS } from '@/lib/route-utils'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: User
}

export default function DashboardLayoutClient({
  children, user: _user
}: DashboardLayoutClientProps) {
  return (
    <div className="flex h-screen overflow-hidden kazi-bg-light dark:kazi-bg-dark">
      {/* Desktop Sidebar */}
      <div className="w-64 flex-shrink-0">
        <SidebarEnhanced />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden sticky top-0 z-40 kazi-bg-light dark:kazi-bg-dark border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold kazi-text-dark dark:kazi-text-light kazi-headline">KAZI</h1>
            {/* Mobile menu will be handled by MobileNav in global header */}
          </div>
        </div>

        <div className="container mx-auto p-4 lg:p-6">
          {/* Premium Breadcrumb Navigation */}
          <div className="mb-6">
            <BreadcrumbNav labels={ROUTE_LABELS} />
          </div>

          {/* Route Transition Wrapper */}
          <RouteTransitionWrapper variant="premium">
            {children}
          </RouteTransitionWrapper>
        </div>
      </main>

      {/* Floating Theme Toggle - visible on all dashboard pages */}
      <FloatingThemeToggle />
    </div>
  )
}

