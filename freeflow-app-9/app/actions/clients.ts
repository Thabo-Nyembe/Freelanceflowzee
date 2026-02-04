/**
 * Server Actions for Clients Management
 *
 * Provides type-safe CRUD operations for clients with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Comprehensive logging
 */

'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  createClientSchema,
  updateClientSchema,
  uuidSchema,
  CreateClient,
  UpdateClient
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('clients-actions')

/**
 * Create a new client
 */
export async function createClient(
  input: CreateClient
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createClientSchema.safeParse(input)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    const clientData = validation.data

    // Insert client
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        ...clientData,
        user_id: user.id,
        status: clientData.status || 'active',
        type: clientData.type || 'individual'
      }])
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create client', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Client created', { clientId: data.id, userId: user.id })
    revalidatePath('/dashboard/clients-v2')

    return actionSuccess({ id: data.id }, 'Client created successfully')
  } catch (error) {
    logger.error('Unexpected error creating client', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing client
 */
export async function updateClient(
  id: string,
  updates: UpdateClient
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid client ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateClientSchema.safeParse(updates)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('clients', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this client', 'FORBIDDEN')
    }

    // Update client
    const { data, error } = await supabase
      .from('clients')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update client', { error: error.message, clientId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Client updated', { clientId: id, userId: user.id })
    revalidatePath('/dashboard/clients-v2')

    return actionSuccess({ id: data.id }, 'Client updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating client', { error, clientId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Archive a client (soft delete by setting status)
 */
export async function archiveClient(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid client ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('clients', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot archive this client', 'FORBIDDEN')
    }

    // Update status to archived
    const { data, error } = await supabase
      .from('clients')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to archive client', { error: error.message, clientId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Client archived', { clientId: id, userId: user.id })
    revalidatePath('/dashboard/clients-v2')

    return actionSuccess({ status: data.status }, 'Client archived successfully')
  } catch (error) {
    logger.error('Unexpected error archiving client', { error, clientId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a client (soft delete)
 */
export async function deleteClient(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid client ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Permission check
    const canDelete = await hasPermission('delete')
    if (!canDelete) {
      return actionError('Permission denied: delete access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('clients', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot delete this client', 'FORBIDDEN')
    }

    // Soft delete
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete client', { error: error.message, clientId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Client deleted', { clientId: id, userId: user.id })
    revalidatePath('/dashboard/clients-v2')

    return actionSuccess({ deleted: true }, 'Client deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting client', { error, clientId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get all clients for current user
 */
export async function getClients(): Promise<ActionResult<unknown[]>> {
  const supabase = await createClient()

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'archived')
      .order('name', { ascending: true })

    if (error) {
      logger.error('Failed to fetch clients', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [])
  } catch (error) {
    logger.error('Unexpected error fetching clients', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Get a single client by ID
 */
export async function getClientById(
  id: string
): Promise<ActionResult<unknown | null>> {
  const supabase = await createClient()

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid client ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Resource access check
    const canAccess = await canAccessResource('clients', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot view this client', 'FORBIDDEN')
    }

    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      logger.error('Failed to fetch client', { error: error.message, clientId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data)
  } catch (error) {
    logger.error('Unexpected error fetching client', { error, clientId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
