/**
 * 📊 MAIN DASHBOARD UTILITIES
 * Comprehensive utilities for central dashboard overview and analytics
 */

import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('Dashboard-Utils')

// ============================================================================
// TYPESCRIPT INTERFACES
// ============================================================================

export type ActivityType = 'project' | 'payment' | 'feedback' | 'message' | 'system' | 'action' | 'client'
export type ActivityStatus = 'success' | 'info' | 'warning' | 'error'
export type ActivityImpact = 'low' | 'medium' | 'high' | 'critical'
export type ProjectStatus = 'Not Started' | 'In Progress' | 'Review' | 'Completed' | 'On Hold' | 'Cancelled'
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent'
export type ProjectCategory = 'design' | 'development' | 'marketing' | 'content' | 'consulting' | 'other'
export type InsightType = 'revenue' | 'productivity' | 'client' | 'performance' | 'trend' | 'opportunity' | 'risk'
export type InsightImpact = 'low' | 'medium' | 'high' | 'critical'
export type QuickActionCategory = 'project' | 'client' | 'financial' | 'communication' | 'ai' | 'content'
export type MetricTrend = 'up' | 'down' | 'stable'
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'

export interface DashboardActivity {
  id: string
  userId: string
  type: ActivityType
  message: string
  description?: string
  time: Date
  status: ActivityStatus
  impact: ActivityImpact
  isRead: boolean
  metadata?: Record<string, any>
  relatedId?: string // Related project, client, payment ID
  relatedType?: string // 'project' | 'client' | 'payment'
  actionUrl?: string
  actionLabel?: string
}

export interface DashboardProject {
  id: string
  userId: string
  name: string
  client: string
  clientId: string
  progress: number
  status: ProjectStatus
  value: number
  currency: string
  priority: ProjectPriority
  category: ProjectCategory
  aiAutomation: boolean
  collaboration: number // Number of collaborators
  deadline: Date
  startDate: Date
  estimatedCompletion: string
  description: string
  tags: string[]
  isStarred: boolean
  isPinned: boolean
  completedTasks: number
  totalTasks: number
  hoursLogged: number
  hoursEstimated: number
  budget: number
  spent: number
}

export interface DashboardInsight {
  id: string
  userId: string
  type: InsightType
  title: string
  description: string
  impact: InsightImpact
  action: string
  actionUrl?: string
  confidence: number // 0-100
  actedUpon: boolean
  createdAt: Date
  expiresAt?: Date
  metadata?: Record<string, any>
  priority: number // 1-10
  category: string
  relatedMetrics: string[]
  isAIGenerated: boolean
}

export interface DashboardMetric {
  id: string
  userId: string
  name: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: MetricTrend
  unit: string
  icon: string
  color: string
  isPositive: boolean
  target?: number
  targetProgress?: number
  lastUpdated: Date
  category: string
  description: string
}

export interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  category: QuickActionCategory
  url: string
  shortcut?: string
  isPremium: boolean
  isNew: boolean
  usageCount: number
  lastUsed?: Date
  estimatedTime: string
  complexity: 'simple' | 'moderate' | 'advanced'
}

export interface DashboardStats {
  userId: string
  earnings: number
  earningsTrend: number
  activeProjects: number
  activeProjectsTrend: number
  completedProjects: number
  completedProjectsTrend: number
  totalClients: number
  totalClientsTrend: number
  hoursThisMonth: number
  hoursThisMonthTrend: number
  revenueThisMonth: number
  revenueThisMonthTrend: number
  averageProjectValue: number
  averageProjectValueTrend: number
  clientSatisfaction: number
  clientSatisfactionTrend: number
  productivityScore: number
  productivityScoreTrend: number
  pendingTasks: number
  overdueTasks: number
  upcomingMeetings: number
  unreadMessages: number
  lastUpdated: Date
}

export interface DashboardNotification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  createdAt: Date
  actionUrl?: string
  actionLabel?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

export interface TimelineEvent {
  id: string
  userId: string
  title: string
  description: string
  timestamp: Date
  type: ActivityType
  status: ActivityStatus
  relatedId?: string
  metadata?: Record<string, any>
}

export interface GoalProgress {
  id: string
  userId: string
  title: string
  description: string
  target: number
  current: number
  progress: number
  unit: string
  deadline: Date
  status: 'on-track' | 'at-risk' | 'off-track' | 'completed'
  category: string
  milestones: GoalMilestone[]
}

