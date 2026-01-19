"use client";

/**
 * Suggestions Panel Component - FreeFlow A+++ Implementation
 * Google Docs-style sidebar panel for managing all suggestions
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Icons
import {
  Check,
  X,
  CheckCheck,
  XCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Trash2,
  MoreHorizontal,
  Settings2,
  Sparkles,
} from 'lucide-react';

// Components
import { SuggestionCard } from './suggestion-card';

// Types
import type { Suggestion } from '@/lib/track-changes/track-changes-extension';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  activeSuggestionId?: string | null;
  trackChangesEnabled: boolean;
  onToggleTrackChanges: (enabled: boolean) => void;
  onAcceptSuggestion: (id: string) => void;
  onRejectSuggestion: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onSelectSuggestion: (id: string) => void;
  onAddComment?: (id: string, comment: string) => void;
  className?: string;
}

type FilterType = 'all' | 'pending' | 'accepted' | 'rejected';
type SortType = 'newest' | 'oldest' | 'type';

export function SuggestionsPanel({
  suggestions,
  activeSuggestionId,
  trackChangesEnabled,
  onToggleTrackChanges,
  onAcceptSuggestion,
  onRejectSuggestion,
  onAcceptAll,
  onRejectAll,
  onSelectSuggestion,
  onAddComment,
  className,
}: SuggestionsPanelProps) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [filterByAuthor, setFilterByAuthor] = useState<string | null>(null);

  // Get unique authors
  const authors = useMemo(() => {
    const authorMap = new Map<string, { id: string; name: string; avatar?: string }>();
    suggestions.forEach((s) => {
      if (!authorMap.has(s.authorId)) {
        authorMap.set(s.authorId, {
          id: s.authorId,
          name: s.authorName,
          avatar: s.authorAvatar,
        });
      }
    });
    return Array.from(authorMap.values());
  }, [suggestions]);

  // Filter and sort suggestions
  const filteredSuggestions = useMemo(() => {
    let filtered = [...suggestions];

    // Filter by status
    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.status === filterType);
    }

    // Filter by author
    if (filterByAuthor) {
      filtered = filtered.filter((s) => s.authorId === filterByAuthor);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.content.original?.toLowerCase().includes(query) ||
          s.content.suggested?.toLowerCase().includes(query) ||
          s.authorName.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
    }

    return filtered;
  }, [suggestions, filterType, filterByAuthor, searchQuery, sortBy]);

  // Counts
  const pendingCount = suggestions.filter((s) => s.status === 'pending').length;
  const acceptedCount = suggestions.filter((s) => s.status === 'accepted').length;
  const rejectedCount = suggestions.filter((s) => s.status === 'rejected').length;

  // Type counts
  const insertionCount = suggestions.filter((s) => s.type === 'insertion' && s.status === 'pending').length;
  const deletionCount = suggestions.filter((s) => s.type === 'deletion' && s.status === 'pending').length;
  const replacementCount = suggestions.filter((s) => s.type === 'replacement' && s.status === 'pending').length;

  return (
    <div className={cn('flex flex-col h-full bg-background border-l', className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Suggestions</h2>
          <div className="flex items-center gap-2">
            <Label htmlFor="track-changes" className="text-sm text-muted-foreground">
              Track Changes
            </Label>
            <Switch
              id="track-changes"
              checked={trackChangesEnabled}
              onCheckedChange={onToggleTrackChanges}
            />
          </div>
        </div>

        {/* Status badge */}
        {trackChangesEnabled ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            <Sparkles className="w-3 h-3 mr-1" />
            Suggesting Mode Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Eye className="w-3 h-3 mr-1" />
            Editing Mode
          </Badge>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/30">
            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
              {pendingCount}
            </div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950/30">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {acceptedCount}
            </div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {rejectedCount}
            </div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 border-b space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick filters */}
        <Tabs value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1 text-xs">
              All ({suggestions.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 text-xs">
              Pending ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex-1 text-xs">
              Accepted
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex-1 text-xs">
              Rejected
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Advanced filters */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            <div className="space-y-2">
              <Label className="text-xs">Sort by</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="type">By type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {authors.length > 1 && (
              <div className="space-y-2">
                <Label className="text-xs">Filter by author</Label>
                <Select
                  value={filterByAuthor || 'all'}
                  onValueChange={(v) => setFilterByAuthor(v === 'all' ? null : v)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All authors</SelectItem>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Bulk actions */}
      {pendingCount > 0 && (
        <div className="px-4 py-2 border-b flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-green-600">
                <CheckCheck className="w-4 h-4 mr-1" />
                Accept All ({pendingCount})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Accept all suggestions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will accept all {pendingCount} pending suggestions. This action can be undone
                  with version history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onAcceptAll} className="bg-green-600 hover:bg-green-700">
                  Accept All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1 text-red-600">
                <XCircle className="w-4 h-4 mr-1" />
                Reject All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject all suggestions?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reject all {pendingCount} pending suggestions. The original content will
                  be restored.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onRejectAll} className="bg-red-600 hover:bg-red-700">
                  Reject All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {/* Suggestions list */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                {filterType === 'all' ? (
                  <Sparkles className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <Filter className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <h3 className="font-medium text-muted-foreground">
                {filterType === 'all'
                  ? 'No suggestions yet'
                  : `No ${filterType} suggestions`}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {filterType === 'all'
                  ? trackChangesEnabled
                    ? 'Start editing to create suggestions'
                    : 'Enable track changes to start suggesting'
                  : 'Try a different filter'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSuggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  isActive={suggestion.id === activeSuggestionId}
                  onAccept={onAcceptSuggestion}
                  onReject={onRejectSuggestion}
                  onSelect={onSelectSuggestion}
                  onAddComment={onAddComment}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Type summary footer */}
      {pendingCount > 0 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-green-500" />
              <span>{insertionCount} insertions</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-red-500" />
              <span>{deletionCount} deletions</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-blue-500" />
              <span>{replacementCount} replacements</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuggestionsPanel;
