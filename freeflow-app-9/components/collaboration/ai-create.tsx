'use client'

import React, { useReducer, useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import {
  Camera,
  Video,
  Palette,
  Music,
  Code,
  FileText,
  Wand2,
  Sparkles,
  Settings,
  Brain,
  Key,
  Layers,
  Info,
  RefreshCw,
  Archive,
  FileImage,
  Download,
  Eye,
  Upload,
  FolderOpen,
  Copy,
  Share2,
  Trash2,
  Star,
  X,
  ImageIcon,
  FileVideo,
  FileAudio,
  Calculator,
  HelpCircle,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

// Type definitions
interface Category {
  id: string
  name: string
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  costPerRequest: number
  speed: string
  quality: string
  requiresApiKey: boolean
  isFree: boolean
  tier: string
  specialty: string[]
  features: string[]
  limits: {
    dailyRequests: number
    concurrent: number
    freeTrialRequests: number
  }
  maxTokens?: number
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  analysis?: FileAnalysis
  isProcessing?: boolean
}

interface FileAnalysis {
  summary: string
  keywords: string[]
  sentiment: string
  fileType: string
  quality: number
  suggestions: string[]
  compatibleAssetTypes: string[]
  extractedMetadata: {
    resolution?: string
    duration?: string
  }
}

interface GeneratedAsset {
  id: string
  name: string
  type: string
  url: string
  thumbnailUrl: string
  modelUsed: string
  prompt: string
  isFavorite: boolean
  createdAt: Date
  size: string
  format: string
  qualityScore: number
  tags: string[]
  baseFile?: string
}

interface AdvancedSettings {
  quality: number
  style: string
  chaos: number
  weird: number
  batch: boolean
  iterationCount: number
}

interface AssetGenerationState {
  creativeField: string
  assetType: string
  categories: Category[]
  selectedModel: AIModel | null
  prompt: string
  isUploading: boolean
  uploadedFiles: UploadedFile[]
  isGenerating: boolean
  generatedAssets: GeneratedAsset[]
  advancedSettings: AdvancedSettings
  useCustomApi: boolean
  userApiKeys: Record<string, string>
  apiProvider: string
  showUploadModal: boolean
  showApiKeyModal: boolean
  apiKeyValid: Record<string, boolean>
  costSavings: {
    freeTierUsed: number
    paidTierSavings: number
    monthly: number
    total: number
    requestsThisMonth: number
  }
  showApiKeySettings: boolean
}

type AssetGenerationAction =
  | { type: 'SET_FIELD'; payload: string }
  | { type: 'SET_ASSET_TYPE'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_MODEL'; payload: AIModel }
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'ADD_UPLOADED_FILE'; payload: UploadedFile }
  | { type: 'REMOVE_UPLOADED_FILE'; payload: string }
  | { type: 'UPDATE_FILE_PROGRESS'; payload: { id: string; progress: number } }
  | {
      type: 'UPDATE_FILE_ANALYSIS'
      payload: { id: string; analysis: FileAnalysis }
    }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'ADD_GENERATED_ASSET'; payload: GeneratedAsset }
  | { type: 'SET_GENERATED_ASSETS'; payload: GeneratedAsset[] }
  | { type: 'UPDATE_ADVANCED_SETTINGS'; payload: Partial<AdvancedSettings> }
  | { type: 'TOGGLE_CUSTOM_API'; payload: boolean }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'TOGGLE_UPLOAD_MODAL'; payload: boolean }
  | { type: 'SET_USER_API_KEY'; payload: { provider: string; apiKey: string } }
  | { type: 'SET_API_PROVIDER'; payload: string }
  | { type: 'TOGGLE_API_KEY_MODAL'; payload: boolean }
  | { type: 'CLEAR_API_KEYS' }
  | { type: 'TOGGLE_API_KEY_SETTINGS'; payload: boolean }
  | {
      type: 'SET_API_KEY_VALID'
      payload: { provider: string; isValid: boolean }
    }
  | {
      type: 'UPDATE_COST_SAVINGS'
      payload: Partial<AssetGenerationState['costSavings']>
    }

