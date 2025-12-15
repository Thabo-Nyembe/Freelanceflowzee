'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createDataExport(exportData: {
  export_name: string
  description?: string
  export_format: string
  data_source: string
  export_type?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .insert({
      user_id: user.id,
      status: 'pending',
      ...exportData
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function startExport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function updateExportProgress(id: string, progress: number, processedRecords: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update({
      progress_percentage: parseFloat(progress.toFixed(2)),
      processed_records: processedRecords
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function completeExport(id: string, fileSize: number, downloadUrl: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('data_exports')
    .select('started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Export not found')

  const completedAt = new Date()
  const startedAt = new Date(current.started_at)
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000)

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update({
      status: 'completed',
      completed_at: completedAt.toISOString(),
      duration_seconds: durationSeconds,
      file_size_bytes: fileSize,
      file_size_mb: parseFloat((fileSize / (1024 * 1024)).toFixed(2)),
      download_url: downloadUrl,
      progress_percentage: 100,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function failExport(id: string, errorMessage: string, errorCode?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update({
      status: 'failed',
      error_message: errorMessage,
      error_code: errorCode
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function scheduleExport(id: string, scheduledAt: string, recurrencePattern?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    status: 'scheduled',
    scheduled_at: scheduledAt
  }

  if (recurrencePattern) {
    updateData.is_recurring = true
    updateData.recurrence_pattern = recurrencePattern
  }

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}

export async function cancelExport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: dataExport, error } = await supabase
    .from('data_exports')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/data-export-v2')
  return dataExport
}
