'use client'

/**
 * Extended Stripe Hooks
 * Tables: stripe_customers, stripe_subscriptions, stripe_invoices, stripe_payments
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useStripeCustomer(customerId?: string) {
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!customerId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stripe_customers').select('*').eq('id', customerId).single(); setCustomer(data) } finally { setIsLoading(false) }
  }, [customerId])
  useEffect(() => { fetch() }, [fetch])
  return { customer, isLoading, refresh: fetch }
}

export function useStripeCustomerByUser(userId?: string) {
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('stripe_customers').select('*').eq('user_id', userId).single(); setCustomer(data) } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { customer, isLoading, refresh: fetch }
}

export function useStripeSubscriptions(options?: { customer_id?: string; status?: string; limit?: number }) {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stripe_subscriptions').select('*')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setSubscriptions(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { subscriptions, isLoading, refresh: fetch }
}

export function useStripeInvoices(options?: { customer_id?: string; status?: string; limit?: number }) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stripe_invoices').select('*')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setInvoices(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { invoices, isLoading, refresh: fetch }
}

export function useStripePayments(options?: { customer_id?: string; status?: string; limit?: number }) {
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    setIsLoading(true)
    try {
      let query = supabase.from('stripe_payments').select('*')
      if (options?.customer_id) query = query.eq('customer_id', options.customer_id)
      if (options?.status) query = query.eq('status', options.status)
      const { data } = await query.order('created_at', { ascending: false }).limit(options?.limit || 50)
      setPayments(data || [])
    } finally { setIsLoading(false) }
  }, [options?.customer_id, options?.status, options?.limit, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { payments, isLoading, refresh: fetch }
}
