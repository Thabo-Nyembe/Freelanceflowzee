'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import type { Certification } from '@/lib/hooks/use-certifications'

const logger = createFeatureLogger('certifications-actions')

export async function createCertification(data: Partial<Certification>): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: certification, error } = await supabase
      .from('certifications')
      .insert({
        ...data,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create certification', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification created successfully', { certificationId: certification.id, userId: user.id })
    return actionSuccess(certification, 'Certification created successfully')
  } catch (error) {
    logger.error('Unexpected error creating certification', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCertification(id: string, data: Partial<Certification>): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: certification, error } = await supabase
      .from('certifications')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update certification', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification updated successfully', { certificationId: id, userId: user.id })
    return actionSuccess(certification, 'Certification updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating certification', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteCertification(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('certifications')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete certification', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification deleted successfully', { certificationId: id, userId: user.id })
    return actionSuccess(undefined, 'Certification deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting certification', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function verifyCertification(id: string, verificationCode: string): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: certification, error } = await supabase
      .from('certifications')
      .update({
        verification_status: 'verified',
        verification_code: verificationCode,
        verified_at: new Date().toISOString(),
        verified_by: user.id
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to verify certification', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification verified successfully', { certificationId: id, userId: user.id })
    return actionSuccess(certification, 'Certification verified successfully')
  } catch (error) {
    logger.error('Unexpected error verifying certification', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function renewCertification(id: string, newExpiryDate: string): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: certification, error } = await supabase
      .from('certifications')
      .update({
        status: 'active',
        is_expired: false,
        requires_renewal: false,
        expiry_date: newExpiryDate,
        last_renewed_at: new Date().toISOString(),
        renewal_date: newExpiryDate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to renew certification', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification renewed successfully', { certificationId: id, userId: user.id })
    return actionSuccess(certification, 'Certification renewed successfully')
  } catch (error) {
    logger.error('Unexpected error renewing certification', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function markExpired(id: string): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: certification, error } = await supabase
      .from('certifications')
      .update({
        status: 'expired',
        is_expired: true,
        is_valid: false
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to mark certification as expired', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('Certification marked as expired', { certificationId: id, userId: user.id })
    return actionSuccess(certification, 'Certification marked as expired')
  } catch (error) {
    logger.error('Unexpected error marking certification as expired', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateCEHours(id: string, hours: number): Promise<ActionResult<Certification>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: cert, error: fetchError } = await supabase
      .from('certifications')
      .select('continuing_education_hours, required_ce_hours')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch certification for CE hours update', { error: fetchError, certificationId: id, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!cert) {
      logger.warn('Certification not found for CE hours update', { certificationId: id, userId: user.id })
      return actionError('Certification not found', 'NOT_FOUND')
    }

    const newCEHours = (cert.continuing_education_hours || 0) + hours
    const requiresRenewal = cert.required_ce_hours ? newCEHours >= cert.required_ce_hours : false

    const { data: certification, error } = await supabase
      .from('certifications')
      .update({
        continuing_education_hours: newCEHours,
        requires_renewal: requiresRenewal
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update CE hours', { error, certificationId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/certifications-v2')
    logger.info('CE hours updated successfully', { certificationId: id, newCEHours, userId: user.id })
    return actionSuccess(certification, 'Continuing education hours updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating CE hours', { error, certificationId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
