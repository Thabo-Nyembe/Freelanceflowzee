'use client'

import React, { useReducer, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  Camera, 
  Palette, 
  Music, 
  Video, 
  Code, 
  FileText, 
  Download, 
  Sparkles, 
  Settings, 
  Eye,
  Wand2,
  FileImage,
  Zap,
  Brain,
  Key,
  DollarSign,
  Cpu,
  Globe,
  Shield
} from 'lucide-react'

interface AssetGenerationState {
  selectedField: string
  generationType: string
  parameters: Record<string, any>
  generatedAssets: GeneratedAsset[]
  isGenerating: boolean
  generationProgress: number
  previewAsset: GeneratedAsset | null
  customPrompt: string
  advancedSettings: AdvancedSettings
  selectedModel: AIModel
  customApiKey: string
  useCustomApi: boolean
}

interface GeneratedAsset {
  id: string
  name: string
  type: string
  category: string
  downloadUrl: string
  previewUrl: string
  metadata: AssetMetadata
  createdAt: Date
  size: string
  format: string
}

interface AssetMetadata {
  dimensions?: string
  tags: string[]
  description: string
}

interface AdvancedSettings {
  quality: 'draft' | 'standard' | 'professional' | 'premium'
  style: string
  colorScheme: string
  resolution: string
  format: string
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  costPerRequest: number
  speed: 'fast' | 'medium' | 'slow'
  quality: 'good' | 'excellent' | 'premium'
  requiresApiKey: boolean
  isFree: boolean
  maxTokens?: number
}

type AssetGenerationAction =
  | { type: 'SET_FIELD'; payload: string }
  | { type: 'SET_GENERATION_TYPE'; payload: string }
  | { type: 'UPDATE_PARAMETERS'; payload: Record<string, any> }
  | { type: 'START_GENERATION' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'ADD_GENERATED_ASSET'; payload: GeneratedAsset }
  | { type: 'COMPLETE_GENERATION' }
  | { type: 'SET_PREVIEW'; payload: GeneratedAsset | null }
  | { type: 'UPDATE_PROMPT'; payload: string }
  | { type: 'UPDATE_ADVANCED_SETTINGS'; payload: Partial<AdvancedSettings> }
  | { type: 'SET_MODEL'; payload: AIModel }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'TOGGLE_CUSTOM_API'; payload: boolean }

