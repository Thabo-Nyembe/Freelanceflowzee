'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useBusinessIntelligence } from './use-business-intelligence'
import { useProfitability } from './use-profitability'
import { useClientValue } from './use-client-value'
import { useRevenueForecast } from './use-revenue-forecast'
import { useKPIGoals } from './use-kpi-goals'

// ============================================================================
// Unified Business Dashboard Hook
// Combines all business intelligence hooks into a single, easy-to-use interface
// Supports: Freelancers, Entrepreneurs, Agencies, Enterprises
// ============================================================================

export type UserType = 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise'

export interface UseBusinessDashboardOptions {
  userId?: string
  userType?: UserType
  
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

export interface BusinessDashboardData {
  // Core Metrics
  metrics: {
    revenue: {
      total: number
      recurring: number
      projectBased: number
      growth: number
    }
    profitability: {
      grossProfit: number
      grossMargin: number
      netProfit: number
      netMargin: number
    }
    clients: {
      total: number
      active: number
      newThisMonth: number
      atRisk: number
      retentionRate: number
      averageValue: number
    }
    projects: {
      total: number
      active: number
      completed: number
      onTime: number
      onBudget: number
    }
    efficiency: {
      utilizationRate: number
      billableHours: number
      effectiveRate: number
    }
    cashFlow: {
      cashOnHand: number
      burnRate: number
      runway: number
    }
    ltv: {
      averageLTV: number
      cac: number
      ltvToCacRatio: number
    }
  }

  // Health & Scores
  health: {
    overallScore: number
    status: 'excellent' | 'good' | 'fair' | 'poor'
    components: Array<{
      name: string
      score: number
      description: string
    }>
    alerts: Array<{
      severity: 'critical' | 'warning' | 'info'
      title: string
      message: string
    }>
    recommendations: Array<{
      id: string
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
    }>
  }

  // Goals & KPIs
  goals: {
    total: number
    active: number
    achieved: number
    atRisk: number
    overallProgress: number
    items: Array<{
      id: string
      name: string
      category: string
      targetValue: number
      currentValue: number
      unit: string
      status: string
      priority: string
      progress: number
    }>
    templates: Array<{
      id: string
      name: string
      category: string
      defaultTarget: number
      unit: string
    }>
  }

  // Forecasts & Scenarios
  forecasts: {
    optimistic: { revenue: number; growth: number; confidence: number }
    realistic: { revenue: number; growth: number; confidence: number }
    pessimistic: { revenue: number; growth: number; confidence: number }
    pipeline: {
      total: number
      weighted: number
      deals: number
    }
    monthly: Array<{
      month: string
      projected: number
      optimistic: number
      pessimistic: number
    }>
  }

  // Insights
  insights: Array<{
    id: string
    type: 'trend' | 'anomaly' | 'prediction' | 'celebration'
    title: string
    description: string
    impact: 'positive' | 'negative' | 'neutral'
    suggestedAction?: string
  }>

  // Top Performers
  topClients: Array<{
    id: string
    name: string
    revenue: number
    profit: number
    margin: number
    projectCount: number
  }>

