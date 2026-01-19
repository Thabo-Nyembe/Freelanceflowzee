/**
 * Comment Panel - FreeFlow A+++ Implementation
 * Frame.io-style comment sidebar with threads
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Filter,
  SortAsc,
  SortDesc,
  Search,
  Plus,
  ChevronDown,
  CheckCircle,
  Circle,
  AlertCircle,
  AlertTriangle,
  X,
  Send,
  AtSign,
  Paperclip,
  Mic,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { CommentThread } from './comment-thread';
import {
  formatDuration,
  msToSMPTE,
  filterComments,
  sortComments,
  buildCommentThreads,
  type VideoComment,
  type VideoAsset,
  type CommentFilters,
  type CommentSortField,
  type CommentPriority,
} from '@/lib/video/frame-comments';

interface CommentPanelProps {
  video: VideoAsset;
  comments: VideoComment[];
  currentTimeMs: number;
  onCommentClick?: (comment: VideoComment) => void;
  onCreateComment?: (data: {
    content: string;
    timestampMs: number;
    parentId?: string;
    priority?: CommentPriority;
    mentionedUsers?: string[];
  }) => void;
  onUpdateComment?: (id: string, updates: Partial<VideoComment>) => void;
  onDeleteComment?: (id: string) => void;
  onResolveComment?: (id: string, resolved: boolean, notes?: string) => void;
  onReaction?: (commentId: string, emoji: string) => void;
  activeCommentId?: string | null;
  teamMembers?: Array<{ id: string; name: string; avatarUrl?: string }>;
  className?: string;
}

export function CommentPanel({
  video,
  comments,
  currentTimeMs,
  onCommentClick,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
  onReaction,
  activeCommentId,
  teamMembers = [],
  className,
}: CommentPanelProps) {
  const [filters, setFilters] = useState<CommentFilters>({});
  const [sortField, setSortField] = useState<CommentSortField>('timestamp');
  const [sortAsc, setSortAsc] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [newCommentPriority, setNewCommentPriority] = useState<CommentPriority>(0);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter and sort comments
  const filteredComments = filterComments(comments, {
    ...filters,
    searchQuery: searchQuery || undefined,
  });
  const sortedComments = sortComments(filteredComments, sortField, sortAsc);
  const threadedComments = buildCommentThreads(sortedComments);

  // Stats
  const totalComments = comments.length;
  const resolvedCount = comments.filter((c) => c.status === 'resolved').length;
  const unresolvedCount = totalComments - resolvedCount;

  const handleCreateComment = useCallback(() => {
    if (!newCommentContent.trim()) return;

    // Extract mentions from content
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentionedUsers: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newCommentContent)) !== null) {
      mentionedUsers.push(match[2]);
    }

    onCreateComment?.({
      content: newCommentContent,
      timestampMs: currentTimeMs,
      priority: newCommentPriority,
      mentionedUsers,
    });

    setNewCommentContent('');
    setNewCommentPriority(0);
    setIsCreating(false);
  }, [newCommentContent, currentTimeMs, newCommentPriority, onCreateComment]);

  const handleMentionSelect = useCallback(
    (member: { id: string; name: string }) => {
      const mention = `@[${member.name}](${member.id})`;
      setNewCommentContent((prev) => {
        // Replace the @search with the mention
        const lastAtIndex = prev.lastIndexOf('@');
        if (lastAtIndex >= 0) {
          return prev.slice(0, lastAtIndex) + mention + ' ';
        }
        return prev + mention + ' ';
      });
      setShowMentions(false);
      setMentionSearch('');
      textareaRef.current?.focus();
    },
    []
  );

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNewCommentContent(value);

      // Check for @ mention
      const lastAtIndex = value.lastIndexOf('@');
      if (lastAtIndex >= 0) {
        const textAfterAt = value.slice(lastAtIndex + 1);
        if (!textAfterAt.includes(' ') && !textAfterAt.includes('\n')) {
          setMentionSearch(textAfterAt);
          setShowMentions(true);
        } else {
          setShowMentions(false);
        }
      } else {
        setShowMentions(false);
      }
    },
    []
  );

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const priorityIcons = {
    0: <Circle className="h-3 w-3 text-muted-foreground" />,
    1: <AlertTriangle className="h-3 w-3 text-orange-500" />,
    2: <AlertCircle className="h-3 w-3 text-red-500" />,
  };

  const priorityLabels = {
    0: 'Normal',
    1: 'Important',
    2: 'Critical',
  };

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h2 className="font-semibold">Comments</h2>
          <Badge variant="secondary">{totalComments}</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={filters.isResolved === false}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({
                    ...f,
                    isResolved: checked ? false : undefined,
                  }))
                }
              >
                <Circle className="h-3 w-3 mr-2" />
                Unresolved
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.isResolved === true}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({
                    ...f,
                    isResolved: checked ? true : undefined,
                  }))
                }
              >
                <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                Resolved
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filters.priority?.includes(2)}
                onCheckedChange={(checked) =>
                  setFilters((f) => ({
                    ...f,
                    priority: checked ? [2] : undefined,
                  }))
                }
              >
                <AlertCircle className="h-3 w-3 mr-2 text-red-500" />
                Critical only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {sortAsc ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortField('timestamp')}>
                By Timestamp
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField('created')}>
                By Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortField('priority')}>
                By Priority
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortAsc(!sortAsc)}>
                {sortAsc ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 px-4 py-2 text-sm border-b bg-muted/30">
        <span className="flex items-center gap-1">
          <Circle className="h-3 w-3" />
          {unresolvedCount} open
        </span>
        <span className="flex items-center gap-1 text-green-600">
          <CheckCircle className="h-3 w-3" />
          {resolvedCount} resolved
        </span>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Comments List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {threadedComments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to add a comment</p>
            </div>
          ) : (
            threadedComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                videoFrameRate={video.frameRate}
                isActive={comment.id === activeCommentId}
                onClick={() => onCommentClick?.(comment)}
                onReply={(content) =>
                  onCreateComment?.({
                    content,
                    timestampMs: comment.timestampMs,
                    parentId: comment.id,
                  })
                }
                onUpdate={(updates) => onUpdateComment?.(comment.id, updates)}
                onDelete={() => onDeleteComment?.(comment.id)}
                onResolve={(resolved, notes) =>
                  onResolveComment?.(comment.id, resolved, notes)
                }
                onReaction={(emoji) => onReaction?.(comment.id, emoji)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* New Comment Input */}
      <div className="border-t p-4">
        {isCreating ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-xs">
                {msToSMPTE(currentTimeMs, video.frameRate)}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7">
                    {priorityIcons[newCommentPriority]}
                    <span className="ml-1 text-xs">
                      {priorityLabels[newCommentPriority]}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {([0, 1, 2] as CommentPriority[]).map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => setNewCommentPriority(p)}
                    >
                      {priorityIcons[p]}
                      <span className="ml-2">{priorityLabels[p]}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={newCommentContent}
                onChange={handleTextareaChange}
                placeholder="Add a comment... Use @ to mention"
                className="min-h-[80px] pr-20"
                autoFocus
              />

              {/* Mention suggestions */}
              {showMentions && filteredMembers.length > 0 && (
                <div className="absolute bottom-full left-0 mb-1 w-64 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto z-50">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      className="flex items-center gap-2 w-full px-3 py-2 hover:bg-muted text-left"
                      onClick={() => handleMentionSelect(member)}
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{member.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <AtSign className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsCreating(false);
                  setNewCommentContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateComment}
                disabled={!newCommentContent.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                Comment
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add comment at {formatDuration(currentTimeMs)}
          </Button>
        )}
      </div>
    </div>
  );
}
