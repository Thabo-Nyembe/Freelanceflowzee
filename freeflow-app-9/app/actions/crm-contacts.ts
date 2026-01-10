'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('crm-contacts-actions')

export async function createCrmContact(contactData: {
  contact_name: string
  email?: string
  phone?: string
  company_name?: string
  contact_type?: string
  status?: string
}): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .insert({
        user_id: user.id,
        ...contactData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create CRM contact', { error })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('CRM contact created successfully', { contactId: contact.id })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Contact created successfully')
  } catch (error: any) {
    logger.error('Unexpected error in createCrmContact', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateDealStage(id: string, dealStage: string, dealValue?: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update deal stage', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Deal stage updated successfully', { id, dealStage })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Deal stage updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateDealStage', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordInteraction(id: string, interactionType: 'email' | 'call' | 'meeting' | 'chat'): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('crm_contacts')
      .select('email_count, call_count, meeting_count')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Contact not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to record interaction', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Interaction recorded successfully', { id, interactionType })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Interaction recorded successfully')
  } catch (error: any) {
    logger.error('Unexpected error in recordInteraction', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateLeadScore(id: string, score: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update lead score', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Lead score updated successfully', { id, score })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Lead score updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateLeadScore', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function recordPurchase(id: string, purchaseValue: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('crm_contacts')
      .select('total_purchases, purchase_count, lifetime_value')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Contact not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to record purchase', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Purchase recorded successfully', { id, purchaseValue })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Purchase recorded successfully')
  } catch (error: any) {
    logger.error('Unexpected error in recordPurchase', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSatisfactionScore(id: string, satisfactionScore: number, npsScore?: number): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to update satisfaction score', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Satisfaction score updated successfully', { id })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Satisfaction score updated successfully')
  } catch (error: any) {
    logger.error('Unexpected error in updateSatisfactionScore', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function scheduleFollowup(id: string, followupDate: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: contact, error } = await supabase
      .from('crm_contacts')
      .update({ next_followup_date: followupDate })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to schedule followup', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Followup scheduled successfully', { id, followupDate })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Followup scheduled successfully')
  } catch (error: any) {
    logger.error('Unexpected error in scheduleFollowup', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function assignContact(id: string, assignedToId: string, assignedToName: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to assign contact', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contact assigned successfully', { id, assignedToName })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Contact assigned successfully')
  } catch (error: any) {
    logger.error('Unexpected error in assignContact', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function convertToCustomer(id: string): Promise<ActionResult<any>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current } = await supabase
      .from('crm_contacts')
      .select('created_at, deal_value')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!current) return actionError('Contact not found', 'NOT_FOUND')

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

    if (error) {
      logger.error('Failed to convert to customer', { error, id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    logger.info('Contact converted to customer successfully', { id })
    revalidatePath('/dashboard/crm-v2')
    return actionSuccess(contact, 'Contact converted to customer successfully')
  } catch (error: any) {
    logger.error('Unexpected error in convertToCustomer', { error, id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
