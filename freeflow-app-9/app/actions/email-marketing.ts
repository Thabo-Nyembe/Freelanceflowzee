'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('email-marketing-actions')

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
export async function createEmailCampaign(input: EmailCampaignInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create email campaign', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email campaign created successfully', { id: data.id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Email campaign created successfully')
  } catch (error) {
    logger.error('Unexpected error creating email campaign', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateEmailCampaign(id: string, updates: Partial<EmailCampaignInput>): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('email_campaigns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update email campaign', { error, id, updates })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email campaign updated successfully', { id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Email campaign updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating email campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteEmailCampaign(id: string): Promise<ActionResult<{ success: boolean }>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('email_campaigns')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete email campaign', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email campaign deleted successfully', { id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess({ success: true }, 'Email campaign deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting email campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleCampaign(id: string, scheduledAt: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to schedule campaign', { error, id, scheduledAt })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Campaign scheduled successfully', { id, scheduledAt })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Campaign scheduled successfully')
  } catch (error) {
    logger.error('Unexpected error scheduling campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function sendCampaign(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to send campaign', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Campaign sent successfully', { id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Campaign sent successfully')
  } catch (error) {
    logger.error('Unexpected error sending campaign', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getEmailCampaigns(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get email campaigns', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Email campaigns retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting email campaigns', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Subscriber Actions
export async function createEmailSubscriber(input: EmailSubscriberInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create email subscriber', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email subscriber created successfully', { id: data.id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Email subscriber created successfully')
  } catch (error) {
    logger.error('Unexpected error creating email subscriber', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function unsubscribeEmail(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to unsubscribe email', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email unsubscribed successfully', { id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Email unsubscribed successfully')
  } catch (error) {
    logger.error('Unexpected error unsubscribing email', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getEmailSubscribers(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .eq('user_id', user.id)
      .order('subscribed_at', { ascending: false })

    if (error) {
      logger.error('Failed to get email subscribers', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Email subscribers retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting email subscribers', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// List Actions
export async function createEmailList(input: EmailListInput): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create email list', { error, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Email list created successfully', { id: data.id })
    revalidatePath('/dashboard/email-marketing-v2')
    return actionSuccess(data, 'Email list created successfully')
  } catch (error) {
    logger.error('Unexpected error creating email list', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function getEmailLists(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('email_lists')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get email lists', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Email lists retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting email lists', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// Template Actions
export async function getEmailTemplates(): Promise<ActionResult<any[]>> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Failed to get email templates', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    return actionSuccess(data || [], 'Email templates retrieved successfully')
  } catch (error) {
    logger.error('Unexpected error getting email templates', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
