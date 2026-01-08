'use client'

import { useState, useRef } from 'react'
import {
  Sparkles, Download, RefreshCw, Wand2, Maximize2, Image as ImageIcon,
  Palette, History, Trash2, Loader2, Heart, Share2,
  Copy, Zap, Grid3X3, LayoutGrid, X, Plus, ChevronDown, Star,
  Bookmark, SlidersHorizontal, Type, Users, Layers, Eye, ImagePlus, Lightbulb, Crown
} from 'lucide-react'
import { useNanoBanana, type ImageSize, type ImageStyle, type ImageModel } from '@/lib/hooks/use-nano-banana'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const imageSizes: { value: ImageSize; label: string; ratio: string; icon: string }[] = [
  { value: 'square_hd', label: 'Square HD', ratio: '1:1', icon: '⬜' },
  { value: 'square', label: 'Square', ratio: '1:1', icon: '◻️' },
  { value: 'portrait_4_3', label: 'Portrait', ratio: '3:4', icon: '📱' },
  { value: 'portrait_16_9', label: 'Portrait Wide', ratio: '9:16', icon: '📲' },
  { value: 'landscape_4_3', label: 'Landscape', ratio: '4:3', icon: '🖥️' },
  { value: 'landscape_16_9', label: 'Landscape Wide', ratio: '16:9', icon: '🎬' }
]

