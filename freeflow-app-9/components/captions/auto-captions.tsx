'use client'

/**
 * Auto-Captions Component
 *
 * Upload audio/video, transcribe with Whisper, and generate captions
 */

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Upload,
  Mic,
  FileAudio,
  FileVideo,
  Languages,
  Loader2,
  Download,
  Copy,
  Check,
  AlertCircle,
  Play,
  Pause,
  Clock,
  Settings,
  Wand2,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// ============================================================================
// Types
// ============================================================================

interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
}

interface TranscriptionResult {
  id: string
  text: string
  language: string
  duration: number
  segments: TranscriptionSegment[]
}

interface CaptionStyle {
  maxCharsPerLine: number
  maxLines: number
  minDuration: number
  maxDuration: number
  position: 'top' | 'bottom'
  alignment: 'left' | 'center' | 'right'
  fontFamily?: string
  fontSize?: number
}

interface AutoCaptionsProps {
  onCaptionsGenerated?: (captions: TranscriptionResult) => void
  onExport?: (format: string, content: string) => void
  className?: string
}

// ============================================================================
// Supported Languages
// ============================================================================

const LANGUAGES = [
  { code: 'auto', name: 'Auto-detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
]

// ============================================================================
// Main Component
// ============================================================================

export function AutoCaptions({
  onCaptionsGenerated,
  onExport,
  className,
}: AutoCaptionsProps) {
  // File state
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  // Transcription state
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const [result, setResult] = useState<TranscriptionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Options
  const [language, setLanguage] = useState('auto')
  const [prompt, setPrompt] = useState('')

  // Caption style
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>({
    maxCharsPerLine: 42,
    maxLines: 2,
    minDuration: 1,
    maxDuration: 7,
    position: 'bottom',
    alignment: 'center',
  })

  // Export state
  const [exportFormat, setExportFormat] = useState('vtt')
  const [exportContent, setExportContent] = useState('')
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [copied, setCopied] = useState(false)

  // Editing state
  const [editingSegment, setEditingSegment] = useState<number | null>(null)
  const [segments, setSegments] = useState<TranscriptionSegment[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ============================================================================
  // File Handling
  // ============================================================================

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }, [])

  const validateAndSetFile = (f: File) => {
    // Check file type
    const validTypes = ['audio/', 'video/']
    if (!validTypes.some((t) => f.type.startsWith(t))) {
      toast.error('Invalid file type', {
        description: 'Please upload an audio or video file.',
      })
      return
    }

    // Check file size (25MB limit)
    if (f.size > 25 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 25MB.',
      })
      return
    }

    setFile(f)
    setError(null)
    setResult(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  // ============================================================================
  // Transcription
  // ============================================================================

  const startTranscription = async () => {
    if (!file) return

    setIsTranscribing(true)
    setProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)
      if (prompt) formData.append('prompt', prompt)
      formData.append('async', 'true')

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start transcription')
      }

      setJobId(data.job.id)

      // Poll for progress
      const pollProgress = async () => {
        try {
          const statusResponse = await fetch(
            `/api/transcribe?jobId=${data.job.id}`
          )
          const statusData = await statusResponse.json()

          if (statusData.job) {
            setProgress(statusData.job.progress || 0)

            if (statusData.job.status === 'completed' && statusData.result) {
              setIsTranscribing(false)
              setResult(statusData.result)
              setSegments(statusData.result.segments || [])
              onCaptionsGenerated?.(statusData.result)
              toast.success('Transcription complete!', {
                description: `${formatDuration(statusData.result.duration)} of audio transcribed.`,
              })
              return
            }

            if (statusData.job.status === 'failed') {
              setIsTranscribing(false)
              setError(statusData.job.error || 'Transcription failed')
              toast.error('Transcription failed', {
                description: statusData.job.error,
              })
              return
            }
          }

          // Continue polling
          setTimeout(pollProgress, 1000)
        } catch (err) {
          console.error('Error polling transcription:', err)
        }
      }

      pollProgress()
    } catch (err) {
      setIsTranscribing(false)
      const message = err instanceof Error ? err.message : 'Unknown error'
      setError(message)
      toast.error('Transcription failed', { description: message })
    }
  }

  // ============================================================================
  // Export
  // ============================================================================

  const exportCaptions = async (format: string) => {
    if (!jobId && segments.length === 0) return

    try {
      const response = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          segments: segments.length > 0 ? segments : undefined,
          style: captionStyle,
          format,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to export captions')
      }

      setExportContent(data.content)
      setExportFormat(format)
      setShowExportDialog(true)
      onExport?.(format, data.content)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      toast.error('Export failed', { description: message })
    }
  }

  const downloadCaptions = () => {
    const blob = new Blob([exportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `captions.${exportFormat}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Downloaded!', {
      description: `captions.${exportFormat}`,
    })
  }

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(exportContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard')
  }

  // ============================================================================
  // Segment Editing
  // ============================================================================

  const updateSegment = (id: number, text: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, text } : s))
    )
  }

  const deleteSegment = (id: number) => {
    setSegments((prev) => prev.filter((s) => s.id !== id))
  }

  const splitSegment = (id: number, splitPoint: number) => {
    setSegments((prev) => {
      const index = prev.findIndex((s) => s.id === id)
      if (index === -1) return prev

      const segment = prev[index]
      const words = segment.text.split(' ')
      const firstHalf = words.slice(0, splitPoint).join(' ')
      const secondHalf = words.slice(splitPoint).join(' ')
      const midTime = segment.start + (segment.end - segment.start) / 2

      const newSegments = [...prev]
      newSegments.splice(
        index,
        1,
        { ...segment, text: firstHalf, end: midTime },
        {
          id: Date.now(),
          start: midTime,
          end: segment.end,
          text: secondHalf,
        }
      )

      return newSegments
    })
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTimestamp = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.round((seconds % 1) * 1000)
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
  }

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn('space-y-6', className)}>
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Auto-Captions with AI
          </CardTitle>
          <CardDescription>
            Upload audio or video and automatically generate captions using Whisper AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25',
              file && 'border-green-500 bg-green-500/5'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  {file.type.startsWith('audio/') ? (
                    <FileAudio className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileVideo className="h-8 w-8 text-green-500" />
                  )}
                </div>
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFile(null)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Supports MP3, MP4, WAV, WEBM, OGG, FLAC (max 25MB)
                </p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Context Prompt (optional)</Label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Technical terms, names..."
              />
            </div>
          </div>

          {/* Transcribe Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!file || isTranscribing}
            onClick={startTranscription}
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transcribing... {progress}%
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Generate Captions
              </>
            )}
          </Button>

          {/* Progress */}
          {isTranscribing && (
            <div className="space-y-2">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Processing with Whisper AI...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {(result || segments.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Captions</CardTitle>
                <CardDescription>
                  {segments.length} segments •{' '}
                  {result?.language && (
                    <Badge variant="outline" className="ml-1">
                      {LANGUAGES.find((l) => l.code === result.language)?.name ||
                        result.language}
                    </Badge>
                  )}
                  {result?.duration && (
                    <span className="ml-2">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDuration(result.duration)}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={exportFormat}
                  onValueChange={setExportFormat}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vtt">VTT</SelectItem>
                    <SelectItem value="srt">SRT</SelectItem>
                    <SelectItem value="ass">ASS</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="txt">Text</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => exportCaptions(exportFormat)}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="segments">
              <TabsList className="mb-4">
                <TabsTrigger value="segments">Segments</TabsTrigger>
                <TabsTrigger value="transcript">Full Transcript</TabsTrigger>
                <TabsTrigger value="settings">Style Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="segments">
                <ScrollArea className="h-96">
                  <div className="space-y-2 pr-4">
                    {segments.map((segment) => (
                      <div
                        key={segment.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          editingSegment === segment.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-xs text-muted-foreground font-mono whitespace-nowrap">
                            {formatTimestamp(segment.start)}
                            <br />
                            {formatTimestamp(segment.end)}
                          </div>
                          <div className="flex-1">
                            {editingSegment === segment.id ? (
                              <Textarea
                                value={segment.text}
                                onChange={(e) =>
                                  updateSegment(segment.id, e.target.value)
                                }
                                onBlur={() => setEditingSegment(null)}
                                autoFocus
                                className="min-h-[60px]"
                              />
                            ) : (
                              <p
                                className="cursor-pointer"
                                onClick={() => setEditingSegment(segment.id)}
                              >
                                {segment.text}
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSegment(segment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="transcript">
                <ScrollArea className="h-96">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p>{result?.text || segments.map((s) => s.text).join(' ')}</p>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Max Characters per Line</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[captionStyle.maxCharsPerLine]}
                        min={20}
                        max={60}
                        step={1}
                        onValueChange={([v]) =>
                          setCaptionStyle((prev) => ({
                            ...prev,
                            maxCharsPerLine: v,
                          }))
                        }
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">
                        {captionStyle.maxCharsPerLine}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Max Lines</Label>
                    <Select
                      value={captionStyle.maxLines.toString()}
                      onValueChange={(v) =>
                        setCaptionStyle((prev) => ({
                          ...prev,
                          maxLines: parseInt(v),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 line</SelectItem>
                        <SelectItem value="2">2 lines</SelectItem>
                        <SelectItem value="3">3 lines</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Duration (seconds)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[captionStyle.minDuration]}
                        min={0.5}
                        max={3}
                        step={0.5}
                        onValueChange={([v]) =>
                          setCaptionStyle((prev) => ({
                            ...prev,
                            minDuration: v,
                          }))
                        }
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">
                        {captionStyle.minDuration}s
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Max Duration (seconds)</Label>
                    <div className="flex items-center gap-4">
                      <Slider
                        value={[captionStyle.maxDuration]}
                        min={3}
                        max={10}
                        step={0.5}
                        onValueChange={([v]) =>
                          setCaptionStyle((prev) => ({
                            ...prev,
                            maxDuration: v,
                          }))
                        }
                        className="flex-1"
                      />
                      <span className="text-sm w-8 text-right">
                        {captionStyle.maxDuration}s
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Select
                      value={captionStyle.position}
                      onValueChange={(v) =>
                        setCaptionStyle((prev) => ({
                          ...prev,
                          position: v as 'top' | 'bottom',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom">Bottom</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alignment</Label>
                    <Select
                      value={captionStyle.alignment}
                      onValueChange={(v) =>
                        setCaptionStyle((prev) => ({
                          ...prev,
                          alignment: v as 'left' | 'center' | 'right',
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Captions</DialogTitle>
            <DialogDescription>
              {exportFormat.toUpperCase()} format ready for download
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-96 border rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono">
              {exportContent}
            </pre>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button onClick={downloadCaptions}>
              <Download className="h-4 w-4 mr-2" />
              Download .{exportFormat}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AutoCaptions
