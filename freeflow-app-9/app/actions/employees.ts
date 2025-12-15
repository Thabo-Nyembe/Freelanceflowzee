'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createEmployee(data: {
  employee_name: string
  email?: string
  position?: string
  department?: string
  salary?: number
  hire_date?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function updateEmployeePerformance(id: string, performanceScore: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function assignProjects(id: string, projectsCount: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: employee, error } = await supabase
    .from('employees')
    .update({
      projects_count: projectsCount
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function recordTimeOff(id: string, days: number, type: 'pto' | 'sick') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('employees')
    .select('used_pto_days, used_sick_days')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const updateData = type === 'pto'
    ? { used_pto_days: (current?.used_pto_days || 0) + days }
    : { used_sick_days: (current?.used_sick_days || 0) + days }

  const { data: employee, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function updateSalary(id: string, newSalary: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: employee, error } = await supabase
    .from('employees')
    .update({
      salary: newSalary
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function promoteEmployee(id: string, newPosition: string, newSalary?: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const updateData: any = {
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

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function terminateEmployee(id: string, terminationDate: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}

export async function updateOnboarding(id: string, progress: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

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

  if (error) throw error

  revalidatePath('/dashboard/employees-v2')
  return employee
}
