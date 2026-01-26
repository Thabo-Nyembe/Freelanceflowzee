/**
 * Admin Dashboard Types
 * Unified overview for all admin features
 */

import type { JsonValue } from '@/lib/types/database'

export type ModuleStatus = 'active' | 'warning' | 'critical' | 'inactive'
export type MetricTrend = 'up' | 'down' | 'stable'
export type AlertLevel = 'info' | 'warning' | 'error' | 'success'
export type QuickActionCategory = 'create' | 'manage' | 'analyze' | 'automate'

export interface AdminModule {
  id: string
  name: string
  icon: string
  description: string
  path: string
  status: ModuleStatus
  metrics: ModuleMetric[]
  recentActivity: Activity[]
  quickActions: QuickAction[]
}

export interface ModuleMetric {
  id: string
  label: string
  value: number | string
  previousValue?: number
  change?: number
  changePercent?: number
  trend?: MetricTrend
  format: 'number' | 'currency' | 'percentage' | 'text'
  icon?: string
  color?: string
}

export interface Activity {
  id: string
  moduleId: string
  type: string
  title: string
  description: string
  timestamp: Date
  userId?: string
  userName?: string
  metadata?: Record<string, JsonValue>
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  category: QuickActionCategory
  path?: string
  onClick?: () => void
  badge?: string | number
}

export interface SystemAlert {
  id: string
  level: AlertLevel
  title: string
  message: string
  moduleId?: string
  timestamp: Date
  isRead: boolean
  actionLabel?: string
  actionPath?: string
}

export interface DashboardStats {
  totalRevenue: number
  revenueGrowth: number
  totalClients: number
  activeClients: number
  totalLeads: number
  hotLeads: number
  totalInvoices: number
  overdueInvoices: number
  emailCampaigns: number
  emailOpenRate: number
  totalProjects: number
  activeProjects: number
  teamMembers: number
  activeUsers: number
}

export interface PerformanceIndicator {
  id: string
  name: string
  value: number
  target: number
  status: 'excellent' | 'good' | 'fair' | 'poor'
  trend: MetricTrend
}

export interface RecentMetrics {
  date: string
  revenue: number
  leads: number
  clients: number
  emails: number
}

export interface TopPerformer {
  id: string
  name: string
  category: 'client' | 'campaign' | 'project' | 'user'
  metric: string
  value: number
  icon?: string
}
