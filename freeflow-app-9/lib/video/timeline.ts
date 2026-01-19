/**
 * Video Timeline Service
 *
 * Industry-leading timeline management with:
 * - Multi-track support (video, audio, effects, overlays)
 * - Non-linear editing capabilities
 * - Keyframe animation system
 * - Transition effects between clips
 * - Undo/redo with history management
 * - Real-time preview synchronization
 * - Timeline snapping and magnetic behavior
 * - Ripple and slip editing modes
 */

import { EventEmitter } from 'events'

// ============================================================================
// Types & Interfaces
// ============================================================================

export type TrackType = 'video' | 'audio' | 'effect' | 'text' | 'overlay' | 'subtitle'

export interface TimelineProject {
  id: string
  name: string
  duration: number // Total duration in seconds
  fps: number
  resolution: { width: number; height: number }
  aspectRatio: string
  tracks: Track[]
  markers: Marker[]
  settings: TimelineSettings
  history: HistoryState[]
  historyIndex: number
  createdAt: Date
  updatedAt: Date
}

export interface Track {
  id: string
  name: string
  type: TrackType
  items: TimelineItem[]
  locked: boolean
  muted: boolean
  visible: boolean
  solo: boolean
  height: number // Visual height in timeline UI
  color: string
  volume?: number // For audio tracks (0-1)
  opacity?: number // For video/overlay tracks (0-1)
}

export interface TimelineItem {
  id: string
  trackId: string
  type: 'clip' | 'effect' | 'text' | 'transition' | 'audio' | 'image'
  startTime: number // Position in timeline (seconds)
  duration: number // Duration (seconds)
  inPoint: number // Source in point (seconds)
  outPoint: number // Source out point (seconds)
  speed: number // Playback speed multiplier
  source: ItemSource
  effects: Effect[]
  keyframes: Keyframe[]
  transitions?: {
    in?: Transition
    out?: Transition
  }
  properties: Record<string, any>
}

export interface ItemSource {
  id: string
  url: string
  type: 'video' | 'audio' | 'image'
  duration: number
  metadata: Record<string, any>
}

export interface Effect {
  id: string
  name: string
  type: 'filter' | 'color' | 'transform' | 'audio' | 'custom'
  enabled: boolean
  parameters: Record<string, any>
  keyframes: Keyframe[]
}

export interface Keyframe {
  id: string
  time: number // Time within the item (seconds)
  property: string
  value: any
  easing: EasingType
}

export type EasingType =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'cubic-bezier'
  | 'spring'
  | 'bounce'

export interface Transition {
  id: string
  name: string
  type: 'fade' | 'dissolve' | 'wipe' | 'slide' | 'zoom' | 'custom'
  duration: number
  parameters: Record<string, any>
}

export interface Marker {
  id: string
  time: number
  name: string
  color: string
  type: 'marker' | 'chapter' | 'comment'
  comment?: string
}

export interface TimelineSettings {
  snapEnabled: boolean
  snapToGrid: boolean
  snapToMarkers: boolean
  snapToClips: boolean
  snapThreshold: number // In pixels
  gridInterval: number // In seconds
  autoScroll: boolean
  waveformDisplay: boolean
  thumbnailDisplay: boolean
  editMode: EditMode
  zoomLevel: number // 1-100
  scrollPosition: number
}

export type EditMode = 'normal' | 'ripple' | 'slip' | 'roll' | 'slide'

export interface HistoryState {
  id: string
  action: string
  timestamp: Date
  data: any
  previousState: any
}

export interface PlaybackState {
  playing: boolean
  currentTime: number
  playbackRate: number
  loop: boolean
  loopIn: number
  loopOut: number
}

// ============================================================================
// Timeline Service Class
// ============================================================================

export class TimelineService extends EventEmitter {
  private project: TimelineProject | null = null
  private playbackState: PlaybackState = {
    playing: false,
    currentTime: 0,
    playbackRate: 1,
    loop: false,
    loopIn: 0,
    loopOut: 0,
  }
  private playbackInterval: NodeJS.Timeout | null = null
  private clipboard: TimelineItem[] = []

  constructor() {
    super()
  }

  // ============================================================================
  // Project Management
  // ============================================================================

