'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCrmContact(contactData: {
  contact_name: string
  email?: string
  phone?: string
  company_name?: string
  contact_type?: string
  status?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .insert({
      user_id: user.id,
      ...contactData
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function updateDealStage(id: string, dealStage: string, dealValue?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    deal_stage: dealStage
  }

  if (dealValue !== undefined) {
    updateData.deal_value = dealValue
  }

  // Update probability based on stage
  if (dealStage === 'prospecting') updateData.probability_percentage = 10
  if (dealStage === 'qualification') updateData.probability_percentage = 25
  if (dealStage === 'proposal') updateData.probability_percentage = 50
  if (dealStage === 'negotiation') updateData.probability_percentage = 75
  if (dealStage === 'closed_won') {
    updateData.probability_percentage = 100
    updateData.conversion_date = new Date().toISOString()
    updateData.conversion_value = dealValue || 0
  }
  if (dealStage === 'closed_lost') updateData.probability_percentage = 0

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function recordInteraction(id: string, interactionType: 'email' | 'call' | 'meeting' | 'chat') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('crm_contacts')
    .select('email_count, call_count, meeting_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Contact not found')

  const updateData: any = {
    last_contact_date: new Date().toISOString(),
    last_contact_type: interactionType
  }

  if (interactionType === 'email') {
    updateData.email_count = (current.email_count || 0) + 1
  } else if (interactionType === 'call') {
    updateData.call_count = (current.call_count || 0) + 1
  } else if (interactionType === 'meeting') {
    updateData.meeting_count = (current.meeting_count || 0) + 1
  }

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function updateLeadScore(id: string, score: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let qualificationStatus = 'pending'
  if (score >= 80) qualificationStatus = 'qualified'
  else if (score >= 50) qualificationStatus = 'nurturing'
  else if (score < 30) qualificationStatus = 'disqualified'

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update({
      lead_score: score,
      qualification_status: qualificationStatus
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function recordPurchase(id: string, purchaseValue: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('crm_contacts')
    .select('total_purchases, purchase_count, lifetime_value')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Contact not found')

  const totalPurchases = (current.total_purchases || 0) + purchaseValue
  const purchaseCount = (current.purchase_count || 0) + 1
  const avgPurchaseValue = parseFloat((totalPurchases / purchaseCount).toFixed(2))
  const lifetimeValue = totalPurchases

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update({
      total_purchases: totalPurchases,
      purchase_count: purchaseCount,
      avg_purchase_value: avgPurchaseValue,
      lifetime_value: lifetimeValue,
      contact_type: 'customer',
      status: 'active'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function updateSatisfactionScore(id: string, satisfactionScore: number, npsScore?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    satisfaction_score: parseFloat(satisfactionScore.toFixed(2)),
    last_survey_date: new Date().toISOString()
  }

  if (npsScore !== undefined) {
    updateData.nps_score = npsScore
  }

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function scheduleFollowup(id: string, followupDate: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update({ next_followup_date: followupDate })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function assignContact(id: string, assignedToId: string, assignedToName: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update({
      assigned_to_id: assignedToId,
      assigned_to_name: assignedToName
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}

export async function convertToCustomer(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('crm_contacts')
    .select('created_at, deal_value')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Contact not found')

  const conversionDate = new Date()
  const createdAt = new Date(current.created_at)
  const timeToConversionDays = Math.floor((conversionDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  const { data: contact, error } = await supabase
    .from('crm_contacts')
    .update({
      contact_type: 'customer',
      status: 'active',
      conversion_date: conversionDate.toISOString(),
      conversion_value: current.deal_value || 0,
      time_to_conversion_days: timeToConversionDays,
      deal_stage: 'closed_won'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/crm-v2')
  return contact
}
