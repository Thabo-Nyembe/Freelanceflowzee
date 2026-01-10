'use client'

/**
 * Extended Departments Hooks
 * Tables: departments, department_members, department_budgets, department_goals
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useDepartment(departmentId?: string) {
  const [department, setDepartment] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!departmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('departments').select('*, department_members(*), department_goals(*)').eq('id', departmentId).single(); setDepartment(data) } finally { setIsLoading(false) }
  }, [departmentId])
  useEffect(() => { fetch() }, [fetch])
  return { department, isLoading, refresh: fetch }
}

export function useDepartments(options?: { parent_id?: string; is_active?: boolean; search?: string }) {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('departments').select('*')
      if (options?.parent_id) query = query.eq('parent_id', options.parent_id)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      if (options?.search) query = query.ilike('name', `%${options.search}%`)
      const { data } = await query.order('name', { ascending: true })
      setDepartments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.parent_id, options?.is_active, options?.search, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { departments, isLoading, refresh: fetch }
}

export function useDepartmentMembers(departmentId?: string) {
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!departmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('department_members').select('*, users:user_id(*)').eq('department_id', departmentId); setMembers(data || []) } finally { setIsLoading(false) }
  }, [departmentId])
  useEffect(() => { fetch() }, [fetch])
  return { members, isLoading, refresh: fetch }
}

export function useUserDepartments(userId?: string) {
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('department_members').select('*, departments:department_id(*)').eq('user_id', userId); setDepartments(data || []) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { departments, isLoading, refresh: fetch }
}

export function useDepartmentBudget(departmentId?: string, fiscalYear?: string) {
  const [budget, setBudget] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!departmentId || !fiscalYear) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('department_budgets').select('*').eq('department_id', departmentId).eq('fiscal_year', fiscalYear).single(); setBudget(data) } finally { setIsLoading(false) }
  }, [departmentId, fiscalYear, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { budget, isLoading, refresh: fetch }
}

export function useDepartmentGoals(departmentId?: string, options?: { status?: string }) {
  const [goals, setGoals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!departmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('department_goals').select('*').eq('department_id', departmentId)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false })
      setGoals(data || [])
    } finally { setIsLoading(false) }
  }, [departmentId, options?.status, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { goals, isLoading, refresh: fetch }
}

export function useDepartmentHierarchy() {
  const [hierarchy, setHierarchy] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      const { data } = await supabase.from('departments').select('*').eq('is_active', true).order('name', { ascending: true })
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return items.filter(item => item.parent_id === parentId).map(item => ({ ...item, children: buildTree(items, item.id) }))
      }
      setHierarchy(buildTree(data || []))
    } finally { setIsLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])
  return { hierarchy, isLoading, refresh: fetch }
}

export function useDepartmentStats(departmentId?: string) {
  const [stats, setStats] = useState<{ memberCount: number; activeGoals: number; budgetUtilization: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!departmentId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { count: memberCount } = await supabase.from('department_members').select('*', { count: 'exact', head: true }).eq('department_id', departmentId)
      const { count: activeGoals } = await supabase.from('department_goals').select('*', { count: 'exact', head: true }).eq('department_id', departmentId).eq('status', 'active')
      const { data: budget } = await supabase.from('department_budgets').select('amount, spent').eq('department_id', departmentId).order('fiscal_year', { ascending: false }).limit(1).single()
      const budgetUtilization = budget?.amount && budget.amount > 0 ? ((budget.spent || 0) / budget.amount) * 100 : 0
      setStats({ memberCount: memberCount || 0, activeGoals: activeGoals || 0, budgetUtilization })
    } finally { setIsLoading(false) }
  }, [departmentId])
  useEffect(() => { fetch() }, [fetch])
  return { stats, isLoading, refresh: fetch }
}
