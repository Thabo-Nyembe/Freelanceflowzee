'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  CreditCard,
  Download,
  Save,
  Info
} from 'lucide-react'

const logger = createSimpleLogger('Settings')

interface SettingsTab {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const tabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: User, href: '/dashboard/settings' },
  { id: 'notifications', label: 'Notifications', icon: Bell, href: '/dashboard/settings/notifications' },
  { id: 'security', label: 'Security', icon: Shield, href: '/dashboard/settings/security' },
  { id: 'appearance', label: 'Appearance', icon: Palette, href: '/dashboard/settings/appearance' },
  { id: 'billing', label: 'Billing', icon: CreditCard, href: '/dashboard/settings/billing' },
  { id: 'advanced', label: 'Advanced', icon: Settings, href: '/dashboard/settings/advanced' }
]

export default function SettingsLayout({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // Load settings data
  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)

        // Simulate data loading with potential error
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load settings'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsPageLoading(false)
        announce('Settings loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings')
        setIsPageLoading(false)
        announce('Error loading settings', 'assertive')
      }
    }

    loadSettingsData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getActiveTab = () => {
    if (pathname === '/dashboard/settings') return 'profile'
    if (pathname.includes('/notifications')) return 'notifications'
    if (pathname.includes('/security')) return 'security'
    if (pathname.includes('/appearance')) return 'appearance'
    if (pathname.includes('/billing')) return 'billing'
    if (pathname.includes('/advanced')) return 'advanced'
    return 'profile'
  }

  const activeTab = getActiveTab()

  const handleExportData = () => {
    // This will be handled by individual pages
    logger.info('Export data requested from layout')
  }

  const handleSave = () => {
    // This will be handled by individual pages
    logger.info('Save requested from layout')
  }

  // Loading state
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <ListSkeleton items={6} />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <ErrorEmptyState
          error={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <LiquidGlassCard className="border-b border-slate-700/50 p-6 rounded-none">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-600" />
              <TextShimmer className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-violet-900 bg-clip-text text-transparent">
                Settings & Preferences
              </TextShimmer>
              <Badge className="bg-gradient-to-r from-purple-500 to-violet-600 text-white">A+++</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-400">Customize your experience</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button data-testid="export-settings-btn" variant="outline" size="sm" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>

            <Button data-testid="save-changes-btn" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50">
        <div className="p-6 pb-0">
          <div className="grid grid-cols-6 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  data-testid={`${tab.id}-tab`}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-3 rounded-t-lg border-b-2 transition-all
                    ${isActive
                      ? 'border-purple-500 bg-slate-900/50 text-white'
                      : 'border-transparent hover:bg-slate-800/30 text-gray-400 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