const imageStyles: { value: ImageStyle; label: string; emoji: string; description: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', emoji: '📸', description: 'Ultra-realistic photography' },
  { value: 'anime', label: 'Anime', emoji: '🎨', description: 'Japanese animation style' },
  { value: '3d-render', label: '3D Render', emoji: '🎮', description: 'Octane/Unreal quality' },
  { value: 'digital-art', label: 'Digital Art', emoji: '🖌️', description: 'Artstation trending' },
  { value: 'oil-painting', label: 'Oil Painting', emoji: '🎭', description: 'Classical fine art' },
  { value: 'watercolor', label: 'Watercolor', emoji: '💧', description: 'Soft, flowing colors' },
  { value: 'sketch', label: 'Sketch', emoji: '✏️', description: 'Pencil & charcoal' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬', description: 'Movie scene quality' },
  { value: 'fantasy', label: 'Fantasy', emoji: '✨', description: 'Magical & ethereal' }
]

const models: { value: ImageModel; label: string; badge?: string; description: string; tier: 'free' | 'pro' | 'premium' }[] = [
  { value: 'fal-ai/nano-banana', label: 'Nano Banana', badge: 'Fast', description: 'Quick generations', tier: 'free' },
  { value: 'fal-ai/nano-banana-pro', label: 'Nano Banana Pro', badge: 'Best', description: '4K, text rendering, reasoning', tier: 'premium' },
  { value: 'fal-ai/flux/dev', label: 'FLUX Dev', badge: 'Quality', description: 'High fidelity', tier: 'pro' },
  { value: 'fal-ai/flux-pro', label: 'FLUX Pro', badge: 'Premium', description: 'Maximum quality', tier: 'premium' },
  { value: 'fal-ai/stable-diffusion-xl', label: 'SDXL', badge: 'Classic', description: 'Versatile & reliable', tier: 'free' }
]

const resolutionOptions = [
  { value: '1024', label: '1K (1024px)', description: 'Fast generation' },
  { value: '2048', label: '2K (2048px)', description: 'High quality' },
  { value: '4096', label: '4K (4096px)', description: 'Ultra HD', premium: true }
]

const outputFormats = [
  { value: 'png', label: 'PNG', description: 'Lossless, transparent' },
  { value: 'jpeg', label: 'JPEG', description: 'Smaller file size' },
  { value: 'webp', label: 'WebP', description: 'Modern, optimized' }
]

const promptTemplates = [
  { category: 'Portrait', prompts: ['Professional headshot with studio lighting', 'Artistic portrait with dramatic shadows', 'Fantasy character portrait with magical aura'] },
  { category: 'Landscape', prompts: ['Breathtaking mountain vista at golden hour', 'Serene ocean sunset with dramatic clouds', 'Mystical forest with rays of light'] },
  { category: 'Product', prompts: ['Premium product photography on marble', 'Minimalist product shot with soft shadows', 'Lifestyle product in modern setting'] },
  { category: 'Architecture', prompts: ['Modern building with dramatic angles', 'Cozy interior with warm lighting', 'Futuristic cityscape at night'] },
  { category: 'Abstract', prompts: ['Flowing liquid metal with vibrant colors', 'Geometric patterns with depth and texture', 'Cosmic nebula with swirling galaxies'] }
]

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedSize, setSelectedSize] = useState<ImageSize>('landscape_16_9')
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photorealistic')
  const [selectedModel, setSelectedModel] = useState<ImageModel>('fal-ai/nano-banana-pro')
  const [numImages, setNumImages] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [steps, setSteps] = useState(28)
  const [resolution, setResolution] = useState('2048')
  const [outputFormat, setOutputFormat] = useState('png')
  const [referenceImages, setReferenceImages] = useState<string[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid')
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'upscale'>('generate')
  const [enhancePrompt, setEnhancePrompt] = useState(true)
  const [characterConsistency, setCharacterConsistency] = useState(false)
  const [showSavedDialog, setShowSavedDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    isGenerating,
    progress,
    result,
    error,
    history,
    generateImage,
    editImage,
    upscale,
    clearHistory,
    reset
  } = useNanoBanana()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    await generateImage({
      prompt,
      negativePrompt,
      model: selectedModel,
      imageSize: selectedSize,
      style: selectedStyle,
      numImages,
      guidanceScale,
      numInferenceSteps: steps,
      enhancePrompt
    })
  }

  const handleDownload = async (url: string, index: number) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `kazi-ai-${Date.now()}-${index}.${outputFormat}`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(prompt)
  }

  const handleReferenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).slice(0, 10 - referenceImages.length).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setReferenceImages(prev => [...prev, e.target!.result as string].slice(0, 10))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index))
  }

  const toggleFavorite = (url: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(url)) next.delete(url)
      else next.add(url)
      return next
    })
  }

  const handleShare = async (url: string) => {
    if (navigator.share) {
      await navigator.share({ title: 'AI Generated Image', url })
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="max-w-7xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  AI Image Generator
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-medium">Pro</span>
                </h1>
                <p className="text-white/80 mt-1">Powered by Nano Banana Pro - Google's state-of-the-art image AI</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <History className="w-5 h-5" />
                History ({history.length})
              </button>
              <button
                onClick={() => setShowSavedDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Bookmark className="w-5 h-5" />
                Saved ({favorites.size})
              </button>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2 mt-6">
            {[
              { icon: Type, label: 'Perfect Text Rendering' },
              { icon: Users, label: 'Character Consistency' },
              { icon: Layers, label: 'Up to 10 Reference Images' },
              { icon: Maximize2, label: '4K Resolution' },
              { icon: Zap, label: 'Reasoning-Guided AI' }
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-full text-sm">
                <feature.icon className="w-4 h-4" />
                {feature.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { id: 'generate', label: 'Generate', icon: Sparkles },
            { id: 'edit', label: 'Edit Image', icon: Wand2 },
            { id: 'upscale', label: 'Upscale', icon: Maximize2 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Model Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-500" />
                AI Model
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {models.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => setSelectedModel(model.value)}
                    className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                      selectedModel === model.value
                        ? 'bg-violet-50 dark:bg-violet-900/30 border-2 border-violet-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        model.tier === 'premium' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
                        model.tier === 'pro' ? 'bg-gradient-to-br from-violet-500 to-purple-600' :
                        'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        {model.tier === 'premium' ? <Crown className="w-5 h-5 text-white" /> :
                         model.tier === 'pro' ? <Star className="w-5 h-5 text-white" /> :
                         <Sparkles className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                      </div>
                      <div>
                        <p className="font-medium dark:text-white">{model.label}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{model.description}</p>
                      </div>
                    </div>
                    {model.badge && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                        model.badge === 'Best' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' :
                        model.badge === 'Premium' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {model.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-500" />
                  Prompt
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="text-xs px-2 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                  >
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    Templates
                  </button>
                  <button
                    onClick={handleCopyPrompt}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Copy className="w-3 h-3 inline mr-1" />
                    Copy
                  </button>
                </div>
              </div>

              {showTemplates && (
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {promptTemplates.map((cat, i) => (
                      <span key={i} className="text-xs font-medium text-gray-500 dark:text-gray-400">{cat.category}:</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {promptTemplates.flatMap(cat => cat.prompts).slice(0, 6).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(p)}
                        className="text-xs px-2 py-1 bg-white dark:bg-gray-600 rounded-md hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors truncate max-w-[200px]"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your image in detail... The more specific, the better the result."
                className="w-full h-28 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:text-white text-sm"
              />

              <div className="flex items-center justify-between mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enhancePrompt}
                    onChange={(e) => setEnhancePrompt(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">AI Enhance Prompt</span>
                </label>
                <span className="text-xs text-gray-400">{prompt.length} chars</span>
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Palette className="w-4 h-4 text-violet-500" />
                Style
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {imageStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`flex flex-col items-center justify-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                      selectedStyle === style.value
                        ? 'bg-violet-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-lg">{style.emoji}</span>
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Resolution */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-violet-500" />
                Size & Resolution
              </h3>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {imageSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                      selectedSize === size.value
                        ? 'bg-violet-100 dark:bg-violet-900/30 border-2 border-violet-500'
                        : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <span>{size.icon}</span>
                    <span className="font-medium dark:text-white">{size.ratio}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                {resolutionOptions.map((res) => (
                  <button
                    key={res.value}
                    onClick={() => setResolution(res.value)}
                    className={`flex-1 p-2 rounded-lg text-xs text-center transition-all ${
                      resolution === res.value
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    } ${res.premium ? 'relative' : ''}`}
                  >
                    {res.label}
                    {res.premium && (
                      <Crown className="w-3 h-3 absolute top-1 right-1 text-amber-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Images */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-violet-500" />
                Reference Images
                <span className="text-xs text-gray-400 font-normal ml-auto">Up to 10</span>
              </h3>

              <div className="grid grid-cols-5 gap-2">
                {referenceImages.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                    <img src={img} alt={`Ref ${i+1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeReferenceImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {referenceImages.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleReferenceUpload}
                className="hidden"
              />
            </div>

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex items-center justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex items-center gap-2 font-medium">
                  <SlidersHorizontal className="w-4 h-4 text-violet-500" />
                  Advanced Settings
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {showAdvanced && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="pt-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Negative Prompt</label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, low quality, distorted..."
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Images: {numImages}
                      </label>
                      <input type="range" min="1" max="4" value={numImages} onChange={(e) => setNumImages(Number(e.target.value))} className="w-full accent-violet-500" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Guidance: {guidanceScale}
                      </label>
                      <input type="range" min="1" max="20" step="0.5" value={guidanceScale} onChange={(e) => setGuidanceScale(Number(e.target.value))} className="w-full accent-violet-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Steps: {steps}
                    </label>
                    <input type="range" min="10" max="50" value={steps} onChange={(e) => setSteps(Number(e.target.value))} className="w-full accent-violet-500" />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Output Format</label>
                    <div className="flex gap-2">
                      {outputFormats.map((fmt) => (
                        <button
                          key={fmt.value}
                          onClick={() => setOutputFormat(fmt.value)}
                          className={`flex-1 p-2 rounded-lg text-xs text-center transition-all ${
                            outputFormat === fmt.value
                              ? 'bg-violet-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={characterConsistency}
                      onChange={(e) => setCharacterConsistency(e.target.checked)}
                      className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Character Consistency Mode</span>
                    <span className="px-1.5 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">Pro</span>
                  </label>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {progress?.status === 'processing' ? `Generating... ${progress.progress || 0}%` : 'Queued...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate {numImages > 1 ? `${numImages} Images` : 'Image'}
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                {error.message}
              </div>
            )}
          </div>

          {/* Right Panel - Output */}
          <div className="lg:col-span-3 space-y-6">
            {/* Generated Images */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Generated Images</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('single')}
                    className={`p-2 rounded-lg ${viewMode === 'single' ? 'bg-violet-100 text-violet-600' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {!result && !isGenerating && (
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                    <ImageIcon className="w-10 h-10 opacity-40" />
                  </div>
                  <p className="text-lg font-medium mb-2">No images yet</p>
                  <p className="text-sm">Enter a prompt and click Generate</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-80 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-violet-200 dark:border-violet-800 border-t-violet-600 animate-spin" />
                    <Sparkles className="w-8 h-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Creating your masterpiece...</p>
                  {progress?.progress && (
                    <div className="w-48 mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-violet-600 to-fuchsia-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {result && result.images.length > 0 && (
                <div className={`grid ${viewMode === 'grid' && result.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {result.images.map((image, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img
                        src={image.url}
                        alt={`Generated ${index + 1}`}
                        className="w-full h-auto"
                      />

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDownload(image.url, index)}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                              title="Download"
                            >
                              <Download className="w-4 h-4 text-gray-800" />
                            </button>
                            <button
                              onClick={() => upscale(image.url)}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                              title="Upscale 4x"
                            >
                              <Maximize2 className="w-4 h-4 text-gray-800" />
                            </button>
                            <button
                              onClick={() => toggleFavorite(image.url)}
                              className={`p-2 rounded-lg transition-colors ${
                                favorites.has(image.url) ? 'bg-red-500 text-white' : 'bg-white/90 hover:bg-white text-gray-800'
                              }`}
                              title="Favorite"
                            >
                              <Heart className={`w-4 h-4 ${favorites.has(image.url) ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleShare(image.url)}
                              className="p-2 bg-white/90 hover:bg-white rounded-lg transition-colors"
                              title="Share"
                            >
                              <Share2 className="w-4 h-4 text-gray-800" />
                            </button>
                          </div>
                          <button
                            onClick={() => generateImage({ prompt: result.prompt, model: selectedModel, imageSize: selectedSize })}
                            className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                            title="Regenerate"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History Panel */}
            {showHistory && history.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Generation History</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(item.prompt)}
                      className="relative group rounded-lg overflow-hidden aspect-square"
                    >
                      {item.images[0] && (
                        <img src={item.images[0].url} alt={`History ${index}`} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Saved Images Dialog */}
      <Dialog open={showSavedDialog} onOpenChange={setShowSavedDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-violet-500" />
              Saved Images
            </DialogTitle>
            <DialogDescription>
              Your favorite AI-generated images
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {favorites.size === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No saved images yet</p>
                <p className="text-sm">Click the heart icon on generated images to save them here</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {Array.from(favorites).map((url, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img src={url} alt={`Saved ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(url, index)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          toggleFavorite(url)
                          toast.success('Image removed from saved')
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center border-t pt-4">
            <p className="text-sm text-gray-500">{favorites.size} saved image{favorites.size !== 1 ? 's' : ''}</p>
            <div className="flex gap-2">
              {favorites.size > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setFavorites(new Set())
                    toast.success('All saved images cleared')
                  }}
                >
                  Clear All
                </Button>
              )}
              <Button onClick={() => setShowSavedDialog(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
