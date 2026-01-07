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
  Search,
  Zap,
  Trophy,
  BarChart3,
  TrendingUp,
  DollarSign,
  Calendar,
  Plus,
  Edit,
  FileText,
  Star,
  Rocket,
  Crown,
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
// MOCK DATA FOR DEMO
// ============================================================================

const mockInsights = [
  {
    id: '1',
    type: 'recommendation' as const,
    title: 'Optimize email send times',
    description: 'Data shows 23% higher open rates when emails are sent at 10 AM on Tuesdays',
    impact: 'high' as const,
    confidence: 0.92,
  },
  {
    id: '2',
    type: 'opportunity' as const,
    title: 'New market segment identified',
    description: 'Tech startups in Southeast Asia showing 40% higher engagement',
    impact: 'medium' as const,
    confidence: 0.85,
  },
  {
    id: '3',
    type: 'alert' as const,
    title: 'Campaign budget running low',
    description: 'LinkedIn Ads campaign will exhaust budget in 3 days',
    impact: 'high' as const,
    confidence: 0.99,
  },
]

const mockCollaborators = [
  { id: '1', name: 'Sarah Chen', color: '#8b5cf6', status: 'online' as const, isTyping: false },
  { id: '2', name: 'Mike Johnson', color: '#22c55e', status: 'online' as const, isTyping: true },
  { id: '3', name: 'Emily Davis', color: '#f59e0b', status: 'away' as const },
  { id: '4', name: 'Alex Kim', color: '#ef4444', status: 'online' as const },
  { id: '5', name: 'John Smith', color: '#3b82f6', status: 'offline' as const },
]

const mockComment = {
  id: '1',
  content: 'We should increase the budget for this campaign - the ROI is exceptional! @marketing-team please review.',
  author: { id: '1', name: 'Sarah Chen', avatar: undefined },
  mentions: ['marketing-team'],
  reactions: [
    { emoji: '👍', count: 5, users: ['Mike', 'Emily', 'Alex', 'John', 'Lisa'] },
    { emoji: '🎉', count: 2, users: ['Mike', 'Emily'] },
  ],
  replies: [
    {
      id: '2',
      content: 'Agreed! The conversion rates are incredible.',
      author: { id: '2', name: 'Mike Johnson' },
      createdAt: new Date(Date.now() - 3600000),
    },
  ],
  createdAt: new Date(Date.now() - 7200000),
  isPinned: true,
}

const mockPredictions = [
  {
    label: 'Monthly Revenue',
    currentValue: 125000,
    predictedValue: 156000,
    confidence: 0.87,
    trend: 'up' as const,
    timeframe: 'Next Month',
    factors: [
      { name: 'Strong pipeline growth', impact: 'positive' as const, weight: 0.4 },
      { name: 'Seasonal uptick', impact: 'positive' as const, weight: 0.3 },
      { name: 'Marketing campaign success', impact: 'positive' as const, weight: 0.2 },
      { name: 'Economic uncertainty', impact: 'negative' as const, weight: 0.1 },
    ],
  },
  {
    label: 'Customer Churn',
    currentValue: 4.2,
    predictedValue: 3.8,
    confidence: 0.82,
    trend: 'down' as const,
    timeframe: 'Next Quarter',
    factors: [
      { name: 'Improved onboarding', impact: 'positive' as const, weight: 0.35 },
      { name: 'New support features', impact: 'positive' as const, weight: 0.25 },
      { name: 'Competitor pricing', impact: 'negative' as const, weight: 0.2 },
      { name: 'Product improvements', impact: 'positive' as const, weight: 0.2 },
    ],
  },
]

const mockStorySegments = [
  {
    id: '1',
    type: 'headline' as const,
    title: 'Record-Breaking Month',
    content: 'This month delivered exceptional results across all key metrics, driven by successful product launches and marketing campaigns.',
    metric: 'Total Revenue',
    value: '$2.4M',
    change: 23,
    data: [1.2, 1.4, 1.6, 1.8, 2.0, 2.1, 2.4],
  },
  {
    id: '2',
    type: 'insight' as const,
    title: 'Mobile Traffic Dominates',
    content: 'For the first time, mobile traffic exceeded desktop by 15%. Users are increasingly preferring the mobile experience for quick tasks.',
    metric: 'Mobile Sessions',
    value: '892K',
    change: 15,
    data: [500, 580, 620, 700, 780, 850, 892],
  },
  {
    id: '3',
    type: 'recommendation' as const,
    title: 'Double Down on Video Content',
    content: 'Video content generates 3x engagement compared to static posts. Recommend increasing video production by 50% next quarter.',
    metric: 'Video Engagement',
    value: '45%',
    change: 180,
    data: [12, 18, 22, 28, 35, 40, 45],
  },
  {
    id: '4',
    type: 'warning' as const,
    title: 'Watch Cart Abandonment',
    content: 'Cart abandonment increased slightly this month. Consider implementing abandoned cart emails and simplifying checkout flow.',
    metric: 'Abandonment Rate',
    value: '68%',
    change: -5,
    data: [65, 63, 64, 66, 67, 68, 68],
  },
]

