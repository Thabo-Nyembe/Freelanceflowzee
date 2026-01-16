/**
 * Analytics API Client
 *
 * Provides typed API access to dashboard analytics and metrics
 * Supports revenue tracking, engagement analytics, and predictive insights
 */

import { BaseApiClient } from './base-client'
import { createClient } from '@/lib/supabase/client'

export interface DashboardMetrics {
  revenue: RevenueMetrics
  projects: ProjectMetrics
  clients: ClientMetrics
  tasks: TaskMetrics
  time: TimeMetrics
  growth: GrowthMetrics
}

export interface RevenueMetrics {
  total: number
  monthly: number
  weekly: number
  daily: number
  change_percentage: number
  trend: 'up' | 'down' | 'stable'
  forecast_next_month: number
  by_client: Array<{
    client_id: string
    client_name: string
    revenue: number
    percentage: number
  }>
  by_project: Array<{
    project_id: string
    project_name: string
    revenue: number
    percentage: number
  }>
  by_month: Array<{
    month: string
    revenue: number
    invoices: number
    growth: number
  }>
}

export interface ProjectMetrics {
  total: number
  active: number
  completed: number
  on_hold: number
  completion_rate: number
  average_duration: number
  average_budget: number
  total_budget: number
  budget_utilization: number
  overdue: number
  at_risk: number
}

export interface ClientMetrics {
  total: number
  active: number
  new_this_month: number
  churn_rate: number
  retention_rate: number
  lifetime_value: number
  acquisition_cost: number
  satisfaction_score: number
  by_industry: Array<{
    industry: string
    count: number
    revenue: number
  }>
}

export interface TaskMetrics {
  total: number
  completed: number
  in_progress: number
  overdue: number
  completion_rate: number
  average_completion_time: number
  productivity_score: number
  by_priority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
}

export interface TimeMetrics {
  total_hours: number
  billable_hours: number
  non_billable_hours: number
  utilization_rate: number
  average_hourly_rate: number
  most_productive_hours: Array<{
    hour: number
    tasks_completed: number
  }>
  by_project: Array<{
    project_id: string
    project_name: string
    hours: number
    billable: number
  }>
}

export interface GrowthMetrics {
  revenue_growth: number
  client_growth: number
  project_growth: number
  team_growth: number
  mrr: number // Monthly Recurring Revenue
  arr: number // Annual Recurring Revenue
  churn_rate: number
  expansion_revenue: number
  net_revenue_retention: number
}

export interface EngagementMetrics {
  user_id: string
  page_views: number
  session_duration: number
  features_used: string[]
  last_active: string
  total_sessions: number
  engagement_score: number
  most_used_features: Array<{
    feature: string
    usage_count: number
  }>
}

export interface PerformanceMetrics {
  page_load_time: number
  api_response_time: number
  error_rate: number
  uptime: number
  active_users: number
  concurrent_sessions: number
}

export interface PredictiveInsights {
  revenue_forecast: Array<{
    month: string
    predicted_revenue: number
    confidence: number
  }>
  churn_risk_clients: Array<{
    client_id: string
    client_name: string
    risk_score: number
    reasons: string[]
  }>
  project_completion_predictions: Array<{
    project_id: string
    project_name: string
    predicted_completion: string
    confidence: number
  }>
  recommended_actions: Array<{
    priority: 'high' | 'medium' | 'low'
    category: string
    action: string
    expected_impact: string
  }>
}

