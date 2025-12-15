'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createSession(data: {
  session_name: string
  description?: string
  session_type: string
  access_type?: string
  max_participants?: number
  chat_enabled?: boolean
  video_enabled?: boolean
  audio_enabled?: boolean
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Generate access code for invite-only sessions
  const accessCode = `${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/collaborate/${accessCode}`

  const { data: session, error } = await supabase
    .from('collaboration')
    .insert([{
      ...data,
      user_id: user.id,
      host_id: user.id,
      access_code: accessCode,
      invite_link: inviteLink
    }])
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function updateSession(id: string, data: any) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('collaboration')
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function deleteSession(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('collaboration')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
}

export async function joinSession(id: string, userId: string, role: string = 'viewer') {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('collaboration')
    .select('participants, participant_count, active_participants, max_participants')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Session not found')

  const participants = current.participants || []
  const participantCount = (current.participant_count || 0) + 1
  const activeParticipants = (current.active_participants || 0) + 1

  // Check max participants limit
  if (current.max_participants && activeParticipants > current.max_participants) {
    throw new Error('Session is full')
  }

  const newParticipant = {
    user_id: userId,
    role,
    joined_at: new Date().toISOString(),
    is_active: true
  }

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      participants: [...participants, newParticipant],
      participant_count: participantCount,
      active_participants: activeParticipants,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function leaveSession(id: string, userId: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('collaboration')
    .select('participants, active_participants')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Session not found')

  const participants = (current.participants || []).map((p: any) => {
    if (p.user_id === userId) {
      return { ...p, is_active: false, left_at: new Date().toISOString() }
    }
    return p
  })

  const activeParticipants = Math.max(0, (current.active_participants || 0) - 1)

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      participants,
      active_participants: activeParticipants,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function sendMessage(id: string, message: {
  content: string
  sender_id: string
  sender_name: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('collaboration')
    .select('chat_messages, message_count')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Session not found')

  const chatMessages = current.chat_messages || []
  const newMessage = {
    ...message,
    timestamp: new Date().toISOString(),
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      chat_messages: [...chatMessages, newMessage],
      message_count: (current.message_count || 0) + 1,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function addComment(id: string, comment: {
  content: string
  user_id: string
  user_name: string
  position?: any
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('collaboration')
    .select('comments, comment_count')
    .eq('id', id)
    .single()

  if (!current) throw new Error('Session not found')

  const comments = current.comments || []
  const newComment = {
    ...comment,
    timestamp: new Date().toISOString(),
    id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      comments: [...comments, newComment],
      comment_count: (current.comment_count || 0) + 1,
      total_comments: (current.comment_count || 0) + 1,
      last_activity_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function startSession(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      is_active: true,
      started_at: new Date().toISOString(),
      status: 'in_progress'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function endSession(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('collaboration')
    .select('started_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!current) throw new Error('Session not found')

  const endedAt = new Date()
  const startedAt = current.started_at ? new Date(current.started_at) : endedAt
  const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      is_active: false,
      ended_at: endedAt.toISOString(),
      duration_seconds: durationSeconds,
      status: 'ended'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function startRecording(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      is_recording: true
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}

export async function stopRecording(id: string, recordingUrl: string, recordingSize: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: session, error } = await supabase
    .from('collaboration')
    .update({
      is_recording: false,
      recording_url: recordingUrl,
      recording_size_bytes: recordingSize
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/collaboration-v2')
  return session
}
