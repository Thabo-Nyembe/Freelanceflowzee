'use client'

import { User } from '@supabase/supabase-js'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav'
import { AdminSearch } from '@/components/admin/admin-search'
import { MobileAdminNav } from '@/components/admin/mobile-admin-nav'
import { KeyboardShortcutsModal } from '@/components/ui/keyboard-shortcuts-modal'
import { ActivityLogViewer } from '@/components/activity-log-viewer'
import { ROUTE_LABELS } from '@/lib/route-utils'
import { ErrorBoundary } from '@/components/error-boundary'
import { SessionTimeoutProvider } from '@/lib/auth/session-timeout'
import { TourManager } from '@/components/onboarding/tour-manager'
import { platformTours } from '@/lib/tours/platform-tours'
import { EnhancedCommandPalette } from '@/components/ui/enhanced-command-palette'
import { EnhancedNotifications } from '@/components/ui/enhanced-dashboard-widgets'
import { MockDataProvider } from '@/lib/mock-data/provider'
import { NOTIFICATIONS } from '@/lib/mock-data/activities'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: User
}

// Transform notifications to the format expected by EnhancedNotifications
const mockNotifications = NOTIFICATIONS.map(n => ({
  id: n.id,
  title: n.title,
  message: n.message,
  type: n.type as 'info' | 'success' | 'warning' | 'error',
  timestamp: n.timestamp,
  read: n.read,
}))

export default function DashboardLayoutClient({
  children, user: _user
}: DashboardLayoutClientProps) {
  return (
    <OnboardingProvider>
    <MockDataProvider>
    <SessionTimeoutProvider
      config={{
        timeout: 30 * 60 * 1000,
        warningTime: 2 * 60 * 1000,
        enabled: true,
      }}
    >
      <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
        <MobileAdminNav />

        <div className="hidden lg:block w-64 flex-shrink-0">
          <SidebarEnhanced />
        </div>

        <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 pb-16 lg:pb-0 scroll-smooth">
          <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
            </div>
          </div>

          <div className="container mx-auto p-4 lg:p-6 max-w-[1600px]">
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <BreadcrumbNav labels={ROUTE_LABELS} />
              <div className="w-full sm:w-auto">
                <AdminSearch />
              </div>
            </div>

            <ErrorBoundary>
              <div className="min-h-[calc(100vh-12rem)]">
                {children}
              </div>
            </ErrorBoundary>
          </div>
        </main>

        <ActivityLogViewer />
        <KeyboardShortcutsModal />
        <TourManager
          tours={platformTours}
          autoStart={false}
          onTourComplete={(tourId, duration) => {
            console.log(`Tour ${tourId} completed in ${duration}ms`)
          }}
        />
        <EnhancedCommandPalette />
        <div className="fixed bottom-4 right-4 z-50 hidden lg:block">
          <EnhancedNotifications
            notifications={mockNotifications}
            maxVisible={3}
            position="bottom-right"
          />
        </div>
      </div>
    </SessionTimeoutProvider>
    </MockDataProvider>
    </OnboardingProvider>
  )
}