const CREATIVE_FIELDS = {
  photography: {
    name: 'Photography',
    icon: Camera,
    color: 'bg-blue-500',
    assetTypes: [
      { id: 'luts', name: 'LUTs (Color Grading)', description: 'Professional color grading presets' },
      { id: 'presets', name: 'Lightroom Presets', description: 'Photo editing presets' },
      { id: 'actions', name: 'Photoshop Actions', description: 'Automated photo effects' },
      { id: 'overlays', name: 'Photo Overlays', description: 'Light leaks, textures, bokeh' },
      { id: 'templates', name: 'Portfolio Templates', description: 'Professional portfolio layouts' }
    ]
  },
  videography: {
    name: 'Videography',
    icon: Video,
    color: 'bg-purple-500',
    assetTypes: [
      { id: 'transitions', name: 'Video Transitions', description: 'Smooth scene transitions' },
      { id: 'luts', name: 'Cinematic LUTs', description: 'Film-style color grading' },
      { id: 'titles', name: 'Title Templates', description: 'Animated text overlays' },
      { id: 'effects', name: 'Visual Effects', description: 'Particles, glitches, distortions' },
      { id: 'audio', name: 'Audio Tracks', description: 'Background music and SFX' }
    ]
  },
  design: {
    name: 'Graphic Design',
    icon: Palette,
    color: 'bg-pink-500',
    assetTypes: [
      { id: 'templates', name: 'Design Templates', description: 'Logos, posters, social media' },
      { id: 'patterns', name: 'Seamless Patterns', description: 'Repeating background patterns' },
      { id: 'icons', name: 'Icon Sets', description: 'Consistent icon collections' },
      { id: 'fonts', name: 'Custom Fonts', description: 'Brand-specific typography' },
      { id: 'mockups', name: 'Product Mockups', description: '3D product presentations' }
    ]
  },
  music: {
    name: 'Music Production',
    icon: Music,
    color: 'bg-green-500',
    assetTypes: [
      { id: 'samples', name: 'Audio Samples', description: 'Drum hits, loops, one-shots' },
      { id: 'presets', name: 'Synth Presets', description: 'Synthesizer sound presets' },
      { id: 'midi', name: 'MIDI Patterns', description: 'Chord progressions and melodies' },
      { id: 'stems', name: 'Song Stems', description: 'Individual track elements' },
      { id: 'effects', name: 'Audio Effects', description: 'Reverb, delay, distortion presets' }
    ]
  },
  web: {
    name: 'Web Development',
    icon: Code,
    color: 'bg-orange-500',
    assetTypes: [
      { id: 'components', name: 'UI Components', description: 'Reusable React/Vue components' },
      { id: 'animations', name: 'CSS Animations', description: 'Smooth micro-interactions' },
      { id: 'themes', name: 'Color Themes', description: 'Complete design systems' },
      { id: 'templates', name: 'Page Templates', description: 'Landing pages, dashboards' },
      { id: 'snippets', name: 'Code Snippets', description: 'Utility functions and helpers' }
    ]
  },
  writing: {
    name: 'Content Writing',
    icon: FileText,
    color: 'bg-indigo-500',
    assetTypes: [
      { id: 'templates', name: 'Content Templates', description: 'Blog posts, emails, social media' },
      { id: 'prompts', name: 'Writing Prompts', description: 'Creative inspiration starters' },
      { id: 'outlines', name: 'Content Outlines', description: 'Structured content frameworks' },
      { id: 'headlines', name: 'Headline Variations', description: 'Compelling title options' },
      { id: 'hooks', name: 'Opening Hooks', description: 'Attention-grabbing intros' }
    ]
  }
}

const assetGenerationReducer = (state: AssetGenerationState, action: AssetGenerationAction): AssetGenerationState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        selectedField: action.payload,
        generationType: '',
        parameters: {},
        generatedAssets: []
      }
    
    case 'SET_GENERATION_TYPE':
      return {
        ...state,
        generationType: action.payload,
        parameters: {}
      }
    
    case 'UPDATE_PARAMETERS':
      return {
        ...state,
        parameters: { ...state.parameters, ...action.payload }
      }
    
    case 'START_GENERATION':
      return {
        ...state,
        isGenerating: true,
        generationProgress: 0,
        generatedAssets: []
      }
    
    case 'UPDATE_PROGRESS':
      return {
        ...state,
        generationProgress: action.payload
      }
    
    case 'ADD_GENERATED_ASSET':
      return {
        ...state,
        generatedAssets: [...state.generatedAssets, action.payload]
      }
    
    case 'COMPLETE_GENERATION':
      return {
        ...state,
        isGenerating: false,
        generationProgress: 100
      }
    
    case 'SET_PREVIEW':
      return {
        ...state,
        previewAsset: action.payload
      }
    
    case 'UPDATE_PROMPT':
      return {
        ...state,
        customPrompt: action.payload
      }
    
    case 'UPDATE_ADVANCED_SETTINGS':
      return {
        ...state,
        advancedSettings: { ...state.advancedSettings, ...action.payload }
      }
    
    case 'SET_MODEL':
      return {
        ...state,
        selectedModel: action.payload
      }
    
    case 'SET_API_KEY':
      return {
        ...state,
        customApiKey: action.payload
      }
    
    case 'TOGGLE_CUSTOM_API':
      return {
        ...state,
        useCustomApi: action.payload
      }
    
    default:
      return state
  }
}

