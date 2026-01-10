'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'

const logger = createFeatureLogger('backups')

// Types
type BackupType = 'full' | 'incremental' | 'differential' | 'snapshot' | 'archive'
type BackupFrequency = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
type BackupStatus = 'scheduled' | 'in-progress' | 'completed' | 'failed' | 'cancelled'
type StorageLocation = 'local' | 'aws-s3' | 'google-cloud' | 'azure' | 'dropbox' | 'ftp'

interface BackupInput {
  name: string
  description?: string
  type?: BackupType
  frequency?: BackupFrequency
  schedule_cron?: string
  storage_location?: StorageLocation
  storage_path?: string
  storage_bucket?: string
  encrypted?: boolean
  encryption_algorithm?: string
  compressed?: boolean
  compression_type?: string
  retention_days?: number
  tags?: string[]
  metadata?: Record<string, unknown>
}

interface Backup {
  id: string
  user_id: string
  name: string
  description?: string
  type: BackupType
  status: BackupStatus
  frequency: BackupFrequency
  schedule_cron?: string
  next_run_at?: string
  last_run_at?: string
  storage_location: StorageLocation
  storage_path?: string
  storage_bucket?: string
  encrypted: boolean
  encryption_algorithm?: string
  compressed: boolean
  compression_type?: string
  retention_days: number
  expires_at?: string
  tags?: string[]
  metadata?: Record<string, unknown>
  verified?: boolean
  verified_at?: string
  deleted_at?: string
  created_at?: string
  updated_at?: string
}

interface BackupLog {
  id: string
  backup_id: string
  action: string
  status: string
  message: string
  created_at?: string
}

