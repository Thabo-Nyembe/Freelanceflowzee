"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  LineChart,
  Users,
  Target,
  Sparkles,
  Activity,
  Trophy,
  TrendingUp,
  DollarSign,
  Calendar,
  Rocket,
} from 'lucide-react'

// Import all competitive upgrade components
import {
  AIInsightsPanel,
  Sparkline,
  ProgressRing,
  TrendIndicator,
  MetricCard,
  CollaborationIndicator,
  InlineComment,
  PredictiveAnalytics,
  DataStory,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  GoalTracker,
  SmartSearch,
  QuickActionsToolbar,
  GamificationWidget,
} from '@/components/ui/competitive-upgrades-extended'

// ============================================================================
// TYPE IMPORTS FOR EMPTY ARRAYS
// ============================================================================

import type {
  AIInsight,
  Collaborator,
  Comment,
  Prediction,
  StorySegment,
} from '@/components/ui/competitive-upgrades'

import type {
  ActivityItem,
  Goal,
  QuickAction,
  Achievement,
  UserStats,
} from '@/components/ui/competitive-upgrades-extended'

// ============================================================================
// EMPTY DATA ARRAYS (No mock data - will be populated from real data sources)
// ============================================================================

const insights: AIInsight[] = []
const collaborators: Collaborator[] = []
const predictions: Prediction[] = []
const storySegments: StorySegment[] = []
const activities: ActivityItem[] = []
const goals: Goal[] = []
const achievements: Achievement[] = []
const quickActions: QuickAction[] = []

const comment: Comment | null = null

const userStats: UserStats = {
  level: 0,
  currentXP: 0,
  nextLevelXP: 0,
  streak: 0,
  totalAchievements: 0,
  rank: 0,
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UpgradesShowcaseClient() {
  const [activeTab, setActiveTab] = useState('ai-insights')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Rocket className="h-8 w-8 text-violet-600" />
              Competitive Upgrades Showcase
            </h1>
            <p className="text-muted-foreground mt-1">
              Premium features that beat Monday.com, HubSpot, Salesforce, Asana, and Notion
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <Sparkles className="h-3 w-3 mr-1" />
            2025 Edition
          </Badge>
        </div>

        {/* Feature Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="ai-insights" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </TabsTrigger>
            <TabsTrigger value="visualizations" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" />
              <span className="hidden sm:inline">Micro-Viz</span>
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Collab</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
            <TabsTrigger value="gamification" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Gamify</span>
            </TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              /* AIInsightsPanel removed - use header button */
              <PredictiveAnalytics predictions={predictions} />
            </div>
            {storySegments.length > 0 && (
              <DataStory
                title="Weekly Performance Report"
                subtitle="AI-generated insights from your data"
                segments={storySegments}
              />
            )}
          </TabsContent>

          {/* Micro-Visualizations Tab */}
          <TabsContent value="visualizations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Revenue"
                value="$125,430"
                previousValue={102000}
                currentValue={125430}
                icon={<DollarSign className="h-5 w-5" />}
                sparklineData={[80, 95, 88, 102, 110, 118, 125]}
                trend="up"
                description="vs $102K last month"
              />
              <MetricCard
                title="Active Users"
                value="12,847"
                previousValue={11200}
                currentValue={12847}
                icon={<Users className="h-5 w-5" />}
                sparklineData={[9800, 10200, 10800, 11200, 11600, 12200, 12847]}
                trend="up"
                description="14.7% increase"
              />
              <MetricCard
                title="Conversion Rate"
                value="4.2%"
                previousValue={3.8}
                currentValue={4.2}
                icon={<TrendingUp className="h-5 w-5" />}
                sparklineData={[3.2, 3.4, 3.6, 3.8, 3.9, 4.0, 4.2]}
                trend="up"
                description="+0.4% this week"
              />
              <MetricCard
                title="Avg Session"
                value="8m 24s"
                previousValue={420}
                currentValue={504}
                icon={<Calendar className="h-5 w-5" />}
                sparklineData={[380, 400, 420, 440, 460, 480, 504]}
                trend="up"
                description="20% longer sessions"
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Component Gallery</CardTitle>
                <CardDescription>Sparklines, Progress Rings, and Trend Indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Sparklines</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue</span>
                        <Sparkline data={[20, 35, 28, 45, 52, 48, 65]} color="#22c55e" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Traffic</span>
                        <Sparkline data={[50, 45, 55, 40, 35, 45, 30]} color="#ef4444" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Engagement</span>
                        <Sparkline data={[30, 35, 32, 38, 35, 40, 38]} color="#8b5cf6" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Progress Rings</h4>
                    <div className="flex items-center justify-center gap-6">
                      <ProgressRing value={75} label="Tasks" color="#22c55e" />
                      <ProgressRing value={45} label="Goals" color="#f59e0b" />
                      <ProgressRing value={92} label="Budget" color="#8b5cf6" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Trend Indicators</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Revenue</span>
                        <TrendIndicator value={125000} previousValue={100000} format="percent" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Costs</span>
                        <TrendIndicator value={45000} previousValue={50000} format="currency" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Users</span>
                        <TrendIndicator value={12847} previousValue={11200} format="number" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collaboration Tab */}
          <TabsContent value="collaboration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Collaboration</CardTitle>
                  <CardDescription>See who&apos;s online and working with you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Team Members Online</h4>
                    <CollaborationIndicator collaborators={collaborators} showTyping />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Compact View</h4>
                    <CollaborationIndicator collaborators={collaborators.slice(0, 3)} maxVisible={3} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inline Comments & @Mentions</CardTitle>
                  <CardDescription>Collaborate directly on any content</CardDescription>
                </CardHeader>
                <CardContent>
                  {comment ? (
                    <InlineComment
                      comment={comment}
                      onReply={(id, content) => toast.success('Reply sent', { description: `Your reply: "${content.substring(0, 30)}..."` })}
                      onReact={(id, emoji) => toast.success('Reaction added', { description: `You reacted with ${emoji}` })}
                      onResolve={(id) => toast.success('Comment resolved', { description: 'Comment marked as resolved' })}
                      onPin={(id) => toast.success('Comment pinned', { description: 'Comment pinned for easy access' })}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">No comments available</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <SmartSearch
              recentSearches={[]}
              suggestedFilters={[]}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalTracker goals={goals} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            /* ActivityFeed removed - use header button */
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <GamificationWidget
              stats={userStats}
              achievements={achievements}
              onClaim={(id) => toast.success('Achievement claimed!', { description: `You claimed achievement ${id} - check your profile for rewards!` })}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions Toolbar (always visible) */}
        <QuickActionsToolbar actions={quickActions} position="bottom" />
      </div>
    </div>
  )
}
