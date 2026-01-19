"use client";

/**
 * Suggestion Card Component - FreeFlow A+++ Implementation
 * Google Docs-style suggestion display with accept/reject actions
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Icons
import {
  Check,
  X,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  RefreshCw,
  User,
  Send,
  Clock,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Types
import type { Suggestion, SuggestionComment } from '@/lib/track-changes/track-changes-extension';

interface SuggestionCardProps {
  suggestion: Suggestion;
  isActive?: boolean;
  isSelected?: boolean;
  showDiff?: boolean;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onSelect?: (id: string) => void;
  onAddComment?: (id: string, comment: string) => void;
  className?: string;
}

export function SuggestionCard({
  suggestion,
  isActive = false,
  isSelected = false,
  showDiff = true,
  onAccept,
  onReject,
  onSelect,
  onAddComment,
  className,
}: SuggestionCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get suggestion type styling
  const getTypeConfig = () => {
    switch (suggestion.type) {
      case 'insertion':
        return {
          icon: Plus,
          label: 'Insertion',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/30',
          borderColor: 'border-green-200 dark:border-green-800',
          badgeVariant: 'default' as const,
          diffClass: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200',
        };
      case 'deletion':
        return {
          icon: Minus,
          label: 'Deletion',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800',
          badgeVariant: 'destructive' as const,
          diffClass: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through',
        };
      case 'replacement':
        return {
          icon: RefreshCw,
          label: 'Replacement',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800',
          badgeVariant: 'secondary' as const,
          diffClass: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200',
        };
      default:
        return {
          icon: RefreshCw,
          label: 'Change',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800',
          badgeVariant: 'outline' as const,
          diffClass: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
        };
    }
  };

  const typeConfig = getTypeConfig();
  const TypeIcon = typeConfig.icon;

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !onAddComment) return;

    setIsSubmitting(true);
    try {
      onAddComment(suggestion.id, newComment);
      setNewComment('');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isPending = suggestion.status === 'pending';
  const hasComments = suggestion.comments && suggestion.comments.length > 0;

  return (
    <TooltipProvider>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        onClick={() => onSelect?.(suggestion.id)}
        className={cn(
          'rounded-lg border p-3 cursor-pointer transition-all',
          typeConfig.bgColor,
          typeConfig.borderColor,
          isActive && 'ring-2 ring-primary',
          isSelected && 'ring-2 ring-blue-500',
          !isPending && 'opacity-60',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={suggestion.authorAvatar} />
              <AvatarFallback className="text-xs">
                {getInitials(suggestion.authorName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{suggestion.authorName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Badge variant={typeConfig.badgeVariant} className="text-xs">
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>

            {!isPending && (
              <Badge
                variant={suggestion.status === 'accepted' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {suggestion.status === 'accepted' ? 'Accepted' : 'Rejected'}
              </Badge>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowComments(!showComments)}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {hasComments ? `Comments (${suggestion.comments?.length})` : 'Add comment'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(suggestion.id);
                  }}
                  disabled={!isPending}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(suggestion.id);
                  }}
                  disabled={!isPending}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Diff Content */}
        {showDiff && (
          <div className="mt-3 space-y-2">
            {suggestion.type === 'replacement' && (
              <div className="flex items-center gap-2 text-sm">
                {suggestion.content.original && (
                  <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 line-through">
                    {suggestion.content.original}
                  </span>
                )}
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {suggestion.content.suggested && (
                  <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200">
                    {suggestion.content.suggested}
                  </span>
                )}
              </div>
            )}

            {suggestion.type === 'insertion' && suggestion.content.suggested && (
              <div className="text-sm">
                <span className={cn('px-2 py-1 rounded', typeConfig.diffClass)}>
                  {suggestion.content.suggested}
                </span>
              </div>
            )}

            {suggestion.type === 'deletion' && suggestion.content.original && (
              <div className="text-sm">
                <span className={cn('px-2 py-1 rounded', typeConfig.diffClass)}>
                  {suggestion.content.original}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isPending && (
          <div className="flex items-center gap-2 mt-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAccept(suggestion.id);
                  }}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Accept
                </Button>
              </TooltipTrigger>
              <TooltipContent>Accept this suggestion</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(suggestion.id);
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject this suggestion</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComments(!showComments);
                  }}
                >
                  <MessageCircle className="w-4 h-4" />
                  {hasComments && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[10px] text-white flex items-center justify-center">
                      {suggestion.comments?.length}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add comment</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Comments Section */}
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleContent>
            <div className="mt-3 pt-3 border-t space-y-3">
              {/* Existing comments */}
              {hasComments && (
                <div className="space-y-2">
                  {suggestion.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-2 text-sm">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.authorAvatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(comment.authorName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-xs">{comment.authorName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New comment input */}
              {onAddComment && isPending && (
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px] text-sm resize-none"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button
                    size="sm"
                    disabled={!newComment.trim() || isSubmitting}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSubmitComment();
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Resolved info */}
        {!isPending && suggestion.resolvedAt && (
          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {suggestion.status === 'accepted' ? 'Accepted' : 'Rejected'}{' '}
              {formatDistanceToNow(new Date(suggestion.resolvedAt), { addSuffix: true })}
            </span>
          </div>
        )}
      </motion.div>
    </TooltipProvider>
  );
}

export default SuggestionCard;
