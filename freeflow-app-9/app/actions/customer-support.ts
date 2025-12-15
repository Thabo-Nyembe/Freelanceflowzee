'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

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

export async function createSupportAgent(input: SupportAgentInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_agents')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}

export async function updateSupportAgent(id: string, input: Partial<SupportAgentInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_agents')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}

export async function deleteSupportAgent(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('support_agents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { success: true }
}

export async function setAgentStatus(id: string, status: 'online' | 'busy' | 'away' | 'offline') {
  return updateSupportAgent(id, { status })
}

export async function createConversation(input: SupportConversationInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_conversations')
    .insert([{ ...input, user_id: user.id }])
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}

export async function updateConversation(id: string, input: Partial<SupportConversationInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('support_conversations')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}

export async function closeConversation(id: string, satisfactionRating?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}

export async function assignConversation(conversationId: string, agentId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
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
    return { error: error.message }
  }

  revalidatePath('/dashboard/customer-support-v2')
  return { data }
}
