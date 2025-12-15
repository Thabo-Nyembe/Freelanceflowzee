'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createCustomer(customerData: {
  customer_name: string
  email?: string
  phone?: string
  segment?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      user_id: user.id,
      ...customerData
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customers-v2')
  return customer
}

export async function recordPurchase(id: string, orderValue: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('customers')
    .select('total_orders, total_spent, lifetime_value, first_purchase_date')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Customer not found')

  const totalOrders = (current.total_orders || 0) + 1
  const totalSpent = (current.total_spent || 0) + orderValue
  const avgOrderValue = parseFloat((totalSpent / totalOrders).toFixed(2))
  const lifetimeValue = totalSpent * 1.25 // LTV calculation

  const updateData: any = {
    total_orders: totalOrders,
    total_spent: totalSpent,
    avg_order_value: avgOrderValue,
    lifetime_value: lifetimeValue,
    last_purchase_date: new Date().toISOString(),
    last_activity_date: new Date().toISOString(),
    last_order_value: orderValue
  }

  if (!current.first_purchase_date) {
    updateData.first_purchase_date = new Date().toISOString()
    updateData.first_order_value = orderValue
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customers-v2')
  return customer
}

export async function updateCustomerSegment(id: string, segment: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: customer, error } = await supabase
    .from('customers')
    .update({ segment })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customers-v2')
  return customer
}

export async function updateChurnRisk(id: string, riskScore: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  let segment = 'active'
  if (riskScore >= 70) segment = 'at_risk'
  else if (riskScore >= 90) segment = 'churned'

  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      churn_risk_score: parseFloat(riskScore.toFixed(2)),
      segment
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customers-v2')
  return customer
}

export async function updateCustomerSatisfaction(id: string, npsScore: number, satisfactionScore?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
    nps_score: npsScore,
    last_survey_date: new Date().toISOString()
  }

  if (satisfactionScore !== undefined) {
    updateData.satisfaction_score = parseFloat(satisfactionScore.toFixed(2))
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/customers-v2')
  return customer
}
