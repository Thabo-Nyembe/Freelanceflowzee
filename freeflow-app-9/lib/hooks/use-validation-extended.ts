'use client'

/**
 * Extended Validation Hooks - Covers all Validation-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useValidation(validationId?: string) {
  const [validation, setValidation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!validationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('validations').select('*').eq('id', validationId).single()
      setValidation(data)
    } finally { setIsLoading(false) }
  }, [validationId])
  useEffect(() => { loadData() }, [loadData])
  return { validation, isLoading, refresh: loadData }
}

export function useValidations(options?: { validationType?: string; entityType?: string; isActive?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('validations').select('*')
      if (options?.validationType) query = query.eq('validation_type', options.validationType)
      if (options?.entityType) query = query.eq('entity_type', options.entityType)
      if (options?.isActive !== undefined) query = query.eq('is_active', options.isActive)
      const { data: result } = await query.order('field', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [options?.validationType, options?.entityType, options?.isActive])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useEntityValidations(entityType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('validations').select('*').eq('entity_type', entityType).eq('is_active', true).order('field', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useFieldValidations(entityType?: string, field?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType || !field) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('validations').select('*').eq('entity_type', entityType).eq('field', field).eq('is_active', true)
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [entityType, field])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useRequiredFields(entityType?: string) {
  const [fields, setFields] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!entityType) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('validations').select('field').eq('entity_type', entityType).eq('is_active', true).eq('is_required', true)
      setFields(data?.map(v => v.field) || [])
    } finally { setIsLoading(false) }
  }, [entityType])
  useEffect(() => { loadData() }, [loadData])
  return { fields, isLoading, refresh: loadData }
}
