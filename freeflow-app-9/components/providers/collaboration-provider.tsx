'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react'
import { useCollaboration } from '@/lib/hooks/collaboration/use-collaboration'
import { CursorOverlay } from '@/components/collaboration/cursor-overlay'
import { SelectionOverlay } from '@/components/collaboration/selection-overlay'
import { CommentThread } from '@/components/collaboration/comment-thread'
import { UserPresence } from '@/components/collaboration/user-presence'

interface CollaborationContextValue {
  documentId: string
  state: ReturnType<typeof useCollaboration>['state']
  isConnected: boolean
  updateCursor: (position: { x: number; y: number }) => void
  updateSelection: (selection: { start: number; end: number }) => void
  addComment: (content: string) => void
  resolveComment: (commentId: string) => void
}

const CollaborationContext = createContext<CollaborationContextValue | null>(null)

interface CollaborationProviderProps {
  documentId: string
  children: ReactNode
}

export function CollaborationProvider({
  documentId,
  children
}: CollaborationProviderProps) {
  const collaboration = useCollaboration(documentId)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <CollaborationContext.Provider
      value={{
        documentId,
        state: collaboration.state,
        isConnected: collaboration.isConnected,
        updateCursor: collaboration.updateCursor,
        updateSelection: collaboration.updateSelection,
        addComment: collaboration.addComment,
        resolveComment: collaboration.resolveComment,
      }}
    >
      <div className="relative">
        {children}
        <CursorOverlay cursors={collaboration.state.cursors} />
        <SelectionOverlay selections={collaboration.state.selections} />
        <CommentThread comments={collaboration.state.comments} />
        <UserPresence users={collaboration.state.users} />
      </div>
    </CollaborationContext.Provider>
  )
}

export function useCollaborationContext() {
  const context = useContext(CollaborationContext)
  if (!context) {
    throw new Error(
      'useCollaborationContext must be used within a CollaborationProvider'
    )
  }
  return context
} 