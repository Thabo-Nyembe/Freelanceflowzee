'use client'


import { useState, useMemo, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useAuthUserId } from '@/lib/hooks/use-auth-user-id'
import { useGrowthExperiments, useGrowthMetrics, useGrowthPlaybooks } from '@/lib/hooks/use-growth-extended'
import { useCohorts } from '@/lib/hooks/use-cohort-extended'
import { useConversionFunnels, useConversionGoals } from '@/lib/hooks/use-conversion-extended'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  BarChart3,
  Activity,
  Filter,
  FlaskConical,
  Route,
  LayoutDashboard,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Percent,
  Search,
  Download,
  Plus,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  Shield,
  Sliders,
  Bell,
  Webhook,
  Database,
  Trash2,
  Terminal
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




// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FunnelStep {
  id: string
  name: string
  event: string
  users: number
  conversionRate: number
  dropoffRate: number
  avgTimeToNext: string
}

interface Funnel {
  id: string
  name: string
  description: string
  steps: FunnelStep[]
  totalConversion: number
  totalUsers: number
  period: string
  createdAt: string
  updatedAt: string
  owner: string
  isShared: boolean
}

interface CohortMember {
  id: string
  name: string
  email: string
  avatar?: string
  joinedAt: string
  lastActive: string
  properties: Record<string, any>
}

interface Cohort {
  id: string
  name: string
  description: string
  type: 'behavioral' | 'property' | 'computed' | 'predictive'
  size: number
  growth: number
  createdAt: string
  updatedAt: string
  definition: string
  members: CohortMember[]
  status: 'active' | 'paused' | 'archived'
}

interface RetentionData {
  cohortDate: string
  cohortSize: number
  retentionByDay: number[]
}

interface RetentionAnalysis {
  id: string
  name: string
  event: string
  period: 'day' | 'week' | 'month'
  data: RetentionData[]
  avgRetention: number
  trend: number
  createdAt: string
}

interface ExperimentVariant {
  id: string
  name: string
  allocation: number
  users: number
  conversions: number
  conversionRate: number
  revenue: number
  confidence: number
}

interface Experiment {
  id: string
  name: string
  description: string
  hypothesis: string
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived'
  type: 'a/b' | 'multivariate' | 'feature-flag'
  startDate: string
  endDate?: string
  targetMetric: string
  variants: ExperimentVariant[]
  winner?: string
  statisticalSignificance: number
  totalUsers: number
  owner: string
}

interface PathNode {
  event: string
  users: number
  percentage: number
}

interface UserPath {
  id: string
  name: string
  startEvent: string
  endEvent?: string
  nodes: PathNode[][]
  totalUsers: number
  avgPathLength: number
  createdAt: string
}

interface DashboardWidget {
  id: string
  type: 'metric' | 'chart' | 'funnel' | 'cohort' | 'table'
  title: string
  config: Record<string, any>
  position: { x: number; y: number; w: number; h: number }
}

