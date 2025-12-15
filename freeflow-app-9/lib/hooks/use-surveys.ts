'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createSurvey, updateSurvey, publishSurvey, closeSurvey, pauseSurvey, deleteSurvey } from '@/app/actions/surveys'

export interface Survey {
  id: string
  user_id: string
  survey_code: string
  title: string
  description: string | null
  survey_type: string
  status: string
  created_by: string | null
  created_by_id: string | null
  total_questions: number
  target_responses: number
  total_responses: number
  sent_to: number
  completion_rate: number
  average_time: number
  nps_score: number | null
  csat_score: number | null
  published_date: string | null
  closed_date: string | null
  tags: string[]
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface SurveyFilters {
  status?: string
  surveyType?: string
}

export function useSurveys(initialSurveys: Survey[] = [], filters: SurveyFilters = {}) {
  const { data: surveys, isLoading, error, refetch } = useSupabaseQuery<Survey>(
    'surveys',
    {
      filters: {
        ...(filters.status && filters.status !== 'all' ? { status: filters.status } : {}),
        ...(filters.surveyType && filters.surveyType !== 'all' ? { survey_type: filters.surveyType } : {})
      },
      orderBy: { column: 'created_at', ascending: false }
    },
    initialSurveys
  )

  const stats = {
    total: surveys.length,
    draft: surveys.filter(s => s.status === 'draft').length,
    active: surveys.filter(s => s.status === 'active').length,
    paused: surveys.filter(s => s.status === 'paused').length,
    closed: surveys.filter(s => s.status === 'closed').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.total_responses, 0),
    avgCompletionRate: surveys.length > 0
      ? surveys.reduce((sum, s) => sum + Number(s.completion_rate), 0) / surveys.length
      : 0,
    avgNPS: surveys.filter(s => s.nps_score !== null).length > 0
      ? surveys.filter(s => s.nps_score !== null).reduce((sum, s) => sum + (s.nps_score || 0), 0) / surveys.filter(s => s.nps_score !== null).length
      : 0,
    avgCSAT: surveys.filter(s => s.csat_score !== null).length > 0
      ? surveys.filter(s => s.csat_score !== null).reduce((sum, s) => sum + Number(s.csat_score || 0), 0) / surveys.filter(s => s.csat_score !== null).length
      : 0
  }

  return { surveys, stats, isLoading, error, refetch }
}

export function useSurveyMutations() {
  const createMutation = useSupabaseMutation(createSurvey)
  const updateMutation = useSupabaseMutation(updateSurvey)
  const publishMutation = useSupabaseMutation(publishSurvey)
  const closeMutation = useSupabaseMutation(closeSurvey)
  const pauseMutation = useSupabaseMutation(pauseSurvey)
  const deleteMutation = useSupabaseMutation(deleteSurvey)

  return {
    createSurvey: createMutation.mutate,
    updateSurvey: (id: string, data: Parameters<typeof updateSurvey>[1]) =>
      updateMutation.mutate({ id, ...data } as any),
    publishSurvey: publishMutation.mutate,
    closeSurvey: closeMutation.mutate,
    pauseSurvey: pauseMutation.mutate,
    deleteSurvey: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading
  }
}

export function getSurveyStatusColor(status: string): string {
  switch (status) {
    case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    case 'active': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'closed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'archived': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function getSurveyTypeColor(type: string): string {
  switch (type) {
    case 'nps': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'csat': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    case 'customer-feedback': return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'employee-engagement': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
    case 'market-research': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
    case 'product-feedback': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
  }
}

export function formatSurveyDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function calculateResponseRate(responses: number, sentTo: number): number {
  if (sentTo === 0) return 0
  return Math.round((responses / sentTo) * 100)
}

export function calculateSurveyProgress(current: number, target: number): number {
  if (target === 0) return 0
  return Math.round((current / target) * 100)
}
