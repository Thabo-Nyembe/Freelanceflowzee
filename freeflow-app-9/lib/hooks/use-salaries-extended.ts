'use client'

/**
 * Extended Salaries Hooks
 * Tables: salaries, salary_components, salary_deductions, salary_history, salary_structures, salary_grades
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSalary(salaryId?: string) {
  const [salary, setSalary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!salaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*), users(*)').eq('id', salaryId).single(); setSalary(data) } finally { setIsLoading(false) }
  }, [salaryId])
  useEffect(() => { loadData() }, [loadData])
  return { salary, isLoading, refresh: loadData }
}

export function useSalaries(options?: { employee_id?: string; structure_id?: string; grade_id?: string; status?: string; effective_date?: string; limit?: number }) {
  const [salaries, setSalaries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*), users(*)')
      if (options?.employee_id) query = query.eq('employee_id', options.employee_id)
      if (options?.structure_id) query = query.eq('structure_id', options.structure_id)
      if (options?.grade_id) query = query.eq('grade_id', options.grade_id)
      if (options?.status) query = query.eq('status', options.status)
      if (options?.effective_date) {
        query = query.lte('effective_from', options.effective_date).or(`effective_until.is.null,effective_until.gte.${options.effective_date}`)
      }
      const { data } = await query.order('effective_from', { ascending: false }).limit(options?.limit || 50)
      setSalaries(data || [])
    } finally { setIsLoading(false) }
  }, [options?.employee_id, options?.structure_id, options?.grade_id, options?.status, options?.effective_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { salaries, isLoading, refresh: loadData }
}

export function useEmployeeSalary(employeeId?: string, effectiveDate?: string) {
  const [salary, setSalary] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const date = effectiveDate || new Date().toISOString()
      const { data } = await supabase.from('salaries').select('*, salary_components(*), salary_deductions(*), salary_structures(*), salary_grades(*)').eq('employee_id', employeeId).eq('status', 'active').lte('effective_from', date).or(`effective_until.is.null,effective_until.gte.${date}`).order('effective_from', { ascending: false }).limit(1).single()
      setSalary(data)
    } finally { setIsLoading(false) }
  }, [employeeId, effectiveDate])
  useEffect(() => { loadData() }, [loadData])
  return { salary, isLoading, refresh: loadData }
}

export function useSalaryComponents(salaryId?: string) {
  const [components, setComponents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!salaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('salary_components').select('*').eq('salary_id', salaryId); setComponents(data || []) } finally { setIsLoading(false) }
  }, [salaryId])
  useEffect(() => { loadData() }, [loadData])
  return { components, isLoading, refresh: loadData }
}

export function useSalaryDeductions(salaryId?: string) {
  const [deductions, setDeductions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!salaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('salary_deductions').select('*').eq('salary_id', salaryId); setDeductions(data || []) } finally { setIsLoading(false) }
  }, [salaryId])
  useEffect(() => { loadData() }, [loadData])
  return { deductions, isLoading, refresh: loadData }
}

export function useSalaryHistory(employeeId?: string, options?: { from_date?: string; to_date?: string; limit?: number }) {
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('salary_history').select('*, salaries(*), users(*)').eq('employee_id', employeeId)
      if (options?.from_date) query = query.gte('changed_at', options.from_date)
      if (options?.to_date) query = query.lte('changed_at', options.to_date)
      const { data } = await query.order('changed_at', { ascending: false }).limit(options?.limit || 50)
      setHistory(data || [])
    } finally { setIsLoading(false) }
  }, [employeeId, options?.from_date, options?.to_date, options?.limit])
  useEffect(() => { loadData() }, [loadData])
  return { history, isLoading, refresh: loadData }
}

export function useSalaryStructures(options?: { is_active?: boolean }) {
  const [structures, setStructures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('salary_structures').select('*, salary_grades(count)')
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setStructures(data || [])
    } finally { setIsLoading(false) }
  }, [options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { structures, isLoading, refresh: loadData }
}

export function useSalaryGrades(structureId?: string, options?: { is_active?: boolean }) {
  const [grades, setGrades] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('salary_grades').select('*')
      if (structureId) query = query.eq('structure_id', structureId)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('level', { ascending: true })
      setGrades(data || [])
    } finally { setIsLoading(false) }
  }, [structureId, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { grades, isLoading, refresh: loadData }
}

export function useSalaryCalculation(salaryId?: string) {
  const [calculation, setCalculation] = useState<{ baseSalary: number; componentsTotal: number; gross: number; deductionsTotal: number; net: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!salaryId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('salaries').select('base_salary, salary_components(amount), salary_deductions(amount)').eq('id', salaryId).single()
      if (!data) { setCalculation(null); return }
      const componentsTotal = (data.salary_components || []).reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
      const deductionsTotal = (data.salary_deductions || []).reduce((sum: number, d: any) => sum + (d.amount || 0), 0)
      const gross = data.base_salary + componentsTotal
      const net = gross - deductionsTotal
      setCalculation({ baseSalary: data.base_salary, componentsTotal, gross, deductionsTotal, net })
    } finally { setIsLoading(false) }
  }, [salaryId])
  useEffect(() => { loadData() }, [loadData])
  return { calculation, isLoading, refresh: loadData }
}

export function useSalaryStats() {
  const [stats, setStats] = useState<{ totalEmployees: number; averageSalary: number; minSalary: number; maxSalary: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('salaries').select('base_salary').eq('status', 'active')
      const salaries = data || []
      if (salaries.length === 0) { setStats({ totalEmployees: 0, averageSalary: 0, minSalary: 0, maxSalary: 0 }); return }
      const amounts = salaries.map(s => s.base_salary)
      const average = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
      setStats({ totalEmployees: amounts.length, averageSalary: Math.round(average * 100) / 100, minSalary: Math.min(...amounts), maxSalary: Math.max(...amounts) })
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { loadData() }, [loadData])
  return { stats, isLoading, refresh: loadData }
}

