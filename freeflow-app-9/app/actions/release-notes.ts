'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ReleaseNoteInput {
  version: string
  title: string
  description?: string
  status?: 'published' | 'draft' | 'scheduled' | 'archived'
  release_type?: 'major' | 'minor' | 'patch' | 'hotfix'
  platform?: 'web' | 'mobile' | 'api' | 'desktop' | 'all'
  author?: string
  highlights?: string[]
  features?: string[]
  improvements?: string[]
  bug_fixes?: string[]
  breaking_changes?: string[]
  tags?: string[]
  scheduled_at?: string
}

export async function createReleaseNote(input: ReleaseNoteInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('release_notes')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/release-notes-v2')
  return { data }
}

export async function updateReleaseNote(id: string, input: Partial<ReleaseNoteInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('release_notes')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/release-notes-v2')
  return { data }
}

export async function deleteReleaseNote(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('release_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/release-notes-v2')
  return { success: true }
}

export async function publishReleaseNote(id: string) {
  return updateReleaseNote(id, { status: 'published', published_at: new Date().toISOString() } as any)
}

export async function archiveReleaseNote(id: string) {
  return updateReleaseNote(id, { status: 'archived' })
}

export async function likeReleaseNote(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: release } = await supabase
    .from('release_notes')
    .select('likes_count')
    .eq('id', id)
    .single()

  if (!release) {
    return { error: 'Release note not found' }
  }

  const { data, error } = await supabase
    .from('release_notes')
    .update({ likes_count: (release.likes_count || 0) + 1 })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/release-notes-v2')
  return { data }
}
