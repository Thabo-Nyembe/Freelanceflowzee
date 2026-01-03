'use client'

export const dynamic = 'force-dynamic';

/**
 * A++++ ML INSIGHTS PAGE - WORLD-CLASS IMPLEMENTATION
 * Enterprise-grade machine learning insights with complete CRUD operations
 * Pattern: useReducer + Modals + Console Logging + Premium UI
 */

import { useState, useReducer, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain, TrendingUp, AlertTriangle, Lightbulb, Zap, Target,
  BarChart3, Users, CheckCircle, Sparkles, Activity, Eye, Download, Plus,
  Search, Trash2, MoreVertical,
  RefreshCw, Cpu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
// Note: Radix Select removed due to infinite loop bug - using native HTML select instead
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { NumberFlow } from '@/components/ui/number-flow'
import { toast } from 'sonner'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('ML-Insights')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type InsightType = 'trend' | 'anomaly' | 'forecast' | 'pattern' | 'recommendation' | 'alert'
type InsightCategory = 'revenue' | 'engagement' | 'performance' | 'retention' | 'quality' | 'growth'
type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very-high'
type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
type SeverityLevel = 'info' | 'warning' | 'error' | 'critical'
type ModelStatus = 'training' | 'ready' | 'updating' | 'error'

interface MLInsight {
  id: string
  title: string
  type: InsightType
  category: InsightCategory
  description: string
  confidence: ConfidenceLevel
  impact: ImpactLevel
  severity: SeverityLevel
  actionable: boolean
  recommendations: string[]
  dataSource: string
  modelName: string
  modelVersion: string
  modelStatus: ModelStatus
  createdAt: string
  updatedAt: string
  tags: string[]
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }
  affectedUsers?: number
  potentialRevenue?: number
  priority: number
}

interface MLInsightsState {
  insights: MLInsight[]
  selectedInsight: MLInsight | null
  searchTerm: string
  filterType: InsightType | 'all'
  filterCategory: InsightCategory | 'all'
  filterSeverity: SeverityLevel | 'all'
  sortBy: 'priority' | 'confidence' | 'impact' | 'date' | 'type'
  viewMode: 'insights' | 'models' | 'analytics' | 'settings'
  selectedInsights: string[]
}

type MLInsightsAction =
  | { type: 'SET_INSIGHTS'; insights: MLInsight[] }
  | { type: 'ADD_INSIGHT'; insight: MLInsight }
  | { type: 'UPDATE_INSIGHT'; insight: MLInsight }
  | { type: 'DELETE_INSIGHT'; insightId: string }
  | { type: 'SELECT_INSIGHT'; insight: MLInsight | null }
  | { type: 'SET_SEARCH'; searchTerm: string }
  | { type: 'SET_FILTER_TYPE'; filterType: InsightType | 'all' }
  | { type: 'SET_FILTER_CATEGORY'; filterCategory: InsightCategory | 'all' }
  | { type: 'SET_FILTER_SEVERITY'; filterSeverity: SeverityLevel | 'all' }
  | { type: 'SET_SORT'; sortBy: 'priority' | 'confidence' | 'impact' | 'date' | 'type' }
  | { type: 'SET_VIEW_MODE'; viewMode: 'insights' | 'models' | 'analytics' | 'settings' }
  | { type: 'TOGGLE_SELECT_INSIGHT'; insightId: string }
  | { type: 'CLEAR_SELECTED_INSIGHTS' }
  | { type: 'RETRAIN_MODEL'; insightId: string }

// ============================================================================
// REDUCER
// ============================================================================

