'use client'

import { useSupabaseQuery, useSupabaseMutation } from './use-supabase-query'

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern' | 'temporary'
export type EmployeeStatus = 'active' | 'inactive' | 'on-leave' | 'terminated' | 'suspended'

export interface Employee {
  id: string
  user_id: string
  employee_name: string
  employee_id: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  position: string | null
  job_title: string | null
  department: string | null
  team: string | null
  level: string | null
  employment_type: EmploymentType
  status: EmployeeStatus
  is_remote: boolean
  manager_id: string | null
  manager_name: string | null
  direct_reports: number
  reports_to: string | null
  office_location: string | null
  work_location: string | null
  country: string | null
  city: string | null
  state: string | null
  timezone: string | null
  salary: number
  hourly_rate: number
  currency: string
  bonus_eligible: boolean
  commission_rate: number
  health_insurance: boolean
  retirement_plan: boolean
  stock_options: number
  pto_days: number
  sick_days: number
  used_pto_days: number
  used_sick_days: number
  hire_date: string | null
  start_date: string | null
  termination_date: string | null
  probation_end_date: string | null
  last_promotion_date: string | null
  performance_rating: number
  performance_score: number
  last_review_date: string | null
  next_review_date: string | null
  goals_completed: number
  goals_total: number
  projects_count: number
  tasks_completed: number
  hours_logged: number
  productivity_score: number
  skills: string[] | null
  certifications: string[] | null
  languages: string[] | null
  education_level: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  contract_url: string | null
  resume_url: string | null
  id_document_url: string | null
  photo_url: string | null
  onboarding_completed: boolean
  onboarding_progress: number
  orientation_date: string | null
  notes: string | null
  tags: string[] | null
  custom_fields: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseEmployeesOptions {
  department?: string | 'all'
  status?: EmployeeStatus | 'all'
}

export function useEmployees(options: UseEmployeesOptions = {}) {
  const { department, status } = options

  const filters: Record<string, any> = {}
  if (department && department !== 'all') {
    filters.department = department
  }
  if (status && status !== 'all') {
    filters.status = status
  }

  return useSupabaseQuery<Employee>({
    table: 'employees',
    filters,
    orderBy: { column: 'created_at', ascending: false }
  })
}

export function useCreateEmployee() {
  const result = useSupabaseMutation<Employee>({ table: 'employees' })
  return {
    mutate: result.mutate,
    loading: result.loading,
    error: result.error
  }
}

export function useUpdateEmployee() {
  const result = useSupabaseMutation<Employee>({ table: 'employees' })
  return {
    mutate: result.mutate,
    loading: result.loading,
    error: result.error
  }
}

export function useDeleteEmployee() {
  const result = useSupabaseMutation<Employee>({ table: 'employees' })
  return {
    mutate: result.remove,
    loading: result.loading,
    error: result.error
  }
}
