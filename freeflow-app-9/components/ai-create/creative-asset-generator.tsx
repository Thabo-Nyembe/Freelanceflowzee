"use client"

import React, { useState, useCallback, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AIEnhancedInput } from '@/components/ai-create/ai-enhanced-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
// UPS component - now using enhanced version
// import { UniversalPinpointFeedbackSystemEnhanced } from '@/components/projects-hub/universal-pinpoint-feedback-system-enhanced'

// A+++ SUPABASE INTEGRATION
import { createClient } from '@/lib/supabase/client'
import {
  createAsset,
  createGeneration,
  updateGenerationStatus,
  incrementDownloadCount,
  type CreativeField,
  type AssetTypeEnum,
  type AssetFormat,
  type StylePreset,
  type ColorScheme
} from '@/lib/ai-create-queries'

import {
  Camera,
  Video,
  Palette,
  Music,
  Code,
  Code2,
  FileText,
  Upload,
  Wand2,
  Download,
  Eye,
  Sparkles,
  Settings2,
  Layers,
  Image as ImageIcon
} from 'lucide-react'

const logger = createFeatureLogger('CreativeAssetGenerator')

// Creative fields configuration
const CREATIVE_FIELDS = [
  {
    id: 'photography',
    name: 'Photography',
    icon: Camera,
    color: 'blue',
    assetTypes: [
      { id: 'luts', name: 'Professional LUTs', description: 'Cinematic color grading presets' },
      { id: 'presets', name: 'Lightroom Presets', description: 'Professional photo editing presets' },
      { id: 'actions', name: 'Photoshop Actions', description: 'Automated photo effects and workflows' },
      { id: 'overlays', name: 'Photo Overlays', description: 'Light leaks, textures, bokeh effects' },
      { id: 'templates', name: 'Portfolio Templates', description: 'Professional portfolio layouts' },
      { id: 'filters', name: 'AI Filters', description: 'Intelligent enhancement filters' }
    ]
  },
  {
    id: 'videography',
    name: 'Videography',
    icon: Video,
    color: 'purple',
    assetTypes: [
      { id: 'luts', name: 'Video LUTs', description: 'Cinematic color grading for video' },
      { id: 'transitions', name: 'Transitions', description: 'Professional video transitions' },
      { id: 'effects', name: 'Visual Effects', description: 'Motion graphics and VFX' },
      { id: 'templates', name: 'Edit Templates', description: 'Pre-built editing templates' },
      { id: 'presets', name: 'Export Presets', description: 'Optimized export settings' },
      { id: 'overlays', name: 'Video Overlays', description: 'Lower thirds, frames, elements' }
    ]
  },
  {
    id: 'ui-ux-design',
    name: 'UI/UX Design',
    icon: Palette,
    color: 'pink',
    assetTypes: [
      { id: 'figma-components', name: 'Figma Components', description: 'Design system components' },
      { id: 'wireframes', name: 'Wireframes', description: 'Lo-fi and hi-fi wireframes' },
      { id: 'prototypes', name: 'Interactive Prototypes', description: 'Clickable prototypes' },
      { id: 'design-systems', name: 'Design Systems', description: 'Complete design systems' },
      { id: 'mockups', name: 'UI Mockups', description: 'App and web mockups' },
      { id: 'style-guides', name: 'Style Guides', description: 'Brand and UI guidelines' }
    ]
  },
  {
    id: 'graphic-design',
    name: 'Graphic Design',
    icon: ImageIcon,
    color: 'rose',
    assetTypes: [
      { id: 'templates', name: 'Design Templates', description: 'Social media, posters, branding' },
      { id: 'color-schemes', name: 'Color Schemes', description: 'Professional color palettes' },
      { id: 'mockups', name: 'Product Mockups', description: 'Physical product mockups' },
      { id: 'icons', name: 'Icon Sets', description: 'Custom icon collections' },
      { id: 'patterns', name: 'Patterns', description: 'Seamless patterns and textures' },
      { id: 'illustrations', name: 'Illustrations', description: 'Vector and raster illustrations' }
    ]
  },
  {
    id: 'music-production',
    name: 'Music Production',
    icon: Music,
    color: 'green',
    assetTypes: [
      { id: 'presets', name: 'Synth Presets', description: 'Synthesizer sound presets' },
      { id: 'samples', name: 'Sample Packs', description: 'Drums, loops, one-shots' },
      { id: 'midi', name: 'MIDI Patterns', description: 'Chord progressions, melodies' },
      { id: 'effects', name: 'Effect Chains', description: 'Audio processing chains' },
      { id: 'templates', name: 'Project Templates', description: 'DAW project starters' },
      { id: 'mixing', name: 'Mixing Presets', description: 'EQ, compression settings' }
    ]
  },
  {
    id: 'web-development',
    name: 'Web Development',
    icon: Code,
    color: 'orange',
    assetTypes: [
      { id: 'components', name: 'UI Components', description: 'React/Vue/Svelte components' },
      { id: 'templates', name: 'Page Templates', description: 'Landing pages, dashboards' },
      { id: 'themes', name: 'Themes', description: 'Complete UI themes' },
      { id: 'snippets', name: 'Code Snippets', description: 'Utility functions, helpers' },
      { id: 'apis', name: 'API Integrations', description: 'Ready-to-use API code' },
      { id: 'boilerplates', name: 'Boilerplates', description: 'Project starter templates' }
    ]
  },
  {
    id: 'software-development',
    name: 'Software Development',
    icon: Code2,
    color: 'cyan',
    assetTypes: [
      { id: 'algorithms', name: 'Algorithms', description: 'Optimized algorithm implementations' },
      { id: 'architectures', name: 'System Architectures', description: 'Scalable system designs' },
      { id: 'testing', name: 'Test Suites', description: 'Unit and integration tests' },
      { id: 'documentation', name: 'API Documentation', description: 'OpenAPI/Swagger docs' },
      { id: 'devops', name: 'DevOps Scripts', description: 'CI/CD and automation' },
      { id: 'database', name: 'Database Schemas', description: 'SQL and NoSQL schemas' }
    ]
  },
  {
    id: 'content-writing',
    name: 'Content Writing',
    icon: FileText,
    color: 'indigo',
    assetTypes: [
      { id: 'articles', name: 'Articles', description: 'Blog posts, long-form content' },
      { id: 'social', name: 'Social Media', description: 'Posts, captions, threads' },
      { id: 'copy', name: 'Sales Copy', description: 'Landing pages, ads, emails' },
      { id: 'scripts', name: 'Video Scripts', description: 'YouTube, TikTok scripts' },
      { id: 'seo', name: 'SEO Content', description: 'Optimized web content' },
      { id: 'technical', name: 'Technical Docs', description: 'Documentation, guides' }
    ]
  }
]

