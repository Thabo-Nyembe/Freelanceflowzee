'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('documentation-actions')

export interface DocumentationInput {
  title: string
  description?: string
  content?: string
  status?: 'published' | 'draft' | 'review' | 'archived'
  doc_type?: 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'
  category?: 'getting-started' | 'features' | 'integrations' | 'api' | 'sdk' | 'advanced'
  author?: string
  version?: string
  read_time?: number
  tags?: string[]
}

export async function createDocumentation(input: DocumentationInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('documentation')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create documentation', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Documentation created successfully', { id: data.id })
    revalidatePath('/dashboard/documentation-v2')
    return actionSuccess(data, 'Documentation created successfully')
  } catch (error) {
    logger.error('Unexpected error creating documentation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDocumentation(id: string, input: Partial<DocumentationInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('documentation')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update documentation', { error, id, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Documentation updated successfully', { id })
    revalidatePath('/dashboard/documentation-v2')
    return actionSuccess(data, 'Documentation updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating documentation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteDocumentation(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('documentation')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete documentation', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Documentation deleted successfully', { id })
    revalidatePath('/dashboard/documentation-v2')
    return actionSuccess({ success: true }, 'Documentation deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting documentation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishDocumentation(id: string) {
  return updateDocumentation(id, { status: 'published' })
}

export async function archiveDocumentation(id: string) {
  return updateDocumentation(id, { status: 'archived' })
}

export async function submitForReview(id: string) {
  return updateDocumentation(id, { status: 'review' })
}

export async function markHelpful(id: string, helpful: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc } = await supabase
      .from('documentation')
      .select('helpful_count, not_helpful_count')
      .eq('id', id)
      .single()

    if (!doc) {
      return actionError('Documentation not found', 'NOT_FOUND')
    }

    const updateData = helpful
      ? { helpful_count: (doc.helpful_count || 0) + 1 }
      : { not_helpful_count: (doc.not_helpful_count || 0) + 1 }

    const { data, error } = await supabase
      .from('documentation')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark documentation helpful', { error, id, helpful })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Documentation marked helpful', { id, helpful })
    revalidatePath('/dashboard/documentation-v2')
    return actionSuccess(data, 'Feedback recorded successfully')
  } catch (error) {
    logger.error('Unexpected error marking documentation helpful', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
