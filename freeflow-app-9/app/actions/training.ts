'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('training-actions')

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

export async function createTrainingProgram(input: CreateTrainingProgramInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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
      logger.error('Failed to create training program', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Training program created successfully', { programCode })
    revalidatePath('/dashboard/training-v2')
    return actionSuccess(data, 'Training program created successfully')
  } catch (error) {
    logger.error('Unexpected error creating training program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateTrainingProgram(input: UpdateTrainingProgramInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('training_programs')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update training program', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Training program updated successfully', { id })
    revalidatePath('/dashboard/training-v2')
    return actionSuccess(data, 'Training program updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating training program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteTrainingProgram(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('training_programs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete training program', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Training program deleted successfully', { id })
    revalidatePath('/dashboard/training-v2')
    return actionSuccess({ success: true }, 'Training program deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting training program', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function enrollTrainee(input: {
  program_id: string
  trainee_name: string
  trainee_email?: string
  notes?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('training_enrollments')
      .insert({
        ...input,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to enroll trainee', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    // Update enrolled count on program
    await supabase.rpc('increment_enrolled_count', { program_id: input.program_id })

    logger.info('Trainee enrolled successfully', { programId: input.program_id })
    revalidatePath('/dashboard/training-v2')
    return actionSuccess(data, 'Trainee enrolled successfully')
  } catch (error) {
    logger.error('Unexpected error enrolling trainee', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
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
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { id, ...updateData } = input

    const { data, error } = await supabase
      .from('training_enrollments')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update enrollment', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Enrollment updated successfully', { id })
    revalidatePath('/dashboard/training-v2')
    return actionSuccess(data, 'Enrollment updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating enrollment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getTrainingStats(): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: programs, error } = await supabase
      .from('training_programs')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)

    if (error) {
      logger.error('Failed to get training stats', { error: error.message })
      return actionError(error.message, 'DATABASE_ERROR')
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

    const stats = {
      total,
      inProgress,
      totalTrainees,
      avgCompletionRate: Math.round(avgCompletionRate * 10) / 10,
      avgScore: Math.round(avgScore * 10) / 10
    }

    logger.info('Training stats retrieved successfully')
    return actionSuccess(stats, 'Training stats retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting training stats', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
