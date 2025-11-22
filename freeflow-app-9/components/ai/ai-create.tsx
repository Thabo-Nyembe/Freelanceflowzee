"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Brain,
  Sparkles,
  FileText,
  MessageSquare,
  Mail,
  ShoppingCart,
  Code2,
  Pen,
  Settings,
  Layout,
  History as HistoryIcon,
  Copy,
  Download,
  Zap,
  Clock,
  TrendingUp,
  Activity,
  Cpu,
  Search,
  Filter,
  Star,
  Plus,
  Database,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'
import { TemplateCreatorModal } from './template-creator-modal'
import {
  saveHistory,
  loadHistory,
  saveCustomTemplates,
  loadCustomTemplates,
  saveSettings,
  loadSettings,
  getStorageStats,
  type Generation,
  type CustomTemplate as CustomTemplateType,
  type AICreateSettings
} from '@/lib/ai-create-persistence'
import { exportContent, EXPORT_FORMATS } from '@/lib/ai-create-exporters'
import { analyzeSEO, type SEOAnalysisResult } from '@/lib/ai-create-seo'
import {
  searchGenerations,
  applyAllFilters,
  createDefaultFilters,
  type SearchFilters,
  type SortOption
} from '@/lib/ai-create-search'
import {
  executeWithRetry,
  type RetryState
} from '@/lib/ai-create-retry'
// A++++ Phase 2 Imports
import {
  simulateStreaming,
  type StreamingController,
  type StreamingMetrics
} from '@/lib/ai-create-streaming'
import {
  saveVersion,
  loadVersionTree,
  enableAutoSave as enableVersionAutoSave,
  disableAutoSave as disableVersionAutoSave,
  type ContentVersion
} from '@/lib/ai-create-versions'
import {
  trackGeneration,
  trackExport,
  trackTemplateUse,
  getAnalyticsSummary,
  type AnalyticsSummary
} from '@/lib/ai-create-analytics'
import {
  createVoiceInput,
  isSpeechRecognitionSupported,
  type VoiceInputController
} from '@/lib/ai-create-voice'
import {
  Mic,
  MicOff,
  GitBranch,
  BarChart,
  Radio
} from 'lucide-react'

// AI Models Configuration
const AI_MODELS: Record<string, { name: string; description: string }> = {
  'gpt-4o': { name: 'GPT-4o', description: 'Most capable OpenAI model' },
  'gpt-4o-mini': { name: 'GPT-4o Mini', description: 'Fast and cost-effective' },
  'gpt-4-vision': { name: 'GPT-4 Vision', description: 'Image understanding' },
  'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', description: 'Anthropic flagship model' },
  'claude-3-haiku': { name: 'Claude 3 Haiku', description: 'Fast and efficient' },
  'gemini-pro': { name: 'Gemini Pro', description: 'Google AI model' },
  'gemini-ultra': { name: 'Gemini Ultra', description: 'Google most capable' },
  'dall-e-3': { name: 'DALL-E 3', description: 'Image generation' },
  'midjourney-v6': { name: 'Midjourney V6', description: 'Artistic images' },
  'stable-diffusion-xl': { name: 'Stable Diffusion XL', description: 'Open source images' },
  'runway-gen3': { name: 'Runway Gen-3', description: 'Video generation' },
  'real-esrgan': { name: 'Real-ESRGAN', description: 'Image upscaling' }
}

