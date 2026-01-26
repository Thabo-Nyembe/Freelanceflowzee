/**
 * Video Editor Hook
 *
 * Comprehensive React hook for browser-based video editing
 * using FFmpeg.wasm
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  loadFFmpeg,
  isFFmpegLoaded,
  getVideoMetadata,
  generateThumbnail,
  generateWaveform,
  trimVideo,
  applyFilters,
  reverseVideo,
  exportVideo,
  formatDuration,
  type VideoFile,
  type AudioFile,
  type TimelineClip,
  type Track,
  type VideoProject,
  type ProjectSettings,
  type VideoFilter,
  type Transition,
  type ExportResult,
  type FilterType,
  type TransitionType
} from '@/lib/video/ffmpeg-browser'

// ============================================================================
// Types
// ============================================================================

export interface EditorState {
  isLoading: boolean
  isProcessing: boolean
  isExporting: boolean
  loadProgress: number
  processProgress: number
  exportProgress: number
  error: string | null
}

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  muted: boolean
  playbackRate: number
}

export interface SelectionState {
  selectedClipIds: string[]
  selectedTrackId: string | null
  selectionStart: number | null
  selectionEnd: number | null
}

export interface HistoryEntry {
  id: string
  timestamp: Date
  action: string
  state: Partial<VideoProject>
}

export interface UseVideoEditorReturn {
  // Project state
  project: VideoProject | null
  editorState: EditorState
  playbackState: PlaybackState
  selectionState: SelectionState

  // Project management
  newProject: (name: string, settings?: Partial<ProjectSettings>) => void
  loadProject: (projectData: VideoProject) => void
  saveProject: () => VideoProject | null
  updateSettings: (settings: Partial<ProjectSettings>) => void

  // Media pool
  addMedia: (files: FileList | File[]) => Promise<void>
  removeMedia: (mediaId: string) => void
  getMediaById: (mediaId: string) => VideoFile | AudioFile | undefined

  // Track management
  addTrack: (type: 'video' | 'audio', name?: string) => string
  removeTrack: (trackId: string) => void
  updateTrack: (trackId: string, updates: Partial<Track>) => void
  reorderTracks: (trackIds: string[]) => void
  getTrackById: (trackId: string) => Track | undefined

  // Clip management
  addClip: (trackId: string, sourceId: string, startTime: number) => string | null
  removeClip: (clipId: string) => void
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void
  moveClip: (clipId: string, trackId: string, startTime: number) => void
  splitClip: (clipId: string, time: number) => [string, string] | null
  duplicateClip: (clipId: string) => string | null
  getClipById: (clipId: string) => TimelineClip | undefined

  // Filters and effects
  addFilter: (clipId: string, filter: Omit<VideoFilter, 'id'>) => string | null
  removeFilter: (clipId: string, filterId: string) => void
  updateFilter: (clipId: string, filterId: string, params: Record<string, any>) => void
  toggleFilter: (clipId: string, filterId: string) => void

  // Transitions
  addTransition: (clipId: string, transition: Omit<Transition, 'id'>) => string | null
  removeTransition: (clipId: string, transitionId: string) => void
  updateTransition: (clipId: string, transitionId: string, updates: Partial<Transition>) => void

  // Selection
  selectClip: (clipId: string, addToSelection?: boolean) => void
  deselectClip: (clipId: string) => void
  clearSelection: () => void
  selectTrack: (trackId: string | null) => void
  setSelectionRange: (start: number | null, end: number | null) => void

  // Playback
  play: () => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void

  // Processing operations
  processSelectedClips: (operation: 'trim' | 'speed' | 'reverse' | 'filters') => Promise<void>

  // Export
  exportProject: () => Promise<ExportResult | null>
  exportClip: (clipId: string) => Promise<ExportResult | null>
  exportSelection: () => Promise<ExportResult | null>

  // History
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  history: HistoryEntry[]

  // Utilities
  getTimelineData: () => { tracks: Track[]; duration: number }
  getClipsAtTime: (time: number) => TimelineClip[]
  snapToGrid: (time: number, gridSize?: number) => number
  formatTime: (seconds: number) => string
}

// ============================================================================
// Default Settings
// ============================================================================

const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  outputFormat: 'mp4',
  quality: 'high',
  resolution: '1080p',
  fps: 30,
  audioCodec: 'aac',
  audioBitrate: 192,
  videoCodec: 'h264',
  preset: 'medium',
  crf: 18
}

const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  muted: false,
  playbackRate: 1
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useVideoEditor(): UseVideoEditorReturn {
  // State
  const [project, setProject] = useState<VideoProject | null>(null)
  const [editorState, setEditorState] = useState<EditorState>({
    isLoading: false,
    isProcessing: false,
    isExporting: false,
    loadProgress: 0,
    processProgress: 0,
    exportProgress: 0,
    error: null
  })
  const [playbackState, setPlaybackState] = useState<PlaybackState>(DEFAULT_PLAYBACK_STATE)
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedClipIds: [],
    selectedTrackId: null,
    selectionStart: null,
    selectionEnd: null
  })

  // History
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Refs
  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)

  // ============================================================================
  // FFmpeg Loading
  // ============================================================================

  const ensureFFmpegLoaded = useCallback(async () => {
    if (isFFmpegLoaded()) return true

    setEditorState(prev => ({ ...prev, isLoading: true, loadProgress: 0 }))

    try {
      await loadFFmpeg((progress) => {
        setEditorState(prev => ({ ...prev, loadProgress: progress }))
      })

      setEditorState(prev => ({ ...prev, isLoading: false, loadProgress: 1 }))
      return true
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load FFmpeg'
      }))
      return false
    }
  }, [])

  // ============================================================================
  // History Management
  // ============================================================================

  const pushHistory = useCallback((action: string, state: Partial<VideoProject>) => {
    const entry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      action,
      state
    }

    setHistory(prev => {
      // Remove any redo entries
      const newHistory = prev.slice(0, historyIndex + 1)
      return [...newHistory, entry].slice(-50) // Keep last 50 entries
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex <= 0 || !project) return

    const prevEntry = history[historyIndex - 1]
    if (prevEntry) {
      setProject(prev => ({ ...prev!, ...prevEntry.state }))
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex, project])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !project) return

    const nextEntry = history[historyIndex + 1]
    if (nextEntry) {
      setProject(prev => ({ ...prev!, ...nextEntry.state }))
      setHistoryIndex(prev => prev + 1)
    }
  }, [history, historyIndex, project])

  // ============================================================================
  // Project Management
  // ============================================================================

  const newProject = useCallback((name: string, settings?: Partial<ProjectSettings>) => {
    const project: VideoProject = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
      width: 1920,
      height: 1080,
      fps: 30,
      duration: 0,
      tracks: [
        {
          id: crypto.randomUUID(),
          type: 'video',
          name: 'Video Track 1',
          muted: false,
          locked: false,
          visible: true,
          volume: 1,
          clips: []
        },
        {
          id: crypto.randomUUID(),
          type: 'audio',
          name: 'Audio Track 1',
          muted: false,
          locked: false,
          visible: true,
          volume: 1,
          clips: []
        }
      ],
      mediaPool: [],
      settings: { ...DEFAULT_PROJECT_SETTINGS, ...settings }
    }

    setProject(project)
    setHistory([])
    setHistoryIndex(-1)
    setSelectionState({
      selectedClipIds: [],
      selectedTrackId: null,
      selectionStart: null,
      selectionEnd: null
    })
    setPlaybackState(DEFAULT_PLAYBACK_STATE)
  }, [])

  const loadProject = useCallback((projectData: VideoProject) => {
    setProject(projectData)
    setHistory([])
    setHistoryIndex(-1)
    setPlaybackState(prev => ({
      ...prev,
      duration: projectData.duration,
      currentTime: 0
    }))
  }, [])

  const saveProject = useCallback((): VideoProject | null => {
    if (!project) return null

    return {
      ...project,
      updatedAt: new Date()
    }
  }, [project])

  const updateSettings = useCallback((settings: Partial<ProjectSettings>) => {
    if (!project) return

    setProject(prev => ({
      ...prev!,
      settings: { ...prev!.settings, ...settings },
      updatedAt: new Date()
    }))
    pushHistory('Update settings', { settings: { ...project.settings, ...settings } })
  }, [project, pushHistory])

  // ============================================================================
  // Media Pool
  // ============================================================================

  const addMedia = useCallback(async (files: FileList | File[]) => {
    if (!project) return

    setEditorState(prev => ({ ...prev, isProcessing: true, processProgress: 0 }))

    try {
      await ensureFFmpegLoaded()

      const fileArray = Array.from(files)
      const newMedia: (VideoFile | AudioFile)[] = []

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i]
        const isVideo = file.type.startsWith('video/')
        const isAudio = file.type.startsWith('audio/')

        if (isVideo) {
          const metadata = await getVideoMetadata(file)
          const thumbnail = await generateThumbnail(file)
          newMedia.push({ ...metadata, thumbnail })
        } else if (isAudio) {
          const id = crypto.randomUUID()
          const url = URL.createObjectURL(file)
          const waveform = await generateWaveform(file)

          // Get audio metadata using Audio element
          const audioMetadata = await new Promise<AudioFile>((resolve) => {
            const audio = document.createElement('audio')
            audio.onloadedmetadata = () => {
              resolve({
                id,
                name: file.name,
                file,
                url,
                duration: audio.duration,
                sampleRate: 44100, // Default estimate
                channels: 2,
                bitrate: 128,
                size: file.size,
                waveform
              })
              audio.remove()
            }
            audio.src = url
          })

          newMedia.push(audioMetadata)
        }

        setEditorState(prev => ({
          ...prev,
          processProgress: (i + 1) / fileArray.length
        }))
      }

      setProject(prev => ({
        ...prev!,
        mediaPool: [...prev!.mediaPool, ...newMedia],
        updatedAt: new Date()
      }))

      pushHistory('Add media', { mediaPool: [...project.mediaPool, ...newMedia] })
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to add media'
      }))
    } finally {
      setEditorState(prev => ({ ...prev, isProcessing: false, processProgress: 0 }))
    }
  }, [project, ensureFFmpegLoaded, pushHistory])

  const removeMedia = useCallback((mediaId: string) => {
    if (!project) return

    // Remove all clips using this media
    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.filter(clip => clip.sourceId !== mediaId)
    }))

    const updatedMediaPool = project.mediaPool.filter(m => m.id !== mediaId)

    setProject(prev => ({
      ...prev!,
      mediaPool: updatedMediaPool,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    pushHistory('Remove media', { mediaPool: updatedMediaPool, tracks: updatedTracks })
  }, [project, pushHistory])

  const getMediaById = useCallback((mediaId: string) => {
    return project?.mediaPool.find(m => m.id === mediaId)
  }, [project])

  // ============================================================================
  // Track Management
  // ============================================================================

  const addTrack = useCallback((type: 'video' | 'audio', name?: string): string => {
    if (!project) return ''

    const trackCount = project.tracks.filter(t => t.type === type).length
    const track: Track = {
      id: crypto.randomUUID(),
      type,
      name: name || `${type === 'video' ? 'Video' : 'Audio'} Track ${trackCount + 1}`,
      muted: false,
      locked: false,
      visible: true,
      volume: 1,
      clips: []
    }

    const updatedTracks = [...project.tracks, track]

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    pushHistory('Add track', { tracks: updatedTracks })
    return track.id
  }, [project, pushHistory])

  const removeTrack = useCallback((trackId: string) => {
    if (!project) return

    const updatedTracks = project.tracks.filter(t => t.id !== trackId)

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    pushHistory('Remove track', { tracks: updatedTracks })
  }, [project, pushHistory])

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track =>
      track.id === trackId ? { ...track, ...updates } : track
    )

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  const reorderTracks = useCallback((trackIds: string[]) => {
    if (!project) return

    const reorderedTracks = trackIds
      .map(id => project.tracks.find(t => t.id === id))
      .filter(Boolean) as Track[]

    setProject(prev => ({
      ...prev!,
      tracks: reorderedTracks,
      updatedAt: new Date()
    }))

    pushHistory('Reorder tracks', { tracks: reorderedTracks })
  }, [project, pushHistory])

  const getTrackById = useCallback((trackId: string) => {
    return project?.tracks.find(t => t.id === trackId)
  }, [project])

  // ============================================================================
  // Clip Management
  // ============================================================================

  const calculateProjectDuration = useCallback((tracks: Track[]): number => {
    let maxDuration = 0
    for (const track of tracks) {
      for (const clip of track.clips) {
        const clipEnd = clip.startTime + clip.duration
        if (clipEnd > maxDuration) {
          maxDuration = clipEnd
        }
      }
    }
    return maxDuration
  }, [])

  const addClip = useCallback((trackId: string, sourceId: string, startTime: number): string | null => {
    if (!project) return null

    const media = project.mediaPool.find(m => m.id === sourceId)
    if (!media) return null

    const track = project.tracks.find(t => t.id === trackId)
    if (!track) return null

    const clip: TimelineClip = {
      id: crypto.randomUUID(),
      type: track.type,
      sourceId,
      trackIndex: project.tracks.indexOf(track),
      startTime,
      duration: media.duration,
      inPoint: 0,
      outPoint: media.duration,
      volume: 1,
      opacity: 1,
      filters: [],
      transitions: []
    }

    const updatedTracks = project.tracks.map(t =>
      t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
    )

    const newDuration = calculateProjectDuration(updatedTracks)

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    }))

    setPlaybackState(prev => ({ ...prev, duration: newDuration }))
    pushHistory('Add clip', { tracks: updatedTracks, duration: newDuration })

    return clip.id
  }, [project, calculateProjectDuration, pushHistory])

  const removeClip = useCallback((clipId: string) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.filter(c => c.id !== clipId)
    }))

    const newDuration = calculateProjectDuration(updatedTracks)

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    }))

    setPlaybackState(prev => ({ ...prev, duration: newDuration }))
    setSelectionState(prev => ({
      ...prev,
      selectedClipIds: prev.selectedClipIds.filter(id => id !== clipId)
    }))

    pushHistory('Remove clip', { tracks: updatedTracks, duration: newDuration })
  }, [project, calculateProjectDuration, pushHistory])

  const updateClip = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    }))

    const newDuration = calculateProjectDuration(updatedTracks)

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    }))

    setPlaybackState(prev => ({ ...prev, duration: newDuration }))
  }, [project, calculateProjectDuration])

  const moveClip = useCallback((clipId: string, targetTrackId: string, startTime: number) => {
    if (!project) return

    let clipToMove: TimelineClip | null = null

    // Find and remove clip from current track
    const updatedTracks = project.tracks.map(track => {
      const clip = track.clips.find(c => c.id === clipId)
      if (clip) {
        clipToMove = { ...clip, startTime }
        return { ...track, clips: track.clips.filter(c => c.id !== clipId) }
      }
      return track
    })

    // Add clip to target track
    if (clipToMove) {
      const finalTracks = updatedTracks.map(track =>
        track.id === targetTrackId
          ? { ...track, clips: [...track.clips, clipToMove!] }
          : track
      )

      const newDuration = calculateProjectDuration(finalTracks)

      setProject(prev => ({
        ...prev!,
        tracks: finalTracks,
        duration: newDuration,
        updatedAt: new Date()
      }))

      setPlaybackState(prev => ({ ...prev, duration: newDuration }))
      pushHistory('Move clip', { tracks: finalTracks, duration: newDuration })
    }
  }, [project, calculateProjectDuration, pushHistory])

  const splitClip = useCallback((clipId: string, time: number): [string, string] | null => {
    if (!project) return null

    let splitClips: [TimelineClip, TimelineClip] | null = null
    let targetTrack: Track | null = null

    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === clipId)
      if (clip && time > clip.startTime && time < clip.startTime + clip.duration) {
        const splitPoint = time - clip.startTime + clip.inPoint

        const firstClip: TimelineClip = {
          ...clip,
          id: crypto.randomUUID(),
          duration: time - clip.startTime,
          outPoint: splitPoint
        }

        const secondClip: TimelineClip = {
          ...clip,
          id: crypto.randomUUID(),
          startTime: time,
          duration: clip.duration - (time - clip.startTime),
          inPoint: splitPoint
        }

        splitClips = [firstClip, secondClip]
        targetTrack = track
        break
      }
    }

    if (!splitClips || !targetTrack) return null

    const updatedTracks = project.tracks.map(track => {
      if (track.id === targetTrack!.id) {
        return {
          ...track,
          clips: [
            ...track.clips.filter(c => c.id !== clipId),
            ...splitClips!
          ]
        }
      }
      return track
    })

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    pushHistory('Split clip', { tracks: updatedTracks })

    return [splitClips[0].id, splitClips[1].id]
  }, [project, pushHistory])

  const duplicateClip = useCallback((clipId: string): string | null => {
    if (!project) return null

    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === clipId)
      if (clip) {
        const newClip: TimelineClip = {
          ...clip,
          id: crypto.randomUUID(),
          startTime: clip.startTime + clip.duration
        }

        const updatedTracks = project.tracks.map(t =>
          t.id === track.id ? { ...t, clips: [...t.clips, newClip] } : t
        )

        const newDuration = calculateProjectDuration(updatedTracks)

        setProject(prev => ({
          ...prev!,
          tracks: updatedTracks,
          duration: newDuration,
          updatedAt: new Date()
        }))

        setPlaybackState(prev => ({ ...prev, duration: newDuration }))
        pushHistory('Duplicate clip', { tracks: updatedTracks, duration: newDuration })

        return newClip.id
      }
    }

    return null
  }, [project, calculateProjectDuration, pushHistory])

  const getClipById = useCallback((clipId: string) => {
    if (!project) return undefined

    for (const track of project.tracks) {
      const clip = track.clips.find(c => c.id === clipId)
      if (clip) return clip
    }

    return undefined
  }, [project])

  // ============================================================================
  // Filters and Effects
  // ============================================================================

  const addFilter = useCallback((clipId: string, filter: Omit<VideoFilter, 'id'>): string | null => {
    if (!project) return null

    const filterId = crypto.randomUUID()
    const newFilter: VideoFilter = { ...filter, id: filterId }

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? { ...clip, filters: [...(clip.filters || []), newFilter] }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    return filterId
  }, [project])

  const removeFilter = useCallback((clipId: string, filterId: string) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? { ...clip, filters: (clip.filters || []).filter(f => f.id !== filterId) }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  const updateFilter = useCallback((clipId: string, filterId: string, params: Record<string, any>) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? {
              ...clip,
              filters: (clip.filters || []).map(f =>
                f.id === filterId ? { ...f, params: { ...f.params, ...params } } : f
              )
            }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  const toggleFilter = useCallback((clipId: string, filterId: string) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? {
              ...clip,
              filters: (clip.filters || []).map(f =>
                f.id === filterId ? { ...f, enabled: !f.enabled } : f
              )
            }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  // ============================================================================
  // Transitions
  // ============================================================================

  const addTransition = useCallback((clipId: string, transition: Omit<Transition, 'id'>): string | null => {
    if (!project) return null

    const transitionId = crypto.randomUUID()
    const newTransition: Transition = { ...transition, id: transitionId }

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? { ...clip, transitions: [...(clip.transitions || []), newTransition] }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))

    return transitionId
  }, [project])

  const removeTransition = useCallback((clipId: string, transitionId: string) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? { ...clip, transitions: (clip.transitions || []).filter(t => t.id !== transitionId) }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  const updateTransition = useCallback((clipId: string, transitionId: string, updates: Partial<Transition>) => {
    if (!project) return

    const updatedTracks = project.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId
          ? {
              ...clip,
              transitions: (clip.transitions || []).map(t =>
                t.id === transitionId ? { ...t, ...updates } : t
              )
            }
          : clip
      )
    }))

    setProject(prev => ({
      ...prev!,
      tracks: updatedTracks,
      updatedAt: new Date()
    }))
  }, [project])

  // ============================================================================
  // Selection
  // ============================================================================

  const selectClip = useCallback((clipId: string, addToSelection: boolean = false) => {
    setSelectionState(prev => ({
      ...prev,
      selectedClipIds: addToSelection
        ? [...prev.selectedClipIds, clipId]
        : [clipId]
    }))
  }, [])

  const deselectClip = useCallback((clipId: string) => {
    setSelectionState(prev => ({
      ...prev,
      selectedClipIds: prev.selectedClipIds.filter(id => id !== clipId)
    }))
  }, [])

  const clearSelection = useCallback(() => {
    setSelectionState(prev => ({
      ...prev,
      selectedClipIds: [],
      selectionStart: null,
      selectionEnd: null
    }))
  }, [])

  const selectTrack = useCallback((trackId: string | null) => {
    setSelectionState(prev => ({ ...prev, selectedTrackId: trackId }))
  }, [])

  const setSelectionRange = useCallback((start: number | null, end: number | null) => {
    setSelectionState(prev => ({
      ...prev,
      selectionStart: start,
      selectionEnd: end
    }))
  }, [])

  // ============================================================================
  // Playback
  // ============================================================================

  const play = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, isPlaying: true }))

    playbackTimerRef.current = setInterval(() => {
      setPlaybackState(prev => {
        const newTime = prev.currentTime + 0.1 * prev.playbackRate
        if (newTime >= prev.duration) {
          clearInterval(playbackTimerRef.current!)
          return { ...prev, isPlaying: false, currentTime: 0 }
        }
        return { ...prev, currentTime: newTime }
      })
    }, 100)
  }, [])

  const pause = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current)
    }
    setPlaybackState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const stop = useCallback(() => {
    if (playbackTimerRef.current) {
      clearInterval(playbackTimerRef.current)
    }
    setPlaybackState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
  }, [])

  const seek = useCallback((time: number) => {
    setPlaybackState(prev => ({
      ...prev,
      currentTime: Math.max(0, Math.min(time, prev.duration))
    }))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setPlaybackState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }))
  }, [])

  const toggleMute = useCallback(() => {
    setPlaybackState(prev => ({ ...prev, muted: !prev.muted }))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackState(prev => ({ ...prev, playbackRate: rate }))
  }, [])

  // Cleanup playback timer
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current)
      }
    }
  }, [])

  // ============================================================================
  // Processing Operations
  // ============================================================================

  const processSelectedClips = useCallback(async (operation: 'trim' | 'speed' | 'reverse' | 'filters') => {
    if (!project || selectionState.selectedClipIds.length === 0) return

    setEditorState(prev => ({ ...prev, isProcessing: true, processProgress: 0 }))

    try {
      await ensureFFmpegLoaded()

      for (let i = 0; i < selectionState.selectedClipIds.length; i++) {
        const clipId = selectionState.selectedClipIds[i]
        const clip = getClipById(clipId)
        if (!clip) continue

        const media = getMediaById(clip.sourceId)
        if (!media || !('file' in media)) continue

        let processedBlob: Blob | null = null

        switch (operation) {
          case 'trim':
            processedBlob = await trimVideo(
              media.file,
              clip.inPoint,
              clip.outPoint,
              (p) => setEditorState(prev => ({ ...prev, processProgress: (i + p) / selectionState.selectedClipIds.length }))
            )
            break
          case 'reverse':
            processedBlob = await reverseVideo(
              media.file,
              true,
              (p) => setEditorState(prev => ({ ...prev, processProgress: (i + p) / selectionState.selectedClipIds.length }))
            )
            break
          case 'filters':
            if (clip.filters && clip.filters.length > 0) {
              processedBlob = await applyFilters(
                media.file,
                clip.filters,
                (p) => setEditorState(prev => ({ ...prev, processProgress: (i + p) / selectionState.selectedClipIds.length }))
              )
            }
            break
        }

        if (processedBlob) {
          // Create new media from processed blob
          const newMedia = await getVideoMetadata(processedBlob)
          const thumbnail = await generateThumbnail(processedBlob)

          setProject(prev => ({
            ...prev!,
            mediaPool: [...prev!.mediaPool, { ...newMedia, thumbnail }],
            updatedAt: new Date()
          }))

          // Update clip to use new media
          updateClip(clipId, { sourceId: newMedia.id })
        }

        setEditorState(prev => ({
          ...prev,
          processProgress: (i + 1) / selectionState.selectedClipIds.length
        }))
      }
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Processing failed'
      }))
    } finally {
      setEditorState(prev => ({ ...prev, isProcessing: false, processProgress: 0 }))
    }
  }, [project, selectionState.selectedClipIds, ensureFFmpegLoaded, getClipById, getMediaById, updateClip])

  // ============================================================================
  // Export
  // ============================================================================

  const exportProject = useCallback(async (): Promise<ExportResult | null> => {
    if (!project || project.mediaPool.length === 0) return null

    setEditorState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }))

    try {
      await ensureFFmpegLoaded()

      // Get all video clips in order
      const videoTracks = project.tracks.filter(t => t.type === 'video')
      const allClips: TimelineClip[] = []

      for (const track of videoTracks) {
        if (!track.muted && track.visible) {
          allClips.push(...track.clips)
        }
      }

      // Sort clips by start time
      allClips.sort((a, b) => a.startTime - b.startTime)

      if (allClips.length === 0) {
        throw new Error('No clips to export')
      }

      // For now, export the first clip with all its settings
      // Full timeline rendering would require more complex filter graphs
      const firstClip = allClips[0]
      const media = getMediaById(firstClip.sourceId)

      if (!media || !('file' in media)) {
        throw new Error('Media not found')
      }

      // Trim to clip boundaries
      let processedBlob = await trimVideo(
        media.file,
        firstClip.inPoint,
        firstClip.outPoint,
        (p) => setEditorState(prev => ({ ...prev, exportProgress: p * 0.5 }))
      )

      // Apply filters if any
      if (firstClip.filters && firstClip.filters.length > 0) {
        processedBlob = await applyFilters(
          processedBlob,
          firstClip.filters,
          (p) => setEditorState(prev => ({ ...prev, exportProgress: 0.5 + p * 0.3 }))
        )
      }

      // Export with settings
      const result = await exportVideo(
        processedBlob,
        project.settings,
        (p) => setEditorState(prev => ({ ...prev, exportProgress: 0.8 + p * 0.2 }))
      )

      setEditorState(prev => ({ ...prev, isExporting: false, exportProgress: 1 }))
      return result
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }))
      return null
    }
  }, [project, ensureFFmpegLoaded, getMediaById])

  const exportClip = useCallback(async (clipId: string): Promise<ExportResult | null> => {
    if (!project) return null

    const clip = getClipById(clipId)
    if (!clip) return null

    const media = getMediaById(clip.sourceId)
    if (!media || !('file' in media)) return null

    setEditorState(prev => ({ ...prev, isExporting: true, exportProgress: 0 }))

    try {
      await ensureFFmpegLoaded()

      let processedBlob = await trimVideo(
        media.file,
        clip.inPoint,
        clip.outPoint,
        (p) => setEditorState(prev => ({ ...prev, exportProgress: p * 0.6 }))
      )

      if (clip.filters && clip.filters.length > 0) {
        processedBlob = await applyFilters(
          processedBlob,
          clip.filters,
          (p) => setEditorState(prev => ({ ...prev, exportProgress: 0.6 + p * 0.2 }))
        )
      }

      const result = await exportVideo(
        processedBlob,
        project.settings,
        (p) => setEditorState(prev => ({ ...prev, exportProgress: 0.8 + p * 0.2 }))
      )

      setEditorState(prev => ({ ...prev, isExporting: false, exportProgress: 1 }))
      return result
    } catch (error) {
      setEditorState(prev => ({
        ...prev,
        isExporting: false,
        error: error instanceof Error ? error.message : 'Export failed'
      }))
      return null
    }
  }, [project, getClipById, getMediaById, ensureFFmpegLoaded])

  const exportSelection = useCallback(async (): Promise<ExportResult | null> => {
    if (selectionState.selectedClipIds.length === 1) {
      return exportClip(selectionState.selectedClipIds[0])
    }
    // For multiple clips, merge them
    return exportProject()
  }, [selectionState.selectedClipIds, exportClip, exportProject])

  // ============================================================================
  // Utilities
  // ============================================================================

  const getTimelineData = useCallback(() => {
    if (!project) return { tracks: [], duration: 0 }
    return { tracks: project.tracks, duration: project.duration }
  }, [project])

  const getClipsAtTime = useCallback((time: number): TimelineClip[] => {
    if (!project) return []

    const clips: TimelineClip[] = []

    for (const track of project.tracks) {
      for (const clip of track.clips) {
        if (time >= clip.startTime && time < clip.startTime + clip.duration) {
          clips.push(clip)
        }
      }
    }

    return clips
  }, [project])

  const snapToGrid = useCallback((time: number, gridSize: number = 0.1): number => {
    return Math.round(time / gridSize) * gridSize
  }, [])

  const formatTime = useCallback((seconds: number): string => {
    return formatDuration(seconds)
  }, [])

  // ============================================================================
  // Return Value
  // ============================================================================

  return {
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
    reorderTracks,
    getTrackById,

    addClip,
    removeClip,
    updateClip,
    moveClip,
    splitClip,
    duplicateClip,
    getClipById,

    addFilter,
    removeFilter,
    updateFilter,
    toggleFilter,

    addTransition,
    removeTransition,
    updateTransition,

    selectClip,
    deselectClip,
    clearSelection,
    selectTrack,
    setSelectionRange,

    play,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,

    processSelectedClips,

    exportProject,
    exportClip,
    exportSelection,

    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    history,

    getTimelineData,
    getClipsAtTime,
    snapToGrid,
    formatTime
  }
}

export default useVideoEditor

// Re-export types for convenience
export type {
  VideoFile,
  AudioFile,
  TimelineClip,
  Track,
  VideoProject,
  ProjectSettings,
  VideoFilter,
  Transition,
  ExportResult,
  FilterType,
  TransitionType
}