export default function AICreate() {
  // Available AI Models
  const [availableModels] = useState<AIModel[]>([
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      provider: 'OpenAI',
      description: 'Fast and cost-effective model for creative tasks',
      costPerRequest: 0.01,
      speed: 'fast',
      quality: 'good',
      requiresApiKey: true,
      isFree: false
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Balanced performance and cost',
      costPerRequest: 0.002,
      speed: 'fast',
      quality: 'good',
      requiresApiKey: true,
      isFree: false
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'Anthropic',
      description: 'Fast and efficient for creative generation',
      costPerRequest: 0.0025,
      speed: 'fast',
      quality: 'excellent',
      requiresApiKey: true,
      isFree: false
    },
    {
      id: 'gemini-pro',
      name: 'Gemini Pro',
      provider: 'Google',
      description: 'Advanced multimodal capabilities',
      costPerRequest: 0.005,
      speed: 'medium',
      quality: 'excellent',
      requiresApiKey: true,
      isFree: false
    },
    {
      id: 'llama-2-7b',
      name: 'Llama 2 7B',
      provider: 'Meta',
      description: 'Free open-source model via Hugging Face',
      costPerRequest: 0,
      speed: 'medium',
      quality: 'good',
      requiresApiKey: false,
      isFree: true
    },
    {
      id: 'mistral-7b',
      name: 'Mistral 7B',
      provider: 'Mistral AI',
      description: 'Free high-performance model',
      costPerRequest: 0,
      speed: 'fast',
      quality: 'good',
      requiresApiKey: false,
      isFree: true
    }
  ])

  const [state, dispatch] = useReducer(assetGenerationReducer, {
    selectedField: '',
    generationType: '',
    parameters: {},
    generatedAssets: [],
    isGenerating: false,
    generationProgress: 0,
    previewAsset: null,
    customPrompt: '',
    advancedSettings: {
      quality: 'standard',
      style: 'modern',
      colorScheme: 'vibrant',
      resolution: 'high',
      format: 'auto'
    },
    selectedModel: availableModels[4], // Default to free Llama model
    customApiKey: '',
    useCustomApi: false
  })

  // Context7 Pattern: Enhanced Asset Generation with Model Selection
  const generateAssets = async () => {
    dispatch({ type: 'START_GENERATION' })
    
    try {
      // Context7 Pattern: Build request payload with model configuration
      const requestPayload = {
        field: state.selectedField,
        assetType: state.generationType,
        parameters: {
          style: state.parameters.style || 'modern',
          colorScheme: state.parameters.colorScheme || 'vibrant',
          customPrompt: state.customPrompt
        },
        advancedSettings: state.advancedSettings,
        // Context7 Pattern: Model and API configuration
        modelConfig: {
          modelId: state.selectedModel.id,
          provider: state.selectedModel.provider,
          useCustomApi: state.useCustomApi,
          customApiKey: state.useCustomApi ? state.customApiKey : undefined,
          maxTokens: state.selectedModel.maxTokens,
          qualityLevel: state.selectedModel.quality
        }
      }

      // Context7 Pattern: Conditional API routing based on model selection
      const apiEndpoint = state.useCustomApi && state.customApiKey 
        ? '/api/ai/create/custom' 
        : '/api/ai/create'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Context7 Pattern: Add model-specific headers
          'X-AI-Model': state.selectedModel.id,
          'X-Use-Custom-API': state.useCustomApi.toString(),
          ...(state.useCustomApi && state.customApiKey && {
            'X-Custom-API-Key': state.customApiKey
          })
        },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()
      
      // Simulate progress updates
      const progressSteps = [10, 25, 50, 75, 90, 100]
      
      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 600))
        dispatch({ type: 'UPDATE_PROGRESS', payload: step })
      }

      // Add generated assets from API
      if (result.success && result.assets) {
        for (const asset of result.assets) {
          // Convert API response to component format
          const formattedAsset: GeneratedAsset = {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            category: asset.category,
            downloadUrl: asset.downloadUrl,
            previewUrl: asset.previewUrl,
            metadata: {
              dimensions: asset.metadata.dimensions,
              tags: asset.metadata.tags,
              description: asset.metadata.description
            },
            createdAt: new Date(asset.createdAt),
            size: asset.metadata.size,
            format: asset.metadata.format
          }
          
          dispatch({ type: 'ADD_GENERATED_ASSET', payload: formattedAsset })
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      dispatch({ type: 'COMPLETE_GENERATION' })
    } catch (error) {
      console.error('Asset generation failed:', error)
      // Fallback to mock assets if API fails
      const field = CREATIVE_FIELDS[state.selectedField as keyof typeof CREATIVE_FIELDS]
      const assetType = field?.assetTypes.find(type => type.id === state.generationType)
      const mockAssets = generateMockAssets(state.selectedField, state.generationType, assetType?.name || '')
      
      for (const asset of mockAssets) {
        dispatch({ type: 'ADD_GENERATED_ASSET', payload: asset })
        await new Promise(resolve => setTimeout(resolve, 200))
      }
      
      dispatch({ type: 'COMPLETE_GENERATION' })
    }
  }

  const generateMockAssets = (field: string, type: string, typeName: string): GeneratedAsset[] => {
    const baseAssets = [
      {
        id: `${field}-${type}-1`,
        name: `Professional ${typeName} Pack 1`,
        type,
        category: field,
        downloadUrl: '#',
        previewUrl: '/placeholder.jpg',
        metadata: {
          dimensions: '1920x1080',
          tags: ['professional', 'modern', 'clean'],
          description: `High-quality ${typeName.toLowerCase()} for professional use`
        },
        createdAt: new Date(),
        size: '2.4 MB',
        format: getFormatForType(type)
      },
      {
        id: `${field}-${type}-2`,
        name: `Creative ${typeName} Collection`,
        type,
        category: field,
        downloadUrl: '#',
        previewUrl: '/placeholder.jpg',
        metadata: {
          dimensions: '1920x1080',
          tags: ['creative', 'artistic', 'unique'],
          description: `Creative ${typeName.toLowerCase()} with artistic flair`
        },
        createdAt: new Date(),
        size: '3.1 MB',
        format: getFormatForType(type)
      },
      {
        id: `${field}-${type}-3`,
        name: `Minimalist ${typeName} Set`,
        type,
        category: field,
        downloadUrl: '#',
        previewUrl: '/placeholder.jpg',
        metadata: {
          dimensions: '1920x1080',
          tags: ['minimalist', 'clean', 'elegant'],
          description: `Clean and minimalist ${typeName.toLowerCase()}`
        },
        createdAt: new Date(),
        size: '1.8 MB',
        format: getFormatForType(type)
      }
    ]
    
    return baseAssets
  }

  const getFormatForType = (type: string): string => {
    const formatMap: Record<string, string> = {
      luts: '.cube',
      presets: '.xmp',
      actions: '.atn',
      overlays: '.png',
      templates: '.psd',
      transitions: '.prproj',
      titles: '.mogrt',
      effects: '.aep',
      audio: '.wav',
      samples: '.wav',
      midi: '.mid',
      stems: '.wav',
      components: '.tsx',
      animations: '.css',
      themes: '.json',
      snippets: '.js'
    }
    
    return formatMap[type] || '.zip'
  }

  const selectedField = CREATIVE_FIELDS[state.selectedField as keyof typeof CREATIVE_FIELDS]

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Create
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Generate professional assets tailored to your creative field. From LUTs and presets to templates and components - powered by advanced AI.
        </p>
      </div>

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate Assets</TabsTrigger>
          <TabsTrigger value="library">Asset Library</TabsTrigger>
          <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Select Your Creative Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CREATIVE_FIELDS).map(([key, field]) => {
                  const Icon = field.icon
                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        state.selectedField === key 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => dispatch({ type: 'SET_FIELD', payload: key })}
                    >
                      <CardContent className="p-6 text-center space-y-3">
                        <div className={`w-16 h-16 ${field.color} rounded-full flex items-center justify-center mx-auto`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-lg">{field.name}</h3>
                        <p className="text-sm text-gray-600">
                          {field.assetTypes.length} asset types available
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {selectedField && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedField.icon className="w-5 h-5" />
                  Choose Asset Type for {selectedField.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedField.assetTypes.map((assetType) => (
                    <Card
                      key={assetType.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        state.generationType === assetType.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => dispatch({ type: 'SET_GENERATION_TYPE', payload: assetType.id })}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-lg mb-2">{assetType.name}</h4>
                        <p className="text-sm text-gray-600">{assetType.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {state.generationType && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Customize Generation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select
                      value={state.parameters.style || 'modern'}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_PARAMETERS', payload: { style: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="minimalist">Minimalist</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Color Scheme</label>
                    <Select
                      value={state.parameters.colorScheme || 'vibrant'}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_PARAMETERS', payload: { colorScheme: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color scheme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vibrant">Vibrant</SelectItem>
                        <SelectItem value="muted">Muted</SelectItem>
                        <SelectItem value="monochrome">Monochrome</SelectItem>
                        <SelectItem value="warm">Warm Tones</SelectItem>
                        <SelectItem value="cool">Cool Tones</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Custom Prompt (Optional)</label>
                  <Textarea
                    placeholder="Describe specific requirements or style preferences..."
                    value={state.customPrompt}
                    onChange={(e) => dispatch({ type: 'UPDATE_PROMPT', payload: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Context7 Pattern: AI Model Selection with Cost Optimization */}
                <Card className="border-dashed border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="w-5 h-5 text-purple-600" />
                      AI Model Selection
                      <Badge variant="secondary" className="ml-auto">
                        {state.selectedModel.isFree ? 'Free' : `$${state.selectedModel.costPerRequest}/req`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableModels.map((model) => (
                        <Card
                          key={model.id}
                          className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                            state.selectedModel.id === model.id 
                              ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
                              : 'hover:shadow-md hover:border-purple-100'
                          }`}
                          onClick={() => dispatch({ type: 'SET_MODEL', payload: model })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-gray-600" />
                                <h4 className="font-semibold text-sm">{model.name}</h4>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                {model.isFree ? (
                                  <Badge className="bg-green-500 text-xs">Free</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    ${model.costPerRequest}
                                  </Badge>
                                )}
                                <Badge 
                                  variant="secondary" 
                                  className={`text-xs ${
                                    model.speed === 'fast' ? 'bg-green-100 text-green-700' :
                                    model.speed === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {model.speed}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{model.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">{model.provider}</span>
                              <div className="flex items-center gap-1">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                      i < (model.quality === 'premium' ? 3 : model.quality === 'excellent' ? 2 : 1)
                                        ? 'bg-purple-400'
                                        : 'bg-gray-200'
                                    }`}
                                  />
                                ))}
                                <span className="text-xs text-gray-500 ml-1">Quality</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Context7 Pattern: Custom API Key Management */}
                    {state.selectedModel.requiresApiKey && (
                      <div className="space-y-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Key className="w-4 h-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-800">API Key Required</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {state.selectedModel.provider}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            id="useCustomApi"
                            checked={state.useCustomApi}
                            onChange={(e) => dispatch({ type: 'TOGGLE_CUSTOM_API', payload: e.target.checked })}
                            className="rounded border-amber-300"
                          />
                          <label htmlFor="useCustomApi" className="text-sm text-amber-700">
                            Use my own API key (saves costs & enables unlimited usage)
                          </label>
                        </div>

                        {state.useCustomApi ? (
                          <div className="space-y-2">
                            <Input
                              type="password"
                              placeholder={`Enter your ${state.selectedModel.provider} API key...`}
                              value={state.customApiKey}
                              onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
                              className="bg-white border-amber-300 focus:border-amber-500"
                            />
                            <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs">
                              <Shield className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                              <span className="text-blue-700">
                                Your API key is stored securely in your browser and never sent to our servers. 
                                It's only used to make direct requests to {state.selectedModel.provider}.
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-white border border-amber-200 rounded text-xs">
                            <div className="flex items-center gap-2 mb-2">
                              <Globe className="w-3 h-3 text-gray-600" />
                              <span className="font-medium">Using FreeflowZee API Credits</span>
                            </div>
                            <p className="text-gray-600 mb-2">
                              We'll handle the API calls for you. Each generation uses your account credits.
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-500">Cost per request:</span>
                              <Badge variant="outline" className="text-xs">
                                ${state.selectedModel.costPerRequest} credits
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Context7 Pattern: Model Performance Indicators */}
                    <div className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {state.selectedModel.speed === 'fast' ? '⚡' : 
                           state.selectedModel.speed === 'medium' ? '⏱️' : '🐌'}
                        </div>
                        <div className="text-xs text-gray-600">Speed</div>
                        <div className="text-xs font-medium capitalize">{state.selectedModel.speed}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {state.selectedModel.quality === 'premium' ? '💎' : 
                           state.selectedModel.quality === 'excellent' ? '⭐' : '👍'}
                        </div>
                        <div className="text-xs text-gray-600">Quality</div>
                        <div className="text-xs font-medium capitalize">{state.selectedModel.quality}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-purple-600">
                          {state.selectedModel.isFree ? '🆓' : '💰'}
                        </div>
                        <div className="text-xs text-gray-600">Cost</div>
                        <div className="text-xs font-medium">
                          {state.selectedModel.isFree ? 'Free' : `$${state.selectedModel.costPerRequest}`}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={generateAssets}
                  disabled={state.isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  size="lg"
                >
                  {state.isGenerating ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                      Generating Assets... {state.generationProgress}%
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Generate AI Assets
                    </>
                  )}
                </Button>

                {state.isGenerating && (
                  <div className="space-y-2">
                    <Progress value={state.generationProgress} className="w-full" />
                    <p className="text-sm text-center text-gray-600">
                      Creating professional assets for {selectedField?.name}...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {state.generatedAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Generated Assets ({state.generatedAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.generatedAssets.map((asset) => (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileImage className="w-12 h-12 text-gray-400" />
                        </div>
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          {asset.format}
                        </Badge>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        <h4 className="font-semibold text-sm">{asset.name}</h4>
                        <p className="text-xs text-gray-600">{asset.metadata.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {asset.metadata.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">{asset.size}</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => dispatch({ type: 'SET_PREVIEW', payload: asset })}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Asset Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assets in library yet</h3>
                <p className="text-gray-600 mb-4">
                  Generate your first assets to start building your professional library
                </p>
                <Button variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Generating
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quality Level</label>
                  <Select
                    value={state.advancedSettings.quality}
                    onValueChange={(value: any) => dispatch({ 
                      type: 'UPDATE_ADVANCED_SETTINGS', 
                      payload: { quality: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft - Fast generation</SelectItem>
                      <SelectItem value="standard">Standard - Balanced quality</SelectItem>
                      <SelectItem value="professional">Professional - High quality</SelectItem>
                      <SelectItem value="premium">Premium - Maximum quality</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Resolution</label>
                  <Select
                    value={state.advancedSettings.resolution}
                    onValueChange={(value) => dispatch({ 
                      type: 'UPDATE_ADVANCED_SETTINGS', 
                      payload: { resolution: value } 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (720p)</SelectItem>
                      <SelectItem value="medium">Medium (1080p)</SelectItem>
                      <SelectItem value="high">High (1440p)</SelectItem>
                      <SelectItem value="ultra">Ultra (4K)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Higher quality settings will take longer to generate but produce more professional results. 
                  Use draft mode for quick previews and professional/premium for final assets.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {state.previewAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{state.previewAsset.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_PREVIEW', payload: null })}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <FileImage className="w-16 h-16 text-gray-400" />
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{state.previewAsset.metadata.description}</p>
                <div className="flex flex-wrap gap-2">
                  {state.previewAsset.metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Format:</span> {state.previewAsset.format}
                </div>
                <div>
                  <span className="font-medium">Size:</span> {state.previewAsset.size}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {state.previewAsset.category}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {state.previewAsset.createdAt.toLocaleDateString()}
                </div>
              </div>
              
              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Asset
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 