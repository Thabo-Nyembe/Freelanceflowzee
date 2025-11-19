'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Video, Wand2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const VIDEO_STYLES = [
  { id: 'cinematic', name: 'Cinematic', description: 'Hollywood-style cinematic videos', image: '/Cinematic' },
  { id: 'documentary', name: 'Documentary', description: 'Professional documentary style', image: '/Documentary' },
  { id: 'corporate', name: 'Corporate', description: 'Professional business videos', image: '/Corporate' },
  { id: 'animated', name: 'Animated', description: 'Cartoon and animated style', image: '/Animated' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean and simple design', image: '/Minimalist' },
  { id: 'retro', name: 'Retro', description: 'Vintage and retro aesthetics', image: '/Retro' }
]

const AI_MODELS = [
  { id: 'kazi-pro', name: 'KAZI Pro', speed: 'Fast', quality: 'Excellent', cost: '$$$$' },
  { id: 'kazi-standard', name: 'KAZI Standard', speed: 'Medium', quality: 'Good', cost: '$$' },
  { id: 'kazi-quick', name: 'KAZI Quick', speed: 'Very Fast', quality: 'Standard', cost: '$' }
]

export default function AIVideoGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('cinematic')
  const [selectedModel, setSelectedModel] = useState('kazi-pro')
  const [duration, setDuration] = useState('30')
  const [aspectRatio, setAspectRatio] = useState('16:9')

  // Handlers
  const handleGenerate = () => {
    console.log('✨ AI VIDEO GENERATION: Initiating video generation')
    console.log('📝 AI VIDEO GENERATION: Prompt - ' + prompt)
    console.log('🎨 AI VIDEO GENERATION: Style - ' + selectedStyle)
    console.log('🤖 AI VIDEO GENERATION: Model - ' + selectedModel)
    console.log('⏱️ AI VIDEO GENERATION: Duration - ' + duration + 's')
    console.log('📐 AI VIDEO GENERATION: Aspect Ratio - ' + aspectRatio)
    toast.success('🎬 Generating AI Video', {
      description: 'Style: ' + selectedStyle + ' | Model: ' + selectedModel + ' | Duration: ' + duration + 's'
    })
  }

  const handleSelectStyle = (styleId: string, styleName: string) => {
    setSelectedStyle(styleId)
    console.log('✨ AI VIDEO GENERATION: Style selected - ' + styleName)
    console.log('🎨 AI VIDEO GENERATION: Style ID - ' + styleId)
    toast.info('🎨 Style Selected', {
      description: styleName
    })
  }

  const handleSelectModel = (modelId: string, modelName: string) => {
    setSelectedModel(modelId)
    console.log('✨ AI VIDEO GENERATION: Model selected - ' + modelName)
    console.log('🤖 AI VIDEO GENERATION: Model ID - ' + modelId)
    toast.info('🤖 AI Model Selected', {
      description: modelName
    })
  }

  const handleSaveVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Saving video to library')
    console.log('💾 AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.success('💾 Video Saved', {
      description: 'Added to your library'
    })
  }

  const handleExportVideo = (format: 'mp4' | 'mov' | 'webm') => {
    console.log('✨ AI VIDEO GENERATION: Exporting video')
    console.log('📥 AI VIDEO GENERATION: Format - ' + format.toUpperCase())
    console.log('📥 AI VIDEO GENERATION: Preparing download...')
    toast.success('📥 Exporting Video', {
      description: 'Format: ' + format.toUpperCase() + ' - Preparing download...'
    })
  }

  const handleShareVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Sharing video')
    console.log('🔗 AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.info('🔗 Share Video', {
      description: 'Generate link or share to social media'
    })
  }

  const handleDeleteVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Delete video requested')
    console.log('🗑️ AI VIDEO GENERATION: Video ID - ' + videoId)
    if (confirm('Delete this video?')) {
      console.log('✅ AI VIDEO GENERATION: Video deleted - ' + videoId)
      toast.success('✅ Video Deleted', {
        description: 'Video removed from library'
      })
    }
  }

  const handleRegenerateVideo = () => {
    console.log('✨ AI VIDEO GENERATION: Regenerating video')
    console.log('🔄 AI VIDEO GENERATION: Creating new version with same settings')
    toast.info('🔄 Regenerating Video', {
      description: 'Creating new version with same settings...'
    })
  }

  const handleEditVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Opening video editor')
    console.log('✏️ AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.info('✏️ Video Editor', {
      description: 'Opening advanced editor...'
    })
  }

  const handleViewHistory = () => {
    console.log('✨ AI VIDEO GENERATION: Opening video generation history')
    console.log('📜 AI VIDEO GENERATION: Loading all generated videos')
    toast.info('📜 Video Generation History', {
      description: 'View all generated videos'
    })
  }

  const handleSavePreset = () => {
    console.log('✨ AI VIDEO GENERATION: Saving preset')
    const name = prompt('Preset name:')
    if (name) {
      console.log('💾 AI VIDEO GENERATION: Preset saved - ' + name)
      toast.success('💾 Preset Saved', {
        description: name
      })
    }
  }

  const handleLoadPreset = (presetId: string) => {
    console.log('✨ AI VIDEO GENERATION: Loading preset')
    console.log('📂 AI VIDEO GENERATION: Preset ID - ' + presetId)
    toast.success('📂 Preset Loaded', {
      description: 'Settings applied'
    })
  }

  const handleAddBackgroundMusic = () => {
    console.log('✨ AI VIDEO GENERATION: Adding background music')
    console.log('🎵 AI VIDEO GENERATION: Opening royalty-free music library')
    toast.info('🎵 Background Music', {
      description: 'Browse royalty-free music library'
    })
  }

  const handleAddVoiceover = () => {
    console.log('✨ AI VIDEO GENERATION: Adding voiceover')
    console.log('🎤 AI VIDEO GENERATION: Record, upload, or generate AI voiceover')
    toast.info('🎤 Add Voiceover', {
      description: 'Record or upload audio, or generate AI voiceover'
    })
  }

  const handleGenerateSubtitles = () => {
    console.log('✨ AI VIDEO GENERATION: Generating subtitles')
    console.log('📝 AI VIDEO GENERATION: Auto-generating captions and subtitles')
    toast.info('📝 Generate Subtitles', {
      description: 'Auto-generate captions and subtitles'
    })
  }

  const handleDuplicateVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Duplicating video')
    console.log('📋 AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.success('📋 Video Duplicated', {
      description: 'Copy created in library'
    })
  }

  const handleVideoAnalytics = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Opening video analytics')
    console.log('📊 AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.info('📊 Video Analytics', {
      description: 'Views, engagement, and performance metrics'
    })
  }

  const handleBatchGenerate = () => {
    console.log('✨ AI VIDEO GENERATION: Opening batch generation')
    console.log('📦 AI VIDEO GENERATION: Generate multiple videos from CSV/template')
    toast.info('📦 Batch Generation', {
      description: 'Generate multiple videos from CSV/template'
    })
  }

  const handleTemplateManager = () => {
    console.log('✨ AI VIDEO GENERATION: Opening template manager')
    console.log('📋 AI VIDEO GENERATION: Save and load video templates')
    toast.info('📋 Template Manager', {
      description: 'Save and load video templates'
    })
  }

  const handleQualitySettings = () => {
    console.log('✨ AI VIDEO GENERATION: Opening quality settings')
    console.log('⚙️ AI VIDEO GENERATION: Resolution, bitrate, frame rate settings')
    toast.info('⚙️ Quality Settings', {
      description: 'Resolution: 4K/1080p/720p, Bitrate, Frame rate'
    })
  }

  const handleScheduleGeneration = () => {
    console.log('✨ AI VIDEO GENERATION: Scheduling video generation')
    console.log('📅 AI VIDEO GENERATION: Queue video for later processing')
    toast.info('📅 Schedule Generation', {
      description: 'Queue video for later processing'
    })
  }

  const handleCancelGeneration = (jobId: string) => {
    console.log('✨ AI VIDEO GENERATION: Cancel generation requested')
    console.log('❌ AI VIDEO GENERATION: Job ID - ' + jobId)
    if (confirm('Cancel generation?')) {
      console.log('❌ AI VIDEO GENERATION: Generation cancelled - ' + jobId)
      toast.info('❌ Generation Cancelled', {
        description: 'Video generation stopped'
      })
    }
  }

  const handlePreviewVideo = (videoId: string) => {
    console.log('✨ AI VIDEO GENERATION: Opening video preview')
    console.log('👁️ AI VIDEO GENERATION: Video ID - ' + videoId)
    toast.info('👁️ Video Preview', {
      description: 'Opening preview player...'
    })
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium">
          <Video className="w-4 h-4" />
          AI Video Generation
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Create Videos with AI
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Transform your ideas into professional videos using advanced AI technology
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Wand2 className="w-6 h-6 text-primary" />
              Video Generation
            </h2>

            <div className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Label className="block text-sm font-medium mb-2">Video Description</Label>
                <Textarea
                  placeholder="Describe the video you want to create... e.g., 'A professional product demonstration showing a smartphone with sleek animations and modern background music'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24"
                />
              </div>

              {/* Video Style */}
              <div>
                <Label className="block text-sm font-medium mb-3">Video Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VIDEO_STYLES.map((style) => (
                    <motion.div
                      key={style.id}
                      data-testid={`video-style-${style.id}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedStyle === style.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-2 flex items-center justify-center">
                        <img src={style.image} alt={style.name} className="w-full h-full object-cover rounded-lg" />
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{style.name}</h3>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="block text-sm font-medium mb-2">Duration: {duration} seconds</Label>
                <input
                  data-testid="video-duration-slider"
                  type="range"
                  min="10"
                  max="180"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Aspect Ratio */}
              <div>
                <Label className="block text-sm font-medium mb-2">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger data-testid="aspect-ratio-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AI Model */}
              <div>
                <Label className="block text-sm font-medium mb-3">AI Model</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AI_MODELS.map((model) => (
                    <motion.div
                      key={model.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedModel(model.id)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedModel === model.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <h3 className="font-semibold mb-2">{model.name}</h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Speed:</span>
                          <span className="font-medium">{model.speed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quality:</span>
                          <span className="font-medium">{model.quality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{model.cost}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={() => { handleGenerate(); console.log("🎬 Generating AI video..."); }} data-testid="generate-video-btn"
                disabled={!prompt.trim()}
                className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Video
              </Button>
            </div>
          </Card>
        </div>

        {/* Pro Tips Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Pro Tips
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">
                Be specific in your descriptions for better results
              </p>
              <p className="text-muted-foreground">
                Include details about mood, style, and visual elements
              </p>
              <p className="text-muted-foreground">
                Longer videos take more time to generate
              </p>
              <p className="text-muted-foreground">
                Higher quality models produce better results
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
