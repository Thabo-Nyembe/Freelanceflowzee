'use client'

/**
 * Video Editor Component
 *
 * Complete browser-based video editor using FFmpeg.wasm
 * Features: Timeline, Media Browser, Preview, Filters, Export
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useVideoEditor, type Track, type TimelineClip, type VideoFile, type AudioFile } from '@/lib/hooks/use-video-editor'
import { formatDuration, formatFileSize } from '@/lib/video/ffmpeg-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Download,
  Upload,
  Scissors,
  Copy,
  Trash2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Layers,
  Film,
  Music,
  Image,
  Type,
  Wand2,
  Settings,
  Save,
  FolderOpen,
  Plus,
  Minus,
  RotateCcw,
  Crop,
  Palette,
  Sparkles,
  Grid3X3,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ============================================================================
// Types
// ============================================================================

interface VideoEditorProps {
  projectId?: string
  onSave?: (project: ReturnType<typeof useVideoEditor>['saveProject']) => void
}

// ============================================================================
// Timeline Component
// ============================================================================

function Timeline({
  tracks,
  duration,
  currentTime,
  zoom,
  selectedClipIds,
  onSeek,
  onClipSelect,
  onClipMove,
  onClipResize,
  onTrackToggle,
}: {
  tracks: Track[]
  duration: number
  currentTime: number
  zoom: number
  selectedClipIds: string[]
  onSeek: (time: number) => void
  onClipSelect: (clipId: string, addToSelection?: boolean) => void
  onClipMove: (clipId: string, trackId: string, startTime: number) => void
  onClipResize: (clipId: string, duration: number) => void
  onTrackToggle: (trackId: string, property: 'muted' | 'locked' | 'visible') => void
}) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const pixelsPerSecond = 50 * zoom
  const totalWidth = Math.max(duration * pixelsPerSecond, 800)

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft
      const time = x / pixelsPerSecond
      onSeek(Math.max(0, Math.min(time, duration)))
    }
  }, [pixelsPerSecond, duration, onSeek])

  // Generate time markers
  const markers: number[] = []
  const markerInterval = zoom > 1.5 ? 1 : zoom > 0.5 ? 5 : 10
  for (let t = 0; t <= duration; t += markerInterval) {
    markers.push(t)
  }

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Time ruler */}
      <div className="h-8 bg-gray-900 border-b border-gray-800 flex-shrink-0">
        <div
          className="relative h-full overflow-hidden"
          style={{ width: totalWidth }}
        >
          {markers.map((time) => (
            <div
              key={time}
              className="absolute top-0 h-full flex flex-col items-center"
              style={{ left: time * pixelsPerSecond }}
            >
              <span className="text-[10px] text-gray-500 mt-1">
                {formatDuration(time)}
              </span>
              <div className="flex-1 border-l border-gray-700" />
            </div>
          ))}
        </div>
      </div>

      {/* Tracks */}
      <ScrollArea className="flex-1">
        <div
          ref={timelineRef}
          className="relative min-h-full"
          style={{ width: totalWidth }}
          onClick={handleTimelineClick}
        >
          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none"
            style={{ left: currentTime * pixelsPerSecond }}
          >
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
          </div>

          {/* Track rows */}
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`relative h-16 border-b border-gray-800 ${
                track.type === 'video' ? 'bg-gray-900/50' : 'bg-gray-900/30'
              }`}
            >
              {/* Track header */}
              <div className="absolute left-0 top-0 bottom-0 w-32 bg-gray-900 border-r border-gray-800 flex items-center px-2 gap-2 z-10">
                <GripVertical className="h-4 w-4 text-gray-600" />
                <div className="flex-1 truncate">
                  <span className="text-xs text-gray-400">{track.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTrackToggle(track.id, 'muted')
                    }}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    {track.muted ? (
                      <VolumeX className="h-3 w-3 text-gray-500" />
                    ) : (
                      <Volume2 className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTrackToggle(track.id, 'visible')
                    }}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    {track.visible ? (
                      <Eye className="h-3 w-3 text-gray-400" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onTrackToggle(track.id, 'locked')
                    }}
                    className="p-1 hover:bg-gray-800 rounded"
                  >
                    {track.locked ? (
                      <Lock className="h-3 w-3 text-yellow-500" />
                    ) : (
                      <Unlock className="h-3 w-3 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Clips */}
              <div className="absolute left-32 right-0 top-0 bottom-0">
                {track.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className={`absolute top-1 bottom-1 rounded cursor-pointer transition-all ${
                      selectedClipIds.includes(clip.id)
                        ? 'ring-2 ring-blue-500'
                        : ''
                    } ${
                      track.type === 'video'
                        ? 'bg-blue-600/80 hover:bg-blue-600'
                        : 'bg-green-600/80 hover:bg-green-600'
                    }`}
                    style={{
                      left: clip.startTime * pixelsPerSecond,
                      width: clip.duration * pixelsPerSecond
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onClipSelect(clip.id, e.shiftKey)
                    }}
                  >
                    <div className="px-2 py-1 truncate">
                      <span className="text-xs text-white font-medium">
                        {formatDuration(clip.duration)}
                      </span>
                    </div>

                    {/* Resize handles */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/0 hover:bg-white/20"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-white/0 hover:bg-white/20"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {tracks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No tracks. Add media to get started.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// Media Browser Component
// ============================================================================

function MediaBrowser({
  mediaPool,
  onAddMedia,
  onRemoveMedia,
  onDragStart,
}: {
  mediaPool: (VideoFile | AudioFile)[]
  onAddMedia: (files: FileList) => void
  onRemoveMedia: (mediaId: string) => void
  onDragStart: (mediaId: string) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddMedia(e.target.files)
      e.target.value = ''
    }
  }, [onAddMedia])

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <Button onClick={handleFileSelect} className="w-full">
          <Upload className="h-4 w-4 mr-2" />
          Import Media
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*,image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="grid grid-cols-2 gap-2">
          {mediaPool.map((media) => {
            const isVideo = 'width' in media && 'height' in media
            const isAudio = 'waveform' in media

            return (
              <div
                key={media.id}
                draggable
                onDragStart={() => onDragStart(media.id)}
                className="relative group rounded-lg overflow-hidden bg-gray-800 cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
              >
                {isVideo && (media as VideoFile).thumbnail && (
                  <img
                    src={(media as VideoFile).thumbnail}
                    alt={media.name}
                    className="w-full aspect-video object-cover"
                  />
                )}

                {isAudio && (
                  <div className="w-full aspect-video bg-gray-700 flex items-center justify-center">
                    <Music className="h-8 w-8 text-gray-500" />
                  </div>
                )}

                {!isVideo && !isAudio && (
                  <div className="w-full aspect-video bg-gray-700 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-500" />
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveMedia(media.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white truncate">{media.name}</p>
                  <p className="text-[10px] text-gray-400">
                    {formatDuration(media.duration)} • {formatFileSize(media.size)}
                  </p>
                </div>

                {/* Type badge */}
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {isVideo ? 'VIDEO' : isAudio ? 'AUDIO' : 'IMAGE'}
                  </Badge>
                </div>
              </div>
            )
          })}

          {mediaPool.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <Film className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No media files</p>
              <p className="text-xs">Import videos, audio, or images</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// Properties Panel Component
// ============================================================================

function PropertiesPanel({
  selectedClip,
  onUpdateClip,
  onAddFilter,
}: {
  selectedClip: TimelineClip | null
  onUpdateClip: (updates: Partial<TimelineClip>) => void
  onAddFilter: (filter: { type: string; enabled: boolean; params: Record<string, any> }) => void
}) {
  if (!selectedClip) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 p-4">
        <div className="text-center">
          <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a clip to edit properties</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Transform */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Transform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start Time</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedClip.startTime.toFixed(1)}
                  onChange={(e) => onUpdateClip({ startTime: parseFloat(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs">Duration</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={selectedClip.duration.toFixed(1)}
                  onChange={(e) => onUpdateClip({ duration: parseFloat(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Opacity</Label>
              <Slider
                value={[selectedClip.opacity ?? 1]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => onUpdateClip({ opacity: value })}
              />
            </div>

            <div>
              <Label className="text-xs">Volume</Label>
              <Slider
                value={[selectedClip.volume ?? 1]}
                min={0}
                max={2}
                step={0.01}
                onValueChange={([value]) => onUpdateClip({ volume: value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              Filters
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'brightness', enabled: true, params: { value: 0 } })}>
                    Brightness
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'contrast', enabled: true, params: { value: 1 } })}>
                    Contrast
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'saturation', enabled: true, params: { value: 1 } })}>
                    Saturation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'blur', enabled: true, params: { radius: 5 } })}>
                    Blur
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'sharpen', enabled: true, params: { amount: 1 } })}>
                    Sharpen
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'grayscale', enabled: true, params: {} })}>
                    Grayscale
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'sepia', enabled: true, params: {} })}>
                    Sepia
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddFilter({ type: 'vignette', enabled: true, params: { intensity: 4 } })}>
                    Vignette
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedClip.filters && selectedClip.filters.length > 0 ? (
              <div className="space-y-2">
                {selectedClip.filters.map((filter) => (
                  <div
                    key={filter.id}
                    className="flex items-center justify-between p-2 bg-gray-800 rounded"
                  >
                    <span className="text-sm capitalize">{filter.type}</span>
                    <Badge variant={filter.enabled ? 'default' : 'secondary'}>
                      {filter.enabled ? 'On' : 'Off'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500">No filters applied</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}

// ============================================================================
// Main Video Editor Component
// ============================================================================

export function VideoEditor({ projectId, onSave }: VideoEditorProps) {
  const {
    project,
    editorState,
    playbackState,
    selectionState,
    newProject,
    loadProject,
    saveProject,
    updateSettings,
    addMedia,
    removeMedia,
    getMediaById,
    addTrack,
    removeTrack,
    updateTrack,
    addClip,
    removeClip,
    updateClip,
    moveClip,
    splitClip,
    duplicateClip,
    getClipById,
    addFilter,
    removeFilter,
    selectClip,
    deselectClip,
    clearSelection,
    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    exportProject,
    undo,
    redo,
    canUndo,
    canRedo,
    formatTime,
  } = useVideoEditor()

  const [zoom, setZoom] = useState(1)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [draggedMediaId, setDraggedMediaId] = useState<string | null>(null)

  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  // Initialize project if none
  useEffect(() => {
    if (!project) {
      setShowNewProjectDialog(true)
    }
  }, [project])

  // Get selected clip
  const selectedClip = selectionState.selectedClipIds.length === 1
    ? getClipById(selectionState.selectedClipIds[0])
    : null

  // Handlers
  const handleCreateProject = useCallback(() => {
    if (newProjectName.trim()) {
      newProject(newProjectName.trim())
      setShowNewProjectDialog(false)
      setNewProjectName('')
      toast.success('Project created')
    }
  }, [newProjectName, newProject])

  const handleAddMedia = useCallback(async (files: FileList) => {
    try {
      await addMedia(files)
      toast.success(`Added ${files.length} file(s)`)
    } catch {
      toast.error('Failed to add media')
    }
  }, [addMedia])

  const handleExport = useCallback(async () => {
    setShowExportDialog(false)
    const result = await exportProject()
    if (result?.success && result.url) {
      // Download the file
      const a = document.createElement('a')
      a.href = result.url
      a.download = `${project?.name || 'export'}.${result.format}`
      a.click()
      toast.success('Export completed')
    } else {
      toast.error(result?.error || 'Export failed')
    }
  }, [exportProject, project])

  const handleTrackToggle = useCallback((trackId: string, property: 'muted' | 'locked' | 'visible') => {
    const track = project?.tracks.find(t => t.id === trackId)
    if (track) {
      updateTrack(trackId, { [property]: !track[property] })
    }
  }, [project, updateTrack])

  const handleDropOnTimeline = useCallback((trackId: string, startTime: number) => {
    if (draggedMediaId) {
      addClip(trackId, draggedMediaId, startTime)
      setDraggedMediaId(null)
      toast.success('Clip added')
    }
  }, [draggedMediaId, addClip])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return

      switch (e.key) {
        case ' ':
          e.preventDefault()
          playbackState.isPlaying ? pause() : play()
          break
        case 'z':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            e.shiftKey ? redo() : undo()
          }
          break
        case 's':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            const data = saveProject()
            if (data && onSave) {
              onSave(saveProject)
              toast.success('Project saved')
            }
          }
          break
        case 'Delete':
        case 'Backspace':
          if (selectionState.selectedClipIds.length > 0) {
            selectionState.selectedClipIds.forEach(removeClip)
            toast.success('Clip(s) deleted')
          }
          break
        case 'd':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault()
            if (selectedClip) {
              duplicateClip(selectedClip.id)
              toast.success('Clip duplicated')
            }
          }
          break
        case 'Escape':
          clearSelection()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [playbackState.isPlaying, play, pause, undo, redo, saveProject, onSave, selectionState.selectedClipIds, selectedClip, removeClip, duplicateClip, clearSelection])

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      {/* Loading overlay */}
      {editorState.isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading FFmpeg.wasm...</p>
            <Progress value={editorState.loadProgress * 100} className="w-64 mt-4" />
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {(editorState.isProcessing || editorState.isExporting) && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className="text-lg">
              {editorState.isExporting ? 'Exporting...' : 'Processing...'}
            </p>
            <Progress
              value={(editorState.isExporting ? editorState.exportProgress : editorState.processProgress) * 100}
              className="w-64 mt-4"
            />
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2 flex-shrink-0">
        {/* Project actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <FolderOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const data = saveProject()
              if (data && onSave) {
                onSave(saveProject)
                toast.success('Project saved')
              }
            }}
          >
            <Save className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Edit actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Clip actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            disabled={!selectedClip}
            onClick={() => {
              if (selectedClip) {
                splitClip(selectedClip.id, playbackState.currentTime)
                toast.success('Clip split')
              }
            }}
          >
            <Scissors className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!selectedClip}
            onClick={() => {
              if (selectedClip) {
                duplicateClip(selectedClip.id)
                toast.success('Clip duplicated')
              }
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={selectionState.selectedClipIds.length === 0}
            onClick={() => {
              selectionState.selectedClipIds.forEach(removeClip)
              toast.success('Clip(s) deleted')
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Track actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Layers className="h-4 w-4 mr-2" />
              Add Track
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => addTrack('video')}>
              <Film className="h-4 w-4 mr-2" />
              Video Track
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addTrack('audio')}>
              <Music className="h-4 w-4 mr-2" />
              Audio Track
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Project name */}
        <span className="text-sm text-gray-400">{project?.name || 'Untitled'}</span>

        <div className="flex-1" />

        {/* Export */}
        <Button onClick={() => setShowExportDialog(true)} disabled={!project}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Media browser */}
        <div className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0">
          <Tabs defaultValue="media" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-gray-800 bg-transparent h-10">
              <TabsTrigger value="media" className="text-xs">Media</TabsTrigger>
              <TabsTrigger value="effects" className="text-xs">Effects</TabsTrigger>
              <TabsTrigger value="audio" className="text-xs">Audio</TabsTrigger>
            </TabsList>
            <TabsContent value="media" className="flex-1 m-0">
              <MediaBrowser
                mediaPool={project?.mediaPool || []}
                onAddMedia={handleAddMedia}
                onRemoveMedia={removeMedia}
                onDragStart={setDraggedMediaId}
              />
            </TabsContent>
            <TabsContent value="effects" className="flex-1 m-0 p-4">
              <div className="text-center text-gray-500">
                <Wand2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Effects & Transitions</p>
              </div>
            </TabsContent>
            <TabsContent value="audio" className="flex-1 m-0 p-4">
              <div className="text-center text-gray-500">
                <Music className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Audio Mixer</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Preview and Timeline */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview */}
          <div className="flex-1 bg-black flex items-center justify-center min-h-[300px]">
            <div className="relative bg-gray-900 aspect-video max-w-full max-h-full">
              <video
                ref={videoPreviewRef}
                className="w-full h-full"
                src={undefined}
                muted={playbackState.muted}
              />

              {/* Preview placeholder */}
              {!videoPreviewRef.current?.src && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  <div className="text-center">
                    <Film className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Add media to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Playback controls */}
          <div className="h-14 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={stop}>
                <Square className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => seek(Math.max(0, playbackState.currentTime - 5))}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={playbackState.isPlaying ? pause : play}
              >
                {playbackState.isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => seek(playbackState.currentTime + 5)}>
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Time display */}
            <div className="text-sm font-mono">
              {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration)}
            </div>

            <div className="flex-1" />

            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleMute}>
                {playbackState.muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[playbackState.volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={([value]) => setVolume(value)}
                className="w-24"
              />
            </div>

            {/* Playback speed */}
            <Select
              value={playbackState.playbackRate.toString()}
              onValueChange={(v) => setPlaybackRate(parseFloat(v))}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25x</SelectItem>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>

            {/* Zoom */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(4, zoom + 0.25))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <div className="h-48 border-t border-gray-800">
            <Timeline
              tracks={project?.tracks || []}
              duration={project?.duration || 0}
              currentTime={playbackState.currentTime}
              zoom={zoom}
              selectedClipIds={selectionState.selectedClipIds}
              onSeek={seek}
              onClipSelect={selectClip}
              onClipMove={moveClip}
              onClipResize={(clipId, duration) => updateClip(clipId, { duration })}
              onTrackToggle={handleTrackToggle}
            />
          </div>
        </div>

        {/* Right panel - Properties */}
        <div className="w-72 bg-gray-900 border-l border-gray-800 flex-shrink-0">
          <Tabs defaultValue="properties" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-gray-800 bg-transparent h-10">
              <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
              <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
              <PropertiesPanel
                selectedClip={selectedClip || null}
                onUpdateClip={(updates) => {
                  if (selectedClip) {
                    updateClip(selectedClip.id, updates)
                  }
                }}
                onAddFilter={(filter) => {
                  if (selectedClip) {
                    addFilter(selectedClip.id, filter as any)
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="text" className="flex-1 m-0 p-4">
              <div className="text-center text-gray-500">
                <Type className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Text & Titles</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* New Project Dialog */}
      <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Create a new video editing project
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Project Name</Label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="My Video Project"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewProjectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Export Video</DialogTitle>
            <DialogDescription>
              Configure export settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Format</Label>
              <Select
                value={project?.settings.outputFormat || 'mp4'}
                onValueChange={(v: 'mp4' | 'webm' | 'mov' | 'gif') => updateSettings({ outputFormat: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                  <SelectItem value="webm">WebM (VP9)</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quality</Label>
              <Select
                value={project?.settings.quality || 'high'}
                onValueChange={(v: 'low' | 'medium' | 'high' | 'ultra') => updateSettings({ quality: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Smaller file)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Recommended)</SelectItem>
                  <SelectItem value="ultra">Ultra (Best quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Resolution</Label>
              <Select
                value={project?.settings.resolution || '1080p'}
                onValueChange={(v: '720p' | '1080p' | '1440p' | '4k' | 'custom') => updateSettings({ resolution: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="720p">720p (1280x720)</SelectItem>
                  <SelectItem value="1080p">1080p (1920x1080)</SelectItem>
                  <SelectItem value="1440p">1440p (2560x1440)</SelectItem>
                  <SelectItem value="4k">4K (3840x2160)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default VideoEditor
