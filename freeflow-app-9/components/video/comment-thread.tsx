/**
 * Comment Thread - FreeFlow A+++ Implementation
 * Single comment with replies and actions
 */

'use client';

import { useState } from 'react';
import {
  MoreHorizontal,
  Reply,
  CheckCircle,
  Circle,
  Edit2,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Flag,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  msToSMPTE,
  type VideoComment,
} from '@/lib/video/frame-comments';

// Common emoji reactions
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '💯'];

interface CommentThreadProps {
  comment: VideoComment;
  videoFrameRate: number;
  isActive?: boolean;
  onClick?: () => void;
  onReply?: (content: string) => void;
  onUpdate?: (updates: Partial<VideoComment>) => void;
  onDelete?: () => void;
  onResolve?: (resolved: boolean, notes?: string) => void;
  onReaction?: (emoji: string) => void;
  className?: string;
}

export function CommentThread({
  comment,
  videoFrameRate,
  isActive,
  onClick,
  onReply,
  onUpdate,
  onDelete,
  onResolve,
  onReaction,
  className,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isResolved = comment.status === 'resolved';
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  const priorityColors = {
    0: '',
    1: 'border-l-orange-500',
    2: 'border-l-red-500',
  };

  const priorityIcons = {
    0: null,
    1: <AlertTriangle className="h-3 w-3 text-orange-500" />,
    2: <AlertCircle className="h-3 w-3 text-red-500" />,
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply?.(replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleEdit = () => {
    if (!editContent.trim()) return;
    onUpdate?.({ content: editContent });
    setIsEditing(false);
  };

  const handleResolve = () => {
    onResolve?.(!isResolved, resolutionNotes || undefined);
    setShowResolveDialog(false);
    setResolutionNotes('');
  };

  const handleDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  // Render content with mentions highlighted
  const renderContent = (content: string) => {
    const parts = content.split(/(@\[([^\]]+)\]\(([^)]+)\))/g);
    return parts.map((part, i) => {
      if (part.startsWith('@[') && part.includes('](')) {
        const match = part.match(/@\[([^\]]+)\]\(([^)]+)\)/);
        if (match) {
          return (
            <span key={i} className="text-primary font-medium">
              @{match[1]}
            </span>
          );
        }
      }
      return part;
    });
  };

  return (
    <>
      <div
        className={cn(
          'group relative rounded-lg border p-3 transition-all',
          'hover:shadow-sm',
          isActive && 'ring-2 ring-primary',
          isResolved && 'bg-muted/30 opacity-75',
          priorityColors[comment.priority],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user?.avatarUrl} />
              <AvatarFallback>
                {comment.user?.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">
                  {comment.user?.name || 'Unknown'}
                </span>
                {priorityIcons[comment.priority]}
                {isResolved && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                    Resolved
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <button
                  className="hover:text-primary font-mono"
                  onClick={onClick}
                >
                  {msToSMPTE(comment.timestampMs, videoFrameRate)}
                </button>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {comment.editedAt && (
                  <>
                    <span>•</span>
                    <span>edited</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsReplying(true)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowResolveDialog(true)}
              >
                {isResolved ? (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Reopen
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${window.location.pathname}?t=${comment.timestampMs}`
                  );
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="mt-2">
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
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
              {renderContent(comment.content)}
            </p>
          )}
        </div>

        {/* Drawing preview if exists */}
        {comment.drawingData && (
          <div className="mt-2 p-2 bg-muted rounded border">
            <Badge variant="outline" className="text-xs">
              Drawing annotation
            </Badge>
          </div>
        )}

        {/* Resolution notes */}
        {isResolved && comment.resolutionNotes && (
          <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded text-sm">
            <p className="text-green-700 dark:text-green-400">
              <CheckCircle className="h-3 w-3 inline mr-1" />
              {comment.resolutionNotes}
            </p>
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1 mt-3">
          {comment.reactionCounts &&
            Object.entries(comment.reactionCounts).map(([emoji, count]) => (
              <Tooltip key={emoji}>
                <TooltipTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-xs"
                    onClick={() => onReaction?.(emoji)}
                  >
                    {emoji}
                    <span>{count}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  Click to toggle reaction
                </TooltipContent>
              </Tooltip>
            ))}

          {/* Add reaction button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs">+</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <div className="grid grid-cols-4 gap-1 p-2">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    className="p-2 hover:bg-muted rounded text-lg"
                    onClick={() => onReaction?.(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reply input */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="min-h-[60px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
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
                onClick={handleReply}
                disabled={!replyContent.trim()}
              >
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {hasReplies && (
          <div className="mt-4 pl-4 border-l-2 space-y-3">
            {comment.replies?.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.user?.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {reply.user?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {reply.user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm mt-0.5">{renderContent(reply.content)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isResolved ? 'Reopen Comment' : 'Resolve Comment'}
            </DialogTitle>
            <DialogDescription>
              {isResolved
                ? 'This will mark the comment as unresolved.'
                : 'Add optional resolution notes below.'}
            </DialogDescription>
          </DialogHeader>
          {!isResolved && (
            <Textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Resolution notes (optional)..."
              className="min-h-[80px]"
            />
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowResolveDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleResolve}>
              {isResolved ? 'Reopen' : 'Resolve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
