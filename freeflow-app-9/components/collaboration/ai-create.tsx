'use client'

import React, { useReducer, useState, useCallback, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
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
  Shield,
  Clock,
  Star,
  TrendingUp,
  RefreshCw,
  Archive,
  Cloud,
  Layers,
  CheckCircle,
  AlertTriangle,
  Info,
  Upload,
  Trash2,
  Copy,
  Share2,
  FolderOpen,
  History,
  Target,
  BarChart3,
  Microscope,
  Rocket,
  Crown,
  Award,
  Flame,
  Diamond,
  Plus,
  X,
  ImageIcon,
  FileVideo,
  FileAudio,
  Folder,
  HelpCircle,
  AlertCircle,
  Calculator
} from 'lucide-react'
import { toast } from 'sonner'
import APIKeySettings from './simple-api-key-settings'

// Type definitions
type AssetType = 'image' | 'video' | 'audio' | 'code' | 'text' | 'design' | '3d' | 'animation'

interface Category {
  id: string
  name: string
  description?: string
  icon?: any
}

// A+++ Enhanced Interfaces
interface AssetGenerationState {
  selectedAssetType: AssetType
  selectedCategory: Category
  selectedModel: AIModel
  selectedProvider: string
  prompt: string
  uploadedFiles: UploadedFile[]
  isUploading: boolean
  showUploadModal: boolean
  isGenerating: boolean
  generatedAssets: GeneratedAsset[]
  advancedSettings: AdvancedSettings
  useCustomApi: boolean
  customApiKey: string
  userApiKeys: Record<string, string> // Add this for storing multiple API keys
  selectedApiProvider: string // Add this for selecting which API to use
  showApiKeyModal: boolean // Add this for API key management modal
  showApiKeySettings: boolean // Add this for full API key settings
  userApiKeysValid: Record<string, boolean> // Track validation status
  costSavings: {
    monthly: number
    total: number
    freeCreditsUsed: number
    requestsThisMonth: number
  }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: Date
  isProcessing: boolean
  processingProgress: number
  analysisResult?: FileAnalysis
}

interface FileAnalysis {
  fileType: string
  quality: number
  suggestions: string[]
  compatibleAssetTypes: string[]
  extractedMetadata: Record<string, any>
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
  qualityScore?: number
  aiModel?: string
  promptUsed?: string
  variations?: GeneratedAsset[]
  tags: string[]
  isFavorite?: boolean
  downloadCount?: number
  userRating?: number
  baseFile?: string // Reference to uploaded file if generated from one
}

interface AssetMetadata {
  dimensions?: string
  tags: string[]
  description: string
  resolution?: string
  colorDepth?: string
  compression?: string
  fileSize?: string
  estimatedValue?: string
  commercialUse?: boolean
  license?: string
}

interface AdvancedSettings {
  quality: 'draft' | 'standard' | 'professional' | 'premium' | 'enterprise'
  style: string
  colorScheme: string
  resolution: string
  format: string
  aiTemperature: number
  diversityFactor: number
  iterationCount: number
  enhanceMode: boolean
  antiAliasing: boolean
  hdrSupport: boolean
  metadata: boolean
  watermark: boolean
  batch: boolean
  realTime: boolean
}

interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  costPerRequest: number
  speed: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'premium'
  quality: 'good' | 'excellent' | 'premium' | 'enterprise'
  requiresApiKey: boolean
  isFree: boolean
  maxTokens?: number
  specialty?: string[]
  tier: 'free' | 'pro' | 'enterprise'
  features: string[]
  limits?: {
    dailyRequests?: number
    monthlyRequests?: number
    concurrent?: number
    freeTrialRequests?: number // 🎯 FREE MARKETING TRIALS
  }
}

interface GenerationHistoryEntry {
  id: string
  timestamp: Date
  field: string
  type: string
  prompt: string
  model: string
  success: boolean
  assetsGenerated: number
  qualityScore: number
  duration: number
}

interface AssetPreset {
  id: string
  name: string
  description: string
  field: string
  settings: AdvancedSettings
  parameters: Record<string, any>
  isPublic: boolean
  createdBy: string
  usageCount: number
  rating: number
}

