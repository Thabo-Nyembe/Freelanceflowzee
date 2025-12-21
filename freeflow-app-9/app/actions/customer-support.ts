'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('customer-support-actions')

export interface SupportAgentInput {
  name: string
  email?: string
  status?: 'online' | 'busy' | 'away' | 'offline'
  availability?: string
  specializations?: string[]
}

export interface SupportConversationInput {
  agent_id?: string
  customer_name: string
  customer_email?: string
  conversation_type?: 'chat' | 'email' | 'phone' | 'video'
  status?: 'active' | 'waiting' | 'closed'
  subject?: string
  priority?: 'low' | 'medium' | 'high'
}

export async function createSupportAgent(input: SupportAgentInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('support_agents')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create support agent', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Support agent created successfully', { agentId: data.id })
    return actionSuccess(data, 'Support agent created successfully')
  } catch (error) {
    logger.error('Unexpected error creating support agent', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSupportAgent(id: string, input: Partial<SupportAgentInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('support_agents')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update support agent', { error: error.message, id, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Support agent updated successfully', { agentId: id })
    return actionSuccess(data, 'Support agent updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating support agent', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSupportAgent(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { error } = await supabase
      .from('support_agents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete support agent', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Support agent deleted successfully', { agentId: id })
    return actionSuccess(null, 'Support agent deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting support agent', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function setAgentStatus(id: string, status: 'online' | 'busy' | 'away' | 'offline'): Promise<ActionResult<any>> {
  return updateSupportAgent(id, { status })
}

export async function createConversation(input: SupportConversationInput): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('support_conversations')
      .insert([{ ...input, user_id: user.id }])
      .select()
      .single()

    if (error) {
      logger.error('Failed to create conversation', { error: error.message, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Conversation created successfully', { conversationId: data.id })
    return actionSuccess(data, 'Conversation created successfully')
  } catch (error) {
    logger.error('Unexpected error creating conversation', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateConversation(id: string, input: Partial<SupportConversationInput>): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('support_conversations')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update conversation', { error: error.message, id, input })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Conversation updated successfully', { conversationId: id })
    return actionSuccess(data, 'Conversation updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating conversation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function closeConversation(id: string, satisfactionRating?: number): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const updateData: any = {
      status: 'closed',
      closed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (satisfactionRating !== undefined) {
      updateData.satisfaction_rating = satisfactionRating
    }

    const { data, error } = await supabase
      .from('support_conversations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to close conversation', { error: error.message, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Conversation closed successfully', { conversationId: id })
    return actionSuccess(data, 'Conversation closed successfully')
  } catch (error) {
    logger.error('Unexpected error closing conversation', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function assignConversation(conversationId: string, agentId: string): Promise<ActionResult<any>> {
  try {
    const supabase = createServerActionClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return actionError('Not authenticated', 'UNAUTHORIZED')
    }

    const { data, error } = await supabase
      .from('support_conversations')
      .update({
        agent_id: agentId,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign conversation', { error: error.message, conversationId, agentId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/customer-support-v2')
    logger.info('Conversation assigned successfully', { conversationId, agentId })
    return actionSuccess(data, 'Conversation assigned successfully')
  } catch (error) {
    logger.error('Unexpected error assigning conversation', { error, conversationId, agentId })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
