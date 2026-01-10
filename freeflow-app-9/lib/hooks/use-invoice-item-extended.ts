'use client'

/**
 * Extended Invoice Item Hooks - Covers all Invoice Item-related tables
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useInvoiceItems(invoiceId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('invoice_items').select('*').eq('invoice_id', invoiceId).order('sort_order', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useInvoiceItemTotal(invoiceId?: string) {
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!invoiceId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('invoice_items').select('quantity, unit_price, discount, tax_amount').eq('invoice_id', invoiceId)
      const sum = data?.reduce((acc, item) => {
        const itemTotal = (item.quantity * item.unit_price) - (item.discount || 0) + (item.tax_amount || 0)
        return acc + itemTotal
      }, 0) || 0
      setTotal(sum)
    } finally { setIsLoading(false) }
  }, [invoiceId])
  useEffect(() => { fetch() }, [fetch])
  return { total, isLoading, refresh: fetch }
}

export function useLineItems(parentId?: string, parentType?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('line_items').select('*').order('sort_order', { ascending: true })
      if (parentId) query = query.eq('parent_id', parentId)
      if (parentType) query = query.eq('parent_type', parentType)
      const { data: result } = await query
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [parentId, parentType, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
