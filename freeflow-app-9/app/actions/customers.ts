'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import type { Database } from '@/types/supabase'

const logger = createFeatureLogger('customers')

// Type definitions
type Customer = Database['public']['Tables']['customers']['Row']

interface CreateCustomerInput {
  customer_name: string
  email?: string
  phone?: string
  segment?: string
}

interface CustomerUpdateData {
  total_orders: number
  total_spent: number
  avg_order_value: number
  lifetime_value: number
  last_purchase_date: string
  last_activity_date: string
  last_order_value: number
  first_purchase_date?: string
  first_order_value?: number
}

// ============================================
// CREATE CUSTOMER
// ============================================

export async function createCustomer(
  customerData: CreateCustomerInput
): Promise<ActionResult<Customer>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized customer creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        user_id: user.id,
        ...customerData
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create customer', { error, userId: user.id })
      return actionError('Failed to create customer', 'DATABASE_ERROR')
    }

    logger.info('Customer created successfully', {
      userId: user.id,
      customerId: customer.id
    })

    revalidatePath('/dashboard/customers-v2')
    return actionSuccess(customer, 'Customer created successfully')
  } catch (error) {
    logger.error('Unexpected error creating customer', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// RECORD PURCHASE
// ============================================

export async function recordPurchase(
  id: string,
  orderValue: number
): Promise<ActionResult<Customer>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid customer ID format', { id })
      return actionError('Invalid customer ID format', 'VALIDATION_ERROR')
    }

    // Validate order value
    if (typeof orderValue !== 'number' || orderValue <= 0) {
      logger.warn('Invalid order value', { orderValue })
      return actionError('Order value must be a positive number', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized purchase recording attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current, error: fetchError } = await supabase
      .from('customers')
      .select('total_orders, total_spent, lifetime_value, first_purchase_date')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !current) {
      logger.error('Customer not found', { error: fetchError, customerId: id, userId: user.id })
      return actionError('Customer not found', 'NOT_FOUND')
    }

    const totalOrders = (current.total_orders || 0) + 1
    const totalSpent = (current.total_spent || 0) + orderValue
    const avgOrderValue = parseFloat((totalSpent / totalOrders).toFixed(2))
    const lifetimeValue = totalSpent * 1.25 // LTV calculation

    const updateData: CustomerUpdateData = {
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

    const { data: customer, error: updateError } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      logger.error('Failed to record purchase', { error: updateError, customerId: id, userId: user.id })
      return actionError('Failed to record purchase', 'DATABASE_ERROR')
    }

    logger.info('Purchase recorded successfully', {
      userId: user.id,
      customerId: id,
      orderValue,
      totalOrders
    })

    revalidatePath('/dashboard/customers-v2')
    return actionSuccess(customer, 'Purchase recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording purchase', { error, customerId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE CUSTOMER SEGMENT
// ============================================

export async function updateCustomerSegment(
  id: string,
  segment: string
): Promise<ActionResult<Customer>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid customer ID format', { id })
      return actionError('Invalid customer ID format', 'VALIDATION_ERROR')
    }

    // Validate segment
    if (!segment || typeof segment !== 'string') {
      logger.warn('Invalid segment value', { segment })
      return actionError('Segment is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized segment update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: customer, error } = await supabase
      .from('customers')
      .update({ segment })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update customer segment', { error, customerId: id, userId: user.id })
      return actionError('Failed to update customer segment', 'DATABASE_ERROR')
    }

    logger.info('Customer segment updated successfully', {
      userId: user.id,
      customerId: id,
      segment
    })

    revalidatePath('/dashboard/customers-v2')
    return actionSuccess(customer, 'Customer segment updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating customer segment', { error, customerId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE CHURN RISK
// ============================================

export async function updateChurnRisk(
  id: string,
  riskScore: number
): Promise<ActionResult<Customer>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid customer ID format', { id })
      return actionError('Invalid customer ID format', 'VALIDATION_ERROR')
    }

    // Validate risk score
    if (typeof riskScore !== 'number' || riskScore < 0 || riskScore > 100) {
      logger.warn('Invalid risk score', { riskScore })
      return actionError('Risk score must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized churn risk update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

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

    if (error) {
      logger.error('Failed to update churn risk', { error, customerId: id, userId: user.id })
      return actionError('Failed to update churn risk', 'DATABASE_ERROR')
    }

    logger.info('Churn risk updated successfully', {
      userId: user.id,
      customerId: id,
      riskScore,
      segment
    })

    revalidatePath('/dashboard/customers-v2')
    return actionSuccess(customer, 'Churn risk updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating churn risk', { error, customerId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE CUSTOMER SATISFACTION
// ============================================

export async function updateCustomerSatisfaction(
  id: string,
  npsScore: number,
  satisfactionScore?: number
): Promise<ActionResult<Customer>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid customer ID format', { id })
      return actionError('Invalid customer ID format', 'VALIDATION_ERROR')
    }

    // Validate NPS score
    if (typeof npsScore !== 'number' || npsScore < -100 || npsScore > 100) {
      logger.warn('Invalid NPS score', { npsScore })
      return actionError('NPS score must be between -100 and 100', 'VALIDATION_ERROR')
    }

    // Validate satisfaction score if provided
    if (satisfactionScore !== undefined &&
        (typeof satisfactionScore !== 'number' || satisfactionScore < 0 || satisfactionScore > 100)) {
      logger.warn('Invalid satisfaction score', { satisfactionScore })
      return actionError('Satisfaction score must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized satisfaction update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const updateData: Record<string, string | number> = {
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

    if (error) {
      logger.error('Failed to update customer satisfaction', { error, customerId: id, userId: user.id })
      return actionError('Failed to update customer satisfaction', 'DATABASE_ERROR')
    }

    logger.info('Customer satisfaction updated successfully', {
      userId: user.id,
      customerId: id,
      npsScore,
      satisfactionScore
    })

    revalidatePath('/dashboard/customers-v2')
    return actionSuccess(customer, 'Customer satisfaction updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating customer satisfaction', { error, customerId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
