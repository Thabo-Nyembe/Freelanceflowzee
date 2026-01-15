'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Check, MessageSquare, X } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: number
  resolved?: boolean
  replies?: Comment[]
}

interface CommentThreadProps {
  comments: Comment[]
  currentUser: {
    id: string
    name: string
    avatar?: string
  }
  onAddComment: (content: string) => void
  onResolveComment: (commentId: string) => void
}

export function CommentThread({
  comments,
  currentUser,
  onAddComment,
  onResolveComment,
}: CommentThreadProps) {
  const [newComment, setNewComment] = useState('')
  const [isExpanded, setIsExpanded] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment.trim())
      setNewComment('')
    }
  }

  return (
    <div className="fixed right-4 bottom-4 w-80">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : '48px' }}
        className="bg-white rounded-lg shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div
          className="p-4 bg-primary text-primary-foreground flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span className="font-medium">Comments ({comments.length})</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? <X className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Comments list */}
              <ScrollArea className="h-[300px] p-4">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`mb-4 ${
                      comment.resolved ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <img src={comment.userAvatar || '/avatars/default.png'}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        loading="lazy" />
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(comment.timestamp, 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm">{comment.content}</p>
                        {comment.replies?.map((reply) => (
                          <div key={reply.id} className="ml-6 mt-2">
                            <div className="flex items-start gap-2">
                              <Avatar>
                                <img src={reply.userAvatar || '/avatars/default.png'}
                                  alt={reply.userName}
                                  className="w-6 h-6 rounded-full"
                                loading="lazy" />
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {reply.userName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {format(reply.timestamp, 'MMM d, h:mm a')}
                                  </span>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {!comment.resolved && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onResolveComment(comment.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </ScrollArea>

              {/* Comment input */}
              <form onSubmit={handleSubmit} className="p-4 border-t">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="min-h-[80px]"
                />
                <div className="mt-2 flex justify-end">
                  <Button type="submit" disabled={!newComment.trim()}>
                    Send
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
} 