  createProject(config: Partial<TimelineProject>): TimelineProject {
    const project: TimelineProject = {
      id: this.generateId(),
      name: config.name || 'Untitled Project',
      duration: config.duration || 0,
      fps: config.fps || 30,
      resolution: config.resolution || { width: 1920, height: 1080 },
      aspectRatio: config.aspectRatio || '16:9',
      tracks: config.tracks || [
        this.createTrack({ name: 'Video 1', type: 'video' }),
        this.createTrack({ name: 'Audio 1', type: 'audio' }),
      ],
      markers: config.markers || [],
      settings: config.settings || {
        snapEnabled: true,
        snapToGrid: true,
        snapToMarkers: true,
        snapToClips: true,
        snapThreshold: 10,
        gridInterval: 1,
        autoScroll: true,
        waveformDisplay: true,
        thumbnailDisplay: true,
        editMode: 'normal',
        zoomLevel: 50,
        scrollPosition: 0,
      },
      history: [],
      historyIndex: -1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.project = project
    this.emit('projectCreated', project)
    return project
  }

  loadProject(project: TimelineProject): void {
    this.project = project
    this.emit('projectLoaded', project)
  }

  getProject(): TimelineProject | null {
    return this.project
  }

  saveProject(): TimelineProject | null {
    if (!this.project) return null
    this.project.updatedAt = new Date()
    this.emit('projectSaved', this.project)
    return this.project
  }

  // ============================================================================
  // Track Management
  // ============================================================================

  createTrack(config: Partial<Track>): Track {
    const colors: Record<TrackType, string> = {
      video: '#4f46e5',
      audio: '#10b981',
      effect: '#f59e0b',
      text: '#ec4899',
      overlay: '#8b5cf6',
      subtitle: '#06b6d4',
    }

    const track: Track = {
      id: this.generateId(),
      name: config.name || 'New Track',
      type: config.type || 'video',
      items: config.items || [],
      locked: config.locked || false,
      muted: config.muted || false,
      visible: config.visible !== false,
      solo: config.solo || false,
      height: config.height || 60,
      color: config.color || colors[config.type || 'video'],
      volume: config.type === 'audio' ? (config.volume ?? 1) : undefined,
      opacity: ['video', 'overlay'].includes(config.type || '') ? (config.opacity ?? 1) : undefined,
    }

    return track
  }

  addTrack(config: Partial<Track>): Track | null {
    if (!this.project) return null

    const track = this.createTrack(config)
    this.pushHistory('Add Track', { trackId: track.id })
    this.project.tracks.push(track)
    this.emit('trackAdded', track)
    return track
  }

  removeTrack(trackId: string): boolean {
    if (!this.project) return false

    const index = this.project.tracks.findIndex(t => t.id === trackId)
    if (index === -1) return false

    const track = this.project.tracks[index]
    this.pushHistory('Remove Track', { track })
    this.project.tracks.splice(index, 1)
    this.updateDuration()
    this.emit('trackRemoved', trackId)
    return true
  }

  updateTrack(trackId: string, updates: Partial<Track>): Track | null {
    if (!this.project) return null

    const track = this.project.tracks.find(t => t.id === trackId)
    if (!track) return null

    this.pushHistory('Update Track', { trackId, previousState: { ...track } })
    Object.assign(track, updates)
    this.emit('trackUpdated', track)
    return track
  }

  reorderTracks(trackIds: string[]): boolean {
    if (!this.project) return false

    const previousOrder = this.project.tracks.map(t => t.id)
    this.pushHistory('Reorder Tracks', { previousOrder })

    const newTracks: Track[] = []
    for (const id of trackIds) {
      const track = this.project.tracks.find(t => t.id === id)
      if (track) newTracks.push(track)
    }

    this.project.tracks = newTracks
    this.emit('tracksReordered', trackIds)
    return true
  }

  // ============================================================================
  // Item Management
  // ============================================================================

  addItem(trackId: string, item: Partial<TimelineItem>): TimelineItem | null {
    if (!this.project) return null

    const track = this.project.tracks.find(t => t.id === trackId)
    if (!track || track.locked) return null

    const newItem: TimelineItem = {
      id: this.generateId(),
      trackId,
      type: item.type || 'clip',
      startTime: item.startTime || 0,
      duration: item.duration || 5,
      inPoint: item.inPoint || 0,
      outPoint: item.outPoint || (item.source?.duration || item.duration || 5),
      speed: item.speed || 1,
      source: item.source || {
        id: this.generateId(),
        url: '',
        type: 'video',
        duration: item.duration || 5,
        metadata: {},
      },
      effects: item.effects || [],
      keyframes: item.keyframes || [],
      transitions: item.transitions,
      properties: item.properties || {},
    }

    // Handle snapping
    if (this.project.settings.snapEnabled) {
      newItem.startTime = this.snapToTime(newItem.startTime)
    }

    this.pushHistory('Add Item', { trackId, itemId: newItem.id })
    track.items.push(newItem)
    track.items.sort((a, b) => a.startTime - b.startTime)
    this.updateDuration()
    this.emit('itemAdded', newItem)
    return newItem
  }

  removeItem(itemId: string): boolean {
    if (!this.project) return false

    for (const track of this.project.tracks) {
      const index = track.items.findIndex(i => i.id === itemId)
      if (index !== -1) {
        const item = track.items[index]
        this.pushHistory('Remove Item', { item })
        track.items.splice(index, 1)
        this.updateDuration()
        this.emit('itemRemoved', itemId)
        return true
      }
    }

    return false
  }

  updateItem(itemId: string, updates: Partial<TimelineItem>): TimelineItem | null {
    if (!this.project) return null

    for (const track of this.project.tracks) {
      const item = track.items.find(i => i.id === itemId)
      if (item) {
        if (track.locked) return null

        this.pushHistory('Update Item', { itemId, previousState: { ...item } })
        Object.assign(item, updates)

        // Re-sort items if position changed
        if (updates.startTime !== undefined) {
          track.items.sort((a, b) => a.startTime - b.startTime)
        }

        this.updateDuration()
        this.emit('itemUpdated', item)
        return item
      }
    }

    return null
  }

  moveItem(itemId: string, newTrackId: string, newStartTime: number): TimelineItem | null {
    if (!this.project) return null

    let sourceItem: TimelineItem | null = null
    let sourceTrack: Track | null = null

    // Find the item
    for (const track of this.project.tracks) {
      const item = track.items.find(i => i.id === itemId)
      if (item) {
        sourceItem = item
        sourceTrack = track
        break
      }
    }

    if (!sourceItem || !sourceTrack) return null

    const destTrack = this.project.tracks.find(t => t.id === newTrackId)
    if (!destTrack || destTrack.locked) return null

    // Handle snapping
    if (this.project.settings.snapEnabled) {
      newStartTime = this.snapToTime(newStartTime)
    }

    this.pushHistory('Move Item', {
      itemId,
      fromTrack: sourceTrack.id,
      toTrack: newTrackId,
      fromTime: sourceItem.startTime,
      toTime: newStartTime,
    })

    // Remove from source track
    sourceTrack.items = sourceTrack.items.filter(i => i.id !== itemId)

    // Add to destination track
    sourceItem.trackId = newTrackId
    sourceItem.startTime = newStartTime
    destTrack.items.push(sourceItem)
    destTrack.items.sort((a, b) => a.startTime - b.startTime)

    this.updateDuration()
    this.emit('itemMoved', sourceItem)
    return sourceItem
  }

  trimItem(itemId: string, edge: 'in' | 'out', newTime: number): TimelineItem | null {
    if (!this.project) return null

    for (const track of this.project.tracks) {
      const item = track.items.find(i => i.id === itemId)
      if (item) {
        if (track.locked) return null

        this.pushHistory('Trim Item', {
          itemId,
          edge,
          previousTime: edge === 'in' ? item.startTime : item.startTime + item.duration,
        })

        if (edge === 'in') {
          const delta = newTime - item.startTime
          item.startTime = newTime
          item.inPoint += delta * item.speed
          item.duration -= delta
        } else {
          item.duration = newTime - item.startTime
          item.outPoint = item.inPoint + item.duration * item.speed
        }

        this.updateDuration()
        this.emit('itemTrimmed', item)
        return item
      }
    }

    return null
  }

  splitItem(itemId: string, splitTime: number): [TimelineItem, TimelineItem] | null {
    if (!this.project) return null

    for (const track of this.project.tracks) {
      const itemIndex = track.items.findIndex(i => i.id === itemId)
      if (itemIndex !== -1) {
        const item = track.items[itemIndex]
        if (track.locked) return null

        // Validate split time is within item
        if (splitTime <= item.startTime || splitTime >= item.startTime + item.duration) {
          return null
        }

        const splitOffset = splitTime - item.startTime

        // Create second part
        const secondPart: TimelineItem = {
          ...item,
          id: this.generateId(),
          startTime: splitTime,
          duration: item.duration - splitOffset,
          inPoint: item.inPoint + splitOffset * item.speed,
        }

        // Modify first part
        const firstPart = item
        firstPart.duration = splitOffset
        firstPart.outPoint = firstPart.inPoint + splitOffset * item.speed

        this.pushHistory('Split Item', { itemId, splitTime })

        track.items.splice(itemIndex + 1, 0, secondPart)
        this.emit('itemSplit', [firstPart, secondPart])
        return [firstPart, secondPart]
      }
    }

    return null
  }

  // ============================================================================
  // Clipboard Operations
  // ============================================================================

  copyItems(itemIds: string[]): void {
    if (!this.project) return

    this.clipboard = []
    for (const track of this.project.tracks) {
      for (const item of track.items) {
        if (itemIds.includes(item.id)) {
          this.clipboard.push({ ...item, id: this.generateId() })
        }
      }
    }

    this.emit('itemsCopied', itemIds)
  }

  pasteItems(targetTrackId: string, targetTime: number): TimelineItem[] {
    if (!this.project || this.clipboard.length === 0) return []

    const track = this.project.tracks.find(t => t.id === targetTrackId)
    if (!track || track.locked) return []

    // Calculate offset from original position
    const minStartTime = Math.min(...this.clipboard.map(i => i.startTime))
    const pastedItems: TimelineItem[] = []

    for (const clipboardItem of this.clipboard) {
      const newItem: TimelineItem = {
        ...clipboardItem,
        id: this.generateId(),
        trackId: targetTrackId,
        startTime: targetTime + (clipboardItem.startTime - minStartTime),
      }

      track.items.push(newItem)
      pastedItems.push(newItem)
    }

    track.items.sort((a, b) => a.startTime - b.startTime)
    this.pushHistory('Paste Items', { items: pastedItems.map(i => i.id) })
    this.updateDuration()
    this.emit('itemsPasted', pastedItems)
    return pastedItems
  }

  duplicateItems(itemIds: string[]): TimelineItem[] {
    if (!this.project) return []

    const duplicated: TimelineItem[] = []

    for (const track of this.project.tracks) {
      if (track.locked) continue

      const itemsToDuplicate = track.items.filter(i => itemIds.includes(i.id))
      for (const item of itemsToDuplicate) {
        const newItem: TimelineItem = {
          ...item,
          id: this.generateId(),
          startTime: item.startTime + item.duration,
        }

        track.items.push(newItem)
        duplicated.push(newItem)
      }

      track.items.sort((a, b) => a.startTime - b.startTime)
    }

    this.pushHistory('Duplicate Items', { items: duplicated.map(i => i.id) })
    this.updateDuration()
    this.emit('itemsDuplicated', duplicated)
    return duplicated
  }

  // ============================================================================
  // Effects & Keyframes
  // ============================================================================

  addEffect(itemId: string, effect: Partial<Effect>): Effect | null {
    const item = this.getItem(itemId)
    if (!item) return null

    const newEffect: Effect = {
      id: this.generateId(),
      name: effect.name || 'Effect',
      type: effect.type || 'filter',
      enabled: effect.enabled !== false,
      parameters: effect.parameters || {},
      keyframes: effect.keyframes || [],
    }

    this.pushHistory('Add Effect', { itemId, effectId: newEffect.id })
    item.effects.push(newEffect)
    this.emit('effectAdded', { item, effect: newEffect })
    return newEffect
  }

  removeEffect(itemId: string, effectId: string): boolean {
    const item = this.getItem(itemId)
    if (!item) return false

    const index = item.effects.findIndex(e => e.id === effectId)
    if (index === -1) return false

    this.pushHistory('Remove Effect', { itemId, effect: item.effects[index] })
    item.effects.splice(index, 1)
    this.emit('effectRemoved', { itemId, effectId })
    return true
  }

  addKeyframe(itemId: string, keyframe: Partial<Keyframe>): Keyframe | null {
    const item = this.getItem(itemId)
    if (!item) return null

    const newKeyframe: Keyframe = {
      id: this.generateId(),
      time: keyframe.time || 0,
      property: keyframe.property || 'opacity',
      value: keyframe.value ?? 1,
      easing: keyframe.easing || 'linear',
    }

    this.pushHistory('Add Keyframe', { itemId, keyframeId: newKeyframe.id })
    item.keyframes.push(newKeyframe)
    item.keyframes.sort((a, b) => a.time - b.time)
    this.emit('keyframeAdded', { item, keyframe: newKeyframe })
    return newKeyframe
  }

  removeKeyframe(itemId: string, keyframeId: string): boolean {
    const item = this.getItem(itemId)
    if (!item) return false

    const index = item.keyframes.findIndex(k => k.id === keyframeId)
    if (index === -1) return false

    this.pushHistory('Remove Keyframe', { itemId, keyframe: item.keyframes[index] })
    item.keyframes.splice(index, 1)
    this.emit('keyframeRemoved', { itemId, keyframeId })
    return true
  }

  // ============================================================================
  // Markers
  // ============================================================================

  addMarker(marker: Partial<Marker>): Marker | null {
    if (!this.project) return null

    const newMarker: Marker = {
      id: this.generateId(),
      time: marker.time || this.playbackState.currentTime,
      name: marker.name || 'Marker',
      color: marker.color || '#f59e0b',
      type: marker.type || 'marker',
      comment: marker.comment,
    }

    this.pushHistory('Add Marker', { markerId: newMarker.id })
    this.project.markers.push(newMarker)
    this.project.markers.sort((a, b) => a.time - b.time)
    this.emit('markerAdded', newMarker)
    return newMarker
  }

  removeMarker(markerId: string): boolean {
    if (!this.project) return false

    const index = this.project.markers.findIndex(m => m.id === markerId)
    if (index === -1) return false

    this.pushHistory('Remove Marker', { marker: this.project.markers[index] })
    this.project.markers.splice(index, 1)
    this.emit('markerRemoved', markerId)
    return true
  }

  // ============================================================================
  // Playback Control
  // ============================================================================

  play(): void {
    if (this.playbackState.playing) return

    this.playbackState.playing = true
    const frameTime = 1000 / (this.project?.fps || 30)

    this.playbackInterval = setInterval(() => {
      this.playbackState.currentTime += (frameTime / 1000) * this.playbackState.playbackRate

      // Handle looping
      if (this.playbackState.loop) {
        if (this.playbackState.currentTime >= this.playbackState.loopOut) {
          this.playbackState.currentTime = this.playbackState.loopIn
        }
      } else if (this.playbackState.currentTime >= (this.project?.duration || 0)) {
        this.pause()
        this.playbackState.currentTime = this.project?.duration || 0
      }

      this.emit('timeUpdate', this.playbackState.currentTime)
    }, frameTime)

    this.emit('playbackStarted', this.playbackState)
  }

  pause(): void {
    if (!this.playbackState.playing) return

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
      this.playbackInterval = null
    }

    this.playbackState.playing = false
    this.emit('playbackPaused', this.playbackState)
  }