export interface GoalMilestone {
  id: string
  title: string
  target: number
  completed: boolean
  completedAt?: Date
  deadline: Date
}

// ============================================================================
// MOCK DATA REMOVED - Use real Supabase data
// ============================================================================

// Mock data arrays are deprecated - use real database queries instead
// Kept as empty arrays for backward compatibility

export const mockDashboardActivities: DashboardActivity[] = []

// Mock projects deprecated - use real database queries
export const mockDashboardProjects: DashboardProject[] = []

// Mock insights deprecated - use real database queries
export const mockDashboardInsights: DashboardInsight[] = []

// Mock metrics deprecated - use real database queries
export const mockDashboardMetrics: DashboardMetric[] = []

// Quick actions - these are static UI elements, not mock data
// They define available actions in the dashboard
export const mockQuickActions: QuickAction[] = [
  {
    id: 'QA-0001',
    title: 'Create New Project',
    description: 'Start a new project with AI assistance',
    icon: 'Plus',
    color: 'blue',
    category: 'project',
    url: '/dashboard/projects-hub/create',
    shortcut: 'Cmd+N',
    isPremium: false,
    isNew: false,
    usageCount: 0,
    estimatedTime: '5 min',
    complexity: 'simple'
  },
  {
    id: 'QA-0002',
    title: 'Add New Client',
    description: 'Onboard a new client to your workspace',
    icon: 'UserPlus',
    color: 'green',
    category: 'client',
    url: '/dashboard/client-zone/add',
    shortcut: 'Cmd+Shift+C',
    isPremium: false,
    isNew: false,
    usageCount: 0,
    estimatedTime: '3 min',
    complexity: 'simple'
  },
  {
    id: 'QA-0003',
    title: 'Generate Invoice',
    description: 'Create and send professional invoices',
    icon: 'FileText',
    color: 'purple',
    category: 'financial',
    url: '/dashboard/invoices/create',
    shortcut: 'Cmd+I',
    isPremium: false,
    isNew: false,
    usageCount: 0,
    estimatedTime: '2 min',
    complexity: 'simple'
  },
  {
    id: 'QA-0004',
    title: 'AI Content Generator',
    description: 'Generate content with AI assistance',
    icon: 'Sparkles',
    color: 'pink',
    category: 'ai',
    url: '/dashboard/ai-create',
    shortcut: 'Cmd+Shift+A',
    isPremium: true,
    isNew: true,
    usageCount: 0,
    estimatedTime: '1 min',
    complexity: 'simple'
  },
  {
    id: 'QA-0005',
    title: 'Schedule Meeting',
    description: 'Book meetings with clients',
    icon: 'Calendar',
    color: 'red',
    category: 'communication',
    url: '/dashboard/calendar/new',
    shortcut: 'Cmd+M',
    isPremium: false,
    isNew: false,
    usageCount: 0,
    estimatedTime: '2 min',
    complexity: 'simple'
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export function getActivityColor(status: ActivityStatus): string {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
  return colors[status]
}

export function getImpactColor(impact: ActivityImpact | InsightImpact): string {
  const colors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  }
  return colors[impact]
}

export function getProjectStatusColor(status: ProjectStatus): string {
  const colors = {
    'Not Started': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Review': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-green-100 text-green-800',
    'On Hold': 'bg-orange-100 text-orange-800',
    'Cancelled': 'bg-red-100 text-red-800'
  }
  return colors[status]
}

export function getPriorityColor(priority: ProjectPriority): string {
  const colors = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  }
  return colors[priority]
}

export function getTrendIcon(trend: MetricTrend): string {
  const icons = {
    up: 'TrendingUp',
    down: 'TrendingDown',
    stable: 'Minus'
  }
  return icons[trend]
}

export function getTrendColor(trend: MetricTrend, isPositive: boolean): string {
  if (trend === 'stable') return 'text-gray-500'
  if (trend === 'up') return isPositive ? 'text-green-500' : 'text-red-500'
  return isPositive ? 'text-red-500' : 'text-green-500'
}

