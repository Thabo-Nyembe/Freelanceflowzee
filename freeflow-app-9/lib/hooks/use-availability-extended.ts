'use client'

/**
 * Extended Availability Hooks - Covers all Availability-related tables
 * Tables: availability_schedules
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useAvailabilitySchedule(scheduleId?: string) {
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('availability_schedules').select('*').eq('id', scheduleId).single()
      setSchedule(data)
    } finally { setIsLoading(false) }
  }, [scheduleId])
  useEffect(() => { fetch() }, [fetch])
  return { schedule, isLoading, refresh: fetch }
}

export function useAvailabilitySchedules(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: result } = await supabase.from('availability_schedules').select('*').eq('user_id', userId).order('is_default', { ascending: false })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useDefaultAvailability(userId?: string) {
  const [schedule, setSchedule] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data } = await supabase.from('availability_schedules').select('*').eq('user_id', userId).eq('is_default', true).single()
      setSchedule(data)
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { schedule, isLoading, refresh: fetch }
}

export function useAvailabilityCheck(userId?: string, dateTime?: Date) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const check = useCallback(async () => {
    if (!userId || !dateTime) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: schedule } = await supabase.from('availability_schedules').select('schedule, timezone').eq('user_id', userId).eq('is_default', true).single()
      if (!schedule) { setIsAvailable(true); return }
      const dayOfWeek = dateTime.getDay()
      const timeString = dateTime.toTimeString().slice(0, 5)
      const daySchedule = schedule.schedule?.find((s: any) => s.day === dayOfWeek)
      if (!daySchedule || !daySchedule.is_available) { setIsAvailable(false); return }
      setIsAvailable(timeString >= daySchedule.start_time && timeString <= daySchedule.end_time)
    } finally { setIsLoading(false) }
  }, [userId, dateTime, supabase])
  useEffect(() => { check() }, [check])
  return { isAvailable, isLoading, recheck: check }
}

export function useAvailableSlots(userId?: string, date?: string, duration?: number) {
  const [slots, setSlots] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId || !date) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: schedule } = await supabase.from('availability_schedules').select('schedule, timezone').eq('user_id', userId).eq('is_default', true).single()
      if (!schedule) { setSlots([]); return }
      const targetDate = new Date(date)
      const dayOfWeek = targetDate.getDay()
      const daySchedule = schedule.schedule?.find((s: any) => s.day === dayOfWeek)
      if (!daySchedule || !daySchedule.is_available) { setSlots([]); return }
      const result: string[] = []
      let currentTime = daySchedule.start_time
      const slotDuration = duration || 30
      while (currentTime < daySchedule.end_time) {
        result.push(currentTime)
        const [hours, minutes] = currentTime.split(':').map(Number)
        const newMinutes = minutes + slotDuration
        const newHours = hours + Math.floor(newMinutes / 60)
        currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes % 60).padStart(2, '0')}`
      }
      setSlots(result)
    } finally { setIsLoading(false) }
  }, [userId, date, duration, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { slots, isLoading, refresh: fetch }
}

export function useAvailabilityExceptions(scheduleId?: string, options?: { startDate?: string; endDate?: string }) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!scheduleId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      let query = supabase.from('availability_exceptions').select('*').eq('schedule_id', scheduleId)
      if (options?.startDate) query = query.gte('date', options.startDate)
      if (options?.endDate) query = query.lte('date', options.endDate)
      const { data: result } = await query.order('date', { ascending: true })
      setData(result || [])
    } finally { setIsLoading(false) }
  }, [scheduleId, options?.startDate, options?.endDate, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useWeeklyAvailability(userId?: string) {
  const [weeklySchedule, setWeeklySchedule] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const fetch = useCallback(async () => {
  const supabase = createClient()
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try {
      const { data: schedule } = await supabase.from('availability_schedules').select('schedule').eq('user_id', userId).eq('is_default', true).single()
      setWeeklySchedule(schedule?.schedule || [])
    } finally { setIsLoading(false) }
  }, [userId])
  useEffect(() => { fetch() }, [fetch])
  return { weeklySchedule, isLoading, refresh: fetch }
}
