'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Star,
  Crown,
  TrendingUp,
  Users,
  BarChart3,
  Bot,
  Layers,
  Globe
} from 'lucide-react'

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

export const dynamic = 'force-dynamic'

// ============================================================================
// V2 COMPETITIVE MOCK DATA - UpgradesShowcase Context
// ============================================================================

const upgradesShowcaseAIInsights = [
  { id: '1', type: 'info' as const, title: 'Performance Update', description: 'System running optimally with 99.9% uptime this month.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Performance' },
  { id: '2', type: 'success' as const, title: 'Goal Achievement', description: 'Monthly targets exceeded by 15%. Great progress!', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Goals' },
  { id: '3', type: 'warning' as const, title: 'Action Required', description: 'Review pending items to maintain workflow efficiency.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Tasks' },
]

const upgradesShowcaseCollaborators = [
  { id: '1', name: 'Alexandra Chen', avatar: '/avatars/alex.jpg', status: 'online' as const, role: 'Manager', lastActive: 'Now' },
  { id: '2', name: 'Marcus Johnson', avatar: '/avatars/marcus.jpg', status: 'online' as const, role: 'Developer', lastActive: '5m ago' },
  { id: '3', name: 'Sarah Williams', avatar: '/avatars/sarah.jpg', status: 'away' as const, role: 'Designer', lastActive: '30m ago' },
]

const upgradesShowcasePredictions = [
  { id: '1', label: 'Completion Rate', current: 85, target: 95, predicted: 92, confidence: 88, trend: 'up' as const },
  { id: '2', label: 'Efficiency Score', current: 78, target: 90, predicted: 86, confidence: 82, trend: 'up' as const },
]

const upgradesShowcaseActivities = [
  { id: '1', user: 'Alexandra Chen', action: 'updated', target: 'system settings', timestamp: '5m ago', type: 'info' as const },
  { id: '2', user: 'Marcus Johnson', action: 'completed', target: 'task review', timestamp: '15m ago', type: 'success' as const },
  { id: '3', user: 'System', action: 'generated', target: 'weekly report', timestamp: '1h ago', type: 'info' as const },
]

const upgradesShowcaseQuickActions = [
  { id: '1', label: 'New Item', icon: 'Plus', shortcut: 'N', action: () => console.log('New') },
  { id: '2', label: 'Export', icon: 'Download', shortcut: 'E', action: () => console.log('Export') },
  { id: '3', label: 'Settings', icon: 'Settings', shortcut: 'S', action: () => console.log('Settings') },
]

// Available upgrades
const upgrades = [
  {
    id: 'ai-assistant',
    name: 'AI Assistant Pro',
    description: 'Advanced AI-powered assistance for all your tasks with Claude 3.5, GPT-4, and Gemini integration',
    icon: Bot,
    tier: 'premium',
    price: '$29/month',
    features: ['Unlimited AI queries', 'Priority processing', 'Custom AI training', 'Multi-model routing'],
    popular: true,
  },
  {
    id: 'team-collaboration',
    name: 'Team Collaboration Suite',
    description: 'Real-time collaboration tools including video calls, screen sharing, and whiteboarding',
    icon: Users,
    tier: 'business',
    price: '$49/month',
    features: ['Unlimited team members', 'Video conferencing', 'Real-time whiteboard', 'Team analytics'],
    popular: false,
  },
  {
    id: 'analytics-pro',
    name: 'Analytics Pro',
    description: 'Deep insights and predictive analytics for your business performance',
    icon: BarChart3,
    tier: 'business',
    price: '$39/month',
    features: ['Predictive analytics', 'Custom dashboards', 'Export reports', 'API access'],
    popular: true,
  },
  {
    id: 'enterprise-security',
    name: 'Enterprise Security',
    description: 'Advanced security features including SSO, audit logs, and compliance tools',
    icon: Shield,
    tier: 'enterprise',
    price: '$99/month',
    features: ['SSO integration', 'Audit logging', 'Compliance reports', 'Custom SLA'],
    popular: false,
  },
  {
    id: 'global-cdn',
    name: 'Global CDN',
    description: 'Lightning-fast content delivery with edge caching across 200+ locations',
    icon: Globe,
    tier: 'premium',
    price: '$19/month',
    features: ['200+ edge locations', '99.99% uptime', 'DDoS protection', 'Custom domains'],
    popular: false,
  },
  {
    id: 'workflow-automation',
    name: 'Workflow Automation',
    description: 'Automate repetitive tasks with powerful workflow builder and integrations',
    icon: Layers,
    tier: 'business',
    price: '$35/month',
    features: ['Visual workflow builder', '100+ integrations', 'Scheduled automation', 'Webhooks'],
    popular: true,
  },
]

const tierColors = {
  premium: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  business: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  enterprise: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
}

export default function UpgradesShowcaseClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Rocket className="h-8 w-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Upgrade Your Experience
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock powerful features and take your productivity to the next level
          </p>
        </div>

        {/* V2 Competitive Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AIInsightsPanel
            insights={upgradesShowcaseAIInsights}
            onInsightClick={(insight) => console.log('Insight clicked:', insight)}
          />
          <CollaborationIndicator
            collaborators={upgradesShowcaseCollaborators}
            onCollaboratorClick={(c) => console.log('Collaborator:', c)}
          />
          <PredictiveAnalytics
            predictions={upgradesShowcasePredictions}
            onPredictionClick={(p) => console.log('Prediction:', p)}
          />
        </div>

        {/* Quick Actions */}
        <QuickActionsToolbar actions={upgradesShowcaseQuickActions} />

        {/* Current Plan Summary */}
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold dark:text-white">Current Plan: Professional</h3>
                  <p className="text-gray-600 dark:text-gray-300">You're using 75% of your plan limits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  3 upgrades available
                </Badge>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrades Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upgrades.map((upgrade) => (
            <Card
              key={upgrade.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 ${
                upgrade.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {upgrade.popular && (
                <div className="absolute top-0 right-0">
                  <Badge className="rounded-none rounded-bl-lg bg-purple-600">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <upgrade.icon className="h-6 w-6 text-purple-600" />
                  </div>
                  <Badge className={tierColors[upgrade.tier as keyof typeof tierColors]}>
                    {upgrade.tier}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{upgrade.name}</CardTitle>
                <CardDescription>{upgrade.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-2xl font-bold text-purple-600">{upgrade.price}</div>
                <ul className="space-y-2">
                  {upgrade.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Zap className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={upgrade.popular ? 'default' : 'outline'}>
                  Get {upgrade.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Activity Feed */}
        <ActivityFeed
          activities={upgradesShowcaseActivities}
          onActivityClick={(a) => console.log('Activity:', a)}
        />

        {/* Compare Plans CTA */}
        <Card className="text-center p-8">
          <h3 className="text-2xl font-bold mb-4 dark:text-white">Not sure which upgrade is right for you?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
            Compare all features and find the perfect plan for your needs
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg">
              Compare Plans
            </Button>
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
