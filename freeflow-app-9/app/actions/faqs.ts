'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface FAQInput {
  question: string
  answer: string
  category?: string
  status?: 'draft' | 'published' | 'review' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  author?: string
  average_read_time?: number
  metadata?: Record<string, any>
}

export async function getFAQs() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createFAQ(input: FAQInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('faqs')
    .insert({
      ...input,
      user_id: user.id,
      tags: input.tags || [],
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/faq-v2')
  return { data, error: null }
}

export async function updateFAQ(id: string, input: Partial<FAQInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('faqs')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/faq-v2')
  return { data, error: null }
}

export async function deleteFAQ(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/faq-v2')
  return { success: true, error: null }
}

export async function markFAQHelpful(id: string, helpful: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: faq } = await supabase
    .from('faqs')
    .select('helpful_count, not_helpful_count')
    .eq('id', id)
    .single()

  if (!faq) {
    return { error: 'FAQ not found', data: null }
  }

  const { data, error } = await supabase
    .from('faqs')
    .update({
      helpful_count: helpful ? (faq.helpful_count || 0) + 1 : faq.helpful_count,
      not_helpful_count: !helpful ? (faq.not_helpful_count || 0) + 1 : faq.not_helpful_count,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/faq-v2')
  return { data, error: null }
}

export async function getFAQStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: faqs, error } = await supabase
    .from('faqs')
    .select('status, views_count, helpful_count, not_helpful_count')
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, data: null }
  }

  const totalHelpful = faqs?.reduce((sum, f) => sum + (f.helpful_count || 0), 0) || 0
  const totalNotHelpful = faqs?.reduce((sum, f) => sum + (f.not_helpful_count || 0), 0) || 0
  const total = totalHelpful + totalNotHelpful

  const stats = {
    total: faqs?.length || 0,
    published: faqs?.filter(f => f.status === 'published').length || 0,
    draft: faqs?.filter(f => f.status === 'draft').length || 0,
    review: faqs?.filter(f => f.status === 'review').length || 0,
    archived: faqs?.filter(f => f.status === 'archived').length || 0,
    totalViews: faqs?.reduce((sum, f) => sum + (f.views_count || 0), 0) || 0,
    totalHelpful,
    avgHelpfulness: total > 0 ? Math.round((totalHelpful / total) * 100) : 0
  }

  return { data: stats, error: null }
}
