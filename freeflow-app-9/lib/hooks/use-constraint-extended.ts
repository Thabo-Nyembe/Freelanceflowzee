'use client'

/**
 * Extended Constraint Hooks - Covers all Constraint-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useConstraint(constraintId?: string) {
  const [constraint, setConstraint] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!constraintId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('constraints').select('*').eq('id', constraintId).single()
      setConstraint(data)
    } finally { setIsLoading(false) }
  }, [constraintId])
  useEffect(() => { loadData() }, [loadData])
  return { constraint, isLoading, refresh: loadData }
}

export function useConstraints(options?: { constraintType?: string; entityType?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('constraints').select('*')
      if (options?.constraintType) query = query.eq('constraint_type', options.constraintType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.constraintType, options?.entityType, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useEntityConstraints(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('constraints').select('*').eq('entity_type', entityType).eq('is_active', true).order('name', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useBlockingConstraints(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('constraints').select('*').eq('entity_type', entityType).eq('is_active', true).eq('is_blocking', true)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