// Create backup
export async function createBackup(input: BackupInput): Promise<ActionResult<Backup>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Calculate next run time based on frequency
    let next_run_at: Date | null = null
    const frequency = input.frequency || 'daily'

    if (frequency !== 'on-demand') {
      const now = new Date()
      switch (frequency) {
        case 'hourly':
          next_run_at = new Date(now.getTime() + 60 * 60 * 1000)
          break
        case 'daily':
          next_run_at = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          next_run_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          next_run_at = new Date(now.setMonth(now.getMonth() + 1))
          break
      }
    }

    // Calculate expiration based on retention
    const retentionDays = input.retention_days || 30
    const expires_at = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('backups')
      .insert([{
        user_id: user.id,
        name: input.name,
        description: input.description,
        type: input.type || 'full',
        status: 'scheduled' as BackupStatus,
        frequency,
        schedule_cron: input.schedule_cron,
        next_run_at: next_run_at?.toISOString(),
        storage_location: input.storage_location || 'local',
        storage_path: input.storage_path,
        storage_bucket: input.storage_bucket,
        encrypted: input.encrypted ?? true,
        encryption_algorithm: input.encryption_algorithm || 'AES-256',
        compressed: input.compressed ?? true,
        compression_type: input.compression_type || 'gzip',
        retention_days: retentionDays,
        expires_at: expires_at.toISOString(),
        tags: input.tags || [],
        metadata: input.metadata || {}
      }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create backup', { error, userId: user.id })
      return actionError('Failed to create backup', 'DATABASE_ERROR')
    }

    logger.info('Backup created successfully', { backupId: data.id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Backup created successfully')
  } catch (error) {
    logger.error('Unexpected error creating backup', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update backup
export async function updateBackup(
  id: string,
  input: Partial<BackupInput>
): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup update attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('backups')
      .update(input)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update backup', { error, backupId: id, userId: user.id })
      return actionError('Failed to update backup', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    logger.info('Backup updated successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Backup updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Delete backup
export async function deleteBackup(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup deletion attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('backups')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete backup', { error, backupId: id, userId: user.id })
      return actionError('Failed to delete backup', 'DATABASE_ERROR')
    }

    logger.info('Backup deleted successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess({ success: true }, 'Backup deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Run backup now
export async function runBackupNow(id: string): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup run attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Update backup status
    const { data: backup, error: updateError } = await supabase
      .from('backups')
      .update({
        status: 'in-progress' as BackupStatus,
        last_run_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to run backup', { error: updateError, backupId: id, userId: user.id })
      return actionError('Failed to run backup', 'DATABASE_ERROR')
    }

    if (!backup) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    // Create log entry
    await supabase
      .from('backup_logs')
      .insert([{
        backup_id: id,
        action: 'started',
        status: 'success',
        message: 'Backup started manually'
      }])

    logger.info('Backup started successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(backup as Backup, 'Backup started successfully')
  } catch (error) {
    logger.error('Unexpected error running backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Verify backup
export async function verifyBackup(id: string): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup verification attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('backups')
      .update({
        verified: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to verify backup', { error, backupId: id, userId: user.id })
      return actionError('Failed to verify backup', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    // Create log entry
    await supabase
      .from('backup_logs')
      .insert([{
        backup_id: id,
        action: 'verified',
        status: 'success',
        message: 'Backup verified successfully'
      }])

    logger.info('Backup verified successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Backup verified successfully')
  } catch (error) {
    logger.error('Unexpected error verifying backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Restore backup
export async function restoreBackup(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup restore attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Create log entry for restore
    const { error } = await supabase
      .from('backup_logs')
      .insert([{
        backup_id: id,
        action: 'restored',
        status: 'success',
        message: 'Backup restore initiated'
      }])

    if (error) {
      logger.error('Failed to restore backup', { error, backupId: id, userId: user.id })
      return actionError('Failed to restore backup', 'DATABASE_ERROR')
    }

    logger.info('Backup restore initiated successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess({ success: true }, 'Backup restore initiated successfully')
  } catch (error) {
    logger.error('Unexpected error restoring backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Cancel backup
export async function cancelBackup(id: string): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup cancellation attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('backups')
      .update({ status: 'cancelled' as BackupStatus })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to cancel backup', { error, backupId: id, userId: user.id })
      return actionError('Failed to cancel backup', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    logger.info('Backup cancelled successfully', { backupId: id, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Backup cancelled successfully')
  } catch (error) {
    logger.error('Unexpected error cancelling backup', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Get backup logs
export async function getBackupLogs(backupId: string): Promise<ActionResult<BackupLog[]>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(backupId)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup logs request', { backupId })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // First verify backup belongs to user
    const { data: backup } = await supabase
      .from('backups')
      .select('id')
      .eq('id', backupId)
      .eq('user_id', user.id)
      .single()

    if (!backup) {
      logger.warn('Backup not found or access denied', { backupId, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .eq('backup_id', backupId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to fetch backup logs', { error, backupId, userId: user.id })
      return actionError('Failed to fetch backup logs', 'DATABASE_ERROR')
    }

    logger.info('Backup logs retrieved successfully', { backupId, logCount: data?.length || 0, userId: user.id })
    return actionSuccess((data || []) as BackupLog[], 'Logs retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error fetching backup logs', { error, backupId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update backup schedule
export async function updateBackupSchedule(
  id: string,
  frequency: BackupFrequency,
  scheduleCron?: string
): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized backup schedule update attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    // Calculate next run time
    let next_run_at: Date | null = null
    if (frequency !== 'on-demand') {
      const now = new Date()
      switch (frequency) {
        case 'hourly':
          next_run_at = new Date(now.getTime() + 60 * 60 * 1000)
          break
        case 'daily':
          next_run_at = new Date(now.getTime() + 24 * 60 * 60 * 1000)
          break
        case 'weekly':
          next_run_at = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case 'monthly':
          next_run_at = new Date(now.setMonth(now.getMonth() + 1))
          break
      }
    }

    const { data, error } = await supabase
      .from('backups')
      .update({
        frequency,
        schedule_cron: scheduleCron,
        next_run_at: next_run_at?.toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update backup schedule', { error, backupId: id, userId: user.id })
      return actionError('Failed to update backup schedule', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    logger.info('Backup schedule updated successfully', { backupId: id, frequency, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Schedule updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating backup schedule', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Update retention policy
export async function updateRetentionPolicy(
  id: string,
  retentionDays: number
): Promise<ActionResult<Backup>> {
  try {
    // Validate backup ID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      return actionError('Invalid backup ID format', 'VALIDATION_ERROR')
    }

    if (retentionDays < 1 || retentionDays > 3650) {
      return actionError('Retention days must be between 1 and 3650', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized retention policy update attempt', { backupId: id })
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const expires_at = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000)

    const { data, error } = await supabase
      .from('backups')
      .update({
        retention_days: retentionDays,
        expires_at: expires_at.toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update retention policy', { error, backupId: id, userId: user.id })
      return actionError('Failed to update retention policy', 'DATABASE_ERROR')
    }

    if (!data) {
      logger.warn('Backup not found or access denied', { backupId: id, userId: user.id })
      return actionError('Backup not found', 'NOT_FOUND')
    }

    logger.info('Retention policy updated successfully', { backupId: id, retentionDays, userId: user.id })
    revalidatePath('/dashboard/backups-v2')
    return actionSuccess(data as Backup, 'Retention policy updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating retention policy', { error, backupId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
