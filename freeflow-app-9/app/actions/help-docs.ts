'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createHelpDoc(input: HelpDocInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('help_docs')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/help-docs-v2')
  return { data }
}

export async function updateHelpDoc(id: string, input: Partial<HelpDocInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('help_docs')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/help-docs-v2')
  return { data }
}

export async function deleteHelpDoc(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('help_docs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/help-docs-v2')
  return { success: true }
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

export async function markHelpful(id: string, helpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: doc } = await supabase
    .from('help_docs')
    .select('helpful_count, not_helpful_count')
    .eq('id', id)
    .single()

  if (!doc) {
    return { error: 'Help doc not found' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/help-docs-v2')
  return { data }
}

export async function incrementViewCount(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: doc } = await supabase
    .from('help_docs')
    .select('views_count')
    .eq('id', id)
    .single()

  if (!doc) {
    return { error: 'Help doc not found' }
  }

  const { error } = await supabase
    .from('help_docs')
    .update({ views_count: (doc.views_count || 0) + 1 })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
