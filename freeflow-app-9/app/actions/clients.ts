'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ClientInput {
  name: string
  email?: string
  phone?: string
  company?: string
  website?: string
  address?: string
  city?: string
  country?: string
  status?: 'active' | 'inactive' | 'prospect' | 'archived'
  type?: 'individual' | 'business' | 'enterprise'
  industry?: string
  notes?: string
  avatar_url?: string
  tags?: string[]
  rating?: number
}

export async function createClient(input: ClientInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('clients')
    .insert([{
      ...input,
      user_id: user.id,
      status: input.status || 'active',
      type: input.type || 'individual'
    }])
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/clients-v2')
  return data
}

export async function updateClient(id: string, updates: Partial<ClientInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/clients-v2')
  return data
}

export async function archiveClient(id: string) {
  return updateClient(id, { status: 'archived' })
}

export async function deleteClient(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/clients-v2')
  return { success: true }
}

export async function getClients() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('name', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getClientById(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) return null
  return data
}
