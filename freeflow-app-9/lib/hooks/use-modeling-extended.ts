'use client'

/**
 * Extended Modeling Hooks - Covers all 10 Modeling-related tables (3D)
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useModelingAnimations(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_animations').select('*').eq('project_id', projectId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingCameras(sceneId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sceneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_cameras').select('*').eq('scene_id', sceneId); setData(result || []) } finally { setIsLoading(false) }
  }, [sceneId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingKeyframes(animationId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!animationId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_keyframes').select('*').eq('animation_id', animationId).order('frame', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [animationId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingLights(sceneId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sceneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_lights').select('*').eq('scene_id', sceneId); setData(result || []) } finally { setIsLoading(false) }
  }, [sceneId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingMaterials(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_materials').select('*').eq('project_id', projectId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingObjectMaterials(objectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!objectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_object_materials').select('*').eq('object_id', objectId); setData(result || []) } finally { setIsLoading(false) }
  }, [objectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingObjects(sceneId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!sceneId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_objects').select('*').eq('scene_id', sceneId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [sceneId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingProjects(userId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!userId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_projects').select('*').eq('user_id', userId).order('updated_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [userId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingRenderJobs(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_render_jobs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}

export function useModelingScenes(projectId?: string) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const fetch = useCallback(async () => {
    if (!projectId) { setIsLoading(false); return }
    setIsLoading(true)
    try { const { data: result } = await supabase.from('modeling_scenes').select('*').eq('project_id', projectId).order('name', { ascending: true }); setData(result || []) } finally { setIsLoading(false) }
  }, [projectId, supabase])
  useEffect(() => { fetch() }, [fetch])
  return { data, isLoading, refresh: fetch }
}
