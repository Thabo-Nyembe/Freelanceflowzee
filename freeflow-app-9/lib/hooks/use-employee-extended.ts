'use client'

/**
 * Extended Employee Hooks - Covers all Employee-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useEmployees(organizationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('employees').select('*').eq('organization_id', organizationId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [organizationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEmployeeRecords(employeeId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!employeeId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('employee_records').select('*').eq('employee_id', employeeId).order('date', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [employeeId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