function mlInsightsReducer(state: MLInsightsState, action: MLInsightsAction): MLInsightsState {
  logger.debug('Reducer action', { type: action.type })

  switch (action.type) {
    case 'SET_INSIGHTS':
      logger.info('Setting insights', { count: action.insights.length })
      return { ...state, insights: action.insights }

    case 'ADD_INSIGHT':
      logger.info('Adding insight', { insightId: action.insight.id, title: action.insight.title })
      return { ...state, insights: [action.insight, ...state.insights] }

    case 'UPDATE_INSIGHT':
      logger.info('Updating insight', { insightId: action.insight.id, title: action.insight.title })
      return {
        ...state,
        insights: state.insights.map(i => i.id === action.insight.id ? action.insight : i),
        selectedInsight: state.selectedInsight?.id === action.insight.id ? action.insight : state.selectedInsight
      }

    case 'DELETE_INSIGHT':
      logger.info('Deleting insight', { insightId: action.insightId })
      return {
        ...state,
        insights: state.insights.filter(i => i.id !== action.insightId),
        selectedInsight: state.selectedInsight?.id === action.insightId ? null : state.selectedInsight,
        selectedInsights: state.selectedInsights.filter(id => id !== action.insightId)
      }

    case 'SELECT_INSIGHT':
      logger.debug('Selecting insight', { insightId: action.insight?.id })
      return { ...state, selectedInsight: action.insight }

    case 'SET_SEARCH':
      logger.debug('Search term updated', { searchTerm: action.searchTerm })
      return { ...state, searchTerm: action.searchTerm }

    case 'SET_FILTER_TYPE':
      logger.debug('Filter type', { filterType: action.filterType })
      return { ...state, filterType: action.filterType }

    case 'SET_FILTER_CATEGORY':
      logger.debug('Filter category', { filterCategory: action.filterCategory })
      return { ...state, filterCategory: action.filterCategory }

    case 'SET_FILTER_SEVERITY':
      logger.debug('Filter severity', { filterSeverity: action.filterSeverity })
      return { ...state, filterSeverity: action.filterSeverity }

    case 'SET_SORT':
      logger.debug('Sort by', { sortBy: action.sortBy })
      return { ...state, sortBy: action.sortBy }

    case 'SET_VIEW_MODE':
      logger.debug('View mode', { viewMode: action.viewMode })
      return { ...state, viewMode: action.viewMode }

    case 'TOGGLE_SELECT_INSIGHT':
      logger.debug('Toggle select insight', { insightId: action.insightId })
      const isSelected = state.selectedInsights.includes(action.insightId)
      return {
        ...state,
        selectedInsights: isSelected
          ? state.selectedInsights.filter(id => id !== action.insightId)
          : [...state.selectedInsights, action.insightId]
      }

    case 'CLEAR_SELECTED_INSIGHTS':
      logger.debug('Clearing selection')
      return { ...state, selectedInsights: [] }

    case 'RETRAIN_MODEL':
      logger.info('Retraining model', { insightId: action.insightId })
      return {
        ...state,
        insights: state.insights.map(i =>
          i.id === action.insightId
            ? { ...i, modelStatus: 'training' as ModelStatus }
            : i
        )
      }

    default:
      return state
  }
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

function generateMockInsights(): MLInsight[] {
  logger.debug('Generating mock ML insights data')

  const types: InsightType[] = ['trend', 'anomaly', 'forecast', 'pattern', 'recommendation', 'alert']
  const categories: InsightCategory[] = ['revenue', 'engagement', 'performance', 'retention', 'quality', 'growth']
  const confidenceLevels: ConfidenceLevel[] = ['low', 'medium', 'high', 'very-high']
  const impactLevels: ImpactLevel[] = ['low', 'medium', 'high', 'critical']
  const severityLevels: SeverityLevel[] = ['info', 'warning', 'error', 'critical']
  const modelStatuses: ModelStatus[] = ['ready', 'ready', 'ready', 'training', 'updating']

  const insightTemplates = [
    { title: 'Revenue Growth Acceleration', description: 'Revenue showing 23% month-over-month growth with strong customer acquisition', category: 'revenue', type: 'trend' },
    { title: 'User Engagement Spike Detected', description: 'Unusual 45% increase in daily active users over past 7 days', category: 'engagement', type: 'anomaly' },
    { title: 'Churn Risk Forecast', description: 'Predicted 8% increase in churn risk for premium subscribers next quarter', category: 'retention', type: 'forecast' },
    { title: 'Weekend Usage Pattern Identified', description: 'Consistent 60% drop in engagement during weekends', category: 'engagement', type: 'pattern' },
    { title: 'Optimize Pricing Strategy', description: 'A/B test suggests 15% conversion improvement with new pricing', category: 'revenue', type: 'recommendation' },
    { title: 'API Response Time Critical', description: 'API latency exceeded 2s threshold, affecting user experience', category: 'performance', type: 'alert' },
    { title: 'Conversion Rate Improving', description: 'Conversion funnel optimization resulted in 12% improvement', category: 'revenue', type: 'trend' },
    { title: 'Payment Failure Anomaly', description: 'Payment failures up 35% in past 24 hours', category: 'revenue', type: 'anomaly' },
    { title: 'Q4 Revenue Projection', description: 'Forecasting $2.4M revenue for Q4 based on current trends', category: 'revenue', type: 'forecast' },
    { title: 'Mobile vs Desktop Patterns', description: 'Mobile users show 2x higher engagement than desktop', category: 'engagement', type: 'pattern' },
    { title: 'Implement Push Notifications', description: 'Push notifications could increase retention by 18%', category: 'retention', type: 'recommendation' },
    { title: 'Database Query Performance', description: 'Slow queries detected affecting load times', category: 'performance', type: 'alert' },
    { title: 'Customer Lifetime Value Up', description: 'Average CLV increased from $450 to $580', category: 'revenue', type: 'trend' },
    { title: 'Signup Flow Dropout Spike', description: 'Step 3 dropout rate increased from 15% to 28%', category: 'engagement', type: 'anomaly' },
    { title: 'Feature Adoption Forecast', description: 'New feature projected to reach 40% adoption in 30 days', category: 'growth', type: 'forecast' },
    { title: 'Geographic Usage Patterns', description: 'APAC region shows highest growth at 35% MoM', category: 'growth', type: 'pattern' },
    { title: 'Add Onboarding Tutorial', description: 'Tutorial could reduce early churn by 22%', category: 'retention', type: 'recommendation' },
    { title: 'Server Capacity Warning', description: 'Current capacity may be insufficient for projected growth', category: 'performance', type: 'alert' },
    { title: 'Support Ticket Volume Rising', description: 'Support tickets up 40% indicating product issues', category: 'quality', type: 'trend' },
    { title: 'Unusual Login Activity', description: 'Login attempts from new regions increased 120%', category: 'quality', type: 'anomaly' },
    { title: 'User Growth Projection', description: 'Forecasting 10K new users by end of quarter', category: 'growth', type: 'forecast' },
    { title: 'Power User Behavior Pattern', description: 'Top 10% of users generate 60% of engagement', category: 'engagement', type: 'pattern' },
    { title: 'Optimize Email Campaigns', description: 'Personalized emails could improve open rates by 25%', category: 'engagement', type: 'recommendation' },
    { title: 'Memory Usage Alert', description: 'Memory usage at 85% capacity, scaling recommended', category: 'performance', type: 'alert' },
    { title: 'Trial Conversion Improving', description: 'Trial to paid conversion up from 18% to 24%', category: 'revenue', type: 'trend' },
    { title: 'Feature Usage Anomaly', description: 'AI features showing unexpected 200% usage spike', category: 'engagement', type: 'anomaly' },
    { title: 'Seasonal Demand Forecast', description: 'Holiday season expected to bring 50% traffic increase', category: 'growth', type: 'forecast' },
    { title: 'Referral Source Patterns', description: 'Organic search drives 55% of high-value customers', category: 'growth', type: 'pattern' },
    { title: 'Improve Search Functionality', description: 'Enhanced search could reduce bounce rate by 15%', category: 'engagement', type: 'recommendation' },
    { title: 'SSL Certificate Expiring', description: 'SSL certificate expires in 14 days', category: 'quality', type: 'alert' },
    { title: 'NPS Score Trending Up', description: 'Net Promoter Score improved from 42 to 58', category: 'quality', type: 'trend' },
    { title: 'Refund Rate Spike Detected', description: 'Refund requests up 45% for enterprise plans', category: 'revenue', type: 'anomaly' },
    { title: 'Market Expansion Forecast', description: 'European market could generate $800K ARR', category: 'growth', type: 'forecast' },
    { title: 'Subscription Tier Patterns', description: 'Users upgrade to premium within 45 days on average', category: 'revenue', type: 'pattern' },
    { title: 'Add Live Chat Support', description: 'Live chat could improve conversion by 20%', category: 'engagement', type: 'recommendation' },
    { title: 'CDN Performance Issue', description: 'CDN latency increased in EMEA region', category: 'performance', type: 'alert' },
    { title: 'Feature Engagement Rising', description: 'New dashboard feature at 65% adoption rate', category: 'engagement', type: 'trend' },
    { title: 'Billing Error Anomaly', description: 'Billing failures increased 30% after latest update', category: 'revenue', type: 'anomaly' },
    { title: 'Competitor Analysis Forecast', description: 'Competitive pricing could reduce churn by 12%', category: 'retention', type: 'forecast' },
    { title: 'Support Response Patterns', description: 'Average response time under 2 hours drives 90% satisfaction', category: 'quality', type: 'pattern' }
  ]

  const insights: MLInsight[] = insightTemplates.map((template, index) => {
    const randomConfidence = confidenceLevels[Math.floor(Math.random() * confidenceLevels.length)]
    const randomImpact = impactLevels[Math.floor(Math.random() * impactLevels.length)]
    const randomSeverity = severityLevels[Math.floor(Math.random() * severityLevels.length)]
    const randomModelStatus = modelStatuses[Math.floor(Math.random() * modelStatuses.length)]

    return {
      id: `INS-${String(index + 1).padStart(3, '0')}`,
      title: template.title,
      type: template.type as InsightType,
      category: template.category as InsightCategory,
      description: template.description,
      confidence: randomConfidence,
      impact: randomImpact,
      severity: randomSeverity,
      actionable: Math.random() > 0.3,
      recommendations: [
        'Review historical data trends',
        'Set up automated alerts',
        'Schedule team review meeting',
        'Update forecasting models',
        'Implement recommended changes'
      ].slice(0, Math.floor(Math.random() * 3) + 2),
      dataSource: ['Analytics DB', 'User Events', 'Transaction Logs', 'API Metrics', 'Customer Data'][Math.floor(Math.random() * 5)],
      modelName: ['Prophet', 'ARIMA', 'LSTM', 'Random Forest', 'XGBoost', 'Neural Network'][Math.floor(Math.random() * 6)],
      modelVersion: `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}`,
      modelStatus: randomModelStatus,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['ML', 'AI', 'Analytics', 'Predictive', 'Automated'].slice(0, Math.floor(Math.random() * 3) + 1),
      metrics: {
        accuracy: 0.7 + Math.random() * 0.28,
        precision: 0.65 + Math.random() * 0.33,
        recall: 0.6 + Math.random() * 0.38,
        f1Score: 0.68 + Math.random() * 0.3
      },
      affectedUsers: Math.floor(Math.random() * 50000) + 1000,
      potentialRevenue: Math.floor(Math.random() * 500000) + 10000,
      priority: Math.floor(Math.random() * 10) + 1
    }
  })

  logger.info('Generated mock ML insights', { count: insights.length })
  return insights
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInsightIcon(type: InsightType) {
  const icons: Record<InsightType, any> = {
    trend: TrendingUp,
    anomaly: AlertTriangle,
    forecast: Activity,
    pattern: Eye,
    recommendation: Lightbulb,
    alert: AlertTriangle
  }
  return icons[type] || Brain
}

function getConfidenceColor(confidence: ConfidenceLevel): string {
  const colors: Record<ConfidenceLevel, string> = {
    'low': 'red',
    'medium': 'yellow',
    'high': 'green',
    'very-high': 'emerald'
  }
  return colors[confidence] || 'gray'
}

function getImpactColor(impact: ImpactLevel): string {
  const colors: Record<ImpactLevel, string> = {
    'low': 'blue',
    'medium': 'yellow',
    'high': 'orange',
    'critical': 'red'
  }
  return colors[impact] || 'gray'
}

function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    'info': 'blue',
    'warning': 'yellow',
    'error': 'orange',
    'critical': 'red'
  }
  return colors[severity] || 'gray'
}

