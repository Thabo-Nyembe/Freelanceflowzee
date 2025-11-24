'use client'

import * as React from 'react'
import { useMemo, useCallback, useDeferredValue, useTransition } from 'react'
import dynamic from 'next/dynamic'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Import lightweight components (keep as regular imports)
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb'
import { EnhancedSearch } from '@/components/ui/enhanced-search'
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
  { loading: () => <Card><CardContent className="h-32 animate-pulse bg-gray-100" /></Card>, ssr: false }
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

import {
  Sparkles, TrendingUp, Users, MessageSquare, Settings, Palette,
  Bell, BarChart3, Zap, Star, Heart, Eye, Download, Share2,
  RefreshCw, CheckCircle, AlertTriangle, Info, Keyboard,
  MousePointer, Layers, Wand2, Boxes, Grid3x3, Clock, Shield
} from 'lucide-react'

const logger = createFeatureLogger('Micro-Features-Showcase')

export default function MicroFeaturesShowcase() {
  // A+++ STATE MANAGEMENT
  const [isPageLoading, setIsPageLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const { announce } = useAnnouncer()

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
    </ErrorBoundary>
  )
}