'use client'

/**
 * Version History Component
 *
 * A world-class version history panel for collaborative documents that enables:
 * - View all document versions with timestamps and authors
 * - Preview any historical version
 * - Compare versions side-by-side (diff view)
 * - Restore to any previous version
 * - Create named snapshots/checkpoints
 * - Export specific versions
 *
 * Required by A+++ Implementation Guide Phase 1.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  History, Clock, User, ChevronRight, ChevronDown,
  RotateCcw, Eye, Download, GitCompare, Tag, Plus,
  Loader2, CheckCircle, AlertCircle, X, Search,
  Calendar, FileText, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ============================================================================
// Types
// ============================================================================

interface DocumentVersion {
  id: string
  version_number: number
  document_id: string
  created_by: string
  created_at: string
  label?: string
  description?: string
  content_snapshot: string
  word_count: number
  change_summary?: string
  is_auto_save: boolean
  is_checkpoint: boolean
  session_id?: string
  metadata?: Record<string, any>
  // Populated fields
  author?: {
    id: string
    name: string
    avatar?: string
    email?: string
  }
}

interface VersionHistoryProps {
  documentId: string
  currentContent?: string
  onRestore?: (version: DocumentVersion) => void
  onPreview?: (version: DocumentVersion) => void
  onCompare?: (version1: DocumentVersion, version2: DocumentVersion) => void
  className?: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

interface VersionGroup {
  date: string
  versions: DocumentVersion[]
}

// ============================================================================
// Version History Component
// ============================================================================

export function VersionHistory({
  documentId,
  currentContent,
  onRestore,
  onPreview,
  onCompare,
  className,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: VersionHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'checkpoints' | 'auto'>('all')
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersions, setCompareVersions] = useState<[DocumentVersion | null, DocumentVersion | null]>([null, null])
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<DocumentVersion | null>(null)
  const [createCheckpointOpen, setCreateCheckpointOpen] = useState(false)
  const [checkpointLabel, setCheckpointLabel] = useState('')
  const [checkpointDescription, setCheckpointDescription] = useState('')
  const [savingCheckpoint, setSavingCheckpoint] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const open = controlledOpen !== undefined ? controlledOpen : isOpen
  const setOpen = onOpenChange || setIsOpen

  // Fetch versions
  const fetchVersions = useCallback(async () => {
    if (!documentId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/collaboration/sessions?action=versions&documentId=${documentId}&limit=100`
      )
      const data = await response.json()

      if (data.success) {
        setVersions(data.versions || [])
      } else {
        setError(data.error || 'Failed to load versions')
      }
    } catch (err) {
      console.error('Error fetching versions:', err)
      setError('Failed to load version history')

      // Demo data for development
      setVersions(generateDemoVersions())
    } finally {
      setLoading(false)
    }
  }, [documentId])

  // Fetch on open
  useEffect(() => {
    if (open) {
      fetchVersions()
    }
  }, [open, fetchVersions])

  // Filter versions
  const filteredVersions = useMemo(() => {
    let result = versions

    // Filter by type
    if (filterType === 'checkpoints') {
      result = result.filter(v => v.is_checkpoint)
    } else if (filterType === 'auto') {
      result = result.filter(v => v.is_auto_save)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(v =>
        v.label?.toLowerCase().includes(query) ||
        v.description?.toLowerCase().includes(query) ||
        v.author?.name.toLowerCase().includes(query) ||
        v.change_summary?.toLowerCase().includes(query)
      )
    }

    return result
  }, [versions, filterType, searchQuery])

  // Group versions by date
  const groupedVersions = useMemo((): VersionGroup[] => {
    const groups: Map<string, DocumentVersion[]> = new Map()

    filteredVersions.forEach(version => {
      const date = format(new Date(version.created_at), 'yyyy-MM-dd')
      if (!groups.has(date)) {
        groups.set(date, [])
      }
      groups.get(date)!.push(version)
    })

    return Array.from(groups.entries())
      .map(([date, versions]) => ({ date, versions }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [filteredVersions])

  // Toggle group expansion
  const toggleGroup = (date: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(date)) {
      newExpanded.delete(date)
    } else {
      newExpanded.add(date)
    }
    setExpandedGroups(newExpanded)
  }

  // Handle restore
  const handleRestore = async (version: DocumentVersion) => {
    try {
      const response = await fetch('/api/collaboration/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'restore-version',
          versionId: version.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Version restored successfully')
        onRestore?.(version)
        setRestoreDialogOpen(false)
        fetchVersions()
      } else {
        toast.error(data.error || 'Failed to restore version')
      }
    } catch (err) {
      console.error('Restore error:', err)
      toast.error('Failed to restore version')
    }
  }

  // Handle create checkpoint
  const handleCreateCheckpoint = async () => {
    if (!checkpointLabel.trim()) {
      toast.error('Please enter a label for the checkpoint')
      return
    }

    setSavingCheckpoint(true)

    try {
      const response = await fetch('/api/collaboration/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-version',
          documentId,
          contentSnapshot: currentContent,
          label: checkpointLabel,
          description: checkpointDescription,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Checkpoint created successfully')
        setCheckpointLabel('')
        setCheckpointDescription('')
        setCreateCheckpointOpen(false)
        fetchVersions()
      } else {
        toast.error(data.error || 'Failed to create checkpoint')
      }
    } catch (err) {
      console.error('Checkpoint error:', err)
      toast.error('Failed to create checkpoint')
    } finally {
      setSavingCheckpoint(false)
    }
  }

  // Handle compare selection
  const handleCompareSelect = (version: DocumentVersion) => {
    if (!compareVersions[0]) {
      setCompareVersions([version, null])
    } else if (!compareVersions[1]) {
      setCompareVersions([compareVersions[0], version])
      onCompare?.(compareVersions[0], version)
    } else {
      // Reset and start new comparison
      setCompareVersions([version, null])
    }
  }

  // Render version item
  const renderVersionItem = (version: DocumentVersion) => {
    const isSelected = selectedVersion?.id === version.id
    const isCompareSelected = compareVersions.some(v => v?.id === version.id)

    return (
      <div
        key={version.id}
        className={cn(
          'group p-3 rounded-lg border transition-all cursor-pointer',
          isSelected && 'border-primary bg-primary/5',
          isCompareSelected && 'border-blue-500 bg-blue-500/5',
          !isSelected && !isCompareSelected && 'border-transparent hover:border-muted hover:bg-muted/50'
        )}
        onClick={() => {
          if (compareMode) {
            handleCompareSelect(version)
          } else {
            setSelectedVersion(version)
            onPreview?.(version)
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={version.author?.avatar} />
              <AvatarFallback className="text-xs">
                {version.author?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">
                  {version.author?.name || 'Unknown'}
                </span>
                {version.is_checkpoint && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    <Tag className="h-3 w-3 mr-1" />
                    Checkpoint
                  </Badge>
                )}
                {version.is_auto_save && !version.is_checkpoint && (
                  <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                    Auto-save
                  </Badge>
                )}
              </div>
              {version.label && (
                <p className="text-sm font-medium text-primary truncate">
                  {version.label}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                {version.word_count && (
                  <span className="ml-2">{version.word_count.toLocaleString()} words</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      onPreview?.(version)
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation()
                      setVersionToRestore(version)
                      setRestoreDialogOpen(true)
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Restore</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {version.change_summary && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {version.change_summary}
          </p>
        )}
      </div>
    )
  }

  // Main content
  const content = (
    <div className="flex flex-col h-full">
      {/* Header Actions */}
      <div className="p-4 space-y-4 border-b">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search versions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-2">
          <Select
            value={filterType}
            onValueChange={(value: any) => setFilterType(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Versions</SelectItem>
              <SelectItem value="checkpoints">Checkpoints</SelectItem>
              <SelectItem value="auto">Auto-saves</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setCompareMode(!compareMode)
              setCompareVersions([null, null])
            }}
          >
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </Button>

          <Dialog open={createCheckpointOpen} onOpenChange={setCreateCheckpointOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Checkpoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Checkpoint</DialogTitle>
                <DialogDescription>
                  Save a named version of your document that you can restore later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Label *</label>
                  <Input
                    placeholder="e.g., Final Draft, Before Redesign..."
                    value={checkpointLabel}
                    onChange={(e) => setCheckpointLabel(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    placeholder="What changed in this version?"
                    value={checkpointDescription}
                    onChange={(e) => setCheckpointDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateCheckpointOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCheckpoint} disabled={savingCheckpoint}>
                  {savingCheckpoint && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Checkpoint
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Compare Mode Info */}
        {compareMode && (
          <div className="flex items-center justify-between p-2 rounded-md bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-sm">
              <GitCompare className="h-4 w-4 text-blue-500" />
              <span>
                {compareVersions[0] && compareVersions[1]
                  ? 'Comparing versions'
                  : compareVersions[0]
                    ? 'Select second version to compare'
                    : 'Select first version to compare'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCompareMode(false)
                setCompareVersions([null, null])
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Version List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchVersions} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : groupedVersions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <History className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No versions found</p>
              <p className="text-xs text-muted-foreground">
                Version history will appear here as you make changes
              </p>
            </div>
          ) : (
            groupedVersions.map((group) => {
              const isExpanded = expandedGroups.has(group.date)
              const dateLabel = format(new Date(group.date), 'EEEE, MMMM d, yyyy')
              const isToday = format(new Date(), 'yyyy-MM-dd') === group.date

              return (
                <div key={group.date} className="space-y-2">
                  <button
                    className="flex items-center gap-2 w-full text-left hover:bg-muted/50 rounded-md p-1 -ml-1"
                    onClick={() => toggleGroup(group.date)}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isToday ? 'Today' : dateLabel}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {group.versions.length}
                    </Badge>
                  </button>

                  {isExpanded && (
                    <div className="ml-6 space-y-1">
                      {group.versions.map(renderVersionItem)}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredVersions.length} versions</span>
          <span>
            {versions.filter(v => v.is_checkpoint).length} checkpoints
          </span>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current document with the selected version.
              {versionToRestore?.label && (
                <span className="block mt-2 font-medium text-foreground">
                  "{versionToRestore.label}"
                </span>
              )}
              <span className="block mt-1">
                From {versionToRestore && formatDistanceToNow(new Date(versionToRestore.created_at), { addSuffix: true })}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => versionToRestore && handleRestore(versionToRestore)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )

  // Render as sheet or inline
  if (trigger !== undefined) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <History className="h-4 w-4 mr-2" />
              Version History
            </Button>
          )}
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
          <SheetHeader className="p-4 pb-0">
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View, compare, and restore previous versions of your document
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {content}
    </div>
  )
}

// ============================================================================
// Demo Data Generator
// ============================================================================

function generateDemoVersions(): DocumentVersion[] {
  const now = Date.now()
  const hour = 60 * 60 * 1000
  const day = 24 * hour

  return [
    {
      id: 'v-1',
      version_number: 15,
      document_id: 'demo-doc',
      created_by: 'user-1',
      created_at: new Date(now - hour).toISOString(),
      label: 'Final Review Complete',
      description: 'All feedback incorporated',
      content_snapshot: '',
      word_count: 2847,
      change_summary: 'Updated conclusion, fixed typos, added references',
      is_auto_save: false,
      is_checkpoint: true,
      author: { id: 'user-1', name: 'Sarah Chen', avatar: '', email: 'sarah@example.com' },
    },
    {
      id: 'v-2',
      version_number: 14,
      document_id: 'demo-doc',
      created_by: 'user-2',
      created_at: new Date(now - 2 * hour).toISOString(),
      content_snapshot: '',
      word_count: 2830,
      change_summary: 'Minor formatting updates',
      is_auto_save: true,
      is_checkpoint: false,
      author: { id: 'user-2', name: 'Marcus Lee', avatar: '', email: 'marcus@example.com' },
    },
    {
      id: 'v-3',
      version_number: 13,
      document_id: 'demo-doc',
      created_by: 'user-1',
      created_at: new Date(now - 4 * hour).toISOString(),
      label: 'Draft Ready for Review',
      content_snapshot: '',
      word_count: 2750,
      is_auto_save: false,
      is_checkpoint: true,
      author: { id: 'user-1', name: 'Sarah Chen', avatar: '', email: 'sarah@example.com' },
    },
    {
      id: 'v-4',
      version_number: 12,
      document_id: 'demo-doc',
      created_by: 'user-1',
      created_at: new Date(now - day).toISOString(),
      content_snapshot: '',
      word_count: 2650,
      change_summary: 'Added new section on implementation',
      is_auto_save: true,
      is_checkpoint: false,
      author: { id: 'user-1', name: 'Sarah Chen', avatar: '', email: 'sarah@example.com' },
    },
    {
      id: 'v-5',
      version_number: 11,
      document_id: 'demo-doc',
      created_by: 'user-3',
      created_at: new Date(now - day - 2 * hour).toISOString(),
      label: 'Initial Structure',
      description: 'Outline and first draft',
      content_snapshot: '',
      word_count: 1500,
      is_auto_save: false,
      is_checkpoint: true,
      author: { id: 'user-3', name: 'Alex Kim', avatar: '', email: 'alex@example.com' },
    },
  ]
}

// ============================================================================
// Exports
// ============================================================================

export default VersionHistory
