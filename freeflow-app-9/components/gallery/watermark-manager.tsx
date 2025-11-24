"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Droplet,
  Type,
  Image as ImageIcon,
  Upload,
  Download,
  Save,
  Eye,
  Settings,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  RotateCw,
  Layers,
  Sparkles
} from 'lucide-react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('WatermarkManager')

// ============================================================================
// TYPES
// ============================================================================

export interface WatermarkConfig {
  type: 'text' | 'image' | 'both'
  text: {
    content: string
    font: string
    size: number
    color: string
    opacity: number
    rotation: number
  }
  image: {
    url: string
    width: number
    height: number
    opacity: number
    rotation: number
  }
  position: {
    x: number
    y: number
    alignment: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'tiled'
  }
  advanced: {
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay'
    shadow: boolean
    shadowColor: string
    shadowBlur: number
    shadowOffset: { x: number; y: number }
  }
}

interface WatermarkManagerProps {
  imageUrl?: string
  onSave?: (config: WatermarkConfig, processedImageUrl: string) => void
  className?: string
}

// ============================================================================
// WATERMARK MANAGER COMPONENT
// ============================================================================

export function WatermarkManager({
  imageUrl,
  onSave,
  className = ''
}: WatermarkManagerProps) {
  // State
  const [isOpen, setIsOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState(imageUrl || '')
  const [config, setConfig] = useState<WatermarkConfig>({
    type: 'text',
    text: {
      content: '© Your Name',
      font: 'Arial',
      size: 32,
      color: '#FFFFFF',
      opacity: 70,
      rotation: 0
    },
    image: {
      url: '',
      width: 100,
      height: 100,
      opacity: 70,
      rotation: 0
    },
    position: {
      x: 50,
      y: 50,
      alignment: 'bottom-right'
    },
    advanced: {
      blendMode: 'normal',
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 4,
      shadowOffset: { x: 2, y: 2 }
    }
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const watermarkLogoRef = useRef<HTMLImageElement | null>(null)

  // Font options
  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Courier New',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Trebuchet MS',
    'Arial Black'
  ]

  // Alignment presets
  const alignments: Array<{
    value: WatermarkConfig['position']['alignment']
    label: string
    icon: React.ReactNode
  }> = [
    { value: 'top-left', label: 'Top Left', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'top-center', label: 'Top Center', icon: <AlignCenter className="w-4 h-4" /> },
    { value: 'top-right', label: 'Top Right', icon: <AlignRight className="w-4 h-4" /> },
    { value: 'center-left', label: 'Center Left', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'center', label: 'Center', icon: <AlignCenter className="w-4 h-4" /> },
    { value: 'center-right', label: 'Center Right', icon: <AlignRight className="w-4 h-4" /> },
    { value: 'bottom-left', label: 'Bottom Left', icon: <AlignLeft className="w-4 h-4" /> },
    { value: 'bottom-center', label: 'Bottom Center', icon: <AlignCenter className="w-4 h-4" /> },
    { value: 'bottom-right', label: 'Bottom Right', icon: <AlignRight className="w-4 h-4" /> },
    { value: 'tiled', label: 'Tiled', icon: <Layers className="w-4 h-4" /> }
  ]

  // ============================================================================
  // WATERMARK RENDERING
  // ============================================================================

  const renderWatermark = () => {
    const canvas = canvasRef.current
    if (!canvas || !previewImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = previewImage

    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width
      canvas.height = img.height

      // Draw original image
      ctx.drawImage(img, 0, 0)

      // Apply watermark
      if (config.type === 'text' || config.type === 'both') {
        drawTextWatermark(ctx, canvas.width, canvas.height)
      }

      if (config.type === 'image' || config.type === 'both') {
        if (watermarkLogoRef.current) {
          drawImageWatermark(ctx, canvas.width, canvas.height)
        }
      }
    }
  }

  const drawTextWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { text, position, advanced } = config

    ctx.save()

    // Set blend mode
    ctx.globalCompositeOperation = advanced.blendMode

    // Set font
    ctx.font = `${text.size}px ${text.font}`
    ctx.fillStyle = text.color
    ctx.globalAlpha = text.opacity / 100

    // Add shadow if enabled
    if (advanced.shadow) {
      ctx.shadowColor = advanced.shadowColor
      ctx.shadowBlur = advanced.shadowBlur
      ctx.shadowOffsetX = advanced.shadowOffset.x
      ctx.shadowOffsetY = advanced.shadowOffset.y
    }

    if (position.alignment === 'tiled') {
      // Tiled watermark
      const metrics = ctx.measureText(text.content)
      const textWidth = metrics.width
      const textHeight = text.size

      const padding = 100
      const rows = Math.ceil(height / (textHeight + padding))
      const cols = Math.ceil(width / (textWidth + padding))

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * (textWidth + padding)
          const y = row * (textHeight + padding) + textHeight

          ctx.save()
          ctx.translate(x + textWidth / 2, y)
          ctx.rotate((text.rotation * Math.PI) / 180)
          ctx.fillText(text.content, -textWidth / 2, 0)
          ctx.restore()
        }
      }
    } else {
      // Single positioned watermark
      const coords = getPositionCoordinates(position.alignment, width, height, text.content, ctx)

      ctx.save()
      ctx.translate(coords.x, coords.y)
      ctx.rotate((text.rotation * Math.PI) / 180)
      ctx.fillText(text.content, 0, 0)
      ctx.restore()
    }

    ctx.restore()
  }

  const drawImageWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const { image, position, advanced } = config
    const logo = watermarkLogoRef.current

    if (!logo) return

    ctx.save()

    // Set blend mode
    ctx.globalCompositeOperation = advanced.blendMode
    ctx.globalAlpha = image.opacity / 100

    // Add shadow if enabled
    if (advanced.shadow) {
      ctx.shadowColor = advanced.shadowColor
      ctx.shadowBlur = advanced.shadowBlur
      ctx.shadowOffsetX = advanced.shadowOffset.x
      ctx.shadowOffsetY = advanced.shadowOffset.y
    }

    if (position.alignment === 'tiled') {
      // Tiled watermark
      const padding = 50
      const rows = Math.ceil(height / (image.height + padding))
      const cols = Math.ceil(width / (image.width + padding))

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * (image.width + padding)
          const y = row * (image.height + padding)

          ctx.save()
          ctx.translate(x + image.width / 2, y + image.height / 2)
          ctx.rotate((image.rotation * Math.PI) / 180)
          ctx.drawImage(logo, -image.width / 2, -image.height / 2, image.width, image.height)
          ctx.restore()
        }
      }
    } else {
      // Single positioned watermark
      const coords = getImagePositionCoordinates(position.alignment, width, height, image.width, image.height)

      ctx.save()
      ctx.translate(coords.x + image.width / 2, coords.y + image.height / 2)
      ctx.rotate((image.rotation * Math.PI) / 180)
      ctx.drawImage(logo, -image.width / 2, -image.height / 2, image.width, image.height)
      ctx.restore()
    }

    ctx.restore()
  }

  const getPositionCoordinates = (
    alignment: WatermarkConfig['position']['alignment'],
    canvasWidth: number,
    canvasHeight: number,
    text: string,
    ctx: CanvasRenderingContext2D
  ) => {
    const metrics = ctx.measureText(text)
    const textWidth = metrics.width
    const textHeight = config.text.size
    const padding = 20

    const positions = {
      'top-left': { x: padding, y: textHeight + padding },
      'top-center': { x: canvasWidth / 2 - textWidth / 2, y: textHeight + padding },
      'top-right': { x: canvasWidth - textWidth - padding, y: textHeight + padding },
      'center-left': { x: padding, y: canvasHeight / 2 },
      'center': { x: canvasWidth / 2 - textWidth / 2, y: canvasHeight / 2 },
      'center-right': { x: canvasWidth - textWidth - padding, y: canvasHeight / 2 },
      'bottom-left': { x: padding, y: canvasHeight - padding },
      'bottom-center': { x: canvasWidth / 2 - textWidth / 2, y: canvasHeight - padding },
      'bottom-right': { x: canvasWidth - textWidth - padding, y: canvasHeight - padding },
      'tiled': { x: 0, y: 0 }
    }

    return positions[alignment]
  }

  const getImagePositionCoordinates = (
    alignment: WatermarkConfig['position']['alignment'],
    canvasWidth: number,
    canvasHeight: number,
    imgWidth: number,
    imgHeight: number
  ) => {
    const padding = 20

    const positions = {
      'top-left': { x: padding, y: padding },
      'top-center': { x: canvasWidth / 2 - imgWidth / 2, y: padding },
      'top-right': { x: canvasWidth - imgWidth - padding, y: padding },
      'center-left': { x: padding, y: canvasHeight / 2 - imgHeight / 2 },
      'center': { x: canvasWidth / 2 - imgWidth / 2, y: canvasHeight / 2 - imgHeight / 2 },
      'center-right': { x: canvasWidth - imgWidth - padding, y: canvasHeight / 2 - imgHeight / 2 },
      'bottom-left': { x: padding, y: canvasHeight - imgHeight - padding },
      'bottom-center': { x: canvasWidth / 2 - imgWidth / 2, y: canvasHeight - imgHeight - padding },
      'bottom-right': { x: canvasWidth - imgWidth - padding, y: canvasHeight - imgHeight - padding },
      'tiled': { x: 0, y: 0 }
    }

    return positions[alignment]
  }

  // Re-render watermark when config changes
  useEffect(() => {
    renderWatermark()
  }, [config, previewImage])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string
      setPreviewImage(url)
      logger.info('Image uploaded for watermarking', { fileName: file.name, size: file.size })
    }
    reader.readAsDataURL(file)
  }

  const handleWatermarkLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const url = event.target?.result as string

      const img = new Image()
      img.onload = () => {
        watermarkLogoRef.current = img
        setConfig({
          ...config,
          image: {
            ...config.image,
            url
          }
        })
        logger.info('Watermark logo uploaded', { fileName: file.name, size: file.size })
      }
      img.src = url
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)

      if (onSave) {
        onSave(config, url)
      }

      logger.info('Watermark saved', {
        type: config.type,
        position: config.position.alignment,
        textOpacity: config.text.opacity,
        imageOpacity: config.image.opacity
      })

      toast.success('Watermark applied successfully!')
    }, 'image/png')
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `watermarked-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)

      logger.info('Watermarked image downloaded')
      toast.success('Image downloaded!')
    }, 'image/png')
  }

  const handlePreset = (preset: 'subtle' | 'prominent' | 'tiled') => {
    const presets: Record<string, Partial<WatermarkConfig>> = {
      subtle: {
        text: {
          ...config.text,
          opacity: 30,
          size: 24
        },
        position: {
          ...config.position,
          alignment: 'bottom-right'
        }
      },
      prominent: {
        text: {
          ...config.text,
          opacity: 80,
          size: 48
        },
        position: {
          ...config.position,
          alignment: 'center'
        }
      },
      tiled: {
        text: {
          ...config.text,
          opacity: 20,
          size: 32,
          rotation: -45
        },
        position: {
          ...config.position,
          alignment: 'tiled'
        }
      }
    }

    setConfig({ ...config, ...presets[preset] })
    toast.success(`${preset.charAt(0).toUpperCase() + preset.slice(1)} preset applied`)
    logger.info('Preset applied', { preset })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className}>
          <Droplet className="w-4 h-4 mr-2" />
          Add Watermark
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Watermark Manager
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  {previewImage ? (
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Upload an image to preview watermark</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <label className="flex-1">
                    <Button variant="outline" className="w-full" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    disabled={!previewImage}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={!previewImage}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" onClick={() => handlePreset('subtle')}>
                    Subtle
                  </Button>
                  <Button variant="outline" onClick={() => handlePreset('prominent')}>
                    Prominent
                  </Button>
                  <Button variant="outline" onClick={() => handlePreset('tiled')}>
                    Tiled
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Settings */}
          <div className="space-y-4">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" onClick={() => setConfig({ ...config, type: 'text' })}>
                  <Type className="w-4 h-4 mr-2" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" onClick={() => setConfig({ ...config, type: 'image' })}>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="advanced">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced
                </TabsTrigger>
              </TabsList>

              {/* Text Settings */}
              <TabsContent value="text" className="space-y-4 mt-4">
                <div>
                  <Label>Text Content</Label>
                  <Input
                    value={config.text.content}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        text: { ...config.text, content: e.target.value }
                      })
                    }
                    placeholder="Enter watermark text"
                  />
                </div>

                <div>
                  <Label>Font</Label>
                  <Select
                    value={config.text.font}
                    onValueChange={(value) =>
                      setConfig({
                        ...config,
                        text: { ...config.text, font: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Font Size: {config.text.size}px</Label>
                  <Slider
                    value={[config.text.size]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        text: { ...config.text, size: value }
                      })
                    }
                    min={12}
                    max={120}
                    step={2}
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={config.text.color}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          text: { ...config.text, color: e.target.value }
                        })
                      }
                      className="w-12 h-10 rounded border cursor-pointer"
                    />
                    <Input
                      value={config.text.color}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          text: { ...config.text, color: e.target.value }
                        })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Opacity: {config.text.opacity}%</Label>
                  <Slider
                    value={[config.text.opacity]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        text: { ...config.text, opacity: value }
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <Label>Rotation: {config.text.rotation}°</Label>
                  <Slider
                    value={[config.text.rotation]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        text: { ...config.text, rotation: value }
                      })
                    }
                    min={-180}
                    max={180}
                    step={5}
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {alignments.map((alignment) => (
                      <Button
                        key={alignment.value}
                        variant={config.position.alignment === alignment.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setConfig({
                            ...config,
                            position: { ...config.position, alignment: alignment.value }
                          })
                        }
                        className="text-xs"
                      >
                        {alignment.icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Image Settings */}
              <TabsContent value="image" className="space-y-4 mt-4">
                <div>
                  <Label>Watermark Logo</Label>
                  <label>
                    <Button variant="outline" className="w-full mt-2" asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Logo
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleWatermarkLogoUpload}
                      className="hidden"
                    />
                  </label>
                  {config.image.url && (
                    <Badge className="mt-2" variant="secondary">
                      Logo uploaded
                    </Badge>
                  )}
                </div>

                <div>
                  <Label>Width: {config.image.width}px</Label>
                  <Slider
                    value={[config.image.width]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        image: { ...config.image, width: value }
                      })
                    }
                    min={50}
                    max={500}
                    step={10}
                  />
                </div>

                <div>
                  <Label>Height: {config.image.height}px</Label>
                  <Slider
                    value={[config.image.height]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        image: { ...config.image, height: value }
                      })
                    }
                    min={50}
                    max={500}
                    step={10}
                  />
                </div>

                <div>
                  <Label>Opacity: {config.image.opacity}%</Label>
                  <Slider
                    value={[config.image.opacity]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        image: { ...config.image, opacity: value }
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                  />
                </div>

                <div>
                  <Label>Rotation: {config.image.rotation}°</Label>
                  <Slider
                    value={[config.image.rotation]}
                    onValueChange={([value]) =>
                      setConfig({
                        ...config,
                        image: { ...config.image, rotation: value }
                      })
                    }
                    min={-180}
                    max={180}
                    step={5}
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {alignments.map((alignment) => (
                      <Button
                        key={alignment.value}
                        variant={config.position.alignment === alignment.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() =>
                          setConfig({
                            ...config,
                            position: { ...config.position, alignment: alignment.value }
                          })
                        }
                        className="text-xs"
                      >
                        {alignment.icon}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Advanced Settings */}
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div>
                  <Label>Blend Mode</Label>
                  <Select
                    value={config.advanced.blendMode}
                    onValueChange={(value: any) =>
                      setConfig({
                        ...config,
                        advanced: { ...config.advanced, blendMode: value }
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="multiply">Multiply</SelectItem>
                      <SelectItem value="screen">Screen</SelectItem>
                      <SelectItem value="overlay">Overlay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Enable Shadow</Label>
                  <input
                    type="checkbox"
                    checked={config.advanced.shadow}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        advanced: { ...config.advanced, shadow: e.target.checked }
                      })
                    }
                    className="w-4 h-4"
                  />
                </div>

                {config.advanced.shadow && (
                  <>
                    <div>
                      <Label>Shadow Color</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={config.advanced.shadowColor}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              advanced: { ...config.advanced, shadowColor: e.target.value }
                            })
                          }
                          className="w-12 h-10 rounded border cursor-pointer"
                        />
                        <Input
                          value={config.advanced.shadowColor}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              advanced: { ...config.advanced, shadowColor: e.target.value }
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Shadow Blur: {config.advanced.shadowBlur}px</Label>
                      <Slider
                        value={[config.advanced.shadowBlur]}
                        onValueChange={([value]) =>
                          setConfig({
                            ...config,
                            advanced: { ...config.advanced, shadowBlur: value }
                          })
                        }
                        min={0}
                        max={20}
                        step={1}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
