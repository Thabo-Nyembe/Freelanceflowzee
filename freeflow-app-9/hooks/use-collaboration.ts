'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { nanoid } from 'nanoid'
import {
  CollaborationUser,
  CollaborationComment,
  CollaborationEvent,
  CollaborationState,
  CollaborationOptions,
  CollaborationMessage,
  CollaborationApi
} from '@/lib/types/collaboration'

const CURSOR_THROTTLE = 50 // ms
const SELECTION_THROTTLE = 100 // ms
const PRESENCE_INTERVAL = 30000 // ms
const RECONNECT_INTERVAL = 3000 // ms
const MAX_RECONNECT_ATTEMPTS = 5

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#1ABC9C', '#F1C40F', '#E67E22', '#E74C3C'
]

export function useCollaboration({
  projectId, userId, userName, userEmail, userAvatar, onUserJoin, onUserLeave, onCursorMove, onSelectionChange, onComment, onCommentResolved, onReaction, onConnectionStateChange, onError
}: CollaborationOptions): CollaborationApi {
  const [state, setState] = useState<CollaborationState>({
    users: [],
    comments: [],
    events: [],
    isConnected: false,
    isReconnecting: false,
    lastSynced: null
  })

  const supabase = useRef(createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ))

  const channel = useRef<any>(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout>()
  const presenceInterval = useRef<NodeJS.Timeout>()
  const cursorThrottle = useRef<NodeJS.Timeout>()
  const selectionThrottle = useRef<NodeJS.Timeout>()

  const userColor = useRef(
    COLORS[Math.floor(Math.random() * COLORS.length)]
  )

  const connect = useCallback(async () => {
    try {
      channel.current = supabase.current.channel(`project-${projectId}`, {
        config: {
          presence: {
            key: userId
          }
        }
      })

      channel.current
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.current.presenceState()
          const users = Object.values(presenceState).flat().map((p) => ({
            ...p,
            lastActive: new Date().toISOString()
          }))
          setState(prev => ({ ...prev, users }))
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          const newUsers = newUsers.map((p) => ({
            ...p,
            lastActive: new Date().toISOString()
          }))
          setState(prev => ({
            ...prev,
            users: [...prev.users, ...newUsers]
          }))
          newUsers.forEach((user: CollaborationUser) => {
            onUserJoin?.(user)
          })
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          setState(prev => ({
            ...prev,
            users: prev.users.filter(u => 
              !leftPresences.find((p) => p.id === u.id)
            )
          }))
          leftPresences.forEach((user: CollaborationUser) => {
            onUserLeave?.(user)
          })
        })
        .on('broadcast', { event: 'cursor' }, ({ payload }) => {
          setState(prev => ({
            ...prev,
            users: prev.users.map(u => 
              u.id === payload.userId
                ? { ...u, cursor: payload.data }
                : u
            )
          }))
          const user = state.users.find(u => u.id === payload.userId)
          if (user) {
            onCursorMove?.({ ...user, cursor: payload.data })
          }
        })
        .on('broadcast', { event: 'selection' }, ({ payload }) => {
          setState(prev => ({
            ...prev,
            users: prev.users.map(u => 
              u.id === payload.userId
                ? { ...u, selection: payload.data }
                : u
            )
          }))
          const user = state.users.find(u => u.id === payload.userId)
          if (user) {
            onSelectionChange?.({ ...user, selection: payload.data })
          }
        })
        .on('broadcast', { event: 'comment' }, ({ payload }) => {
          setState(prev => ({
            ...prev,
            comments: [...prev.comments, payload.data]
          }))
          onComment?.(payload.data)
        })
        .on('broadcast', { event: 'resolve' }, ({ payload }) => {
          setState(prev => ({
            ...prev,
            comments: prev.comments.map(c => 
              c.id === payload.commentId
                ? { ...c, resolved: true, resolvedBy: payload.userId, resolvedAt: new Date().toISOString() }
                : c
            )
          }))
          const comment = state.comments.find(c => c.id === payload.commentId)
          if (comment) {
            onCommentResolved?.({
              ...comment,
              resolved: true,
              resolvedBy: payload.userId,
              resolvedAt: new Date().toISOString()
            })
          }
        })
        .on('broadcast', { event: 'reaction' }, ({ payload }) => {
          setState(prev => ({
            ...prev,
            comments: prev.comments.map(c => 
              c.id === payload.commentId
                ? {
                    ...c,
                    reactions: {
                      ...c.reactions,
                      [payload.emoji]: payload.add
                        ? [...(c.reactions[payload.emoji] || []), payload.userId]
                        : (c.reactions[payload.emoji] || []).filter(id => id !== payload.userId)
                    }
                  }
                : c
            )
          }))
          onReaction?.(payload.commentId, payload.emoji, payload.userId)
        })

      await channel.current.subscribe(async (status: string) => {
        const isConnected = status === 'SUBSCRIBED'
        setState(prev => ({
          ...prev,
          isConnected,
          isReconnecting: false,
          lastSynced: isConnected ? new Date().toISOString() : prev.lastSynced
        }))
        onConnectionStateChange?.(isConnected)

        if (isConnected) {
          reconnectAttempts.current = 0
          await channel.current.track({
            id: userId,
            name: userName,
            email: userEmail,
            avatar: userAvatar,
            color: userColor.current,
            status: 'online'
          })
        }
      })

      // Start presence heartbeat
      presenceInterval.current = setInterval(async () => {
        if (channel.current && state.isConnected) {
          await channel.current.track({
            id: userId,
            status: 'online',
            lastActive: new Date().toISOString()
          })
        }
      }, PRESENCE_INTERVAL)

    } catch (error) {
      console.error('Collaboration connection error:', error)
      onError?.(error as Error)
      handleReconnect()
    }
  }, [projectId, userId, userName, userEmail, userAvatar])

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
      console.error('Max reconnection attempts reached')
      onError?.(new Error('Failed to reconnect after maximum attempts'))
      return
    }

    setState(prev => ({ ...prev, isReconnecting: true }))
    reconnectAttempts.current++

    reconnectTimeout.current = setTimeout(() => {
      connect()
    }, RECONNECT_INTERVAL)
  }, [connect])

  const disconnect = useCallback(() => {
    if (channel.current) {
      channel.current.unsubscribe()
    }
    if (presenceInterval.current) {
      clearInterval(presenceInterval.current)
    }
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current)
    }
    setState(prev => ({
      ...prev,
      isConnected: false,
      isReconnecting: false
    }))
  }, [])

  const sendMessage = useCallback((message: CollaborationMessage) => {
    if (channel.current && state.isConnected) {
      channel.current.send({
        type: 'broadcast',
        event: message.type,
        payload: {
          userId: message.userId,
          data: message.data
        }
      })
    }
  }, [state.isConnected])

  const updateCursor = useCallback((x: number, y: number) => {
    if (cursorThrottle.current) {
      clearTimeout(cursorThrottle.current)
    }
    cursorThrottle.current = setTimeout(() => {
      sendMessage({
        type: 'cursor',
        userId,
        data: {
          x,
          y,
          timestamp: Date.now()
        }
      })
    }, CURSOR_THROTTLE)
  }, [userId, sendMessage])

  const updateSelection = useCallback((start: number, end: number, blockId: string) => {
    if (selectionThrottle.current) {
      clearTimeout(selectionThrottle.current)
    }
    selectionThrottle.current = setTimeout(() => {
      sendMessage({
        type: 'selection',
        userId,
        data: {
          start,
          end,
          blockId,
          timestamp: Date.now()
        }
      })
    }, SELECTION_THROTTLE)
  }, [userId, sendMessage])

  const addComment = useCallback(async (blockId: string, content: string): Promise<CollaborationComment> => {
    const comment: CollaborationComment = {
      id: nanoid(),
      userId,
      blockId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolved: false,
      replies: [],
      reactions: {}
    }

    sendMessage({
      type: 'comment',
      userId,
      data: comment
    })

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, comment]
    }))

    return comment
  }, [userId, sendMessage])

  const resolveComment = useCallback(async (commentId: string) => {
    sendMessage({
      type: 'resolve',
      userId,
      data: { commentId, userId }
    })

    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c => 
        c.id === commentId
          ? { ...c, resolved: true, resolvedBy: userId, resolvedAt: new Date().toISOString() }
          : c
      )
    }))
  }, [userId, sendMessage])

  const addReaction = useCallback(async (commentId: string, emoji: string) => {
    sendMessage({
      type: 'reaction',
      userId,
      data: { commentId, emoji, userId, add: true }
    })

    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c => 
        c.id === commentId
          ? {
              ...c,
              reactions: {
                ...c.reactions,
                [emoji]: [...(c.reactions[emoji] || []), userId]
              }
            }
          : c
      )
    }))
  }, [userId, sendMessage])

  const removeReaction = useCallback(async (commentId: string, emoji: string) => {
    sendMessage({
      type: 'reaction',
      userId,
      data: { commentId, emoji, userId, add: false }
    })

    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c => 
        c.id === commentId
          ? {
              ...c,
              reactions: {
                ...c.reactions,
                [emoji]: (c.reactions[emoji] || []).filter(id => id !== userId)
              }
            }
          : c
      )
    }))
  }, [userId, sendMessage])

  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    connect,
    disconnect,
    sendMessage,
    updateCursor,
    updateSelection,
    addComment,
    resolveComment,
    addReaction,
    removeReaction,
    getUsers: () => state.users,
    getComments: () => state.comments,
    getEvents: () => state.events,
    isConnected: () => state.isConnected,
    getLastSynced: () => state.lastSynced
  }
} 