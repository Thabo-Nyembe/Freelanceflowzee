import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useUser } from '@/lib/hooks/use-auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface User {
  id: string
  name: string
  avatar?: string
}

interface CursorPosition {
  x: number
  y: number
}

interface Selection {
  start: number
  end: number
}

interface Comment {
  id: string
  userId: string
  content: string
  timestamp: number
  resolved?: boolean
}

interface CollaborationState {
  users: User[]
  cursors: Record<string, CursorPosition>
  selections: Record<string, Selection>
  comments: Comment[]
}

export function useCollaboration(documentId: string) {
  const { user } = useUser()
  const [state, setState] = useState<CollaborationState>({
    users: [],
    cursors: {},
    selections: {},
    comments: [],
  })
  const [isConnected, setIsConnected] = useState(false)

  // Set up real-time subscription
  useEffect(() => {
    if (!documentId || !user) return

    // Subscribe to presence changes
    const presenceChannel = supabase.channel(`presence:${documentId}`)

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState()
        const users = Object.values(state).flat().map((p: any) => ({
          id: p.user_id,
          name: p.username,
          avatar: p.avatar_url,
        }))
        setState(prev => ({ ...prev, users }))
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const newUser = newPresences[0]
        setState(prev => ({
          ...prev,
          users: [...prev.users, {
            id: newUser.user_id,
            name: newUser.username,
            avatar: newUser.avatar_url,
          }],
        }))
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const leftUser = leftPresences[0]
        setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== leftUser.user_id),
          cursors: { ...prev.cursors, [leftUser.user_id]: undefined },
          selections: { ...prev.selections, [leftUser.user_id]: undefined },
        }))
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            user_id: user.id,
            username: user.name,
            avatar_url: user.avatar,
          })
          setIsConnected(true)
        }
      })

    // Subscribe to cursor movements
    const cursorChannel = supabase.channel(`cursors:${documentId}`)

    cursorChannel
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setState(prev => ({
          ...prev,
          cursors: {
            ...prev.cursors,
            [payload.userId]: payload.position,
          },
        }))
      })
      .subscribe()

    // Subscribe to selections
    const selectionChannel = supabase.channel(`selections:${documentId}`)

    selectionChannel
      .on('broadcast', { event: 'selection' }, ({ payload }) => {
        setState(prev => ({
          ...prev,
          selections: {
            ...prev.selections,
            [payload.userId]: payload.selection,
          },
        }))
      })
      .subscribe()

    // Subscribe to comments
    const commentChannel = supabase.channel(`comments:${documentId}`)

    commentChannel
      .on('broadcast', { event: 'comment' }, ({ payload }) => {
        setState(prev => ({
          ...prev,
          comments: [...prev.comments, payload],
        }))
      })
      .subscribe()

    return () => {
      presenceChannel.unsubscribe()
      cursorChannel.unsubscribe()
      selectionChannel.unsubscribe()
      commentChannel.unsubscribe()
      setIsConnected(false)
    }
  }, [documentId, user])

  const updateCursor = useCallback(async (position: CursorPosition) => {
    if (!isConnected || !user) return

    await supabase.channel(`cursors:${documentId}`).send({
      type: 'broadcast',
      event: 'cursor',
      payload: {
        userId: user.id,
        position,
      },
    })
  }, [documentId, isConnected, user])

  const updateSelection = useCallback(async (selection: Selection) => {
    if (!isConnected || !user) return

    await supabase.channel(`selections:${documentId}`).send({
      type: 'broadcast',
      event: 'selection',
      payload: {
        userId: user.id,
        selection,
      },
    })
  }, [documentId, isConnected, user])

  const addComment = useCallback(async (content: string) => {
    if (!isConnected || !user) return

    const comment: Comment = {
      id: crypto.randomUUID(),
      userId: user.id,
      content,
      timestamp: Date.now(),
    }

    await supabase.channel(`comments:${documentId}`).send({
      type: 'broadcast',
      event: 'comment',
      payload: comment,
    })

    setState(prev => ({
      ...prev,
      comments: [...prev.comments, comment],
    }))
  }, [documentId, isConnected, user])

  const resolveComment = useCallback(async (commentId: string) => {
    if (!isConnected || !user) return

    setState(prev => ({
      ...prev,
      comments: prev.comments.map(c =>
        c.id === commentId ? { ...c, resolved: true } : c
      ),
    }))
  }, [isConnected, user])

  return {
    state,
    isConnected,
    updateCursor,
    updateSelection,
    addComment,
    resolveComment,
  }
} 