'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useCollaborationContext } from '@/components/providers/collaboration-provider'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Check, MessageSquare, X } from 'lucide-react'

interface Comment {
  id: string
  userId: string
  content: string
  timestamp: number
  resolved?: boolean
}

interface CommentProps {
  comment: Comment
  user: {
    id: string
    name: string
    avatar?: string
  }
  onResolve: (id: string) => void
}

function Comment({ comment, user, onResolve }: CommentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex items-start space-x-4 p-4"
    >
      <Avatar>
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>
          {user.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="font-medium">{user.name}</div>
          <time className="text-xs text-muted-foreground">
            {format(comment.timestamp, 'MMM d, h:mm a')}
          </time>
        </div>

        <p className="text-sm text-muted-foreground">{comment.content}</p>
      </div>

      {!comment.resolved && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onResolve(comment.id)}
          className="shrink-0"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  )
}

interface CommentThreadProps {
  comments: Comment[]
}

export function CommentThread({ comments }: CommentThreadProps) {
  const { state, addComment, resolveComment } = useCollaborationContext()
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')

  const activeComments = comments.filter(c => !c.resolved)
  const resolvedComments = comments.filter(c => c.resolved)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    addComment(newComment.trim())
    setNewComment('')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4"
          >
            <Card className="w-80">
              <div className="max-h-96 overflow-y-auto">
                {activeComments.length > 0 && (
                  <div className="border-b">
                    <div className="p-4 font-medium">Active Comments</div>
                    {activeComments.map(comment => {
                      const user = state.users.find(u => u.id === comment.userId)
                      if (!user) return null

                      return (
                        <Comment
                          key={comment.id}
                          comment={comment}
                          user={user}
                          onResolve={resolveComment}
                        />
                      )
                    })}
                  </div>
                )}

                {resolvedComments.length > 0 && (
                  <div>
                    <div className="p-4 font-medium text-muted-foreground">
                      Resolved Comments
                    </div>
                    {resolvedComments.map(comment => {
                      const user = state.users.find(u => u.id === comment.userId)
                      if (!user) return null

                      return (
                        <Comment
                          key={comment.id}
                          comment={comment}
                          user={user}
                          onResolve={resolveComment}
                        />
                      )
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="border-t p-4">
                <div className="flex space-x-2">
                  <Input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newComment.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        variant={isOpen ? 'secondary' : 'default'}
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full shadow-lg"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageSquare className="h-6 w-6" />
            {activeComments.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {activeComments.length}
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  )
} 