/**
 * AR Collaboration Query Library
 *
 * Comprehensive CRUD operations for AR Collaboration feature:
 * - Sessions (create, read, update, delete, join)
 * - Participants (create, read, update status, position)
 * - Objects (create, read, update, delete, transform)
 * - Interactions (create, read)
 * - Recordings (create, read, update)
 * - Analytics and statistics
 */

import { createClient } from '@/lib/supabase/client'
import { DatabaseError, JsonValue } from '@/lib/types/database'

// ============================================================================
// TYPES
// ============================================================================

export type AREnvironment = 'office' | 'studio' | 'park' | 'abstract' | 'conference' | 'zen'
export type ARDeviceType = 'hololens' | 'quest' | 'arkit' | 'arcore' | 'webxr' | 'browser'
export type ARSessionStatus = 'active' | 'scheduled' | 'ended' | 'archived'
export type ARParticipantStatus = 'connected' | 'away' | 'disconnected'
export type ARObjectType = '3d-model' | 'annotation' | 'whiteboard' | 'screen' | 'marker' | 'portal'
export type ARInteractionType = 'grab' | 'point' | 'gesture' | 'voice' | 'controller'
export type ARQualityLevel = 'low' | 'medium' | 'high' | 'ultra'

export interface ARSession {
  id: string
  user_id: string
  name: string
  description?: string
  host_id: string
  host_name: string
  environment: AREnvironment
  status: ARSessionStatus
  current_participants: number
  max_participants: number
  start_time?: string
  end_time?: string
  duration?: number
  scheduled_time?: string
  is_recording: boolean
  is_locked: boolean
  password?: string
  tags: string[]
  features: Record<string, JsonValue>
  settings: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface ARParticipant {
  id: string
  user_id: string
  session_id: string
  name: string
  avatar?: string
  device: ARDeviceType
  status: ARParticipantStatus
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale: number
  is_muted: boolean
  is_video_enabled: boolean
  is_sharing_screen: boolean
  is_hand_tracking_enabled: boolean
  joined_at: string
  left_at?: string
  latency: number
  bandwidth: number
  fps: number
  quality: ARQualityLevel
  permissions: Record<string, JsonValue>
  created_at: string
  updated_at: string
}

export interface ARObject {
  id: string
  session_id: string
  user_id: string
  type: ARObjectType
  name: string
  position_x: number
  position_y: number
  position_z: number
  rotation_x: number
  rotation_y: number
  rotation_z: number
  scale_x: number
  scale_y: number
  scale_z: number
  color: string
  model_url?: string
  texture_url?: string
  data: Record<string, JsonValue>
  is_locked: boolean
  is_visible: boolean
  is_interactive: boolean
  created_at: string
  updated_at: string
}

export interface ARInteraction {
  id: string
  session_id: string
  user_id: string
  object_id?: string
  type: ARInteractionType
  position_x?: number
  position_y?: number
  position_z?: number
  data: Record<string, JsonValue>
  duration?: number
  created_at: string
}

export interface ARRecording {
  id: string
  session_id: string
  user_id: string
  name: string
  duration: number
  file_url?: string
  file_size?: number
  format: string
  quality: ARQualityLevel
  thumbnail_url?: string
  views: number
  is_public: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// SESSIONS
// ============================================================================

export async function getSessions(
  userId: string,
  filters?: {
    status?: ARSessionStatus
    environment?: AREnvironment
    search?: string
  }
): Promise<{ data: ARSession[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ar_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.status) query = query.eq('status', filters.status)
  if (filters?.environment) query = query.eq('environment', filters.environment)
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  const { data, error } = await query
  return { data, error }
}

export async function getSession(
  sessionId: string
): Promise<{ data: ARSession | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  return { data, error }
}

export async function createSession(
  userId: string,
  session: {
    name: string
    description?: string
    host_name: string
    environment?: AREnvironment
    max_participants?: number
    scheduled_time?: string
    is_locked?: boolean
    password?: string
    tags?: string[]
    features?: Record<string, JsonValue>
    settings?: Record<string, JsonValue>
  }
): Promise<{ data: ARSession | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_sessions')
    .insert({
      user_id: userId,
      host_id: userId,
      ...session
    })
    .select()
    .single()

  return { data, error }
}

export async function updateSession(
  sessionId: string,
  updates: Partial<Omit<ARSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ARSession | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

export async function updateSessionStatus(
  sessionId: string,
  status: ARSessionStatus
): Promise<{ data: ARSession | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_sessions')
    .update({ status })
    .eq('id', sessionId)
    .select()
    .single()

  return { data, error }
}

export async function deleteSession(
  sessionId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ar_sessions')
    .delete()
    .eq('id', sessionId)

  return { error }
}

// ============================================================================
// PARTICIPANTS
// ============================================================================

export async function getParticipants(
  sessionId: string,
  filters?: {
    status?: ARParticipantStatus
  }
): Promise<{ data: ARParticipant[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ar_participants')
    .select('*')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })

  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  return { data, error }
}

export async function createParticipant(
  sessionId: string,
  userId: string,
  participant: {
    name: string
    avatar?: string
    device: ARDeviceType
    position_x?: number
    position_y?: number
    position_z?: number
  }
): Promise<{ data: ARParticipant | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_participants')
    .insert({
      session_id: sessionId,
      user_id: userId,
      ...participant
    })
    .select()
    .single()

  return { data, error }
}

export async function updateParticipantStatus(
  participantId: string,
  status: ARParticipantStatus
): Promise<{ data: ARParticipant | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_participants')
    .update({ status })
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

export async function updateParticipantPosition(
  participantId: string,
  position: {
    position_x?: number
    position_y?: number
    position_z?: number
    rotation_x?: number
    rotation_y?: number
    rotation_z?: number
  }
): Promise<{ data: ARParticipant | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_participants')
    .update(position)
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

export async function toggleParticipantMute(
  participantId: string,
  is_muted: boolean
): Promise<{ data: ARParticipant | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_participants')
    .update({ is_muted })
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

export async function toggleParticipantVideo(
  participantId: string,
  is_video_enabled: boolean
): Promise<{ data: ARParticipant | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_participants')
    .update({ is_video_enabled })
    .eq('id', participantId)
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// AR OBJECTS
// ============================================================================

export async function getARObjects(
  sessionId: string,
  filters?: {
    type?: ARObjectType
    is_visible?: boolean
  }
): Promise<{ data: ARObject[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ar_objects')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.is_visible !== undefined) query = query.eq('is_visible', filters.is_visible)

  const { data, error } = await query
  return { data, error }
}

export async function createARObject(
  sessionId: string,
  userId: string,
  object: {
    type: ARObjectType
    name: string
    position_x?: number
    position_y?: number
    position_z?: number
    rotation_x?: number
    rotation_y?: number
    rotation_z?: number
    scale_x?: number
    scale_y?: number
    scale_z?: number
    color?: string
    model_url?: string
    texture_url?: string
    data?: Record<string, JsonValue>
  }
): Promise<{ data: ARObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_objects')
    .insert({
      session_id: sessionId,
      user_id: userId,
      ...object
    })
    .select()
    .single()

  return { data, error }
}

export async function updateARObject(
  objectId: string,
  updates: Partial<Omit<ARObject, 'id' | 'session_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ARObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_objects')
    .update(updates)
    .eq('id', objectId)
    .select()
    .single()

  return { data, error }
}

export async function updateARObjectTransform(
  objectId: string,
  transform: {
    position?: { x: number; y: number; z: number }
    rotation?: { x: number; y: number; z: number }
    scale?: { x: number; y: number; z: number }
  }
): Promise<{ data: ARObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const updates: Record<string, number> = {}

  if (transform.position) {
    updates.position_x = transform.position.x
    updates.position_y = transform.position.y
    updates.position_z = transform.position.z
  }

  if (transform.rotation) {
    updates.rotation_x = transform.rotation.x
    updates.rotation_y = transform.rotation.y
    updates.rotation_z = transform.rotation.z
  }

  if (transform.scale) {
    updates.scale_x = transform.scale.x
    updates.scale_y = transform.scale.y
    updates.scale_z = transform.scale.z
  }

  const { data, error } = await supabase
    .from('ar_objects')
    .update(updates)
    .eq('id', objectId)
    .select()
    .single()

  return { data, error }
}

export async function toggleARObjectVisibility(
  objectId: string,
  is_visible: boolean
): Promise<{ data: ARObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_objects')
    .update({ is_visible })
    .eq('id', objectId)
    .select()
    .single()

  return { data, error }
}

export async function toggleARObjectLock(
  objectId: string,
  is_locked: boolean
): Promise<{ data: ARObject | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_objects')
    .update({ is_locked })
    .eq('id', objectId)
    .select()
    .single()

  return { data, error }
}

export async function deleteARObject(
  objectId: string
): Promise<{ error: DatabaseError | null }> {
  const supabase = createClient()
  const { error } = await supabase
    .from('ar_objects')
    .delete()
    .eq('id', objectId)

  return { error }
}

// ============================================================================
// INTERACTIONS
// ============================================================================

export async function getInteractions(
  sessionId: string,
  filters?: {
    user_id?: string
    type?: ARInteractionType
  }
): Promise<{ data: ARInteraction[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ar_interactions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.user_id) query = query.eq('user_id', filters.user_id)
  if (filters?.type) query = query.eq('type', filters.type)

  const { data, error } = await query
  return { data, error }
}

export async function createInteraction(
  sessionId: string,
  userId: string,
  interaction: {
    object_id?: string
    type: ARInteractionType
    position_x?: number
    position_y?: number
    position_z?: number
    data?: Record<string, JsonValue>
    duration?: number
  }
): Promise<{ data: ARInteraction | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_interactions')
    .insert({
      session_id: sessionId,
      user_id: userId,
      ...interaction
    })
    .select()
    .single()

  return { data, error }
}

// ============================================================================
// RECORDINGS
// ============================================================================

export async function getRecordings(
  userId: string,
  filters?: {
    session_id?: string
    is_public?: boolean
  }
): Promise<{ data: ARRecording[] | null; error: DatabaseError | null }> {
  const supabase = createClient()
  let query = supabase
    .from('ar_recordings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters?.session_id) query = query.eq('session_id', filters.session_id)
  if (filters?.is_public !== undefined) query = query.eq('is_public', filters.is_public)

  const { data, error } = await query
  return { data, error }
}

export async function createRecording(
  sessionId: string,
  userId: string,
  recording: {
    name: string
    duration?: number
    file_url?: string
    file_size?: number
    format?: string
    quality?: ARQualityLevel
    thumbnail_url?: string
    is_public?: boolean
  }
): Promise<{ data: ARRecording | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_recordings')
    .insert({
      session_id: sessionId,
      user_id: userId,
      ...recording
    })
    .select()
    .single()

  return { data, error }
}

export async function updateRecording(
  recordingId: string,
  updates: Partial<Omit<ARRecording, 'id' | 'session_id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ARRecording | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('ar_recordings')
    .update(updates)
    .eq('id', recordingId)
    .select()
    .single()

  return { data, error }
}

export async function incrementRecordingViews(
  recordingId: string
): Promise<{ data: ARRecording | null; error: DatabaseError | null }> {
  const supabase = createClient()
  const { data, error } = await supabase
    .rpc('increment', { row_id: recordingId })
    .single()

  return { data, error }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getARStats(
  userId: string
): Promise<{
  data: {
    total_sessions: number
    active_sessions: number
    total_participants: number
    total_objects: number
    total_recordings: number
  } | null
  error: DatabaseError | null
}> {
  const supabase = createClient()

  const [sessionsResult, activeResult, objectsResult, recordingsResult] = await Promise.all([
    supabase.from('ar_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ar_sessions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
    supabase.from('ar_objects').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ar_recordings').select('id', { count: 'exact', head: true }).eq('user_id', userId)
  ])

  if (sessionsResult.error || activeResult.error || objectsResult.error || recordingsResult.error) {
    return {
      data: null,
      error: sessionsResult.error || activeResult.error || objectsResult.error || recordingsResult.error
    }
  }

  // Get total participants across all sessions
  const { count: participantsCount } = await supabase
    .from('ar_participants')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  return {
    data: {
      total_sessions: sessionsResult.count || 0,
      active_sessions: activeResult.count || 0,
      total_participants: participantsCount || 0,
      total_objects: objectsResult.count || 0,
      total_recordings: recordingsResult.count || 0
    },
    error: null
  }
}
