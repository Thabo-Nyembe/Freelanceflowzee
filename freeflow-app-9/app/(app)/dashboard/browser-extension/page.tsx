'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Download, CheckCircle, Settings, Zap, Star, Users, Globe,
  Search, Filter, Clock, Image, FileText, Video, Scissors,
  Bookmark, Share2, Languages, FileDown, Activity, BarChart,
  Keyboard, Bell, Cloud, Command, ExternalLink
} from 'lucide-react'

import {
  SUPPORTED_BROWSERS,
  EXTENSION_FEATURES,
  QUICK_ACTIONS,
  MOCK_PAGE_CAPTURES,
  MOCK_EXTENSION_STATS,
  MOCK_BROWSER_EXTENSION,
  CONTEXT_MENU_ACTIONS,
  detectBrowser,
  getBrowserIcon,
  getBrowserName,
  formatFileSize,
  formatStoragePercentage,
  getStatusLabel,
  getCaptureTypeIcon,
  getActionTypeIcon,
  getTimeAgo
} from '@/lib/browser-extension-utils'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

type ViewMode = 'overview' | 'features' | 'captures' | 'settings'

export default function BrowserExtensionPage() {
  // A+++ STATE MANAGEMENT
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  // A+++ LOAD BROWSER EXTENSION DATA
  useEffect(() => {
    const loadBrowserExtensionData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load browser extension'))
            } else {
              resolve(null)
            }
          }, 1000)
        })
        setIsPageLoading(false)
        announce('Browser extension loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load browser extension')
        setIsPageLoading(false)
        announce('Error loading browser extension', 'assertive')
      }
    }
    loadBrowserExtensionData()
  }, [announce])
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [currentBrowser, setCurrentBrowser] = useState(detectBrowser())
  const [isInstalled, setIsInstalled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const storagePercentage = formatStoragePercentage(
    MOCK_EXTENSION_STATS.storageUsed,
    MOCK_EXTENSION_STATS.storageLimit
  )

  const filteredCaptures = searchQuery
    ? MOCK_PAGE_CAPTURES.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : MOCK_PAGE_CAPTURES

  // A+++ LOADING STATE
  if (isPageLoading) {
    return (
      <div className="min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 pb-20 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <ScrollReveal>
        <div className="mb-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full mb-4">
            <Globe className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium">Browser Extension</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <TextShimmer>Work Smarter, Everywhere</TextShimmer>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Bring KAZI's power to every webpage with our browser extension
          </p>
        </div>
      </ScrollReveal>

      {/* View Mode Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {[
          { id: 'overview', label: 'Overview', icon: Globe },
          { id: 'features', label: 'Features', icon: Zap },
          { id: 'captures', label: 'Captures', icon: Image },
          { id: 'settings', label: 'Settings', icon: Settings }
        ].map((mode) => {
          const Icon = mode.icon
          return (
            <Button
              key={mode.id}
              variant={viewMode === mode.id ? 'default' : 'outline'}
              onClick={() => setViewMode(mode.id as ViewMode)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {mode.label}
            </Button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview View */}
        {viewMode === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Main Installation Card */}
            <div className="lg:col-span-2 space-y-6">
              <LiquidGlassCard>
                <div className="p-8 text-center space-y-6">
                  <div className="text-6xl mb-4">{getBrowserIcon(currentBrowser)}</div>
                  <div>
                    <h2 className="text-2xl font-bold mb-2">KAZI Browser Extension</h2>
                    <p className="text-muted-foreground">
                      Quick access to all KAZI features from any webpage
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      {MOCK_BROWSER_EXTENSION.rating} rating
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {(MOCK_BROWSER_EXTENSION.downloads / 1000).toFixed(1)}K users
                    </div>
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4" />
                      {formatFileSize(MOCK_BROWSER_EXTENSION.fileSize)}
                    </div>
                  </div>

                  {!isInstalled ? (
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={() => setIsInstalled(true)}
                    >
                      <Download className="w-5 h-5" />
                      Install for {getBrowserName(currentBrowser)}
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Extension Installed</span>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Version {MOCK_BROWSER_EXTENSION.version} • Estimated install time: ~30 seconds
                  </p>
                </div>
              </LiquidGlassCard>

              {/* Browser Support */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Globe className="w-5 h-5 text-emerald-500" />
                    Supported Browsers
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {SUPPORTED_BROWSERS.map((browser) => (
                      <Card
                        key={browser.type}
                        className={`p-4 cursor-pointer transition-all ${
                          currentBrowser === browser.type
                            ? 'ring-2 ring-emerald-500'
                            : 'hover:shadow-lg'
                        }`}
                        onClick={() => setCurrentBrowser(browser.type)}
                      >
                        <div className="text-center space-y-2">
                          <div className="text-4xl">{browser.icon}</div>
                          <div>
                            <div className="font-semibold text-sm">{browser.name}</div>
                            <div className="text-xs text-muted-foreground">v{browser.minVersion}+</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    Usage Stats
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Image className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Total Captures</span>
                      </div>
                      <span className="font-semibold">{MOCK_EXTENSION_STATS.totalCaptures}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Scissors className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Web Clips</span>
                      </div>
                      <span className="font-semibold">{MOCK_EXTENSION_STATS.totalClips}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm">Quick Actions</span>
                      </div>
                      <span className="font-semibold">{MOCK_EXTENSION_STATS.totalQuickActions}</span>
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Storage */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-emerald-500" />
                    Storage
                  </h3>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Used: {formatFileSize(MOCK_EXTENSION_STATS.storageUsed)}</span>
                      <span>{storagePercentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                        style={{ width: `${storagePercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(MOCK_EXTENSION_STATS.storageLimit)} total
                    </div>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Last Sync */}
              <LiquidGlassCard>
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-emerald-500" />
                    Sync Status
                  </h3>

                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Synced</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(MOCK_EXTENSION_STATS.lastSync)}
                    </span>
                  </div>
                </div>
              </LiquidGlassCard>
            </div>
          </motion.div>
        )}

        {/* Features View */}
        {viewMode === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Extension Features */}
            <LiquidGlassCard>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-500" />
                  Extension Features
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {EXTENSION_FEATURES.map((feature) => (
                    <Card key={feature.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="text-3xl">{feature.icon}</div>
                        <Switch checked={feature.enabled} />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">{feature.name}</h4>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                      {feature.shortcut && (
                        <Badge variant="secondary" className="text-xs">
                          <Keyboard className="w-3 h-3 mr-1" />
                          {feature.shortcut}
                        </Badge>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>

            {/* Quick Actions */}
            <LiquidGlassCard>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Command className="w-5 h-5 text-emerald-500" />
                  Quick Actions
                </h3>

                <div className="space-y-2">
                  {QUICK_ACTIONS.map((action) => (
                    <div
                      key={action.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{action.icon}</div>
                        <div>
                          <div className="font-semibold">{action.name}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {action.shortcut}
                        </Badge>
                        <Switch checked={action.enabled} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Captures View */}
        {viewMode === 'captures' && (
          <motion.div
            key="captures"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search captures..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCaptures.map((capture) => (
                    <Card key={capture.id} className="p-4 space-y-3 hover:shadow-lg transition-all">
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-4xl">{getCaptureTypeIcon(capture.type)}</span>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-1 line-clamp-2">{capture.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{capture.url}</p>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {capture.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(capture.fileSize)}</span>
                        <span>{getTimeAgo(capture.timestamp)}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}

        {/* Settings View */}
        {viewMode === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            <LiquidGlassCard>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-500" />
                  General Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto Sync</div>
                      <div className="text-xs text-muted-foreground">Automatically sync captured content</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notifications</div>
                      <div className="text-xs text-muted-foreground">Show desktop notifications</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Quick Access</div>
                      <div className="text-xs text-muted-foreground">Enable quick access popup</div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>

            <LiquidGlassCard>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  AI Features
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto Summarize</div>
                      <div className="text-xs text-muted-foreground">Automatically summarize captured pages</div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto Translate</div>
                      <div className="text-xs text-muted-foreground">Auto-translate foreign language pages</div>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto Tag</div>
                      <div className="text-xs text-muted-foreground">Automatically tag content with AI</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