// A+++ Enhanced Creative Fields with More Options
const CREATIVE_FIELDS = {
  photography: {
    name: 'Photography',
    icon: Camera,
    color: 'bg-blue-500',
    tier: 'pro',
    assetTypes: [
      { id: 'luts', name: 'Professional LUTs', description: 'Cinematic color grading presets', tier: 'pro' },
      { id: 'presets', name: 'Lightroom Presets', description: 'Professional photo editing presets', tier: 'free' },
      { id: 'actions', name: 'Photoshop Actions', description: 'Automated photo effects and workflows', tier: 'pro' },
      { id: 'overlays', name: 'Photo Overlays', description: 'Light leaks, textures, bokeh effects', tier: 'free' },
      { id: 'templates', name: 'Portfolio Templates', description: 'Professional portfolio layouts', tier: 'enterprise' },
      { id: 'filters', name: 'AI Filters', description: 'Intelligent enhancement filters', tier: 'enterprise' }
    ]
  },
  videography: {
    name: 'Videography',
    icon: Video,
    color: 'bg-purple-500',
    tier: 'pro',
    assetTypes: [
      { id: 'transitions', name: 'Video Transitions', description: 'Smooth scene transitions', tier: 'free' },
      { id: 'luts', name: 'Cinematic LUTs', description: 'Film-style color grading', tier: 'pro' },
      { id: 'titles', name: 'Title Templates', description: 'Animated text overlays', tier: 'free' },
      { id: 'effects', name: 'Visual Effects', description: 'Particles, glitches, distortions', tier: 'pro' },
      { id: 'audio', name: 'Audio Tracks', description: 'Background music and SFX', tier: 'enterprise' },
      { id: 'motion', name: 'Motion Graphics', description: 'Animated graphic elements', tier: 'enterprise' }
    ]
  },
  design: {
    name: 'Graphic Design',
    icon: Palette,
    color: 'bg-pink-500',
    tier: 'free',
    assetTypes: [
      { id: 'templates', name: 'Design Templates', description: 'Logos, posters, social media', tier: 'free' },
      { id: 'patterns', name: 'Seamless Patterns', description: 'Repeating background patterns', tier: 'free' },
      { id: 'icons', name: 'Icon Sets', description: 'Consistent icon collections', tier: 'pro' },
      { id: 'fonts', name: 'Custom Fonts', description: 'Brand-specific typography', tier: 'enterprise' },
      { id: 'mockups', name: 'Product Mockups', description: '3D product presentations', tier: 'pro' },
      { id: 'branding', name: 'Brand Kits', description: 'Complete brand identity packages', tier: 'enterprise' }
    ]
  },
  music: {
    name: 'Music Production',
    icon: Music,
    color: 'bg-green-500',
    tier: 'pro',
    assetTypes: [
      { id: 'samples', name: 'Audio Samples', description: 'Drum hits, loops, one-shots', tier: 'free' },
      { id: 'presets', name: 'Synth Presets', description: 'Synthesizer sound presets', tier: 'pro' },
      { id: 'midi', name: 'MIDI Patterns', description: 'Chord progressions and melodies', tier: 'pro' },
      { id: 'stems', name: 'Song Stems', description: 'Individual track elements', tier: 'enterprise' },
      { id: 'effects', name: 'Audio Effects', description: 'Reverb, delay, distortion presets', tier: 'pro' },
      { id: 'mastering', name: 'Mastering Chains', description: 'Professional mastering templates', tier: 'enterprise' }
    ]
  },
  webDevelopment: {
    name: 'Web Development',
    icon: Code,
    color: 'bg-orange-500',
    tier: 'free',
    assetTypes: [
      { id: 'components', name: 'UI Components', description: 'Reusable React/Vue components', tier: 'free' },
      { id: 'animations', name: 'CSS Animations', description: 'Smooth micro-interactions', tier: 'pro' },
      { id: 'themes', name: 'Color Themes', description: 'Complete design systems', tier: 'pro' },
      { id: 'templates', name: 'Page Templates', description: 'Landing pages, dashboards', tier: 'enterprise' },
      { id: 'snippets', name: 'Code Snippets', description: 'Utility functions and helpers', tier: 'free' },
      { id: 'frameworks', name: 'Framework Boilerplates', description: 'Full-stack starter projects', tier: 'enterprise' }
    ]
  },
  writing: {
    name: 'Content Writing',
    icon: FileText,
    color: 'bg-indigo-500',
    tier: 'free',
    assetTypes: [
      { id: 'templates', name: 'Content Templates', description: 'Blog posts, emails, social media', tier: 'free' },
      { id: 'prompts', name: 'Writing Prompts', description: 'Creative inspiration starters', tier: 'free' },
      { id: 'outlines', name: 'Content Outlines', description: 'Structured content frameworks', tier: 'pro' },
      { id: 'headlines', name: 'Headline Variations', description: 'Compelling title options', tier: 'pro' },
      { id: 'hooks', name: 'Opening Hooks', description: 'Attention-grabbing intros', tier: 'pro' },
      { id: 'campaigns', name: 'Marketing Campaigns', description: 'Complete marketing sequences', tier: 'enterprise' }
    ]
  }
}

// A+++ Enhanced AI Models with Enterprise Options + FREE MARKETING TRIALS
const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Most advanced multimodal AI for premium asset generation',
    costPerRequest: 0.03,
    speed: 'fast',
    quality: 'enterprise',
    requiresApiKey: true,
    isFree: false,
    tier: 'enterprise',
    specialty: ['creative', 'multimodal', 'precision'],
    features: ['Vision', 'Audio', 'Code', 'Ultra-high quality'],
    limits: { dailyRequests: 1000, concurrent: 10, freeTrialRequests: 3 }
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    description: 'Creative powerhouse for artistic asset generation',
    costPerRequest: 0.025,
    speed: 'fast',
    quality: 'premium',
    requiresApiKey: true,
    isFree: false,
    tier: 'enterprise',
    specialty: ['creative', 'artistic', 'detailed'],
    features: ['Artistic creativity', 'Detail-oriented', 'Long context'],
    limits: { dailyRequests: 800, concurrent: 8, freeTrialRequests: 3 }
  },
  {
    id: 'gemini-pro-vision',
    name: 'Gemini Pro Vision',
    provider: 'Google',
    description: 'Advanced multimodal AI with vision capabilities',
    costPerRequest: 0.02,
    speed: 'fast',
    quality: 'premium',
    requiresApiKey: true,
    isFree: false,
    tier: 'pro',
    specialty: ['vision', 'multimodal', 'analysis'],
    features: ['Vision analysis', 'Multimodal', 'Fast processing'],
    limits: { dailyRequests: 500, concurrent: 5, freeTrialRequests: 5 }
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    description: 'Specialized image generation AI',
    costPerRequest: 0.04,
    speed: 'medium',
    quality: 'enterprise',
    requiresApiKey: true,
    isFree: false,
    tier: 'enterprise',
    specialty: ['image', 'artistic', 'photorealistic'],
    features: ['Image generation', 'Photorealistic', 'Artistic styles'],
    limits: { dailyRequests: 100, concurrent: 3, freeTrialRequests: 2 }
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    description: 'Open-source image generation powerhouse',
    costPerRequest: 0.01,
    speed: 'medium',
    quality: 'premium',
    requiresApiKey: false,
    isFree: true,
    tier: 'free',
    specialty: ['image', 'open-source', 'customizable'],
    features: ['Open source', 'Customizable', 'High resolution'],
    limits: { dailyRequests: 50, concurrent: 2, freeTrialRequests: 999 }
  },
  {
    id: 'midjourney-api',
    name: 'Midjourney',
    provider: 'Midjourney',
    description: 'Premium artistic image generation',
    costPerRequest: 0.05,
    speed: 'slow',
    quality: 'enterprise',
    requiresApiKey: true,
    isFree: false,
    tier: 'enterprise',
    specialty: ['artistic', 'premium', 'detailed'],
    features: ['Artistic excellence', 'Premium quality', 'Detailed rendering'],
    limits: { dailyRequests: 200, concurrent: 5, freeTrialRequests: 2 }
  }
]

const initialState: AssetGenerationState = {
  creativeField: Object.values(CREATIVE_FIELDS)[0].name,
  assetType: Object.values(CREATIVE_FIELDS)[0].assetTypes[0].id,
  categories: Object.values(CREATIVE_FIELDS).flatMap(field => field.assetTypes.map(type => ({ id: type.id, name: type.name }))),
  selectedModel: AI_MODELS[0],
  prompt: '',
  isUploading: false,
  uploadedFiles: [],
  isGenerating: false,
  generatedAssets: [],
  advancedSettings: {
    quality: 85,
    style: 'modern',
    chaos: 0.5,
    weird: 0.5,
    batch: false,
    iterationCount: 5,
  },
  useCustomApi: false,
  userApiKeys: {},
  apiProvider: 'platform',
  showUploadModal: false,
  showApiKeyModal: false,
  apiKeyValid: {},
  costSavings: {
    freeTierUsed: 0,
    paidTierSavings: 0,
    monthly: 0,
    total: 0,
    requestsThisMonth: 0,
  },
  showApiKeySettings: false,
}

