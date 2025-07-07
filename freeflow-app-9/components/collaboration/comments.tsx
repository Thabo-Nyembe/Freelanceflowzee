'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MessageSquare,
  MoreVertical,
  Check,
  X,
  Send,
  Smile
} from 'lucide-react'
import { CollaborationComment, CollaborationUser } from '@/lib/types/collaboration'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface CommentsProps {
  comments: CollaborationComment[]
  users: CollaborationUser[]
  currentUser: CollaborationUser
  onAddComment: (blockId: string, content: string) => Promise<void>
  onResolveComment: (commentId: string) => Promise<void>
  onAddReaction: (commentId: string, emoji: string) => Promise<void>
  onRemoveReaction: (commentId: string, emoji: string) => Promise<void>
  className?: string
}

export function Comments({
  comments,
  users,
  currentUser,
  onAddComment,
  onResolveComment,
  onAddReaction,
  onRemoveReaction,
  className
}: CommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)

  const handleAddComment = async (blockId: string) => {
    if (!newComment.trim()) return
    await onAddComment(blockId, newComment)
    setNewComment('')
    setReplyTo(null)
  }

  const handleReaction = async (commentId: string, emoji: string) => {
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    const hasReacted = comment.reactions[emoji]?.includes(currentUser.id)
    if (hasReacted) {
      await onRemoveReaction(commentId, emoji)
    } else {
      await onAddReaction(commentId, emoji)
    }
    setShowEmojiPicker(null)
  }

  const getUserById = (userId: string) => {
    return users.find(u => u.id === userId)
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <AnimatePresence>
          {comments.map(comment => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative"
            >
              {/* Comment Card */}
              <div className={`p-4 rounded-lg border ${
                comment.resolved ? 'bg-gray-50' : 'bg-white'
              }`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={getUserById(comment.userId)?.avatar}
                        alt={getUserById(comment.userId)?.name}
                      />
                      <AvatarFallback>
                        {getUserById(comment.userId)?.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {getUserById(comment.userId)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!comment.resolved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onResolveComment(comment.id)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setReplyTo(comment.id)}>
                          Reply
                        </DropdownMenuItem>
                        {!comment.resolved && (
                          <DropdownMenuItem onClick={() => onResolveComment(comment.id)}>
                            Resolve
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Content */}
                <p className="text-sm mb-2">{comment.content}</p>

                {/* Reactions */}
                {Object.entries(comment.reactions).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.entries(comment.reactions).map(([emoji, users]) => (
                      <Button
                        key={emoji}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => handleReaction(comment.id, emoji)}
                      >
                        <span className="mr-1">{emoji}</span>
                        <span className="text-xs">{users.length}</span>
                      </Button>
                    ))}
                  </div>
                )}

                {/* Add Reaction */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(comment.id)}
                  >
                    <Smile className="w-4 h-4 mr-1" />
                    Add Reaction
                  </Button>
                </div>

                {/* Emoji Picker Popover */}
                {showEmojiPicker === comment.id && (
                  <div className="absolute bottom-full mb-2 z-50">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji: any) => {
                        handleReaction(comment.id, emoji.native)
                      }}
                      theme="light"
                    />
                  </div>
                )}

                {/* Resolved Badge */}
                {comment.resolved && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Check className="w-4 h-4" />
                    <span>
                      Resolved by {getUserById(comment.resolvedBy!)?.name}
                      {comment.resolvedAt && (
                        <> · {format(new Date(comment.resolvedAt), 'MMM d, h:mm a')}</>
                      )}
                    </span>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="mt-4 space-y-4 pl-8 border-l-2">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="relative">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={getUserById(reply.userId)?.avatar}
                              alt={getUserById(reply.userId)?.name}
                            />
                            <AvatarFallback>
                              {getUserById(reply.userId)?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {getUserById(reply.userId)?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(reply.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Form */}
                {replyTo === comment.id && (
                  <div className="mt-4 pl-8">
                    <div className="flex items-start gap-2">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          size="icon"
                          onClick={() => handleAddComment(comment.blockId)}
                          disabled={!newComment.trim()}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setReplyTo(null)
                            setNewComment('')
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* New Comment Form */}
      <div className="mt-4">
        <div className="flex items-start gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={() => handleAddComment('block-id')} // Replace with actual block ID
            disabled={!newComment.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 