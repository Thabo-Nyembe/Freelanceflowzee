/**
 * Server Actions for Canvas Management
 *
 * Provides type-safe CRUD operations for canvas with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Full TypeScript types
 * - Logging and error tracking
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import type { Canvas } from '@/lib/hooks/use-canvas'
import { uuidSchema } from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('canvas-actions')

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createCanvasSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  canvas_data: z.record(z.unknown()).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  background_color: z.string().optional(),
  objects: z.array(z.unknown()).optional(),
  layers: z.array(z.unknown()).optional()
})

const updateCanvasSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().nullable(),
  canvas_data: z.record(z.unknown()).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  background_color: z.string().optional(),
  objects: z.array(z.unknown()).optional(),
  layers: z.array(z.unknown()).optional(),
  status: z.enum(['draft', 'active', 'locked', 'archived']).optional()
}).partial()

const canvasObjectSchema = z.object({
  type: z.string(),
  data: z.record(z.unknown()),
  position: z.object({
    x: z.number(),
    y: z.number()
  }).optional(),
  properties: z.record(z.unknown()).optional()
})

const layerDataSchema = z.object({
  name: z.string().optional(),
  visible: z.boolean().optional(),
  locked: z.boolean().optional(),
  opacity: z.number().min(0).max(1).optional(),
  objects: z.array(z.unknown()).optional()
})

// ============================================
// CANVAS ACTIONS
// ============================================

/**
 * Create a new canvas
 */
export async function createCanvas(
  data: Partial<Canvas>
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createCanvasSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const canvasData = validation.data

    // Insert canvas
    const { data: canvas, error } = await supabase
      .from('canvas')
      .insert({
        user_id: user.id,
        ...canvasData,
        canvas_data: canvasData.canvas_data || {}
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create canvas', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Canvas created', { canvasId: canvas.id, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(canvas, 'Canvas created successfully')
  } catch (error) {
    logger.error('Unexpected error creating canvas', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing canvas
 */
export async function updateCanvas(
  id: string,
  data: Partial<Canvas>
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateCanvasSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    const updateData = validation.data

    // Update canvas
    const { data: canvas, error } = await supabase
      .from('canvas')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    logger.info('Canvas updated', { canvasId: id, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(canvas, 'Canvas updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a canvas (soft delete)
 */
export async function deleteCanvas(id: string): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Soft delete canvas
    const { error } = await supabase
      .from('canvas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Canvas deleted', { canvasId: id, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess({ id }, 'Canvas deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Auto-save canvas data
 */
export async function autoSaveCanvas(
  id: string,
  canvasData: Record<string, unknown>
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate canvas data
    if (typeof canvasData !== 'object' || canvasData === null) {
      return actionError('Invalid canvas data', 'VALIDATION_ERROR')
    }

    // Update canvas with auto-save
    const { data: canvas, error } = await supabase
      .from('canvas')
      .update({
        canvas_data: canvasData,
        last_auto_saved_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to auto-save canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    logger.info('Canvas auto-saved', { canvasId: id, userId: user.id })

    return actionSuccess(canvas, 'Canvas auto-saved')
  } catch (error) {
    logger.error('Unexpected error auto-saving canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Share canvas with a user
 */
export async function shareCanvas(
  id: string,
  userEmail: string
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Validate email
    const emailValidation = z.string().email().safeParse(userEmail)
    if (!emailValidation.success) {
      return actionError('Invalid email address', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current canvas
    const { data: canvas } = await supabase
      .from('canvas')
      .select('shared_with')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    // Add email to shared_with array
    const sharedWith = Array.isArray(canvas.shared_with) ? canvas.shared_with : []
    if (!sharedWith.includes(userEmail)) {
      sharedWith.push(userEmail)
    }

    // Update canvas
    const { data: updatedCanvas, error } = await supabase
      .from('canvas')
      .update({
        shared_with: sharedWith,
        is_shared: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to share canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Canvas shared', { canvasId: id, sharedWith: userEmail, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(updatedCanvas, 'Canvas shared successfully')
  } catch (error) {
    logger.error('Unexpected error sharing canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Publish canvas
 */
export async function publishCanvas(id: string): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Publish canvas
    const { data: canvas, error } = await supabase
      .from('canvas')
      .update({
        is_published: true,
        published_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to publish canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    logger.info('Canvas published', { canvasId: id, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(canvas, 'Canvas published successfully')
  } catch (error) {
    logger.error('Unexpected error publishing canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Add object to canvas
 */
export async function addCanvasObject(
  id: string,
  object: unknown
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Validate object
    const objectValidation = canvasObjectSchema.safeParse(object)
    if (!objectValidation.success) {
      return actionValidationError(objectValidation.error.errors)
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current canvas
    const { data: canvas } = await supabase
      .from('canvas')
      .select('objects, object_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    // Add object to array
    const objects = Array.isArray(canvas.objects) ? canvas.objects : []
    objects.push(objectValidation.data)

    // Update canvas
    const { data: updatedCanvas, error } = await supabase
      .from('canvas')
      .update({
        objects: objects,
        object_count: objects.length
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to add canvas object', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Canvas object added', { canvasId: id, objectCount: objects.length, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(updatedCanvas, 'Object added to canvas')
  } catch (error) {
    logger.error('Unexpected error adding canvas object', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update canvas layer
 */
export async function updateCanvasLayer(
  id: string,
  layerIndex: number,
  layerData: unknown
): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Validate layer index
    if (!Number.isInteger(layerIndex) || layerIndex < 0) {
      return actionError('Invalid layer index', 'VALIDATION_ERROR')
    }

    // Validate layer data
    const layerValidation = layerDataSchema.safeParse(layerData)
    if (!layerValidation.success) {
      return actionValidationError(layerValidation.error.errors)
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Get current canvas
    const { data: canvas } = await supabase
      .from('canvas')
      .select('layers')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    // Update layer
    const layers = Array.isArray(canvas.layers) ? canvas.layers : []

    if (layerIndex >= layers.length) {
      return actionError('Layer index out of bounds', 'VALIDATION_ERROR')
    }

    layers[layerIndex] = layerValidation.data

    // Update canvas
    const { data: updatedCanvas, error } = await supabase
      .from('canvas')
      .update({
        layers: layers,
        layer_count: layers.length
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update canvas layer', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Canvas layer updated', { canvasId: id, layerIndex, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(updatedCanvas, 'Canvas layer updated')
  } catch (error) {
    logger.error('Unexpected error updating canvas layer', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Lock canvas (prevent editing)
 */
export async function lockCanvas(id: string): Promise<ActionResult<Canvas>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid canvas ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Lock canvas
    const { data: canvas, error } = await supabase
      .from('canvas')
      .update({
        status: 'locked'
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to lock canvas', { error: error.message, canvasId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    if (!canvas) {
      return actionError('Canvas not found or access denied', 'NOT_FOUND')
    }

    logger.info('Canvas locked', { canvasId: id, userId: user.id })
    revalidatePath('/dashboard/canvas-v2')

    return actionSuccess(canvas, 'Canvas locked successfully')
  } catch (error) {
    logger.error('Unexpected error locking canvas', { error, canvasId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