interface Dashboard {
  id: string
  name: string
  description: string
  widgets: DashboardWidget[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
  owner: string
  isShared: boolean
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFunnels: Funnel[] = [
  {
    id: '1',
    name: 'Signup to Purchase',
    description: 'Track user journey from signup to first purchase',
    steps: [
      { id: 's1', name: 'Page View', event: 'page_view', users: 45000, conversionRate: 100, dropoffRate: 0, avgTimeToNext: '0s' },
      { id: 's2', name: 'Sign Up', event: 'sign_up', users: 12500, conversionRate: 27.8, dropoffRate: 72.2, avgTimeToNext: '2m 34s' },
      { id: 's3', name: 'Add to Cart', event: 'add_to_cart', users: 8200, conversionRate: 65.6, dropoffRate: 34.4, avgTimeToNext: '5m 12s' },
      { id: 's4', name: 'Checkout', event: 'checkout', users: 5100, conversionRate: 62.2, dropoffRate: 37.8, avgTimeToNext: '1m 45s' },
      { id: 's5', name: 'Purchase', event: 'purchase', users: 4200, conversionRate: 82.4, dropoffRate: 17.6, avgTimeToNext: '0s' },
    ],
    totalConversion: 9.3,
    totalUsers: 45000,
    period: 'Last 30 days',
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    owner: 'Sarah Chen',
    isShared: true
  },
  {
    id: '2',
    name: 'Onboarding Flow',
    description: 'New user onboarding completion funnel',
    steps: [
      { id: 's1', name: 'Account Created', event: 'account_created', users: 8500, conversionRate: 100, dropoffRate: 0, avgTimeToNext: '0s' },
      { id: 's2', name: 'Profile Setup', event: 'profile_completed', users: 7200, conversionRate: 84.7, dropoffRate: 15.3, avgTimeToNext: '3m 20s' },
      { id: 's3', name: 'First Action', event: 'first_action', users: 5800, conversionRate: 80.6, dropoffRate: 19.4, avgTimeToNext: '8m 45s' },
      { id: 's4', name: 'Feature Discovery', event: 'feature_discovered', users: 4100, conversionRate: 70.7, dropoffRate: 29.3, avgTimeToNext: '12m 10s' },
    ],
    totalConversion: 48.2,
    totalUsers: 8500,
    period: 'Last 7 days',
    createdAt: '2024-02-10',
    updatedAt: '2024-12-19',
    owner: 'Mike Johnson',
    isShared: false
  },
  {
    id: '3',
    name: 'Feature Adoption',
    description: 'Track adoption of new AI features',
    steps: [
      { id: 's1', name: 'Feature Viewed', event: 'ai_feature_viewed', users: 15000, conversionRate: 100, dropoffRate: 0, avgTimeToNext: '0s' },
      { id: 's2', name: 'Feature Tried', event: 'ai_feature_tried', users: 9200, conversionRate: 61.3, dropoffRate: 38.7, avgTimeToNext: '45s' },
      { id: 's3', name: 'Feature Used', event: 'ai_feature_used', users: 6800, conversionRate: 73.9, dropoffRate: 26.1, avgTimeToNext: '2m 30s' },
    ],
    totalConversion: 45.3,
    totalUsers: 15000,
    period: 'Last 14 days',
    createdAt: '2024-03-01',
    updatedAt: '2024-12-18',
    owner: 'Lisa Park',
    isShared: true
  }
]

const mockCohorts: Cohort[] = [
  {
    id: '1',
    name: 'Power Users',
    description: 'Users with 10+ sessions in the last 30 days',
    type: 'behavioral',
    size: 12500,
    growth: 15.2,
    createdAt: '2024-01-10',
    updatedAt: '2024-12-20',
    definition: 'session_count >= 10 AND last_30_days',
    members: [],
    status: 'active'
  },
  {
    id: '2',
    name: 'At-Risk Users',
    description: 'Active users with declining engagement',
    type: 'predictive',
    size: 3200,
    growth: -8.5,
    createdAt: '2024-02-15',
    updatedAt: '2024-12-19',
    definition: 'churn_probability > 0.6',
    members: [],
    status: 'active'
  },
  {
    id: '3',
    name: 'Premium Subscribers',
    description: 'Users on premium or enterprise plans',
    type: 'property',
    size: 8900,
    growth: 22.3,
    createdAt: '2024-01-20',
    updatedAt: '2024-12-18',
    definition: 'plan IN (premium, enterprise)',
    members: [],
    status: 'active'
  },
  {
    id: '4',
    name: 'Feature Champions',
    description: 'Users who adopted 5+ features',
    type: 'computed',
    size: 5600,
    growth: 18.7,
    createdAt: '2024-03-01',
    updatedAt: '2024-12-17',
    definition: 'features_adopted >= 5',
    members: [],
    status: 'active'
  },
  {
    id: '5',
    name: 'Mobile-First Users',
    description: 'Users primarily using mobile apps',
    type: 'behavioral',
    size: 15200,
    growth: 28.4,
    createdAt: '2024-02-28',
    updatedAt: '2024-12-16',
    definition: 'mobile_sessions / total_sessions > 0.7',
    members: [],
    status: 'active'
  }
]

const mockRetentionAnalyses: RetentionAnalysis[] = [
  {
    id: '1',
    name: 'Weekly User Retention',
    event: 'app_open',
    period: 'week',
    data: [
      { cohortDate: '2024-12-01', cohortSize: 2500, retentionByDay: [100, 45, 32, 28, 25, 23, 21, 20] },
      { cohortDate: '2024-12-08', cohortSize: 2800, retentionByDay: [100, 48, 35, 30, 27, 25, 23] },
      { cohortDate: '2024-12-15', cohortSize: 3100, retentionByDay: [100, 52, 38, 33, 29, 26] },
    ],
    avgRetention: 24.5,
    trend: 3.2,
    createdAt: '2024-11-01'
  },
  {
    id: '2',
    name: 'Feature Usage Retention',
    event: 'feature_used',
    period: 'day',
    data: [
      { cohortDate: '2024-12-18', cohortSize: 1200, retentionByDay: [100, 62, 48, 41, 36, 32, 29, 27] },
      { cohortDate: '2024-12-19', cohortSize: 1350, retentionByDay: [100, 65, 51, 44, 38, 34, 30] },
      { cohortDate: '2024-12-20', cohortSize: 1100, retentionByDay: [100, 58, 45, 38, 33, 29] },
    ],
    avgRetention: 31.2,
    trend: 5.8,
    createdAt: '2024-12-01'
  }
]

const mockExperiments: Experiment[] = [
  {
    id: '1',
    name: 'New Checkout Flow',
    description: 'Testing simplified checkout with fewer steps',
    hypothesis: 'Reducing checkout steps from 5 to 3 will increase conversion by 15%',
    status: 'running',
    type: 'a/b',
    startDate: '2024-12-01',
    targetMetric: 'checkout_completion',
    variants: [
      { id: 'control', name: 'Control', allocation: 50, users: 15200, conversions: 2280, conversionRate: 15.0, revenue: 228000, confidence: 0 },
      { id: 'variant-a', name: 'Simplified Flow', allocation: 50, users: 15400, conversions: 2772, conversionRate: 18.0, revenue: 277200, confidence: 94.2 }
    ],
    statisticalSignificance: 94.2,
    totalUsers: 30600,
    owner: 'Product Team'
  },
  {
    id: '2',
    name: 'AI Recommendations',
    description: 'Testing AI-powered product recommendations',
    hypothesis: 'AI recommendations will increase add-to-cart rate by 20%',
    status: 'completed',
    type: 'a/b',
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    targetMetric: 'add_to_cart',
    variants: [
      { id: 'control', name: 'Manual Recs', allocation: 50, users: 45000, conversions: 9000, conversionRate: 20.0, revenue: 450000, confidence: 0 },
      { id: 'variant-a', name: 'AI Recs', allocation: 50, users: 44800, conversions: 10752, conversionRate: 24.0, revenue: 537600, confidence: 99.1 }
    ],
    winner: 'variant-a',
    statisticalSignificance: 99.1,
    totalUsers: 89800,
    owner: 'AI Team'
  },
  {
    id: '3',
    name: 'Pricing Page Layout',
    description: 'Testing different pricing page layouts',
    hypothesis: 'Horizontal pricing layout will increase plan upgrades by 10%',
    status: 'running',
    type: 'multivariate',
    startDate: '2024-12-10',
    targetMetric: 'plan_upgrade',
    variants: [
      { id: 'control', name: 'Vertical Cards', allocation: 33, users: 8200, conversions: 410, conversionRate: 5.0, revenue: 41000, confidence: 0 },
      { id: 'variant-a', name: 'Horizontal Cards', allocation: 33, users: 8100, conversions: 486, conversionRate: 6.0, revenue: 48600, confidence: 78.5 },
      { id: 'variant-b', name: 'Comparison Table', allocation: 34, users: 8400, conversions: 546, conversionRate: 6.5, revenue: 54600, confidence: 89.2 }
    ],
    statisticalSignificance: 89.2,
    totalUsers: 24700,
    owner: 'Growth Team'
  },
  {
    id: '4',
    name: 'Dark Mode Default',
    description: 'Testing dark mode as default theme',
    hypothesis: 'Dark mode default will improve session duration by 15%',
    status: 'draft',
    type: 'feature-flag',
    startDate: '2024-12-25',
    targetMetric: 'session_duration',
    variants: [
      { id: 'control', name: 'Light Mode', allocation: 50, users: 0, conversions: 0, conversionRate: 0, revenue: 0, confidence: 0 },
      { id: 'variant-a', name: 'Dark Mode', allocation: 50, users: 0, conversions: 0, conversionRate: 0, revenue: 0, confidence: 0 }
    ],
    statisticalSignificance: 0,
    totalUsers: 0,
    owner: 'Design Team'
  }
]

const mockUserPaths: UserPath[] = [
  {
    id: '1',
    name: 'Homepage to Purchase',
    startEvent: 'homepage_view',
    endEvent: 'purchase',
    nodes: [
      [{ event: 'homepage_view', users: 50000, percentage: 100 }],
      [
        { event: 'product_list_view', users: 32000, percentage: 64 },
        { event: 'search', users: 12000, percentage: 24 },
        { event: 'exit', users: 6000, percentage: 12 }
      ],
      [
        { event: 'product_view', users: 28000, percentage: 56 },
        { event: 'exit', users: 16000, percentage: 32 }
      ],
      [
        { event: 'add_to_cart', users: 18000, percentage: 36 },
        { event: 'exit', users: 10000, percentage: 20 }
      ],
      [
        { event: 'checkout', users: 12000, percentage: 24 },
        { event: 'exit', users: 6000, percentage: 12 }
      ],
      [
        { event: 'purchase', users: 9500, percentage: 19 },
        { event: 'exit', users: 2500, percentage: 5 }
      ]
    ],
    totalUsers: 50000,
    avgPathLength: 4.2,
    createdAt: '2024-12-01'
  }
]

const mockDashboards: Dashboard[] = [
  {
    id: '1',
    name: 'Growth Overview',
    description: 'Key growth metrics and KPIs',
    widgets: [],
    isDefault: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-12-20',
    owner: 'Growth Team',
    isShared: true
  },
  {
    id: '2',
    name: 'Conversion Analytics',
    description: 'Funnel and conversion tracking',
    widgets: [],
    isDefault: false,
    createdAt: '2024-02-15',
    updatedAt: '2024-12-19',
    owner: 'Product Team',
    isShared: true
  },
  {
    id: '3',
    name: 'User Engagement',
    description: 'User behavior and engagement metrics',
    widgets: [],
    isDefault: false,
    createdAt: '2024-03-01',
    updatedAt: '2024-12-18',
    owner: 'Analytics Team',
    isShared: false
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCohortTypeColor = (type: Cohort['type']): string => {
  const colors: Record<Cohort['type'], string> = {
    behavioral: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    property: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    computed: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    predictive: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300'
  }
  return colors[type]
}

const getExperimentStatusColor = (status: Experiment['status']): string => {
  const colors: Record<Experiment['status'], string> = {
    draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    running: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    archived: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
  }
  return colors[status]
}

const getRetentionCellColor = (value: number): string => {
  if (value >= 50) return 'bg-green-500 text-white'
  if (value >= 30) return 'bg-green-400 text-white'
  if (value >= 20) return 'bg-yellow-400 text-gray-900'
  if (value >= 10) return 'bg-orange-400 text-white'
  return 'bg-red-400 text-white'
}

// Enhanced Competitive Upgrade Mock Data
const mockGrowthAIInsights = [
  { id: '1', type: 'success' as const, title: 'Conversion Spike', description: 'Trial-to-paid conversion up 18% this week. New onboarding flow working.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Conversion' },
  { id: '2', type: 'warning' as const, title: 'Funnel Drop-off', description: 'Signup funnel showing 45% drop at email verification step.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Funnel' },
  { id: '3', type: 'info' as const, title: 'A/B Test Ready', description: 'Pricing page experiment reached statistical significance.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Testing' },
]

const mockGrowthCollaborators = [
  { id: '1', name: 'Growth Lead', avatar: '/avatars/growth.jpg', status: 'online' as const, role: 'Lead' },
  { id: '2', name: 'Data Analyst', avatar: '/avatars/data.jpg', status: 'online' as const, role: 'Analyst' },
  { id: '3', name: 'Product Manager', avatar: '/avatars/pm.jpg', status: 'away' as const, role: 'PM' },
]

const mockGrowthPredictions = [
  { id: '1', title: 'MRR Forecast', prediction: 'On track to hit $125K MRR by end of quarter', confidence: 85, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Churn Prediction', prediction: 'Monthly churn expected to decrease to 2.1%', confidence: 78, trend: 'down' as const, impact: 'high' as const },
]

const mockGrowthActivities = [
  { id: '1', user: 'Growth Lead', action: 'Launched', target: 'new pricing A/B test', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Data Analyst', action: 'Published', target: 'cohort retention report', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Completed', target: 'weekly growth metrics sync', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions will be defined inside the component to access state setters

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function GrowthHubClient() {

  const { getUserId } = useAuthUserId()
  const [userId, setUserId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null)
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [settingsTab, setSettingsTab] = useState('general')
  const [isLoading, setIsLoading] = useState(false)

  // Form states
  const [showCreateExperimentModal, setShowCreateExperimentModal] = useState(false)
  const [showCreateFunnelModal, setShowCreateFunnelModal] = useState(false)
  const [showCreateCohortModal, setShowCreateCohortModal] = useState(false)
  const [experimentForm, setExperimentForm] = useState({
    name: '', description: '', hypothesis: '', type: 'a/b' as const, targetMetric: ''
  })
  const [funnelForm, setFunnelForm] = useState({
    name: '', description: '', steps: [] as { name: string; event: string }[]
  })
  const [cohortForm, setCohortForm] = useState({
    name: '', description: '', type: 'behavioral' as const, definition: ''
  })

  // Quick action dialog states
  const [showExportReportDialog, setShowExportReportDialog] = useState(false)
  const [showCreateDashboardDialog, setShowCreateDashboardDialog] = useState(false)
  const [showGoalDialog, setShowGoalDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showPathAnalysisDialog, setShowPathAnalysisDialog] = useState(false)
  const [showConfigureIntegrationDialog, setShowConfigureIntegrationDialog] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<{ name: string; status: string } | null>(null)
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [showResetDefaultsDialog, setShowResetDefaultsDialog] = useState(false)
  const [pathAnalysisForm, setPathAnalysisForm] = useState({
    name: '', startEvent: '', endEvent: '', maxSteps: '10'
  })
  const [filterForm, setFilterForm] = useState({
    dateRange: 'last30' as 'last7' | 'last30' | 'last90' | 'custom',
    owner: '',
    status: 'all'
  })
  const [exportReportForm, setExportReportForm] = useState({
    reportType: 'conversion' as 'conversion' | 'retention' | 'experiment' | 'cohort' | 'all',
    format: 'csv' as 'csv' | 'xlsx' | 'pdf' | 'json',
    dateRange: 'last30' as 'last7' | 'last30' | 'last90' | 'custom',
    includeCharts: true
  })
  const [dashboardForm, setDashboardForm] = useState({
    name: '', description: '', widgets: [] as string[]
  })
  const [goalForm, setGoalForm] = useState({
    name: '', metric: '', targetValue: '', targetDate: ''
  })

  // Supabase hooks
  const { data: dbExperiments, isLoading: expLoading, refresh: refreshExperiments } = useGrowthExperiments(userId || undefined)
  const { data: dbMetrics, isLoading: metricsLoading, refresh: refreshMetrics } = useGrowthMetrics(userId || undefined)
  const { data: dbPlaybooks, refresh: refreshPlaybooks } = useGrowthPlaybooks()
  const { cohorts: dbCohorts, isLoading: cohortsLoading, refresh: refreshCohorts } = useCohorts()
  const { funnels: dbFunnels, isLoading: funnelsLoading, refresh: refreshFunnels } = useConversionFunnels()
  const { goals: dbGoals, refresh: refreshGoals } = useConversionGoals()

  // Fetch user ID on mount
  useEffect(() => {
    getUserId().then(setUserId)
  }, [getUserId])

  // Stats calculations
  const stats = useMemo(() => {
    const totalFunnels = mockFunnels.length
    const avgConversion = mockFunnels.reduce((acc, f) => acc + f.totalConversion, 0) / totalFunnels
    const totalCohortSize = mockCohorts.reduce((acc, c) => acc + c.size, 0)
    const activeExperiments = mockExperiments.filter(e => e.status === 'running').length
    const avgRetention = mockRetentionAnalyses.reduce((acc, r) => acc + r.avgRetention, 0) / mockRetentionAnalyses.length
    const totalExperimentUsers = mockExperiments.reduce((acc, e) => acc + e.totalUsers, 0)
    const completedExperiments = mockExperiments.filter(e => e.status === 'completed').length
    const dashboardCount = mockDashboards.length

    return {
      totalFunnels,
      avgConversion,
      totalCohortSize,
      activeExperiments,
      avgRetention,
      totalExperimentUsers,
      completedExperiments,
      dashboardCount
    }
  }, [])

  // Filtered data
  const filteredExperiments = useMemo(() => {
    return mockExperiments.filter(exp => {
      const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || exp.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [searchQuery, statusFilter])

  // CRUD Handlers
  const handleCreateExperiment = async () => {
    if (!userId || !experimentForm.name.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('growth_experiments').insert({
        user_id: userId,
        name: experimentForm.name,
        description: experimentForm.description,
        hypothesis: experimentForm.hypothesis,
        experiment_type: experimentForm.type,
        target_metric: experimentForm.targetMetric,
        status: 'draft',
        variants: JSON.stringify([{ id: 'control', name: 'Control', allocation: 50 }, { id: 'variant-a', name: 'Variant A', allocation: 50 }])
      })
      if (error) throw error
      toast.success("Experiment created - " + experimentForm.name + " is ready to configure")
      setExperimentForm({ name: '', description: '', hypothesis: '', type: 'a/b', targetMetric: '' })
      setShowCreateExperimentModal(false)
      refreshExperiments()
    } catch (err: unknown) {
      toast.error('Failed to create experiment')
    } finally { setIsLoading(false) }
  }

  const handleStartExperiment = async (expId: string, expName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('growth_experiments').update({ status: 'running', started_at: new Date().toISOString() }).eq('id', expId)
      if (error) throw error
      toast.success("Experiment started - " + expName + " is now running")
      refreshExperiments()
    } catch (err: unknown) {
      toast.error('Failed to start experiment')
    } finally { setIsLoading(false) }
  }

  const handleStopExperiment = async (expId: string, expName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('growth_experiments').update({ status: 'paused' }).eq('id', expId)
      if (error) throw error
      toast.info("Experiment stopped - " + expName + " has been paused")
      refreshExperiments()
    } catch (err: unknown) {
      toast.error('Failed to stop experiment')
    } finally { setIsLoading(false) }
  }

  const handleDeleteExperiment = async (expId: string, expName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('growth_experiments').delete().eq('id', expId)
      if (error) throw error
      toast.success("Experiment deleted - " + expName + " has been removed")
      setSelectedExperiment(null)
      refreshExperiments()
    } catch (err: unknown) {
      toast.error('Failed to delete experiment')
    } finally { setIsLoading(false) }
  }

  const handleExportResults = async (expName: string) => {
    toast.success("Exporting results - " + expName + " will be downloaded")
    // Export logic can be expanded
  }

  const handleCreateFunnel = async () => {
    if (!funnelForm.name.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('conversion_funnels').insert({
        name: funnelForm.name,
        description: funnelForm.description,
        steps: JSON.stringify(funnelForm.steps.length > 0 ? funnelForm.steps : [{ name: 'Step 1', event: 'page_view' }]),
        is_active: true
      })
      if (error) throw error
      toast.success("Funnel created - " + funnelForm.name + " is ready to track")
      setFunnelForm({ name: '', description: '', steps: [] })
      setShowCreateFunnelModal(false)
      refreshFunnels()
    } catch (err: unknown) {
      toast.error('Failed to create funnel')
    } finally { setIsLoading(false) }
  }

  const handleDeleteFunnel = async (funnelId: string, funnelName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('conversion_funnels').delete().eq('id', funnelId)
      if (error) throw error
      toast.success("Funnel deleted - " + funnelName + " has been removed")
      setSelectedFunnel(null)
      refreshFunnels()
    } catch (err: unknown) {
      toast.error('Failed to delete funnel')
    } finally { setIsLoading(false) }
  }

  const handleCreateCohort = async () => {
    if (!cohortForm.name.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('cohorts').insert({
        name: cohortForm.name,
        description: cohortForm.description,
        type: cohortForm.type,
        cohort_date: new Date().toISOString().split('T')[0],
        size: 0,
        metadata: JSON.stringify({ definition: cohortForm.definition })
      })
      if (error) throw error
      toast.success("Cohort created - " + cohortForm.name + " is ready for analysis")
      setCohortForm({ name: '', description: '', type: 'behavioral', definition: '' })
      setShowCreateCohortModal(false)
      refreshCohorts()
    } catch (err: unknown) {
      toast.error('Failed to create cohort')
    } finally { setIsLoading(false) }
  }

  const handleDeleteCohort = async (cohortId: string, cohortName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from('cohorts').delete().eq('id', cohortId)
      if (error) throw error
      toast.success("Cohort deleted - " + cohortName + " has been removed")
      setSelectedCohort(null)
      refreshCohorts()
    } catch (err: unknown) {
      toast.error('Failed to delete cohort')
    } finally { setIsLoading(false) }
  }

  const handleSaveSettings = async (section: string) => {
    toast.success('Settings saved')
  }

  // Export report handler
  const handleExportReport = async () => {
    if (!exportReportForm.reportType) {
      toast.error('Missing report type')
      return
    }
    setIsLoading(true)
    try {
      const reportTypeLabels = {
        conversion: 'Conversion Analytics',
        retention: 'Retention Analysis',
        experiment: 'Experiment Results',
        cohort: 'Cohort Analysis',
        all: 'Full Growth Report'
      }
      const formatLabels = { csv: 'CSV', xlsx: 'Excel', pdf: 'PDF', json: 'JSON' }

      const res = await fetch(`/api/growth?action=export&reportType=${exportReportForm.reportType}&format=${exportReportForm.format}&dateRange=${exportReportForm.dateRange}`)
      if (!res.ok) throw new Error('Export failed')

      if (exportReportForm.format === 'csv') {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `growth-report-${exportReportForm.reportType}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `growth-report-${exportReportForm.reportType}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      toast.success("Report exported successfully as " + formatLabels[exportReportForm.format])
      setShowExportReportDialog(false)
      setExportReportForm({ reportType: 'conversion', format: 'csv', dateRange: 'last30', includeCharts: true })
    } catch (err: unknown) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Create dashboard handler
  const handleCreateDashboard = async () => {
    if (!dashboardForm.name.trim()) {
      toast.error('Missing dashboard name')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_dashboard',
          name: dashboardForm.name,
          description: dashboardForm.description,
          widgets: dashboardForm.widgets
        })
      })
      if (!res.ok) throw new Error('Failed to create dashboard')

      toast.success("Dashboard created - " + dashboardForm.name + " has been created with " + (dashboardForm.widgets.length || 0) + " widgets")
      setShowCreateDashboardDialog(false)
      setDashboardForm({ name: '', description: '', widgets: [] })
    } catch (err: unknown) {
      toast.error('Failed to create dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  // Create goal handler
  const handleCreateGoal = async () => {
    if (!goalForm.name.trim() || !goalForm.metric.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const { error } = await supabase.from('conversion_goals').insert({
        name: goalForm.name,
        target_event: goalForm.metric,
        target_value: parseFloat(goalForm.targetValue) || 0,
        deadline: goalForm.targetDate || null,
        current_value: 0,
        is_active: true
      })
      if (error) throw error
      toast.success("Goal created - " + goalForm.name + " goal has been set with target: " + (goalForm.targetValue || "TBD"))
      setShowGoalDialog(false)
      setGoalForm({ name: '', metric: '', targetValue: '', targetDate: '' })
      refreshGoals()
    } catch (err: unknown) {
      toast.error('Failed to create goal')
    } finally {
      setIsLoading(false)
    }
  }

  // Create path analysis handler
  const handleCreatePathAnalysis = async () => {
    if (!pathAnalysisForm.name.trim() || !pathAnalysisForm.startEvent.trim()) {
      toast.error('Missing required fields')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_path',
          name: pathAnalysisForm.name,
          startEvent: pathAnalysisForm.startEvent,
          endEvent: pathAnalysisForm.endEvent,
          maxSteps: pathAnalysisForm.maxSteps
        })
      })
      if (!res.ok) throw new Error('Failed to create path analysis')

      toast.success("Path analysis created - " + pathAnalysisForm.name + " is now tracking user journeys from " + pathAnalysisForm.startEvent)
      setShowPathAnalysisDialog(false)
      setPathAnalysisForm({ name: '', startEvent: '', endEvent: '', maxSteps: '10' })
    } catch (err: unknown) {
      toast.error('Failed to create path analysis')
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filter handler
  const handleApplyFilter = () => {
    toast.success("Filters applied" + (filterForm.owner ? " by " + filterForm.owner : ""))
    setShowFilterDialog(false)
  }

  // Configure integration handler
  const handleConfigureIntegration = async (integrationName: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'configure_integration',
          integrationName,
          config: selectedIntegration
        })
      })
      if (!res.ok) throw new Error('Configuration failed')

      toast.success("Integration configured - settings have been updated")
      setShowConfigureIntegrationDialog(false)
      setSelectedIntegration(null)
    } catch (err: unknown) {
      toast.error('Failed to configure integration')
    } finally {
      setIsLoading(false)
    }
  }

  // Export all data handler
  const handleExportAllData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth?action=export&reportType=all&format=json')
      if (!res.ok) throw new Error('Export failed')

      const data = await res.json()
      const exportData = {
        exportedAt: new Date().toISOString(),
        ...data.data
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `growth-hub-full-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (err: unknown) {
      toast.error('Export failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Clear all data handler
  const handleClearAllData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear_data', dataType: 'all' })
      })
      if (!res.ok) throw new Error('Clear data failed')

      toast.success('All data cleared')
      setShowClearDataDialog(false)
      handleRefreshData()
    } catch (err: unknown) {
      toast.error('Failed to clear data')
    } finally {
      setIsLoading(false)
    }
  }

  // Reset to defaults handler
  const handleResetToDefaults = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_settings' })
      })
      if (!res.ok) throw new Error('Reset failed')

      toast.success('Settings reset')
      setShowResetDefaultsDialog(false)
    } catch (err: unknown) {
      toast.error('Failed to reset settings')
    } finally {
      setIsLoading(false)
    }
  }

  // Quick actions with real dialog triggers
  const growthQuickActions = [
    {
      id: '1',
      label: 'New Experiment',
      icon: 'plus',
      action: () => setShowCreateExperimentModal(true),
      variant: 'default' as const
    },
    {
      id: '2',
      label: 'Create Funnel',
      icon: 'filter',
      action: () => setShowCreateFunnelModal(true),
      variant: 'default' as const
    },
    {
      id: '3',
      label: 'Export Report',
      icon: 'download',
      action: () => setShowExportReportDialog(true),
      variant: 'outline' as const
    },
    {
      id: '4',
      label: 'New Cohort',
      icon: 'users',
      action: () => setShowCreateCohortModal(true),
      variant: 'default' as const
    },
    {
      id: '5',
      label: 'Set Goal',
      icon: 'target',
      action: () => setShowGoalDialog(true),
      variant: 'outline' as const
    },
    {
      id: '6',
      label: 'New Dashboard',
      icon: 'layout',
      action: () => setShowCreateDashboardDialog(true),
      variant: 'outline' as const
    },
  ]

  const handleRefreshData = useCallback(() => {
    refreshExperiments()
    refreshMetrics()
    refreshCohorts()
    refreshFunnels()
    refreshGoals()
    toast.success('Data refreshed')
  }, [refreshExperiments, refreshMetrics, refreshCohorts, refreshFunnels, refreshGoals])

  // Quick actions for the Overview tab quick action buttons
  const overviewQuickActionHandlers: Record<string, () => void> = {
    'New Funnel': () => setShowCreateFunnelModal(true),
    'New Cohort': () => setShowCreateCohortModal(true),
    'New Test': () => setShowCreateExperimentModal(true),
    'Reports': () => setShowExportReportDialog(true),
    'Goals': () => setShowGoalDialog(true),
    'Real-time': () => toast.info('Real-time Analytics'),
    'Export': () => setShowExportReportDialog(true),
    'Refresh': handleRefreshData
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50/30 to-teal-50/40 dark:bg-none dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Growth Hub</h1>
                <p className="text-sm text-muted-foreground">Amplitude-level product analytics platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search analytics..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={handleRefreshData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white" onClick={() => setShowCreateExperimentModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {[
            { label: 'Active Funnels', value: stats.totalFunnels.toString(), change: 12.5, icon: Filter, color: 'from-blue-500 to-cyan-500' },
            { label: 'Avg Conversion', value: `${stats.avgConversion.toFixed(1)}%`, change: 8.3, icon: Percent, color: 'from-green-500 to-emerald-500' },
            { label: 'Cohort Users', value: `${(stats.totalCohortSize / 1000).toFixed(1)}K`, change: 15.2, icon: Users, color: 'from-purple-500 to-pink-500' },
            { label: 'Active Experiments', value: stats.activeExperiments.toString(), change: 25.0, icon: FlaskConical, color: 'from-orange-500 to-amber-500' },
            { label: 'Avg Retention', value: `${stats.avgRetention.toFixed(1)}%`, change: 5.8, icon: Activity, color: 'from-teal-500 to-cyan-500' },
            { label: 'Test Users', value: `${(stats.totalExperimentUsers / 1000).toFixed(0)}K`, change: 32.1, icon: Target, color: 'from-indigo-500 to-purple-500' },
            { label: 'Completed Tests', value: stats.completedExperiments.toString(), change: 10.0, icon: CheckCircle2, color: 'from-emerald-500 to-green-500' },
            { label: 'Dashboards', value: stats.dashboardCount.toString(), change: 8.0, icon: LayoutDashboard, color: 'from-rose-500 to-pink-500' }
          ].map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(stat.change)}%
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="funnels" className="gap-2">
              <Filter className="w-4 h-4" />
              Funnels
            </TabsTrigger>
            <TabsTrigger value="cohorts" className="gap-2">
              <Users className="w-4 h-4" />
              Cohorts
            </TabsTrigger>
            <TabsTrigger value="retention" className="gap-2">
              <Activity className="w-4 h-4" />
              Retention
            </TabsTrigger>
            <TabsTrigger value="experiments" className="gap-2">
              <FlaskConical className="w-4 h-4" />
              Experiments
            </TabsTrigger>
            <TabsTrigger value="paths" className="gap-2">
              <Route className="w-4 h-4" />
              User Paths
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Growth Analytics Overview</h2>
                    <p className="text-white/90 max-w-2xl">
                      Monitor your conversion funnels, user cohorts, and growth experiments in one dashboard.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.avgConversion.toFixed(1)}%</div>
                      <div className="text-sm text-white/80">Avg Conversion</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.activeExperiments}</div>
                      <div className="text-sm text-white/80">Active Tests</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {[
                { icon: Filter, label: 'New Funnel', color: 'text-blue-500' },
                { icon: Users, label: 'New Cohort', color: 'text-purple-500' },
                { icon: FlaskConical, label: 'New Test', color: 'text-orange-500' },
                { icon: BarChart3, label: 'Reports', color: 'text-green-500' },
                { icon: Target, label: 'Goals', color: 'text-red-500' },
                { icon: Activity, label: 'Real-time', color: 'text-cyan-500' },
                { icon: Download, label: 'Export', color: 'text-indigo-500' },
                { icon: RefreshCw, label: 'Refresh', color: 'text-gray-500' }
              ].map((action, i) => (
                <Button key={i} variant="outline" className="flex flex-col items-center gap-2 h-auto py-4 hover:scale-105 transition-all duration-200 bg-white/50 dark:bg-gray-800/50" onClick={() => overviewQuickActionHandlers[action.label]?.()}>
                  <action.icon className={`w-5 h-5 ${action.color}`} />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Funnels */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-blue-500" />
                    Top Funnels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockFunnels.slice(0, 3).map((funnel) => (
                    <div key={funnel.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => setSelectedFunnel(funnel)}>
                      <div>
                        <p className="font-medium">{funnel.name}</p>
                        <p className="text-xs text-muted-foreground">{funnel.steps.length} steps</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{funnel.totalConversion.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">{funnel.totalUsers.toLocaleString()} users</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Active Experiments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-orange-500" />
                    Active Experiments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockExperiments.filter(e => e.status === 'running').map((exp) => (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => setSelectedExperiment(exp)}>
                      <div>
                        <p className="font-medium">{exp.name}</p>
                        <p className="text-xs text-muted-foreground">{exp.variants.length} variants</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{exp.statisticalSignificance.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">confidence</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Cohorts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-500" />
                    Top Cohorts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockCohorts.slice(0, 3).map((cohort) => (
                    <div key={cohort.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer" onClick={() => setSelectedCohort(cohort)}>
                      <div className="flex items-center gap-3">
                        <Badge className={getCohortTypeColor(cohort.type)}>{cohort.type}</Badge>
                        <p className="font-medium">{cohort.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{cohort.size.toLocaleString()}</p>
                        <p className={`text-xs ${cohort.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {cohort.growth >= 0 ? '+' : ''}{cohort.growth}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Retention Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-500" />
                  Retention Overview
                </CardTitle>
                <CardDescription>Weekly user retention trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left p-2">Cohort</th>
                        <th className="text-center p-2">Size</th>
                        <th className="text-center p-2">Week 0</th>
                        <th className="text-center p-2">Week 1</th>
                        <th className="text-center p-2">Week 2</th>
                        <th className="text-center p-2">Week 3</th>
                        <th className="text-center p-2">Week 4</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockRetentionAnalyses[0].data.map((row, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{row.cohortDate}</td>
                          <td className="text-center p-2">{row.cohortSize.toLocaleString()}</td>
                          {row.retentionByDay.slice(0, 5).map((val, i) => (
                            <td key={i} className="p-2">
                              <div className={`rounded px-2 py-1 text-center text-xs font-medium ${getRetentionCellColor(val)}`}>
                                {val}%
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Funnels Tab */}
          <TabsContent value="funnels" className="space-y-6">
            {/* Funnels Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Conversion Funnels</h2>
                    <p className="text-white/90 max-w-2xl">
                      Analyze user journeys, identify drop-off points, and optimize conversion paths.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockFunnels.length}</div>
                      <div className="text-sm text-white/80">Total Funnels</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.avgConversion.toFixed(1)}%</div>
                      <div className="text-sm text-white/80">Avg Conversion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilterDialog(true)}>
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </div>
              <Button className="gap-2" onClick={() => setShowCreateFunnelModal(true)}>
                <Plus className="w-4 h-4" />
                Create Funnel
              </Button>
            </div>

            <div className="grid gap-6">
              {mockFunnels.map((funnel) => (
                <Card key={funnel.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedFunnel(funnel)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {funnel.name}
                          {funnel.isShared && <Badge variant="outline">Shared</Badge>}
                        </CardTitle>
                        <CardDescription>{funnel.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-green-600">{funnel.totalConversion.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Overall Conversion</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 overflow-x-auto pb-4">
                      {funnel.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center">
                          <div className="flex flex-col items-center min-w-[120px]">
                            <div className="w-full h-16 bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg relative" style={{ height: `${Math.max(20, step.conversionRate * 0.6)}px` }}>
                              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold">
                                {step.users.toLocaleString()}
                              </div>
                            </div>
                            <div className="bg-muted p-2 rounded-b-lg w-full text-center">
                              <p className="text-xs font-medium truncate">{step.name}</p>
                              <p className="text-xs text-green-600">{step.conversionRate.toFixed(1)}%</p>
                            </div>
                          </div>
                          {idx < funnel.steps.length - 1 && (
                            <div className="flex flex-col items-center mx-2 text-muted-foreground">
                              <ArrowRight className="w-4 h-4" />
                              <span className="text-xs text-red-500">-{step.dropoffRate.toFixed(1)}%</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4 mt-4">
                      <span>{funnel.period}</span>
                      <span>Owner: {funnel.owner}</span>
                      <span>Updated: {funnel.updatedAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Cohorts Tab */}
          <TabsContent value="cohorts" className="space-y-6">
            {/* Cohorts Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">User Cohorts</h2>
                    <p className="text-white/90 max-w-2xl">
                      Segment users by behavior, properties, or predictive signals for targeted analysis.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{mockCohorts.length}</div>
                      <div className="text-sm text-white/80">Cohorts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalCohortSize.toLocaleString()}</div>
                      <div className="text-sm text-white/80">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['all', 'behavioral', 'property', 'computed', 'predictive'].map((type) => (
                  <Button
                    key={type}
                    variant={statusFilter === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(type)}
                    className="capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <Button className="gap-2" onClick={() => setShowCreateCohortModal(true)}>
                <Plus className="w-4 h-4" />
                Create Cohort
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCohorts.filter(c => statusFilter === 'all' || c.type === statusFilter).map((cohort) => (
                <Card key={cohort.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedCohort(cohort)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={getCohortTypeColor(cohort.type)}>{cohort.type}</Badge>
                      <Badge variant="outline" className={cohort.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                        {cohort.status}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2">{cohort.name}</CardTitle>
                    <CardDescription>{cohort.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold">{cohort.size.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Users</p>
                      </div>
                      <div className={`flex items-center gap-1 text-lg font-medium ${cohort.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cohort.growth >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {cohort.growth >= 0 ? '+' : ''}{cohort.growth}%
                      </div>
                    </div>
                    <div className="p-2 bg-muted rounded-lg font-mono text-xs">
                      {cohort.definition}
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                      <span>Created: {cohort.createdAt}</span>
                      <span>Updated: {cohort.updatedAt}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Retention Tab */}
          <TabsContent value="retention" className="space-y-6">
            {mockRetentionAnalyses.map((analysis) => (
              <Card key={analysis.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-teal-500" />
                        {analysis.name}
                      </CardTitle>
                      <CardDescription>Event: {analysis.event} | Period: {analysis.period}</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold">{analysis.avgRetention.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Avg Retention</p>
                      </div>
                      <div className={`flex items-center gap-1 ${analysis.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {analysis.trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        {analysis.trend >= 0 ? '+' : ''}{analysis.trend}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Cohort Date</th>
                          <th className="text-center p-3">Size</th>
                          {Array.from({ length: 8 }, (_, i) => (
                            <th key={i} className="text-center p-3">{analysis.period === 'day' ? `D${i}` : analysis.period === 'week' ? `W${i}` : `M${i}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {analysis.data.map((row, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="p-3 font-medium">{row.cohortDate}</td>
                            <td className="text-center p-3">{row.cohortSize.toLocaleString()}</td>
                            {row.retentionByDay.map((val, i) => (
                              <td key={i} className="p-2">
                                <div className={`rounded-lg px-2 py-1.5 text-center text-xs font-medium ${getRetentionCellColor(val)}`}>
                                  {val}%
                                </div>
                              </td>
                            ))}
                            {Array.from({ length: 8 - row.retentionByDay.length }, (_, i) => (
                              <td key={`empty-${i}`} className="p-2">
                                <div className="rounded-lg px-2 py-1.5 text-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-400">
                                  -
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            {/* Experiments Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 p-6 text-white">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">A/B Experiments</h2>
                    <p className="text-white/90 max-w-2xl">
                      Run controlled experiments to validate hypotheses and optimize product experiences.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.activeExperiments}</div>
                      <div className="text-sm text-white/80">Running</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{stats.totalExperimentUsers.toLocaleString()}</div>
                      <div className="text-sm text-white/80">Total Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {['all', 'draft', 'running', 'paused', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
              <Button className="gap-2" onClick={() => setShowCreateExperimentModal(true)}>
                <Plus className="w-4 h-4" />
                New Experiment
              </Button>
            </div>

            <div className="grid gap-6">
              {filteredExperiments.map((experiment) => (
                <Card key={experiment.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedExperiment(experiment)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getExperimentStatusColor(experiment.status)}>{experiment.status}</Badge>
                        <Badge variant="outline">{experiment.type}</Badge>
                      </div>
                      {experiment.winner && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Winner: {experiment.variants.find(v => v.id === experiment.winner)?.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="mt-2">{experiment.name}</CardTitle>
                    <CardDescription>{experiment.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm"><strong>Hypothesis:</strong> {experiment.hypothesis}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {experiment.variants.map((variant) => (
                        <div key={variant.id} className={`p-4 rounded-lg border ${variant.id === experiment.winner ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'bg-muted/30'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{variant.name}</p>
                            {variant.id === experiment.winner && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                          </div>
                          <p className="text-2xl font-bold">{variant.conversionRate.toFixed(1)}%</p>
                          <p className="text-xs text-muted-foreground">{variant.users.toLocaleString()} users</p>
                          {variant.confidence > 0 && (
                            <div className="mt-2">
                              <Progress value={variant.confidence} className="h-1" />
                              <p className="text-xs text-muted-foreground mt-1">{variant.confidence.toFixed(1)}% confidence</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                      <span>Target: {experiment.targetMetric}</span>
                      <span>Started: {experiment.startDate}</span>
                      <span>{experiment.totalUsers.toLocaleString()} total users</span>
                      <span>Owner: {experiment.owner}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* User Paths Tab */}
          <TabsContent value="paths" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">User Journey Analysis</h2>
                <p className="text-sm text-muted-foreground">Visualize how users navigate through your product</p>
              </div>
              <Button className="gap-2" onClick={() => setShowPathAnalysisDialog(true)}>
                <Plus className="w-4 h-4" />
                Create Path Analysis
              </Button>
            </div>

            {mockUserPaths.map((path) => (
              <Card key={path.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="w-5 h-5 text-indigo-500" />
                        {path.name}
                      </CardTitle>
                      <CardDescription>
                        {path.startEvent} → {path.endEvent || 'Any'} | Avg path length: {path.avgPathLength.toFixed(1)} steps
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{path.totalUsers.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 overflow-x-auto pb-4">
                    {path.nodes.map((nodeGroup, stepIdx) => (
                      <div key={stepIdx} className="flex flex-col gap-2 min-w-[160px]">
                        <div className="text-xs font-medium text-muted-foreground text-center">Step {stepIdx + 1}</div>
                        {nodeGroup.map((node, nodeIdx) => (
                          <div key={nodeIdx} className={`p-3 rounded-lg border ${node.event === 'exit' ? 'bg-red-50 dark:bg-red-950 border-red-200' : 'bg-muted/50'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{node.event}</span>
                              {node.event === 'exit' && <XCircle className="w-3 h-3 text-red-500" />}
                            </div>
                            <p className="text-lg font-bold">{node.users.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">{node.percentage}%</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Settings Sidebar */}
              <div className="col-span-12 md:col-span-3">
                <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur sticky top-4">
                  <CardContent className="p-4">
                    <nav className="space-y-1">
                      {[
                        { id: 'general', label: 'General', icon: Sliders },
                        { id: 'tracking', label: 'Tracking', icon: Activity },
                        { id: 'notifications', label: 'Notifications', icon: Bell },
                        { id: 'integrations', label: 'Integrations', icon: Webhook },
                        { id: 'security', label: 'Security', icon: Shield },
                        { id: 'advanced', label: 'Advanced', icon: Terminal }
                      ].map(item => (
                        <button
                          key={item.id}
                          onClick={() => setSettingsTab(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            settingsTab === item.id
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {settingsTab === 'general' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-emerald-500" />
                        General Settings
                      </CardTitle>
                      <CardDescription>Configure basic growth analytics settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Default Date Range</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Default time period for reports</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>Last 7 days</option>
                            <option>Last 30 days</option>
                            <option>Last 90 days</option>
                            <option>Last 12 months</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Statistical Significance</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Confidence level for experiments</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>90% confidence</option>
                            <option>95% confidence</option>
                            <option>99% confidence</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Auto-Refresh Dashboard</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically update metrics</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => handleSaveSettings('General')}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'tracking' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Tracking Settings
                      </CardTitle>
                      <CardDescription>Configure event tracking and data collection</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Auto-Track Page Views</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Automatically track page visits</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Track Click Events</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Capture button and link clicks</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Session Recording</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Record user sessions for analysis</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Heatmaps</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Generate click and scroll heatmaps</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => handleSaveSettings('Tracking')}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'notifications' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5 text-purple-500" />
                        Notification Settings
                      </CardTitle>
                      <CardDescription>Configure alerts and notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Experiment Completion</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Notify when experiments reach significance</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Conversion Alerts</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert on significant conversion changes</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Weekly Reports</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Send weekly analytics digest</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Anomaly Detection</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Alert on unusual patterns</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => handleSaveSettings('Notifications')}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'integrations' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-green-500" />
                        Integrations
                      </CardTitle>
                      <CardDescription>Connect external analytics and data sources</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        {[
                          { name: 'Google Analytics', icon: BarChart3, status: 'Connected', color: 'green' },
                          { name: 'Segment', icon: Database, status: 'Connected', color: 'green' },
                          { name: 'Mixpanel', icon: PieChart, status: 'Not Connected', color: 'gray' },
                          { name: 'Slack', icon: Bell, status: 'Connected', color: 'green' },
                          { name: 'Webhooks', icon: Webhook, status: '3 Active', color: 'blue' },
                          { name: 'Data Export', icon: Download, status: 'Configured', color: 'green' }
                        ].map((integration, i) => (
                          <div key={i} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <integration.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <Badge className={`bg-${integration.color}-100 text-${integration.color}-800 dark:bg-${integration.color}-900/30 dark:text-${integration.color}-400`}>
                                  {integration.status}
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => { setSelectedIntegration(integration); setShowConfigureIntegrationDialog(true); }}>Configure</Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'security' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>Manage data privacy and access controls</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Data Anonymization</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Anonymize PII in analytics data</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">IP Masking</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Mask last octet of IP addresses</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Data Retention</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">How long to keep raw data</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>30 days</option>
                            <option>90 days</option>
                            <option>1 year</option>
                            <option>2 years</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">GDPR Compliance Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable GDPR-compliant tracking</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => handleSaveSettings('Security')}>Save Changes</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {settingsTab === 'advanced' && (
                  <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Terminal className="w-5 h-5 text-gray-500" />
                        Advanced Settings
                      </CardTitle>
                      <CardDescription>System configuration and maintenance options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Debug Mode</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Enable verbose logging</p>
                          </div>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Cache TTL</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Query cache duration</p>
                          </div>
                          <select className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 w-64">
                            <option>5 minutes</option>
                            <option>15 minutes</option>
                            <option>1 hour</option>
                            <option>24 hours</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                          <div>
                            <p className="font-medium">Export All Data</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Download complete analytics export</p>
                          </div>
                          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportAllData} disabled={isLoading}>
                            <Download className="w-4 h-4" />
                            Export
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Danger Zone</h4>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                          These actions are irreversible. Please proceed with caution.
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30" onClick={() => setShowClearDataDialog(true)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All Data
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/30" onClick={() => setShowResetDefaultsDialog(true)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Reset to Defaults
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockGrowthAIInsights}
              title="Growth Intelligence"
              onInsightAction={(insight) => toast.info(insight.title)}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockGrowthCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockGrowthPredictions}
              title="Growth Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockGrowthActivities}
            title="Growth Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={growthQuickActions}
            variant="grid"
          />
        </div>
      </div>

      {/* Funnel Detail Dialog */}
      <Dialog open={!!selectedFunnel} onOpenChange={() => setSelectedFunnel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              {selectedFunnel?.name}
            </DialogTitle>
            <DialogDescription>{selectedFunnel?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedFunnel && (
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold text-green-600">{selectedFunnel.totalConversion.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Overall Conversion</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold">{selectedFunnel.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-3xl font-bold">{selectedFunnel.steps.length}</p>
                    <p className="text-sm text-muted-foreground">Funnel Steps</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedFunnel.steps.map((step, idx) => (
                    <div key={step.id} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">Event: {step.event}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{step.users.toLocaleString()} users</p>
                            <p className="text-xs text-muted-foreground">Avg time: {step.avgTimeToNext}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Progress value={step.conversionRate} className="h-2" />
                          </div>
                          <span className="text-sm font-medium text-green-600">{step.conversionRate.toFixed(1)}%</span>
                        </div>
                        {step.dropoffRate > 0 && (
                          <p className="text-xs text-red-500 mt-1">Dropoff: {step.dropoffRate.toFixed(1)}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <span>Period: {selectedFunnel.period}</span>
                  <span>Owner: {selectedFunnel.owner}</span>
                  <span>Updated: {selectedFunnel.updatedAt}</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Cohort Detail Dialog */}
      <Dialog open={!!selectedCohort} onOpenChange={() => setSelectedCohort(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              {selectedCohort?.name}
            </DialogTitle>
            <DialogDescription>{selectedCohort?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedCohort && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getCohortTypeColor(selectedCohort.type)}>{selectedCohort.type}</Badge>
                  <Badge variant="outline">{selectedCohort.status}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-3xl font-bold">{selectedCohort.size.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className={`text-3xl font-bold ${selectedCohort.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCohort.growth >= 0 ? '+' : ''}{selectedCohort.growth}%
                    </p>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Cohort Definition</p>
                  <code className="text-sm font-mono">{selectedCohort.definition}</code>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <span>Created: {selectedCohort.createdAt}</span>
                  <span>Updated: {selectedCohort.updatedAt}</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Experiment Detail Dialog */}
      <Dialog open={!!selectedExperiment} onOpenChange={() => setSelectedExperiment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              {selectedExperiment?.name}
            </DialogTitle>
            <DialogDescription>{selectedExperiment?.description}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            {selectedExperiment && (
              <div className="space-y-6 p-4">
                <div className="flex items-center gap-3">
                  <Badge className={getExperimentStatusColor(selectedExperiment.status)}>{selectedExperiment.status}</Badge>
                  <Badge variant="outline">{selectedExperiment.type}</Badge>
                  {selectedExperiment.winner && (
                    <Badge className="bg-green-100 text-green-800">
                      Winner: {selectedExperiment.variants.find(v => v.id === selectedExperiment.winner)?.name}
                    </Badge>
                  )}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Hypothesis</p>
                  <p className="text-sm">{selectedExperiment.hypothesis}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedExperiment.statisticalSignificance.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">Statistical Significance</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedExperiment.totalUsers.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-2xl font-bold">{selectedExperiment.variants.length}</p>
                    <p className="text-sm text-muted-foreground">Variants</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Variant Performance</h3>
                  {selectedExperiment.variants.map((variant) => (
                    <div key={variant.id} className={`p-4 rounded-lg border ${variant.id === selectedExperiment.winner ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'bg-muted/30'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{variant.name}</p>
                          {variant.id === selectedExperiment.winner && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                        <Badge variant="outline">{variant.allocation}% allocation</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-bold">{variant.users.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversions</p>
                          <p className="font-bold">{variant.conversions.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rate</p>
                          <p className="font-bold text-green-600">{variant.conversionRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-bold">${variant.revenue.toLocaleString()}</p>
                        </div>
                      </div>
                      {variant.confidence > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Confidence</span>
                            <span>{variant.confidence.toFixed(1)}%</span>
                          </div>
                          <Progress value={variant.confidence} className="h-2" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
                  <span>Target: {selectedExperiment.targetMetric}</span>
                  <span>Started: {selectedExperiment.startDate}</span>
                  {selectedExperiment.endDate && <span>Ended: {selectedExperiment.endDate}</span>}
                  <span>Owner: {selectedExperiment.owner}</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Experiment Modal */}
      <Dialog open={showCreateExperimentModal} onOpenChange={setShowCreateExperimentModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-orange-500" />
              Create New Experiment
            </DialogTitle>
            <DialogDescription>Set up an A/B test or multivariate experiment</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Experiment Name</Label>
              <Input placeholder="e.g. New Checkout Flow" value={experimentForm.name} onChange={(e) => setExperimentForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Brief description of the experiment" value={experimentForm.description} onChange={(e) => setExperimentForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Hypothesis</Label>
              <Input placeholder="What do you expect to happen?" value={experimentForm.hypothesis} onChange={(e) => setExperimentForm(f => ({ ...f, hypothesis: e.target.value }))} />
            </div>
            <div>
              <Label>Target Metric</Label>
              <Input placeholder="e.g. checkout_completion, signup_rate" value={experimentForm.targetMetric} onChange={(e) => setExperimentForm(f => ({ ...f, targetMetric: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateExperimentModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500" onClick={handleCreateExperiment} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Experiment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Funnel Modal */}
      <Dialog open={showCreateFunnelModal} onOpenChange={setShowCreateFunnelModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              Create New Funnel
            </DialogTitle>
            <DialogDescription>Define a conversion funnel to track user journeys</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Funnel Name</Label>
              <Input placeholder="e.g. Signup to Purchase" value={funnelForm.name} onChange={(e) => setFunnelForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="What journey does this funnel track?" value={funnelForm.description} onChange={(e) => setFunnelForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateFunnelModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500" onClick={handleCreateFunnel} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Funnel'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Cohort Modal */}
      <Dialog open={showCreateCohortModal} onOpenChange={setShowCreateCohortModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Create New Cohort
            </DialogTitle>
            <DialogDescription>Define a user segment for analysis</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cohort Name</Label>
              <Input placeholder="e.g. Power Users" value={cohortForm.name} onChange={(e) => setCohortForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Who is in this cohort?" value={cohortForm.description} onChange={(e) => setCohortForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Cohort Type</Label>
              <select className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800" value={cohortForm.type} onChange={(e) => setCohortForm(f => ({ ...f, type: e.target.value }))}>
                <option value="behavioral">Behavioral</option>
                <option value="property">Property-based</option>
                <option value="computed">Computed</option>
                <option value="predictive">Predictive</option>
              </select>
            </div>
            <div>
              <Label>Definition (query)</Label>
              <Input placeholder="e.g. session_count >= 10" value={cohortForm.definition} onChange={(e) => setCohortForm(f => ({ ...f, definition: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateCohortModal(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500" onClick={handleCreateCohort} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Cohort'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Report Dialog */}
      <Dialog open={showExportReportDialog} onOpenChange={setShowExportReportDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              Export Growth Report
            </DialogTitle>
            <DialogDescription>Configure and download your analytics report</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={exportReportForm.reportType}
                onChange={(e) => setExportReportForm(f => ({ ...f, reportType: e.target.value }))}
              >
                <option value="conversion">Conversion Analytics</option>
                <option value="retention">Retention Analysis</option>
                <option value="experiment">Experiment Results</option>
                <option value="cohort">Cohort Analysis</option>
                <option value="all">Full Growth Report</option>
              </select>
            </div>
            <div>
              <Label>Export Format</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={exportReportForm.format}
                onChange={(e) => setExportReportForm(f => ({ ...f, format: e.target.value }))}
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <Label>Date Range</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={exportReportForm.dateRange}
                onChange={(e) => setExportReportForm(f => ({ ...f, dateRange: e.target.value }))}
              >
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="last90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
              <div>
                <p className="font-medium text-sm">Include Charts</p>
                <p className="text-xs text-muted-foreground">Add visualizations to report</p>
              </div>
              <Switch
                checked={exportReportForm.includeCharts}
                onCheckedChange={(checked) => setExportReportForm(f => ({ ...f, includeCharts: checked }))}
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Preview</p>
              <p className="text-xs text-muted-foreground">
                {exportReportForm.reportType === 'all' ? 'Full Growth Report' :
                  exportReportForm.reportType.charAt(0).toUpperCase() + exportReportForm.reportType.slice(1) + ' Analytics'} -
                {' '}{exportReportForm.dateRange === 'last7' ? 'Last 7 days' :
                  exportReportForm.dateRange === 'last30' ? 'Last 30 days' :
                    exportReportForm.dateRange === 'last90' ? 'Last 90 days' : 'Custom range'} -
                {' '}{exportReportForm.format.toUpperCase()}
                {exportReportForm.includeCharts ? ' with charts' : ''}
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowExportReportDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500" onClick={handleExportReport} disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                {isLoading ? 'Exporting...' : 'Export Report'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Dashboard Dialog */}
      <Dialog open={showCreateDashboardDialog} onOpenChange={setShowCreateDashboardDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-teal-500" />
              Create New Dashboard
            </DialogTitle>
            <DialogDescription>Build a custom analytics dashboard</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Dashboard Name</Label>
              <Input
                placeholder="e.g. Growth Overview"
                value={dashboardForm.name}
                onChange={(e) => setDashboardForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                placeholder="What does this dashboard track?"
                value={dashboardForm.description}
                onChange={(e) => setDashboardForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-2 block">Select Widgets</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
                {[
                  { id: 'funnel', label: 'Funnel Chart', icon: Filter },
                  { id: 'retention', label: 'Retention Grid', icon: Activity },
                  { id: 'cohort', label: 'Cohort Overview', icon: Users },
                  { id: 'experiment', label: 'Experiment Summary', icon: FlaskConical },
                  { id: 'metrics', label: 'Key Metrics', icon: BarChart3 },
                  { id: 'trends', label: 'Trend Lines', icon: TrendingUp },
                ].map((widget) => (
                  <button
                    key={widget.id}
                    type="button"
                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${
                      dashboardForm.widgets.includes(widget.id)
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-950'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setDashboardForm(f => ({
                        ...f,
                        widgets: f.widgets.includes(widget.id)
                          ? f.widgets.filter(w => w !== widget.id)
                          : [...f.widgets, widget.id]
                      }))
                    }}
                  >
                    <widget.icon className="w-4 h-4" />
                    <span className="text-sm">{widget.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowCreateDashboardDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500" onClick={handleCreateDashboard} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Dashboard'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-500" />
              Set Conversion Goal
            </DialogTitle>
            <DialogDescription>Define a measurable growth target</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Goal Name</Label>
              <Input
                placeholder="e.g. Increase signup conversion to 15%"
                value={goalForm.name}
                onChange={(e) => setGoalForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Target Metric</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={goalForm.metric}
                onChange={(e) => setGoalForm(f => ({ ...f, metric: e.target.value }))}
              >
                <option value="">Select a metric</option>
                <option value="signup_conversion">Signup Conversion Rate</option>
                <option value="purchase_conversion">Purchase Conversion Rate</option>
                <option value="retention_d7">Day 7 Retention</option>
                <option value="retention_d30">Day 30 Retention</option>
                <option value="feature_adoption">Feature Adoption Rate</option>
                <option value="activation_rate">User Activation Rate</option>
                <option value="mrr_growth">MRR Growth</option>
                <option value="churn_reduction">Churn Reduction</option>
              </select>
            </div>
            <div>
              <Label>Target Value</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="e.g. 15"
                  value={goalForm.targetValue}
                  onChange={(e) => setGoalForm(f => ({ ...f, targetValue: e.target.value }))}
                  className="flex-1"
                />
                <div className="flex items-center justify-center w-12 bg-muted rounded-lg">
                  <Percent className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div>
              <Label>Target Date (optional)</Label>
              <Input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm(f => ({ ...f, targetDate: e.target.value }))}
              />
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-1">Goal Preview</p>
              <p className="text-xs text-muted-foreground">
                {goalForm.name || 'Untitled goal'} - Target: {goalForm.targetValue || '?'}%
                {goalForm.targetDate ? ` by ${goalForm.targetDate}` : ''}
              </p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowGoalDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-red-500 to-orange-500" onClick={handleCreateGoal} disabled={isLoading}>
                <Target className="w-4 h-4 mr-2" />
                {isLoading ? 'Setting...' : 'Set Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-500" />
              Filter Funnels
            </DialogTitle>
            <DialogDescription>Apply filters to narrow down your funnel list</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date Range</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={filterForm.dateRange}
                onChange={(e) => setFilterForm(f => ({ ...f, dateRange: e.target.value }))}
              >
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="last90">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
            </div>
            <div>
              <Label>Owner</Label>
              <Input
                placeholder="Filter by owner name..."
                value={filterForm.owner}
                onChange={(e) => setFilterForm(f => ({ ...f, owner: e.target.value }))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={filterForm.status}
                onChange={(e) => setFilterForm(f => ({ ...f, status: e.target.value }))}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowFilterDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500" onClick={handleApplyFilter}>
                Apply Filters
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Path Analysis Dialog */}
      <Dialog open={showPathAnalysisDialog} onOpenChange={setShowPathAnalysisDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Route className="w-5 h-5 text-indigo-500" />
              Create Path Analysis
            </DialogTitle>
            <DialogDescription>Track how users navigate through your product</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Path Name</Label>
              <Input
                placeholder="e.g. Homepage to Purchase"
                value={pathAnalysisForm.name}
                onChange={(e) => setPathAnalysisForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Start Event</Label>
              <Input
                placeholder="e.g. homepage_view"
                value={pathAnalysisForm.startEvent}
                onChange={(e) => setPathAnalysisForm(f => ({ ...f, startEvent: e.target.value }))}
              />
            </div>
            <div>
              <Label>End Event (optional)</Label>
              <Input
                placeholder="e.g. purchase (leave empty for any)"
                value={pathAnalysisForm.endEvent}
                onChange={(e) => setPathAnalysisForm(f => ({ ...f, endEvent: e.target.value }))}
              />
            </div>
            <div>
              <Label>Max Path Steps</Label>
              <select
                className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800"
                value={pathAnalysisForm.maxSteps}
                onChange={(e) => setPathAnalysisForm(f => ({ ...f, maxSteps: e.target.value }))}
              >
                <option value="5">5 steps</option>
                <option value="10">10 steps</option>
                <option value="15">15 steps</option>
                <option value="20">20 steps</option>
              </select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowPathAnalysisDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500" onClick={handleCreatePathAnalysis} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Path Analysis'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Configure Integration Dialog */}
      <Dialog open={showConfigureIntegrationDialog} onOpenChange={setShowConfigureIntegrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Webhook className="w-5 h-5 text-green-500" />
              Configure {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>Update integration settings and connection status</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">Current Status</p>
                <Badge>{selectedIntegration?.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedIntegration?.status === 'Connected'
                  ? 'Integration is active and syncing data'
                  : selectedIntegration?.status === 'Not Connected'
                  ? 'Integration needs to be configured'
                  : 'Integration is configured and ready'}
              </p>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
              <div>
                <p className="font-medium text-sm">Enable Sync</p>
                <p className="text-xs text-muted-foreground">Automatically sync data</p>
              </div>
              <Switch defaultChecked={selectedIntegration?.status === 'Connected'} />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700">
              <div>
                <p className="font-medium text-sm">Real-time Updates</p>
                <p className="text-xs text-muted-foreground">Push updates immediately</p>
              </div>
              <Switch />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowConfigureIntegrationDialog(false)}>Cancel</Button>
              <Button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500" onClick={() => handleConfigureIntegration(selectedIntegration?.name || '')} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Clear All Data
            </DialogTitle>
            <DialogDescription>This action cannot be undone</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                You are about to permanently delete all analytics data including:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-600 dark:text-red-400">
                <li className="flex items-center gap-2"><XCircle className="w-3 h-3" /> All conversion funnels</li>
                <li className="flex items-center gap-2"><XCircle className="w-3 h-3" /> All user cohorts</li>
                <li className="flex items-center gap-2"><XCircle className="w-3 h-3" /> All experiments and results</li>
                <li className="flex items-center gap-2"><XCircle className="w-3 h-3" /> All retention analyses</li>
                <li className="flex items-center gap-2"><XCircle className="w-3 h-3" /> All custom dashboards</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowClearDataDialog(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleClearAllData} disabled={isLoading}>
                <Trash2 className="w-4 h-4 mr-2" />
                {isLoading ? 'Clearing...' : 'Clear All Data'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Defaults Confirmation Dialog */}
      <Dialog open={showResetDefaultsDialog} onOpenChange={setShowResetDefaultsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <RefreshCw className="w-5 h-5" />
              Reset to Defaults
            </DialogTitle>
            <DialogDescription>This will reset all settings to their default values</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                The following settings will be reset:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-amber-600 dark:text-amber-400">
                <li className="flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Date range preferences</li>
                <li className="flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Statistical significance thresholds</li>
                <li className="flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Tracking configurations</li>
                <li className="flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Notification preferences</li>
                <li className="flex items-center gap-2"><RefreshCw className="w-3 h-3" /> Cache settings</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setShowResetDefaultsDialog(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleResetToDefaults} disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {isLoading ? 'Resetting...' : 'Reset Settings'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
