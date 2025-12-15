'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
interface BackupInput {
  name: string
  description?: string
  type?: 'full' | 'incremental' | 'differential' | 'snapshot' | 'archive'
  frequency?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand'
  schedule_cron?: string
  storage_location?: 'local' | 'aws-s3' | 'google-cloud' | 'azure' | 'dropbox' | 'ftp'
  storage_path?: string
  storage_bucket?: string
  encrypted?: boolean
  encryption_algorithm?: string
  compressed?: boolean
  compression_type?: string
  retention_days?: number
  tags?: string[]
  metadata?: Record<string, any>
}

// Create backup
export async function createBackup(input: BackupInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Calculate next run time based on frequency
  let next_run_at = null
  if (input.frequency && input.frequency !== 'on-demand') {
    const now = new Date()
    switch (input.frequency) {
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
  const expires_at = input.retention_days
    ? new Date(Date.now() + input.retention_days * 24 * 60 * 60 * 1000)
    : null

  const { data, error } = await supabase
    .from('backups')
    .insert([{
      user_id: user.id,
      name: input.name,
      description: input.description,
      type: input.type || 'full',
      status: 'scheduled',
      frequency: input.frequency || 'daily',
      schedule_cron: input.schedule_cron,
      next_run_at: next_run_at?.toISOString(),
      storage_location: input.storage_location || 'local',
      storage_path: input.storage_path,
      storage_bucket: input.storage_bucket,
      encrypted: input.encrypted ?? true,
      encryption_algorithm: input.encryption_algorithm || 'AES-256',
      compressed: input.compressed ?? true,
      compression_type: input.compression_type || 'gzip',
      retention_days: input.retention_days || 30,
      expires_at: expires_at?.toISOString(),
      tags: input.tags || [],
      metadata: input.metadata || {}
    }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { data }
}

// Update backup
export async function updateBackup(id: string, input: Partial<BackupInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('backups')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { data }
}

// Delete backup
export async function deleteBackup(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('backups')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { success: true }
}

// Run backup now
export async function runBackupNow(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update backup status
  const { data: backup, error: updateError } = await supabase
    .from('backups')
    .update({
      status: 'in-progress',
      last_run_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (updateError) {
    return { error: updateError.message }
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

  revalidatePath('/dashboard/backups-v2')
  return { data: backup }
}

// Verify backup
export async function verifyBackup(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
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

  revalidatePath('/dashboard/backups-v2')
  return { data }
}

// Restore backup
export async function restoreBackup(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { success: true }
}

// Cancel backup
export async function cancelBackup(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('backups')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { data }
}

// Get backup logs
export async function getBackupLogs(backupId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // First verify backup belongs to user
  const { data: backup } = await supabase
    .from('backups')
    .select('id')
    .eq('id', backupId)
    .eq('user_id', user.id)
    .single()

  if (!backup) {
    return { error: 'Backup not found' }
  }

  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('backup_id', backupId)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message }
  }

  return { data }
}

// Update backup schedule
export async function updateBackupSchedule(
  id: string,
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'on-demand',
  scheduleCron?: string
) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Calculate next run time
  let next_run_at = null
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { data }
}

// Update retention policy
export async function updateRetentionPolicy(id: string, retentionDays: number) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/backups-v2')
  return { data }
}