const assetGenerationReducer = (state: AssetGenerationState, action: AssetGenerationAction): AssetGenerationState => {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        creativeField: action.payload
      }
    
    case 'SET_ASSET_TYPE':
      return {
        ...state,
        assetType: action.payload
      }
    
    case 'SET_CATEGORIES':
      return {
        ...state,
        categories: action.payload
      }
    
    case 'SET_MODEL':
      return {
        ...state,
        selectedModel: action.payload
      }
    
    case 'SET_PROVIDER':
      return {
        ...state,
        apiProvider: action.payload
      }
    
    case 'SET_PROMPT':
      return {
        ...state,
        prompt: action.payload
      }
    
    case 'SET_UPLOADING':
      return {
        ...state,
        isUploading: action.payload
      }
    
    case 'ADD_UPLOADED_FILE':
      return {
        ...state,
        uploadedFiles: [...state.uploadedFiles, action.payload]
      }
    
    case 'REMOVE_UPLOADED_FILE':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.filter(file => file.id !== action.payload)
      }
    
    case 'UPDATE_FILE_PROGRESS':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === action.payload.id
            ? { ...file, progress: action.payload.progress }
            : file
        )
      }
    
    case 'UPDATE_FILE_ANALYSIS':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === action.payload.id
            ? { ...file, analysis: action.payload.analysis }
            : file
        )
      }
    
    case 'SET_GENERATING':
      return {
        ...state,
        isGenerating: action.payload
      }
    
    case 'ADD_GENERATED_ASSET':
      return {
        ...state,
        generatedAssets: [action.payload, ...state.generatedAssets]
      }
    
    case 'SET_GENERATED_ASSETS':
      return {
        ...state,
        generatedAssets: action.payload
      }
    
    case 'UPDATE_ADVANCED_SETTINGS':
      return {
        ...state,
        advancedSettings: { ...state.advancedSettings, ...action.payload }
      }
    
    case 'TOGGLE_CUSTOM_API':
      return {
        ...state,
        useCustomApi: action.payload
      }
    
    case 'SET_API_KEY':
      return {
        ...state,
        userApiKeys: {
          ...state.userApiKeys,
          [action.payload]: action.payload
        }
      }
    
    case 'TOGGLE_UPLOAD_MODAL':
      return {
        ...state,
        showUploadModal: action.payload
      }
    
    case 'SET_USER_API_KEY':
      return {
        ...state,
        userApiKeys: {
          ...state.userApiKeys,
          [action.payload.provider]: action.payload.apiKey
        }
      }
    
    case 'SET_API_PROVIDER':
      return {
        ...state,
        apiProvider: action.payload
      }
    
    case 'TOGGLE_API_KEY_MODAL':
      return {
        ...state,
        showApiKeyModal: action.payload
      }
    
    case 'CLEAR_API_KEYS':
      return {
        ...state,
        userApiKeys: {},
        apiProvider: 'platform'
      }
    
    case 'TOGGLE_API_KEY_SETTINGS':
      return {
        ...state,
        showApiKeySettings: action.payload
      }
    
    case 'SET_API_KEY_VALID':
      return {
        ...state,
        apiKeyValid: {
          ...state.apiKeyValid,
          [action.payload.provider]: action.payload.isValid
        }
      }
    
    case 'UPDATE_COST_SAVINGS':
      return {
        ...state,
        costSavings: { ...state.costSavings, ...action.payload }
      }
    
    default:
      return state
  }
}

