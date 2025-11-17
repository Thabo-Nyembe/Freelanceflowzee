'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Import our 2025 GUI components
import Context7GUIProvider, {
  LightningDarkContainer,
  Spatial3DCard,
  KineticText,
  AdaptiveInterface,
  GestureControlZone,
  LiquidButton,
  NeuroCard,
  MicroInteractionButton,
  useContext7GUI
} from './enhanced-gui-2025'

import {
  VoiceCommandInterface,
  EyeTrackingInterface,
  AmbientInterface,
  ZeroUIController
} from './zero-ui-interface'

import {
  AdaptiveLayout,
  BehavioralLearningEngine,
  ContextualAdaptationEngine
} from './ai-driven-personalization'

import {
  Brain,
  Sparkles,
  Zap,
  Eye,
  Hand,
  Mic,
  Target,
  Layers3,
  Palette,
  Settings,
  ArrowLeft,
  Globe,
  Cpu
} from 'lucide-react'

interface Universal2025WrapperProps {
  children: React.ReactNode
  pageTitle: string
  pageDescription?: string
  pageIcon?: React.ComponentType<any>
  breadcrumbs?: Array<{
    label: string
    href?: string
    icon?: React.ComponentType<any>
  }>
  enableSpatial?: boolean
  enableVoice?: boolean
  enableEyeTracking?: boolean
  enableAI?: boolean
  enableGestures?: boolean
  defaultMode?: '2025' | 'standard'
  className?: string
}

