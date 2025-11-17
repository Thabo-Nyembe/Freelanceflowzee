'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Zap, Lock, ArrowRight, Sparkles, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { subscriptionManager, PlanType, SUBSCRIPTION_PLANS } from '@/lib/subscription/subscription-manager'
import { useRouter } from 'next/navigation'

interface FeatureGateProps {
  feature: string
  children: React.ReactNode
  userId?: string | null
  fallback?: React.ReactNode
  showUsage?: boolean
  usageType?: 'projects' | 'storage' | 'aiRequests' | 'collaborators' | 'videoMinutes'
  customMessage?: string
}

export function FeatureGate({
  feature,
  children,
  userId,
  fallback,
  showUsage = false,
  usageType,
  customMessage
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [accessInfo, setAccessInfo] = useState<any>(null)
  const [usageInfo, setUsageInfo] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAccess()
  }, [userId, feature])

  const checkAccess = async () => {
    try {
      setLoading(true)
      const result = await subscriptionManager.canUseFeature(userId, feature)
      setHasAccess(result.allowed)
      setAccessInfo(result)

      if (showUsage && usageType && userId) {
        const usage = await subscriptionManager.checkUsageLimit(userId, usageType)
        setUsageInfo(usage)
      }
    } catch (error) {
      console.error('Error checking feature access:', error)
      setHasAccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = () => {
    if (accessInfo?.upgradeUrl) {
      router.push(accessInfo.upgradeUrl)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (hasAccess) {
    return (
      <div>
        {showUsage && usageInfo && (
          <UsageIndicator usageInfo={usageInfo} usageType={usageType} />
        )}
        {children}
      </div>
    )
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return <UpgradePrompt accessInfo={accessInfo} onUpgrade={handleUpgrade} customMessage={customMessage} />
}

interface UsageIndicatorProps {
  usageInfo: any
  usageType?: string
}

function UsageIndicator({ usageInfo, usageType }: UsageIndicatorProps) {
  const { current, limit, plan } = usageInfo
  const percentage = limit === -1 ? 0 : Math.min((current / limit) * 100, 100)

  const getUsageLabel = (type?: string) => {
    switch (type) {
      case 'projects': return 'Projects'
      case 'storage': return 'Storage (GB)'
      case 'aiRequests': return 'AI Requests'
      case 'collaborators': return 'Collaborators'
      case 'videoMinutes': return 'Video Minutes'
      default: return 'Usage'
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500'
    if (percentage < 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (limit === -1) {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50">
        <Sparkles className="w-4 h-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>{getUsageLabel(usageType)}: Unlimited</strong> with your {plan} plan
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className={`mb-4 ${percentage > 90 ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${percentage > 90 ? 'text-red-600' : 'text-blue-600'}`} />
            <span className={`text-sm font-medium ${percentage > 90 ? 'text-red-800' : 'text-blue-800'}`}>
              {getUsageLabel(usageType)}: {current} / {limit}
            </span>
          </div>
          <Progress
            value={percentage}
            className={`h-2 ${getUsageColor(percentage)}`}
          />
        </div>
        {percentage > 80 && (
          <Badge variant={percentage > 90 ? 'destructive' : 'secondary'} className="ml-3">
            {percentage > 90 ? 'Limit Reached' : 'Near Limit'}
          </Badge>
        )}
      </div>
    </Alert>
  )
}

interface UpgradePromptProps {
  accessInfo: any
  onUpgrade: () => void
  customMessage?: string
}

function UpgradePrompt({ accessInfo, onUpgrade, customMessage }: UpgradePromptProps) {
  const currentPlan = accessInfo?.currentPlan || 'free'
  const planInfo = SUBSCRIPTION_PLANS[currentPlan as PlanType]
  const nextPlan = currentPlan === 'free' ? 'professional' : 'enterprise'
  const nextPlanInfo = SUBSCRIPTION_PLANS[nextPlan as PlanType]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-6"
      >
        <Card className="relative overflow-hidden border-gradient-to-r from-purple-200 to-blue-200 shadow-xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600" />
          </div>

          <CardHeader className="relative text-center">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
            >
              {currentPlan === 'free' ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Sparkles className="w-8 h-8 text-white" />
              )}
            </motion.div>

            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {customMessage || 'Unlock Premium Features'}
            </CardTitle>

            <p className="text-muted-foreground mt-2">
              {accessInfo?.reason || 'Upgrade your plan to access this powerful feature'}
            </p>
          </CardHeader>

          <CardContent className="relative space-y-6">
            {/* Current Plan */}
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{planInfo.name}</h4>
                    <p className="text-sm text-gray-600">Current Plan</p>
                  </div>
                </div>
                <Badge variant="secondary">${planInfo.price}/month</Badge>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {planInfo.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Upgrade Plan */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    {nextPlan === 'professional' ? (
                      <Zap className="w-4 h-4 text-white" />
                    ) : (
                      <Crown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-purple-800">{nextPlanInfo.name}</h4>
                    <p className="text-sm text-purple-600">Recommended Upgrade</p>
                  </div>
                </div>
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  ${nextPlanInfo.price}/month
                </Badge>
              </div>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {nextPlanInfo.features.slice(0, 4).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-purple-700">
                    <Star className="w-3 h-3 text-purple-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <Button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
                size="lg"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Upgrade to {nextPlanInfo.name}
              </Button>
            </div>

            {/* Value Proposition */}
            <div className="text-center text-sm text-muted-foreground">
              <p>🚀 Join 12,000+ creators who've upgraded their workflow</p>
              <p className="mt-1">💰 30-day money-back guarantee • Cancel anytime</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

export default FeatureGate