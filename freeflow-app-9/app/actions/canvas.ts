'use server'
import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { Canvas } from '@/lib/hooks/use-canvas'

export async function createCanvas(data: Partial<Canvas>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas, error } = await supabase
    .from('canvas')
    .insert({
      ...data,
      user_id: user.id,
      canvas_data: data.canvas_data || {}
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return canvas
}

export async function updateCanvas(id: string, data: Partial<Canvas>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas, error } = await supabase
    .from('canvas')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return canvas
}

export async function deleteCanvas(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('canvas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
}

export async function autoSaveCanvas(id: string, canvasData: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas, error } = await supabase
    .from('canvas')
    .update({
      canvas_data: canvasData,
      last_auto_saved_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  return canvas
}

export async function shareCanvas(id: string, userEmail: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas } = await supabase
    .from('canvas')
    .select('shared_with')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!canvas) throw new Error('Canvas not found')

  const sharedWith = Array.isArray(canvas.shared_with) ? canvas.shared_with : []
  if (!sharedWith.includes(userEmail)) {
    sharedWith.push(userEmail)
  }

  const { data: updatedCanvas, error } = await supabase
    .from('canvas')
    .update({
      shared_with: sharedWith,
      is_shared: true
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return updatedCanvas
}

export async function publishCanvas(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas, error } = await supabase
    .from('canvas')
    .update({
      is_published: true,
      published_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return canvas
}

export async function addCanvasObject(id: string, object: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas } = await supabase
    .from('canvas')
    .select('objects, object_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!canvas) throw new Error('Canvas not found')

  const objects = Array.isArray(canvas.objects) ? canvas.objects : []
  objects.push(object)

  const { data: updatedCanvas, error } = await supabase
    .from('canvas')
    .update({
      objects: objects,
      object_count: objects.length
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return updatedCanvas
}

export async function updateCanvasLayer(id: string, layerIndex: number, layerData: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas } = await supabase
    .from('canvas')
    .select('layers')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!canvas) throw new Error('Canvas not found')

  const layers = Array.isArray(canvas.layers) ? canvas.layers : []
  layers[layerIndex] = layerData

  const { data: updatedCanvas, error } = await supabase
    .from('canvas')
    .update({
      layers: layers,
      layer_count: layers.length
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return updatedCanvas
}

export async function lockCanvas(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: canvas, error } = await supabase
    .from('canvas')
    .update({
      status: 'locked'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/dashboard/canvas-v2')
  return canvas
}
