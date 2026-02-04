'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('help-docs-actions')

export interface HelpDocInput {
  title: string
  question?: string
  answer?: string
  status?: 'published' | 'draft' | 'review' | 'outdated'
  category?: 'faq' | 'how-to' | 'troubleshooting' | 'reference' | 'best-practices' | 'glossary'
  author?: string
  related_docs?: string[]
  tags?: string[]
}

export async function createHelpDoc(input: HelpDocInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_docs')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create help doc', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Help doc created successfully', { docId: data.id })
    revalidatePath('/dashboard/help-docs-v2')
    return actionSuccess(data, 'Help doc created successfully')
  } catch (error) {
    logger.error('Unexpected error creating help doc', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateHelpDoc(id: string, input: Partial<HelpDocInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('help_docs')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update help doc', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Help doc updated successfully', { docId: id })
    revalidatePath('/dashboard/help-docs-v2')
    return actionSuccess(data, 'Help doc updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating help doc', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteHelpDoc(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('help_docs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete help doc', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Help doc deleted successfully', { docId: id })
    revalidatePath('/dashboard/help-docs-v2')
    return actionSuccess({ success: true }, 'Help doc deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting help doc', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function publishHelpDoc(id: string) {
  return updateHelpDoc(id, { status: 'published' })
}

export async function markAsOutdated(id: string) {
  return updateHelpDoc(id, { status: 'outdated' })
}

export async function submitForReview(id: string) {
  return updateHelpDoc(id, { status: 'review' })
}

export async function markHelpful(id: string, helpful: boolean): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data: doc } = await supabase
      .from('help_docs')
      .select('helpful_count, not_helpful_count')
      .eq('id', id)
      .single()

    if (!doc) {
      return actionError('Help doc not found', 'NOT_FOUND')
    }

    const updateData = helpful
      ? { helpful_count: (doc.helpful_count || 0) + 1 }
      : { not_helpful_count: (doc.not_helpful_count || 0) + 1 }

    const { data, error } = await supabase
      .from('help_docs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark helpful', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Help doc marked as helpful', { docId: id, helpful })
    revalidatePath('/dashboard/help-docs-v2')
    return actionSuccess(data, 'Feedback recorded successfully')
  } catch (error) {
    logger.error('Unexpected error marking helpful', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function incrementViewCount(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: doc } = await supabase
      .from('help_docs')
      .select('views_count')
      .eq('id', id)
      .single()

    if (!doc) {
      return actionError('Help doc not found', 'NOT_FOUND')
    }

    const { error } = await supabase
      .from('help_docs')
      .update({ views_count: (doc.views_count || 0) + 1 })
      .eq('id', id)

    if (error) {
      logger.error('Failed to increment view count', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Help doc view count incremented', { docId: id })
    return actionSuccess({ success: true }, 'View count incremented successfully')
  } catch (error) {
    logger.error('Unexpected error incrementing view count', { error: error.message })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