const mockActivities = [
  {
    id: '1',
    type: 'mention' as const,
    title: 'mentioned you in Q4 Planning',
    user: { id: '1', name: 'Sarah Chen' },
    target: { type: 'Document', name: 'Q4 Marketing Strategy' },
    timestamp: new Date(Date.now() - 300000),
    isRead: false,
    actions: [
      { label: 'View', action: () => toast.success('Document opened', { description: 'Operation completed successfully' }) },
      { label: 'Reply', action: () => toast.success('Reply editor ready', { description: 'Operation completed successfully' }) },
    ],
  },
  {
    id: '2',
    type: 'assignment' as const,
    title: 'assigned you a task',
    description: 'Review and approve the new landing page design',
    user: { id: '2', name: 'Mike Johnson' },
    target: { type: 'Task', name: 'Landing Page Review' },
    timestamp: new Date(Date.now() - 1800000),
    isRead: false,
  },
  {
    id: '3',
    type: 'status_change' as const,
    title: 'moved to "In Review"',
    user: { id: '3', name: 'Emily Davis' },
    target: { type: 'Project', name: 'Website Redesign' },
    timestamp: new Date(Date.now() - 3600000),
    isRead: true,
  },
  {
    id: '4',
    type: 'milestone' as const,
    title: 'completed a milestone',
    description: 'Phase 1 of the product launch is complete',
    user: { id: '1', name: 'Sarah Chen' },
    target: { type: 'Project', name: 'Product Launch 2025' },
    timestamp: new Date(Date.now() - 7200000),
    isRead: true,
    isPinned: true,
  },
  {
    id: '5',
    type: 'comment' as const,
    title: 'commented on your task',
    description: 'Great progress on the analytics dashboard! Just a few suggestions...',
    user: { id: '4', name: 'Alex Kim' },
    target: { type: 'Task', name: 'Analytics Dashboard' },
    timestamp: new Date(Date.now() - 86400000),
    isRead: true,
  },
]

const mockGoals = [
  {
    id: '1',
    title: 'Increase Monthly Revenue to $200K',
    description: 'Achieve sustainable revenue growth through product expansion',
    owner: { id: '1', name: 'Sarah Chen' },
    team: 'Sales',
    progress: 78,
    status: 'on_track' as const,
    priority: 'critical' as const,
    dueDate: new Date('2025-03-31'),
    keyResults: [
      { id: 'kr1', title: 'Close 15 enterprise deals', currentValue: 11, targetValue: 15, unit: 'deals', status: 'on_track' as const },
      { id: 'kr2', title: 'Increase average deal size', currentValue: 28, targetValue: 35, unit: 'K', status: 'at_risk' as const },
      { id: 'kr3', title: 'Reduce sales cycle to 30 days', currentValue: 35, targetValue: 30, unit: 'days', status: 'behind' as const },
    ],
  },
  {
    id: '2',
    title: 'Launch Mobile App v2.0',
    description: 'Complete redesign with new features and improved UX',
    owner: { id: '2', name: 'Mike Johnson' },
    team: 'Product',
    progress: 65,
    status: 'at_risk' as const,
    priority: 'high' as const,
    dueDate: new Date('2025-02-28'),
    keyResults: [
      { id: 'kr4', title: 'Complete UI redesign', currentValue: 90, targetValue: 100, unit: '%', status: 'on_track' as const },
      { id: 'kr5', title: 'Implement new features', currentValue: 6, targetValue: 10, unit: 'features', status: 'at_risk' as const },
      { id: 'kr6', title: 'Pass QA testing', currentValue: 45, targetValue: 100, unit: '%', status: 'behind' as const },
    ],
  },
  {
    id: '3',
    title: 'Improve Customer Satisfaction',
    description: 'Achieve NPS score of 70+ through better support',
    owner: { id: '3', name: 'Emily Davis' },
    team: 'Support',
    progress: 92,
    status: 'completed' as const,
    priority: 'high' as const,
    dueDate: new Date('2025-01-31'),
  },
]

const mockUserStats = {
  level: 12,
  currentXP: 2450,
  nextLevelXP: 3000,
  streak: 15,
  totalAchievements: 24,
  rank: 42,
}