function confidenceToPercentage(confidence: ConfidenceLevel): number {
  const percentages: Record<ConfidenceLevel, number> = {
    'low': 60,
    'medium': 75,
    'high': 90,
    'very-high': 98
  }
  return percentages[confidence] || 50
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MlInsightsClient() {
  logger.debug('Component mounting')

  // A+++ STATE MANAGEMENT
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // REDUCER STATE
  const [state, dispatch] = useReducer(mlInsightsReducer, {
    insights: [],
    selectedInsight: null,
    searchTerm: '',
    filterType: 'all',
    filterCategory: 'all',
    filterSeverity: 'all',
    sortBy: 'priority',
    viewMode: 'insights',
    selectedInsights: []
  })

  // MODAL STATES
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showConfigureModal, setShowConfigureModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // FORM STATES
  const [insightTitle, setInsightTitle] = useState('')
  const [insightType, setInsightType] = useState<InsightType>('trend')
  const [insightCategory, setInsightCategory] = useState<InsightCategory>('revenue')
  const [insightDescription, setInsightDescription] = useState('')
  const [insightConfidence, setInsightConfidence] = useState<ConfidenceLevel>('high')
  const [insightImpact, setInsightImpact] = useState<ImpactLevel>('medium')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json')

  // ============================================================================
  // LOAD DATA
  // ============================================================================

  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      logger.info('Loading ML insights from database', { userId })
      try {
        setIsLoading(true)
        setError(null)

        // Dynamic import for code splitting
        const { getMLInsights } = await import('@/lib/ml-insights-queries')

        const { data: insights, error: insightsError } = await getMLInsights(userId)

        if (insightsError) throw insightsError

        // If no insights in database, use mock data
        const insightsToUse = (insights && insights.length > 0) ? insights : generateMockInsights()
        dispatch({ type: 'SET_INSIGHTS', insights: insightsToUse as MLInsight[] })

        logger.info('ML insights loaded successfully', {
          userId,
          count: insightsToUse.length,
          source: (insights && insights.length > 0) ? 'database' : 'mock'
        })
        announce(`${insightsToUse.length} ML insights loaded successfully`, 'polite')

        setIsLoading(false)
      } catch (err) {
        logger.error('ML insights load error', {
          error: err instanceof Error ? err.message : 'Unknown error',
          errorObject: err,
          userId
        })
        setError(err instanceof Error ? err.message : 'Failed to load ML insights')
        setIsLoading(false)
        announce('Error loading ML insights', 'assertive')
      }
    }

    loadData()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const stats = useMemo(() => {
    logger.debug('Computing stats')
    const total = state.insights.length
    const critical = state.insights.filter(i => i.impact === 'critical').length
    const highConfidence = state.insights.filter(i => i.confidence === 'high' || i.confidence === 'very-high').length
    const actionable = state.insights.filter(i => i.actionable).length
    const avgAccuracy = state.insights.reduce((sum, i) => sum + i.metrics.accuracy, 0) / total
    const totalAffectedUsers = state.insights.reduce((sum, i) => sum + (i.affectedUsers || 0), 0)

    const result = {
      total,
      critical,
      highConfidence,
      actionable,
      avgAccuracy: (avgAccuracy * 100).toFixed(1),
      totalAffectedUsers
    }

    logger.debug('Stats computed', result)
    return result
  }, [state.insights])

  const filteredAndSortedInsights = useMemo(() => {
    let filtered = state.insights

    // Search
    if (state.searchTerm) {
      filtered = filtered.filter(insight =>
        insight.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        insight.description.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        insight.tags.some(tag => tag.toLowerCase().includes(state.searchTerm.toLowerCase()))
      )
      logger.debug('Search filtered', { resultCount: filtered.length, searchTerm: state.searchTerm })
    }

    // Filter by type
    if (state.filterType !== 'all') {
      filtered = filtered.filter(insight => insight.type === state.filterType)
      logger.debug('Type filtered', { resultCount: filtered.length, filterType: state.filterType })
    }

    // Filter by category
    if (state.filterCategory !== 'all') {
      filtered = filtered.filter(insight => insight.category === state.filterCategory)
      logger.debug('Category filtered', { resultCount: filtered.length, filterCategory: state.filterCategory })
    }

    // Filter by severity
    if (state.filterSeverity !== 'all') {
      filtered = filtered.filter(insight => insight.severity === state.filterSeverity)
      logger.debug('Severity filtered', { resultCount: filtered.length, filterSeverity: state.filterSeverity })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (state.sortBy) {
        case 'priority':
          return b.priority - a.priority
        case 'confidence':
          const confidenceOrder = { 'very-high': 4, 'high': 3, 'medium': 2, 'low': 1 }
          return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
        case 'impact':
          const impactOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
          return impactOrder[b.impact] - impactOrder[a.impact]
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'type':
          return a.type.localeCompare(b.type)
        default:
          return 0
      }
    })

    logger.debug('Filter and sort complete', { resultCount: sorted.length, sortBy: state.sortBy })
    return sorted
  }, [state.insights, state.searchTerm, state.filterType, state.filterCategory, state.filterSeverity, state.sortBy])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCreateInsight = async () => {
    logger.info('Creating ML insight', {
      title: insightTitle,
      type: insightType,
      category: insightCategory,
      confidence: insightConfidence,
      impact: insightImpact
    })

    if (!insightTitle || !insightDescription) {
      logger.warn('Missing required fields for insight creation', {
        hasTitle: !!insightTitle,
        hasDescription: !!insightDescription
      })
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSaving(true)

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title: insightTitle,
            type: insightType,
            category: insightCategory,
            description: insightDescription,
            confidence: insightConfidence,
            impact: insightImpact,
            tags: ['Custom', 'Manual']
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'ADD_INSIGHT', insight: result.insight })

        logger.info('ML insight created successfully', {
          insightId: result.insight.id,
          title: result.insight.title,
          type: result.insight.type,
          category: result.insight.category
        })

        toast.success('ML insight created', {
          description: `${result.insight.title} - ${result.insight.type} - ${result.insight.category} - ${result.insight.confidence} confidence - ${result.insight.impact} impact`
        })

        setShowCreateModal(false)
        setInsightTitle('')
        setInsightDescription('')
      } else {
        throw new Error(result.error || 'Failed to create insight')
      }
    } catch (error: any) {
      logger.error('Failed to create ML insight', {
        error: error.message,
        title: insightTitle,
        type: insightType
      })
      toast.error('Failed to create insight', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleViewInsight = (insight: MLInsight) => {
    logger.info('Opening insight details', {
      insightId: insight.id,
      title: insight.title,
      type: insight.type,
      category: insight.category,
      confidence: insight.confidence
    })

    dispatch({ type: 'SELECT_INSIGHT', insight })
    setShowViewModal(true)

    toast.info('View ML Insight', {
      description: `${insight.title} - ${insight.type} - ${insight.confidence} confidence - ${(insight.metrics.accuracy * 100).toFixed(1)}% accuracy - ${insight.affectedUsers || 0} users affected`
    })
  }

  const handleDeleteInsight = async (insightId: string) => {
    const insight = state.insights.find(i => i.id === insightId)

    logger.info('Deleting ML insight', {
      insightId,
      title: insight?.title,
      type: insight?.type
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          insightId
        })
      })

      const result = await response.json()

      if (result.success) {
        dispatch({ type: 'DELETE_INSIGHT', insightId })

        logger.info('ML insight deleted successfully', {
          insightId,
          title: insight?.title
        })

        toast.success('ML insight deleted', {
          description: `${insight?.title} - ${insight?.type} - ${insight?.category} - Removed from dashboard`
        })

        setShowDeleteModal(false)
        setShowViewModal(false)
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error: any) {
      logger.error('Failed to delete ML insight', {
        error: error.message,
        insightId
      })
      toast.error('Failed to delete insight', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkDelete = async () => {
    const selectedInsightsData = state.insights.filter(i => state.selectedInsights.includes(i.id))
    const totalAffectedUsers = selectedInsightsData.reduce((sum, i) => sum + (i.affectedUsers || 0), 0)

    logger.info('Bulk deleting ML insights', {
      count: state.selectedInsights.length,
      insightIds: state.selectedInsights,
      totalAffectedUsers
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-delete',
          insightIds: state.selectedInsights
        })
      })

      const result = await response.json()

      if (result.success) {
        state.selectedInsights.forEach(id => {
          dispatch({ type: 'DELETE_INSIGHT', insightId: id })
        })

        logger.info('Bulk delete complete', {
          deletedCount: result.deletedCount,
          totalAffectedUsers
        })

        toast.success(`Deleted ${result.deletedCount} insight(s)`, {
          description: `${result.deletedCount} ML insights - ${totalAffectedUsers.toLocaleString()} total users affected - Removed from dashboard`
        })

        dispatch({ type: 'CLEAR_SELECTED_INSIGHTS' })
      } else {
        throw new Error(result.error || 'Bulk delete failed')
      }
    } catch (error: any) {
      logger.error('Bulk delete failed', {
        error: error.message,
        count: state.selectedInsights.length
      })
      toast.error('Failed to delete insights', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleRetrainModel = async (insightId: string) => {
    const insight = state.insights.find(i => i.id === insightId)

    logger.info('Retraining ML model', {
      insightId,
      modelName: insight?.modelName,
      currentVersion: insight?.modelVersion,
      currentAccuracy: insight?.metrics.accuracy
    })

    try {
      dispatch({ type: 'RETRAIN_MODEL', insightId })
      toast.info('Model retraining started...', {
        description: `${insight?.modelName} - v${insight?.modelVersion} - This may take a few moments`
      })

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'retrain',
          insightId
        })
      })

      const result = await response.json()

      if (result.success) {
        const insight = state.insights.find(i => i.id === insightId)
        if (insight) {
          const updatedInsight = {
            ...insight,
            modelStatus: result.insight.modelStatus,
            modelVersion: result.insight.modelVersion,
            metrics: result.metrics,
            updatedAt: result.insight.updatedAt
          }
          dispatch({ type: 'UPDATE_INSIGHT', insight: updatedInsight })
        }

        logger.info('Model retrained successfully', {
          insightId,
          modelName: insight?.modelName,
          newVersion: result.insight.modelVersion,
          newMetrics: result.metrics
        })

        toast.success('Model retrained successfully', {
          description: `${insight?.modelName} - v${result.insight.modelVersion} - Accuracy: ${(result.metrics.accuracy * 100).toFixed(1)}% - F1: ${(result.metrics.f1Score * 100).toFixed(1)}%`
        })
      } else {
        throw new Error(result.error || 'Retrain failed')
      }
    } catch (error: any) {
      logger.error('Failed to retrain model', {
        error: error.message,
        insightId,
        modelName: insight?.modelName
      })
      toast.error('Failed to retrain model', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleExport = async () => {
    const totalUsers = filteredAndSortedInsights.reduce((sum, i) => sum + (i.affectedUsers || 0), 0)
    const avgAccuracy = filteredAndSortedInsights.reduce((sum, i) => sum + i.metrics.accuracy, 0) / filteredAndSortedInsights.length

    logger.info('Exporting ML insights', {
      format: exportFormat,
      count: filteredAndSortedInsights.length,
      totalUsers,
      avgAccuracy
    })

    try {
      setIsSaving(true)

      const response = await fetch('/api/ml-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'export',
          exportFormat
        })
      })

      const result = await response.json()

      if (result.success) {
        // Client-side download
        const dataStr = JSON.stringify(filteredAndSortedInsights, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ml-insights-${new Date().toISOString().split('T')[0]}.${exportFormat}`
        link.click()
        URL.revokeObjectURL(url)

        logger.info('Export complete', {
          format: exportFormat,
          count: filteredAndSortedInsights.length,
          fileSize: dataBlob.size,
          fileName: link.download
        })

        toast.success(`Exported ${result.insightCount} insights`, {
          description: `${exportFormat.toUpperCase()} - ${Math.round(dataBlob.size / 1024)}KB - ${totalUsers.toLocaleString()} users affected - ${(avgAccuracy * 100).toFixed(1)}% avg accuracy - ${link.download}`
        })

        setShowExportModal(false)
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error: any) {
      logger.error('Export failed', {
        error: error.message,
        format: exportFormat,
        count: filteredAndSortedInsights.length
      })
      toast.error('Failed to export insights', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    logger.debug('Rendering loading state')
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              <CardSkeleton />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
              <ListSkeleton items={5} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    logger.error('Rendering error state', { error })
    return (
      <div className="min-h-screen relative overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="container mx-auto px-4 py-12 relative z-10">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  logger.debug('Rendering main view', {
    totalInsights: state.insights.length,
    filteredCount: filteredAndSortedInsights.length,
    viewMode: state.viewMode
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium mb-6 border border-purple-500/30"
              >
                <Brain className="w-4 h-4" />
                ML Insights
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Powered
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Machine Learning Insights
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                AI-powered analytics with predictive modeling, anomaly detection, and intelligent recommendations
              </p>
            </div>
          </ScrollReveal>

          {/* Stats Cards */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Total Insights</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.total} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-sm text-gray-400">Critical</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.critical} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">High Confidence</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.highConfidence} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Actionable</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  <NumberFlow value={stats.actionable} />
                </p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-gray-400">Avg Accuracy</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.avgAccuracy}%</p>
              </LiquidGlassCard>

              <LiquidGlassCard className="p-4">
                
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-orange-400" />
                  <span className="text-sm text-gray-400">Affected Users</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalAffectedUsers)}</p>
              </LiquidGlassCard>
            </div>
          </ScrollReveal>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search insights..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH', searchTerm: e.target.value })}
                  className="pl-10 bg-slate-900/50 border-gray-700"
                />
              </div>
            </div>

            {/* Filters */}
            <select
              value={state.filterType}
              onChange={(e) => dispatch({ type: 'SET_FILTER_TYPE', filterType: e.target.value as any })}
              className="w-[180px] px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="trend">Trend</option>
              <option value="anomaly">Anomaly</option>
              <option value="forecast">Forecast</option>
              <option value="pattern">Pattern</option>
              <option value="recommendation">Recommendation</option>
              <option value="alert">Alert</option>
            </select>

            <select
              value={state.filterCategory}
              onChange={(e) => dispatch({ type: 'SET_FILTER_CATEGORY', filterCategory: e.target.value as any })}
              className="w-[180px] px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="engagement">Engagement</option>
              <option value="performance">Performance</option>
              <option value="retention">Retention</option>
              <option value="quality">Quality</option>
              <option value="growth">Growth</option>
            </select>

            <select
              value={state.sortBy}
              onChange={(e) => dispatch({ type: 'SET_SORT', sortBy: e.target.value as any })}
              className="w-[180px] px-3 py-2 bg-slate-900/50 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="priority">Priority</option>
              <option value="confidence">Confidence</option>
              <option value="impact">Impact</option>
              <option value="date">Date</option>
              <option value="type">Type</option>
            </select>

            {/* Actions */}
            <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Insight
            </Button>

            <Button variant="outline" onClick={() => setShowExportModal(true)} className="border-gray-700 hover:bg-slate-800">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Bulk Actions */}
          {state.selectedInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg mb-6"
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={state.selectedInsights.length === filteredAndSortedInsights.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      filteredAndSortedInsights.forEach(insight => {
                        if (!state.selectedInsights.includes(insight.id)) {
                          dispatch({ type: 'TOGGLE_SELECT_INSIGHT', insightId: insight.id })
                        }
                      })
                    } else {
                      dispatch({ type: 'CLEAR_SELECTED_INSIGHTS' })
                    }
                  }}
                />
                <span className="text-sm text-white">
                  {state.selectedInsights.length} insight{state.selectedInsights.length !== 1 ? 's' : ''} selected
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isSaving}
                  className="border-gray-700 hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch({ type: 'CLEAR_SELECTED_INSIGHTS' })}
                  className="border-gray-700 hover:bg-slate-800"
                >
                  Clear Selection
                </Button>
              </div>
            </motion.div>
          )}

          {/* Insights Grid */}
          {filteredAndSortedInsights.length === 0 ? (
            <NoDataEmptyState
              title="No insights found"
              description="Try adjusting your filters or create a new insight"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAndSortedInsights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type)
                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <LiquidGlassCard className="p-6 hover:border-purple-500/50 transition-colors">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Checkbox
                              checked={state.selectedInsights.includes(insight.id)}
                              onCheckedChange={() => dispatch({ type: 'TOGGLE_SELECT_INSIGHT', insightId: insight.id })}
                            />
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${getImpactColor(insight.impact)}-500/20 to-${getImpactColor(insight.impact)}-600/20 flex items-center justify-center shrink-0`}>
                              <Icon className={`w-6 h-6 text-${getImpactColor(insight.impact)}-400`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-white mb-1 line-clamp-1">{insight.title}</h3>
                              <p className="text-sm text-gray-400 line-clamp-2">{insight.description}</p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-slate-900 border-gray-700">
                              <DropdownMenuItem onClick={() => handleViewInsight(insight)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRetrainModel(insight.id)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retrain Model
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  dispatch({ type: 'SELECT_INSIGHT', insight })
                                  setShowDeleteModal(true)
                                }}
                                className="text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`bg-${getImpactColor(insight.impact)}-500/20 text-${getImpactColor(insight.impact)}-300 border-${getImpactColor(insight.impact)}-500/30 text-xs`}>
                            {insight.impact} impact
                          </Badge>
                          <Badge className={`bg-${getConfidenceColor(insight.confidence)}-500/20 text-${getConfidenceColor(insight.confidence)}-300 border-${getConfidenceColor(insight.confidence)}-500/30 text-xs`}>
                            {confidenceToPercentage(insight.confidence)}% confidence
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {insight.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-gray-700">
                            {insight.category}
                          </Badge>
                          {insight.modelStatus !== 'ready' && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                              {insight.modelStatus}
                            </Badge>
                          )}
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-700">
                          <div>
                            <p className="text-xs text-gray-400">Accuracy</p>
                            <p className="text-sm font-semibold text-white">{(insight.metrics.accuracy * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Precision</p>
                            <p className="text-sm font-semibold text-white">{(insight.metrics.precision * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Users</p>
                            <p className="text-sm font-semibold text-white">{formatNumber(insight.affectedUsers || 0)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Revenue</p>
                            <p className="text-sm font-semibold text-white">{formatCurrency(insight.potentialRevenue || 0)}</p>
                          </div>
                        </div>

                        {/* Model Info */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Cpu className="w-3 h-3" />
                            <span>{insight.modelName} {insight.modelVersion}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {insight.tags.map((tag, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs border-gray-700">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </LiquidGlassCard>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogContent className="max-w-2xl bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5 text-purple-400" />
                  Create New Insight
                </DialogTitle>
                <DialogDescription>
                  Add a new machine learning insight to your dashboard
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title" className="text-white">Title *</Label>
                  <Input
                    id="title"
                    value={insightTitle}
                    onChange={(e) => setInsightTitle(e.target.value)}
                    placeholder="Insight title..."
                    className="bg-slate-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-white">Type *</Label>
                    <select
                      value={insightType}
                      onChange={(e) => setInsightType(e.target.value as InsightType)}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="trend">Trend</option>
                      <option value="anomaly">Anomaly</option>
                      <option value="forecast">Forecast</option>
                      <option value="pattern">Pattern</option>
                      <option value="recommendation">Recommendation</option>
                      <option value="alert">Alert</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Category *</Label>
                    <select
                      value={insightCategory}
                      onChange={(e) => setInsightCategory(e.target.value as InsightCategory)}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="revenue">Revenue</option>
                      <option value="engagement">Engagement</option>
                      <option value="performance">Performance</option>
                      <option value="retention">Retention</option>
                      <option value="quality">Quality</option>
                      <option value="growth">Growth</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-white">Description *</Label>
                  <Textarea
                    id="description"
                    value={insightDescription}
                    onChange={(e) => setInsightDescription(e.target.value)}
                    placeholder="Describe the insight..."
                    rows={4}
                    className="bg-slate-800 border-gray-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="confidence" className="text-white">Confidence Level</Label>
                    <select
                      value={insightConfidence}
                      onChange={(e) => setInsightConfidence(e.target.value as ConfidenceLevel)}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low (60%)</option>
                      <option value="medium">Medium (75%)</option>
                      <option value="high">High (90%)</option>
                      <option value="very-high">Very High (98%)</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="impact" className="text-white">Impact Level</Label>
                    <select
                      value={insightImpact}
                      onChange={(e) => setInsightImpact(e.target.value as ImpactLevel)}
                      className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInsight}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSaving ? 'Creating...' : 'Create Insight'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* VIEW MODAL */}
      <AnimatePresence>
        {showViewModal && state.selectedInsight && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-purple-400" />
                  {state.selectedInsight.title}
                </DialogTitle>
                <DialogDescription>
                  Detailed view of ML insight #{state.selectedInsight.id}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="model">Model</TabsTrigger>
                  <TabsTrigger value="recommendations">Actions</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                    <p className="text-white">{state.selectedInsight.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Type</h4>
                      <Badge>{state.selectedInsight.type}</Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Category</h4>
                      <Badge variant="outline">{state.selectedInsight.category}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Confidence</h4>
                      <Badge className={`bg-${getConfidenceColor(state.selectedInsight.confidence)}-500/20 text-${getConfidenceColor(state.selectedInsight.confidence)}-300 border-${getConfidenceColor(state.selectedInsight.confidence)}-500/30`}>
                        {confidenceToPercentage(state.selectedInsight.confidence)}%
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Impact</h4>
                      <Badge className={`bg-${getImpactColor(state.selectedInsight.impact)}-500/20 text-${getImpactColor(state.selectedInsight.impact)}-300 border-${getImpactColor(state.selectedInsight.impact)}-500/30`}>
                        {state.selectedInsight.impact}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Severity</h4>
                      <Badge className={`bg-${getSeverityColor(state.selectedInsight.severity)}-500/20 text-${getSeverityColor(state.selectedInsight.severity)}-300 border-${getSeverityColor(state.selectedInsight.severity)}-500/30`}>
                        {state.selectedInsight.severity}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Impact Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Affected Users</p>
                        <p className="text-2xl font-bold text-white">{formatNumber(state.selectedInsight.affectedUsers || 0)}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Potential Revenue</p>
                        <p className="text-2xl font-bold text-white">{formatCurrency(state.selectedInsight.potentialRevenue || 0)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.selectedInsight.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Model Tab */}
                <TabsContent value="model" className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Model Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Model Name</p>
                        <p className="text-white font-semibold">{state.selectedInsight.modelName}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Version</p>
                        <p className="text-white font-semibold">{state.selectedInsight.modelVersion}</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Status</p>
                        <Badge className={state.selectedInsight.modelStatus === 'ready' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}>
                          {state.selectedInsight.modelStatus}
                        </Badge>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Data Source</p>
                        <p className="text-white font-semibold">{state.selectedInsight.dataSource}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Accuracy</p>
                        <p className="text-2xl font-bold text-white">{(state.selectedInsight.metrics.accuracy * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Precision</p>
                        <p className="text-2xl font-bold text-white">{(state.selectedInsight.metrics.precision * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">Recall</p>
                        <p className="text-2xl font-bold text-white">{(state.selectedInsight.metrics.recall * 100).toFixed(1)}%</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-lg">
                        <p className="text-sm text-gray-400">F1 Score</p>
                        <p className="text-2xl font-bold text-white">{(state.selectedInsight.metrics.f1Score * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRetrainModel(state.selectedInsight!.id)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retrain Model
                    </Button>
                  </div>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4 pt-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Recommended Actions</h4>
                    <div className="space-y-3">
                      {state.selectedInsight.recommendations.map((rec, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                          <p className="text-white">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {state.selectedInsight.actionable && (
                    <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-green-400" />
                        <h4 className="text-sm font-medium text-green-300">Actionable Insight</h4>
                      </div>
                      <p className="text-xs text-green-400">
                        This insight has specific actions that can be implemented immediately for maximum impact.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false)
                    setShowDeleteModal(true)
                  }}
                  className="border-gray-700 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setShowViewModal(false)} className="border-gray-700">
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* EXPORT MODAL */}
      <AnimatePresence>
        {showExportModal && (
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogContent className="bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <Download className="w-5 h-5 text-purple-400" />
                  Export Insights
                </DialogTitle>
                <DialogDescription>
                  Download {filteredAndSortedInsights.length} insight(s) in your preferred format
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="format" className="text-white">Export Format</Label>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="json">JSON</option>
                    <option value="csv">CSV</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>

                <div className="p-4 bg-slate-800 rounded-lg">
                  <p className="text-sm text-gray-400">Export will include:</p>
                  <ul className="mt-2 space-y-1 text-sm text-white">
                    <li>• {filteredAndSortedInsights.length} insights</li>
                    <li>• All metadata and metrics</li>
                    <li>• Model information</li>
                    <li>• Recommendations</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExportModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={handleExport}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isSaving ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {showDeleteModal && state.selectedInsight && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="bg-slate-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Delete Insight
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this insight? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-white font-medium">{state.selectedInsight.title}</p>
                  <p className="text-xs text-gray-400 mt-1">ID: {state.selectedInsight.id}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="border-gray-700">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDeleteInsight(state.selectedInsight!.id)}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSaving ? 'Deleting...' : 'Delete Insight'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
