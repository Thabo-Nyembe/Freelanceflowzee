'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'

// Import enhanced micro features
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb'
import { EnhancedSearch } from '@/components/ui/enhanced-search'
import { ContextualTooltip, HelpTooltip, FeatureTooltip } from '@/components/ui/enhanced-contextual-tooltips'
import { AnimatedElement, StaggeredContainer, AnimatedCounter } from '@/components/ui/enhanced-micro-animations'
import { MagneticButton, RippleButton, NeonButton, SlideFillButton } from '@/components/ui/enhanced-buttons'
import { GlassmorphismCard, FloatingActionButton, TextReveal, ScrollReveal, MagneticElement } from '@/components/ui/motion-enhanced'

// Import enhanced components
import { EnhancedFormField, EnhancedFormValidation } from '@/components/ui/enhanced-form-validation'
import { EnhancedLoading, SkeletonLine } from '@/components/ui/enhanced-loading-states'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import { KeyboardShortcutsDialog } from '@/components/ui/enhanced-keyboard-navigation'

import {
  Sparkles, TrendingUp, Users, MessageSquare, Settings, Palette,
  Bell, BarChart3, Zap, Star, Heart, Eye, Download, Share2,
  RefreshCw, CheckCircle, AlertTriangle, Info, Keyboard,
  MousePointer, Layers, Wand2, Boxes, Grid3x3, Clock, Shield
} from 'lucide-react'

export default function MicroFeaturesShowcase() {
  const [activeTab, setActiveTab] = React.useState('animations')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const breadcrumbItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Features', href: '/dashboard' },
    { title: 'Micro Features Showcase', href: '/dashboard/micro-features-showcase' }
  ]

  // Demo handler for buttons
  const handleDemoAction = (feature: string) => {
    console.log('🎯 MICRO FEATURES: Demo action:', feature)
    toast.success('🎯 Demo: ' + feature, {
      description: 'Feature demonstration activated'
    })
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
                  <Button onClick={() => handleDemoAction('animation')}>
                    Try Animation
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