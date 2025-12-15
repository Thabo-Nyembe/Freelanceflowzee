'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface DocumentationInput {
  title: string
  description?: string
  content?: string
  status?: 'published' | 'draft' | 'review' | 'archived'
  doc_type?: 'guide' | 'api-reference' | 'tutorial' | 'concept' | 'quickstart' | 'troubleshooting'
  category?: 'getting-started' | 'features' | 'integrations' | 'api' | 'sdk' | 'advanced'
  author?: string
  version?: string
  read_time?: number
  tags?: string[]
}

export async function createDocumentation(input: DocumentationInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('documentation')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/documentation-v2')
  return { data }
}

export async function updateDocumentation(id: string, input: Partial<DocumentationInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('documentation')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/documentation-v2')
  return { data }
}

export async function deleteDocumentation(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('documentation')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/documentation-v2')
  return { success: true }
}

export async function publishDocumentation(id: string) {
  return updateDocumentation(id, { status: 'published' })
}

export async function archiveDocumentation(id: string) {
  return updateDocumentation(id, { status: 'archived' })
}

export async function submitForReview(id: string) {
  return updateDocumentation(id, { status: 'review' })
}

export async function markHelpful(id: string, helpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data: doc } = await supabase
    .from('documentation')
    .select('helpful_count, not_helpful_count')
    .eq('id', id)
    .single()

  if (!doc) {
    return { error: 'Documentation not found' }
  }

  const updateData = helpful
    ? { helpful_count: (doc.helpful_count || 0) + 1 }
    : { not_helpful_count: (doc.not_helpful_count || 0) + 1 }

  const { data, error } = await supabase
    .from('documentation')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/documentation-v2')
  return { data }
}
