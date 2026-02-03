'use client'

/**
 * Extended Menus Hooks
 * Tables: menus, menu_items, menu_categories, menu_modifiers, menu_prices, menu_availability
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useMenu(menuId?: string) {
  const [menu, setMenu] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menus').select('*, menu_items(*), menu_categories(*)').eq('id', menuId).single(); setMenu(data) } finally { setIsLoading(false) }
  }, [menuId])
  useEffect(() => { loadData() }, [loadData])
  return { menu, isLoading, refresh: loadData }
}

export function useMenus(organizationId?: string, options?: { type?: string; is_active?: boolean }) {
  const [menus, setMenus] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!organizationId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('menus').select('*').eq('organization_id', organizationId)
      if (options?.type) query = query.eq('type', options.type)
      if (options?.is_active !== undefined) query = query.eq('is_active', options.is_active)
      const { data } = await query.order('name', { ascending: true })
      setMenus(data || [])
    } finally { setIsLoading(false) }
  }, [organizationId, options?.type, options?.is_active])
  useEffect(() => { loadData() }, [loadData])
  return { menus, isLoading, refresh: loadData }
}

export function useMenuItems(menuId?: string, options?: { category_id?: string; is_available?: boolean }) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('menu_items').select('*, menu_categories(*), menu_modifiers(*), menu_prices(*)').eq('menu_id', menuId)
      if (options?.category_id) query = query.eq('category_id', options.category_id)
      if (options?.is_available !== undefined) query = query.eq('is_available', options.is_available)
      const { data } = await query.order('sort_order', { ascending: true })
      setItems(data || [])
    } finally { setIsLoading(false) }
  }, [menuId, options?.category_id, options?.is_available])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}

export function useMenuItem(itemId?: string) {
  const [item, setItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_items').select('*, menu_categories(*), menu_modifiers(*), menu_prices(*), menu_availability(*)').eq('id', itemId).single(); setItem(data) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { item, isLoading, refresh: loadData }
}

export function useMenuCategories(menuId?: string) {
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_categories').select('*').eq('menu_id', menuId).order('sort_order', { ascending: true }); setCategories(data || []) } finally { setIsLoading(false) }
  }, [menuId])
  useEffect(() => { loadData() }, [loadData])
  return { categories, isLoading, refresh: loadData }
}

export function useItemModifiers(itemId?: string) {
  const [modifiers, setModifiers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_modifiers').select('*').eq('item_id', itemId); setModifiers(data || []) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { modifiers, isLoading, refresh: loadData }
}

export function useItemPrices(itemId?: string) {
  const [prices, setPrices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_prices').select('*').eq('item_id', itemId); setPrices(data || []) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { prices, isLoading, refresh: loadData }
}

export function useItemAvailability(itemId?: string) {
  const [availability, setAvailability] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!itemId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_availability').select('*').eq('item_id', itemId).single(); setAvailability(data) } finally { setIsLoading(false) }
  }, [itemId])
  useEffect(() => { loadData() }, [loadData])
  return { availability, isLoading, refresh: loadData }
}

export function useMenuWithItems(menuId?: string) {
  const [menu, setMenu] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const [menuRes, itemsRes, categoriesRes] = await Promise.all([
        supabase.from('menus').select('*').eq('id', menuId).single(),
        supabase.from('menu_items').select('*, menu_modifiers(*), menu_prices(*)').eq('menu_id', menuId).order('sort_order', { ascending: true }),
        supabase.from('menu_categories').select('*').eq('menu_id', menuId).order('sort_order', { ascending: true })
      ])
      setMenu(menuRes.data)
      setItems(itemsRes.data || [])
      setCategories(categoriesRes.data || [])
    } finally { setIsLoading(false) }
  }, [menuId])
  useEffect(() => { loadData() }, [loadData])
  return { menu, items, categories, isLoading, refresh: loadData }
}

export function useAvailableItems(menuId?: string) {
  const [items, setItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const loadData = useCallback(async () => {
  const supabase = createClient()
    if (!menuId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data } = await supabase.from('menu_items').select('*, menu_categories(*), menu_modifiers(*)').eq('menu_id', menuId).eq('is_available', true).order('sort_order', { ascending: true }); setItems(data || []) } finally { setIsLoading(false) }
  }, [menuId])
  useEffect(() => { loadData() }, [loadData])
  return { items, isLoading, refresh: loadData }
}
