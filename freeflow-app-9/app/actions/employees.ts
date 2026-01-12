'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'
import { uuidSchema } from '@/lib/validations'
import type { Database } from '@/types/supabase'

const logger = createFeatureLogger('employees')

// Type definitions
type Employee = Database['public']['Tables']['employees']['Row']

interface CreateEmployeeInput {
  employee_name: string
  email?: string
  position?: string
  department?: string
  salary?: number
  hire_date?: string
}

// ============================================
// CREATE EMPLOYEE
// ============================================

export async function createEmployee(
  data: CreateEmployeeInput
): Promise<ActionResult<Employee>> {
  try {
    // Validate required fields
    if (!data.employee_name || typeof data.employee_name !== 'string' || data.employee_name.trim().length === 0) {
      logger.warn('Invalid employee name', { data })
      return actionError('Employee name is required', 'VALIDATION_ERROR')
    }

    // Validate salary if provided
    if (data.salary !== undefined && (typeof data.salary !== 'number' || data.salary < 0)) {
      logger.warn('Invalid salary', { salary: data.salary })
      return actionError('Salary must be a positive number', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized employee creation attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .insert({
        user_id: user.id,
        ...data,
        status: 'active',
        employment_type: 'full-time'
      })
      .select()
      .single()

    if (error) {
      logger.error('Failed to create employee', { error, userId: user.id })
      return actionError('Failed to create employee', 'DATABASE_ERROR')
    }

    logger.info('Employee created successfully', {
      userId: user.id,
      employeeId: employee.id
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Employee created successfully')
  } catch (error) {
    logger.error('Unexpected error creating employee', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE EMPLOYEE PERFORMANCE
// ============================================

export async function updateEmployeePerformance(
  id: string,
  performanceScore: number
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate performance score
    if (typeof performanceScore !== 'number' || performanceScore < 0 || performanceScore > 100) {
      logger.warn('Invalid performance score', { performanceScore })
      return actionError('Performance score must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized performance update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const performanceRating = parseFloat((performanceScore / 100 * 5).toFixed(2))

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        performance_score: performanceScore,
        performance_rating: performanceRating,
        last_review_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update employee performance', { error, employeeId: id, userId: user.id })
      return actionError('Failed to update employee performance', 'DATABASE_ERROR')
    }

    logger.info('Employee performance updated successfully', {
      userId: user.id,
      employeeId: id,
      performanceScore,
      performanceRating
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Employee performance updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating employee performance', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// ASSIGN PROJECTS
// ============================================

export async function assignProjects(
  id: string,
  projectsCount: number
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate projects count
    if (typeof projectsCount !== 'number' || projectsCount < 0 || !Number.isInteger(projectsCount)) {
      logger.warn('Invalid projects count', { projectsCount })
      return actionError('Projects count must be a non-negative integer', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized project assignment attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        projects_count: projectsCount
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to assign projects', { error, employeeId: id, userId: user.id })
      return actionError('Failed to assign projects', 'DATABASE_ERROR')
    }

    logger.info('Projects assigned successfully', {
      userId: user.id,
      employeeId: id,
      projectsCount
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Projects assigned successfully')
  } catch (error) {
    logger.error('Unexpected error assigning projects', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// RECORD TIME OFF
// ============================================

export async function recordTimeOff(
  id: string,
  days: number,
  type: 'pto' | 'sick'
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate days
    if (typeof days !== 'number' || days <= 0) {
      logger.warn('Invalid days value', { days })
      return actionError('Days must be a positive number', 'VALIDATION_ERROR')
    }

    // Validate type
    if (type !== 'pto' && type !== 'sick') {
      logger.warn('Invalid time off type', { type })
      return actionError('Time off type must be either "pto" or "sick"', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized time off recording attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: current, error: fetchError } = await supabase
      .from('employees')
      .select('used_pto_days, used_sick_days')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !current) {
      logger.error('Employee not found', { error: fetchError, employeeId: id, userId: user.id })
      return actionError('Employee not found', 'NOT_FOUND')
    }

    const updateData = type === 'pto'
      ? { used_pto_days: (current.used_pto_days || 0) + days }
      : { used_sick_days: (current.used_sick_days || 0) + days }

    const { data: employee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to record time off', { error, employeeId: id, userId: user.id })
      return actionError('Failed to record time off', 'DATABASE_ERROR')
    }

    logger.info('Time off recorded successfully', {
      userId: user.id,
      employeeId: id,
      days,
      type
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Time off recorded successfully')
  } catch (error) {
    logger.error('Unexpected error recording time off', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE SALARY
// ============================================

export async function updateSalary(
  id: string,
  newSalary: number
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate salary
    if (typeof newSalary !== 'number' || newSalary < 0) {
      logger.warn('Invalid salary', { newSalary })
      return actionError('Salary must be a positive number', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized salary update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        salary: newSalary
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update salary', { error, employeeId: id, userId: user.id })
      return actionError('Failed to update salary', 'DATABASE_ERROR')
    }

    logger.info('Salary updated successfully', {
      userId: user.id,
      employeeId: id,
      newSalary
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Salary updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating salary', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// PROMOTE EMPLOYEE
// ============================================

export async function promoteEmployee(
  id: string,
  newPosition: string,
  newSalary?: number
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate position
    if (!newPosition || typeof newPosition !== 'string' || newPosition.trim().length === 0) {
      logger.warn('Invalid position', { newPosition })
      return actionError('Position is required', 'VALIDATION_ERROR')
    }

    // Validate salary if provided
    if (newSalary !== undefined && (typeof newSalary !== 'number' || newSalary < 0)) {
      logger.warn('Invalid salary', { newSalary })
      return actionError('Salary must be a positive number', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized promotion attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const updateData: Record<string, string | number> = {
      position: newPosition,
      job_title: newPosition,
      last_promotion_date: new Date().toISOString()
    }

    if (newSalary) {
      updateData.salary = newSalary
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to promote employee', { error, employeeId: id, userId: user.id })
      return actionError('Failed to promote employee', 'DATABASE_ERROR')
    }

    logger.info('Employee promoted successfully', {
      userId: user.id,
      employeeId: id,
      newPosition,
      newSalary
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Employee promoted successfully')
  } catch (error) {
    logger.error('Unexpected error promoting employee', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// TERMINATE EMPLOYEE
// ============================================

export async function terminateEmployee(
  id: string,
  terminationDate: string
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate termination date
    if (!terminationDate || typeof terminationDate !== 'string') {
      logger.warn('Invalid termination date', { terminationDate })
      return actionError('Termination date is required', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized termination attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        status: 'terminated',
        termination_date: terminationDate
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to terminate employee', { error, employeeId: id, userId: user.id })
      return actionError('Failed to terminate employee', 'DATABASE_ERROR')
    }

    logger.info('Employee terminated successfully', {
      userId: user.id,
      employeeId: id,
      terminationDate
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Employee terminated successfully')
  } catch (error) {
    logger.error('Unexpected error terminating employee', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

// ============================================
// UPDATE ONBOARDING
// ============================================

export async function updateOnboarding(
  id: string,
  progress: number
): Promise<ActionResult<Employee>> {
  try {
    // Validate UUID
    const idValidation = uuidSchema.safeParse(id)
    if (!idValidation.success) {
      logger.warn('Invalid employee ID format', { id })
      return actionError('Invalid employee ID format', 'VALIDATION_ERROR')
    }

    // Validate progress
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      logger.warn('Invalid progress value', { progress })
      return actionError('Progress must be between 0 and 100', 'VALIDATION_ERROR')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      logger.warn('Unauthorized onboarding update attempt')
      return actionError('Unauthorized', 'UNAUTHORIZED')
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update({
        onboarding_progress: progress,
        onboarding_completed: progress >= 100
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update onboarding', { error, employeeId: id, userId: user.id })
      return actionError('Failed to update onboarding', 'DATABASE_ERROR')
    }

    logger.info('Onboarding updated successfully', {
      userId: user.id,
      employeeId: id,
      progress,
      completed: progress >= 100
    })

    revalidatePath('/dashboard/employees-v2')
    return actionSuccess(employee, 'Onboarding updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating onboarding', { error, employeeId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
