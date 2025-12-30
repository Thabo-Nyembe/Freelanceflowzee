"use client"

import React, { useState, useRef, useEffect } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AudioViewer')

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Comment {
  id: string
  content: string
  timestamp: number // in seconds
  author?: string
  createdAt?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
}

interface AudioViewerProps {
  src: string
  title?: string
  comments?: Comment[]
  onCommentAdd?: (comment: Partial<Comment>) => void
  onCommentEdit?: (id: string, content: string) => void
  onCommentDelete?: (id: string) => void
  className?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getPriorityColor(priority: string = 'medium'): string {
  switch (priority) {
    case 'critical': return 'bg-red-100 dark:bg-red-950 border-red-500'
    case 'high': return 'bg-orange-100 dark:bg-orange-950 border-orange-500'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-950 border-yellow-500'
    case 'low': return 'bg-blue-100 dark:bg-blue-950 border-blue-500'
    default: return 'bg-gray-100 dark:bg-gray-900 border-gray-500'
  }
}

// ============================================================================
// AUDIO VIEWER COMPONENT
// ============================================================================

export function AudioViewer({
  src,
  title = 'Audio File',
  comments = [],
  onCommentAdd,
  onCommentEdit,
  onCommentDelete,
  className = ""
}: AudioViewerProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState([80])
  const [isMuted, setIsMuted] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [editingComment, setEditingComment] = useState<Comment | null>(null)
  const [commentTimestamp, setCommentTimestamp] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)

