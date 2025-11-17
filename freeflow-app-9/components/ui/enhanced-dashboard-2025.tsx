'use client'

import * as React from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Import our new 2025 GUI components
import {
  Context7GUIProvider,
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

import SpatialCanvas from './advanced-spatial-interface'

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
  Activity,
  TrendingUp,
  BarChart3,
  Users,
  Clock,
  DollarSign,
  FolderOpen,
  MessageSquare,
  Settings,
  Globe,
  Star,
  ArrowRight,
  Cpu,
  Waves,
  Focus,
  Fingerprint,
  Shield,
  Headphones,
  Volume2
} from 'lucide-react'

// Enhanced Dashboard with 2025 GUI Features
export function Enhanced2025Dashboard({
  userProfile,
  onFeatureToggle,
  className
}: {
  userProfile?: any
  onFeatureToggle?: (feature: string, enabled: boolean) => void
  className?: string
}) {
  const { scrollY } = useScroll()
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8])
  const scale = useTransform(scrollY, [0, 300], [1, 0.95])

  const [dashboardState, setDashboardState] = React.useState({
    activeMode: 'enhanced' as 'standard' | 'enhanced' | 'immersive' | 'zero-ui',
    spatialMode: false,
    voiceControlActive: false,
    eyeTrackingActive: false,
    aiPersonalizationActive: true,
    gestureControlsActive: false,
    ambientMode: true
  })

  // Mock data for demonstration
  const dashboardData = {
    stats: {
      totalProjects: 42,
      activeProjects: 12,
      completedToday: 8,
      revenue: 125430,
      efficiency: 94.2,
      aiTasksSaved: 156,
      userSatisfaction: 9.2
    },
    recentActivity: [
      { id: 1, type: 'ai-generation', message: 'AI generated 3 logo concepts for Brand X', time: '5 min ago', priority: 'high' },
      { id: 2, type: 'collaboration', message: 'Team completed design review session', time: '15 min ago', priority: 'medium' },
      { id: 3, type: 'automation', message: 'Automated invoice sent to Client Y', time: '32 min ago', priority: 'low' }
    ],
    aiInsights: [
      {
        type: 'productivity',
        insight: 'Your peak productivity hours are 9-11 AM',
        recommendation: 'Schedule creative tasks during this window',
        confidence: 0.89
      },
      {
        type: 'efficiency',
        insight: 'AI tools saved you 3.2 hours this week',
        recommendation: 'Consider automating email responses next',
        confidence: 0.76
      }
    ]
  }

  // Spatial nodes for 3D interface
  const spatialNodes = React.useMemo(() => [
    {
      id: 'projects',
      position: { x: -200, y: -100, z: 50 },
      rotation: { x: 0, y: 15, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      content: (
        <div className="p-4 text-center">
          <FolderOpen className="h-6 w-6 mx-auto mb-2 text-blue-400" />
          <div className="text-white font-medium">Projects</div>
          <div className="text-sm text-gray-300">{dashboardData.stats.totalProjects}</div>
        </div>
      ),
      connections: ['ai-tools', 'analytics'],
      metadata: { type: 'projects', priority: 'high' }
    },
    {
      id: 'ai-tools',
      position: { x: 0, y: -50, z: 100 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1.2, y: 1.2, z: 1.2 },
      content: (
        <div className="p-4 text-center">
          <Brain className="h-6 w-6 mx-auto mb-2 text-purple-400" />
          <div className="text-white font-medium">AI Studio</div>
          <div className="text-sm text-gray-300">Active</div>
        </div>
      ),
      connections: ['projects', 'analytics'],
      metadata: { type: 'ai', priority: 'high' }
    },
    {
      id: 'analytics',
      position: { x: 200, y: 0, z: 0 },
      rotation: { x: 0, y: -15, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      content: (
        <div className="p-4 text-center">
          <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-400" />
          <div className="text-white font-medium">Analytics</div>
          <div className="text-sm text-gray-300">${dashboardData.stats.revenue.toLocaleString()}</div>
        </div>
      ),
      connections: ['projects'],
      metadata: { type: 'analytics', priority: 'medium' }
    }
  ], [dashboardData.stats])

  return (
    <Context7GUIProvider
      features={{
        spatialMode: dashboardState.spatialMode,
        adaptiveTheme: 'lightning-dark',
        interactionMode: 'hybrid',
        personalizedUI: dashboardState.aiPersonalizationActive,
        aiDrivenPersonalization: true,
        zeroUIMode: dashboardState.activeMode === 'zero-ui',
        kineticTypography: true,
        microInteractions: true,
        glassmorphism: true,
        liquidDesign: true,
        spatialComputing: dashboardState.spatialMode,
        gestureControls: dashboardState.gestureControlsActive,
        hapticFeedback: true,
        contextualAdaptation: true
      }}
    >
      <ZeroUIController
        features={{
          voice: dashboardState.voiceControlActive,
          gesture: dashboardState.gestureControlsActive,
          eyeTracking: dashboardState.eyeTrackingActive,
          ambient: dashboardState.ambientMode
        }}
        onCommand={(source, command) => {
          console.log(`${source} command:`, command)
        }}
      >
        <motion.div
          className={cn("min-h-screen", className)}
          style={{ opacity, scale }}
        >
          <LightningDarkContainer className="min-h-screen">
            <AmbientInterface
              adaptToContext={dashboardState.ambientMode}
              invisible={dashboardState.activeMode === 'zero-ui'}
            >
              <AdaptiveLayout
                profile={userProfile}
                onLayoutChange={(layout) => {
                  console.log('Layout adapted:', layout)
                }}
              >
                <GestureControlZone
                  onSwipeLeft={() => console.log('Swipe left detected')}
                  onSwipeRight={() => console.log('Swipe right detected')}
                  className="min-h-screen"
                >
                  {/* Enhanced Header with Kinetic Typography */}
                  <motion.header
                    className="relative z-10 p-6 border-b border-white/10"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <KineticText
                          variant="wave"
                          trigger="auto"
                          className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                        >
                          KAZI 2025
                        </KineticText>
                        <p className="text-gray-300 mt-2">
                          Next-generation creative workspace with AI-driven personalization
                        </p>
                      </div>

                      {/* Mode Toggle Controls */}
                      <div className="flex items-center gap-3">
                        <ModeToggleControls
                          currentMode={dashboardState.activeMode}
                          onModeChange={(mode) =>
                            setDashboardState(prev => ({ ...prev, activeMode: mode }))
                          }
                          features={dashboardState}
                          onFeatureToggle={(feature, enabled) => {
                            setDashboardState(prev => ({ ...prev, [feature]: enabled }))
                            onFeatureToggle?.(feature, enabled)
                          }}
                        />
                      </div>
                    </div>
                  </motion.header>

                  {/* Conditional Rendering Based on Mode */}
                  <AnimatePresence mode="wait">
                    {dashboardState.activeMode === 'immersive' && dashboardState.spatialMode ? (
                      <motion.div
                        key="spatial"
                        className="h-screen"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5 }}
                      >
                        <SpatialCanvas
                          nodes={spatialNodes}
                          onNodeSelect={(nodeId) => console.log('Selected node:', nodeId)}
                          onNodeMove={(nodeId, position) => console.log('Moved node:', nodeId, position)}
                          className="w-full h-full"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="standard"
                        className="p-6 space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Enhanced Stats Grid */}
                        <StatsGrid
                          data={dashboardData.stats}
                          mode={dashboardState.activeMode}
                        />

                        {/* AI-Powered Dashboard Features */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Main Content Area */}
                          <div className="lg:col-span-2 space-y-6">
                            <RecentActivityFeed
                              activities={dashboardData.recentActivity}
                              enhanced={dashboardState.activeMode === 'enhanced'}
                            />

                            <ProjectOverview
                              projects={dashboardData.stats}
                              mode={dashboardState.activeMode}
                            />
                          </div>

                          {/* AI Sidebar */}
                          <div className="space-y-6">
                            <AIInsightsPanel insights={dashboardData.aiInsights} />

                            {dashboardState.aiPersonalizationActive && (
                              <BehavioralLearningEngine
                                onBehaviorUpdate={(patterns) => {
                                  console.log('Behavior patterns updated:', patterns)
                                }}
                              />
                            )}

                            <ContextualAdaptationEngine
                              onContextChange={(context) => {
                                console.log('Context changed:', context)
                              }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Zero-UI Interfaces */}
                  <AnimatePresence>
                    {dashboardState.voiceControlActive && (
                      <motion.div
                        className="fixed bottom-6 left-6 z-50"
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      >
                        <VoiceCommandInterface
                          onCommand={(command) => {
                            console.log('Voice command received:', command)
                          }}
                          isListening={true}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {dashboardState.eyeTrackingActive && (
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
        </motion.div>
      </ZeroUIController>
    </Context7GUIProvider>
  )
}

// Mode Toggle Controls
function ModeToggleControls({
  currentMode,
  onModeChange,
  features,
  onFeatureToggle
}: {
  currentMode: string
  onModeChange: (mode: any) => void
  features: any
  onFeatureToggle: (feature: string, enabled: boolean) => void
}) {
  const modes = [
    { id: 'standard', label: 'Standard', icon: Eye },
    { id: 'enhanced', label: 'Enhanced', icon: Sparkles },
    { id: 'immersive', label: 'Immersive', icon: Layers3 },
    { id: 'zero-ui', label: 'Zero UI', icon: Brain }
  ]

  return (
    <div className="flex items-center gap-3">
      {/* Mode Selector */}
      <div className="flex bg-black/40 rounded-lg p-1 backdrop-blur-xl">
        {modes.map((mode) => (
          <LiquidButton
            key={mode.id}
            variant={currentMode === mode.id ? 'primary' : 'secondary'}
            liquidEffect={true}
            morphOnHover={true}
            className="px-3 py-2 text-xs"
            onClick={() => onModeChange(mode.id)}
          >
            <mode.icon className="h-3 w-3 mr-1" />
            {mode.label}
          </LiquidButton>
        ))}
      </div>

      {/* Feature Toggles */}
      <div className="flex gap-2">
        <MicroInteractionButton
          interaction="glow"
          feedback="haptic"
          className={cn(
            "p-2 rounded-lg text-xs",
            features.spatialMode ? "bg-purple-500" : "bg-gray-600"
          )}
          onClick={() => onFeatureToggle('spatialMode', !features.spatialMode)}
        >
          <Layers3 className="h-4 w-4" />
        </MicroInteractionButton>

        <MicroInteractionButton
          interaction="pulse"
          feedback="visual"
          className={cn(
            "p-2 rounded-lg text-xs",
            features.voiceControlActive ? "bg-blue-500" : "bg-gray-600"
          )}
          onClick={() => onFeatureToggle('voiceControlActive', !features.voiceControlActive)}
        >
          <Mic className="h-4 w-4" />
        </MicroInteractionButton>

        <MicroInteractionButton
          interaction="morph"
          feedback="all"
          className={cn(
            "p-2 rounded-lg text-xs",
            features.eyeTrackingActive ? "bg-green-500" : "bg-gray-600"
          )}
          onClick={() => onFeatureToggle('eyeTrackingActive', !features.eyeTrackingActive)}
        >
          <Eye className="h-4 w-4" />
        </MicroInteractionButton>
      </div>
    </div>
  )
}

// Enhanced Stats Grid
function StatsGrid({ data, mode }: { data: any, mode: string }) {
  const stats = [
    {
      label: 'Total Projects',
      value: data.totalProjects,
      icon: FolderOpen,
      color: 'from-blue-500 to-cyan-500',
      trend: '+12%'
    },
    {
      label: 'Revenue',
      value: `$${data.revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      trend: '+24%'
    },
    {
      label: 'Efficiency',
      value: `${data.efficiency}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      trend: '+8%'
    },
    {
      label: 'AI Hours Saved',
      value: `${data.aiTasksSaved}h`,
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      trend: '+156h'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          {mode === 'enhanced' ? (
            <Spatial3DCard depth={0.5} className="p-6">
              <StatCard stat={stat} enhanced={true} />
            </Spatial3DCard>
          ) : mode === 'standard' ? (
            <NeuroCard interactive={true} variant="elevated">
              <StatCard stat={stat} enhanced={false} />
            </NeuroCard>
          ) : (
            <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
              <CardContent className="p-6">
                <StatCard stat={stat} enhanced={false} />
              </CardContent>
            </Card>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// Individual Stat Card
function StatCard({ stat, enhanced }: { stat: any, enhanced: boolean }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-2 rounded-lg",
          `bg-gradient-to-r ${stat.color}`
        )}>
          <stat.icon className="h-5 w-5 text-white" />
        </div>
        {enhanced && (
          <Badge variant="outline" className="text-xs text-green-400 border-green-400">
            {stat.trend}
          </Badge>
        )}
      </div>

      <div>
        <div className="text-2xl font-bold text-white">{stat.value}</div>
        <div className="text-sm text-gray-300">{stat.label}</div>
      </div>

      {enhanced && (
        <motion.div
          className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      )}
    </div>
  )
}

// Recent Activity Feed with enhanced visuals
function RecentActivityFeed({ activities, enhanced }: { activities: any[], enhanced: boolean }) {
  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Activity className="h-5 w-5" />
          Recent Activity
          {enhanced && (
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={enhanced ? { scale: 1.02, x: 4 } : {}}
          >
            <div className={cn(
              "w-2 h-2 rounded-full mt-2",
              activity.priority === 'high' ? "bg-red-400" :
              activity.priority === 'medium' ? "bg-yellow-400" : "bg-green-400"
            )} />
            <div className="flex-1">
              <div className="text-sm text-white">{activity.message}</div>
              <div className="text-xs text-gray-400 mt-1">{activity.time}</div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

// Project Overview with liquid design
function ProjectOverview({ projects, mode }: { projects: any, mode: string }) {
  return (
    <Card className="bg-white/5 border-white/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FolderOpen className="h-5 w-5" />
          Project Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-500/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{projects.totalProjects}</div>
            <div className="text-xs text-gray-300">Total</div>
          </div>
          <div className="text-center p-3 bg-green-500/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{projects.activeProjects}</div>
            <div className="text-xs text-gray-300">Active</div>
          </div>
          <div className="text-center p-3 bg-purple-500/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{projects.completedToday}</div>
            <div className="text-xs text-gray-300">Today</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white">
            <span>Completion Rate</span>
            <span>94%</span>
          </div>
          <Progress value={94} className="h-2" />
        </div>

        {mode === 'enhanced' && (
          <LiquidButton
            variant="accent"
            liquidEffect={true}
            className="w-full"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            View All Projects
          </LiquidButton>
        )}
      </CardContent>
    </Card>
  )
}

// AI Insights Panel
function AIInsightsPanel({ insights }: { insights: any[] }) {
  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-400/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="h-5 w-5 text-purple-400" />
          AI Insights
          <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400">
            Real-time
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            className="p-3 bg-white/5 rounded-lg border border-purple-400/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="text-sm text-white mb-2">{insight.insight}</div>
            <div className="text-xs text-purple-300 mb-2">{insight.recommendation}</div>
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-xs">
                {insight.type}
              </Badge>
              <span className="text-xs text-gray-400">
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

export default Enhanced2025Dashboard