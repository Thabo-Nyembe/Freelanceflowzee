'use client'

import { useState, useRef, useCallback } from 'react'
import {
  Video, Sparkles, Play, Pause, Download, Share2, Heart,
  Image as ImageIcon, Film, Wand2, Camera, Clock, Loader2, AlertCircle, Volume2, VolumeX,
  Maximize, Zap, Crown, Star, Upload, X, Plus, Grid, List
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  useVeoVideo,
  videoPresets,
  VideoModel,
  VideoStyle,
  CameraMovement,
  AspectRatio,
  VideoDuration,
  VideoResolution
} from '@/lib/hooks/use-veo-video'

const models = videoPresets.models
const styles = videoPresets.styles
const cameraMovements = videoPresets.cameraMovements
const promptTemplates = videoPresets.promptTemplates

export function AIVideoStudio() {
  const {
    isGenerating,
    progress,
    result,
    error,
    history,
    generateVideo,
    imageToVideo,
    framesToVideo,
    extendVideo,
    reset
  } = useVeoVideo()

  // Form state
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedModel, setSelectedModel] = useState<VideoModel>('fal-ai/veo3')
  const [selectedStyle, setSelectedStyle] = useState<VideoStyle | null>(null)
  const [cameraMovement, setCameraMovement] = useState<CameraMovement>('static')
  const [cameraIntensity, setCameraIntensity] = useState(50)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9')
  const [duration, setDuration] = useState<VideoDuration>('8s')
  const [resolution, setResolution] = useState<VideoResolution>('720p')
  const [generateAudio, setGenerateAudio] = useState(true)
  const [enhancePrompt, setEnhancePrompt] = useState(true)

  // Image upload state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [startFrame, setStartFrame] = useState<string | null>(null)
  const [endFrame, setEndFrame] = useState<string | null>(null)
  const [extendVideoUrl, setExtendVideoUrl] = useState<string | null>(null)

  // UI state
  const [activeTab, setActiveTab] = useState('text-to-video')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('single')
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const startFrameInputRef = useRef<HTMLInputElement>(null)
  const endFrameInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    if (activeTab === 'text-to-video') {
      await generateVideo({
        prompt,
        negativePrompt,
        model: selectedModel,
        style: selectedStyle || undefined,
        cameraMovement,
        cameraIntensity,
        aspectRatio,
        duration,
        resolution,
        generateAudio,
        enhancePrompt
      })
    } else if (activeTab === 'image-to-video' && uploadedImage) {
      await imageToVideo({
        prompt,
        imageUrl: uploadedImage,
        model: selectedModel,
        duration,
        cameraMovement
      })
    } else if (activeTab === 'frames-to-video' && startFrame && endFrame) {
      await framesToVideo({
        prompt,
        startImageUrl: startFrame,
        endImageUrl: endFrame,
        duration
      })
    } else if (activeTab === 'extend-video' && extendVideoUrl) {
      await extendVideo({
        prompt,
        videoUrl: extendVideoUrl,
        duration
      })
    }
  }

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'start' | 'end') => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        if (type === 'main') setUploadedImage(dataUrl)
        else if (type === 'start') setStartFrame(dataUrl)
        else if (type === 'end') setEndFrame(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleVideoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setExtendVideoUrl(url)
    }
  }, [])

  const toggleFavorite = (url: string) => {
    setFavorites(prev =>
      prev.includes(url) ? prev.filter(f => f !== url) : [...prev, url]
    )
  }

  const handleDownload = async (url: string, filename: string = 'video.mp4') => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error('Download failed:', err)
    }
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Video',
          text: 'Check out this video I created with AI!',
          url
        })
      } catch (err) {
        console.error('Share failed:', err)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  const applyTemplate = (template: string) => {
    setPrompt(template)
    setShowTemplates(false)
  }

  const getModelInfo = (modelId: string) => {
    return models.find(m => m.id === modelId)
  }

  const selectedModelInfo = getModelInfo(selectedModel)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:bg-none dark:bg-gray-900">
      {/* Premium Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Video className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Video Studio</h1>
              <p className="text-white/80">Create stunning videos with Veo 3, Kling, and more</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Sparkles className="h-3 w-3 mr-1" /> Native Audio
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Film className="h-3 w-3 mr-1" /> 1080p HD
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Camera className="h-3 w-3 mr-1" /> Camera Controls
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Wand2 className="h-3 w-3 mr-1" /> 7 AI Models
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-0">
              <Zap className="h-3 w-3 mr-1" /> Image to Video
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="text-to-video" className="gap-2">
                  <Wand2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Text to Video</span>
                </TabsTrigger>
                <TabsTrigger value="image-to-video" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Image to Video</span>
                </TabsTrigger>
                <TabsTrigger value="frames-to-video" className="gap-2">
                  <Film className="h-4 w-4" />
                  <span className="hidden sm:inline">Frames</span>
                </TabsTrigger>
                <TabsTrigger value="extend-video" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Extend</span>
                </TabsTrigger>
              </TabsList>

              {/* Text to Video Tab */}
              <TabsContent value="text-to-video" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wand2 className="h-5 w-5 text-purple-500" />
                      Describe Your Video
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Describe the video you want to create... Be specific about the scene, action, lighting, and mood."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[120px] resize-none pr-20"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTemplates(!showTemplates)}
                              >
                                <Sparkles className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Prompt Templates</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    {/* Prompt Templates Dropdown */}
                    {showTemplates && (
                      <Card className="border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Quick Templates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-2">
                            {Object.entries(promptTemplates).map(([category, templates]) => (
                              <div key={category}>
                                <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">{category}</p>
                                <div className="flex flex-wrap gap-1">
                                  {templates.map((template, idx) => (
                                    <Button
                                      key={idx}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-auto py-1 px-2"
                                      onClick={() => applyTemplate(template)}
                                    >
                                      {template.slice(0, 40)}...
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Negative Prompt */}
                    <div>
                      <Label className="text-sm text-muted-foreground">Negative Prompt (optional)</Label>
                      <Input
                        placeholder="What to avoid: blurry, low quality, distorted..."
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Image to Video Tab */}
              <TabsContent value="image-to-video" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5 text-blue-500" />
                      Animate Your Image
                    </CardTitle>
                    <CardDescription>Upload an image and describe how it should move</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    >
                      {uploadedImage ? (
                        <div className="relative">
                          <img src={uploadedImage} alt="Uploaded" className="max-h-48 mx-auto rounded-lg" />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Click to upload an image</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG, WebP up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'main')}
                    />
                    <Textarea
                      placeholder="Describe how the image should animate... e.g., 'The camera slowly zooms in while the subject turns their head'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Frames to Video Tab */}
              <TabsContent value="frames-to-video" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Film className="h-5 w-5 text-green-500" />
                      Keyframe Animation
                    </CardTitle>
                    <CardDescription>Create a video that transitions between two images</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block">Start Frame</Label>
                        <div
                          onClick={() => startFrameInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors aspect-video flex items-center justify-center"
                        >
                          {startFrame ? (
                            <div className="relative w-full h-full">
                              <img src={startFrame} alt="Start" className="w-full h-full object-cover rounded-lg" />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); setStartFrame(null); }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              <Upload className="h-8 w-8 mx-auto mb-1" />
                              <p className="text-xs">Start Frame</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={startFrameInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'start')}
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block">End Frame</Label>
                        <div
                          onClick={() => endFrameInputRef.current?.click()}
                          className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors aspect-video flex items-center justify-center"
                        >
                          {endFrame ? (
                            <div className="relative w-full h-full">
                              <img src={endFrame} alt="End" className="w-full h-full object-cover rounded-lg" />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={(e) => { e.stopPropagation(); setEndFrame(null); }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="text-muted-foreground">
                              <Upload className="h-8 w-8 mx-auto mb-1" />
                              <p className="text-xs">End Frame</p>
                            </div>
                          )}
                        </div>
                        <input
                          ref={endFrameInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageUpload(e, 'end')}
                        />
                      </div>
                    </div>
                    <Textarea
                      placeholder="Describe the transition... e.g., 'Smooth morph from day to night as the sun sets'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Extend Video Tab */}
              <TabsContent value="extend-video" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Plus className="h-5 w-5 text-orange-500" />
                      Extend Your Video
                    </CardTitle>
                    <CardDescription>Add more content to an existing video</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed rounded-lg p-8 text-center">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        id="video-upload"
                        onChange={handleVideoUpload}
                      />
                      <label htmlFor="video-upload" className="cursor-pointer">
                        {extendVideoUrl ? (
                          <div className="relative">
                            <video src={extendVideoUrl} className="max-h-48 mx-auto rounded-lg" controls />
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2"
                              onClick={() => setExtendVideoUrl(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to upload a video</p>
                            <p className="text-xs text-muted-foreground">MP4, WebM up to 100MB</p>
                          </>
                        )}
                      </label>
                    </div>
                    <Textarea
                      placeholder="Describe what should happen next in the video..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Model Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  AI Model
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id as VideoModel)}
                      className={`p-3 rounded-lg border-2 text-left transition-all ${
                        selectedModel === model.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{model.label}</span>
                        {model.badge && (
                          <Badge variant={model.tier === 'premium' ? 'default' : 'secondary'} className="text-[10px] px-1 py-0">
                            {model.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{model.description}</p>
                      <div className="mt-1">
                        {model.tier === 'premium' && <Crown className="h-3 w-3 text-yellow-500" />}
                        {model.tier === 'pro' && <Star className="h-3 w-3 text-blue-500" />}
                        {model.tier === 'free' && <Zap className="h-3 w-3 text-green-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Style Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-500" />
                  Video Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(selectedStyle === style.id ? null : style.id as VideoStyle)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedStyle === style.id
                          ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-pink-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{style.icon}</span>
                      <span className="text-xs font-medium">{style.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Camera Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-indigo-500" />
                  Camera Movement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-7 gap-2 mb-4">
                  {cameraMovements.map((movement) => (
                    <TooltipProvider key={movement.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setCameraMovement(movement.id as CameraMovement)}
                            className={`p-2 rounded-lg border-2 text-center transition-all ${
                              cameraMovement === movement.id
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                            }`}
                          >
                            <span className="text-lg block">{movement.icon}</span>
                            <span className="text-[10px] font-medium block truncate">{movement.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{movement.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
                {cameraMovement !== 'static' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label>Intensity</Label>
                      <span className="text-muted-foreground">{cameraIntensity}%</span>
                    </div>
                    <Slider
                      value={[cameraIntensity]}
                      onValueChange={([value]) => setCameraIntensity(value)}
                      min={10}
                      max={100}
                      step={10}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Aspect Ratio */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm mb-2 block">Aspect Ratio</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        onClick={() => setAspectRatio(ratio)}
                        className={`p-2 rounded text-xs font-medium transition-all ${
                          aspectRatio === ratio
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Duration */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm mb-2 block">Duration</Label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['4s', '6s', '8s'] as VideoDuration[]).map((dur) => (
                      <button
                        key={dur}
                        onClick={() => setDuration(dur)}
                        className={`p-2 rounded text-xs font-medium transition-all ${
                          duration === dur
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Resolution */}
              <Card>
                <CardContent className="p-4">
                  <Label className="text-sm mb-2 block">Resolution</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {(['720p', '1080p'] as VideoResolution[]).map((res) => (
                      <button
                        key={res}
                        onClick={() => setResolution(res)}
                        className={`p-2 rounded text-xs font-medium transition-all ${
                          resolution === res
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Audio Toggle */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm">Native Audio</Label>
                      <p className="text-xs text-muted-foreground">Generate sound</p>
                    </div>
                    <Switch
                      checked={generateAudio}
                      onCheckedChange={setGenerateAudio}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <Label className="text-sm">Enhance Prompt</Label>
                      <p className="text-xs text-muted-foreground">AI improve</p>
                    </div>
                    <Switch
                      checked={enhancePrompt}
                      onCheckedChange={setEnhancePrompt}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Video
                </>
              )}
            </Button>

            {/* Progress */}
            {progress && isGenerating && (
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{progress.status}</span>
                      <span>{progress.progress || 0}%</span>
                    </div>
                    <Progress value={progress.progress || 0} />
                    {progress.logs && progress.logs.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {progress.logs[progress.logs.length - 1]}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error */}
            {error && (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <CardContent className="p-4 flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-5 w-5" />
                  <span>{error.message}</span>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Preview & History */}
          <div className="space-y-6">
            {/* Video Preview */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Play className="h-5 w-5 text-purple-500" />
                    Preview
                  </span>
                  {result && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(result.video.url)}
                      >
                        <Heart className={`h-4 w-4 ${favorites.includes(result.video.url) ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleShare(result.video.url)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownload(result.video.url)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-gray-900 relative">
                  {result ? (
                    <>
                      <video
                        ref={videoRef}
                        src={result.video.url}
                        className="w-full h-full object-contain"
                        controls
                        autoPlay
                        loop
                        muted={isMuted}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-black/50 hover:bg-black/70"
                            onClick={() => {
                              if (videoRef.current) {
                                isPlaying ? videoRef.current.pause() : videoRef.current.play()
                              }
                            }}
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-black/50 hover:bg-black/70"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          </Button>
                        </div>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-black/50 hover:bg-black/70"
                          onClick={() => videoRef.current?.requestFullscreen()}
                        >
                          <Maximize className="h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Video className="h-16 w-16 mb-2 opacity-50" />
                      <p className="text-sm">Your video will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Generation Info */}
            {result && (
              <Card>
                <CardContent className="p-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-medium">{selectedModelInfo?.label}</span>
                    </div>
                    {result.seed && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Seed</span>
                        <span className="font-mono text-xs">{result.seed}</span>
                      </div>
                    )}
                    {result.timings && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time</span>
                        <span>{(result.timings.inference / 1000).toFixed(1)}s</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    History
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode(viewMode === 'grid' ? 'single' : 'grid')}
                    >
                      {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {history.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                      {history.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative group cursor-pointer rounded-lg overflow-hidden border"
                          onClick={() => {
                            // Could load this into preview
                          }}
                        >
                          <video
                            src={item.video.url}
                            className="w-full aspect-video object-cover"
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="flex gap-1">
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); handleDownload(item.video.url); }}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(item.video.url); }}
                              >
                                <Heart className={`h-4 w-4 ${favorites.includes(item.video.url) ? 'fill-red-500 text-red-500' : ''}`} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No videos yet</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