// Content Templates
const CONTENT_TEMPLATES = [
  {
    id: 'blog-post',
    title: 'Blog Post',
    description: 'Create engaging blog posts and articles',
    icon: FileText,
    category: 'Content',
    prompt: 'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, well-structured main points with examples, and a compelling conclusion. Optimize for SEO with relevant keywords.',
    tags: ['SEO', 'Marketing', 'Content']
  },
  {
    id: 'social-media',
    title: 'Social Media Posts',
    description: 'Platform-specific engaging content',
    icon: MessageSquare,
    category: 'Social',
    prompt: 'Create 5 engaging social media posts about [TOPIC]. Make them platform-specific (Twitter, LinkedIn, Instagram), include relevant hashtags, and ensure each post drives engagement.',
    tags: ['Social', 'Marketing', 'Engagement']
  },
  {
    id: 'email-campaign',
    title: 'Email Campaign',
    description: 'Marketing emails with CTAs',
    icon: Mail,
    category: 'Marketing',
    prompt: 'Write a marketing email campaign for [PRODUCT/SERVICE]. Include attention-grabbing subject line, persuasive body copy, clear benefits, and strong call-to-action.',
    tags: ['Email', 'Marketing', 'Sales']
  },
  {
    id: 'product-description',
    title: 'Product Description',
    description: 'E-commerce copy with features/benefits',
    icon: ShoppingCart,
    category: 'E-commerce',
    prompt: 'Write a compelling product description for [PRODUCT]. Highlight key features, benefits, use cases, and include persuasive elements that drive conversions.',
    tags: ['E-commerce', 'Sales', 'Copy']
  },
  {
    id: 'code-generator',
    title: 'Code Generator',
    description: 'Programming snippets with error handling',
    icon: Code2,
    category: 'Technical',
    prompt: 'Generate [LANGUAGE] code for [FUNCTIONALITY]. Include error handling, comments, and best practices. Make it production-ready and well-documented.',
    tags: ['Code', 'Programming', 'Technical']
  },
  {
    id: 'creative-writing',
    title: 'Creative Writing',
    description: 'Stories, scripts, and fiction',
    icon: Pen,
    category: 'Creative',
    prompt: 'Write a creative piece about [THEME]. Make it engaging, emotionally resonant, and well-paced. Include vivid descriptions and compelling characters.',
    tags: ['Creative', 'Fiction', 'Writing']
  }
]

// Mock Recent Generations (for initial state only)
const INITIAL_MOCK_GENERATIONS: Generation[] = [
  {
    id: '1',
    title: 'How to Build a Successful SaaS Product',
    type: 'blog-post',
    model: 'gpt-4o',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    preview: 'Building a successful SaaS product requires careful planning, market research, and continuous iteration...',
    content: 'Building a successful SaaS product requires careful planning, market research, and continuous iteration. Start with identifying a real problem, validate your solution with potential customers, and build an MVP that solves the core issue. Focus on user experience, scalability, and customer feedback to iterate and improve your product continuously.',
    tokens: 1247,
    cost: 0.0025,
    temperature: 0.7,
    maxTokens: 1500,
    version: 1,
    iterations: [],
    tags: ['SaaS', 'Product', 'Development'],
    favorite: false,
    archived: false
  }
]

interface AICreateProps {
  onSaveKeys?: (keys: Record<string, string>) => void
}

