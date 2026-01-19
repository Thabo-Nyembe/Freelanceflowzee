'use client'

/**
 * Remotion Player Component
 *
 * Interactive player for previewing Remotion compositions
 * with controls and customization options
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Player, PlayerRef } from '@remotion/player'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Download,
  Settings,
  Palette,
  Type,
  Image as ImageIcon,
  Film,
  Loader2,
  Check,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

// Import compositions
import {
  TextSlide,
  ImageSlide,
  LogoReveal,
  SocialProof,
  CallToAction,
  ProductShowcase,
  Countdown,
  ProgressBar,
  IntroOutroVideo,
  SlideshowVideo,
  PromoVideo,
} from '@/lib/remotion/compositions'

// ============================================================================
// Types
// ============================================================================

export interface CompositionConfig {
  id: string
  name: string
  component: React.FC<Record<string, unknown>>
  defaultProps: Record<string, unknown>
  defaultDuration: number
  category: string
}

export interface RenderSettings {
  width: number
  height: number
  fps: number
  codec: 'h264' | 'h265' | 'vp8' | 'vp9'
  crf: number
  format: 'mp4' | 'webm' | 'gif'
}

export interface RemotionPlayerProps {
  compositionId?: string
  initialProps?: Record<string, unknown>
  onRender?: (settings: RenderSettings, props: Record<string, unknown>) => void
  className?: string
}

// ============================================================================
// Composition Registry
// ============================================================================

const compositions: Record<string, CompositionConfig> = {
  TextSlide: {
    id: 'TextSlide',
    name: 'Text Slide',
    component: TextSlide as React.FC<Record<string, unknown>>,
    defaultProps: {
      title: 'Welcome to FreeFlow',
      subtitle: 'The future of freelancing',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff',
      animation: 'slide',
    },
    defaultDuration: 3,
    category: 'Basic',
  },
  ImageSlide: {
    id: 'ImageSlide',
    name: 'Image Slide',
    component: ImageSlide as React.FC<Record<string, unknown>>,
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920',
      title: 'Beautiful Imagery',
      animation: 'kenBurns',
      overlayColor: 'rgba(0,0,0,0.3)',
    },
    defaultDuration: 5,
    category: 'Basic',
  },
  LogoReveal: {
    id: 'LogoReveal',
    name: 'Logo Reveal',
    component: LogoReveal as React.FC<Record<string, unknown>>,
    defaultProps: {
      logoSrc: '/logo.svg',
      backgroundColor: '#000000',
      animation: 'scale',
    },
    defaultDuration: 3,
    category: 'Marketing',
  },
  SocialProof: {
    id: 'SocialProof',
    name: 'Testimonial',
    component: SocialProof as React.FC<Record<string, unknown>>,
    defaultProps: {
      testimonial:
        'FreeFlow transformed my freelance business! The platform is intuitive and the features are exactly what I needed.',
      author: 'Jane Doe',
      authorTitle: 'Freelance Designer',
      backgroundColor: '#f8f9fa',
    },
    defaultDuration: 5,
    category: 'Social',
  },
  CallToAction: {
    id: 'CallToAction',
    name: 'Call to Action',
    component: CallToAction as React.FC<Record<string, unknown>>,
    defaultProps: {
      headline: 'Start Your Free Trial',
      subheadline: 'No credit card required',
      buttonText: 'Get Started',
      backgroundColor: '#6366f1',
      accentColor: '#ffffff',
    },
    defaultDuration: 4,
    category: 'Marketing',
  },
  ProductShowcase: {
    id: 'ProductShowcase',
    name: 'Product Showcase',
    component: ProductShowcase as React.FC<Record<string, unknown>>,
    defaultProps: {
      productImage:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      productName: 'FreeFlow Pro',
      features: [
        'Unlimited Projects',
        'Advanced Analytics',
        '24/7 Support',
        'Custom Branding',
      ],
      price: '$29/month',
      backgroundColor: '#ffffff',
    },
    defaultDuration: 6,
    category: 'Marketing',
  },
  Countdown: {
    id: 'Countdown',
    name: 'Countdown',
    component: Countdown as React.FC<Record<string, unknown>>,
    defaultProps: {
      targetDate: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      title: 'Launch Coming Soon',
      backgroundColor: '#1a1a2e',
    },
    defaultDuration: 10,
    category: 'Social',
  },
  ProgressBar: {
    id: 'ProgressBar',
    name: 'Progress Bar',
    component: ProgressBar as React.FC<Record<string, unknown>>,
    defaultProps: {
      progress: 75,
      label: 'Project Progress',
      color: '#6366f1',
    },
    defaultDuration: 3,
    category: 'Basic',
  },
}

// Presets for common sizes
const sizePresets = [
  { name: 'YouTube (1080p)', width: 1920, height: 1080 },
  { name: 'YouTube (4K)', width: 3840, height: 2160 },
  { name: 'Instagram Post', width: 1080, height: 1080 },
  { name: 'Instagram Story', width: 1080, height: 1920 },
  { name: 'TikTok', width: 1080, height: 1920 },
  { name: 'Twitter Video', width: 1280, height: 720 },
  { name: 'LinkedIn', width: 1920, height: 1080 },
  { name: 'Facebook Feed', width: 1280, height: 720 },
  { name: 'Facebook Story', width: 1080, height: 1920 },
]

// ============================================================================
// Main Component
// ============================================================================

export function RemotionPlayer({
  compositionId = 'TextSlide',
  initialProps,
  onRender,
  className = '',
}: RemotionPlayerProps) {
  // State
  const [selectedComposition, setSelectedComposition] = useState(compositionId)
  const [props, setProps] = useState<Record<string, unknown>>(
    initialProps || compositions[compositionId]?.defaultProps || {}
  )
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [duration, setDuration] = useState(
    compositions[compositionId]?.defaultDuration || 5
  )

  // Render settings
  const [renderSettings, setRenderSettings] = useState<RenderSettings>({
    width: 1920,
    height: 1080,
    fps: 30,
    codec: 'h264',
    crf: 18,
    format: 'mp4',
  })

  // Render state
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [renderJobId, setRenderJobId] = useState<string | null>(null)

  const playerRef = useRef<PlayerRef>(null)

  // Get current composition
  const currentComposition = compositions[selectedComposition]

  // Calculate frames
  const fps = renderSettings.fps
  const durationInFrames = Math.round(duration * fps)

  // Handle composition change
  const handleCompositionChange = useCallback((compId: string) => {
    setSelectedComposition(compId)
    const comp = compositions[compId]
    if (comp) {
      setProps(comp.defaultProps)
      setDuration(comp.defaultDuration)
    }
    setCurrentFrame(0)
    setPlaying(false)
  }, [])

  // Handle prop change
  const handlePropChange = useCallback(
    (key: string, value: unknown) => {
      setProps((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  // Playback controls
  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
    }
    setPlaying(!playing)
  }, [playing])

  const seekTo = useCallback((frame: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(frame)
    }
    setCurrentFrame(frame)
  }, [])

  const restart = useCallback(() => {
    seekTo(0)
    setPlaying(true)
    if (playerRef.current) {
      playerRef.current.play()
    }
  }, [seekTo])

  // Handle size preset
  const handleSizePreset = useCallback((preset: (typeof sizePresets)[0]) => {
    setRenderSettings((prev) => ({
      ...prev,
      width: preset.width,
      height: preset.height,
    }))
  }, [])

  // Start render
  const startRender = useCallback(async () => {
    if (onRender) {
      onRender(renderSettings, props)
      return
    }

    setIsRendering(true)
    setRenderProgress(0)

    try {
      const response = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          compositionId: selectedComposition,
          inputProps: props,
          ...renderSettings,
          durationInFrames,
          async: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start render')
      }

      setRenderJobId(data.job.id)
      toast.success('Render started', {
        description: 'Your video is being rendered...',
      })

      // Poll for progress
      const pollProgress = async () => {
        try {
          const statusResponse = await fetch(
            `/api/remotion/render?jobId=${data.job.id}`
          )
          const statusData = await statusResponse.json()

          if (statusData.job) {
            setRenderProgress(statusData.job.progress)

            if (statusData.job.status === 'completed') {
              setIsRendering(false)
              toast.success('Render complete!', {
                description: 'Your video is ready to download.',
                action: {
                  label: 'Download',
                  onClick: () => {
                    window.open(statusData.job.downloadUrl, '_blank')
                  },
                },
              })
              return
            }

            if (statusData.job.status === 'failed') {
              setIsRendering(false)
              toast.error('Render failed', {
                description: statusData.job.error || 'Unknown error',
              })
              return
            }
          }

          // Continue polling
          setTimeout(pollProgress, 1000)
        } catch {
          console.error('Error polling render status')
        }
      }

      pollProgress()
    } catch (error) {
      setIsRendering(false)
      toast.error('Render failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [selectedComposition, props, renderSettings, durationInFrames, onRender])

  // Player aspect ratio calculation
  const aspectRatio = renderSettings.width / renderSettings.height
  const playerHeight = 400
  const playerWidth = playerHeight * aspectRatio

  if (!currentComposition) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Composition not found</p>
      </div>
    )
  }

  const Component = currentComposition.component

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Preview Panel */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Preview</CardTitle>
              <Badge variant="outline">{currentComposition.category}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Player Container */}
            <div
              className="relative bg-black rounded-lg overflow-hidden mx-auto"
              style={{
                width: Math.min(playerWidth, 800),
                height: Math.min(playerHeight, 450),
              }}
            >
              <Player
                ref={playerRef}
                component={Component}
                inputProps={props}
                durationInFrames={durationInFrames}
                fps={fps}
                compositionWidth={renderSettings.width}
                compositionHeight={renderSettings.height}
                style={{ width: '100%', height: '100%' }}
                controls={false}
                loop
                autoPlay={false}
              />
            </div>

            {/* Timeline */}
            <div className="mt-4 space-y-2">
              <Slider
                value={[currentFrame]}
                min={0}
                max={durationInFrames}
                step={1}
                onValueChange={([frame]) => seekTo(frame)}
                className="w-full"
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {(currentFrame / fps).toFixed(1)}s
                </span>
                <span>{duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="icon" onClick={restart}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={togglePlay}>
                {playing ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => seekTo(durationInFrames)}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-8 mx-2" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMuted(!muted)}
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-24">
                <Slider
                  value={[muted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([v]) => {
                    setVolume(v)
                    setMuted(v === 0)
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Render Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Render Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Size Preset */}
              <div className="col-span-2">
                <Label>Size Preset</Label>
                <Select
                  onValueChange={(value) => {
                    const preset = sizePresets.find((p) => p.name === value)
                    if (preset) handleSizePreset(preset)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preset..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sizePresets.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name} ({preset.width}x{preset.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Size */}
              <div>
                <Label>Width</Label>
                <Input
                  type="number"
                  value={renderSettings.width}
                  onChange={(e) =>
                    setRenderSettings((prev) => ({
                      ...prev,
                      width: parseInt(e.target.value) || 1920,
                    }))
                  }
                />
              </div>
              <div>
                <Label>Height</Label>
                <Input
                  type="number"
                  value={renderSettings.height}
                  onChange={(e) =>
                    setRenderSettings((prev) => ({
                      ...prev,
                      height: parseInt(e.target.value) || 1080,
                    }))
                  }
                />
              </div>

              {/* FPS */}
              <div>
                <Label>FPS</Label>
                <Select
                  value={renderSettings.fps.toString()}
                  onValueChange={(v) =>
                    setRenderSettings((prev) => ({
                      ...prev,
                      fps: parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="60">60</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Format */}
              <div>
                <Label>Format</Label>
                <Select
                  value={renderSettings.format}
                  onValueChange={(v) =>
                    setRenderSettings((prev) => ({
                      ...prev,
                      format: v as 'mp4' | 'webm' | 'gif',
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                    <SelectItem value="gif">GIF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div>
                <Label>Duration (s)</Label>
                <Input
                  type="number"
                  value={duration}
                  min={1}
                  max={300}
                  onChange={(e) =>
                    setDuration(parseFloat(e.target.value) || 5)
                  }
                />
              </div>

              {/* Quality */}
              <div>
                <Label>Quality (CRF)</Label>
                <Select
                  value={renderSettings.crf.toString()}
                  onValueChange={(v) =>
                    setRenderSettings((prev) => ({
                      ...prev,
                      crf: parseInt(v),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">High (15)</SelectItem>
                    <SelectItem value="18">Medium (18)</SelectItem>
                    <SelectItem value="23">Low (23)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Render Button */}
            <div className="mt-4 flex items-center gap-4">
              <Button
                onClick={startRender}
                disabled={isRendering}
                className="flex-1"
              >
                {isRendering ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rendering... {renderProgress}%
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Render Video
                  </>
                )}
              </Button>
              {isRendering && (
                <div className="flex-1">
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${renderProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Props Panel */}
      <div className="space-y-4">
        {/* Composition Selector */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-4 w-4" />
              Composition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {Object.values(compositions).map((comp) => (
                  <Button
                    key={comp.id}
                    variant={
                      selectedComposition === comp.id ? 'default' : 'outline'
                    }
                    className="w-full justify-start"
                    onClick={() => handleCompositionChange(comp.id)}
                  >
                    {selectedComposition === comp.id && (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    {comp.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Props Editor */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4 pr-4">
                {Object.entries(props).map(([key, value]) => (
                  <div key={key}>
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    {typeof value === 'string' &&
                    (key.includes('color') || key.includes('Color')) ? (
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={
                            value.startsWith('rgba')
                              ? '#' +
                                value
                                  .match(/\d+/g)
                                  ?.slice(0, 3)
                                  .map((n) =>
                                    parseInt(n).toString(16).padStart(2, '0')
                                  )
                                  .join('')
                              : value
                          }
                          onChange={(e) =>
                            handlePropChange(key, e.target.value)
                          }
                          className="w-12 h-9 p-1"
                        />
                        <Input
                          value={value}
                          onChange={(e) =>
                            handlePropChange(key, e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    ) : typeof value === 'string' &&
                      (key.includes('src') ||
                        key.includes('Src') ||
                        key.includes('image') ||
                        key.includes('Image')) ? (
                      <div className="space-y-2">
                        <Input
                          value={value}
                          onChange={(e) =>
                            handlePropChange(key, e.target.value)
                          }
                          placeholder="Image URL..."
                        />
                        {value && (
                          <img
                            src={value}
                            alt="Preview"
                            className="w-full h-20 object-cover rounded"
                          />
                        )}
                      </div>
                    ) : typeof value === 'number' ? (
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          handlePropChange(
                            key,
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                    ) : typeof value === 'boolean' ? (
                      <Select
                        value={value.toString()}
                        onValueChange={(v) =>
                          handlePropChange(key, v === 'true')
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : Array.isArray(value) ? (
                      <div className="space-y-2">
                        {value.map((item, i) => (
                          <Input
                            key={i}
                            value={
                              typeof item === 'string' ? item : JSON.stringify(item)
                            }
                            onChange={(e) => {
                              const newArray = [...value]
                              newArray[i] = e.target.value
                              handlePropChange(key, newArray)
                            }}
                          />
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handlePropChange(key, [...value, ''])
                          }
                        >
                          Add Item
                        </Button>
                      </div>
                    ) : typeof value === 'object' ? (
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(value, null, 2)}
                      </pre>
                    ) : (
                      <Input
                        value={String(value)}
                        onChange={(e) => handlePropChange(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RemotionPlayer