export function calculateDashboardStats(
  activities: DashboardActivity[],
  projects: DashboardProject[],
  insights: DashboardInsight[]
): DashboardStats {
  logger.debug('Calculating dashboard statistics')

  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  // Calculate earnings
  const completedProjects = projects.filter(p => p.status === 'Completed')
  const activeProjects = projects.filter(p => p.status === 'In Progress')
  const earnings = completedProjects.reduce((sum, p) => sum + p.value, 0)

  // Calculate hours
  const hoursThisMonth = projects.reduce((sum, p) => sum + p.hoursLogged, 0)

  // Calculate unique clients
  const uniqueClients = new Set(projects.map(p => p.clientId)).size

  // Calculate averages
  const averageProjectValue = projects.length > 0 ? earnings / projects.length : 0

  // Mock trends (in production, compare with previous period)
  const stats: DashboardStats = {
    userId: 'user_demo_123',
    earnings,
    earningsTrend: 12.5,
    activeProjects: activeProjects.length,
    activeProjectsTrend: -5.2,
    completedProjects: completedProjects.length,
    completedProjectsTrend: 8.3,
    totalClients: uniqueClients,
    totalClientsTrend: 15.7,
    hoursThisMonth,
    hoursThisMonthTrend: 6.8,
    revenueThisMonth: earnings,
    revenueThisMonthTrend: 14.2,
    averageProjectValue,
    averageProjectValueTrend: 3.5,
    clientSatisfaction: 4.8,
    clientSatisfactionTrend: 2.1,
    productivityScore: 87,
    productivityScoreTrend: 5.4,
    pendingTasks: projects.reduce((sum, p) => sum + (p.totalTasks - p.completedTasks), 0),
    overdueTasks: projects.filter(p => p.deadline < now && p.status !== 'Completed').length,
    upcomingMeetings: 5,
    unreadMessages: activities.filter(a => !a.isRead && a.type === 'message').length,
    lastUpdated: new Date()
  }

  logger.info('Dashboard statistics calculated', stats)
  return stats
}

export function getActivitiesByType(activities: DashboardActivity[], type: ActivityType): DashboardActivity[] {
  logger.debug('Filtering activities by type', { type, totalActivities: activities.length })
  return activities.filter(a => a.type === type)
}

export function getActivitiesByStatus(activities: DashboardActivity[], status: ActivityStatus): DashboardActivity[] {
  logger.debug('Filtering activities by status', { status, totalActivities: activities.length })
  return activities.filter(a => a.status === status)
}

export function getUnreadActivities(activities: DashboardActivity[]): DashboardActivity[] {
  logger.debug('Getting unread activities', { totalActivities: activities.length })
  return activities.filter(a => !a.isRead)
}

export function getHighImpactActivities(activities: DashboardActivity[]): DashboardActivity[] {
  logger.debug('Getting high impact activities', { totalActivities: activities.length })
  return activities.filter(a => a.impact === 'high' || a.impact === 'critical')
}

export function getProjectsByStatus(projects: DashboardProject[], status: ProjectStatus): DashboardProject[] {
  logger.debug('Filtering projects by status', { status, totalProjects: projects.length })
  return projects.filter(p => p.status === status)
}

export function getProjectsByPriority(projects: DashboardProject[], priority: ProjectPriority): DashboardProject[] {
  logger.debug('Filtering projects by priority', { priority, totalProjects: projects.length })
  return projects.filter(p => p.priority === priority)
}

export function getProjectsByCategory(projects: DashboardProject[], category: ProjectCategory): DashboardProject[] {
  logger.debug('Filtering projects by category', { category, totalProjects: projects.length })
  return projects.filter(p => p.category === category)
}

export function getOverdueProjects(projects: DashboardProject[]): DashboardProject[] {
  const now = new Date()
  logger.debug('Getting overdue projects', { totalProjects: projects.length })
  return projects.filter(p => p.deadline < now && p.status !== 'Completed')
}

export function getStarredProjects(projects: DashboardProject[]): DashboardProject[] {
  logger.debug('Getting starred projects', { totalProjects: projects.length })
  return projects.filter(p => p.isStarred)
}

export function getPinnedProjects(projects: DashboardProject[]): DashboardProject[] {
  logger.debug('Getting pinned projects', { totalProjects: projects.length })
  return projects.filter(p => p.isPinned)
}

export function getInsightsByType(insights: DashboardInsight[], type: InsightType): DashboardInsight[] {
  logger.debug('Filtering insights by type', { type, totalInsights: insights.length })
  return insights.filter(i => i.type === type)
}

export function getInsightsByImpact(insights: DashboardInsight[], impact: InsightImpact): DashboardInsight[] {
  logger.debug('Filtering insights by impact', { impact, totalInsights: insights.length })
  return insights.filter(i => i.impact === impact)
}

export function getActionableInsights(insights: DashboardInsight[]): DashboardInsight[] {
  logger.debug('Getting actionable insights', { totalInsights: insights.length })
  return insights.filter(i => !i.actedUpon)
}

