/**
 * Server Actions for Contracts Management
 *
 * Provides type-safe CRUD operations for contracts with:
 * - Zod validation
 * - Permission checks
 * - Structured error responses
 * - Comprehensive logging
 */

'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { hasPermission, canAccessResource } from '@/lib/auth/permissions'
import {
  createContractSchema,
  updateContractSchema,
  uuidSchema,
  CreateContract,
  UpdateContract
} from '@/lib/validations'
import {
  actionSuccess,
  actionError,
  actionValidationError,
  ActionResult
} from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('contracts-actions')

// Signature schema
const signatureSchema = z.object({
  signedBy: z.string().max(255),
  signedDate: z.string().datetime().optional(),
  signatureData: z.string().optional()
})

type SignatureData = z.infer<typeof signatureSchema>

/**
 * Create a new contract
 */
export async function createContract(
  data: CreateContract
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = createContractSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    const contractData = validation.data

    // Insert contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .insert({
        ...contractData,
        user_id: user.id,
        status: contractData.status || 'draft'
      })
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to create contract', { error: error.message, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract created', { contractId: contract.id, userId: user.id })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ id: contract.id }, 'Contract created successfully')
  } catch (error) {
    logger.error('Unexpected error creating contract', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Update an existing contract
 */
export async function updateContract(
  id: string,
  data: UpdateContract
): Promise<ActionResult<{ id: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid contract ID', 'VALIDATION_ERROR')
    }

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    // Validate input
    const validation = updateContractSchema.safeParse(data)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
    }

    // Permission check
    const canWrite = await hasPermission('write')
    if (!canWrite) {
      return actionError('Permission denied: write access required', 'FORBIDDEN')
    }

    // Resource access check
    const canAccess = await canAccessResource('contracts', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot modify this contract', 'FORBIDDEN')
    }

    // Update contract
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('id')
      .single()

    if (error) {
      logger.error('Failed to update contract', { error: error.message, contractId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract updated', { contractId: id, userId: user.id })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ id: contract.id }, 'Contract updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating contract', { error, contractId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Delete a contract (soft delete)
 */
export async function deleteContract(
  id: string
): Promise<ActionResult<{ deleted: boolean }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid contract ID', 'VALIDATION_ERROR')
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
    const canAccess = await canAccessResource('contracts', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot delete this contract', 'FORBIDDEN')
    }

    // Soft delete
    const { error } = await supabase
      .from('contracts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete contract', { error: error.message, contractId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract deleted', { contractId: id, userId: user.id })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ deleted: true }, 'Contract deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting contract', { error, contractId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Sign a contract
 */
export async function signContract(
  id: string,
  signatureData: SignatureData
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid contract ID', 'VALIDATION_ERROR')
    }

    // Validate signature data
    const validation = signatureSchema.safeParse(signatureData)
    if (!validation.success) {
      return actionValidationError(validation.error.errors)
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
    const canAccess = await canAccessResource('contracts', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot sign this contract', 'FORBIDDEN')
    }

    const signature = validation.data

    // Update contract with signature
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        status: 'active',
        signed_at: signature.signedDate || new Date().toISOString(),
        signed_by: signature.signedBy,
        signature_data: signature.signatureData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to sign contract', { error: error.message, contractId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract signed', {
      contractId: id,
      userId: user.id,
      signedBy: signature.signedBy
    })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ status: contract.status }, 'Contract signed successfully')
  } catch (error) {
    logger.error('Unexpected error signing contract', { error, contractId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Terminate a contract
 */
export async function terminateContract(
  id: string,
  reason?: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid contract ID', 'VALIDATION_ERROR')
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
    const canAccess = await canAccessResource('contracts', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot terminate this contract', 'FORBIDDEN')
    }

    // Update contract status
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        status: 'terminated',
        terminated_at: new Date().toISOString(),
        termination_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to terminate contract', { error: error.message, contractId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract terminated', {
      contractId: id,
      userId: user.id,
      reason
    })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ status: contract.status }, 'Contract terminated successfully')
  } catch (error) {
    logger.error('Unexpected error terminating contract', { error, contractId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

/**
 * Mark contract as completed
 */
export async function completeContract(
  id: string
): Promise<ActionResult<{ status: string }>> {
  const supabase = createServerActionClient({ cookies })

  try {
    // Validate ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid contract ID', 'VALIDATION_ERROR')
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
    const canAccess = await canAccessResource('contracts', id)
    if (!canAccess) {
      return actionError('Access denied: you cannot complete this contract', 'FORBIDDEN')
    }

    // Update contract status
    const { data: contract, error } = await supabase
      .from('contracts')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('status')
      .single()

    if (error) {
      logger.error('Failed to complete contract', { error: error.message, contractId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contract completed', { contractId: id, userId: user.id })
    revalidatePath('/dashboard/contracts-v2')

    return actionSuccess({ status: contract.status }, 'Contract completed successfully')
  } catch (error) {
    logger.error('Unexpected error completing contract', { error, contractId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
