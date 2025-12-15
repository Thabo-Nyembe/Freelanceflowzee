'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'
import { createTrainingProgram, updateTrainingProgram, deleteTrainingProgram, enrollTrainee, updateEnrollment } from '@/app/actions/training'

export interface TrainingProgram {
  id: string
  user_id: string
  program_code: string
  program_name: string
  description: string | null
  program_type: string
  status: string
  trainer_name: string | null
  trainer_email: string | null
  max_capacity: number
  enrolled_count: number
  duration_days: number
  session_count: number
  start_date: string | null
  end_date: string | null
  completion_rate: number
  avg_score: number
  location: string | null
  format: string
  materials_url: string | null
  prerequisites: string | null
  objectives: string | null
  configuration: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface TrainingEnrollment {
  id: string
  user_id: string
  program_id: string
  trainee_name: string
  trainee_email: string | null
  enrollment_status: string
  enrolled_at: string
  started_at: string | null
  completed_at: string | null
  progress_percent: number
  score: number | null
  certificate_issued: boolean
  certificate_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface UseTrainingOptions {
  status?: string
  programType?: string
}

export function useTrainingPrograms(initialPrograms: TrainingProgram[] = [], options: UseTrainingOptions = {}) {
  const { data, isLoading, error, refetch } = useSupabaseQuery<TrainingProgram>(
    'training_programs',
    {
      column: 'deleted_at',
      value: null,
      isNull: true
    },
    {
      orderBy: { column: 'start_date', ascending: false },
      initialData: initialPrograms
    }
  )

  const programs = data || initialPrograms

  // Apply filters
  const filteredPrograms = programs.filter(program => {
    if (options.status && program.status !== options.status) return false
    if (options.programType && program.program_type !== options.programType) return false
    return true
  })

  // Calculate stats
  const stats = {
    total: programs.length,
    scheduled: programs.filter(p => p.status === 'scheduled').length,
    inProgress: programs.filter(p => p.status === 'in-progress').length,
    completed: programs.filter(p => p.status === 'completed').length,
    cancelled: programs.filter(p => p.status === 'cancelled').length,
    totalTrainees: programs.reduce((sum, p) => sum + p.enrolled_count, 0),
    avgCompletionRate: programs.length > 0
      ? programs.reduce((sum, p) => sum + Number(p.completion_rate), 0) / programs.length
      : 0,
    avgScore: programs.filter(p => p.avg_score > 0).length > 0
      ? programs.filter(p => p.avg_score > 0).reduce((sum, p) => sum + Number(p.avg_score), 0) / programs.filter(p => p.avg_score > 0).length
      : 0
  }

  return {
    programs: filteredPrograms,
    allPrograms: programs,
    stats,
    isLoading,
    error,
    refetch
  }
}

export function useTrainingMutations() {
  const createMutation = useSupabaseMutation(createTrainingProgram)
  const updateMutation = useSupabaseMutation(updateTrainingProgram)
  const deleteMutation = useSupabaseMutation(deleteTrainingProgram)
  const enrollMutation = useSupabaseMutation(enrollTrainee)
  const updateEnrollmentMutation = useSupabaseMutation(updateEnrollment)

  return {
    createProgram: createMutation.mutate,
    isCreating: createMutation.isLoading,
    updateProgram: updateMutation.mutate,
    isUpdating: updateMutation.isLoading,
    deleteProgram: deleteMutation.mutate,
    isDeleting: deleteMutation.isLoading,
    enrollTrainee: enrollMutation.mutate,
    isEnrolling: enrollMutation.isLoading,
    updateEnrollment: updateEnrollmentMutation.mutate,
    isUpdatingEnrollment: updateEnrollmentMutation.isLoading
  }
}