  // ============================================================================
  // AUDIO EVENT HANDLERS
  // ============================================================================

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      logger.info('Audio metadata loaded', {
        duration: audio.duration,
        src
      })
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      logger.info('Audio playback ended')
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [src])

  // ============================================================================
  // WAVEFORM GENERATION
  // ============================================================================

  useEffect(() => {
    const generateWaveform = async () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const response = await fetch(src)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

        const rawData = audioBuffer.getChannelData(0)
        const samples = 100 // Number of bars in waveform
        const blockSize = Math.floor(rawData.length / samples)
        const filteredData: number[] = []

        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i
          let sum = 0
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(rawData[blockStart + j])
          }
          filteredData.push(sum / blockSize)
        }

        // Normalize
        const multiplier = Math.max(...filteredData) ** -1
        const normalized = filteredData.map(n => n * multiplier)

        setWaveformData(normalized)

        logger.debug('Waveform generated', {
          samples: normalized.length,
          duration: audioBuffer.duration
        })
      } catch (error: any) {
        logger.error('Failed to generate waveform', {
          error: error.message,
          src
        })
      }
    }

    if (src) {
      generateWaveform()
    }
  }, [src])

  // ============================================================================
  // WAVEFORM CANVAS RENDERING
  // ============================================================================

  useEffect(() => {
    const canvas = waveformCanvasRef.current
    if (!canvas || waveformData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const barWidth = width / waveformData.length
    const progress = currentTime / duration

    ctx.clearRect(0, 0, width, height)

    waveformData.forEach((value, index) => {
      const barHeight = value * height * 0.8
      const x = index * barWidth
      const y = (height - barHeight) / 2

      // Color based on playback progress
      const isPlayed = (index / waveformData.length) < progress
      ctx.fillStyle = isPlayed
        ? 'rgb(59, 130, 246)' // blue-500
        : 'rgb(209, 213, 219)' // gray-300

      ctx.fillRect(x, y, barWidth - 1, barHeight)
    })
  }, [waveformData, currentTime, duration])

  // ============================================================================
  // PLAYBACK CONTROLS
  // ============================================================================

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      logger.info('Audio paused', { currentTime: audio.currentTime })
    } else {
      audio.play()
      logger.info('Audio playing', { currentTime: audio.currentTime })
    }
    setIsPlaying(!isPlaying)
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = (value[0] / 100) * duration
    audio.currentTime = newTime
    setCurrentTime(newTime)

    logger.debug('Audio seeked', {
      from: currentTime,
      to: newTime
    })
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    setVolume(value)
    audio.volume = value[0] / 100
    setIsMuted(false)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    setIsMuted(!isMuted)
    audio.muted = !isMuted
  }

  const skipBackward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, audio.currentTime - 10)
  }

  const skipForward = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.min(duration, audio.currentTime + 10)
  }

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  const handleAddCommentClick = () => {
    setCommentTimestamp(currentTime)
    setShowCommentDialog(true)
    setNewComment('')
    setSelectedPriority('medium')
    setSelectedTags([])
    setEditingComment(null)

    logger.info('Adding comment', { timestamp: currentTime })
  }

  const handleCommentSubmit = () => {
    if (!newComment.trim() || !onCommentAdd) return

    const comment = {
      content: newComment.trim(),
      timestamp: commentTimestamp,
      priority: selectedPriority,
      tags: selectedTags
    }

    onCommentAdd(comment)
    setShowCommentDialog(false)
    setNewComment('')
    setSelectedTags([])

    logger.info('Comment added', {
      timestamp: commentTimestamp,
      priority: selectedPriority,
      tagsCount: selectedTags.length
    })
  }

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment)
    setNewComment(comment.content)
    setCommentTimestamp(comment.timestamp)
    setSelectedPriority(comment.priority || 'medium')
    setSelectedTags(comment.tags || [])
    setShowCommentDialog(true)

    logger.info('Editing comment', { commentId: comment.id })
  }

  const handleEditSubmit = () => {
    if (!newComment.trim() || !editingComment || !onCommentEdit) return

    onCommentEdit(editingComment.id, newComment.trim())
    setEditingComment(null)
    setShowCommentDialog(false)
    setNewComment('')
    setSelectedTags([])

    logger.info('Comment edited', { commentId: editingComment.id })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!onCommentDelete) return

    if (window.confirm('Are you sure you want to delete this comment?')) {
      onCommentDelete(commentId)
      logger.info('Comment deleted', { commentId })
    }
  }

  const seekToComment = (timestamp: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = timestamp
    setCurrentTime(timestamp)
    if (!isPlaying) {
      audio.play()
      setIsPlaying(true)
    }

    logger.info('Seeked to comment', { timestamp })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // ============================================================================
  // WAVEFORM CLICK HANDLER
  // ============================================================================

  const handleWaveformClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const audio = audioRef.current
    const canvas = waveformCanvasRef.current
    if (!audio || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const clickProgress = x / rect.width
    const newTime = clickProgress * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  // ============================================================================
  // SORTED COMMENTS BY TIMESTAMP
  // ============================================================================

  const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 ${className}`}>
      {/* Audio Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatTime(duration)} total
        </p>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={src} />

      {/* Waveform Display */}
      <div className="relative mb-4">
        <canvas
          ref={waveformCanvasRef}
          width={800}
          height={120}
          className="w-full h-30 cursor-pointer rounded bg-gray-50 dark:bg-gray-950"
          onClick={handleWaveformClick}
        />

        {/* Comment Markers on Waveform */}
        {sortedComments.map((comment) => {
          const position = (comment.timestamp / duration) * 100
          return (
            <div
              key={comment.id}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 cursor-pointer hover:bg-red-600 transition-colors"
              style={{ left: `${position}%` }}
              onClick={() => seekToComment(comment.timestamp)}
              title={`${formatTime(comment.timestamp)}: ${comment.content}`}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full -ml-1 -mt-1"></div>
            </div>
          )
        })}
      </div>

      {/* Progress Slider */}
      <div className="mb-4">
        <Slider
          value={[duration ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={skipBackward}
            disabled={currentTime === 0}
          >
            <SkipBack className="w-4 h-4" />
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={skipForward}
            disabled={currentTime >= duration}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleMute}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>

          <Slider
            value={isMuted ? [0] : volume}
            onValueChange={handleVolumeChange}
            max={100}
            className="w-24"
          />

          <Button
            variant="default"
            size="sm"
            onClick={handleAddCommentClick}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Comment
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments ({sortedComments.length})
        </h4>

        {sortedComments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
            No comments yet. Click "Add Comment" to leave feedback at the current timestamp.
          </p>
        )}

        {sortedComments.map((comment) => (
          <div
            key={comment.id}
            className={`p-3 rounded-lg border-l-4 ${getPriorityColor(comment.priority)} cursor-pointer hover:shadow-sm transition-shadow`}
            onClick={() => seekToComment(comment.timestamp)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(comment.timestamp)}
                  </Badge>
                  {comment.priority && comment.priority !== 'medium' && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {comment.priority}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                  {comment.content}
                </p>
                {comment.tags && comment.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {comment.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                {comment.author && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    By {comment.author} {comment.createdAt && `• ${comment.createdAt}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditComment(comment)
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteComment(comment.id)
                  }}
                >
                  <Trash2 className="w-3 h-3 text-red-600" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingComment ? 'Edit Comment' : 'Add Comment'} at {formatTime(commentTimestamp)}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Comment</label>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Enter your feedback or comment..."
                rows={4}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {['Audio Quality', 'Timing', 'Content', 'Performance', 'Technical'].map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCommentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingComment ? handleEditSubmit : handleCommentSubmit}>
              {editingComment ? 'Save Changes' : 'Add Comment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
