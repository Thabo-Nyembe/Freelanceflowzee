'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Types
export interface EmailCampaignInput {
  title: string
  subject: string
  preview_text?: string
  content_html?: string
  content_text?: string
  template_id?: string
  campaign_type?: string
  sender_name?: string
  sender_email?: string
  reply_to?: string
  list_ids?: string[]
  segment_ids?: string[]
  scheduled_at?: string
  tags?: string[]
  ab_test_enabled?: boolean
  ab_test_config?: Record<string, any>
  tracking_enabled?: boolean
  metadata?: Record<string, any>
}

export interface EmailSubscriberInput {
  email: string
  first_name?: string
  last_name?: string
  source?: string
  list_ids?: string[]
  tags?: string[]
  custom_fields?: Record<string, any>
  metadata?: Record<string, any>
}

export interface EmailListInput {
  name: string
  description?: string
  double_optin?: boolean
  welcome_email_enabled?: boolean
  welcome_email_id?: string
  tags?: string[]
  metadata?: Record<string, any>
}

// Campaign Actions
export async function createEmailCampaign(input: EmailCampaignInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_campaigns')
    .insert([{
      ...input,
      user_id: user.id,
      status: 'draft',
      total_recipients: 0,
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      bounced_count: 0,
      unsubscribed_count: 0,
      complained_count: 0,
      open_rate: 0,
      click_rate: 0,
      bounce_rate: 0,
      unsubscribe_rate: 0,
      tracking_enabled: input.tracking_enabled ?? true
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function updateEmailCampaign(id: string, updates: Partial<EmailCampaignInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_campaigns')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function deleteEmailCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('email_campaigns')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return { success: true }
}

export async function scheduleCampaign(id: string, scheduledAt: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'scheduled',
      scheduled_at: scheduledAt,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function sendCampaign(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_campaigns')
    .update({
      status: 'sending',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function getEmailCampaigns() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Subscriber Actions
export async function createEmailSubscriber(input: EmailSubscriberInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_subscribers')
    .insert([{
      ...input,
      user_id: user.id,
      status: 'subscribed',
      total_opens: 0,
      total_clicks: 0
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function unsubscribeEmail(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_subscribers')
    .update({
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function getEmailSubscribers() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('email_subscribers')
    .select('*')
    .eq('user_id', user.id)
    .order('subscribed_at', { ascending: false })

  if (error) throw error
  return data || []
}

// List Actions
export async function createEmailList(input: EmailListInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('email_lists')
    .insert([{
      ...input,
      user_id: user.id,
      subscriber_count: 0,
      double_optin: input.double_optin ?? false,
      welcome_email_enabled: input.welcome_email_enabled ?? false
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/email-marketing-v2')
  return data
}

export async function getEmailLists() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('email_lists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Template Actions
export async function getEmailTemplates() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