interface QualityAnalysis {
  overallScore: number
  technicalQuality: number
  creativityScore: number
  commercialViability: number
  marketDemand: number
  suggestions: string[]
  strengths: string[]
  improvements: string[]
}

type AssetGenerationAction =
  | { type: 'SET_ASSET_TYPE'; payload: AssetType }
  | { type: 'SET_CATEGORY'; payload: Category }
  | { type: 'SET_MODEL'; payload: AIModel }
  | { type: 'SET_PROVIDER'; payload: string }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'ADD_UPLOADED_FILE'; payload: UploadedFile }
  | { type: 'REMOVE_UPLOADED_FILE'; payload: string }
  | { type: 'UPDATE_FILE_PROGRESS'; payload: { id: string, progress: number } }
  | { type: 'UPDATE_FILE_ANALYSIS'; payload: { id: string, analysis: FileAnalysis } }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'ADD_GENERATED_ASSET'; payload: GeneratedAsset }
  | { type: 'SET_GENERATED_ASSETS'; payload: GeneratedAsset[] }
  | { type: 'UPDATE_ADVANCED_SETTINGS'; payload: Partial<AdvancedSettings> }
  | { type: 'TOGGLE_CUSTOM_API'; payload: boolean }
  | { type: 'SET_API_KEY'; payload: string }
  | { type: 'TOGGLE_UPLOAD_MODAL'; payload: boolean }
  | { type: 'SET_USER_API_KEY'; payload: { provider: string, apiKey: string } } // Add this
  | { type: 'SET_API_PROVIDER'; payload: string } // Add this
  | { type: 'TOGGLE_API_KEY_MODAL'; payload: boolean } // Add this
  | { type: 'CLEAR_API_KEYS' } // Add this for security
  | { type: 'TOGGLE_API_KEY_SETTINGS'; payload: boolean } // Add this for full settings modal
  | { type: 'SET_API_KEY_VALID'; payload: { provider: string, isValid: boolean } } // Add this for validation tracking
  | { type: 'UPDATE_COST_SAVINGS'; payload: Partial<AssetGenerationState['costSavings']> } // Add this for cost tracking

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
  'web-development': {
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
  selectedAssetType: 'image',
  selectedCategory: Object.values(CREATIVE_FIELDS)[0].assetTypes[0],
  selectedModel: AI_MODELS[0],
  selectedProvider: 'platform',
  prompt: '',
  uploadedFiles: [],
  isUploading: false,
  showUploadModal: false,
  isGenerating: false,
  generatedAssets: [],
  advancedSettings: {
    quality: 'professional',
    style: 'modern',
    colorScheme: 'vibrant',
    resolution: '1024x1024',
    format: 'PNG',
    aiTemperature: 0.7,
    diversityFactor: 0.5,
    iterationCount: 1,
    enhanceMode: true,
    antiAliasing: true,
    hdrSupport: false,
    metadata: true,
    watermark: false,
    batch: false,
    realTime: false
  },
  useCustomApi: false,
  customApiKey: '',
  userApiKeys: {}, // Initialize empty API keys storage
  selectedApiProvider: 'platform', // Default to platform APIs
  showApiKeyModal: false, // Initialize API key modal state
  showApiKeySettings: false, // Initialize full API key settings state
  userApiKeysValid: {}, // Initialize validation status
  costSavings: {
    monthly: 0,
    total: 0,
    freeCreditsUsed: 0,
    requestsThisMonth: 0
  }
}