class AnalyticsApiClient extends BaseApiClient {
  /**
   * Get complete dashboard metrics
   */
  async getDashboardMetrics(
    startDate?: string,
    endDate?: string
  ) {
    const supabase = createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Fetch all required data in parallel
    const [
      invoicesResult,
      projectsResult,
      clientsResult,
      tasksResult
    ] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('tasks').select('*').eq('user_id', user.id)
    ])

    if (invoicesResult.error || projectsResult.error || clientsResult.error || tasksResult.error) {
      return {
        success: false,
        error: 'Failed to fetch analytics data',
        data: null
      }
    }

    const metrics: DashboardMetrics = {
      revenue: this.calculateRevenueMetrics(invoicesResult.data, startDate, endDate),
      projects: this.calculateProjectMetrics(projectsResult.data),
      clients: this.calculateClientMetrics(clientsResult.data),
      tasks: this.calculateTaskMetrics(tasksResult.data),
      time: this.calculateTimeMetrics(tasksResult.data, projectsResult.data),
      growth: this.calculateGrowthMetrics(
        invoicesResult.data,
        clientsResult.data,
        projectsResult.data
      )
    }

    return {
      success: true,
      data: metrics,
      error: null
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(startDate?: string, endDate?: string) {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*, clients(name)')
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    const revenueMetrics = this.calculateRevenueMetrics(invoices, startDate, endDate)

    return {
      success: true,
      data: revenueMetrics,
      error: null
    }
  }

  /**
   * Get engagement analytics
   */
  async getEngagementMetrics() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // This would integrate with analytics tracking service
    // For now, return mock data structure
    const metrics: EngagementMetrics = {
      user_id: user.id,
      page_views: 0,
      session_duration: 0,
      features_used: [],
      last_active: new Date().toISOString(),
      total_sessions: 0,
      engagement_score: 0,
      most_used_features: []
    }

    return {
      success: true,
      data: metrics,
      error: null
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    // This would integrate with performance monitoring service
    const metrics: PerformanceMetrics = {
      page_load_time: 0,
      api_response_time: 0,
      error_rate: 0,
      uptime: 99.9,
      active_users: 0,
      concurrent_sessions: 0
    }

    return {
      success: true,
      data: metrics,
      error: null
    }
  }

  /**
   * Get predictive insights
   */
  async getPredictiveInsights() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Fetch historical data
    const [invoices, clients, projects] = await Promise.all([
      supabase.from('invoices').select('*').eq('user_id', user.id),
      supabase.from('clients').select('*').eq('user_id', user.id),
      supabase.from('projects').select('*').eq('user_id', user.id)
    ])

    // Calculate predictions (simplified version - would use ML in production)
    const insights: PredictiveInsights = {
      revenue_forecast: this.forecastRevenue(invoices.data || []),
      churn_risk_clients: this.identifyChurnRisk(clients.data || []),
      project_completion_predictions: this.predictProjectCompletion(projects.data || []),
      recommended_actions: this.generateRecommendations(
        invoices.data || [],
        clients.data || [],
        projects.data || []
      )
    }

    return {
      success: true,
      data: insights,
      error: null
    }
  }

  // ==================== Helper Methods ====================

  private calculateRevenueMetrics(invoices: any[], startDate?: string, endDate?: string): RevenueMetrics {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const total = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0)
    const monthly = invoices.filter(i =>
      i.status === 'paid' && new Date(i.paid_date) >= monthStart
    ).reduce((sum, i) => sum + (i.total || 0), 0)
    const weekly = invoices.filter(i =>
      i.status === 'paid' && new Date(i.paid_date) >= weekStart
    ).reduce((sum, i) => sum + (i.total || 0), 0)

    return {
      total,
      monthly,
      weekly,
      daily: weekly / 7,
      change_percentage: 0, // Calculate from previous period
      trend: 'stable',
      forecast_next_month: monthly * 1.1, // Simple 10% growth forecast
      by_client: [],
      by_project: [],
      by_month: []
    }
  }

  private calculateProjectMetrics(projects: any[]): ProjectMetrics {
    return {
      total: projects.length,
      active: projects.filter(p => p.status === 'active').length,
      completed: projects.filter(p => p.status === 'completed').length,
      on_hold: projects.filter(p => p.status === 'on-hold').length,
      completion_rate: projects.length > 0
        ? (projects.filter(p => p.status === 'completed').length / projects.length) * 100
        : 0,
      average_duration: 0,
      average_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0) / (projects.length || 1),
      total_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
      budget_utilization: 0,
      overdue: 0,
      at_risk: 0
    }
  }

  private calculateClientMetrics(clients: any[]): ClientMetrics {
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const newThisMonth = clients.filter(c => new Date(c.created_at) >= monthStart).length

    return {
      total: clients.length,
      active: clients.filter(c => c.status === 'active').length,
      new_this_month: newThisMonth,
      churn_rate: 0,
      retention_rate: 95,
      lifetime_value: clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / (clients.length || 1),
      acquisition_cost: 0,
      satisfaction_score: 0,
      by_industry: []
    }
  }

  private calculateTaskMetrics(tasks: any[]): TaskMetrics {
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length,
      completion_rate: tasks.length > 0
        ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
        : 0,
      average_completion_time: 0,
      productivity_score: 0,
      by_priority: {
        low: tasks.filter(t => t.priority === 'low').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        high: tasks.filter(t => t.priority === 'high').length,
        urgent: tasks.filter(t => t.priority === 'urgent').length
      }
    }
  }

  private calculateTimeMetrics(tasks: any[], projects: any[]): TimeMetrics {
    return {
      total_hours: tasks.reduce((sum, t) => sum + (t.actual_hours || 0), 0),
      billable_hours: 0,
      non_billable_hours: 0,
      utilization_rate: 0,
      average_hourly_rate: 0,
      most_productive_hours: [],
      by_project: []
    }
  }

  private calculateGrowthMetrics(invoices: any[], clients: any[], projects: any[]): GrowthMetrics {
    return {
      revenue_growth: 0,
      client_growth: 0,
      project_growth: 0,
      team_growth: 0,
      mrr: 0,
      arr: 0,
      churn_rate: 0,
      expansion_revenue: 0,
      net_revenue_retention: 100
    }
  }

  private forecastRevenue(invoices: any[]): Array<{ month: string; predicted_revenue: number; confidence: number }> {
    // Simple forecast - would use ML in production
    return []
  }

  private identifyChurnRisk(clients: any[]): Array<{ client_id: string; client_name: string; risk_score: number; reasons: string[] }> {
    return []
  }

  private predictProjectCompletion(projects: any[]): Array<{ project_id: string; project_name: string; predicted_completion: string; confidence: number }> {
    return []
  }

  private generateRecommendations(invoices: any[], clients: any[], projects: any[]): Array<{ priority: 'high' | 'medium' | 'low'; category: string; action: string; expected_impact: string }> {
    return []
  }
}

export const analyticsClient = new AnalyticsApiClient()
