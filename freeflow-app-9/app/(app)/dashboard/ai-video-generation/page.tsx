'use client'

/**
 * World-Class AI Video Generation Page
 * Text-to-video AI with templates, customization, and export
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Sparkles, Wand2, Play, Download, Share2, Settings,
  CheckCircle, Clock, Zap, Star, TrendingUp, Music, Mic,
  FileVideo, Image as ImageIcon, Type, Palette, LayoutTemplate,
  ArrowRight, X, Loader2, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { GlowEffect } from '@/components/ui/glow-effect'
import { BorderTrail } from '@/components/ui/border-trail'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { cn } from '@/lib/utils'
import {
  VideoStyle,
  VideoFormat,
  VideoQuality,
  AIModel,
  GenerationStatus,
  GeneratedVideo,
  VideoTemplate
} from '@/lib/ai-video-types'
import {
  VIDEO_TEMPLATES,
  PROMPT_SUGGESTIONS,
  VOICE_OPTIONS,
  MUSIC_LIBRARY,
  VIDEO_FORMATS,
  QUALITY_SETTINGS,
  estimateGenerationTime,
  formatDuration
} from '@/lib/ai-video-utils'

type GenerationStep = 'template' | 'prompt' | 'customize' | 'generate' | 'result'

export default function AIVideoGenerationPage() {
  const [step, setStep] = useState<GenerationStep>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState<VideoStyle>('professional')
  const [format, setFormat] = useState<VideoFormat>('landscape')
  const [quality, setQuality] = useState<VideoQuality>('hd')
  const [aiModel, setAiModel] = useState<AIModel>('kazi-ai')
  const [includeMusic, setIncludeMusic] = useState(true)
  const [includeVoiceover, setIncludeVoiceover] = useState(false)
  const [includeCaptions, setIncludeCaptions] = useState(true)
  const [selectedMusic, setSelectedMusic] = useState(MUSIC_LIBRARY[0].id)
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle')
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleTemplateSelect = (template: VideoTemplate) => {
    setSelectedTemplate(template)
    setStyle(template.style)
    setFormat(template.format)
    setIncludeMusic(template.musicIncluded)
    setIncludeVoiceover(template.voiceoverIncluded)
    setStep('prompt')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setGenerationStatus('analyzing')
    setStep('generate')

    // Simulate AI video generation
    const stages = [
      { status: 'analyzing' as GenerationStatus, progress: 20, delay: 1000 },
      { status: 'generating' as GenerationStatus, progress: 50, delay: 3000 },
      { status: 'rendering' as GenerationStatus, progress: 80, delay: 2000 },
      { status: 'completed' as GenerationStatus, progress: 100, delay: 1000 }
    ]

    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, stage.delay))
      setGenerationStatus(stage.status)
      setGenerationProgress(stage.progress)
    }

    // Create mock generated video
    const mockVideo: GeneratedVideo = {
      id: `vid_${Math.random().toString(36).substr(2, 9)}`,
      requestId: 'req_123',
      status: 'completed',
      progress: 100,
      videoUrl: '/videos/generated-sample.mp4',
      thumbnailUrl: '/videos/thumbnail.jpg',
      duration: 30,
      format: format,
      quality: quality,
      fileSize: 15728640, // 15MB
      scenes: [],
      metadata: {
        width: VIDEO_FORMATS[format].width,
        height: VIDEO_FORMATS[format].height,
        fps: 30,
        codec: 'h264',
        bitrate: QUALITY_SETTINGS[quality].bitrate
      },
      createdAt: new Date(),
      completedAt: new Date()
    }

    setGeneratedVideo(mockVideo)
    setIsGenerating(false)
    setStep('result')
  }

  const estimatedTime = estimateGenerationTime(30, quality, 'moderate')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent opacity-50" />

      {/* Animated Gradient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-4 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <ScrollReveal variant="slide-up" duration={0.6}>
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-sm font-medium mb-6 border border-purple-500/30"
              >
                <Video className="w-4 h-4" />
                AI Video Generation
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              </motion.div>

              <TextShimmer className="text-5xl md:text-6xl font-bold mb-6" duration={2}>
                Create Videos with AI
              </TextShimmer>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Transform text prompts into professional videos in minutes with our AI-powered video generation platform
              </p>
            </div>
          </ScrollReveal>

          {/* Features Bar */}
          <ScrollReveal variant="scale" duration={0.6} delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { icon: Sparkles, label: '4 AI Models', value: 'Multiple engines' },
                { icon: Clock, label: 'Fast Generation', value: '2-5 minutes' },
                { icon: Star, label: '8+ Templates', value: 'Professional' },
                { icon: FileVideo, label: 'HD Quality', value: 'Up to 4K' }
              ].map((feature, index) => (
                <LiquidGlassCard key={index} className="p-4 text-center">
                  <feature.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                  <p className="text-xs text-gray-400 mb-1">{feature.label}</p>
                  <p className="text-sm font-semibold text-white">{feature.value}</p>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Flow */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Template Selection */}
              {step === 'template' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiquidGlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                        <p className="text-gray-400">Start with a pre-designed template or start from scratch</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setStep('prompt')}
                        className="border-gray-700 hover:bg-slate-800"
                      >
                        Skip
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {VIDEO_TEMPLATES.map((template) => (
                        <motion.div
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleTemplateSelect(template)}
                          className="cursor-pointer"
                        >
                          <LiquidGlassCard className="p-4 hover:border-purple-500/50 transition-all">
                            <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg mb-3 flex items-center justify-center">
                              <LayoutTemplate className="w-12 h-12 text-purple-400" />
                            </div>

                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-white">{template.name}</h3>
                              {template.premium && (
                                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                                  <Star className="w-3 h-3 mr-1" />
                                  Pro
                                </Badge>
                              )}
                            </div>

                            <p className="text-xs text-gray-400 mb-3">{template.description}</p>

                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{formatDuration(template.duration)}</span>
                              <span>•</span>
                              <span>{template.scenes} scenes</span>
                              <span>•</span>
                              <span className="capitalize">{template.format}</span>
                            </div>
                          </LiquidGlassCard>
                        </motion.div>
                      ))}
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              )}

              {/* Step 2: Prompt Input */}
              {step === 'prompt' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiquidGlassCard className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Describe Your Video</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Video Prompt</label>
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Describe the video you want to create... Be specific about scenes, style, mood, and details."
                          className="w-full h-32 p-4 bg-slate-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          {prompt.length}/500 characters
                        </p>
                      </div>

                      {/* Prompt Suggestions */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Quick Suggestions</label>
                        <div className="grid grid-cols-2 gap-2">
                          {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion) => (
                            <button
                              key={suggestion.id}
                              onClick={() => setPrompt(suggestion.prompt)}
                              className="text-left p-3 bg-slate-900/50 border border-gray-700 rounded-lg hover:border-purple-500/50 transition-all text-sm"
                            >
                              <p className="text-purple-400 font-medium text-xs mb-1">{suggestion.category}</p>
                              <p className="text-gray-300 text-xs line-clamp-2">{suggestion.prompt}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep('template')}
                          className="flex-1 border-gray-700 hover:bg-slate-800"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={() => setStep('customize')}
                          disabled={!prompt}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          Continue
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              )}

              {/* Step 3: Customize */}
              {step === 'customize' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiquidGlassCard className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Customize Video</h2>

                    <div className="space-y-6">
                      {/* Style Selection */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Video Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['cinematic', 'professional', 'casual', 'animated', 'explainer', 'social-media'] as VideoStyle[]).map((s) => (
                            <button
                              key={s}
                              onClick={() => setStyle(s)}
                              className={cn(
                                "p-3 rounded-lg border text-sm font-medium transition-all capitalize",
                                style === s
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900/50 border-gray-700 text-gray-400 hover:border-purple-500/50"
                              )}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Format Selection */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Video Format</label>
                        <div className="grid grid-cols-2 gap-2">
                          {(Object.keys(VIDEO_FORMATS) as VideoFormat[]).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFormat(f)}
                              className={cn(
                                "p-3 rounded-lg border text-sm transition-all",
                                format === f
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900/50 border-gray-700 text-gray-400 hover:border-purple-500/50"
                              )}
                            >
                              <div className="font-medium">{VIDEO_FORMATS[f].aspectRatio}</div>
                              <div className="text-xs opacity-75">{VIDEO_FORMATS[f].label}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quality Selection */}
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">Quality</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(Object.keys(QUALITY_SETTINGS) as VideoQuality[]).map((q) => (
                            <button
                              key={q}
                              onClick={() => setQuality(q)}
                              className={cn(
                                "p-3 rounded-lg border text-sm transition-all",
                                quality === q
                                  ? "bg-purple-600 border-purple-500 text-white"
                                  : "bg-slate-900/50 border-gray-700 text-gray-400 hover:border-purple-500/50"
                              )}
                            >
                              <div className="font-medium uppercase">{q}</div>
                              <div className="text-xs opacity-75">{QUALITY_SETTINGS[q].resolution}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setStep('prompt')}
                          className="flex-1 border-gray-700 hover:bg-slate-800"
                        >
                          Back
                        </Button>
                        <Button
                          onClick={handleGenerate}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                          <Wand2 className="w-5 h-5 mr-2" />
                          Generate Video
                        </Button>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              )}

              {/* Step 4: Generating */}
              {step === 'generate' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiquidGlassCard className="p-8">
                    <div className="text-center space-y-6">
                      <div className="relative mx-auto w-32 h-32">
                        <GlowEffect className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-xl animate-pulse" />
                        <div className="relative w-full h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-16 h-16 text-white" />
                        </div>
                      </div>

                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {generationStatus === 'analyzing' && 'Analyzing Prompt...'}
                          {generationStatus === 'generating' && 'Generating Scenes...'}
                          {generationStatus === 'rendering' && 'Rendering Video...'}
                          {generationStatus === 'completed' && 'Video Ready!'}
                        </h2>
                        <p className="text-gray-400">AI is creating your video</p>
                      </div>

                      <div className="space-y-2">
                        <Progress value={generationProgress} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-medium">{generationProgress}%</span>
                        </div>
                      </div>
                    </div>
                  </LiquidGlassCard>
                </motion.div>
              )}

              {/* Step 5: Result */}
              {step === 'result' && generatedVideo && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LiquidGlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Your Video is Ready!</h2>
                        <p className="text-gray-400">Generated in {estimatedTime}</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>

                    {/* Video Preview */}
                    <div className="aspect-video bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg mb-6 flex items-center justify-center border border-gray-700">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                        <p className="text-gray-400">Video preview would appear here</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" className="border-gray-700 hover:bg-slate-800">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep('template')
                        setPrompt('')
                        setGeneratedVideo(null)
                        setGenerationProgress(0)
                      }}
                      className="w-full mt-3 border-gray-700 hover:bg-slate-800"
                    >
                      Create Another Video
                    </Button>
                  </LiquidGlassCard>
                </motion.div>
              )}
            </div>

            {/* Right Column - Info & Stats */}
            <div className="space-y-6">
              {/* AI Models */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">AI Model</h3>
                </div>

                <div className="space-y-2">
                  {(['kazi-ai', 'runway-gen3', 'pika-labs', 'stable-video'] as AIModel[]).map((model) => (
                    <button
                      key={model}
                      onClick={() => setAiModel(model)}
                      className={cn(
                        "w-full p-3 rounded-lg border text-left transition-all",
                        aiModel === model
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-slate-900/50 border-gray-700 text-gray-400 hover:border-purple-500/50"
                      )}
                    >
                      <p className="font-medium capitalize">{model.replace('-', ' ')}</p>
                      <p className="text-xs opacity-75">
                        {model === 'kazi-ai' && 'Fastest, Best Quality'}
                        {model === 'runway-gen3' && 'Cinematic Results'}
                        {model === 'pika-labs' && 'Creative Styles'}
                        {model === 'stable-video' && 'Consistent Output'}
                      </p>
                    </button>
                  ))}
                </div>
              </LiquidGlassCard>

              {/* Stats */}
              <LiquidGlassCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold text-white">Your Stats</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Videos Created</span>
                    <span className="font-semibold text-white">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Total Duration</span>
                    <span className="font-semibold text-white">6m 30s</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                    <span className="text-sm text-gray-400">Credits Used</span>
                    <span className="font-semibold text-white">48 / 100</span>
                  </div>
                </div>
              </LiquidGlassCard>

              {/* Tips */}
              <LiquidGlassCard className="p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Pro Tips</h3>
                </div>

                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>Be specific in your prompts for better results</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>Use templates for faster generation</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>HD quality recommended for professional use</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>Portrait format works best for social media</span>
                  </li>
                </ul>
              </LiquidGlassCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
