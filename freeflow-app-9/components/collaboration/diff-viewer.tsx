"use client";

/**
 * Diff Viewer Component - FreeFlow A+++ Implementation
 * Side-by-side and unified diff views for version comparison
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// UI Components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Icons
import {
  GitCompare,
  SplitSquareHorizontal,
  AlignJustify,
  Plus,
  Minus,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  FileText,
  Clock,
  User,
} from 'lucide-react';

// Types
interface DiffLine {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  lineNumber: {
    old?: number;
    new?: number;
  };
  content: string;
  oldContent?: string; // For modified lines
}

interface DocumentVersion {
  id: string;
  version_number: number;
  document_id: string;
  created_by: string;
  created_at: string;
  label?: string;
  description?: string;
  content_snapshot: string;
  word_count: number;
  change_summary?: string;
  is_auto_save: boolean;
  is_checkpoint: boolean;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

interface DiffViewerProps {
  oldVersion: DocumentVersion;
  newVersion: DocumentVersion;
  onClose?: () => void;
  onRestoreVersion?: (version: DocumentVersion) => void;
  className?: string;
}

type ViewMode = 'unified' | 'split';

export function DiffViewer({
  oldVersion,
  newVersion,
  onClose,
  onRestoreVersion,
  className,
}: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showOnlyChanges, setShowOnlyChanges] = useState(false);
  const [copiedVersion, setCopiedVersion] = useState<'old' | 'new' | null>(null);

  // Compute diff
  const diff = useMemo(() => {
    return computeDiff(
      oldVersion.content_snapshot || '',
      newVersion.content_snapshot || ''
    );
  }, [oldVersion.content_snapshot, newVersion.content_snapshot]);

  // Filter diff lines if showing only changes
  const displayedDiff = useMemo(() => {
    if (!showOnlyChanges) return diff;
    return diff.filter(line => line.type !== 'unchanged');
  }, [diff, showOnlyChanges]);

  // Stats
  const stats = useMemo(() => {
    const added = diff.filter(l => l.type === 'added').length;
    const removed = diff.filter(l => l.type === 'removed').length;
    const modified = diff.filter(l => l.type === 'modified').length;
    return { added, removed, modified, total: diff.length };
  }, [diff]);

  // Copy version content
  const copyContent = async (version: 'old' | 'new') => {
    const content = version === 'old' ? oldVersion.content_snapshot : newVersion.content_snapshot;
    await navigator.clipboard.writeText(content);
    setCopiedVersion(version);
    setTimeout(() => setCopiedVersion(null), 2000);
  };

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render version header
  const renderVersionHeader = (version: DocumentVersion, side: 'old' | 'new') => (
    <div className={cn(
      'p-4 border-b',
      side === 'old' ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-green-50/50 dark:bg-green-950/20'
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={version.author?.avatar} />
            <AvatarFallback className="text-xs">
              {getInitials(version.author?.name || 'Unknown')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{version.author?.name || 'Unknown'}</span>
              {version.label && (
                <Badge variant="secondary" className="text-xs">
                  {version.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              v{version.version_number} • {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyContent(side)}
                >
                  {copiedVersion === side ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onRestoreVersion && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRestoreVersion(version)}
            >
              Restore
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  // Render diff line
  const renderDiffLine = (line: DiffLine, index: number) => {
    const bgColors = {
      unchanged: '',
      added: 'bg-green-100 dark:bg-green-900/30',
      removed: 'bg-red-100 dark:bg-red-900/30',
      modified: 'bg-yellow-100 dark:bg-yellow-900/30',
    };

    const textColors = {
      unchanged: 'text-foreground',
      added: 'text-green-800 dark:text-green-200',
      removed: 'text-red-800 dark:text-red-200',
      modified: 'text-yellow-800 dark:text-yellow-200',
    };

    const icons = {
      unchanged: null,
      added: <Plus className="w-3 h-3 text-green-500" />,
      removed: <Minus className="w-3 h-3 text-red-500" />,
      modified: <RefreshCw className="w-3 h-3 text-yellow-500" />,
    };

    return (
      <div
        key={index}
        className={cn(
          'flex items-stretch text-sm font-mono hover:bg-muted/50 transition-colors',
          bgColors[line.type]
        )}
      >
        {/* Line numbers */}
        <div className="flex-shrink-0 w-20 flex border-r">
          <span className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground border-r">
            {line.lineNumber.old || ''}
          </span>
          <span className="w-10 px-2 py-0.5 text-right text-xs text-muted-foreground">
            {line.lineNumber.new || ''}
          </span>
        </div>

        {/* Icon */}
        <div className="flex-shrink-0 w-6 flex items-center justify-center">
          {icons[line.type]}
        </div>

        {/* Content */}
        <div className={cn('flex-1 px-2 py-0.5 whitespace-pre-wrap break-all', textColors[line.type])}>
          {line.type === 'modified' ? (
            <>
              <span className="line-through text-red-600 dark:text-red-400 mr-2">
                {line.oldContent}
              </span>
              <span className="text-green-600 dark:text-green-400">{line.content}</span>
            </>
          ) : (
            line.content || '\u00A0'
          )}
        </div>
      </div>
    );
  };

  // Render split view
  const renderSplitView = () => (
    <div className="flex h-full">
      {/* Old version */}
      <div className="flex-1 flex flex-col border-r">
        {renderVersionHeader(oldVersion, 'old')}
        <ScrollArea className="flex-1">
          <div className="p-4 font-mono text-sm whitespace-pre-wrap">
            {oldVersion.content_snapshot?.split('\n').map((line, i) => {
              const diffLine = diff.find(d => d.lineNumber.old === i + 1);
              const isRemoved = diffLine?.type === 'removed';
              const isModified = diffLine?.type === 'modified';

              return (
                <div
                  key={i}
                  className={cn(
                    'py-0.5 px-2 -mx-2',
                    isRemoved && 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
                    isModified && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 line-through'
                  )}
                >
                  <span className="text-xs text-muted-foreground w-8 inline-block">{i + 1}</span>
                  {line || '\u00A0'}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* New version */}
      <div className="flex-1 flex flex-col">
        {renderVersionHeader(newVersion, 'new')}
        <ScrollArea className="flex-1">
          <div className="p-4 font-mono text-sm whitespace-pre-wrap">
            {newVersion.content_snapshot?.split('\n').map((line, i) => {
              const diffLine = diff.find(d => d.lineNumber.new === i + 1);
              const isAdded = diffLine?.type === 'added';
              const isModified = diffLine?.type === 'modified';

              return (
                <div
                  key={i}
                  className={cn(
                    'py-0.5 px-2 -mx-2',
                    isAdded && 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
                    isModified && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                  )}
                >
                  <span className="text-xs text-muted-foreground w-8 inline-block">{i + 1}</span>
                  {line || '\u00A0'}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  // Render unified view
  const renderUnifiedView = () => (
    <div className="flex flex-col h-full">
      {/* Headers */}
      <div className="grid grid-cols-2 border-b">
        {renderVersionHeader(oldVersion, 'old')}
        {renderVersionHeader(newVersion, 'new')}
      </div>

      {/* Unified diff */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {displayedDiff.map((line, index) => renderDiffLine(line, index))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <Card className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitCompare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Compare Versions</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList className="h-8">
                <TabsTrigger value="split" className="text-xs gap-1 px-2">
                  <SplitSquareHorizontal className="w-3 h-3" />
                  Split
                </TabsTrigger>
                <TabsTrigger value="unified" className="text-xs gap-1 px-2">
                  <AlignJustify className="w-3 h-3" />
                  Unified
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Show only changes toggle */}
            <Button
              variant={showOnlyChanges ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowOnlyChanges(!showOnlyChanges)}
            >
              Changes only
            </Button>

            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <Plus className="w-4 h-4" />
            <span>{stats.added} added</span>
          </div>
          <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
            <Minus className="w-4 h-4" />
            <span>{stats.removed} removed</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
            <RefreshCw className="w-4 h-4" />
            <span>{stats.modified} modified</span>
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'split' ? renderSplitView() : renderUnifiedView()}
      </div>
    </Card>
  );
}

// =====================================================
// Diff Algorithm
// =====================================================

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffLine[] = [];

  // Simple line-by-line diff (for a production app, use a proper diff library)
  const maxLen = Math.max(oldLines.length, newLines.length);
  let oldLineNum = 1;
  let newLineNum = 1;

  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === undefined && newLine !== undefined) {
      // Line added
      diff.push({
        type: 'added',
        lineNumber: { new: newLineNum++ },
        content: newLine,
      });
    } else if (oldLine !== undefined && newLine === undefined) {
      // Line removed
      diff.push({
        type: 'removed',
        lineNumber: { old: oldLineNum++ },
        content: oldLine,
      });
    } else if (oldLine === newLine) {
      // Unchanged
      diff.push({
        type: 'unchanged',
        lineNumber: { old: oldLineNum++, new: newLineNum++ },
        content: newLine,
      });
    } else {
      // Modified
      diff.push({
        type: 'modified',
        lineNumber: { old: oldLineNum++, new: newLineNum++ },
        content: newLine,
        oldContent: oldLine,
      });
    }
  }

  return diff;
}

export default DiffViewer;