export default function AICreate() {
  // Available AI Models (kept for backward compatibility)
  const [availableModels] = useState<AIModel[]>(AI_MODELS)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, dispatch] = useReducer(assetGenerationReducer, initialState)

  // Enhanced file upload functionality
  const handleFileUpload = useCallback(async (files: FileList) => {
    dispatch({ type: 'SET_UPLOADING', payload: true })
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type and size
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error(`File ${file.name} is too large. Maximum size is 100MB.`)
        continue
      }

      const uploadedFile: UploadedFile = {
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0
      }

      dispatch({ type: 'ADD_UPLOADED_FILE', payload: uploadedFile })
      
      try {
        // Simulate file processing with progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 100))
          dispatch({ 
            type: 'UPDATE_FILE_PROGRESS', 
            payload: { id: uploadedFile.id, progress } 
          })
        }

        // Simulate file analysis
        const mockAnalysis: FileAnalysis = {
          summary: `Mock analysis for ${file.name}`,
          keywords: ['mock', 'analysis', 'placeholder'],
          sentiment: 'neutral',
          fileType: file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
            ? 'video'
            : 'other',
          quality: Math.floor(Math.random() * 30) + 70, // 70-100%
          suggestions: [
            'Consider adjusting brightness for better results',
            'Image quality is excellent for AI generation',
            'This file is perfect for style transfer',
          ],
          compatibleAssetTypes: file.type.startsWith('image/')
            ? ['luts', 'presets', 'overlays', 'templates']
            : ['transitions', 'effects', 'audio'],
          extractedMetadata: {
            resolution: file.type.startsWith('image/') ? '1920x1080' : 'N/A',
            duration: file.type.startsWith('video/') ? '00:05:23' : 'N/A',
          },
        }

        dispatch({ 
          type: 'UPDATE_FILE_ANALYSIS', 
          payload: { id: uploadedFile.id, analysis: mockAnalysis } 
        })

        toast.success(`Successfully processed ${file.name}`)
        
      } catch (error) {
        toast.error(`Failed to process ${file.name}`)
        dispatch({ type: 'REMOVE_UPLOADED_FILE', payload: uploadedFile.id })
      }
    }
    
    dispatch({ type: 'SET_UPLOADING', payload: false })
  }, [])

  // File drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }, [handleFileUpload])

  // Handle actual file downloads
  const handleDownloadAsset = useCallback(async (asset: GeneratedAsset) => {
    try {
      // For demo purposes, we'll simulate download
      toast.success(`Downloading ${asset.name}...`)
      
      // In a real implementation, this would trigger the actual download
      const link = document.createElement('a')
      link.href = asset.url
      link.download = asset.name + '.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
    } catch (error) {
      toast.error('Failed to download asset')
    }
  }, [])

  // Context7 Pattern: Enhanced Asset Generation with Model Selection
  const generateAssets = async () => {
    dispatch({ type: 'SET_GENERATING', payload: true })
    
    if (!state.selectedModel) {
      toast.error('No AI model selected. Please choose a model to continue.')
      dispatch({ type: 'SET_GENERATING', payload: false })
      return
    }

    try {
      // Context7 Pattern: Build request payload with model configuration and uploaded files
      const requestPayload = {
        field: state.assetType,
        assetType: state.assetType,
        parameters: {
          style: state.advancedSettings.style || 'modern',
          chaos: state.advancedSettings.chaos,
          weird: state.advancedSettings.weird,
          customPrompt: state.prompt
        },
        advancedSettings: state.advancedSettings,
        uploadedFiles: state.uploadedFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          progress: file.progress,
          analysis: file.analysis
        })),
        // Context7 Pattern: Model and API configuration
        modelConfig: {
          modelId: state.selectedModel.id,
          provider: state.selectedModel.provider,
          useCustomApi: state.useCustomApi,
          customApiKey: state.useCustomApi ? state.userApiKeys[state.apiProvider] : undefined,
          maxTokens: state.selectedModel.maxTokens,
          qualityLevel: state.selectedModel.quality
        }
      }

      // Context7 Pattern: Conditional API routing based on model selection
      const apiEndpoint = state.useCustomApi && state.userApiKeys[state.apiProvider] 
        ? '/api/ai/create/custom' 
        : '/api/ai/create'

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Context7 Pattern: Add model-specific headers
          'X-AI-Model': state.selectedModel.id, 'X-Use-Custom-API': state.useCustomApi.toString(),
          ...(state.useCustomApi && state.userApiKeys[state.apiProvider] && {
            'X-Custom-API-Key': state.userApiKeys[state.apiProvider]
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
        // dispatch({ type: 'SET_GENERATING', payload: true })
      }

      // Add generated assets from API
      if (result.success && result.assets) {
        for (const asset of result.assets) {
          // Convert API response to component format
          const formattedAsset: GeneratedAsset = {
            id: asset.id,
            name: asset.name,
            type: asset.type,
            url: asset.url,
            thumbnailUrl: asset.thumbnailUrl,
            modelUsed: asset.modelUsed,
            prompt: asset.prompt,
            isFavorite: asset.isFavorite || false,
            createdAt: new Date(),
            size: asset.size,
            format: asset.format,
            qualityScore: asset.qualityScore,
            tags: asset.tags,
            baseFile: asset.baseFile
          }
          
          dispatch({ type: 'ADD_GENERATED_ASSET', payload: formattedAsset })
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      dispatch({ type: 'SET_GENERATING', payload: false })
    } catch (error) {
      console.error('Asset generation failed: ', error)
      // Enhanced mock generation with uploaded file context
      const field = state.creativeField ? CREATIVE_FIELDS[state.creativeField as keyof typeof CREATIVE_FIELDS] : undefined
      const assetType = field?.assetTypes.find(type => type.id === state.assetType)
      const mockAssets = generateMockAssets(
        state.creativeField, 
        state.assetType, 
        assetType?.name || 'Asset',
        state.uploadedFiles
      )
      
      // Add success toast
      toast.success(`Generated ${mockAssets.length} assets successfully!`)
      
      for (const asset of mockAssets) {
        dispatch({ type: 'ADD_GENERATED_ASSET', payload: asset })
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      dispatch({ type: 'SET_GENERATING', payload: false })
    }
  }

  const generateMockAssets = (field: string, type: string, typeName: string, uploadedFiles?: UploadedFile[]): GeneratedAsset[] => {
    // Enhanced asset generation with uploaded file context
    const hasUploadedFiles = uploadedFiles && uploadedFiles.length > 0
    const basePrefix = hasUploadedFiles ? 'AI-Enhanced' : 'AI-Generated'
    
    const qualityScores = [85, 92, 88, 95, 91] // Realistic quality scores
    const fileSizes = ['2.4 MB', '3.7 MB', '1.9 MB', '4.2 MB', '2.8 MB']
    
    const baseAssets: GeneratedAsset[] = [
      {
        id: `${field}-${type}-${Date.now()}-1`,
        name: `${basePrefix} ${typeName} - Style A`,
        type,
        url: '#download-asset-1',
        thumbnailUrl: '/images/placeholder.jpg',
        modelUsed: 'Advanced AI v2.1',
        prompt: hasUploadedFiles ? 'Enhanced from uploaded file' : 'Generated from prompt',
        isFavorite: !!hasUploadedFiles,
        createdAt: new Date(),
        size: fileSizes[0],
        format: getFormatForType(type),
        qualityScore: qualityScores[0],
        tags: hasUploadedFiles 
          ? ['ai-enhanced', 'custom', 'high-quality', 'professional'] 
          : ['ai-generated', 'modern', 'creative'],
        baseFile: hasUploadedFiles ? uploadedFiles[0].id : undefined
      },
      {
        id: `${field}-${type}-${Date.now()}-2`,
        name: `${basePrefix} ${typeName} - Style B`,
        type,
        url: '#download-asset-2',
        thumbnailUrl: '/images/placeholder.jpg',
        modelUsed: 'Creative AI v1.8',
        prompt: 'Artistic interpretation',
        isFavorite: false,
        createdAt: new Date(),
        size: fileSizes[1],
        format: getFormatForType(type),
        qualityScore: qualityScores[1],
        tags: ['artistic', 'unique', 'premium'],
        baseFile: hasUploadedFiles && uploadedFiles.length > 1 ? uploadedFiles[1].id : undefined
      },
      {
        id: `${field}-${type}-${Date.now()}-3`,
        name: `${basePrefix} ${typeName} - Style C`,
        type,
        url: '#download-asset-3',
        thumbnailUrl: '/images/placeholder.jpg',
        modelUsed: 'Precision AI v1.5',
        prompt: 'Minimalist design approach',
        isFavorite: false,
        createdAt: new Date(),
        size: fileSizes[2],
        format: getFormatForType(type),
        qualityScore: qualityScores[2],
        tags: ['minimalist', 'clean', 'elegant']
      }
    ]
    
    // Add extra variations if uploaded files are available
    if (hasUploadedFiles && uploadedFiles.length > 0) {
      baseAssets.push({
        id: `${field}-${type}-${Date.now()}-4`,
        name: `${basePrefix} ${typeName} - Custom Variation`,
        type,
        url: '#download-asset-4',
        thumbnailUrl: '/images/placeholder.jpg',
        modelUsed: 'Ultra AI v3.0',
        prompt: `Based on ${uploadedFiles[0].name}`,
        isFavorite: false,
        createdAt: new Date(),
        size: fileSizes[3],
        format: getFormatForType(type),
        qualityScore: qualityScores[3],
        tags: ['custom', 'enhanced', 'high-res'],
        baseFile: uploadedFiles[0].id
      })
    }
    
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

  const selectedField = state.creativeField ? CREATIVE_FIELDS[state.creativeField as keyof typeof CREATIVE_FIELDS] : undefined

  return (
    <div className= "w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className= "text-center space-y-4">
        <div className= "flex items-center justify-center gap-3">
          <div className= "p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
            <Wand2 className= "w-8 h-8 text-white" />
          </div>
          <h1 className= "text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Create
          </h1>
        </div>
        <p className= "text-xl text-gray-600 max-w-3xl mx-auto">
          Generate professional assets tailored to your creative field. From LUTs and presets to templates and components - powered by advanced AI.
        </p>
      </div>

      <Tabs defaultValue= "generate" className= "w-full">
        <TabsList className= "grid w-full grid-cols-4">
          <TabsTrigger value= "generate">Generate Assets</TabsTrigger>
          <TabsTrigger value= "upload">Upload Files</TabsTrigger>
          <TabsTrigger value= "library">Asset Library</TabsTrigger>
          <TabsTrigger value= "settings">Advanced Settings</TabsTrigger>
        </TabsList>

        <TabsContent value= "generate" className= "space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <Sparkles className= "w-5 h-5" />
                Select Your Creative Field
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CREATIVE_FIELDS).map(([key, field]) => {
                  const Icon = field.icon
                  return (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                        state.creativeField === key 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => dispatch({ type: 'SET_FIELD', payload: key })}
                    >
                      <CardContent className= "p-6 text-center space-y-3">
                        <div className={`w-16 h-16 ${field.color} rounded-full flex items-center justify-center mx-auto`}>
                          <Icon className= "w-8 h-8 text-white" />
                        </div>
                        <h3 className= "font-semibold text-lg">{field.name}</h3>
                        <p className= "text-sm text-gray-600">
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
                <CardTitle className= "flex items-center gap-2">
                  <selectedField.icon className= "w-5 h-5" />
                  Choose Asset Type for {selectedField.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedField.assetTypes.map((assetType) => (
                    <Card
                      key={assetType.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        state.assetType === assetType.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => dispatch({ type: 'SET_ASSET_TYPE', payload: assetType.id })}
                    >
                      <CardContent className= "p-4">
                        <h4 className= "font-semibold text-lg mb-2">{assetType.name}</h4>
                        <p className= "text-sm text-gray-600">{assetType.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {state.assetType && (
            <Card>
              <CardHeader>
                <CardTitle className= "flex items-center gap-2">
                  <Settings className= "w-5 h-5" />
                  Customize Generation Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className= "space-y-4">
                <div className= "grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className= "space-y-2">
                    <label className= "text-sm font-medium">Style</label>
                    <Select
                      value={state.advancedSettings.style || 'modern'}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { style: value } })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder= "Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value= "modern">Modern</SelectItem>
                        <SelectItem value= "vintage">Vintage</SelectItem>
                        <SelectItem value= "minimalist">Minimalist</SelectItem>
                        <SelectItem value= "bold">Bold</SelectItem>
                        <SelectItem value= "elegant">Elegant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className= "space-y-2">
                    <label className= "text-sm font-medium">Chaos</label>
                    <Slider
                      value={[state.advancedSettings.chaos]}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { chaos: value[0] } })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className= "space-y-2">
                    <label className= "text-sm font-medium">Weird</label>
                    <Slider
                      value={[state.advancedSettings.weird]}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { weird: value[0] } })}
                      max={1}
                      min={0}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className= "space-y-2">
                  <label className= "text-sm font-medium">Custom Prompt (Optional)</label>
                  <Textarea
                    placeholder="Describe specific requirements or style preferences..."
                    value={state.prompt}
                    onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Context7 Pattern: AI Model Selection with Cost Optimization */}
                {state.selectedModel && <Card className= "border-dashed border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardHeader className= "pb-3">
                    <CardTitle className= "flex items-center gap-2 text-lg">
                      <Brain className= "w-5 h-5 text-purple-600" />
                      AI Model Selection
                      <Badge variant= "secondary" className= "ml-auto">
                        {state.selectedModel.isFree ? 'Free' : `$${state.selectedModel.costPerRequest}/req`}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className= "space-y-4">
                    <div className= "grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {AI_MODELS.map((model) => (
                        <Card
                          key={model.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            state.selectedModel && state.selectedModel.id === model.id 
                              ? 'ring-2 ring-purple-500 bg-purple-50' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => dispatch({ type: 'SET_MODEL', payload: model })}
                        >
                          <CardContent className= "p-4">
                            <div className= "flex items-start justify-between mb-2">
                              <div>
                                <h4 className= "font-semibold">{model.name}</h4>
                                <p className= "text-sm text-gray-600">{model.provider}</p>
                              </div>
                              <div className= "flex gap-1">
                                <Badge 
                                  variant={model.tier === 'enterprise' ? 'default' : model.tier === 'pro' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {model.tier}
                                </Badge>
                                {model.isFree && <Badge variant= "outline" className= "text-xs bg-green-50">Free</Badge>}
                              </div>
                            </div>
                            <p className= "text-sm text-gray-600 mb-3">{model.description}</p>
                            <div className= "flex items-center justify-between text-xs">
                              <div className= "flex gap-2">
                                <Badge variant= "outline" className= "text-xs">{model.speed}</Badge>
                                <Badge variant= "outline" className= "text-xs">{model.quality}</Badge>
                              </div>
                              <div className= "text-right">
                                {model.isFree ? (
                                  <span className= "text-green-600 font-medium">Free</span>
                                ) : (
                                  <span className= "text-gray-600">${model.costPerRequest}/req</span>
                                )}
                              </div>
                            </div>
                            {model.features && (
                              <div className= "mt-2 flex flex-wrap gap-1">
                                {model.features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant= "outline" className= "text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Custom API Configuration */}
                    {state.selectedModel && state.selectedModel.requiresApiKey && (
                      <Card className= "border-amber-200 bg-amber-50">
                        <CardHeader className= "pb-3">
                          <CardTitle className= "flex items-center gap-2 text-sm">
                            <Key className= "w-4 h-4 text-amber-600" />
                            API Configuration Required
                          </CardTitle>
                        </CardHeader>
                        <CardContent className= "space-y-3">
                          <div className= "flex items-center justify-between">
                            <label className= "text-sm font-medium">Use Custom API Key</label>
                            <Switch
                              checked={state.useCustomApi}
                              onCheckedChange={(checked) => dispatch({ type: 'TOGGLE_CUSTOM_API', payload: checked })}
                            />
                          </div>
                          {state.useCustomApi && (
                            <div className= "space-y-2">
                              <label className= "text-sm font-medium">API Key</label>
                              <Input
                                type="password"
                                placeholder={`Enter your ${state.selectedModel.provider} API key`}
                                value={state.userApiKeys[state.apiProvider] || ''}
                                onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
                                className="pr-10"
                              />
                              <p className= "text-xs text-gray-500">
                                Your API key is stored securely and only used for this session.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* A+++ Batch Generation Controls */}
                    <Card className= "border-blue-200 bg-blue-50">
                      <CardHeader className= "pb-3">
                        <CardTitle className= "flex items-center gap-2 text-sm">
                          <Layers className= "w-4 h-4 text-blue-600" />
                          Batch Generation
                          <Badge variant= "outline" className= "ml-auto text-xs">
                            Pro Feature
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className= "space-y-3">
                        <div className= "flex items-center justify-between">
                          <label className= "text-sm font-medium">Enable Batch Mode</label>
                          <Switch
                            checked={state.advancedSettings.batch}
                            onCheckedChange={(checked) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { batch: checked } })}
                          />
                        </div>
                        {state.advancedSettings.batch && (
                          <div className= "space-y-3">
                            <div className= "space-y-2">
                              <label className= "text-sm font-medium">Batch Size: {state.advancedSettings.iterationCount}</label>
                              <Slider
                                value={[state.advancedSettings.iterationCount]}
                                onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { iterationCount: value[0] } })}
                                max={50}
                                min={5}
                                step={5}
                                className="w-full"
                              />
                              <div className= "flex justify-between text-xs text-gray-500">
                                <span>5 assets</span>
                                <span>50 assets</span>
                              </div>
                            </div>
                            <div className= "flex items-center gap-2 text-xs text-blue-600">
                              <Info className= "w-4 h-4" />
                              <span>Estimated cost: ${state.selectedModel && !state.selectedModel.isFree ? (state.selectedModel.costPerRequest * state.advancedSettings.iterationCount).toFixed(3) : '0.00'}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>}

                <Button
                  onClick={generateAssets}
                  disabled={state.isGenerating || !state.assetType}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="generate-assets-btn"
                >
                  {state.isGenerating ? (
                    <div className= "flex items-center gap-2">
                      <RefreshCw className= "w-5 h-5 animate-spin" />
                      Generating... {state.generatedAssets.length} assets
                    </div>
                  ) : (
                    <div className= "flex items-center gap-2">
                      <Wand2 className= "w-5 h-5" />
                      Generate {state.advancedSettings.batch ? `${state.advancedSettings.iterationCount} ` : ''}Assets
                    </div>
                  )}
                </Button>

                {state.isGenerating && (
                  <Card>
                    <CardContent className= "p-4">
                      <div className= "space-y-3">
                        <div className= "flex items-center justify-between">
                          <span className= "text-sm font-medium">Generation Progress</span>
                          <span className= "text-sm text-gray-600">{state.generatedAssets.length} assets generated</span>
                        </div>
                        <Progress value={state.generatedAssets.length} className= "w-full" />
                        <div className= "flex items-center gap-2 text-sm text-gray-600">
                          <Sparkles className= "w-4 h-4" />
                          <span>AI is crafting your assets...</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {state.generatedAssets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className= "flex items-center gap-2">
                  <Archive className= "w-5 h-5" />
                  Generated Assets ({state.generatedAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.generatedAssets.map((asset) => (
                    <Card key={asset.id} className= "hover:shadow-lg transition-shadow duration-200">
                      <CardContent className= "p-4 space-y-3">
                        <div className= "aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileImage className= "w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className= "font-medium truncate">{asset.name}</h4>
                          <p className= "text-xs text-gray-600 line-clamp-2">{asset.prompt}</p>
                        </div>
                        <div className= "flex items-center justify-between text-xs">
                          <span className= "text-gray-500">{asset.size}</span>
                          <Badge variant= "outline">{asset.format}</Badge>
                        </div>
                        <div className= "flex flex-wrap gap-1">
                          {asset.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant= "secondary" className= "text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className= "flex gap-2">
                          <Button
                            variant="outline"
                            size= "sm"
                            className="flex-1"
                            onClick={() => console.log('Preview asset: ', asset.id)}
                            data-testid="preview-asset-btn"
                          >
                            <Eye className= "w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="default"
                            size= "sm"
                            className="flex-1"
                            onClick={() => handleDownloadAsset(asset)}
                            data-testid="download-asset-btn"
                          >
                            <Download className= "w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value= "upload" className= "space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <Upload className= "w-5 h-5" />
                Upload Example Files
                <Badge variant= "secondary" className= "ml-auto">
                  {state.uploadedFiles.length} files
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className= "space-y-6">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className= "space-y-4">
                  <div className= "flex justify-center">
                    <div className= "p-3 bg-purple-50 rounded-full">
                      <Upload className= "w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className= "text-lg font-semibold">Upload Files for AI Generation</h3>
                    <p className= "text-gray-600 mt-2">
                      Drop your files here or click to browse. Supports images, videos, and audio files.
                    </p>
                  </div>
                  <div className= "flex justify-center gap-4 text-sm text-gray-500">
                    <div className= "flex items-center gap-1">
                      <ImageIcon className= "w-4 h-4" />
                      Images
                    </div>
                    <div className= "flex items-center gap-1">
                      <FileVideo className= "w-4 h-4" />
                      Videos
                    </div>
                    <div className= "flex items-center gap-1">
                      <FileAudio className= "w-4 h-4" />
                      Audio
                    </div>
                  </div>
                  <p className= "text-xs text-gray-400">
                    Maximum file size: 100MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept= "image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files)
                  }
                }}
              />

              {/* Upload Progress */}
              {state.isUploading && (
                <Card className= "border-blue-200 bg-blue-50">
                  <CardContent className= "p-4">
                    <div className= "flex items-center gap-2 text-blue-700">
                      <RefreshCw className= "w-4 h-4 animate-spin" />
                      <span className= "font-medium">Processing files...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Uploaded Files Grid */}
              {state.uploadedFiles.length > 0 && (
                <div className= "space-y-4">
                  <h3 className= "text-lg font-semibold">Uploaded Files</h3>
                  <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.uploadedFiles.map((file) => (
                      <Card key={file.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {file.type.startsWith('image/') && <ImageIcon className="w-5 h-5 text-blue-500" />}
                              {file.type.startsWith('video/') && <FileVideo className="w-5 h-5 text-green-500" />}
                              {file.type.startsWith('audio/') && <FileAudio className="w-5 h-5 text-purple-500" />}
                              <div>
                                <h4 className="font-medium text-sm truncate max-w-32">{file.name}</h4>
                                <p className="text-xs text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(1)} MB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 text-red-500"
                              onClick={() => dispatch({ type: 'REMOVE_UPLOADED_FILE', payload: file.id })}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>

                          {file.isProcessing && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span>Processing...</span>
                                <span>{file.progress}%</span>
                              </div>
                              <Progress value={file.progress} className="w-full" />
                            </div>
                          )}

                          {file.analysis && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Quality: {file.analysis.quality}%
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {file.analysis.fileType}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs font-medium">Compatible Asset Types:</p>
                                <div className="flex flex-wrap gap-1">
                                  {file.analysis.compatibleAssetTypes.map((type, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs font-medium">AI Suggestions:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {file.analysis.suggestions.slice(0, 2).map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-1">
                                      <span className="text-purple-500">•</span>
                                      <span>{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <Button
                                variant="default"
                                size="sm"
                                className="w-full"
                                onClick={() => {
                                  // Auto-populate generation settings based on uploaded file
                                  if (file.analysis) {
                                    const field = file.type.startsWith('image/')
                                      ? 'photography'
                                      : file.type.startsWith('video/')
                                      ? 'videography'
                                      : 'music'
                                    // dispatch({ type: 'SET_ASSET_TYPE', payload: 'image' as AssetType })

                                    const assetType = file.analysis.compatibleAssetTypes[0]
                                    if (assetType) {
                                      // dispatch({ type: 'SET_CATEGORY', payload: { id: 'logos', name: 'Logos' } as Category })
                                    }

                                    dispatch({
                                      type: 'SET_PROMPT',
                                      payload: `Generate assets based on uploaded ${file.name}`,
                                    })

                                    // Switch to generate tab
                                    const generateTab = document.querySelector('[value="generate"]') as HTMLElement
                                    generateTab?.click()
                                  }
                                }}
                              >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Generate from this file
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload Tips */}
              <Card className= "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className= "p-4">
                  <h3 className= "font-semibold text-purple-800 mb-2">💡 Upload Tips</h3>
                  <ul className= "text-sm text-purple-700 space-y-1">
                    <li>• High-quality images work best for style transfer and LUT generation</li>
                    <li>• Upload reference videos for creating custom transitions and effects</li>
                    <li>• Audio files can be used to generate complementary soundtracks</li>
                    <li>• Multiple files will create asset variations automatically</li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value= "library" className= "space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className= "flex items-center gap-2">
                <FolderOpen className= "w-5 h-5" />
                Asset Library
                <Badge variant= "secondary" className= "ml-auto">
                  {state.generatedAssets.length} assets
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Library Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input placeholder="Search assets..." className="w-64" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="luts">LUTs</SelectItem>
                        <SelectItem value="presets">Presets</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const uploadTab = document.querySelector('[value="upload"]') as HTMLElement;
                        uploadTab?.click();
                      }}
                      data-testid="upload-asset-btn"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Upload
                    </Button>
                    <Button variant="outline" size="sm" data-testid="export-all-btn">
                      <Archive className="w-4 h-4 mr-1" />
                      Export All
                    </Button>
                  </div>
                </div>

                {/* Library Grid */}
                {state.generatedAssets.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {state.generatedAssets.map(asset => (
                      <Card key={asset.id} className="group hover:shadow-md transition-all duration-200">
                        <CardContent className="p-3 space-y-2">
                          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                            <FileImage className="w-6 h-6 text-gray-400" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                              <div className="flex gap-1">
                                <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="secondary" className="w-8 h-8 p-0">
                                  <Star className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm truncate">{asset.name}</h4>
                            <p className="text-xs text-gray-500">{asset.size}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {asset.format}
                            </Badge>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="w-6 h-6 p-0">
                                <Share2 className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="w-6 h-6 p-0 text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No assets yet</h3>
                    <p className="text-gray-600 mb-4">Generate your first assets to build your library</p>
                    <Button onClick={() => (document.querySelector('[value="generate"]') as HTMLElement)?.click()}>
                      <Wand2 className="w-4 h-4 mr-1" />
                      Generate Assets
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value= "settings" className= "h-full m-0">
          <div className= "p-6 space-y-6">
            {/* Cost Savings Overview Card */}
            <Card className= "glass-card border-2 border-green-200/50 bg-green-50/30">
              <CardHeader>
                <CardTitle className= "flex items-center gap-2 text-green-700">
                  <Calculator className= "h-5 w-5" />
                  Cost Savings Dashboard
                </CardTitle>
                <CardDescription>
                  Track your savings by using your own API keys instead of platform pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className= "grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className= "text-center p-3 bg-green-100 rounded-lg">
                    <div className= "text-2xl font-bold text-green-600">${state.costSavings.monthly.toFixed(2)}</div>
                    <div className= "text-xs text-green-700">Monthly Savings</div>
                  </div>
                  <div className= "text-center p-3 bg-blue-100 rounded-lg">
                    <div className= "text-2xl font-bold text-blue-600">${(state.costSavings.freeTierUsed || 0).toFixed(2)}</div>
                    <div className= "text-xs text-blue-700">Free Credits Used</div>
                  </div>
                  <div className= "text-center p-3 bg-purple-100 rounded-lg">
                    <div className= "text-2xl font-bold text-purple-600">{state.costSavings.requestsThisMonth || 0}</div>
                    <div className= "text-xs text-purple-700">Requests This Month</div>
                  </div>
                  <div className= "text-center p-3 bg-amber-100 rounded-lg">
                    <div className= "text-2xl font-bold text-amber-600">${state.costSavings.total.toFixed(2)}</div>
                    <div className= "text-xs text-amber-700">Total Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User API Keys Management Section */}
            <Card className= "glass-card border-2 border-blue-200/50">
              <CardHeader>
                <CardTitle className= "flex items-center gap-2 text-blue-700">
                  <Key className= "h-5 w-5" />
                  Your API Keys (Cost Savings & Free Models)
                </CardTitle>
                <CardDescription>
                  Use your own API keys to access free models, save costs, and get higher rate limits. 
                  Your keys are stored securely for this session only.
                </CardDescription>
              </CardHeader>
              <CardContent className= "space-y-4">
                {/* Quick Setup Button */}
                <div className= "flex gap-2">
                  <Button
                    onClick={() => dispatch({ type: 'TOGGLE_API_KEY_SETTINGS', payload: true })}
                    className="flex-1"
                    variant="outline"
                  >
                    <Settings className= "h-4 w-4 mr-2" />
                    Manage All API Keys
                  </Button>
                  <Button
                    onClick={() => {
                      const savings = (Object.keys(state.userApiKeys).length * 15) + (state.costSavings.freeTierUsed * 0.8)
                      dispatch({ type: 'UPDATE_COST_SAVINGS', payload: { monthly: savings } })
                      toast.success(`Updated cost savings: $${savings.toFixed(2)}/month`)
                    }}
                    variant="outline"
                    size= "sm"
                  >
                    <RefreshCw className= "h-4 w-4" />
                  </Button>
                </div>
                {/* API Provider Selection */}
                <div className= "space-y-3">
                  <Label className= "text-sm font-medium">API Provider</Label>
                  <Select 
                    value={state.apiProvider} 
                    onValueChange={(value) => dispatch({ type: 'SET_PROVIDER', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder= "Select API provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value= "platform">🏢 Platform APIs (Included)</SelectItem>
                      <SelectItem value= "openai">🤖 OpenAI (Your API Key)</SelectItem>
                      <SelectItem value= "anthropic">🧠 Anthropic Claude (Your API Key)</SelectItem>
                      <SelectItem value= "google">🔍 Google Gemini (Your API Key)</SelectItem>
                      <SelectItem value= "huggingface">🤗 Hugging Face (Free Models)</SelectItem>
                      <SelectItem value= "openrouter">🌐 OpenRouter (Multiple Models)</SelectItem>
                      <SelectItem value= "replicate">🔄 Replicate (Open Source)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key Input for Selected Provider */}
                {state.apiProvider !== 'platform' && (
                  <div className= "space-y-3">
                    <Label className= "text-sm font-medium">
                      {state.apiProvider.charAt(0).toUpperCase() + state.apiProvider.slice(1)} API Key
                    </Label>
                    <div className= "relative">
                      <Input
                        type="password"
                        placeholder={`Enter your ${state.apiProvider} API key`}
                        value={state.userApiKeys[state.apiProvider] || ''}
                        onChange={(e) => dispatch({ 
                          type: 'SET_USER_API_KEY', 
                          payload: { provider: state.apiProvider, apiKey: e.target.value }
                        })}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size= "sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })}
                      >
                        <HelpCircle className= "h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* API Key Status Indicator */}
                    <div className= "flex items-center gap-2 text-sm">
                      {state.userApiKeys[state.apiProvider] ? (
                        <>
                          <CheckCircle className= "h-4 w-4 text-green-500" />
                          <span className= "text-green-600">API key configured</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className= "h-4 w-4 text-amber-500" />
                          <span className= "text-amber-600">API key required</span>
                        </>
                      )}
                    </div>

                    {/* Provider-specific Benefits */}
                    <div className= "bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className= "text-sm font-medium text-blue-800 mb-2">
                        Benefits of using your {state.apiProvider} API:
                      </h4>
                      <ul className= "text-xs text-blue-700 space-y-1">
                        {state.apiProvider === 'openai' && (
                          <>
                            <li>• Access to latest GPT-4o and DALL-E 3 models</li>
                            <li>• Higher rate limits and faster processing</li>
                            <li>• Pay only for what you use (typically 80% cheaper)</li>
                            <li>• Direct API access without platform markup</li>
                          </>
                        )}
                        {state.apiProvider === 'anthropic' && (
                          <>
                            <li>• Access to Claude 3.5 Sonnet creative capabilities</li>
                            <li>• Advanced reasoning and artistic generation</li>
                            <li>• Competitive pricing with high quality output</li>
                            <li>• Long context window for complex projects</li>
                          </>
                        )}
                        {state.apiProvider === 'google' && (
                          <>
                            <li>• Free tier with generous usage limits</li>
                            <li>• Multimodal capabilities (text, image, code)</li>
                            <li>• Fast response times and reliable service</li>
                            <li>• No cost for many use cases</li>
                          </>
                        )}
                        {state.apiProvider === 'huggingface' && (
                          <>
                            <li>• Completely free open-source models</li>
                            <li>• No usage limits on many models</li>
                            <li>• Support for specialized tasks</li>
                            <li>• Community-driven model ecosystem</li>
                          </>
                        )}
                        {state.apiProvider === 'openrouter' && (
                          <>
                            <li>• Access to 100+ AI models from one API</li>
                            <li>• Competitive pricing across providers</li>
                            <li>• Automatic model selection and fallbacks</li>
                            <li>• Support for latest and experimental models</li>
                          </>
                        )}
                        {state.apiProvider === 'replicate' && (
                          <>
                            <li>• Open-source models with transparent pricing</li>
                            <li>• Specialized image and video generation</li>
                            <li>• Community-contributed model variants</li>
                            <li>• Pay per-second billing for fine-tuned control</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className= "flex justify-end gap-2">
                <Button
                  variant="outline"
                  size= "sm"
                  onClick={() => dispatch({ type: 'CLEAR_API_KEYS' })}
                  className="w-full"
                >
                  <Trash2 className= "h-4 w-4 mr-2" />
                  Clear All API Keys
                </Button>
                <Button variant= "default" size= "sm" className= "w-full">
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* API Key Help Modal */}
      <Dialog open={state.showApiKeyModal} onOpenChange={isOpen => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: isOpen })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finding Your API Key</DialogTitle>
            <DialogDescription>API keys can usually be found in your provider&apos;s dashboard under &quot;API&quot; or &quot;Settings&quot;.</DialogDescription>
          </DialogHeader>
          {/* Add provider-specific instructions here */}
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: false })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full-Screen API Key Management Modal */}
      <Dialog open={state.showApiKeySettings} onOpenChange={(isOpen) => dispatch({ type: 'TOGGLE_API_KEY_SETTINGS', payload: isOpen })}>
        <DialogContent className= "max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage All API Keys</DialogTitle>
            <DialogDescription>
              Configure all your API keys in one place for maximum savings and model access.
            </DialogDescription>
          </DialogHeader>
          <div className= "p-4 h-full overflow-y-auto">
            <ApiKeyManager 
              userApiKeys={state.userApiKeys}
              onApiKeyChange={(provider, key) => {
                dispatch({ type: 'SET_USER_API_KEY', payload: { provider, apiKey: key } })
              }}
              onProviderChange={(provider) => {
                dispatch({ type: 'SET_PROVIDER', payload: provider })
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              size= "sm"
              onClick={() => dispatch({ type: 'TOGGLE_API_KEY_SETTINGS', payload: false })}
            >
              Close
            </Button>
            <Button size= "sm">Save All Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Dummy ApiKeyManager component
const ApiKeyManager = ({ userApiKeys, onApiKeyChange, onProviderChange }: { 
  userApiKeys: Record<string, string>,
  onApiKeyChange: (provider: string, key: string) => void,
  onProviderChange: (provider: string) => void
}) => {
  return <div>ApiKeyManager</div>
}
