'use client'

import { useState, useEffect } from 'react'
import { SidebarEnhanced } from '@/components/navigation/sidebar-enhanced'
import { MobileAdminNav } from '@/components/admin/mobile-admin-nav'
import { ErrorBoundary } from '@/components/error-boundary'
import { OnboardingProvider } from '@/components/onboarding/onboarding-provider'
import { EngagementProvider } from '@/components/engagement/engagement-provider'
import { AnnouncementsBanner } from '@/components/dashboard/announcements-banner'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeft, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SidebarProvider, useSidebar } from '@/lib/sidebar-context'

interface UserData {
  id: string
  email: string
  user_metadata: { name: string }
}

interface DashboardLayoutClientProps {
  children: React.ReactNode
  user: UserData
}

function DashboardLayoutInner({ children, user }: DashboardLayoutClientProps) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Load saved fullscreen state on mount
  useEffect(() => {
    const savedFullscreen = localStorage.getItem('dashboard-fullscreen')
    if (savedFullscreen === 'true') setIsFullscreen(true)
  }, [])

  // Save fullscreen state changes
  useEffect(() => {
    localStorage.setItem('dashboard-fullscreen', String(isFullscreen))
  }, [isFullscreen])

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev)
  }

  // Keyboard shortcut: Cmd/Ctrl + Shift + F to toggle fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && e.shiftKey) {
        e.preventDefault()
        toggleFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <OnboardingProvider>
      <EngagementProvider userId={user.id}>
          <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
            <MobileAdminNav />

            {/* Collapsible Sidebar */}
            <div
              className={cn(
                'hidden lg:block flex-shrink-0 transition-all duration-300 ease-in-out',
                isCollapsed ? 'w-0 overflow-hidden' : 'w-64',
                isFullscreen && 'hidden'
              )}
            >
              <SidebarEnhanced />
            </div>

            {/* Main Content Area */}
            <main
              role="main"
              className={cn(
                'flex-1 overflow-y-auto pt-16 lg:pt-0 pb-16 lg:pb-0 scroll-smooth',
                'transition-all duration-300'
              )}
            >
              {/* Desktop Header with Toggle Buttons */}
              <div className="hidden lg:flex sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-4 py-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="h-8 w-8"
                    title={isCollapsed ? 'Show sidebar (Ctrl+B)' : 'Hide sidebar (Ctrl+B)'}
                  >
                    {isCollapsed ? (
                      <PanelLeft className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )}
                  </Button>
                  {isCollapsed && (
                    <h1 className="text-lg font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="h-8 w-8"
                    title={isFullscreen ? 'Exit fullscreen (Ctrl+Shift+F)' : 'Fullscreen (Ctrl+Shift+F)'}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Mobile Header */}
              <div className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h1 className="text-xl font-semibold text-black dark:text-white kazi-headline">KAZI</h1>
                </div>
              </div>

              <div className={cn(
                'container mx-auto p-4 lg:p-6 transition-all duration-300',
                isFullscreen ? 'max-w-full' : 'max-w-[1600px]'
              )}>
                <AnnouncementsBanner />
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </EngagementProvider>
      </OnboardingProvider>
  )
}

export default function DashboardLayoutClient(props: DashboardLayoutClientProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutInner {...props} />
    </SidebarProvider>
  )
}
