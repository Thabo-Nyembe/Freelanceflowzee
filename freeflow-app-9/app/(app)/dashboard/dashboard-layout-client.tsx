'use client'

import { User } from '@supabase/supabase-js'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { FloatingThemeToggle } from '@/components/ui/premium-theme-toggle'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { AdminSearch } from '@/components/admin/admin-search'
import { MobileAdminNav } from '@/components/admin/mobile-admin-nav'
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal'
import { ActivityLogViewer } from '@/components/activity-log-viewer'
import { TourManager } from '@/components/onboarding/tour-manager'
import { platformTours } from '@/lib/tours/platform-tours'
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
      {/* Mobile Navigation */}
      <MobileAdminNav />

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <SidebarEnhanced />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 pb-16 lg:pb-0">
        {/* Mobile Header with Sidebar Toggle */}
        <div className="lg:hidden sticky top-0 z-40 kazi-bg-light dark:kazi-bg-dark border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold kazi-text-dark dark:kazi-text-light kazi-headline">KAZI</h1>
            {/* Mobile menu will be handled by MobileNav in global header */}
          </div>
        </div>

        <div className="container mx-auto p-4 lg:p-6">
          {/* Premium Breadcrumb Navigation & Global Search */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <BreadcrumbNav labels={ROUTE_LABELS} />
            <AdminSearch />
          </div>

          {/* Instant page loading - no transition wrapper */}
          {children}
        </div>
      </main>

      {/* Floating Theme Toggle - visible on all dashboard pages */}
      <FloatingThemeToggle />

      {/* Activity Log Viewer - Real-time system activity notifications */}
      <ActivityLogViewer />

      {/* Keyboard Shortcuts Modal - Press ? to open */}
      <KeyboardShortcutsModal />

      {/* Interactive Onboarding Tours */}
      <TourManager
        tours={platformTours}
        autoStart={false} // Set to true for new users
        onTourComplete={(tourId, duration) => {
          console.log(`Tour ${tourId} completed in ${duration}ms`)
          // TODO: Track completion analytics
        }}
      />
    </div>
  )
}

