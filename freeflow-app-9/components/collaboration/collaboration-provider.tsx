'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode
} from 'react'
import { useCollaboration } from '@/hooks/use-collaboration'
import { Cursor } from './cursor'
import { Selection } from './selection'
import { Comments } from './comments'
import { Presence } from './presence'
import {
  CollaborationUser,
  CollaborationComment,
  CollaborationApi
} from '@/lib/types/collaboration'
import { toast } from 'sonner'

interface CollaborationContextValue {
  users: CollaborationUser[]
  comments: CollaborationComment[]
  isConnected: boolean
  lastSynced: string | null
  api: CollaborationApi | null
}

const CollaborationContext = createContext<CollaborationContextValue>({
  users: [],
  comments: [],
  isConnected: false,
  lastSynced: null,
  api: null
})

interface CollaborationProviderProps {
  projectId: string
  currentUser: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  children: ReactNode
}

export function CollaborationProvider({
  projectId,
  currentUser,
  children
}: CollaborationProviderProps) {
  const [users, setUsers] = useState<CollaborationUser[]>([])
  const [comments, setComments] = useState<CollaborationComment[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  const blockRefs = useRef<{ [key: string]: HTMLElement }>({})

  const api = useCollaboration({
    projectId,
    userId: currentUser.id,
    userName: currentUser.name,
    userEmail: currentUser.email,
    userAvatar: currentUser.avatar,
    onUserJoin: (user) => {
      toast.success(`${user.name} joined the project`)
      setUsers(prev => [...prev, user])
    },
    onUserLeave: (user) => {
      toast.info(`${user.name} left the project`)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    },
    onCursorMove: (user) => {
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, cursor: user.cursor } : u))
      )
    },
    onSelectionChange: (user) => {
      setUsers(prev =>
        prev.map(u => (u.id === user.id ? { ...u, selection: user.selection } : u))
      )
    },
    onComment: (comment) => {
      setComments(prev => [...prev, comment])
    },
    onCommentResolved: (comment) => {
      setComments(prev =>
        prev.map(c =>
          c.id === comment.id
            ? { ...c, resolved: true, resolvedBy: comment.resolvedBy, resolvedAt: comment.resolvedAt }
            : c
        )
      )
    },
    onReaction: (commentId, emoji, userId) => {
      setComments(prev =>
        prev.map(c =>
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
      )
    },
    onConnectionStateChange: (connected) => {
      setIsConnected(connected)
      if (connected) {
        toast.success('Connected to collaboration server')
      } else {
        toast.error('Disconnected from collaboration server')
      }
    },
    onError: (error) => {
      toast.error('Collaboration error: ' + error.message)
    }
  })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!api) return
      api.updateCursor(e.clientX, e.clientY)
    }

    const handleSelectionChange = () => {
      if (!api) return
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) return

      const range = selection.getRangeAt(0)
      const blockId = Object.entries(blockRefs.current).find(([_, element]) =>
        element.contains(range.commonAncestorContainer)
      )?.[0]

      if (blockId) {
        api.updateSelection(range.startOffset, range.endOffset, blockId)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('selectionchange', handleSelectionChange)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [api])

  const registerBlockRef = (blockId: string, element: HTMLElement) => {
    blockRefs.current[blockId] = element
  }

  const unregisterBlockRef = (blockId: string) => {
    delete blockRefs.current[blockId]
  }

  return (
    <CollaborationContext.Provider
      value={{
        users,
        comments,
        isConnected,
        lastSynced,
        api
      }}
    >
      {/* Remote Cursors */}
      {users
        .filter(user => user.id !== currentUser.id)
        .map(user => (
          <Cursor key={user.id} user={user} />
        ))}

      {/* Remote Selections */}
      {users
        .filter(user => user.id !== currentUser.id && user.selection)
        .map(user => (
          <Selection
            key={user.id}
            user={user}
            blockElement={blockRefs.current[user.selection!.blockId]}
          />
        ))}

      {children}

      {/* Comments Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l p-4 overflow-y-auto">
        <div className="mb-4">
          <Presence users={users} />
        </div>
        <Comments
          comments={comments}
          users={users}
          currentUser={users.find(u => u.id === currentUser.id)!}
          onAddComment={async (blockId, content) => {
            if (!api) return
            await api.addComment(blockId, content)
          }}
          onResolveComment={async (commentId) => {
            if (!api) return
            await api.resolveComment(commentId)
          }}
          onAddReaction={async (commentId, emoji) => {
            if (!api) return
            await api.addReaction(commentId, emoji)
          }}
          onRemoveReaction={async (commentId, emoji) => {
            if (!api) return
            await api.removeReaction(commentId, emoji)
          }}
        />
      </div>
    </CollaborationContext.Provider>
  )
}

export function useCollaborationContext() {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error('useCollaborationContext must be used within a CollaborationProvider')
  }
  return context
}

export function withCollaboration<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & CollaborationProviderProps> {
  return function WrappedComponent({
    projectId,
    currentUser,
    ...props
  }: P & CollaborationProviderProps) {
    return (
      <CollaborationProvider projectId={projectId} currentUser={currentUser}>
        <Component {...(props as P)} />
      </CollaborationProvider>
    )
  }
} 