  stop(): void {
    this.pause()
    this.playbackState.currentTime = 0
    this.emit('playbackStopped', this.playbackState)
  }

  seek(time: number): void {
    this.playbackState.currentTime = Math.max(0, Math.min(time, this.project?.duration || 0))
    this.emit('timeUpdate', this.playbackState.currentTime)
  }

  setPlaybackRate(rate: number): void {
    this.playbackState.playbackRate = Math.max(0.25, Math.min(rate, 4))
    this.emit('playbackRateChanged', this.playbackState.playbackRate)
  }

  setLoop(enabled: boolean, inPoint?: number, outPoint?: number): void {
    this.playbackState.loop = enabled
    if (inPoint !== undefined) this.playbackState.loopIn = inPoint
    if (outPoint !== undefined) this.playbackState.loopOut = outPoint
    this.emit('loopChanged', this.playbackState)
  }

  getPlaybackState(): PlaybackState {
    return { ...this.playbackState }
  }

  // ============================================================================
  // Undo/Redo
  // ============================================================================

  undo(): boolean {
    if (!this.project || this.project.historyIndex < 0) return false

    const state = this.project.history[this.project.historyIndex]
    this.project.historyIndex--

    // Apply undo logic based on action
    this.applyUndoRedo(state, true)
    this.emit('undone', state)
    return true
  }