// Main Universal Wrapper
export function Universal2025Wrapper({
  children,
  pageTitle,
  pageDescription,
  pageIcon: PageIcon,
  breadcrumbs = [],
  enableSpatial = true,
  enableVoice = true,
  enableEyeTracking = false,
  enableAI = true,
  enableGestures = true,
  defaultMode = 'standard',
  className
}: Universal2025WrapperProps) {
  const [guiMode, setGuiMode] = React.useState<'standard' | '2025'>(defaultMode)
  const [activeFeatures, setActiveFeatures] = React.useState({
    spatial: false,
    voice: false,
    eyeTracking: false,
    ai: enableAI,
    gestures: false,
    ambient: true
  })

  // Check if user has preference stored
  React.useEffect(() => {
    const stored = localStorage.getItem('kazi-gui-mode')
    if (stored === '2025') {
      setGuiMode('2025')
    }
  }, [])

  const toggleGuiMode = () => {
    const newMode = guiMode === 'standard' ? '2025' : 'standard'
    setGuiMode(newMode)
    localStorage.setItem('kazi-gui-mode', newMode)
  }

  const toggleFeature = (feature: keyof typeof activeFeatures) => {
    setActiveFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }))
  }

  // Standard wrapper for legacy mode
  if (guiMode === 'standard') {
    return (
      <div className={cn("min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40", className)}>
        {/* Enhanced Header */}
        <div className="border-b border-white/20 bg-white/30 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <nav className="flex items-center gap-2 text-sm text-gray-600">
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 && <span>/</span>}
                        <div className="flex items-center gap-1">
                          {crumb.icon && <crumb.icon className="h-3 w-3" />}
                          <span>{crumb.label}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </nav>
                )}

                {/* Page Title */}
                <div className="flex items-center gap-3">
                  {PageIcon && (
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <PageIcon className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                    {pageDescription && (
                      <p className="text-sm text-gray-600">{pageDescription}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mode Toggle */}
              <Button
                variant="outline"
                onClick={toggleGuiMode}
                className="gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-300"
              >
                <Sparkles className="h-4 w-4" />
                Enable 2025 GUI
              </Button>
            </div>
          </div>
        </div>

        {/* Standard Content */}
        <div className="container mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </div>
    )
  }

  // 2025 Enhanced Mode
  return (
    <Context7GUIProvider
      features={{
        spatialMode: activeFeatures.spatial,
        adaptiveTheme: 'lightning-dark',
        interactionMode: 'hybrid',
        personalizedUI: activeFeatures.ai,
        aiDrivenPersonalization: activeFeatures.ai,
        zeroUIMode: false,
        kineticTypography: true,
        microInteractions: true,
        glassmorphism: true,
        liquidDesign: true,
        spatialComputing: activeFeatures.spatial,
        gestureControls: activeFeatures.gestures,
        hapticFeedback: true,
        contextualAdaptation: true
      }}
    >
      <ZeroUIController
        features={{
          voice: activeFeatures.voice,
          gesture: activeFeatures.gestures,
          eyeTracking: activeFeatures.eyeTracking,
          ambient: activeFeatures.ambient
        }}
      >
        <LightningDarkContainer className={cn("min-h-screen", className)}>
          <AmbientInterface adaptToContext={activeFeatures.ambient}>
            <AdaptiveLayout
              profile={{
                userId: 'user-1',
                preferences: {
                  theme: 'lightning-dark',
                  layout: 'comfortable',
                  interactionStyle: 'rich',
                  animationLevel: 'enhanced'
                },
                behaviorPatterns: [],
                adaptationHistory: [],
                contextualFactors: {
                  timeOfDay: 'morning',
                  deviceType: 'desktop',
                  location: 'office',
                  workflowStage: 'active',
                  cognitiveLoad: 30
                },
                aiInsights: []
              }}
            >
              <GestureControlZone className="min-h-screen">
                {/* Enhanced 2025 Header */}
                <motion.div
                  className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                      {/* Left Side */}
                      <div className="flex items-center gap-6">
                        {/* Enhanced Breadcrumbs */}
                        {breadcrumbs.length > 0 && (
                          <nav className="flex items-center gap-2">
                            {breadcrumbs.map((crumb, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && (
                                  <motion.span
                                    className="text-gray-400"
                                    animate={{ rotate: [0, 180, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                  >
                                    /
                                  </motion.span>
                                )}
                                <motion.div
                                  className="flex items-center gap-1 text-sm text-gray-300 hover:text-white transition-colors"
                                  whileHover={{ scale: 1.05 }}
                                >
                                  {crumb.icon && <crumb.icon className="h-3 w-3" />}
                                  <span>{crumb.label}</span>
                                </motion.div>
                              </React.Fragment>
                            ))}
                          </nav>
                        )}

                        {/* Kinetic Page Title */}
                        <div className="flex items-center gap-4">
                          {PageIcon && (
                            <motion.div
                              className="p-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl"
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <PageIcon className="h-6 w-6 text-white" />
                            </motion.div>
                          )}
                          <div>
                            <KineticText
                              variant="wave"
                              trigger="auto"
                              className="text-3xl font-bold text-white"
                            >
                              {pageTitle}
                            </KineticText>
                            {pageDescription && (
                              <motion.p
                                className="text-gray-300 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                              >
                                {pageDescription}
                              </motion.p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Side - Feature Controls */}
                      <div className="flex items-center gap-3">
                        {/* Feature Toggles */}
                        <div className="flex gap-2">
                          {enableSpatial && (
                            <MicroInteractionButton
                              interaction="glow"
                              feedback="haptic"
                              className={cn(
                                "p-2 rounded-lg text-xs",
                                activeFeatures.spatial ? "bg-purple-500" : "bg-gray-600"
                              )}
                              onClick={() => toggleFeature('spatial')}
                            >
                              <Layers3 className="h-4 w-4" />
                            </MicroInteractionButton>
                          )}

                          {enableVoice && (
                            <MicroInteractionButton
                              interaction="pulse"
                              feedback="visual"
                              className={cn(
                                "p-2 rounded-lg text-xs",
                                activeFeatures.voice ? "bg-blue-500" : "bg-gray-600"
                              )}
                              onClick={() => toggleFeature('voice')}
                            >
                              <Mic className="h-4 w-4" />
                            </MicroInteractionButton>
                          )}

                          {enableEyeTracking && (
                            <MicroInteractionButton
                              interaction="morph"
                              feedback="all"
                              className={cn(
                                "p-2 rounded-lg text-xs",
                                activeFeatures.eyeTracking ? "bg-green-500" : "bg-gray-600"
                              )}
                              onClick={() => toggleFeature('eyeTracking')}
                            >
                              <Eye className="h-4 w-4" />
                            </MicroInteractionButton>
                          )}

                          {enableGestures && (
                            <MicroInteractionButton
                              interaction="shake"
                              feedback="haptic"
                              className={cn(
                                "p-2 rounded-lg text-xs",
                                activeFeatures.gestures ? "bg-orange-500" : "bg-gray-600"
                              )}
                              onClick={() => toggleFeature('gestures')}
                            >
                              <Hand className="h-4 w-4" />
                            </MicroInteractionButton>
                          )}
                        </div>

                        {/* Mode Toggle */}
                        <LiquidButton
                          variant="secondary"
                          liquidEffect={true}
                          morphOnHover={true}
                          onClick={toggleGuiMode}
                          className="gap-2"
                        >
                          <Cpu className="h-4 w-4" />
                          Standard Mode
                        </LiquidButton>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Enhanced Content Area */}
                <div className="container mx-auto px-4 sm:px-6 py-6">
                  <Enhanced2025ContentWrapper
                    spatialMode={activeFeatures.spatial}
                    aiMode={activeFeatures.ai}
                  >
                    {children}
                  </Enhanced2025ContentWrapper>
                </div>

                {/* Zero-UI Interfaces */}
                <AnimatePresence>
                  {activeFeatures.voice && (
                    <motion.div
                      className="fixed bottom-6 left-6 z-50"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    >
                      <VoiceCommandInterface
                        onCommand={(command) => {
                          console.log('Voice command:', command)
                        }}
                        isListening={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {activeFeatures.eyeTracking && (
                    <motion.div
                      className="fixed bottom-6 right-6 z-50 w-80"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    >
                      <EyeTrackingInterface
                        onGaze={(position, fixation) => {
                          if (fixation) {
                            console.log('Eye fixation at:', position)
                          }
                        }}
                        isActive={true}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </GestureControlZone>
            </AdaptiveLayout>
          </AmbientInterface>
        </LightningDarkContainer>
      </ZeroUIController>
    </Context7GUIProvider>
  )
}

// Enhanced Content Wrapper for 2025 Mode
function Enhanced2025ContentWrapper({
  children,
  spatialMode,
  aiMode
}: {
  children: React.ReactNode
  spatialMode: boolean
  aiMode: boolean
}) {
  if (spatialMode) {
    return (
      <div className="space-y-6">
        {/* Spatial Enhancement Notice */}
        <motion.div
          className="p-4 bg-purple-500/20 border border-purple-400/30 rounded-lg backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-purple-300">
            <Layers3 className="h-4 w-4" />
            <span className="text-sm">Spatial Mode Active - Interactions enhanced with 3D elements</span>
          </div>
        </motion.div>

        {/* Spatial-wrapped content */}
        <Spatial3DCard depth={0.3} className="min-h-[400px]">
          {children}
        </Spatial3DCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Enhancement Notice */}
      {aiMode && (
        <motion.div
          className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-blue-300">
            <Brain className="h-4 w-4" />
            <span className="text-sm">AI Enhancement Active - Interface adapting to your behavior</span>
          </div>
        </motion.div>
      )}

      {/* Enhanced content with glass morphism */}
      <motion.div
        className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

// Enhanced Card Component that auto-adapts
export function Enhanced2025Card({
  children,
  title,
  description,
  icon: Icon,
  className,
  ...props
}: {
  children: React.ReactNode
  title?: string
  description?: string
  icon?: React.ComponentType<any>
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const context = React.useContext(React.createContext<any>(null))

  return (
    <Card className={cn("bg-white/10 border-white/20 backdrop-blur-xl", className)} {...props}>
      {(title || description || Icon) && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {Icon && <Icon className="h-5 w-5" />}
            {title && <KineticText variant="morph">{title}</KineticText>}
          </CardTitle>
          {description && (
            <motion.p
              className="text-gray-300 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {description}
            </motion.p>
          )}
        </CardHeader>
      )}
      <CardContent className="text-white">
        {children}
      </CardContent>
    </Card>
  )
}

// Enhanced Button Component
export function Enhanced2025Button({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: {
  children: React.ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <LiquidButton
      variant={variant === 'default' ? 'primary' : variant === 'outline' ? 'secondary' : 'accent'}
      liquidEffect={true}
      morphOnHover={true}
      className={className}
      {...props}
    >
      {children}
    </LiquidButton>
  )
}

export default Universal2025Wrapper