export function getHighConfidenceInsights(insights: DashboardInsight[], minConfidence: number = 80): DashboardInsight[] {
  logger.debug('Getting high confidence insights', { minConfidence, totalInsights: insights.length })
  return insights.filter(i => i.confidence >= minConfidence)
}

export function sortProjectsByDeadline(projects: DashboardProject[]): DashboardProject[] {
  logger.debug('Sorting projects by deadline', { totalProjects: projects.length })
  return [...projects].sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
}

export function sortProjectsByProgress(projects: DashboardProject[]): DashboardProject[] {
  logger.debug('Sorting projects by progress', { totalProjects: projects.length })
  return [...projects].sort((a, b) => b.progress - a.progress)
}

export function sortProjectsByValue(projects: DashboardProject[]): DashboardProject[] {
  logger.debug('Sorting projects by value', { totalProjects: projects.length })
  return [...projects].sort((a, b) => b.value - a.value)
}

export function sortInsightsByPriority(insights: DashboardInsight[]): DashboardInsight[] {
  logger.debug('Sorting insights by priority', { totalInsights: insights.length })
  return [...insights].sort((a, b) => b.priority - a.priority)
}

export function sortInsightsByConfidence(insights: DashboardInsight[]): DashboardInsight[] {
  logger.debug('Sorting insights by confidence', { totalInsights: insights.length })
  return [...insights].sort((a, b) => b.confidence - a.confidence)
}

export function searchActivities(activities: DashboardActivity[], query: string): DashboardActivity[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching activities', { query, totalActivities: activities.length })

  return activities.filter(a =>
    a.message.toLowerCase().includes(searchLower) ||
    (a.description && a.description.toLowerCase().includes(searchLower)) ||
    a.type.toLowerCase().includes(searchLower)
  )
}

export function searchProjects(projects: DashboardProject[], query: string): DashboardProject[] {
  const searchLower = query.toLowerCase()
  logger.debug('Searching projects', { query, totalProjects: projects.length })

  return projects.filter(p =>
    p.name.toLowerCase().includes(searchLower) ||
    p.client.toLowerCase().includes(searchLower) ||
    p.description.toLowerCase().includes(searchLower) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}

export function calculateProjectHealth(project: DashboardProject): {
  score: number
  status: 'excellent' | 'good' | 'warning' | 'critical'
  factors: string[]
} {
  let score = 100
  const factors: string[] = []

  // Check deadline
  const now = new Date()
  const daysToDeadline = Math.floor((project.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysToDeadline < 0 && project.status !== 'Completed') {
    score -= 30
    factors.push('Overdue')
  } else if (daysToDeadline < 7 && project.progress < 80) {
    score -= 20
    factors.push('Tight deadline')
  }

  // Check progress vs timeline
  const totalDays = Math.floor((project.deadline.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const elapsedDays = Math.floor((now.getTime() - project.startDate.getTime()) / (1000 * 60 * 60 * 24))
  const expectedProgress = (elapsedDays / totalDays) * 100

  if (project.progress < expectedProgress - 20) {
    score -= 25
    factors.push('Behind schedule')
  }

  // Check budget
  const budgetUsagePercent = (project.spent / project.budget) * 100
  if (budgetUsagePercent > project.progress + 15) {
    score -= 15
    factors.push('Over budget')
  }

  // Determine status
  let status: 'excellent' | 'good' | 'warning' | 'critical'
  if (score >= 90) status = 'excellent'
  else if (score >= 70) status = 'good'
  else if (score >= 50) status = 'warning'
  else status = 'critical'

  if (factors.length === 0) factors.push('On track')

  logger.debug('Project health calculated', { projectId: project.id, score, status, factors })

  return { score, status, factors }
}

export function getQuickActionsByCategory(actions: QuickAction[], category: QuickActionCategory): QuickAction[] {
  logger.debug('Filtering quick actions by category', { category, totalActions: actions.length })
  return actions.filter(a => a.category === category)
}

export function getNewQuickActions(actions: QuickAction[]): QuickAction[] {
  logger.debug('Getting new quick actions', { totalActions: actions.length })
  return actions.filter(a => a.isNew)
}

export function getMostUsedQuickActions(actions: QuickAction[], limit: number = 5): QuickAction[] {
  logger.debug('Getting most used quick actions', { limit, totalActions: actions.length })
  return [...actions].sort((a, b) => b.usageCount - a.usageCount).slice(0, limit)
}

logger.info('Dashboard utilities initialized - using real database data')
