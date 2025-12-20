'use client'

/**
 * Extended Standard Hooks - Covers all Standard/Specification tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStandard(standardId?: string) {
  const [standard, setStandard] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!standardId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('standards').select('*').eq('id', standardId).single()
      setStandard(data)
    } finally { setIsLoading(false) }
  }, [standardId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { standard, isLoading, refresh: fetch }
}

export function useStandards(options?: { standardType?: string; category?: string; isMandatory?: boolean; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('standards').select('*')
      if (options?.standardType) query = query.eq('standard_type', options.standardType)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.isMandatory !== undefined) query = query.eq('is_mandatory', options.isMandatory)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('code', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.standardType, options?.category, options?.isMandatory, options?.isActive, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useMandatoryStandards(category?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    setIsLoading(true)
    try {
      let query = supabase.from('standards').select('*').eq('is_mandatory', true).eq('is_active', true)
      if (category) query = query.eq('category', category)
      const { data: result } = await query.order('code', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [category, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useEntityCompliance(entityType?: string, entityId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!entityType || !entityId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('standard_compliance').select('*, standards(*)').eq('entity_type', entityType).eq('entity_id', entityId)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, entityId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