const mockAchievements = [
  {
    id: '1',
    title: 'Power User',
    description: 'Complete 100 tasks',
    icon: <Zap className="h-5 w-5 text-white" />,
    progress: 100,
    target: 100,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000),
    xp: 500,
    category: 'Productivity',
    rarity: 'rare' as const,
  },
  {
    id: '2',
    title: 'Team Player',
    description: 'Collaborate on 50 projects',
    icon: <Users className="h-5 w-5 text-white" />,
    progress: 50,
    target: 50,
    isUnlocked: true,
    xp: 750,
    category: 'Collaboration',
    rarity: 'epic' as const,
  },
  {
    id: '3',
    title: 'Data Master',
    description: 'Export 25 reports',
    icon: <BarChart3 className="h-5 w-5 text-white" />,
    progress: 18,
    target: 25,
    isUnlocked: false,
    xp: 300,
    category: 'Analytics',
    rarity: 'common' as const,
  },
  {
    id: '4',
    title: 'Legend',
    description: 'Reach Level 50',
    icon: <Crown className="h-5 w-5 text-white" />,
    progress: 12,
    target: 50,
    isUnlocked: false,
    xp: 2000,
    category: 'Mastery',
    rarity: 'legendary' as const,
  },
]

const mockQuickActions = [
  { id: '1', label: 'New Task', icon: <Plus className="h-5 w-5" />, shortcut: '⌘N', action: () => toast.success('Task created successfully', { description: 'Operation completed successfully' }), category: 'Create' },
  { id: '2', label: 'Search', icon: <Search className="h-5 w-5" />, shortcut: '⌘K', action: () => toast.success('Search ready', { description: 'Operation completed successfully' }), category: 'Navigate' },
  { id: '3', label: 'AI Assistant', icon: <Brain className="h-5 w-5" />, shortcut: '⌘J', action: () => toast.success('AI Assistant ready', { description: 'Operation completed successfully' }), category: 'AI' },
  { id: '4', label: 'New Project', icon: <FileText className="h-5 w-5" />, shortcut: '⌘P', action: () => toast.success('Project created successfully', { description: 'Operation completed successfully' }), category: 'Create' },
  { id: '5', label: 'Edit', icon: <Edit className="h-5 w-5" />, shortcut: '⌘E', action: () => toast.success('Editor ready', { description: 'Operation completed successfully' }), category: 'Actions' },
  { id: '6', label: 'Star', icon: <Star className="h-5 w-5" />, shortcut: '⌘S', action: () => toast.success('Added to favorites', { description: 'Operation completed successfully' }), category: 'Actions' },
]

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
              <AIInsightsPanel insights={mockInsights} />
              <PredictiveAnalytics predictions={mockPredictions} />
            </div>
            <DataStory
              title="Weekly Performance Report"
              subtitle="AI-generated insights from your data"
              segments={mockStorySegments}
            />
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
                <div className="grid grid-cols-3 gap-8">
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
                    <CollaborationIndicator collaborators={mockCollaborators} showTyping />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-3">Compact View</h4>
                    <CollaborationIndicator collaborators={mockCollaborators.slice(0, 3)} maxVisible={3} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Inline Comments & @Mentions</CardTitle>
                  <CardDescription>Collaborate directly on any content</CardDescription>
                </CardHeader>
                <CardContent>
                  <InlineComment
                    comment={mockComment}
                    onReply={(id, content) => console.log('Reply:', id, content)}
                    onReact={(id, emoji) => console.log('React:', id, emoji)}
                    onResolve={(id) => console.log('Resolve:', id)}
                    onPin={(id) => console.log('Pin:', id)}
                  />
                </CardContent>
              </Card>
            </div>

            <SmartSearch
              recentSearches={['marketing campaign', 'Q4 report', 'team meeting', 'budget review']}
              suggestedFilters={[
                { key: 'type', values: ['Projects', 'Tasks', 'Documents', 'People'] },
                { key: 'status', values: ['Active', 'Completed', 'In Progress', 'Archived'] },
              ]}
            />
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <GoalTracker goals={mockGoals} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed
              activities={mockActivities}
              onMarkRead={(id) => console.log('Mark read:', id)}
              onMarkAllRead={() => console.log('Mark all read')}
              onPin={(id) => console.log('Pin:', id)}
              onArchive={(id) => console.log('Archive:', id)}
            />
          </TabsContent>

          {/* Gamification Tab */}
          <TabsContent value="gamification" className="space-y-6">
            <GamificationWidget
              stats={mockUserStats}
              achievements={mockAchievements}
              onClaim={(id) => console.log('Claim achievement:', id)}
            />
          </TabsContent>
        </Tabs>

        {/* Quick Actions Toolbar (always visible) */}
        <QuickActionsToolbar actions={mockQuickActions} position="bottom" />
      </div>
    </div>
  )
}
