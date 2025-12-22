'use client'

import { useState } from 'react'
import { Sparkles, Download, RefreshCw, Wand2, Maximize2, Image as ImageIcon, Palette, Settings2, History, Trash2, Loader2 } from 'lucide-react'
import { useNanoBanana, type ImageSize, type ImageStyle, type ImageModel, imagePresets } from '@/lib/hooks/use-nano-banana'

const imageSizes: { value: ImageSize; label: string; ratio: string }[] = [
  { value: 'square_hd', label: 'Square HD', ratio: '1:1' },
  { value: 'square', label: 'Square', ratio: '1:1' },
  { value: 'portrait_4_3', label: 'Portrait', ratio: '3:4' },
  { value: 'portrait_16_9', label: 'Portrait Wide', ratio: '9:16' },
  { value: 'landscape_4_3', label: 'Landscape', ratio: '4:3' },
  { value: 'landscape_16_9', label: 'Landscape Wide', ratio: '16:9' }
]

const imageStyles: { value: ImageStyle; label: string; emoji: string }[] = [
  { value: 'photorealistic', label: 'Photorealistic', emoji: '📸' },
  { value: 'anime', label: 'Anime', emoji: '🎨' },
  { value: '3d-render', label: '3D Render', emoji: '🎮' },
  { value: 'digital-art', label: 'Digital Art', emoji: '🖌️' },
  { value: 'oil-painting', label: 'Oil Painting', emoji: '🎭' },
  { value: 'watercolor', label: 'Watercolor', emoji: '💧' },
  { value: 'sketch', label: 'Sketch', emoji: '✏️' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { value: 'fantasy', label: 'Fantasy', emoji: '✨' }
]

const models: { value: ImageModel; label: string; badge?: string }[] = [
  { value: 'fal-ai/nano-banana', label: 'Nano Banana', badge: 'Fast' },
  { value: 'fal-ai/nano-banana-pro', label: 'Nano Banana Pro', badge: 'Best' },
  { value: 'fal-ai/flux/dev', label: 'FLUX Dev', badge: 'Quality' },
  { value: 'fal-ai/flux-pro', label: 'FLUX Pro', badge: 'Premium' },
  { value: 'fal-ai/stable-diffusion-xl', label: 'SDXL', badge: 'Classic' }
]

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedSize, setSelectedSize] = useState<ImageSize>('landscape_16_9')
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('photorealistic')
  const [selectedModel, setSelectedModel] = useState<ImageModel>('fal-ai/nano-banana')
  const [numImages, setNumImages] = useState(1)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [steps, setSteps] = useState(28)

  const {
    isGenerating,
    progress,
    result,
    error,
    history,
    generateImage,
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
      enhancePrompt: true
    })
  }

  const handleDownload = async (url: string, index: number) => {
    const response = await fetch(url)
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `kazi-ai-image-${Date.now()}-${index}.png`
    a.click()
    URL.revokeObjectURL(downloadUrl)
  }

  const handleUpscale = async (url: string) => {
    await upscale(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:bg-none dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-violet-600" />
              AI Image Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Powered by Nano Banana - Create stunning images with AI
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <History className="w-5 h-5" />
            History ({history.length})
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Prompt Input */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A majestic lion standing on a cliff at sunset, dramatic lighting, photorealistic..."
                className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent dark:text-white"
              />

              {/* Quick Prompts */}
              <div className="mt-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Quick prompts:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(imagePresets).slice(0, 2).flatMap(([_, prompts]) =>
                    prompts.slice(0, 2).map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(p)}
                        className="px-3 py-1 text-sm bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors"
                      >
                        {p.slice(0, 30)}...
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Style Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <Palette className="w-4 h-4 inline mr-2" />
                Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {imageStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedStyle === style.value
                        ? 'bg-violet-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <span>{style.emoji}</span>
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Size
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value as ImageSize)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white"
                >
                  {imageSizes.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label} ({size.ratio})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Wand2 className="w-4 h-4 inline mr-2" />
                  Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value as ImageModel)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white"
                >
                  {models.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label} {model.badge && `(${model.badge})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-6 py-4 flex items-center justify-between text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Advanced Settings
                </span>
                <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {showAdvanced && (
                <div className="px-6 pb-6 space-y-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="pt-4">
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Negative Prompt
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Things to avoid: blurry, low quality..."
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Images: {numImages}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        value={numImages}
                        onChange={(e) => setNumImages(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Guidance: {guidanceScale}
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={guidanceScale}
                        onChange={(e) => setGuidanceScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Steps: {steps}
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="50"
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  {progress?.status === 'processing' ? `Generating... ${progress.progress || 0}%` : 'Queued...'}
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" />
                  Generate Image
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
                {error.message}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {/* Generated Images */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 min-h-[400px]">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Generated Images</h3>

              {!result && !isGenerating && (
                <div className="h-80 flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4 opacity-30" />
                  <p>Your generated images will appear here</p>
                </div>
              )}

              {isGenerating && (
                <div className="h-80 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin" />
                    <Sparkles className="w-8 h-8 text-violet-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <p className="mt-6 text-gray-600 dark:text-gray-400">Creating your masterpiece...</p>
                  {progress?.logs && progress.logs.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">{progress.logs[progress.logs.length - 1]}</p>
                  )}
                </div>
              )}

              {result && result.images.length > 0 && (
                <div className={`grid ${result.images.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
                  {result.images.map((image, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden">
                      <img
                        src={image.url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-auto rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleDownload(image.url, index)}
                          className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={() => handleUpscale(image.url)}
                          className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Upscale 4x"
                        >
                          <Maximize2 className="w-5 h-5 text-gray-800" />
                        </button>
                        <button
                          onClick={() => generateImage({ prompt: result.prompt, model: selectedModel, imageSize: selectedSize })}
                          className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Regenerate"
                        >
                          <RefreshCw className="w-5 h-5 text-gray-800" />
                        </button>
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
                <div className="grid grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {history.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setPrompt(item.prompt)
                      }}
                      className="relative group rounded-lg overflow-hidden"
                    >
                      {item.images[0] && (
                        <img
                          src={item.images[0].url}
                          alt={`History ${index}`}
                          className="w-full h-20 object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RefreshCw className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
