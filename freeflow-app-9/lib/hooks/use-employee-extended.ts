'use client'

/**
 * Extended Employee Hooks - Covers all Employee-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// Demo mode detection
function isDemoModeEnabled(): boolean {
  if (typeof window === 'undefined') return false
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('demo') === 'true') return true
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'demo_mode' && value === 'true') return true
  }
  return false
}

export function useEmployees(organizationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('employees').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [organizationId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useEmployeeRecords(employeeId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
    // Demo mode: fetch data with demo=true parameter
  const supabase = createClient()
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('employee_records').select('*').eq('employee_id', employeeId).order('date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [employeeId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
