/**
 * Frame Comment Component - FreeFlow A+++ Implementation
 * Individual frame comment display with spatial annotation indicator
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Clock,
  MoreHorizontal,
  Check,
  X,
  Edit2,
  Trash2,
  Reply,
  AlertCircle,
  AlertTriangle,
  Pin,
  Pencil,
  Square,
  Circle,
  ArrowUp,
  Send,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  VideoComment,
  msToSMPTE,
  formatDuration,
} from '@/lib/video/frame-comments';
import { cn } from '@/lib/utils';

interface FrameCommentProps {
  comment: VideoComment;
  frameRate: number;
  isActive?: boolean;
  isSelected?: boolean;
  showTimecode?: boolean;
  showAnnotationType?: boolean;
  onSelect?: (comment: VideoComment) => void;
  onSeek?: (timestampMs: number) => void;
  onReply?: (comment: VideoComment) => void;
  onResolve?: (commentId: string) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
}

const priorityConfig = {
  0: { label: 'Normal', color: 'text-muted-foreground', bg: 'bg-muted' },
  1: { label: 'Important', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertTriangle },
  2: { label: 'Critical', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: AlertCircle },
} as const;

const annotationTypeIcons = {
  point: Pin,
  region: Square,
  drawing: Pencil,
  text: MessageSquare,
  arrow: ArrowUp,
  audio: MessageSquare,
};

const commonReactions = ['👍', '❤️', '🔥', '👀', '✅', '❓'];

export function FrameComment({
  comment,
  frameRate,
  isActive = false,
  isSelected = false,
  showTimecode = true,
  showAnnotationType = true,
  onSelect,
  onSeek,
  onReply,
  onResolve,
  onEdit,
  onDelete,
  onReaction,
}: FrameCommentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReactions, setShowReactions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

  const timecode = msToSMPTE(comment.timestampMs, frameRate);
  const duration = formatDuration(comment.timestampMs);
  const priorityInfo = priorityConfig[comment.priority];
  const AnnotationIcon = comment.commentType ? annotationTypeIcons[comment.commentType] : MessageSquare;
  const PriorityIcon = priorityInfo.icon;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (isReplying && replyTextareaRef.current) {
      replyTextareaRef.current.focus();
    }
  }, [isReplying]);

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit?.(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply?.({ ...comment, content: replyContent.trim() });
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      action();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setIsReplying(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'group relative rounded-lg border transition-all duration-200',
        isActive && 'ring-2 ring-primary ring-offset-2',
        isSelected && 'bg-primary/5 border-primary',
        comment.status === 'resolved' && 'opacity-60',
        !isSelected && 'hover:border-muted-foreground/50 hover:bg-muted/30'
      )}
      onClick={() => onSelect?.(comment)}
    >
      {/* Priority indicator bar */}
      {comment.priority > 0 && (
        <div
          className={cn(
            'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
            comment.priority === 1 && 'bg-amber-500',
            comment.priority === 2 && 'bg-red-500'
          )}
        />
      )}

      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7">
              <AvatarImage src={comment.user?.avatarUrl} alt={comment.user?.name || 'User'} />
              <AvatarFallback className="text-xs">
                {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {comment.user?.name || 'Anonymous'}
              </span>
              {showTimecode && (
                <button
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSeek?.(comment.timestampMs);
                  }}
                >
                  <Clock className="h-3 w-3" />
                  <span className="font-mono">{timecode}</span>
                  <span className="text-muted-foreground/70">({duration})</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Annotation type badge */}
            {showAnnotationType && comment.annotation && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="h-6 px-1.5">
                      <AnnotationIcon className="h-3 w-3" />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">{comment.commentType} annotation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Priority badge */}
            {comment.priority > 0 && PriorityIcon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn('h-6 px-1.5', priorityInfo.bg)}>
                      <PriorityIcon className={cn('h-3 w-3', priorityInfo.color)} />
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{priorityInfo.label} priority</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Status badge */}
            {comment.status === 'resolved' && (
              <Badge variant="secondary" className="h-6 gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Check className="h-3 w-3" />
                Resolved
              </Badge>
            )}

            {/* Actions dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsReplying(true)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onResolve?.(comment.id)}
                  className={comment.status === 'resolved' ? 'text-amber-600' : 'text-green-600'}
                >
                  {comment.status === 'resolved' ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Unresolve
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Resolve
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDelete?.(comment.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content */}
        <div className="mt-2 pl-9">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, handleEdit)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleEdit}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {renderContentWithMentions(comment.content, comment.mentionedUsers)}
            </p>
          )}

          {/* Category & Tags */}
          {(comment.category || comment.tags.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {comment.category && (
                <Badge variant="secondary" className="text-xs">
                  {comment.category}
                </Badge>
              )}
              {comment.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Reactions */}
          {(comment.reactionCounts && Object.keys(comment.reactionCounts).length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(comment.reactionCounts).map(([emoji, count]) => (
                <button
                  key={emoji}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-xs transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction?.(comment.id, emoji);
                  }}
                >
                  <span>{emoji}</span>
                  <span>{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick reactions */}
          <AnimatePresence>
            {showReactions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1 mt-2 p-1 rounded-lg bg-muted"
              >
                {commonReactions.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-1 hover:bg-background rounded transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReaction?.(comment.id, emoji);
                      setShowReactions(false);
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowReactions(!showReactions);
              }}
            >
              😊
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setIsReplying(true);
              }}
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>
            {comment.replies && comment.replies.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                <Textarea
                  ref={replyTextareaRef}
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, handleReply)}
                  className="min-h-[60px] text-sm"
                />
                <div className="flex items-center gap-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsReplying(false);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    disabled={!replyContent.trim()}
                    onClick={handleReply}
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-9 border-l-2 border-muted ml-3 space-y-3">
            {comment.replies.map((reply) => (
              <NestedReply
                key={reply.id}
                reply={reply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReaction={onReaction}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Nested reply component
interface NestedReplyProps {
  reply: VideoComment;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
}

function NestedReply({ reply, onEdit, onDelete, onReaction }: NestedReplyProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);

  return (
    <div className="group/reply">
      <div className="flex items-start gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={reply.user?.avatarUrl} alt={reply.user?.name || 'User'} />
          <AvatarFallback className="text-xs">
            {reply.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{reply.user?.name || 'Anonymous'}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(reply.createdAt).toLocaleDateString()}
            </span>
          </div>
          {isEditing ? (
            <div className="mt-1 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[40px] text-sm"
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    onEdit?.(reply.id, editContent);
                    setIsEditing(false);
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-0.5">
              {renderContentWithMentions(reply.content, reply.mentionedUsers)}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover/reply:opacity-100"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit2 className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete?.(reply.id)}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// Helper function to render content with @mentions highlighted
function renderContentWithMentions(content: string, mentionedUsers: string[]): React.ReactNode {
  if (!mentionedUsers || mentionedUsers.length === 0) {
    return content;
  }

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const mentionRegex = /@(\w+)/g;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={match.index}
        className="text-primary font-medium hover:underline cursor-pointer"
      >
        {match[0]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : content;
}

export default FrameComment;
