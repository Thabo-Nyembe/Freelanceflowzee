'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCustomerSuccess(customerData: {
  customer_name: string
  company_name?: string
  account_tier?: string
  mrr?: number
  arr?: number
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: customer, error } = await supabase
    .from('customer_success')
    .insert({
      user_id: user.id,
      ...customerData
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateHealthScore(id: string, healthScore: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customer_success')
    .select('health_score')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  let healthStatus = 'healthy'
  let healthTrend = 'stable'

  // Determine health status
  if (healthScore >= 80) healthStatus = 'healthy'
  else if (healthScore >= 60) healthStatus = 'at_risk'
  else if (healthScore >= 40) healthStatus = 'critical'
  else healthStatus = 'churned'

  // Determine health trend
  if (current.health_score) {
    if (healthScore > current.health_score + 5) healthTrend = 'improving'
    else if (healthScore < current.health_score - 5) healthTrend = 'declining'
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      health_score: healthScore,
      health_status: healthStatus,
      health_trend: healthTrend,
      previous_health_score: current.health_score
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateEngagementLevel(id: string, productUsagePercentage: number, loginCount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let engagementLevel = 'low'

  if (productUsagePercentage >= 80 && loginCount >= 20) {
    engagementLevel = 'high'
  } else if (productUsagePercentage >= 50 && loginCount >= 10) {
    engagementLevel = 'medium'
  } else if (productUsagePercentage < 20 && loginCount < 5) {
    engagementLevel = 'inactive'
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      engagement_level: engagementLevel,
      product_usage_percentage: parseFloat(productUsagePercentage.toFixed(2)),
      login_count: loginCount,
      last_login_date: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateOnboardingProgress(id: string, progressPercentage: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customer_success')
    .select('contract_start_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  let onboardingStatus = 'in_progress'
  let onboardingCompletedDate = null
  let timeToValueDays = null

  if (progressPercentage === 100) {
    onboardingStatus = 'completed'
    onboardingCompletedDate = new Date().toISOString()

    if (current.contract_start_date) {
      const startDate = new Date(current.contract_start_date)
      const completedDate = new Date()
      timeToValueDays = Math.floor((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    }
  } else if (progressPercentage < 25) {
    onboardingStatus = 'not_started'
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      onboarding_progress_percentage: parseFloat(progressPercentage.toFixed(2)),
      onboarding_status: onboardingStatus,
      onboarding_completed_date: onboardingCompletedDate,
      time_to_value_days: timeToValueDays
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function recordSupportTicket(id: string, isOpen: boolean) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customer_success')
    .select('support_ticket_count, open_ticket_count, closed_ticket_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  const updateData: any = {
    support_ticket_count: (current.support_ticket_count || 0) + 1
  }

  if (isOpen) {
    updateData.open_ticket_count = (current.open_ticket_count || 0) + 1
  } else {
    updateData.closed_ticket_count = (current.closed_ticket_count || 0) + 1
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateNpsScore(id: string, npsScore: number, csatScore?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customer_success')
    .select('survey_response_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  const updateData: any = {
    nps_score: npsScore,
    last_survey_date: new Date().toISOString(),
    survey_response_count: (current.survey_response_count || 0) + 1
  }

  if (csatScore !== undefined) {
    updateData.csat_score = parseFloat(csatScore.toFixed(2))
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function scheduleQBR(id: string, qbrDate: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customer_success')
    .select('qbr_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      next_qbr_date: qbrDate,
      last_qbr_date: new Date().toISOString(),
      qbr_count: (current.qbr_count || 0) + 1
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateChurnRisk(id: string, churnRiskScore: number, churnReasons?: string[]) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const churnProbability = parseFloat((churnRiskScore / 100).toFixed(2))

  const updateData: any = {
    churn_risk_score: parseFloat(churnRiskScore.toFixed(2)),
    churn_probability: churnProbability
  }

  if (churnReasons && churnReasons.length > 0) {
    updateData.churn_reasons = churnReasons
  }

  if (churnRiskScore >= 70) {
    updateData.at_risk_since = new Date().toISOString()
    updateData.health_status = 'at_risk'
    updateData.alert_level = 'high'
  }

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function updateRenewalStatus(id: string, renewalDate: string, daysToRenewal: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      renewal_date: renewalDate,
      days_to_renewal: daysToRenewal
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}

export async function assignCSM(id: string, csmId: string, csmName: string, csmEmail: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: customer, error } = await supabase
    .from('customer_success')
    .update({
      csm_id: csmId,
      csm_name: csmName,
      csm_email: csmEmail,
      last_csm_contact: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customer-success-v2')
  return customer
}
