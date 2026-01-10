'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { actionSuccess, actionError, ActionResult } from '@/lib/api/response'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('collaboration-actions')

interface CollaborationSession {
  id: string
  session_name: string
  description?: string
  session_type: string
  access_type?: string
  max_participants?: number
  chat_enabled?: boolean
  video_enabled?: boolean
  audio_enabled?: boolean
  user_id: string
  host_id: string
}

export async function createSession(data: {
  session_name: string
  description?: string
  session_type: string
  access_type?: string
  max_participants?: number
  chat_enabled?: boolean
  video_enabled?: boolean
  audio_enabled?: boolean
}): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to create collaboration session', { error, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Collaboration session created successfully', { sessionId: session.id, userId: user.id })
    return actionSuccess(session, 'Collaboration session created successfully')
  } catch (error) {
    logger.error('Unexpected error creating collaboration session', { error })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function updateSession(id: string, data: any): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: session, error } = await supabase
      .from('collaboration')
      .update(data)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to update collaboration session', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Collaboration session updated successfully', { sessionId: id, userId: user.id })
    return actionSuccess(session, 'Collaboration session updated successfully')
  } catch (error) {
    logger.error('Unexpected error updating collaboration session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function deleteSession(id: string): Promise<ActionResult<void>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { error } = await supabase
      .from('collaboration')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      logger.error('Failed to delete collaboration session', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Collaboration session deleted successfully', { sessionId: id, userId: user.id })
    return actionSuccess(undefined, 'Collaboration session deleted successfully')
  } catch (error) {
    logger.error('Unexpected error deleting collaboration session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function joinSession(id: string, userId: string, role: string = 'viewer'): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('collaboration')
      .select('participants, participant_count, active_participants, max_participants')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch session for joining', { error: fetchError, sessionId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Session not found for joining', { sessionId: id })
      return actionError('Session not found', 'NOT_FOUND')
    }

    const participants = current.participants || []
    const participantCount = (current.participant_count || 0) + 1
    const activeParticipants = (current.active_participants || 0) + 1

    // Check max participants limit
    if (current.max_participants && activeParticipants > current.max_participants) {
      logger.warn('Session is full', { sessionId: id, maxParticipants: current.max_participants })
      return actionError('Session is full', 'VALIDATION_ERROR')
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

    if (error) {
      logger.error('Failed to join session', { error, sessionId: id, userId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('User joined session successfully', { sessionId: id, userId, role })
    return actionSuccess(session, 'Joined session successfully')
  } catch (error) {
    logger.error('Unexpected error joining session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function leaveSession(id: string, userId: string): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('collaboration')
      .select('participants, active_participants')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch session for leaving', { error: fetchError, sessionId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Session not found for leaving', { sessionId: id })
      return actionError('Session not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to leave session', { error, sessionId: id, userId })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('User left session successfully', { sessionId: id, userId })
    return actionSuccess(session, 'Left session successfully')
  } catch (error) {
    logger.error('Unexpected error leaving session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function sendMessage(id: string, message: {
  content: string
  sender_id: string
  sender_name: string
}): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('collaboration')
      .select('chat_messages, message_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch session for message', { error: fetchError, sessionId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Session not found for message', { sessionId: id })
      return actionError('Session not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to send message', { error, sessionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Message sent successfully', { sessionId: id, senderId: message.sender_id })
    return actionSuccess(session, 'Message sent successfully')
  } catch (error) {
    logger.error('Unexpected error sending message', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function addComment(id: string, comment: {
  content: string
  user_id: string
  user_name: string
  position?: any
}): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('collaboration')
      .select('comments, comment_count')
      .eq('id', id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch session for comment', { error: fetchError, sessionId: id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Session not found for comment', { sessionId: id })
      return actionError('Session not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to add comment', { error, sessionId: id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Comment added successfully', { sessionId: id, userId: comment.user_id })
    return actionSuccess(session, 'Comment added successfully')
  } catch (error) {
    logger.error('Unexpected error adding comment', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startSession(id: string): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to start session', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Session started successfully', { sessionId: id, userId: user.id })
    return actionSuccess(session, 'Session started successfully')
  } catch (error) {
    logger.error('Unexpected error starting session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function endSession(id: string): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: current, error: fetchError } = await supabase
      .from('collaboration')
      .select('started_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      logger.error('Failed to fetch session for ending', { error: fetchError, sessionId: id, userId: user.id })
      return actionError(fetchError.message, 'DATABASE_ERROR')
    }

    if (!current) {
      logger.warn('Session not found for ending', { sessionId: id, userId: user.id })
      return actionError('Session not found', 'NOT_FOUND')
    }

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

    if (error) {
      logger.error('Failed to end session', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Session ended successfully', { sessionId: id, duration: durationSeconds, userId: user.id })
    return actionSuccess(session, 'Session ended successfully')
  } catch (error) {
    logger.error('Unexpected error ending session', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function startRecording(id: string): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

    const { data: session, error } = await supabase
      .from('collaboration')
      .update({
        is_recording: true
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      logger.error('Failed to start recording', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Recording started successfully', { sessionId: id, userId: user.id })
    return actionSuccess(session, 'Recording started successfully')
  } catch (error) {
    logger.error('Unexpected error starting recording', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}

export async function stopRecording(id: string, recordingUrl: string, recordingSize: number): Promise<ActionResult<CollaborationSession>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return actionError('Not authenticated', 'UNAUTHORIZED')

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

    if (error) {
      logger.error('Failed to stop recording', { error, sessionId: id, userId: user.id })
      return actionError(error.message, 'DATABASE_ERROR')
    }

    revalidatePath('/dashboard/collaboration-v2')
    logger.info('Recording stopped successfully', { sessionId: id, recordingSize, userId: user.id })
    return actionSuccess(session, 'Recording stopped successfully')
  } catch (error) {
    logger.error('Unexpected error stopping recording', { error, sessionId: id })
    return actionError('An unexpected error occurred', 'INTERNAL_ERROR')
  }
}