export function AICreate({ onSaveKeys }: AICreateProps) {
  // Core State (existing)
  const [activeTab, setActiveTab] = React.useState('studio')
  const [selectedModel, setSelectedModel] = React.useState('gpt-4o-mini')
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)
  const [temperature, setTemperature] = React.useState([0.7])
  const [maxTokens, setMaxTokens] = React.useState([1000])
  const [history, setHistory] = React.useState<Generation[]>([])
  const [copied, setCopied] = React.useState(false)
  const [savedTemplates] = React.useState<string[]>(['blog-post', 'email-campaign'])
  const [hoveredTemplate, setHoveredTemplate] = React.useState<string | null>(null)
  const [typingEffect, setTypingEffect] = React.useState('')
  const [progress, setProgress] = React.useState(0)
  const [generationStage, setGenerationStage] = React.useState('')

  // A++++ Phase 1 State (new)
  const [customTemplates, setCustomTemplates] = React.useState<CustomTemplateType[]>([])
  const [showTemplateCreator, setShowTemplateCreator] = React.useState(false)
  const [editingTemplate, setEditingTemplate] = React.useState<CustomTemplateType | null>(null)
  const [exportFormat, setExportFormat] = React.useState<string>('txt')
  const [seoAnalysis, setSeoAnalysis] = React.useState<SEOAnalysisResult | null>(null)
  const [showSEOPanel, setShowSEOPanel] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filters, setFilters] = React.useState<SearchFilters>(createDefaultFilters())
  const [sortBy, setSortBy] = React.useState<SortOption>('recent')
  const [storageStats, setStorageStats] = React.useState(getStorageStats())
  const [retryState, setRetryState] = React.useState<RetryState>({
    isRetrying: false,
    currentAttempt: 0,
    maxAttempts: 3,
    nextRetryDelay: 0,
    lastError: null
  })
  const [autoSave, setAutoSave] = React.useState(true)

  // A++++ Phase 2 State
  const [streamingEnabled, setStreamingEnabled] = React.useState(false)
  const [streamingMetrics, setStreamingMetrics] = React.useState<StreamingMetrics | null>(null)
  const [streamController, setStreamController] = React.useState<StreamingController | null>(null)
  const [currentGenerationId, setCurrentGenerationId] = React.useState<string | null>(null)
  const [versionHistory, setVersionHistory] = React.useState<ContentVersion[]>([])
  const [voiceInput, setVoiceInput] = React.useState<VoiceInputController | null>(null)
  const [isListening, setIsListening] = React.useState(false)
  const [voiceSupported] = React.useState(isSpeechRecognitionSupported())
  const [analytics, setAnalytics] = React.useState<AnalyticsSummary | null>(null)
  const [showAnalytics, setShowAnalytics] = React.useState(false)

  // Load data on mount
  React.useEffect(() => {
    const savedHistory = loadHistory()
    const savedTemplates = loadCustomTemplates()
    const savedSettings = loadSettings()

    if (savedHistory.length > 0) {
      setHistory(savedHistory)
    } else {
      setHistory(INITIAL_MOCK_GENERATIONS)
    }

    setCustomTemplates(savedTemplates)

    if (savedSettings) {
      setSelectedModel(savedSettings.defaultModel)
      setTemperature([savedSettings.defaultTemperature])
      setMaxTokens([savedSettings.defaultMaxTokens])
      setAutoSave(savedSettings.autoSave)
    }

    setStorageStats(getStorageStats())
  }, [])

  // Auto-save history
  React.useEffect(() => {
    if (autoSave && history.length > 0) {
      saveHistory(history)
      setStorageStats(getStorageStats())
    }
  }, [history, autoSave])

  // Save custom templates
  React.useEffect(() => {
    if (customTemplates.length > 0) {
      saveCustomTemplates(customTemplates)
    }
  }, [customTemplates])

  // Save settings
  React.useEffect(() => {
    const settings: AICreateSettings = {
      defaultModel: selectedModel,
      defaultTemperature: temperature[0],
      defaultMaxTokens: maxTokens[0],
      autoSave
    }
    saveSettings(settings)
  }, [selectedModel, temperature, maxTokens, autoSave])

  // Main Generation Handler with A++++ Retry Logic & SEO Analysis
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)
    setResult(null)
    setTypingEffect('')
    setProgress(0)
    setSeoAnalysis(null)

    try {
      // Multi-stage progress tracking
      const stages = [
        { stage: 'Analyzing prompt...', progress: 20, delay: 300 },
        { stage: 'Loading AI model...', progress: 40, delay: 300 },
        { stage: 'Generating content...', progress: 60, delay: 0 }
      ]

      for (const { stage, progress: stageProgress, delay } of stages) {
        setGenerationStage(stage)
        setProgress(stageProgress)
        if (delay > 0) await new Promise(resolve => setTimeout(resolve, delay))
      }

      // Call API with Smart Retry Logic
      const { content: generatedContent, tokens: tokensUsed } = await executeWithRetry(
        async () => {
          const response = await fetch('/api/ai/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel,
              prompt: prompt,
              temperature: temperature[0],
              maxTokens: maxTokens[0]
            })
          })

          if (!response.ok) {
            throw new Error('Failed to generate content')
          }

          const data = await response.json()
          return {
            content: data.content || 'No content generated',
            tokens: data.tokens || 0
          }
        },
        {
          maxAttempts: 3,
          baseDelay: 1000,
          onRetry: (attempt, delay, error) => {
            setRetryState({
              isRetrying: true,
              currentAttempt: attempt,
              maxAttempts: 3,
              nextRetryDelay: delay,
              lastError: error
            })
            setGenerationStage(`Retrying... (${attempt}/3)`)
            toast.warning(`Retry ${attempt}/3 in ${delay/1000}s...`)
          },
          onSuccess: (attempt) => {
            if (attempt > 1) {
              toast.success(`Generation successful after ${attempt} attempts!`)
            }
            setRetryState({
              isRetrying: false,
              currentAttempt: 0,
              maxAttempts: 3,
              nextRetryDelay: 0,
              lastError: null
            })
          }
        }
      )

      setProgress(80)
      setGenerationStage('Analyzing SEO...')
      await new Promise(resolve => setTimeout(resolve, 200))

      // A++++ SEO Analysis
      const seo = analyzeSEO(generatedContent)
      setSeoAnalysis(seo)

      if (seo.score >= 85) {
        toast.success(`SEO Score: ${seo.score}/100 (${seo.grade})`)
      } else if (seo.score >= 70) {
        toast(`SEO Score: ${seo.score}/100 (${seo.grade})`)
      } else {
        toast.warning(`SEO Score: ${seo.score}/100 (${seo.grade}) - See suggestions`)
      }

      setProgress(90)
      setGenerationStage('Finalizing output...')
      await new Promise(resolve => setTimeout(resolve, 200))

      // Typing effect
      let currentText = ''
      const typeSpeed = 10

      for (let i = 0; i < generatedContent.length; i++) {
        currentText += generatedContent[i]
        setTypingEffect(currentText)
        await new Promise(resolve => setTimeout(resolve, typeSpeed))
      }

      setResult(generatedContent)
      setProgress(100)
      setGenerationStage('Complete!')

      // Add to history with full Generation object
      const newGeneration: Generation = {
        id: Date.now().toString(),
        title: prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt,
        type: selectedTemplate || 'custom',
        model: selectedModel,
        timestamp: new Date(),
        preview: generatedContent.substring(0, 100) + '...',
        content: generatedContent,
        tokens: tokensUsed,
        cost: (tokensUsed / 1000) * 0.002,
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        version: 1,
        iterations: [],
        tags: seo.topKeywords.slice(0, 5).map(k => k.word),
        favorite: false,
        archived: false
      }

      setHistory(prev => [newGeneration, ...prev])

      // A++++ Phase 2: Track analytics
      const responseTime = Date.now() - parseInt(newGeneration.id)
      trackGeneration({
        model: selectedModel,
        tokens: tokensUsed,
        cost: newGeneration.cost,
        responseTime,
        success: true,
        contentType: newGeneration.type,
        promptLength: prompt.length
      })

      // A++++ Phase 2: Save initial version
      setCurrentGenerationId(newGeneration.id)
      saveVersion({
        generationId: newGeneration.id,
        content: generatedContent,
        label: 'Initial generation',
        isAutoSave: false
      })

      toast.success('Content generated successfully!')

    } catch (error: any) {
      console.error('Generation error:', error)

      // A++++ Phase 2: Track failed generation
      trackGeneration({
        model: selectedModel,
        tokens: 0,
        cost: 0,
        responseTime: 0,
        success: false,
        errorType: error.message,
        promptLength: prompt.length
      })

      const errorMsg = `Error generating content: ${error.message}\n\nPlease check your API configuration and try again.`
      setResult(errorMsg)
      setTypingEffect(errorMsg)
      toast.error('Failed to generate content after 3 attempts')
    } finally {
      setGenerating(false)
      setGenerationStage('')
      setProgress(0)
      setRetryState({
        isRetrying: false,
        currentAttempt: 0,
        maxAttempts: 3,
        nextRetryDelay: 0,
        lastError: null
      })
    }
  }

  // Template Selection Handler
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id)
    setPrompt(template.prompt)
    setActiveTab('studio')

    // A++++ Phase 2: Track template usage
    trackTemplateUse({
      templateId: template.id,
      templateName: template.title,
      category: template.category || 'custom'
    })

    toast.success(`Template "${template.title}" selected`)
  }

  // Copy to Clipboard Handler
  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // A++++ Multi-Format Export Handler
  const downloadResult = () => {
    if (result) {
      exportContent({
        format: exportFormat as any,
        title: prompt.length > 50 ? prompt.substring(0, 50) : prompt,
        content: result,
        metadata: seoAnalysis ? {
          model: selectedModel,
          tokens: seoAnalysis.wordCount,
          cost: (history[0]?.cost || 0),
          temperature: temperature[0],
          timestamp: new Date(),
          seoScore: seoAnalysis.score,
          readability: seoAnalysis.readabilityGrade
        } : {
          model: selectedModel,
          tokens: 0,
          cost: 0,
          temperature: temperature[0],
          timestamp: new Date()
        }
      })

      // A++++ Phase 2: Track export
      trackExport({
        format: exportFormat,
        size: result.length,
        generationId: currentGenerationId || undefined
      })

      toast.success(`Exported as ${exportFormat.toUpperCase()}!`)
    }
  }

  // Custom Template Handlers
  const handleSaveCustomTemplate = (template: CustomTemplateType) => {
    const existing = customTemplates.findIndex(t => t.id === template.id)
    if (existing >= 0) {
      // Update existing
      setCustomTemplates(prev => prev.map(t => t.id === template.id ? template : t))
    } else {
      // Add new
      setCustomTemplates(prev => [...prev, template])
    }
    setShowTemplateCreator(false)
    setEditingTemplate(null)
  }

  const handleEditCustomTemplate = (template: CustomTemplateType) => {
    setEditingTemplate(template)
    setShowTemplateCreator(true)
  }

  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId))
    toast.success('Template deleted')
  }

  // A++++ Phase 2: Voice Input Handlers
  const startVoiceInput = () => {
    if (!voiceSupported) {
      toast.error('Voice input is not supported in your browser')
      return
    }

    try {
      const controller = createVoiceInput({
        language: 'en-US',
        continuous: true,
        interimResults: true,
        enableCommands: true,
        onResult: (text, isFinal) => {
          if (isFinal) {
            setPrompt(prev => prev + text + ' ')
          }
        },
        onStart: () => {
          setIsListening(true)
          toast.success('Voice input started')
        },
        onEnd: () => {
          setIsListening(false)
          toast.info('Voice input stopped')
        },
        onError: (error) => {
          setIsListening(false)
          toast.error(error.message)
        }
      })

      setVoiceInput(controller)
      controller.start()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const stopVoiceInput = () => {
    if (voiceInput) {
      voiceInput.stop()
      setVoiceInput(null)
      setIsListening(false)
    }
  }

  // A++++ Phase 2: Load analytics
  React.useEffect(() => {
    if (showAnalytics) {
      const summary = getAnalyticsSummary('week')
      setAnalytics(summary)
    }
  }, [showAnalytics])

  // Search & Filter Handler
  const filteredHistory = React.useMemo(() => {
    let filtered = history

    if (searchQuery.trim()) {
      filtered = searchGenerations(filtered, searchQuery)
    }

    filtered = applyAllFilters(filtered, filters, sortBy)

    return filtered
  }, [history, searchQuery, filters, sortBy])

  // Toggle Favorite
  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(gen =>
      gen.id === id ? { ...gen, favorite: !gen.favorite } : gen
    ))
  }

  // Time Formatting Utility
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative min-h-screen">
      {/* Background Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/5 -left-6 w-96 h-96 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: 360
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-6 w-96 h-96 bg-gradient-to-l from-blue-400/15 to-purple-400/15 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
            rotate: -360
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={activeTab === 'studio' ? {
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              } : { rotate: 0, scale: 1 }}
              transition={{ duration: 1, repeat: activeTab === 'studio' ? Infinity : 0 }}
            >
              <Brain className="h-8 w-8 text-purple-600" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Create Studio</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate high-quality content with AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <motion.div
              className="flex items-center gap-2 px-3 py-1.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700"
            >
              <motion.div
                className="w-2 h-2 bg-green-500 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Live</span>
            </motion.div>

            {/* Generation Count Badge */}
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              {history.length} generations
            </Badge>

            {/* Model Badge */}
            <Badge variant="outline" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              {AI_MODELS[selectedModel]?.name}
            </Badge>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Tab List with Animated Indicator */}
              <div className="relative">
                <TabsList className="grid w-full grid-cols-5 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                  <motion.div
                    className="absolute top-2 bottom-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md"
                    layoutId="activeAITab"
                    style={{
                      left: `${['settings', 'studio', 'templates', 'history', 'analytics'].indexOf(activeTab) * 20}%`,
                      width: '20%'
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                  <TabsTrigger value="settings" className="relative z-10" data-testid="settings-tab">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                  <TabsTrigger value="studio" className="relative z-10" data-testid="studio-tab">
                    <Zap className="h-4 w-4 mr-2" />
                    Studio
                  </TabsTrigger>
                  <TabsTrigger value="templates" className="relative z-10" data-testid="templates-tab">
                    <Layout className="h-4 w-4 mr-2" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger value="history" className="relative z-10" data-testid="history-tab">
                    <HistoryIcon className="h-4 w-4 mr-2" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="relative z-10" data-testid="analytics-tab">
                    <BarChart className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-select">AI Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model-select" data-testid="model-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(AI_MODELS).map(([id, model]) => (
                          <SelectItem key={id} value={id}>
                            {model.name} - {model.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="temperature">Temperature: {temperature[0]}</Label>
                      <span className="text-xs text-gray-500">Lower = focused, Higher = creative</span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={2}
                      step={0.1}
                      value={temperature}
                      onValueChange={setTemperature}
                      data-testid="temperature-slider"
                      className="[&_[role=slider]]:bg-purple-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="max-tokens">Max Tokens: {maxTokens[0]}</Label>
                      <span className="text-xs text-gray-500">Maximum length of generated content</span>
                    </div>
                    <Slider
                      id="max-tokens"
                      min={100}
                      max={4000}
                      step={100}
                      value={maxTokens}
                      onValueChange={setMaxTokens}
                      data-testid="max-tokens-slider"
                      className="[&_[role=slider]]:bg-purple-500"
                    />
                  </div>

                  <Button
                    onClick={() => setActiveTab('templates')}
                    className="w-full"
                    variant="outline"
                    data-testid="browse-templates-btn"
                  >
                    <Layout className="h-4 w-4 mr-2" />
                    Browse Templates
                  </Button>
                </div>
              </TabsContent>

              {/* Studio Tab */}
              <TabsContent value="studio" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="prompt">Your Prompt</Label>
                      {voiceSupported && (
                        <Button
                          onClick={isListening ? stopVoiceInput : startVoiceInput}
                          variant="ghost"
                          size="sm"
                          className={isListening ? 'text-red-500' : ''}
                        >
                          {isListening ? (
                            <>
                              <MicOff className="h-4 w-4 mr-1" />
                              <span className="text-xs">Stop</span>
                            </>
                          ) : (
                            <>
                              <Mic className="h-4 w-4 mr-1" />
                              <span className="text-xs">Voice</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe what you want to create..."
                      rows={6}
                      disabled={generating}
                      data-testid="ai-create-prompt-input"
                      className="resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                        </motion.div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Content
                      </>
                    )}
                  </Button>

                  {/* Progress Indicator */}
                  <AnimatePresence>
                    {generating && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 p-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-purple-900/20 rounded-lg"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-purple-700 dark:text-purple-300">{generationStage}</span>
                          <span className="text-purple-600 dark:text-purple-400">{progress}%</span>
                        </div>
                        <div className="relative h-3 bg-purple-100 dark:bg-purple-900/30 rounded-full overflow-hidden">
                          <motion.div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                          {/* Shimmer Effect */}
                          <motion.div
                            className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ['-100%', '400%'] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        </div>
                        {/* Floating Particles */}
                        <div className="flex gap-2 justify-center">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
                              animate={{
                                y: [0, -15, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8]
                              }}
                              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Result Display with A++++ Features */}
                  {(typingEffect || result) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Label>Generated Content</Label>
                          {seoAnalysis && (
                            <Badge
                              className={`${
                                seoAnalysis.score >= 85 ? 'bg-green-500' :
                                seoAnalysis.score >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              } text-white cursor-pointer`}
                              onClick={() => setShowSEOPanel(!showSEOPanel)}
                            >
                              <BarChart3 className="h-3 w-3 mr-1" />
                              SEO: {seoAnalysis.score}/100 ({seoAnalysis.grade})
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Select value={exportFormat} onValueChange={setExportFormat}>
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EXPORT_FORMATS.map(format => (
                                <SelectItem key={format.value} value={format.value}>
                                  {format.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={copyToClipboard}
                            disabled={!result}
                            data-testid="ai-create-copy-btn"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={downloadResult}
                            disabled={!result}
                            data-testid="ai-create-download-btn"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>

                      {/* SEO Analysis Panel */}
                      {seoAnalysis && showSEOPanel && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              SEO Analysis
                            </h4>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setShowSEOPanel(false)}
                            >
                              ✕
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Words</div>
                              <div className="font-semibold">{seoAnalysis.wordCount}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Readability</div>
                              <div className="font-semibold">{seoAnalysis.readabilityGrade}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Sentences</div>
                              <div className="font-semibold">{seoAnalysis.sentenceCount}</div>
                            </div>
                            <div>
                              <div className="text-gray-600 dark:text-gray-400">Paragraphs</div>
                              <div className="font-semibold">{seoAnalysis.paragraphCount}</div>
                            </div>
                          </div>
                          {seoAnalysis.issues.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-red-600 dark:text-red-400">Issues:</div>
                              {seoAnalysis.issues.map((issue, i) => (
                                <div key={i} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1">
                                  <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  {issue}
                                </div>
                              ))}
                            </div>
                          )}
                          {seoAnalysis.suggestions.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Suggestions:</div>
                              {seoAnalysis.suggestions.map((suggestion, i) => (
                                <div key={i} className="text-xs text-yellow-700 dark:text-yellow-300">
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                          {seoAnalysis.strengths.length > 0 && (
                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-green-600 dark:text-green-400">Strengths:</div>
                              {seoAnalysis.strengths.map((strength, i) => (
                                <div key={i} className="text-xs text-green-700 dark:text-green-300 flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                  {strength}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}

                      <div
                        className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 min-h-[200px] whitespace-pre-wrap font-mono text-sm"
                        data-testid="ai-create-result"
                      >
                        {typingEffect || result}
                        {typingEffect && !result && (
                          <motion.span
                            className="inline-block w-0.5 h-4 bg-purple-500 ml-1"
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </TabsContent>

              {/* Templates Tab with A++++ Custom Templates */}
              <TabsContent value="templates" className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Content Templates</h3>
                    <Button
                      onClick={() => {
                        setEditingTemplate(null)
                        setShowTemplateCreator(true)
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Custom Template
                    </Button>
                  </div>

                  {/* Built-in Templates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CONTENT_TEMPLATES.map((template) => (
                      <motion.div
                        key={template.id}
                        whileHover={{ scale: 1.03, y: -5 }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => setHoveredTemplate(template.id)}
                        onHoverEnd={() => setHoveredTemplate(null)}
                        data-testid={`template-${template.id}`}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300 dark:hover:border-purple-700"
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <motion.div
                                className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg"
                                whileHover={{ rotate: 10, scale: 1.1 }}
                              >
                                <template.icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                              </motion.div>
                              {savedTemplates.includes(template.id) && (
                                <Badge variant="secondary" className="text-xs">
                                  Saved
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-base">{template.title}</CardTitle>
                            <CardDescription className="text-xs">{template.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-1">
                              {template.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Custom Templates */}
                  {customTemplates.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500" />
                        Your Custom Templates ({customTemplates.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customTemplates.map((template) => (
                          <motion.div
                            key={template.id}
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-200 dark:border-purple-800">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1" onClick={() => handleTemplateSelect({ id: template.id, prompt: template.prompt, title: template.title })}>
                                    <CardTitle className="text-base">{template.title}</CardTitle>
                                    <CardDescription className="text-xs">{template.description}</CardDescription>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleEditCustomTemplate(template)
                                      }}
                                      className="h-7 w-7 p-0"
                                    >
                                      <Pen className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {template.category}
                                  </Badge>
                                  {template.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* History Tab with A++++ Search & Filter */}
              <TabsContent value="history" className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Generation History</h3>
                    <Badge variant="outline">
                      <Database className="h-3 w-3 mr-1" />
                      {storageStats.usagePercent.toFixed(1)}% storage used
                    </Badge>
                  </div>

                  {/* Search & Filter */}
                  {history.length > 0 && (
                    <div className="flex gap-2 mb-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search generations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent">Recent</SelectItem>
                          <SelectItem value="oldest">Oldest</SelectItem>
                          <SelectItem value="cost-high">Cost: High</SelectItem>
                          <SelectItem value="cost-low">Cost: Low</SelectItem>
                          <SelectItem value="tokens-high">Tokens: High</SelectItem>
                          <SelectItem value="tokens-low">Tokens: Low</SelectItem>
                          <SelectItem value="favorite">Favorites</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {history.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <HistoryIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No generations yet</p>
                        <Button
                          onClick={() => setActiveTab('studio')}
                          className="mt-4"
                          variant="outline"
                        >
                          Create Your First Generation
                        </Button>
                      </CardContent>
                    </Card>
                  ) : filteredHistory.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400">No generations match your search</p>
                        <Button
                          onClick={() => {
                            setSearchQuery('')
                            setFilters(createDefaultFilters())
                          }}
                          className="mt-4"
                          variant="outline"
                        >
                          Clear Search
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {filteredHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          data-testid={`history-item-${item.id}`}
                        >
                          <Card className="hover:shadow-md transition-shadow">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => toggleFavorite(item.id)}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Star
                                        className={`h-4 w-4 ${item.favorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                                      />
                                    </Button>
                                  </div>
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <Badge variant="outline" className="text-xs">
                                      {AI_MODELS[item.model]?.name}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {CONTENT_TEMPLATES.find(t => t.id === item.type)?.title || 'Custom'}
                                    </Badge>
                                    {item.tags && item.tags.slice(0, 3).map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="text-right text-xs text-gray-500 space-y-1">
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTimeAgo(item.timestamp)}
                                  </div>
                                  <div>{item.tokens} tokens</div>
                                  <div className="font-medium text-purple-600">${item.cost.toFixed(3)}</div>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.preview}
                              </p>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Analytics Tab - A++++ Phase 2 */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Usage Analytics</h3>
                    <Button
                      onClick={() => {
                        const summary = getAnalyticsSummary('week')
                        setAnalytics(summary)
                        toast.success('Analytics refreshed')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  {!analytics ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No analytics data yet</p>
                        <Button
                          onClick={() => {
                            const summary = getAnalyticsSummary('week')
                            setAnalytics(summary)
                          }}
                          variant="outline"
                        >
                          Load Analytics
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Overview Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Generations</p>
                                <p className="text-2xl font-bold">{analytics.metrics.totalGenerations}</p>
                              </div>
                              <Sparkles className="h-8 w-8 text-purple-500" />
                            </div>
                            <p className="text-xs text-green-600 mt-2">
                              {analytics.metrics.successfulGenerations} successful
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Cost</p>
                                <p className="text-2xl font-bold">${analytics.metrics.totalCost.toFixed(4)}</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-green-500" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              ${(analytics.metrics.totalCost / Math.max(analytics.metrics.successfulGenerations, 1)).toFixed(6)} avg
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Tokens</p>
                                <p className="text-2xl font-bold">{analytics.metrics.totalTokens.toLocaleString()}</p>
                              </div>
                              <Cpu className="h-8 w-8 text-blue-500" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              {Math.floor(analytics.metrics.totalTokens / Math.max(analytics.metrics.successfulGenerations, 1))} avg per gen
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response</p>
                                <p className="text-2xl font-bold">{(analytics.metrics.averageResponseTime / 1000).toFixed(1)}s</p>
                              </div>
                              <Clock className="h-8 w-8 text-orange-500" />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              Average time
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Model Performance */}
                      {analytics.modelStats.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Model Performance</CardTitle>
                            <CardDescription>Usage statistics by AI model</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analytics.modelStats.slice(0, 5).map((model, idx) => (
                                <div key={model.model} className="flex items-center gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">{model.model}</span>
                                      <Badge variant="outline">{model.generations} uses</Badge>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                                      <span>${model.cost.toFixed(4)} total</span>
                                      <span>{model.tokens.toLocaleString()} tokens</span>
                                      <span>{(model.averageResponseTime / 1000).toFixed(1)}s avg</span>
                                      <span className={model.successRate >= 90 ? 'text-green-600' : 'text-yellow-600'}>
                                        {model.successRate.toFixed(0)}% success
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Insights */}
                      {analytics.insights.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Insights & Recommendations</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {analytics.insights.map((insight, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{insight}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Additional Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Activity Summary</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Exports</span>
                              <Badge variant="secondary">{analytics.metrics.totalExports}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Comparisons</span>
                              <Badge variant="secondary">{analytics.metrics.totalComparisons}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Versions Saved</span>
                              <Badge variant="secondary">{analytics.metrics.totalVersions}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
                              <Badge variant={analytics.metrics.successfulGenerations / Math.max(analytics.metrics.totalGenerations, 1) >= 0.9 ? 'default' : 'secondary'}>
                                {((analytics.metrics.successfulGenerations / Math.max(analytics.metrics.totalGenerations, 1)) * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Time Period</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Period</span>
                              <Badge>{analytics.period}</Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Start Date</span>
                              <span className="text-xs">{analytics.startDate.toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">End Date</span>
                              <span className="text-xs">{analytics.endDate.toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Stats Sidebar */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Today's Usage</span>
              <Badge variant="secondary">{history.length}/50 generations</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Tokens Used</span>
              <Badge variant="secondary">
                {history.reduce((sum, item) => sum + item.tokens, 0).toLocaleString()}/50K
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Cost Today</span>
              <Badge variant="secondary" className="text-purple-600">
                ${history.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
              </Badge>
            </div>
            <div className="space-y-2">
              <Progress value={24} className="h-2" />
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                24% of daily quota used
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* A++++ Custom Template Creator Modal */}
      <TemplateCreatorModal
        open={showTemplateCreator}
        onClose={() => {
          setShowTemplateCreator(false)
          setEditingTemplate(null)
        }}
        onSave={handleSaveCustomTemplate}
        editingTemplate={editingTemplate}
        existingTemplates={customTemplates}
      />
    </div>
  )
}
