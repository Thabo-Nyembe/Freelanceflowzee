'use client'
// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'


import * as React from 'react'
import { useMemo, useCallback, useDeferredValue, useTransition, useState } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'

// Import lightweight components (keep as regular imports)
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'

// A++++ DYNAMIC IMPORTS - Lazy load heavy showcase components
const ContextualTooltip = dynamic(
  () => import('@/components/ui/enhanced-contextual-tooltips').then(mod => mod.ContextualTooltip),
  { loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const HelpTooltip = dynamic(
  () => import('@/components/ui/enhanced-contextual-tooltips').then(mod => mod.HelpTooltip),
  { loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const FeatureTooltip = dynamic(
  () => import('@/components/ui/enhanced-contextual-tooltips').then(mod => mod.FeatureTooltip),
  { loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

const AnimatedElement = dynamic(
  () => import('@/components/ui/enhanced-micro-animations').then(mod => mod.AnimatedElement),
  { loading: () => <div className="h-16 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const StaggeredContainer = dynamic(
  () => import('@/components/ui/enhanced-micro-animations').then(mod => mod.StaggeredContainer),
  { loading: () => <div className="h-20 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const AnimatedCounter = dynamic(
  () => import('@/components/ui/enhanced-micro-animations').then(mod => mod.AnimatedCounter),
  { loading: () => <div className="h-12 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

const MagneticButton = dynamic(
  () => import('@/components/ui/enhanced-buttons').then(mod => mod.MagneticButton),
  { loading: () => <Button disabled>Loading...</Button>, ssr: false }
)
const RippleButton = dynamic(
  () => import('@/components/ui/enhanced-buttons').then(mod => mod.RippleButton),
  { loading: () => <Button disabled>Loading...</Button>, ssr: false }
)
const NeonButton = dynamic(
  () => import('@/components/ui/enhanced-buttons').then(mod => mod.NeonButton),
  { loading: () => <Button disabled>Loading...</Button>, ssr: false }
)
const SlideFillButton = dynamic(
  () => import('@/components/ui/enhanced-buttons').then(mod => mod.SlideFillButton),
  { loading: () => <Button disabled>Loading...</Button>, ssr: false }
)

const GlassmorphismCard = dynamic(
  () => import('@/components/ui/motion-enhanced').then(mod => mod.GlassmorphismCard),
  { loading: () => <Card><CardContent className="h-32 animate-pulse bg-gray-100 dark:bg-slate-700" /></Card>, ssr: false }
)
const FloatingActionButton = dynamic(
  () => import('@/components/ui/motion-enhanced').then(mod => mod.FloatingActionButton),
  { loading: () => <Button disabled>Loading...</Button>, ssr: false }
)
const TextReveal = dynamic(
  () => import('@/components/ui/motion-enhanced').then(mod => mod.TextReveal),
  { loading: () => <div className="h-8 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const ScrollReveal = dynamic(
  () => import('@/components/ui/motion-enhanced').then(mod => mod.ScrollReveal),
  { loading: () => <div className="h-16 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const MagneticElement = dynamic(
  () => import('@/components/ui/motion-enhanced').then(mod => mod.MagneticElement),
  { loading: () => <div className="h-16 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

const EnhancedFormField = dynamic(
  () => import('@/components/ui/enhanced-form-validation').then(mod => mod.EnhancedFormField),
  { loading: () => <div className="h-12 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const EnhancedFormValidation = dynamic(
  () => import('@/components/ui/enhanced-form-validation').then(mod => mod.EnhancedFormValidation),
  { loading: () => <div className="h-12 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

const EnhancedLoading = dynamic(
  () => import('@/components/ui/enhanced-loading-states').then(mod => mod.EnhancedLoading),
  { loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)
const SkeletonLine = dynamic(
  () => import('@/components/ui/enhanced-loading-states').then(mod => mod.SkeletonLine),
  { loading: () => <div className="h-4 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

const KeyboardShortcutsDialog = dynamic(
  () => import('@/components/ui/enhanced-keyboard-navigation').then(mod => mod.KeyboardShortcutsDialog),
  { loading: () => <div className="h-64 w-full bg-gray-100 animate-pulse rounded" />, ssr: false }
)

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

const logger = createFeatureLogger('MicroFeaturesShowcase')


// ============================================================================
// V2 COMPETITIVE MOCK DATA - MicroFeaturesShowcase Context
// ============================================================================

const microFeaturesShowcaseAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const microFeaturesShowcaseCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const microFeaturesShowcasePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const microFeaturesShowcaseActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

export default function MicroFeaturesShowcaseClient() {
  // A+++ STATE MANAGEMENT
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isPageLoading, setIsPageLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Dialog state management for quick actions
  const [showNewItemDialog, setShowNewItemDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // New Item form state
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState('component')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemPriority, setNewItemPriority] = useState('medium')

  // Export form state
  const [exportFormat, setExportFormat] = useState('json')
  const [exportIncludeAnimations, setExportIncludeAnimations] = useState(true)
  const [exportIncludeTooltips, setExportIncludeTooltips] = useState(true)
  const [exportIncludeButtons, setExportIncludeButtons] = useState(true)
  const [exportDateRange, setExportDateRange] = useState('all')

  // Settings form state
  const [settingsAnimationsEnabled, setSettingsAnimationsEnabled] = useState(true)
  const [settingsAnimationSpeed, setSettingsAnimationSpeed] = useState('normal')
  const [settingsTooltipDelay, setSettingsTooltipDelay] = useState('200')
  const [settingsAutoSave, setSettingsAutoSave] = useState(true)
  const [settingsTheme, setSettingsTheme] = useState('system')

  // Handler for creating new item
  const handleCreateNewItem = useCallback(async () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      toast.success('New item created successfully', {
        description: `${newItemName} (${newItemType}) has been added to your showcase`
      })
      setShowNewItemDialog(false)
      setNewItemName('')
      setNewItemDescription('')
      setNewItemType('component')
      setNewItemPriority('medium')
    } catch {
      toast.error('Failed to create item')
    }
  }, [newItemName, newItemType])

  // Handler for export
  const handleExport = useCallback(async () => {
    const selectedFeatures = []
    if (exportIncludeAnimations) selectedFeatures.push('animations')
    if (exportIncludeTooltips) selectedFeatures.push('tooltips')
    if (exportIncludeButtons) selectedFeatures.push('buttons')

    if (selectedFeatures.length === 0) {
      toast.error('Please select at least one feature to export')
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Export completed successfully', {
        description: `Exported ${selectedFeatures.join(', ')} in ${exportFormat.toUpperCase()} format`
      })
      setShowExportDialog(false)
    } catch {
      toast.error('Failed to export data')
    }
  }, [exportFormat, exportIncludeAnimations, exportIncludeTooltips, exportIncludeButtons])

  // Handler for saving settings
  const handleSaveSettings = useCallback(async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Settings saved successfully', {
        description: `Animation: ${settingsAnimationsEnabled ? 'On' : 'Off'}, Speed: ${settingsAnimationSpeed}, Theme: ${settingsTheme}`
      })
      setShowSettingsDialog(false)
    } catch {
      toast.error('Failed to save settings')
    }
  }, [settingsAnimationsEnabled, settingsAnimationSpeed, settingsTheme])

  // Quick actions with real dialog functionality
  const microFeaturesShowcaseQuickActions = useMemo(() => [
    { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => setShowNewItemDialog(true) },
    { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => setShowExportDialog(true) },
    { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => setShowSettingsDialog(true) },
  ], [])

  React.useEffect(() => {
    if (userId) {
      logger.info('Micro Features Showcase loaded', { userId })
      announce('Micro features showcase loaded', 'polite')
    }
  }, [userId, announce])

  const [activeTab, setActiveTab] = React.useState('animations')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // A++++ PERFORMANCE HOOKS
  // useTransition for non-blocking demo actions
  const [isPending, startTransition] = useTransition()

  // useDeferredValue to keep search input responsive during filtering
  const deferredSearchQuery = useDeferredValue(searchQuery)

  // Memoize breadcrumb items to prevent re-creation
  const breadcrumbItems = useMemo(() => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Features', href: '/dashboard' },
    { title: 'Micro Features Showcase', href: '/dashboard/micro-features-showcase' }
  ], [])

  // A+++ LOAD MICRO FEATURES DATA
  React.useEffect(() => {
    const loadMicroFeaturesData = async () => {
      try {
        setIsPageLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load micro features'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsPageLoading(false)
        announce('Micro features showcase loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load micro features')
        setIsPageLoading(false)
        announce('Error loading micro features showcase', 'assertive')
      }
    }

    loadMicroFeaturesData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // A++++ STABLE CALLBACK - Demo handler with useTransition for non-blocking UI
  const handleDemoAction = useCallback((feature: string) => {
    startTransition(() => {
      logger.info('Demo action triggered', {
        feature,
        component: 'micro-features-showcase',
        timestamp: new Date().toISOString()
      })

      const featureType = feature.toLowerCase().includes('animation') ? 'Animation' :
                         feature.toLowerCase().includes('button') ? 'Button' :
                         feature.toLowerCase().includes('tooltip') ? 'Tooltip' :
                         feature.toLowerCase().includes('form') ? 'Form' : 'Component'

      toast.success(`Demo: ${feature}`, {
        description: `${featureType} feature demonstration activated - Micro features showcase - Interactive preview enabled`
      })
    })
  }, [])

  // A+++ LOADING STATE
  if (isPageLoading) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          
        {/* V2 Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <AIInsightsPanel insights={microFeaturesShowcaseAIInsights} />
          <PredictiveAnalytics predictions={microFeaturesShowcasePredictions} />
          <CollaborationIndicator collaborators={microFeaturesShowcaseCollaborators} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <QuickActionsToolbar actions={microFeaturesShowcaseQuickActions} />
          <ActivityFeed activities={microFeaturesShowcaseActivities} />
        </div>
<DashboardSkeleton />
        </div>
      </ErrorBoundary>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <ErrorBoundary>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto mt-20">
            <ErrorEmptyState
              error={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-4">
          <EnhancedBreadcrumb items={breadcrumbItems} />
          <h1 className="text-4xl font-bold">Micro Features Showcase</h1>
          <p className="text-muted-foreground">
            Explore enhanced micro-interactions and components
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="animations">Animations</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="tooltips">Tooltips</TabsTrigger>
          </TabsList>

          <TabsContent value="animations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Micro Animations</CardTitle>
                <CardDescription>Smooth, delightful animations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleDemoAction('animation')}
                    disabled={isPending}
                  >
                    {isPending ? 'Loading...' : 'Try Animation'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MagneticButton>Magnetic Button</MagneticButton>
                <RippleButton>Ripple Button</RippleButton>
                <NeonButton>Neon Button</NeonButton>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tooltips" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contextual Tooltips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ContextualTooltip content="Contextual help">
                  <Button>Hover for tooltip</Button>
                </ContextualTooltip>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Item Dialog */}
      <Dialog open={showNewItemDialog} onOpenChange={setShowNewItemDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Micro Feature Item</DialogTitle>
            <DialogDescription>
              Add a new component, animation, or interaction to your showcase.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                placeholder="Enter item name..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-type">Item Type</Label>
              <Select value={newItemType} onValueChange={setNewItemType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="component">Component</SelectItem>
                  <SelectItem value="animation">Animation</SelectItem>
                  <SelectItem value="interaction">Interaction</SelectItem>
                  <SelectItem value="tooltip">Tooltip</SelectItem>
                  <SelectItem value="button">Button Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-priority">Priority</Label>
              <Select value={newItemPriority} onValueChange={setNewItemPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-description">Description</Label>
              <Textarea
                id="item-description"
                placeholder="Describe the micro feature..."
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewItem}>
              Create Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Export Micro Features</DialogTitle>
            <DialogDescription>
              Export your micro features configuration and data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="yaml">YAML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="export-date-range">Date Range</Label>
              <Select value={exportDateRange} onValueChange={setExportDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Include Features</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-animations"
                  checked={exportIncludeAnimations}
                  onCheckedChange={(checked) => setExportIncludeAnimations(checked === true)}
                />
                <Label htmlFor="export-animations" className="font-normal">
                  Animations ({microFeaturesShowcaseActivities.length} items)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-tooltips"
                  checked={exportIncludeTooltips}
                  onCheckedChange={(checked) => setExportIncludeTooltips(checked === true)}
                />
                <Label htmlFor="export-tooltips" className="font-normal">
                  Tooltips & Contextual Help
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-buttons"
                  checked={exportIncludeButtons}
                  onCheckedChange={(checked) => setExportIncludeButtons(checked === true)}
                />
                <Label htmlFor="export-buttons" className="font-normal">
                  Enhanced Buttons & Interactions
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              Export Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Micro Features Settings</DialogTitle>
            <DialogDescription>
              Configure your micro features showcase preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Animations</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle micro animations on or off
                </p>
              </div>
              <Switch
                checked={settingsAnimationsEnabled}
                onCheckedChange={setSettingsAnimationsEnabled}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="animation-speed">Animation Speed</Label>
              <Select value={settingsAnimationSpeed} onValueChange={setSettingsAnimationSpeed}>
                <SelectTrigger>
                  <SelectValue placeholder="Select speed" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slow">Slow (1.5x duration)</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="fast">Fast (0.5x duration)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tooltip-delay">Tooltip Delay (ms)</Label>
              <Select value={settingsTooltipDelay} onValueChange={setSettingsTooltipDelay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select delay" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Instant (0ms)</SelectItem>
                  <SelectItem value="100">Quick (100ms)</SelectItem>
                  <SelectItem value="200">Normal (200ms)</SelectItem>
                  <SelectItem value="500">Slow (500ms)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme Preference</Label>
              <Select value={settingsTheme} onValueChange={setSettingsTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="light">Light Mode</SelectItem>
                  <SelectItem value="dark">Dark Mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save Settings</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes as you make them
                </p>
              </div>
              <Switch
                checked={settingsAutoSave}
                onCheckedChange={setSettingsAutoSave}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  )
}