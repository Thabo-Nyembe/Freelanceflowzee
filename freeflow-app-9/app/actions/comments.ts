/**
 * Server Actions for Comments Management
 *
 * Provides type-safe CRUD operations for comments with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Full TypeScript types
 * - Logging and error tracking
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  createCommentSchema,
  uuidSchema,
  CreateComment
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('comments-actions')

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Comment {
  id: string
  user_id: string
  content: string
  entity_type: string
  entity_id: string
  parent_id?: string | null
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// ============================================
// COMMENT ACTIONS
// ============================================

/**
 * Create a new comment
 */
export async function createComment(
  data: CreateComment
): Promise<ActionResult<Comment>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createCommentSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const commentData = validation.data

    // Insert comment
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        content: commentData.content,
        entity_type: commentData.entity_type,
        entity_id: commentData.entity_id,
        parent_id: commentData.parent_id,
        metadata: commentData.metadata
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create comment', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comment created', {
      commentId: comment.id,
      entityType: comment.entity_type,
      entityId: comment.entity_id,
      userId: user.id
    })

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${commentData.entity_type}`)
    revalidatePath('/dashboard/comments-v2')

    return actionSuccess(comment, 'Comment created successfully')
  } catch (error) {
    logger.error('Unexpected error creating comment', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update a comment
 */
export async function updateComment(
  id: string,
  content: string
): Promise<ActionResult<Comment>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid comment ID', 'VALIDATION_ERROR')
    }

    // Validate content
    if (!content || content.trim().length === 0) {
      return actionError('Comment content cannot be empty', 'VALIDATION_ERROR')
    }

    if (content.length > 5000) {
      return actionError('Comment content exceeds maximum length', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update comment
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update comment', { error: error.message, commentId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!comment) {
      return actionError('Comment not found or access denied', 'NOT_FOUND')
    }

    logger.info('Comment updated', { commentId: id, userId: user.id })

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${comment.entity_type}`)
    revalidatePath('/dashboard/comments-v2')

    return actionSuccess(comment, 'Comment updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating comment', { error, commentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a comment (soft delete)
 */
export async function deleteComment(
  id: string
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid comment ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get comment details before deletion for revalidation
    const { data: commentInfo } = await supabase
      .from('comments')
      .select('entity_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!commentInfo) {
      return actionError('Comment not found or access denied', 'NOT_FOUND')
    }

    // Soft delete comment
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete comment', { error: error.message, commentId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comment deleted', { commentId: id, userId: user.id })

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${commentInfo.entity_type}`)
    revalidatePath('/dashboard/comments-v2')

    return actionSuccess({ id }, 'Comment deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting comment', { error, commentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get comments for an entity
 */
export async function getCommentsByEntity(
  entityType: string,
  entityId: string
): Promise<ActionResult<Comment[]>> {
  const supabase = await createClient()

  try {
    // Validate entity ID
    const idValidation = uuidSchema.safeParse(entityId)
    if (!idValidation.success) {
      return actionError('Invalid entity ID', 'VALIDATION_ERROR')
    }

    // Validate entity type
    if (!entityType || entityType.trim().length === 0 || entityType.length > 50) {
      return actionError('Invalid entity type', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to get comments by entity', {
        error: error.message,
        entityType,
        entityId,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comments retrieved by entity', {
      entityType,
      entityId,
      count: comments?.length || 0,
      userId: user.id
    })

    return actionSuccess(comments || [], 'Comments retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting comments by entity', { error, entityType, entityId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get replies to a comment
 */
export async function getCommentReplies(
  parentId: string
): Promise<ActionResult<Comment[]>> {
  const supabase = await createClient()

  try {
    // Validate parent ID
    const idValidation = uuidSchema.safeParse(parentId)
    if (!idValidation.success) {
      return actionError('Invalid parent comment ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get replies
    const { data: replies, error } = await supabase
      .from('comments')
      .select('*')
      .eq('parent_id', parentId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Failed to get comment replies', {
        error: error.message,
        parentId,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comment replies retrieved', {
      parentId,
      count: replies?.length || 0,
      userId: user.id
    })

    return actionSuccess(replies || [], 'Replies retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting comment replies', { error, parentId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get user's comments
 */
export async function getUserComments(): Promise<ActionResult<Comment[]>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get user's comments
    const { data: comments, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get user comments', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('User comments retrieved', { count: comments?.length || 0, userId: user.id })

    return actionSuccess(comments || [], 'Comments retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting user comments', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Bulk delete comments
 */
export async function bulkDeleteComments(
  ids: string[]
): Promise<ActionResult<{ success: boolean; count: number }>> {
  const supabase = await createClient()

  try {
    // Validate IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return actionError('Invalid comment IDs array', 'VALIDATION_ERROR')
    }

    for (const id of ids) {
      const validation = uuidSchema.safeParse(id)
      if (!validation.success) {
        return actionError('Invalid comment ID in array', 'VALIDATION_ERROR')
      }
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Bulk delete
    const { error } = await supabase
      .from('comments')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', ids)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to bulk delete comments', {
        error: error.message,
        count: ids.length,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comments bulk deleted', { count: ids.length, userId: user.id })
    revalidatePath('/dashboard/comments-v2')

    return actionSuccess({ success: true, count: ids.length }, `${ids.length} comments deleted`)
  } catch (error) {
    logger.error('Unexpected error bulk deleting comments', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Pin/unpin a comment
 */
export async function pinComment(
  id: string,
  pinned: boolean
): Promise<ActionResult<Comment>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid comment ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Update comment metadata with pinned status
    const { data: currentComment } = await supabase
      .from('comments')
      .select('metadata, entity_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!currentComment) {
      return actionError('Comment not found or access denied', 'NOT_FOUND')
    }

    const metadata = currentComment.metadata || {}
    const updatedMetadata = { ...metadata, pinned }

    // Update comment
    const { data: comment, error } = await supabase
      .from('comments')
      .update({ metadata: updatedMetadata })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to pin/unpin comment', {
        error: error.message,
        commentId: id,
        userId: user.id
      })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Comment pin status updated', { commentId: id, pinned, userId: user.id })

    // Revalidate relevant paths
    revalidatePath(`/dashboard/${currentComment.entity_type}`)
    revalidatePath('/dashboard/comments-v2')

    return actionSuccess(comment, `Comment ${pinned ? 'pinned' : 'unpinned'} successfully`)
  } catch (error) {
    logger.error('Unexpected error pinning comment', { error, commentId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
