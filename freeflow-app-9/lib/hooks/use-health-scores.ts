'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createHealthScore, updateHealthScore, recalculateHealthScore, deleteHealthScore } from '@/app/actions/health-scores'

export interface HealthScore {
  id: string
  user_id: string
  health_code: string
  customer_name: string
  customer_id: string | null
  account_type: string
  overall_score: number
  category: string
  trend: string
  previous_score: number
  score_change: number
  product_usage: number
  engagement: number
  support_health: number
  financial: number
  sentiment: number
  risk_factors: number
  opportunities: number
  monthly_trend: number[]
  last_calculated_at: string
  notes: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface HealthScoreFilters {
  category?: string
  trend?: string
}

export function useHealthScores(initialHealthScores: HealthScore[] = [], filters: HealthScoreFilters = {}) {
  const { data: healthScores, isLoading, error, refetch } = useSupabaseQuery<HealthScore>(
    'health_scores',
    {
      filters: {
        ...(filters.category && filters.category !== 'all' ? { category: filters.category } : {}),
        ...(filters.trend && filters.trend !== 'all' ? { trend: filters.trend } : {})
      },
      orderBy: { column: 'overall_score', ascending: false }
    },
    initialHealthScores
  )

  const stats = {
    total: healthScores.length,
    excellent: healthScores.filter(h => h.category === 'excellent').length,
    good: healthScores.filter(h => h.category === 'good').length,
    fair: healthScores.filter(h => h.category === 'fair').length,
    poor: healthScores.filter(h => h.category === 'poor').length,
    critical: healthScores.filter(h => h.category === 'critical').length,
    improving: healthScores.filter(h => h.trend === 'improving').length,
    declining: healthScores.filter(h => h.trend === 'declining').length,
    avgScore: healthScores.length > 0
      ? healthScores.reduce((sum, h) => sum + h.overall_score, 0) / healthScores.length
      : 0,
    avgUsage: healthScores.length > 0
      ? healthScores.reduce((sum, h) => sum + h.product_usage, 0) / healthScores.length
      : 0,
    avgEngagement: healthScores.length > 0
      ? healthScores.reduce((sum, h) => sum + h.engagement, 0) / healthScores.length
      : 0
  }

  return { healthScores, stats, isLoading, error, refetch }
}

export function useHealthScoreMutations() {
  const createMutation = useSupabaseMutation(createHealthScore)
  const updateMutation = useSupabaseMutation(updateHealthScore)
  const recalculateMutation = useSupabaseMutation(recalculateHealthScore)
  const deleteMutation = useSupabaseMutation(deleteHealthScore)

  return {
    createHealthScore: createMutation.mutate,
    updateHealthScore: (id: string, data: Parameters<typeof updateHealthScore>[1]) =>
      updateMutation.mutate({ id, ...data } as any),
    recalculateHealthScore: recalculateMutation.mutate,
    deleteHealthScore: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isRecalculating: recalculateMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  }
}

export function getCategoryColor(category: string): string {
  switch (category) {
    case 'excellent': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'good': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'fair': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'poor': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getTrendColor(trend: string): string {
  switch (trend) {
    case 'improving': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'stable': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'declining': return 'bg-red-500/10 text-red-500 border-red-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400'
  if (score >= 60) return 'text-blue-600 dark:text-blue-400'
  if (score >= 40) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}