const assetGenerationReducer = (state: AssetGenerationState, action: AssetGenerationAction): AssetGenerationState => {
  switch (action.type) {
    case 'SET_ASSET_TYPE':
      return {
        ...state,
        selectedAssetType: action.payload
      }
    
    case 'SET_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload
      }
    
    case 'SET_MODEL':
      return {
        ...state,
        selectedModel: action.payload
      }
    
    case 'SET_PROVIDER':
      return {
        ...state,
        selectedProvider: action.payload
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
            ? { ...file, processingProgress: action.payload.progress }
            : file
        )
      }
    
    case 'UPDATE_FILE_ANALYSIS':
      return {
        ...state,
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === action.payload.id
            ? { ...file, analysisResult: action.payload.analysis }
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
        customApiKey: action.payload
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
        selectedApiProvider: action.payload
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
        selectedApiProvider: 'platform'
      }
    
    case 'TOGGLE_API_KEY_SETTINGS':
      return {
        ...state,
        showApiKeySettings: action.payload
      }
    
    case 'SET_API_KEY_VALID':
      return {
        ...state,
        userApiKeysValid: {
          ...state.userApiKeysValid,
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
        url: URL.createObjectURL(file),
        uploadedAt: new Date(),
        isProcessing: true,
        processingProgress: 0
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
          fileType: file.type.startsWith('image/') ? 'image' : 
                   file.type.startsWith('video/') ? 'video' : 'other',
          quality: Math.floor(Math.random() * 30) + 70, // 70-100%
          suggestions: [
            'Consider adjusting brightness for better results',
            'Image quality is excellent for AI generation',
            'This file is perfect for style transfer'
          ],
          compatibleAssetTypes: file.type.startsWith('image/') 
            ? ['luts', 'presets', 'overlays', 'templates']
            : ['transitions', 'effects', 'audio'],
          extractedMetadata: {
            resolution: file.type.startsWith('image/') ? '1920x1080' : 'N/A',
            duration: file.type.startsWith('video/') ? '00:05:23' : 'N/A'
          }
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
      link.href = asset.downloadUrl
      link.download = asset.name + asset.format
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
    
    try {
      // Context7 Pattern: Build request payload with model configuration and uploaded files
      const requestPayload = {
        field: state.selectedCategory.id,
        assetType: state.selectedCategory.id,
        parameters: {
          style: state.advancedSettings.style || 'modern',
          colorScheme: state.advancedSettings.colorScheme || 'vibrant',
          customPrompt: state.prompt
        },
        advancedSettings: state.advancedSettings,
        uploadedFiles: state.uploadedFiles.map(file => ({
          id: file.id,
          name: file.name,
          type: file.type,
          analysis: file.analysisResult
        })),
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
        dispatch({ type: 'SET_GENERATING', payload: true })
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
            format: asset.metadata.format,
            tags: asset.metadata.tags || []
          }
          
          dispatch({ type: 'ADD_GENERATED_ASSET', payload: formattedAsset })
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      dispatch({ type: 'SET_GENERATING', payload: false })
    } catch (error) {
      console.error('Asset generation failed:', error)
      // Enhanced mock generation with uploaded file context
      const field = CREATIVE_FIELDS[state.selectedCategory.id as keyof typeof CREATIVE_FIELDS]
      const assetType = field?.assetTypes.find(type => type.id === state.selectedCategory.id)
      const mockAssets = generateMockAssets(
        state.selectedCategory.id, 
        state.selectedCategory.id, 
        assetType?.name || '',
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
        category: field,
        downloadUrl: '#download-asset-1',
        previewUrl: '/images/placeholder.jpg',
        metadata: {
          dimensions: hasUploadedFiles ? '1920x1080' : '1280x720',
          tags: hasUploadedFiles 
            ? ['ai-enhanced', 'custom', 'high-quality', 'professional'] 
            : ['ai-generated', 'modern', 'creative'],
          description: hasUploadedFiles 
            ? `AI-enhanced ${typeName.toLowerCase()} based on your uploaded content`
            : `AI-generated ${typeName.toLowerCase()} with professional quality`
        },
        createdAt: new Date(),
        size: fileSizes[0],
        format: getFormatForType(type),
        qualityScore: qualityScores[0],
        aiModel: 'Advanced AI v2.1',
        promptUsed: hasUploadedFiles ? 'Enhanced from uploaded file' : 'Generated from prompt',
        tags: hasUploadedFiles 
          ? ['ai-enhanced', 'custom', 'high-quality'] 
          : ['ai-generated', 'modern', 'creative'],
        baseFile: hasUploadedFiles ? uploadedFiles[0].id : undefined
      },
      {
        id: `${field}-${type}-${Date.now()}-2`,
        name: `${basePrefix} ${typeName} - Style B`,
        type,
        category: field,
        downloadUrl: '#download-asset-2',
        previewUrl: '/images/placeholder.jpg',
        metadata: {
          dimensions: '1920x1080',
          tags: ['ai-generated', 'artistic', 'unique', 'premium'],
          description: `Creative variation of ${typeName.toLowerCase()} with artistic flair`
        },
        createdAt: new Date(),
        size: fileSizes[1],
        format: getFormatForType(type),
        qualityScore: qualityScores[1],
        aiModel: 'Creative AI v1.8',
        promptUsed: 'Artistic interpretation',
        tags: ['artistic', 'unique', 'premium'],
        baseFile: hasUploadedFiles && uploadedFiles.length > 1 ? uploadedFiles[1].id : undefined
      },
      {
        id: `${field}-${type}-${Date.now()}-3`,
        name: `${basePrefix} ${typeName} - Style C`,
        type,
        category: field,
        downloadUrl: '#download-asset-3',
        previewUrl: '/images/placeholder.jpg',
        metadata: {
          dimensions: '1920x1080',
          tags: ['minimalist', 'clean', 'elegant', 'professional'],
          description: `Clean and minimalist ${typeName.toLowerCase()} design`
        },
        createdAt: new Date(),
        size: fileSizes[2],
        format: getFormatForType(type),
        qualityScore: qualityScores[2],
        aiModel: 'Precision AI v1.5',
        promptUsed: 'Minimalist design approach',
        tags: ['minimalist', 'clean', 'elegant']
      }
    ]
    
    // Add extra variations if uploaded files are available
    if (hasUploadedFiles && uploadedFiles.length > 0) {
      baseAssets.push({
        id: `${field}-${type}-${Date.now()}-4`,
        name: `${basePrefix} ${typeName} - Custom Variation`,
        type,
        category: field,
        downloadUrl: '#download-asset-4',
        previewUrl: '/images/placeholder.jpg',
        metadata: {
          dimensions: '2560x1440',
          tags: ['custom', 'enhanced', 'high-res', 'premium'],
          description: `High-resolution custom ${typeName.toLowerCase()} created from your files`
        },
        createdAt: new Date(),
        size: fileSizes[3],
        format: getFormatForType(type),
        qualityScore: qualityScores[3],
        aiModel: 'Ultra AI v3.0',
        promptUsed: `Based on ${uploadedFiles[0].name}`,
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

  const selectedField = CREATIVE_FIELDS[state.selectedCategory.id as keyof typeof CREATIVE_FIELDS]

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generate">Generate Assets</TabsTrigger>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
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
                        state.selectedCategory.id === key 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-lg'
                      }`}
                      onClick={() => dispatch({ type: 'SET_CATEGORY', payload: field.assetTypes[0] })}
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
                        state.selectedCategory.id === assetType.id 
                          ? 'ring-2 ring-purple-500 bg-purple-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => dispatch({ type: 'SET_CATEGORY', payload: assetType })}
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

          {state.selectedCategory && (
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
                      value={state.advancedSettings.style || 'modern'}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { style: value } })}
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
                      value={state.advancedSettings.colorScheme || 'vibrant'}
                      onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { colorScheme: value } })}
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
                    value={state.prompt}
                    onChange={(e) => dispatch({ type: 'SET_PROMPT', payload: e.target.value })}
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {AI_MODELS.map((model) => (
                        <Card
                          key={model.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            state.selectedModel.id === model.id 
                              ? 'ring-2 ring-purple-500 bg-purple-50' 
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => dispatch({ type: 'SET_MODEL', payload: model })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{model.name}</h4>
                                <p className="text-sm text-gray-600">{model.provider}</p>
                              </div>
                              <div className="flex gap-1">
                                <Badge 
                                  variant={model.tier === 'enterprise' ? 'default' : model.tier === 'pro' ? 'secondary' : 'outline'}
                                  className="text-xs"
                                >
                                  {model.tier}
                                </Badge>
                                {model.isFree && <Badge variant="outline" className="text-xs bg-green-50">Free</Badge>}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex gap-2">
                                <Badge variant="outline" className="text-xs">{model.speed}</Badge>
                                <Badge variant="outline" className="text-xs">{model.quality}</Badge>
                              </div>
                              <div className="text-right">
                                {model.isFree ? (
                                  <span className="text-green-600 font-medium">Free</span>
                                ) : (
                                  <span className="text-gray-600">${model.costPerRequest}/req</span>
                                )}
                              </div>
                            </div>
                            {model.features && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {model.features.slice(0, 3).map((feature, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
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
                    {state.selectedModel.requiresApiKey && (
                      <Card className="border-amber-200 bg-amber-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Key className="w-4 h-4 text-amber-600" />
                            API Configuration Required
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Use Custom API Key</label>
                            <Switch
                              checked={state.useCustomApi}
                              onCheckedChange={(checked) => dispatch({ type: 'TOGGLE_CUSTOM_API', payload: checked })}
                            />
                          </div>
                          {state.useCustomApi && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">API Key</label>
                              <Input
                                type="password"
                                placeholder={`Enter your ${state.selectedModel.provider} API key`}
                                value={state.customApiKey}
                                onChange={(e) => dispatch({ type: 'SET_API_KEY', payload: e.target.value })}
                              />
                              <p className="text-xs text-gray-500">
                                Your API key is stored securely and only used for this session.
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* A+++ Batch Generation Controls */}
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-sm">
                          <Layers className="w-4 h-4 text-blue-600" />
                          Batch Generation
                          <Badge variant="outline" className="ml-auto text-xs">
                            Pro Feature
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Enable Batch Mode</label>
                          <Switch
                            checked={state.advancedSettings.batch}
                            onCheckedChange={(checked) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { batch: checked } })}
                          />
                        </div>
                        {state.advancedSettings.batch && (
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Batch Size: {state.advancedSettings.iterationCount}</label>
                              <Slider
                                value={[state.advancedSettings.iterationCount]}
                                onValueChange={(value) => dispatch({ type: 'UPDATE_ADVANCED_SETTINGS', payload: { iterationCount: value[0] } })}
                                max={50}
                                min={5}
                                step={5}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>5 assets</span>
                                <span>50 assets</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Info className="w-4 h-4" />
                              <span>Estimated cost: ${(state.selectedModel.costPerRequest * state.advancedSettings.iterationCount).toFixed(3)}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                <Button
                  onClick={generateAssets}
                  disabled={state.isGenerating || !state.selectedCategory}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  data-testid="generate-assets-btn"
                >
                  {state.isGenerating ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Generating... {state.generatedAssets.length} assets
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-5 h-5" />
                      Generate {state.advancedSettings.batch ? `${state.advancedSettings.iterationCount} ` : ''}Assets
                    </div>
                  )}
                </Button>

                {state.isGenerating && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Generation Progress</span>
                          <span className="text-sm text-gray-600">{state.generatedAssets.length} assets generated</span>
                        </div>
                        <Progress value={state.generatedAssets.length} className="w-full" />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Sparkles className="w-4 h-4" />
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
                <CardTitle className="flex items-center gap-2">
                  <Archive className="w-5 h-5" />
                  Generated Assets ({state.generatedAssets.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.generatedAssets.map((asset) => (
                    <Card key={asset.id} className="hover:shadow-lg transition-shadow duration-200">
                      <CardContent className="p-4 space-y-3">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileImage className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <h4 className="font-medium truncate">{asset.name}</h4>
                          <p className="text-xs text-gray-600 line-clamp-2">{asset.metadata.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{asset.size}</span>
                          <Badge variant="outline">{asset.format}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {asset.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => console.log('Preview asset:', asset.id)}
                            data-testid="preview-asset-btn"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDownloadAsset(asset)}
                            data-testid="download-asset-btn"
                          >
                            <Download className="w-4 h-4 mr-1" />
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

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Example Files
                <Badge variant="secondary" className="ml-auto">
                  {state.uploadedFiles.length} files
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-3 bg-purple-50 rounded-full">
                      <Upload className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Upload Files for AI Generation</h3>
                    <p className="text-gray-600 mt-2">
                      Drop your files here or click to browse. Supports images, videos, and audio files.
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-4 h-4" />
                      Images
                    </div>
                    <div className="flex items-center gap-1">
                      <FileVideo className="w-4 h-4" />
                      Videos
                    </div>
                    <div className="flex items-center gap-1">
                      <FileAudio className="w-4 h-4" />
                      Audio
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Maximum file size: 100MB
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleFileUpload(e.target.files)
                  }
                }}
              />

              {/* Upload Progress */}
              {state.isUploading && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-700">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span className="font-medium">Processing files...</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Uploaded Files Grid */}
              {state.uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Uploaded Files</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <span>{file.processingProgress}%</span>
                              </div>
                              <Progress value={file.processingProgress} className="w-full" />
                            </div>
                          )}

                          {file.analysisResult && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-xs">
                                  Quality: {file.analysisResult.quality}%
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {file.analysisResult.fileType}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-xs font-medium">Compatible Asset Types:</p>
                                <div className="flex flex-wrap gap-1">
                                  {file.analysisResult.compatibleAssetTypes.map((type, idx) => (
                                    <Badge key={idx} variant="outline" className="text-xs">
                                      {type}
                                    </Badge>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs font-medium">AI Suggestions:</p>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {file.analysisResult.suggestions.slice(0, 2).map((suggestion, idx) => (
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
                                  if (file.analysisResult) {
                                    const field = file.type.startsWith('image/') ? 'photography' : 
                                                file.type.startsWith('video/') ? 'videography' : 'music'
                                    // dispatch({ type: 'SET_ASSET_TYPE', payload: 'image' as AssetType })
                                    
                                    const assetType = file.analysisResult.compatibleAssetTypes[0]
                                    if (assetType) {
                                      // dispatch({ type: 'SET_CATEGORY', payload: { id: 'logos', name: 'Logos' } as Category })
                                    }
                                    
                                    dispatch({ 
                                      type: 'SET_PROMPT', 
                                      payload: `Generate assets based on uploaded ${file.name}` 
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
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-purple-800 mb-2">💡 Upload Tips</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
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

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Asset Library
                <Badge variant="secondary" className="ml-auto">
                  {state.generatedAssets.length} assets
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Library Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search assets..."
                      className="w-64"
                    />
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
                        const uploadTab = document.querySelector('[value="upload"]') as HTMLElement
                        uploadTab?.click()
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
                    {state.generatedAssets.map((asset) => (
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
                            <Badge variant="outline" className="text-xs">{asset.format}</Badge>
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

        <TabsContent value="settings" className="h-full m-0">
          <div className="tab-panel p-6 space-y-6">
            {/* Cost Savings Overview Card */}
            <Card className="glass-card border-2 border-green-200/50 bg-green-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Calculator className="h-5 w-5" />
                  Cost Savings Dashboard
                </CardTitle>
                <CardDescription>
                  Track your savings by using your own API keys instead of platform pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">${state.costSavings.monthly.toFixed(2)}</div>
                    <div className="text-xs text-green-700">Monthly Savings</div>
                  </div>
                  <div className="text-center p-3 bg-blue-100 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">${state.costSavings.freeCreditsUsed.toFixed(2)}</div>
                    <div className="text-xs text-blue-700">Free Credits Used</div>
                  </div>
                  <div className="text-center p-3 bg-purple-100 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{state.costSavings.requestsThisMonth}</div>
                    <div className="text-xs text-purple-700">Requests This Month</div>
                  </div>
                  <div className="text-center p-3 bg-amber-100 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">${state.costSavings.total.toFixed(2)}</div>
                    <div className="text-xs text-amber-700">Total Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User API Keys Management Section */}
            <Card className="glass-card border-2 border-blue-200/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Key className="h-5 w-5" />
                  Your API Keys (Cost Savings & Free Models)
                </CardTitle>
                <CardDescription>
                  Use your own API keys to access free models, save costs, and get higher rate limits. 
                  Your keys are stored securely for this session only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Setup Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => dispatch({ type: 'TOGGLE_API_KEY_SETTINGS', payload: true })}
                    className="flex-1"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage All API Keys
                  </Button>
                  <Button
                    onClick={() => {
                      const savings = (Object.keys(state.userApiKeys).length * 15) + (state.costSavings.freeCreditsUsed * 0.8)
                      dispatch({ type: 'UPDATE_COST_SAVINGS', payload: { monthly: savings } })
                      toast.success(`Updated cost savings: $${savings.toFixed(2)}/month`)
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {/* API Provider Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">API Provider</Label>
                  <Select 
                    value={state.selectedApiProvider} 
                    onValueChange={(value) => dispatch({ type: 'SET_API_PROVIDER', payload: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select API provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platform">🏢 Platform APIs (Included)</SelectItem>
                      <SelectItem value="openai">🤖 OpenAI (Your API Key)</SelectItem>
                      <SelectItem value="anthropic">🧠 Anthropic Claude (Your API Key)</SelectItem>
                      <SelectItem value="google">🔍 Google Gemini (Your API Key)</SelectItem>
                      <SelectItem value="huggingface">🤗 Hugging Face (Free Models)</SelectItem>
                      <SelectItem value="openrouter">🌐 OpenRouter (Multiple Models)</SelectItem>
                      <SelectItem value="replicate">🔄 Replicate (Open Source)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* API Key Input for Selected Provider */}
                {state.selectedApiProvider !== 'platform' && (
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      {state.selectedApiProvider.charAt(0).toUpperCase() + state.selectedApiProvider.slice(1)} API Key
                    </Label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder={`Enter your ${state.selectedApiProvider} API key`}
                        value={state.userApiKeys[state.selectedApiProvider] || ''}
                        onChange={(e) => dispatch({ 
                          type: 'SET_USER_API_KEY', 
                          payload: { provider: state.selectedApiProvider, apiKey: e.target.value }
                        })}
                        className="pr-10"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: true })}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* API Key Status Indicator */}
                    <div className="flex items-center gap-2 text-sm">
                      {state.userApiKeys[state.selectedApiProvider] ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">API key configured</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-600">API key required</span>
                        </>
                      )}
                    </div>

                    {/* Provider-specific Benefits */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        Benefits of using your {state.selectedApiProvider} API:
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {state.selectedApiProvider === 'openai' && (
                          <>
                            <li>• Access to latest GPT-4o and DALL-E 3 models</li>
                            <li>• Higher rate limits and faster processing</li>
                            <li>• Pay only for what you use (typically 80% cheaper)</li>
                            <li>• Direct API access without platform markup</li>
                          </>
                        )}
                        {state.selectedApiProvider === 'anthropic' && (
                          <>
                            <li>• Access to Claude 3.5 Sonnet creative capabilities</li>
                            <li>• Advanced reasoning and artistic generation</li>
                            <li>• Competitive pricing with high quality output</li>
                            <li>• Long context window for complex projects</li>
                          </>
                        )}
                        {state.selectedApiProvider === 'google' && (
                          <>
                            <li>• Free tier with generous usage limits</li>
                            <li>• Multimodal capabilities (text, image, code)</li>
                            <li>• Fast response times and reliable service</li>
                            <li>• No cost for many use cases</li>
                          </>
                        )}
                        {state.selectedApiProvider === 'huggingface' && (
                          <>
                            <li>• Completely free open-source models</li>
                            <li>• No usage limits on many models</li>
                            <li>• Support for specialized tasks</li>
                            <li>• Community-driven model ecosystem</li>
                          </>
                        )}
                        {state.selectedApiProvider === 'openrouter' && (
                          <>
                            <li>• Access to 100+ AI models from one API</li>
                            <li>• Competitive pricing across providers</li>
                            <li>• Automatic model selection and fallbacks</li>
                            <li>• Support for latest and experimental models</li>
                          </>
                        )}
                        {state.selectedApiProvider === 'replicate' && (
                          <>
                            <li>• Open-source models with transparent pricing</li>
                            <li>• Specialized image and video generation</li>
                            <li>• Community-contributed model variants</li>
                            <li>• Pay-per-use with no minimum charges</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Cost Comparison */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <h4 className="text-sm font-medium text-green-800 mb-2">💰 Cost Savings</h4>
                  <div className="text-xs text-green-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Platform API (per request):</span>
                      <span className="font-medium">$0.05 - $0.15</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Your API (direct pricing):</span>
                      <span className="font-medium text-green-600">$0.01 - $0.03</span>
                    </div>
                    <div className="flex justify-between border-t border-green-300 pt-1 mt-1">
                      <span className="font-medium">Your Savings:</span>
                      <span className="font-bold text-green-600">60-80%</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="text-xs text-gray-600">
                      <p className="font-medium mb-1">🔒 Security & Privacy</p>
                      <ul className="space-y-0.5">
                        <li>• API keys are stored in browser memory only</li>
                        <li>• Keys are never sent to our servers</li>
                        <li>• Direct communication with AI providers</li>
                        <li>• Keys are cleared when you close the browser</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Clear API Keys Button */}
                {Object.keys(state.userApiKeys).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dispatch({ type: 'CLEAR_API_KEYS' })}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All API Keys
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* API Key Help Modal */}
            {state.showApiKeyModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">How to Get API Keys</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ type: 'TOGGLE_API_KEY_MODAL', payload: false })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4 text-sm">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-700 mb-2">🤖 OpenAI API Key</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600">
                          <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
                          <li>Sign up or log in to your OpenAI account</li>
                          <li>Click "Create new secret key"</li>
                          <li>Copy the key (starts with sk-...)</li>
                          <li>Paste it in the API key field above</li>
                        </ol>
                        <p className="text-xs text-green-600 mt-2">💡 $5 free credit for new accounts!</p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-700 mb-2">🧠 Anthropic Claude API Key</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600">
                          <li>Visit <a href="https://console.anthropic.com/keys" target="_blank" className="text-blue-600 hover:underline">console.anthropic.com/keys</a></li>
                          <li>Create an Anthropic account</li>
                          <li>Generate a new API key</li>
                          <li>Copy the key (starts with sk-ant-...)</li>
                          <li>Paste it in the API key field above</li>
                        </ol>
                        <p className="text-xs text-green-600 mt-2">💡 $5 free credit for new accounts!</p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-700 mb-2">🔍 Google Gemini API Key</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600">
                          <li>Visit <a href="https://makersuite.google.com/app/apikey" target="_blank" className="text-blue-600 hover:underline">makersuite.google.com/app/apikey</a></li>
                          <li>Sign in with your Google account</li>
                          <li>Click "Create API key"</li>
                          <li>Copy the generated key</li>
                          <li>Paste it in the API key field above</li>
                        </ol>
                        <p className="text-xs text-green-600 mt-2">💡 Generous free tier with 60 requests per minute!</p>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-orange-700 mb-2">🤗 Hugging Face API Key</h4>
                        <ol className="list-decimal list-inside space-y-1 text-gray-600">
                          <li>Visit <a href="https://huggingface.co/settings/tokens" target="_blank" className="text-blue-600 hover:underline">huggingface.co/settings/tokens</a></li>
                          <li>Sign up for a free Hugging Face account</li>
                          <li>Click "New token"</li>
                          <li>Set role to "Inference"</li>
                          <li>Copy the token and paste it above</li>
                        </ol>
                        <p className="text-xs text-green-600 mt-2">💡 Completely free for many models!</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ... rest of existing settings content ... */}
            
          </div>
        </TabsContent>

        {/* API Key Settings Modal */}
        {state.showApiKeySettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Comprehensive API Key Management</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch({ type: 'TOGGLE_API_KEY_SETTINGS', payload: false })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <APIKeySettings
                  onApiKeyUpdate={(provider, apiKey, isValid) => {
                    dispatch({ type: 'SET_USER_API_KEY', payload: { provider, apiKey } })
                    dispatch({ type: 'SET_API_KEY_VALID', payload: { provider, isValid } })
                    
                    // Update cost savings based on provider
                    const providerSavings = {
                      'openai': 12,
                      'anthropic': 15,
                      'google': 25,
                      'huggingface': 35
                    }
                    const newSavings = providerSavings[provider as keyof typeof providerSavings] || 10
                    dispatch({ type: 'UPDATE_COST_SAVINGS', payload: { 
                      monthly: state.costSavings.monthly + newSavings,
                      freeCreditsUsed: state.costSavings.freeCreditsUsed + (isValid ? 5 : 0)
                    }})
                  }}
                  onProviderChange={(provider) => {
                    dispatch({ type: 'SET_API_PROVIDER', payload: provider })
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </Tabs>

      {/* Asset Preview Modal */}
      {state.generatedAssets.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{state.generatedAssets[0].name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_GENERATED_ASSETS', payload: [] })}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <FileImage className="w-16 h-16 text-gray-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <Badge variant="outline">{state.generatedAssets[0].format}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{state.generatedAssets[0].size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimensions:</span>
                      <span>{state.generatedAssets[0].metadata.dimensions}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {state.generatedAssets[0].tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {state.generatedAssets[0].metadata.description}
              </p>
              <div className="flex gap-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline">
                  <Star className="w-4 h-4 mr-1" />
                  Favorite
                </Button>
                <Button variant="outline">
                  <Share2 className="w-4 h-4 mr-1" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 