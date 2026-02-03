'use client'

/**
 * Extended Contact Hooks - Covers all Contact-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useContacts(userId?: string, contactType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('contacts').select('*').order('name', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      if (contactType) query = query.eq('contact_type', contactType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId, contactType])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useContactGroups(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('contact_groups').select('*').order('name', { ascending: true })
      if (userId) query = query.eq('user_id', userId)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}

export function useContactFormSubmissions(formId?: string, status?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('contact_form_submissions').select('*').order('created_at', { ascending: false })
      if (formId) query = query.eq('form_id', formId)
      if (status) query = query.eq('status', status)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [formId, status])
  useEffect(() => { loadData() }, [loadData])
  return { data, isLoading, refresh: loadData }
}