  topProjects: Array<{
    id: string
    name: string
    client: string
    revenue: number
    profit: number
    margin: number
  }>
}

export function useBusinessDashboard(options: UseBusinessDashboardOptions = {}) {
  const {
    userId,
    userType = 'freelancer',
    autoRefresh = true,
    refreshInterval = 300000 // 5 minutes
  } = options

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Initialize all hooks
  const biHook = useBusinessIntelligence({ autoRefresh: false })
  const profitHook = useProfitability({ autoRefresh: false })
  const clientHook = useClientValue({ autoRefresh: false })
  const forecastHook = useRevenueForecast({ autoRefresh: false })
  const kpiHook = useKPIGoals({ autoRefresh: false })

  // Combined loading state
  useEffect(() => {
    setLoading(
      biHook.loading ||
      profitHook.loading ||
      clientHook.loading ||
      forecastHook.loading ||
      kpiHook.loading
    )

    if (!biHook.loading && !profitHook.loading && !clientHook.loading &&
        !forecastHook.loading && !kpiHook.loading) {
      setLastUpdated(new Date())
    }
  }, [biHook.loading, profitHook.loading, clientHook.loading, forecastHook.loading, kpiHook.loading])

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([
        biHook.refresh(),
        profitHook.refresh(),
        clientHook.refresh(),
        forecastHook.refresh(),
        kpiHook.refresh()
      ])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }, [biHook, profitHook, clientHook, forecastHook, kpiHook])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refresh])

  // Build unified data object
  const data = useMemo((): BusinessDashboardData => {
    const metrics = biHook.metrics
    const healthScore = biHook.healthScore
    const profitSummary = profitHook.summary
    const clientMetrics = clientHook.clientMetrics
    const ltvAnalysis = clientHook.ltvAnalysis
    const churnAnalysis = clientHook.churnAnalysis
    const scenarios = forecastHook.scenarios
    const forecasts = forecastHook.forecasts
    const pipeline = forecastHook.pipeline
    const goals = kpiHook.goals
    const dashboard = kpiHook.dashboard
    const insights = kpiHook.insights
    const templates = kpiHook.getTemplatesForUserType(userType)

    return {
      metrics: {
        revenue: {
          total: metrics?.totalRevenue || 0,
          recurring: metrics?.recurringRevenue || 0,
          projectBased: metrics?.projectRevenue || 0,
          growth: metrics?.revenueGrowth || 0
        },
        profitability: {
          grossProfit: metrics?.grossProfit || 0,
          grossMargin: metrics?.grossMargin || 0,
          netProfit: metrics?.netProfit || 0,
          netMargin: metrics?.netMargin || 0
        },
        clients: {
          total: clientMetrics?.totalClients || 0,
          active: clientMetrics?.activeClients || 0,
          newThisMonth: clientMetrics?.newClientsThisMonth || 0,
          atRisk: churnAnalysis?.atRiskCount || 0,
          retentionRate: clientMetrics?.retentionRate || 0,
          averageValue: clientMetrics?.averageProjectValue || 0
        },
        projects: {
          total: metrics?.totalProjects || 0,
          active: metrics?.activeProjects || 0,
          completed: metrics?.completedProjects || 0,
          onTime: metrics?.projectsOnTime || 0,
          onBudget: metrics?.projectsOnBudget || 0
        },
        efficiency: {
          utilizationRate: metrics?.utilizationRate || 0,
          billableHours: metrics?.billableHours || 0,
          effectiveRate: metrics?.effectiveHourlyRate || 0
        },
        cashFlow: {
          cashOnHand: metrics?.cashOnHand || 0,
          burnRate: metrics?.burnRate || 0,
          runway: metrics?.cashRunway || 0
        },
        ltv: {
          averageLTV: ltvAnalysis?.averageLTV || 0,
          cac: metrics?.clientAcquisitionCost || 0,
          ltvToCacRatio: ltvAnalysis?.ltvToCacRatio || 0
        }
      },

      health: {
        overallScore: healthScore?.overallScore || 0,
        status: (healthScore?.overallScore || 0) >= 80 ? 'excellent' :
                (healthScore?.overallScore || 0) >= 60 ? 'good' :
                (healthScore?.overallScore || 0) >= 40 ? 'fair' : 'poor',
        components: healthScore?.components || [],
        alerts: healthScore?.alerts || [],
        recommendations: healthScore?.recommendations || []
      },

      goals: {
        total: dashboard?.totalGoals || 0,
        active: dashboard?.activeGoals || 0,
        achieved: dashboard?.achievedGoals || 0,
        atRisk: dashboard?.atRiskGoals || 0,
        overallProgress: dashboard?.overallProgress || 0,
        items: goals?.map(g => ({
          id: g.id,
          name: g.name,
          category: g.category,
          targetValue: g.targetValue,
          currentValue: g.currentValue,
          unit: g.unit,
          status: g.status,
          priority: g.priority,
          progress: (g.currentValue / g.targetValue) * 100
        })) || [],
        templates: templates?.map(t => ({
          id: t.id,
          name: t.name,
          category: t.category,
          defaultTarget: t.defaultTarget,
          unit: t.unit
        })) || []
      },

      forecasts: {
        optimistic: scenarios?.find(s => s.type === 'optimistic') ? {
          revenue: scenarios.find(s => s.type === 'optimistic')!.projectedRevenue,
          growth: scenarios.find(s => s.type === 'optimistic')!.growthRate,
          confidence: scenarios.find(s => s.type === 'optimistic')!.confidence
        } : { revenue: 0, growth: 0, confidence: 0 },
        realistic: scenarios?.find(s => s.type === 'realistic') ? {
          revenue: scenarios.find(s => s.type === 'realistic')!.projectedRevenue,
          growth: scenarios.find(s => s.type === 'realistic')!.growthRate,
          confidence: scenarios.find(s => s.type === 'realistic')!.confidence
        } : { revenue: 0, growth: 0, confidence: 0 },
        pessimistic: scenarios?.find(s => s.type === 'pessimistic') ? {
          revenue: scenarios.find(s => s.type === 'pessimistic')!.projectedRevenue,
          growth: scenarios.find(s => s.type === 'pessimistic')!.growthRate,
          confidence: scenarios.find(s => s.type === 'pessimistic')!.confidence
        } : { revenue: 0, growth: 0, confidence: 0 },
        pipeline: {
          total: pipeline?.totalValue || 0,
          weighted: pipeline?.weightedValue || 0,
          deals: pipeline?.items?.length || 0
        },
        monthly: forecasts?.map(f => ({
          month: f.month,
          projected: f.projectedAmount,
          optimistic: f.optimisticAmount,
          pessimistic: f.pessimisticAmount
        })) || []
      },

      insights: insights?.map(i => ({
        id: i.id,
        type: i.type,
        title: i.title,
        description: i.description,
        impact: i.impact,
        suggestedAction: i.suggestedAction
      })) || [],

      topClients: profitHook.clientProfitability?.slice(0, 5).map(c => ({
        id: c.clientId,
        name: c.clientName,
        revenue: c.totalRevenue,
        profit: c.totalProfit,
        margin: c.profitMargin,
        projectCount: c.projectCount
      })) || [],

      topProjects: profitHook.projectProfitability?.slice(0, 5).map(p => ({
        id: p.projectId,
        name: p.projectName,
        client: p.clientName,
        revenue: p.revenue,
        profit: p.profit,
        margin: p.profitMargin
      })) || []
    }
  }, [
    biHook.metrics, biHook.healthScore,
    profitHook.summary, profitHook.clientProfitability, profitHook.projectProfitability,
    clientHook.clientMetrics, clientHook.ltvAnalysis, clientHook.churnAnalysis,
    forecastHook.scenarios, forecastHook.forecasts, forecastHook.pipeline,
    kpiHook.goals, kpiHook.dashboard, kpiHook.insights, kpiHook.getTemplatesForUserType,
    userType
  ])

  // Helper functions
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }, [])

  const formatPercent = useCallback((value: number, showSign = true) => {
    const sign = showSign && value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }, [])

  const getHealthColor = useCallback((status: string) => {
    switch (status) {
      case 'excellent': return 'green'
      case 'good': return 'blue'
      case 'fair': return 'yellow'
      case 'poor': return 'red'
      default: return 'gray'
    }
  }, [])

  // KPI Operations (pass through from kpiHook)
  const createGoal = kpiHook.createGoal
  const updateGoal = kpiHook.updateGoal
  const deleteGoal = kpiHook.deleteGoal
  const recordProgress = kpiHook.recordProgress
  const createGoalFromTemplate = kpiHook.createGoalFromTemplate

  return {
    // Data
    data,
    loading,
    error,
    lastUpdated,

    // Actions
    refresh,
    createGoal,
    updateGoal,
    deleteGoal,
    recordProgress,
    createGoalFromTemplate,

    // Helpers
    formatCurrency,
    formatPercent,
    getHealthColor,

    // Raw hooks (for advanced usage)
    raw: {
      businessIntelligence: biHook,
      profitability: profitHook,
      clientValue: clientHook,
      forecast: forecastHook,
      kpi: kpiHook
    }
  }
}

export default useBusinessDashboard
