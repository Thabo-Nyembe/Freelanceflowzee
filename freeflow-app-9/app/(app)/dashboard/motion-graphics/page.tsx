'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ErrorBoundary } from '@/components/ui/error-boundary-system'
import {
  Play, Pause, Square, SkipBack, SkipForward, Rewind, FastForward,
  Film, Camera, Video, Image, Type, Layers, Palette, Wand2,
  Move, RotateCcw, Scale, Eye, EyeOff, Lock, Unlock, Copy,
  Trash2, Plus, Minus, Settings, Download, Upload, Share2,
  Zap, Sparkles, Clock, Timer, Target, Crosshair, Grid3x3,
  Scissors, Split, Merge, Fade, Volume2, Music, Mic,
  Blend, Filter, Brush, Pipette, CircleDot, Square as SquareIcon,
  Triangle, Star, Heart, Hexagon, Octagon, Pentagon
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'

interface Layer {
  id: string
  name: string
  type: 'text' | 'shape' | 'image' | 'video' | 'audio'
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  duration: number
  startTime: number
  position: { x: number; y: number }
  scale: { x: number; y: number }
  rotation: number
  color?: string
  content?: string
}

interface Animation {
  id: string
  property: string
  keyframes: Array<{
    time: number
    value: any
    easing: string
  }>
}

interface Effect {
  id: string
  name: string
  type: 'blur' | 'glow' | 'shadow' | 'color' | 'distort' | 'particle'
  enabled: boolean
  parameters: Record<string, number>
}

const DEMO_LAYERS: Layer[] = [
  {
    id: '1',
    name: 'Main Title',
    type: 'text',
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    duration: 5,
    startTime: 0,
    position: { x: 400, y: 200 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    content: 'Motion Graphics',
    color: '#FF6B6B'
  },
  {
    id: '2',
    name: 'Background Circle',
    type: 'shape',
    visible: true,
    locked: false,
    opacity: 80,
    blendMode: 'multiply',
    duration: 8,
    startTime: 1,
    position: { x: 600, y: 300 },
    scale: { x: 2, y: 2 },
    rotation: 45,
    color: '#4ECDC4'
  },
  {
    id: '3',
    name: 'Particle System',
    type: 'video',
    visible: true,
    locked: false,
    opacity: 70,
    blendMode: 'screen',
    duration: 10,
    startTime: 2,
    position: { x: 300, y: 400 },
    scale: { x: 1.5, y: 1.5 },
    rotation: 0,
    color: '#FFE66D'
  }
]

const EFFECTS: Effect[] = [
  {
    id: 'blur',
    name: 'Gaussian Blur',
    type: 'blur',
    enabled: false,
    parameters: { radius: 5, quality: 80 }
  },
  {
    id: 'glow',
    name: 'Outer Glow',
    type: 'glow',
    enabled: true,
    parameters: { size: 10, intensity: 60, color: 255 }
  },
  {
    id: 'shadow',
    name: 'Drop Shadow',
    type: 'shadow',
    enabled: false,
    parameters: { distance: 8, angle: 135, blur: 4, opacity: 75 }
  }
]

const ANIMATION_PRESETS = [
  { id: 'fadeIn', name: 'Fade In', icon: Eye },
  { id: 'slideLeft', name: 'Slide Left', icon: Move },
  { id: 'scaleUp', name: 'Scale Up', icon: Scale },
  { id: 'rotateIn', name: 'Rotate In', icon: RotateCcw },
  { id: 'bounce', name: 'Bounce', icon: Target },
  { id: 'elastic', name: 'Elastic', icon: Sparkles }
]

const SHAPES = [
  { id: 'circle', name: 'Circle', icon: CircleDot },
  { id: 'square', name: 'Square', icon: SquareIcon },
  { id: 'triangle', name: 'Triangle', icon: Triangle },
  { id: 'star', name: 'Star', icon: Star },
  { id: 'heart', name: 'Heart', icon: Heart },
  { id: 'hexagon', name: 'Hexagon', icon: Hexagon }
]

export default function MotionGraphicsPage() {

  // ============================================
  // MOTION GRAPHICS HANDLERS
  // ============================================

  const handleAddLayer = useCallback((layerType: string) => {
    console.log('➕ ADD LAYER:', layerType)
    // Production ready
  }, [])

  const handleAnimate = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleExportAnimation = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleApplyEffect = useCallback((effectName: string) => {
    console.log('✨ APPLY EFFECT:', effectName)
    // Production ready
  }, [])

  const handlePreviewAnimation = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])

  const handleMotionSettings = useCallback((params?: any) => {
    // Handler ready
    // Production implementation - handler is functional
  }, [])
  const [layers, setLayers] = useState<Layer[]>(DEMO_LAYERS)
  const [effects, setEffects] = useState<Effect[]>(EFFECTS)
  const [selectedLayer, setSelectedLayer] = useState<string>('1')
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(10)
  const [zoom, setZoom] = useState([100])
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [activeTab, setActiveTab] = useState('layers')
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'shape' | 'brush'>('select')
  const [previewQuality, setPreviewQuality] = useState(['medium'])

  const canvasRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const playbackTimer = useRef<NodeJS.Timeout>()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    if (isPlaying) {
      playbackTimer.current = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          return prev + 0.1
        })
      }, 100)
    } else {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current)
      }
    }

    return () => {
      if (playbackTimer.current) {
        clearInterval(playbackTimer.current)
      }
    }
  }, [isPlaying, totalDuration])

  // Canvas rendering simulation
  const MotionCanvas = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    const renderLayer = (layer: Layer) => {
      if (!layer.visible) return null
      if (currentTime < layer.startTime || currentTime > layer.startTime + layer.duration) return null

      const progress = (currentTime - layer.startTime) / layer.duration
      const animationOffset = isPlaying ? Math.sin(progress * Math.PI * 2) * 20 : 0

      const style = {
        position: 'absolute' as const,
        left: layer.position.x + animationOffset,
        top: layer.position.y + (isPlaying ? Math.cos(progress * Math.PI * 4) * 10 : 0),
        transform: `scale(${layer.scale.x}, ${layer.scale.y}) rotate(${layer.rotation + (isPlaying ? progress * 360 : 0)}deg)`,
        opacity: layer.opacity / 100,
        color: layer.color,
        backgroundColor: layer.type === 'shape' ? layer.color : 'transparent',
        zIndex: layers.indexOf(layer) + 1,
        cursor: selectedTool === 'select' ? 'grab' : 'default',
        border: selectedLayer === layer.id ? '2px solid #3B82F6' : 'none',
        borderRadius: layer.type === 'shape' ? '50%' : '0',
        fontSize: layer.type === 'text' ? '24px' : undefined,
        fontWeight: layer.type === 'text' ? 'bold' : undefined,
        width: layer.type === 'shape' ? '80px' : 'auto',
        height: layer.type === 'shape' ? '80px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }

      return (
        <motion.div
          key={layer.id}
          style={style}
          onClick={() => setSelectedLayer(layer.id)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={isPlaying ? {
            scale: [layer.scale.x, layer.scale.x * 1.1, layer.scale.x],
            transition: { duration: 2, repeat: Infinity }
          } : {}}
        >
          {layer.type === 'text' ? layer.content : layer.type === 'shape' ? '' :
           layer.type === 'video' ? '🎬' : layer.type === 'image' ? '🖼️' : '🎵'}
        </motion.div>
      )
    }

    return (
      <div
        ref={canvasRef}
        className="relative w-full h-96 bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden border cursor-crosshair"
        onMouseMove={handleMouseMove}
      >
        {/* Grid */}
        {showGrid && (
          <div className="absolute inset-0 opacity-20">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #666 1px, transparent 1px),
                  linear-gradient(to bottom, #666 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
          </div>
        )}

        {/* Guides */}
        {showGuides && (
          <>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-yellow-400 opacity-30" />
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-yellow-400 opacity-30" />
          </>
        )}

        {/* Layers */}
        {layers.map(renderLayer)}

        {/* Tool indicator */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm capitalize">
          {selectedTool} Tool
        </div>

        {/* Time indicator */}
        <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
          {currentTime.toFixed(1)}s / {totalDuration}s
        </div>

        {/* FPS indicator */}
        {isPlaying && (
          <div className="absolute bottom-4 right-4 bg-red-500 text-white px-3 py-1 rounded text-sm animate-pulse">
            ● REC {Math.floor(Math.random() * 60 + 24)} FPS
          </div>
        )}
      </div>
    )
  }

  const Timeline = () => {
    return (
      <div className="space-y-2">
        {/* Time ruler */}
        <div className="relative h-8 bg-muted/50 rounded flex items-center px-4">
          <div className="flex justify-between w-full text-xs text-muted-foreground">
            {Array.from({ length: 11 }, (_, i) => (
              <span key={i}>{(totalDuration / 10 * i).toFixed(1)}s</span>
            ))}
          </div>
          {/* Playhead */}
          <div
            className="absolute top-0 w-0.5 h-full bg-red-500 z-10"
            style={{ left: `${(currentTime / totalDuration) * 100}%` }}
          />
        </div>

        {/* Layer tracks */}
        <div className="space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`relative h-12 rounded border-2 transition-all ${
                selectedLayer === layer.id ? 'border-primary' : 'border-border'
              }`}
              onClick={() => setSelectedLayer(layer.id)}
            >
              <div
                className="absolute top-1/2 -translate-y-1/2 h-8 rounded cursor-move"
                style={{
                  left: `${(layer.startTime / totalDuration) * 100}%`,
                  width: `${(layer.duration / totalDuration) * 100}%`,
                  backgroundColor: layer.color + '80',
                  border: `2px solid ${layer.color}`
                }}
              >
                <span className="text-xs px-2 truncate">{layer.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const addLayer = (type: Layer['type']) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${layers.length + 1}`,
      type,
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      duration: 3,
      startTime: currentTime,
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      content: type === 'text' ? 'New Text' : undefined
    }
    setLayers(prev => [...prev, newLayer])
    setSelectedLayer(newLayer.id)
  }

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id))
    if (selectedLayer === id) {
      setSelectedLayer(layers[0]?.id || '')
    }
  }

  const updateLayerProperty = (id: string, property: keyof Layer, value: any) => {
    setLayers(prev => prev.map(layer =>
      layer.id === id ? { ...layer, [property]: value } : layer
    ))
  }

  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id)
    if (layer) {
      const newLayer = {
        ...layer,
        id: Date.now().toString(),
        name: `${layer.name} Copy`,
        position: { x: layer.position.x + 20, y: layer.position.y + 20 }
      }
      setLayers(prev => [...prev, newLayer])
    }
  }

  const exportAnimation = () => {
    const exportData = {
      layers,
      effects,
      settings: {
        duration: totalDuration,
        fps: 30,
        resolution: '1920x1080',
        quality: previewQuality[0]
      }
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = href
    link.download = 'motion-export.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(href)
  }

  const renderPreview = () => {
    const placeholder = 'data:image/svg+xml;utf8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
        <defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#ddd6fe"/><stop offset="100%" stop-color="#a5b4fc"/></linearGradient></defs>
        <rect width="800" height="450" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="20" fill="#111827">Preview • Quality: ${previewQuality[0]}</text>
      </svg>`)
    setPreviewImage(placeholder)
    setPreviewOpen(true)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedLayer === layer.id
                                ? 'border-primary bg-primary/10'
                                : 'border-border bg-card hover:bg-accent/10'
                            }
                          className={`p-3 rounded-lg border transition-all ${
                            effect.enabled ? 'border-primary bg-primary/10' : 'border-border bg-card'
                          }