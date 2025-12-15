'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface CreateTrainingProgramInput {
  program_name: string
  description?: string
  program_type?: string
  trainer_name?: string
  trainer_email?: string
  max_capacity?: number
  duration_days?: number
  session_count?: number
  start_date?: string
  end_date?: string
  location?: string
  format?: string
  materials_url?: string
  prerequisites?: string
  objectives?: string
}

export interface UpdateTrainingProgramInput extends Partial<CreateTrainingProgramInput> {
  id: string
  status?: string
  enrolled_count?: number
  completion_rate?: number
  avg_score?: number
}

export async function createTrainingProgram(input: CreateTrainingProgramInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Generate program code
  const { data: lastProgram } = await supabase
    .from('training_programs')
    .select('program_code')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const lastNumber = lastProgram?.program_code
    ? parseInt(lastProgram.program_code.replace('TRN-', ''))
    : 0
  const programCode = `TRN-${(lastNumber + 1).toString().padStart(4, '0')}`

  const { data, error } = await supabase
    .from('training_programs')
    .insert({
      ...input,
      user_id: user.id,
      program_code: programCode
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/training-v2')
  return { data }
}

export async function updateTrainingProgram(input: UpdateTrainingProgramInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('training_programs')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/training-v2')
  return { data }
}

export async function deleteTrainingProgram(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('training_programs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/training-v2')
  return { success: true }
}

export async function enrollTrainee(input: {
  program_id: string
  trainee_name: string
  trainee_email?: string
  notes?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('training_enrollments')
    .insert({
      ...input,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  // Update enrolled count on program
  await supabase.rpc('increment_enrolled_count', { program_id: input.program_id })

  revalidatePath('/dashboard/training-v2')
  return { data }
}

export async function updateEnrollment(input: {
  id: string
  enrollment_status?: string
  progress_percent?: number
  score?: number
  certificate_issued?: boolean
  certificate_url?: string
  notes?: string
  started_at?: string
  completed_at?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { id, ...updateData } = input

  const { data, error } = await supabase
    .from('training_enrollments')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/training-v2')
  return { data }
}

export async function getTrainingStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: programs, error } = await supabase
    .from('training_programs')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)

  if (error) {
    return { error: error.message }
  }

  const total = programs.length
  const inProgress = programs.filter(p => p.status === 'in-progress').length
  const totalTrainees = programs.reduce((sum, p) => sum + p.enrolled_count, 0)
  const avgCompletionRate = programs.length > 0
    ? programs.reduce((sum, p) => sum + Number(p.completion_rate), 0) / programs.length
    : 0
  const avgScore = programs.filter(p => p.avg_score > 0).length > 0
    ? programs.filter(p => p.avg_score > 0).reduce((sum, p) => sum + Number(p.avg_score), 0) / programs.filter(p => p.avg_score > 0).length
    : 0

  return {
    data: {
      total,
      inProgress,
      totalTrainees,
      avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
      avgScore: Math.round(avgScore * 10) / 10
    }
  }
}
