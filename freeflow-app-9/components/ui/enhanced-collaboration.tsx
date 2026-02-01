'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users,
  MessageSquare,
  Edit,
  Share2,
  AtSign,
  Heart,
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Pin,
  Reply,
  Circle,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Enhanced Presence Indicator
interface User {
  id: string
  name: string
  avatar?: string
  email?: string
  role?: string
  status?: 'online' | 'away' | 'busy' | 'offline'
  lastSeen?: Date
  isTyping?: boolean
}

interface EnhancedPresenceIndicatorProps {
  users: User[]
  maxDisplay?: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  onUserClick?: (user: User) => void
}

export function EnhancedPresenceIndicator({
  users,
  maxDisplay = 5,
  showDetails = false,
  size = 'md',
  className,
  onUserClick
}: EnhancedPresenceIndicatorProps) {
  const displayUsers = users.slice(0, maxDisplay)
  const remainingCount = Math.max(0, users.length - maxDisplay)

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return 'Never'
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <div
            key={user.id}
            className="relative group cursor-pointer"
            onClick={() => onUserClick?.(user)}
          >
            <Avatar className={cn(sizeClasses[size], 'border-2 border-background')}>
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-xs">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Status Indicator */}
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-background',
              getStatusColor(user.status),
              size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
            )} />
            
            {/* Typing Indicator */}
            {user.isTyping && (
              <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1">
                ✏️
              </div>
            )}
            
            {/* Tooltip */}
            {showDetails && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-sm whitespace-nowrap">
                  <div className="font-medium">{user.name}</div>
                  {user.role && (
                    <div className="text-muted-foreground text-xs">{user.role}</div>
                  )}
                  <div className="text-xs mt-1">
                    <span className={cn(
                      'inline-block w-2 h-2 rounded-full mr-1',
                      getStatusColor(user.status)
                    )} />
                    {user.status === 'offline' 
                      ? `Last seen ${formatLastSeen(user.lastSeen)}`
                      : user.status?.charAt(0).toUpperCase() + user.status?.slice(1)
                    }
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div className={cn(
            'flex items-center justify-center bg-muted border-2 border-background rounded-full text-xs font-medium text-muted-foreground',
            sizeClasses[size]
          )}>
            +{remainingCount}
          </div>
        )}
      </div>
      
      {showDetails && (
        <div className="ml-3 text-sm text-muted-foreground">
          {users.filter(u => u.status === 'online').length} online
        </div>
      )}
    </div>
  )
}

// Enhanced Activity Feed
interface Activity {
  id: string
  user: User
  type: 'comment' | 'edit' | 'share' | 'mention' | 'like' | 'join' | 'leave'
  content: string
  timestamp: Date
  target?: string
  metadata?: Record<string, any>
}

interface EnhancedActivityFeedProps {
  activities: Activity[]
  title?: string
  maxItems?: number
  showTimestamps?: boolean
  groupByDate?: boolean
  className?: string
  onActivityClick?: (activity: Activity) => void
}