const STYLES = ['Modern', 'Vintage', 'Minimalist', 'Bold', 'Elegant', 'Playful', 'Professional', 'Artistic']
const COLOR_SCHEMES = ['Vibrant', 'Muted', 'Monochrome', 'Pastel', 'Dark', 'Light', 'Warm', 'Cool']

interface GeneratedAsset {
  id: string
  name: string
  description: string
  size: string
  format: string
  tags: string[]
  previewUrl?: string
}

interface CreativeAssetGeneratorProps {
  asStandalone?: boolean
}

export function CreativeAssetGenerator({ asStandalone = true }: CreativeAssetGeneratorProps) {
  const [activeTab, setActiveTab] = useState<'generate' | 'library' | 'settings'>('generate')
  const [selectedField, setSelectedField] = useState<string | null>(null)
  const [selectedAssetType, setSelectedAssetType] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [style, setStyle] = useState('Modern')
  const [colorScheme, setColorScheme] = useState('Vibrant')
  const [selectedModel, setSelectedModel] = useState('openrouter/mistral-7b-instruct-free')
  const [batchMode, setBatchMode] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showUPS, setShowUPS] = useState(false)
  const [selectedAssetForUPS, setSelectedAssetForUPS] = useState<GeneratedAsset | null>(null)

  const handleFieldSelect = useCallback((fieldId: string) => {
    setSelectedField(fieldId)
    setSelectedAssetType(null)
    logger.info('Creative field selected', { fieldId })
  }, [])

  const handleAssetTypeSelect = useCallback((assetTypeId: string) => {
    setSelectedAssetType(assetTypeId)
    logger.info('Asset type selected', {
      field: selectedField,
      assetType: assetTypeId
    })
  }, [selectedField])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadedFile(file)

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }

    logger.info('File uploaded for reference', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

    toast.success('File Uploaded', {
      description: `${file.name} - ${(file.size / 1024).toFixed(2)}KB`
    })
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!selectedField || !selectedAssetType) {
      toast.error('Selection Required', {
        description: 'Please select a creative field and asset type'
      })
      return
    }

    setGenerating(true)

    logger.info('Starting asset generation', {
      field: selectedField,
      assetType: selectedAssetType,
      hasUpload: !!uploadedFile,
      hasCustomPrompt: !!customPrompt,
      style,
      colorScheme,
      model: selectedModel,
      batchMode
    })

    try {
      // Get authenticated user
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        logger.warn('No authenticated user found')
        toast.error('Please log in to generate assets')
        setGenerating(false)
        return
      }

      // Create generation record in Supabase
      const assetCount = batchMode ? 3 : 1
      const { data: generationRecord, error: genError } = await createGeneration(user.id, {
        creative_field: selectedField as CreativeField,
        asset_type: selectedAssetType as AssetTypeEnum,
        style: style.toLowerCase() as StylePreset,
        color_scheme: colorScheme.toLowerCase() as ColorScheme,
        custom_prompt: customPrompt || undefined,
        model_used: selectedModel,
        batch_mode: batchMode,
        assets_requested: assetCount,
        input_file_url: uploadPreview || undefined
      })

      if (genError) {
        logger.error('Failed to create generation record', { error: genError })
      }

      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Generate and save assets to Supabase
      const newAssets: GeneratedAsset[] = []

      for (let i = 0; i < assetCount; i++) {
        const field = CREATIVE_FIELDS.find(f => f.id === selectedField)
        const assetType = field?.assetTypes.find(a => a.id === selectedAssetType)

        const assetName = `${assetType?.name} ${i + 1}`
        const fileSize = Math.floor(Math.random() * 5000000 + 1000000) // 1-6 MB in bytes

        // Save to Supabase
        const { data: savedAsset, error: assetError } = await createAsset(user.id, {
          name: assetName,
          description: assetType?.description || '',
          creative_field: selectedField as CreativeField,
          asset_type: selectedAssetType as AssetTypeEnum,
          format: 'png' as AssetFormat,
          file_size: fileSize,
          tags: [style.toLowerCase(), colorScheme.toLowerCase(), selectedField],
          style: style.toLowerCase() as StylePreset,
          color_scheme: colorScheme.toLowerCase() as ColorScheme,
          custom_prompt: customPrompt || undefined,
          model_used: selectedModel
        })

        if (assetError) {
          logger.error('Failed to save asset', { error: assetError, assetName })
        } else if (savedAsset) {
          newAssets.push({
            id: savedAsset.id,
            name: savedAsset.name,
            description: savedAsset.description || '',
            size: `${(fileSize / 1000000).toFixed(1)} MB`,
            format: '.png',
            tags: savedAsset.tags
          })
        }
      }

      // Update generation record status
      if (generationRecord) {
        await updateGenerationStatus(generationRecord.id, {
          status: 'completed',
          assets_generated: newAssets.length,
          generation_time_ms: 3000
        })
      }

      setGeneratedAssets(newAssets)

      logger.info('Asset generation complete', {
        assetsGenerated: newAssets.length,
        totalSize: newAssets.reduce((sum, a) => sum + parseFloat(a.size), 0).toFixed(2)
      })

      toast.success('Assets Generated & Saved', {
        description: `${newAssets.length} ${assetCount > 1 ? 'assets' : 'asset'} created and saved to library`
      })
    } catch (error: any) {
      logger.error('Generation failed', { error })
      toast.error('Generation Failed', {
        description: error.message || 'Please try again'
      })
    } finally {
      setGenerating(false)
    }
  }, [selectedField, selectedAssetType, uploadedFile, customPrompt, style, colorScheme, selectedModel, batchMode, uploadPreview])

  const handleDownload = useCallback(async (asset: GeneratedAsset) => {
    logger.info('Downloading asset', {
      assetId: asset.id,
      assetName: asset.name
    })

    // Increment download count in Supabase
    const { error } = await incrementDownloadCount(asset.id)
    if (error) {
      logger.error('Failed to increment download count', { error })
    }

    toast.success('Download Started', {
      description: `${asset.name} - ${asset.size}`
    })
  }, [])

  const handlePreview = useCallback((asset: GeneratedAsset) => {
    logger.info('Previewing asset', {
      assetId: asset.id,
      assetName: asset.name
    })

    toast.info('Preview', {
      description: asset.name
    })
  }, [])

  const handleOpenUPS = useCallback((asset: GeneratedAsset) => {
    setSelectedAssetForUPS(asset)
    setShowUPS(true)
    logger.info('Opening UPS for asset', { assetId: asset.id, assetName: asset.name })
    toast.success('Visual Feedback System', {
      description: `Opening pinpoint feedback for ${asset.name}`
    })
  }, [])

  const selectedFieldData = CREATIVE_FIELDS.find(f => f.id === selectedField)

  return (
    <div className="space-y-6">
      {/* Tab Navigation - only show if standalone */}
      {asStandalone && (
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'generate'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Generate Assets
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'library'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Asset Library
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-600 dark:text-gray-400'
            }`}
          >
            Advanced Settings
          </button>
        </div>
      )}

      {activeTab === 'generate' && (
        <div className="space-y-6">
          {/* Step 1: Select Creative Field */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold">Select Your Creative Field</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {CREATIVE_FIELDS.map((field) => {
                const Icon = field.icon
                const isSelected = selectedField === field.id

                return (
                  <Card
                    key={field.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''
                    }`}
                    onClick={() => handleFieldSelect(field.id)}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`p-4 rounded-full bg-${field.color}-500/10`}>
                        <Icon className={`h-8 w-8 text-${field.color}-600`} />
                      </div>
                      <div>
                        <h3 className="font-semibold">{field.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {field.assetTypes.length} asset types available
                        </p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>

          {/* Step 2: Choose Asset Type */}
          {selectedField && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold">
                  Choose Asset Type for {selectedFieldData?.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedFieldData?.assetTypes.map((assetType) => {
                  const isSelected = selectedAssetType === assetType.id

                  return (
                    <Card
                      key={assetType.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => handleAssetTypeSelect(assetType.id)}
                    >
                      <h3 className="font-semibold mb-1">{assetType.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {assetType.description}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Step 3: Customize Generation */}
          {selectedAssetType && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold">Customize Generation Parameters</h2>
              </div>

              <div className="space-y-4">
                {/* File Upload */}
                <div>
                  <Label htmlFor="file-upload" className="mb-2 block">
                    Upload Reference Image (Optional)
                  </Label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadedFile ? 'Change File' : 'Upload File'}
                    </Button>
                    {uploadedFile && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploadedFile.name} - {(uploadedFile.size / 1024).toFixed(2)}KB
                      </span>
                    )}
                  </div>
                  {uploadPreview && (
                    <div className="mt-4">
                      <img src={uploadPreview}
                        alt="Upload preview"
                        className="max-w-sm rounded-lg border border-gray-200 dark:border-gray-700"
                      / loading="lazy">
                    </div>
                  )}
                </div>

                {/* Style */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="style" className="mb-2 block">Style</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger id="style">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="color-scheme" className="mb-2 block">Color Scheme</Label>
                    <Select value={colorScheme} onValueChange={setColorScheme}>
                      <SelectTrigger id="color-scheme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_SCHEMES.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Prompt */}
                <div>
                  <Label htmlFor="custom-prompt" className="mb-2 block">
                    Custom Prompt (Optional)
                  </Label>
                  <AIEnhancedInput
                    value={customPrompt}
                    onChange={(text) => setCustomPrompt(text)}
                    contentType="description"
                    placeholder="Describe specific requirements or style preferences..."
                    showSuggestions={true}
                    showEnhance={true}
                    showGenerate={true}
                    minRows={3}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Step 4: AI Model Selection */}
          {selectedAssetType && (
            <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold">AI Model Selection</h2>
                <Badge variant="default" className="ml-auto bg-green-500 text-white">4 Free Models Available</Badge>
              </div>

              <div className="space-y-4">
                {/* FREE MODELS */}
                <div>
                  <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    FREE Models (OpenRouter)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/mistral-7b-instruct-free' ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/mistral-7b-instruct-free')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Mistral 7B Instruct</h4>
                        <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Fast & efficient for text and code generation
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">32K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Low latency</Badge>
                        <Badge variant="secondary" className="text-xs">Standard quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/phi-3-mini-free' ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/phi-3-mini-free')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Phi-3 Mini</h4>
                        <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Microsoft's efficient model with huge context
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">128K tokens!</Badge>
                        <Badge variant="secondary" className="text-xs">Low latency</Badge>
                        <Badge variant="secondary" className="text-xs">Code gen</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/mythomax-l2-13b-free' ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/mythomax-l2-13b-free')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">MythoMax L2 13B</h4>
                        <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Creative writing & pattern recognition
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">8K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Creative</Badge>
                        <Badge variant="secondary" className="text-xs">Standard quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/cinematika-7b-free' ? 'ring-2 ring-green-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/cinematika-7b-free')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Cinematika 7B</h4>
                        <Badge className="bg-green-500 text-white text-xs">FREE</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Specialized for creative & cinematic content
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">8K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Low latency</Badge>
                        <Badge variant="secondary" className="text-xs">Creative</Badge>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* AFFORDABLE MODELS */}
                <div>
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Affordable Premium ($0.06-0.36 per 1M tokens)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/llama-3.1-8b' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/llama-3.1-8b')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Llama 3.1 8B</h4>
                        <Badge variant="outline" className="text-xs">$0.06/1M</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Meta's powerful model - ultra affordable!
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">131K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Low latency</Badge>
                        <Badge variant="secondary" className="text-xs">Premium quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/mixtral-8x7b' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/mixtral-8x7b')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Mixtral 8x7B</h4>
                        <Badge variant="outline" className="text-xs">$0.24/1M</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Mixture of Experts - excellent reasoning
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">32K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Medium latency</Badge>
                        <Badge variant="secondary" className="text-xs">Premium quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'openrouter/llama-3.1-70b' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedModel('openrouter/llama-3.1-70b')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Llama 3.1 70B</h4>
                        <Badge variant="outline" className="text-xs">$0.36/1M</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Large model with exceptional capabilities
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">131K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Medium latency</Badge>
                        <Badge variant="secondary" className="text-xs">Premium quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'gemini-pro-vision' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedModel('gemini-pro-vision')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Gemini Pro Vision</h4>
                        <Badge variant="outline" className="text-xs">$0.00038/1M</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Google's multimodal model with vision
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">32K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Vision</Badge>
                        <Badge variant="secondary" className="text-xs">Premium quality</Badge>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* PREMIUM MODELS */}
                <div>
                  <h3 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Premium Models (Highest Quality)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'gpt-4o' ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setSelectedModel('gpt-4o')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">GPT-4o</h4>
                        <Badge variant="default" className="bg-purple-600 text-xs">Premium</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        OpenAI's most advanced multimodal model
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">128K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Multimodal</Badge>
                        <Badge variant="secondary" className="text-xs">Ultra quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'claude-3-5-sonnet' ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setSelectedModel('claude-3-5-sonnet')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Claude 3.5 Sonnet</h4>
                        <Badge variant="default" className="bg-purple-600 text-xs">Premium</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Anthropic's best - exceptional at code & reasoning
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">200K tokens</Badge>
                        <Badge variant="secondary" className="text-xs">Low latency</Badge>
                        <Badge variant="secondary" className="text-xs">Ultra quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'stable-diffusion-xl' ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setSelectedModel('stable-diffusion-xl')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">Stable Diffusion XL</h4>
                        <Badge variant="default" className="bg-purple-600 text-xs">Image Gen</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Professional image generation & style transfer
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">Image only</Badge>
                        <Badge variant="secondary" className="text-xs">Medium latency</Badge>
                        <Badge variant="secondary" className="text-xs">Ultra quality</Badge>
                      </div>
                    </Card>

                    <Card
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedModel === 'dall-e-3' ? 'ring-2 ring-purple-500' : ''}`}
                      onClick={() => setSelectedModel('dall-e-3')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">DALL-E 3</h4>
                        <Badge variant="default" className="bg-purple-600 text-xs">Image Gen</Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        OpenAI's premium image generation
                      </p>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant="secondary" className="text-xs">Image only</Badge>
                        <Badge variant="secondary" className="text-xs">High latency</Badge>
                        <Badge variant="secondary" className="text-xs">Ultra quality</Badge>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Batch Mode */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <Label htmlFor="batch-mode" className="font-medium">Enable Batch Mode</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generate 3 variations at once</p>
                  </div>
                  <Switch
                    id="batch-mode"
                    checked={batchMode}
                    onCheckedChange={setBatchMode}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  size="lg"
                >
                  <Wand2 className="h-5 w-5 mr-2" />
                  {generating ? 'Generating...' : 'Generate Assets'}
                </Button>

                {generating && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Generating with AI...</span>
                      <span>Please wait</span>
                    </div>
                    <Progress value={66} className="h-2" />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Generated Assets */}
          {generatedAssets.length > 0 && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-xl font-semibold">Generated Assets ({generatedAssets.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedAssets.map((asset) => (
                  <Card key={asset.id} className="p-4">
                    {/* Asset Preview Placeholder */}
                    <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-3 flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>

                    <h3 className="font-semibold mb-1">{asset.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {asset.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                      <span>{asset.size}</span>
                      <span>•</span>
                      <span>{asset.format}</span>
                    </div>

                    <div className="flex gap-2 flex-wrap mb-3">
                      {asset.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(asset)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(asset)}
                        className="flex-1 bg-black hover:bg-gray-800 text-white"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>

                    {/* Universal Pinpoint System Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenUPS(asset)}
                      className="w-full mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Visual Feedback
                    </Button>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'library' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Asset Library</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your previously generated assets will appear here
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'settings' && (
        <Card className="p-6">
          <div className="text-center py-12">
            <Settings2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Configure AI models, quality settings, and preferences
            </p>
          </div>
        </Card>
      )}

      {/* Universal Pinpoint System Dialog - TODO: Re-enable when UPS component syntax is fixed */}
      {/* {showUPS && selectedAssetForUPS && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Universal Pinpoint Feedback - {selectedAssetForUPS.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add precise, contextual feedback to your generated assets with AI-powered insights
                </p>
              </div>
              <button
                onClick={() => setShowUPS(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <UniversalPinpointFeedbackSystem
                projectId={`ai-create-${selectedAssetForUPS.id}`}
                readOnly={false}
                onCommentAdd={(comment) => {
                  logger.info('UPS comment added to asset', { assetId: selectedAssetForUPS.id, comment })
                  toast.success('Feedback Added', {
                    description: 'Your visual feedback has been saved to this asset'
                  })
                }}
                onCommentUpdate={(comment) => {
                  logger.info('UPS comment updated', { comment })
                }}
                onCommentDelete={(commentId) => {
                  logger.info('UPS comment deleted', { commentId })
                }}
              />
            </div>
          </div>
        </div>
      )} */}
    </div>
  )
}