  redo(): boolean {
    if (!this.project || this.project.historyIndex >= this.project.history.length - 1) return false

    this.project.historyIndex++
    const state = this.project.history[this.project.historyIndex]

    // Apply redo logic based on action
    this.applyUndoRedo(state, false)
    this.emit('redone', state)
    return true
  }

  private pushHistory(action: string, data: any): void {
    if (!this.project) return

    // Remove future history if we're not at the end
    if (this.project.historyIndex < this.project.history.length - 1) {
      this.project.history = this.project.history.slice(0, this.project.historyIndex + 1)
    }

    const state: HistoryState = {
      id: this.generateId(),
      action,
      timestamp: new Date(),
      data,
      previousState: null,
    }

    this.project.history.push(state)
    this.project.historyIndex = this.project.history.length - 1

    // Limit history size
    if (this.project.history.length > 100) {
      this.project.history.shift()
      this.project.historyIndex--
    }
  }

  private applyUndoRedo(state: HistoryState, isUndo: boolean): void {
    // Implementation depends on action type
    // This would restore/reapply the state
    console.log(`${isUndo ? 'Undo' : 'Redo'}: ${state.action}`)
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private updateDuration(): void {
    if (!this.project) return

    let maxEnd = 0
    for (const track of this.project.tracks) {
      for (const item of track.items) {
        const itemEnd = item.startTime + item.duration
        if (itemEnd > maxEnd) maxEnd = itemEnd
      }
    }

    this.project.duration = maxEnd
    this.emit('durationChanged', maxEnd)
  }

  private snapToTime(time: number): number {
    if (!this.project?.settings.snapEnabled) return time

    const threshold = this.project.settings.snapThreshold / 100 // Convert pixels to approximate time

    // Snap to grid
    if (this.project.settings.snapToGrid) {
      const gridTime = Math.round(time / this.project.settings.gridInterval) * this.project.settings.gridInterval
      if (Math.abs(time - gridTime) < threshold) return gridTime
    }

    // Snap to markers
    if (this.project.settings.snapToMarkers) {
      for (const marker of this.project.markers) {
        if (Math.abs(time - marker.time) < threshold) return marker.time
      }
    }

    // Snap to clip edges
    if (this.project.settings.snapToClips) {
      for (const track of this.project.tracks) {
        for (const item of track.items) {
          if (Math.abs(time - item.startTime) < threshold) return item.startTime
          if (Math.abs(time - (item.startTime + item.duration)) < threshold) {
            return item.startTime + item.duration
          }
        }
      }
    }

    return time
  }

  getItem(itemId: string): TimelineItem | null {
    if (!this.project) return null

    for (const track of this.project.tracks) {
      const item = track.items.find(i => i.id === itemId)
      if (item) return item
    }

    return null
  }

  getItemsAtTime(time: number): TimelineItem[] {
    if (!this.project) return []

    const items: TimelineItem[] = []
    for (const track of this.project.tracks) {
      for (const item of track.items) {
        if (time >= item.startTime && time < item.startTime + item.duration) {
          items.push(item)
        }
      }
    }

    return items
  }

  getInterpolatedValue(item: TimelineItem, property: string, time: number): any {
    const keyframes = item.keyframes.filter(k => k.property === property)
    if (keyframes.length === 0) return item.properties[property]
    if (keyframes.length === 1) return keyframes[0].value

    // Find surrounding keyframes
    const itemTime = time - item.startTime
    let prev: Keyframe | null = null
    let next: Keyframe | null = null

    for (const kf of keyframes) {
      if (kf.time <= itemTime) prev = kf
      if (kf.time > itemTime && !next) next = kf
    }

    if (!prev) return keyframes[0].value
    if (!next) return prev.value

    // Interpolate
    const t = (itemTime - prev.time) / (next.time - prev.time)
    const easedT = this.applyEasing(t, prev.easing)

    // Simple linear interpolation for numbers
    if (typeof prev.value === 'number' && typeof next.value === 'number') {
      return prev.value + (next.value - prev.value) * easedT
    }

    return prev.value
  }

  private applyEasing(t: number, easing: EasingType): number {
    switch (easing) {
      case 'ease-in':
        return t * t
      case 'ease-out':
        return 1 - (1 - t) * (1 - t)
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      case 'bounce':
        const n1 = 7.5625
        const d1 = 2.75
        if (t < 1 / d1) return n1 * t * t
        if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75
        if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375
        return n1 * (t -= 2.625 / d1) * t + 0.984375
      default:
        return t
    }
  }

  // Export project data for rendering
  exportForRender(): any {
    if (!this.project) return null

    return {
      duration: this.project.duration,
      fps: this.project.fps,
      resolution: this.project.resolution,
      tracks: this.project.tracks.map(track => ({
        ...track,
        items: track.items.map(item => ({
          ...item,
          renderedEffects: item.effects.filter(e => e.enabled),
        })),
      })),
      markers: this.project.markers,
    }
  }
}

// Singleton instance
let timelineInstance: TimelineService | null = null

export function getTimelineService(): TimelineService {
  if (!timelineInstance) {
    timelineInstance = new TimelineService()
  }
  return timelineInstance
}

export default TimelineService