export function EnhancedActivityFeed({
  activities,
  title = 'Recent Activity',
  maxItems = 10,
  showTimestamps = true,
  groupByDate = false,
  className,
  onActivityClick
}: EnhancedActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'edit': return <Edit className="h-4 w-4 text-green-600" />
      case 'share': return <Share2 className="h-4 w-4 text-purple-600" />
      case 'mention': return <AtSign className="h-4 w-4 text-orange-600" />
      case 'like': return <Heart className="h-4 w-4 text-red-600" />
      case 'join': return <UserPlus className="h-4 w-4 text-green-600" />
      case 'leave': return <Users className="h-4 w-4 text-gray-600" />
      default: return <Circle className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const groupedActivities = React.useMemo(() => {
    if (!groupByDate) return { 'All': displayActivities }
    
    const groups: Record<string, Activity[]> = {}
    
    displayActivities.forEach(activity => {
      const date = activity.timestamp.toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(activity)
    })
    
    return groups
  }, [displayActivities, groupByDate])

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {Object.entries(groupedActivities).map(([group, groupActivities]) => (
          <div key={group}>
            {groupByDate && group !== 'All' && (
              <div className="text-xs font-medium text-muted-foreground mb-2 pb-2 border-b">
                {group}
              </div>
            )}
            
            <div className="space-y-3">
              {groupActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors',
                    onActivityClick && 'cursor-pointer'
                  )}
                  onClick={() => onActivityClick?.(activity)}
                >
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getActivityIcon(activity.type)}
                      <span className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        <span className="text-muted-foreground ml-1">{activity.content}</span>
                        {activity.target && (
                          <span className="font-medium ml-1">{activity.target}</span>
                        )}
                      </span>
                    </div>
                    
                    {showTimestamps && (
                      <div className="text-xs text-muted-foreground">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No recent activity
          </div>
        )}
        
        {activities.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              View all {activities.length} activities
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Enhanced Comment System
interface Comment {
  id: string
  user: User
  content: string
  timestamp: Date
  replies?: Comment[]
  likes?: number
  isLiked?: boolean
  isPinned?: boolean
  mentions?: string[]
  attachments?: Array<{ name: string; url: string; type: string }>
}

interface EnhancedCommentSystemProps {
  comments: Comment[]
  currentUser: User
  onAddComment?: (content: string, mentions: string[], attachments: File[]) => void
  onReply?: (commentId: string, content: string) => void
  onLike?: (commentId: string) => void
  onPin?: (commentId: string) => void
  onDelete?: (commentId: string) => void
  onReport?: (commentId: string) => void
  className?: string
  allowAttachments?: boolean
  allowMentions?: boolean
}

export function EnhancedCommentSystem({
  comments,
  currentUser,
  onAddComment,
  onReply,
  onLike,
  onPin,
  onDelete,
  onReport,
  className,
  allowAttachments = true,
  allowMentions = true
}: EnhancedCommentSystemProps) {
  const [newComment, setNewComment] = React.useState('')
  const [replyingTo, setReplyingTo] = React.useState<string | null>(null)
  const [replyContent, setReplyContent] = React.useState('')
  const [mentions, setMentions] = React.useState<string[]>([])
  const [attachments, setAttachments] = React.useState<File[]>([])

  const handleSubmitComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment, mentions, attachments)
      setNewComment('')
      setMentions([])
      setAttachments([])
    }
  }

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim() && onReply) {
      onReply(commentId, replyContent)
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={cn('space-y-3', isReply && 'ml-8 border-l-2 border-muted pl-4')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
          <AvatarFallback className="text-xs">
            {comment.user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-2">
          {/* Comment Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.user.name}</span>
              {comment.user.role && (
                <Badge variant="outline" className="text-xs h-4 px-1">
                  {comment.user.role}
                </Badge>
              )}
              {comment.isPinned && (
                <Pin className="h-3 w-3 text-primary" />
              )}
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(comment.timestamp)}
              </span>
            </div>
            
            {/* Comment Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLike?.(comment.id)}
                className={cn(
                  'h-6 px-2 text-xs',
                  comment.isLiked && 'text-red-600'
                )}
              >
                <Heart className={cn('h-3 w-3 mr-1', comment.isLiked && 'fill-current')} />
                {comment.likes || 0}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
              
              <div className="relative group">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info('More Options', { description: 'Additional options available' })}>
                  <MoreHorizontal className="h-3 w-3" />
                </Button>

                <div className="absolute right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <div className="bg-popover border border-border rounded-lg shadow-lg py-1 whitespace-nowrap">
                    {onPin && (
                      <button
                        className="w-full text-left px-3 py-1 text-xs hover:bg-muted transition-colors"
                        onClick={() => onPin(comment.id)}
                      >
                        {comment.isPinned ? 'Unpin' : 'Pin'} comment
                      </button>
                    )}
                    {onReport && (
                      <button
                        className="w-full text-left px-3 py-1 text-xs hover:bg-muted transition-colors"
                        onClick={() => onReport(comment.id)}
                      >
                        Report
                      </button>
                    )}
                    {onDelete && comment.user.id === currentUser.id && (
                      <button
                        className="w-full text-left px-3 py-1 text-xs hover:bg-muted transition-colors text-destructive"
                        onClick={() => onDelete(comment.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Comment Content */}
          <div className="text-sm text-foreground">
            {comment.content}
          </div>
          
          {/* Attachments */}
          {comment.attachments && comment.attachments.length > 0 && (
            <div className="space-y-1">
              {comment.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-muted rounded-lg text-xs"
                >
                  <Paperclip className="h-3 w-3" />
                  <span>{attachment.name}</span>
                  <Button variant="ghost" size="sm" className="h-4 px-1 ml-auto" onClick={() => toast.success('Download started', { description: `Downloading ${attachment.name}` })}>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  )

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* New Comment Form */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-xs">
                {currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px]"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {allowAttachments && (
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Attach File', { description: 'File attachments coming soon' })}>
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  )}
                  {allowMentions && (
                    <Button variant="ghost" size="sm" onClick={() => toast.info('Mention', { description: 'Type @ to mention a team member' })}>
                      <AtSign className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => toast.info('Emoji', { description: 'Emoji picker coming soon' })}>
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments List */}
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
        </div>
        
        {comments.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No comments yet. Be the first to comment!
          </div>
        )}
      </CardContent>
    </Card>
  )
}



