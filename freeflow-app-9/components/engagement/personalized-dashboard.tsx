'use client'

/**
 * Personalized Dashboard Components
 *
 * Components that adapt to user behavior and preferences
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  ChevronRight,
  Zap,
  Users,
  BarChart3,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  useEngagement,
  usePersonalizedOnboarding,
  useActivityTracking
} from '@/hooks/use-engagement'

// ============================================================================
// PERSONALIZED GREETING
// ============================================================================

export function PersonalizedGreeting() {
  const { getPersonalizedGreeting, profile, loading } = useEngagement()

  if (loading) {
    return (
      <div className="animate-pulse h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
    )
  }

  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {getPersonalizedGreeting()}
      </h1>
      {profile?.tier && profile.tier !== 'new' && (
        <Badge
          variant="secondary"
          className={cn(
            'capitalize',
            profile.tier === 'champion' && 'bg-yellow-100 text-yellow-800',
            profile.tier === 'power' && 'bg-purple-100 text-purple-800',
            profile.tier === 'active' && 'bg-blue-100 text-blue-800'
          )}
        >
          <Zap className="w-3 h-3 mr-1" />
          {profile.tier}
        </Badge>
      )}
    </div>
  )
}

// ============================================================================
// SMART RECOMMENDATIONS PANEL
// ============================================================================

export function SmartRecommendations() {
  const router = useRouter()
  const { recommendations, dismissRecommendation, loading } = useEngagement()
  const { trackClick } = useActivityTracking()

  if (loading || recommendations.length === 0) {
    return null
  }

  const handleRecommendationClick = (rec: any) => {
    trackClick(`recommendation_${rec.type}`, { title: rec.title })
    if (rec.actionUrl) {
      router.push(rec.actionUrl)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-100 dark:border-purple-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Personalized for You
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="popLayout">
          {recommendations.slice(0, 3).map((rec, index) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleRecommendationClick(rec)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {rec.type === 'feature' && <Target className="w-4 h-4 text-blue-500" />}
                    {rec.type === 'action' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {rec.type === 'tutorial' && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                    {rec.type === 'upsell' && <Award className="w-4 h-4 text-purple-500" />}
                    <span className="font-medium text-sm">{rec.title}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {rec.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                    {rec.reason}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      dismissRecommendation(rec.id)
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ENGAGEMENT INSIGHTS CARD
// ============================================================================

export function EngagementInsights() {
  const { insights, engagementScore, loading } = useEngagement()

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Your Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Engagement Score */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Engagement Score</span>
            <span className="text-2xl font-bold text-blue-600">{engagementScore}</span>
          </div>
          <Progress value={engagementScore} className="h-2" />
        </div>

        {/* Insights */}
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, index) => (
            <div
              key={index}
              className={cn(
                'p-2 rounded-lg text-sm',
                insight.type === 'positive' && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
                insight.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300',
                insight.type === 'opportunity' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              )}
            >
              <div className="flex items-center gap-2">
                {insight.type === 'positive' && <CheckCircle2 className="w-4 h-4" />}
                {insight.type === 'warning' && <TrendingUp className="w-4 h-4" />}
                {insight.type === 'opportunity' && <Lightbulb className="w-4 h-4" />}
                <span>{insight.message}</span>
              </div>
              {insight.suggestion && (
                <p className="mt-1 text-xs opacity-80 ml-6">{insight.suggestion}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// ONBOARDING CHECKLIST
// ============================================================================

export function OnboardingChecklist() {
  const router = useRouter()
  const {
    steps,
    currentStepData,
    completed,
    progress,
    completeStep,
    skipStep,
    isNewUser,
    loading
  } = usePersonalizedOnboarding()

  if (loading || completed || !isNewUser) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Card className="w-80 shadow-lg border-2 border-purple-200 dark:border-purple-800">
        <CardHeader className="pb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStepData && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold">{currentStepData.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentStepData.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    completeStep(currentStepData.id)
                    router.push(currentStepData.actionUrl)
                  }}
                >
                  {currentStepData.action}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                {currentStepData.skippable && (
                  <Button variant="outline" onClick={skipStep}>
                    Skip
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center gap-1 mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  step.completed
                    ? 'bg-green-500'
                    : index === steps.indexOf(currentStepData!)
                      ? 'bg-purple-500'
                      : 'bg-gray-300'
                )}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// USER TIER BADGE
// ============================================================================

export function UserTierBadge() {
  const { profile, loading } = useEngagement()

  if (loading || !profile) {
    return null
  }

  const tierConfig = {
    new: { label: 'New User', color: 'bg-gray-100 text-gray-800', icon: Users },
    casual: { label: 'Casual', color: 'bg-blue-100 text-blue-800', icon: Users },
    active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: TrendingUp },
    power: { label: 'Power User', color: 'bg-purple-100 text-purple-800', icon: Zap },
    champion: { label: 'Champion', color: 'bg-yellow-100 text-yellow-800', icon: Award }
  }

  const config = tierConfig[profile.tier]
  const Icon = config.icon

  return (
    <Badge className={cn('gap-1', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

// ============================================================================
// QUICK ACTIONS BASED ON BEHAVIOR
// ============================================================================

export function SmartQuickActions() {
  const router = useRouter()
  const { profile, loading } = useEngagement()
  const { trackClick } = useActivityTracking()

  if (loading || !profile) {
    return null
  }

  // Generate actions based on top features
  const actions = profile.topFeatures.slice(0, 4).map(feature => ({
    name: feature.charAt(0).toUpperCase() + feature.slice(1).replace(/-/g, ' '),
    path: `/dashboard/${feature}-v2`,
    feature
  }))

  // Add a recommended action if user hasn't used many features
  if (profile.unusedFeatures.length > 0 && actions.length < 4) {
    const recommended = profile.unusedFeatures[0]
    actions.push({
      name: `Try ${recommended.charAt(0).toUpperCase() + recommended.slice(1)}`,
      path: `/dashboard/${recommended}-v2`,
      feature: recommended
    })
  }

  const handleAction = (action: typeof actions[0]) => {
    trackClick(`quick_action_${action.feature}`)
    router.push(action.path)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.feature}
          variant="outline"
          size="sm"
          onClick={() => handleAction(action)}
          className="hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          {action.name}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      ))}
    </div>
  )
}

// ============================================================================
// ACTIVITY TRACKER WRAPPER
// ============================================================================

export function ActivityTrackerProvider({ children }: { children: React.ReactNode }) {
  const { trackClick, trackFormSubmit, trackFeatureUse } = useActivityTracking()

  // Make tracking functions available globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Record<string, unknown>).__kaziTrack = {
        click: trackClick,
        formSubmit: trackFormSubmit,
        featureUse: trackFeatureUse
      }
    }
  }, [trackClick, trackFormSubmit, trackFeatureUse])

  return <>{children}</>
}
