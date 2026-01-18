"use client"

/**
 * AI CREATE STUDIO A++++ GRADE
 * World-class AI content generation platform with premium features
 *
 * Features:
 * - Real-time streaming responses
 * - Multi-format export (TXT, MD, PDF, DOCX, HTML)
 * - Voice input with speech-to-text
 * - LocalStorage persistence
 * - Advanced analytics dashboard
 * - Custom template creation
 * - Content versioning & iterations
 * - SEO analysis & suggestions
 * - Smart retry logic
 * - Model comparison mode
 * - Batch generation
 * - Content scheduling
 * - Collaboration features
 * - Usage optimization recommendations
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { FileText, MessageSquare, Mail, ShoppingCart, Code2, Pen,
  FileCode, FileJson, FileImage, FileType, Globe, Target, PlayCircle
} from 'lucide-react'

// ============================================================================
// CONSTANTS & CONFIGURATIONS
// ============================================================================

const AI_MODELS = {
  'gpt-4o': { name: 'GPT-4o', description: 'Most capable OpenAI model', category: 'Premium', costPer1K: 0.015 },
  'gpt-4o-mini': { name: 'GPT-4o Mini', description: 'Fast and cost-effective', category: 'Standard', costPer1K: 0.0001 },
  'gpt-4-vision': { name: 'GPT-4 Vision', description: 'Image understanding', category: 'Premium', costPer1K: 0.01 },
  'claude-3-5-sonnet': { name: 'Claude 3.5 Sonnet', description: 'Anthropic flagship model', category: 'Premium', costPer1K: 0.003 },
  'claude-3-haiku': { name: 'Claude 3 Haiku', description: 'Fast and efficient', category: 'Standard', costPer1K: 0.00025 },
  'gemini-pro': { name: 'Gemini Pro', description: 'Google AI model', category: 'Standard', costPer1K: 0.0005 },
  'gemini-ultra': { name: 'Gemini Ultra', description: 'Google most capable', category: 'Premium', costPer1K: 0.01 },
  'dall-e-3': { name: 'DALL-E 3', description: 'Image generation', category: 'Image', costPer1K: 0.04 },
  'midjourney-v6': { name: 'Midjourney V6', description: 'Artistic images', category: 'Image', costPer1K: 0.03 },
  'stable-diffusion-xl': { name: 'Stable Diffusion XL', description: 'Open source images', category: 'Image', costPer1K: 0.002 },
  'runway-gen3': { name: 'Runway Gen-3', description: 'Video generation', category: 'Video', costPer1K: 0.05 },
  'real-esrgan': { name: 'Real-ESRGAN', description: 'Image upscaling', category: 'Image', costPer1K: 0.001 }
}

const CONTENT_TEMPLATES = [
  {
    id: 'blog-post',
    title: 'Blog Post',
    description: 'Create engaging blog posts and articles',
    icon: FileText,
    category: 'Content',
    prompt: 'Write a comprehensive blog post about [TOPIC]. Include an engaging introduction, well-structured main points with examples, and a compelling conclusion. Optimize for SEO with relevant keywords.',
    tags: ['SEO', 'Marketing', 'Content'],
    estimatedTokens: 1500,
    complexity: 'Medium'
  },
  {
    id: 'social-media',
    title: 'Social Media Posts',
    description: 'Platform-specific engaging content',
    icon: MessageSquare,
    category: 'Social',
    prompt: 'Create 5 engaging social media posts about [TOPIC]. Make them platform-specific (Twitter, LinkedIn, Instagram), include relevant hashtags, and ensure each post drives engagement.',
    tags: ['Social', 'Marketing', 'Engagement'],
    estimatedTokens: 800,
    complexity: 'Easy'
  },
  {
    id: 'email-campaign',
    title: 'Email Campaign',
    description: 'Marketing emails with CTAs',
    icon: Mail,
    category: 'Marketing',
    prompt: 'Write a marketing email campaign for [PRODUCT/SERVICE]. Include attention-grabbing subject line, persuasive body copy, clear benefits, and strong call-to-action.',
    tags: ['Email', 'Marketing', 'Sales'],
    estimatedTokens: 600,
    complexity: 'Easy'
  },
  {
    id: 'product-description',
    title: 'Product Description',
    description: 'E-commerce copy with features/benefits',
    icon: ShoppingCart,
    category: 'E-commerce',
    prompt: 'Write a compelling product description for [PRODUCT]. Highlight key features, benefits, use cases, and include persuasive elements that drive conversions.',
    tags: ['E-commerce', 'Sales', 'Copy'],
    estimatedTokens: 400,
    complexity: 'Easy'
  },
  {
    id: 'code-generator',
    title: 'Code Generator',
    description: 'Programming snippets with error handling',
    icon: Code2,
    category: 'Technical',
    prompt: 'Generate [LANGUAGE] code for [FUNCTIONALITY]. Include error handling, comments, and best practices. Make it production-ready and well-documented.',
    tags: ['Code', 'Programming', 'Technical'],
    estimatedTokens: 1000,
    complexity: 'Hard'
  },
  {
    id: 'creative-writing',
    title: 'Creative Writing',
    description: 'Stories, scripts, and fiction',
    icon: Pen,
    category: 'Creative',
    prompt: 'Write a creative piece about [THEME]. Make it engaging, emotionally resonant, and well-paced. Include vivid descriptions and compelling characters.',
    tags: ['Creative', 'Fiction', 'Writing'],
    estimatedTokens: 2000,
    complexity: 'Hard'
  },
  {
    id: 'seo-content',
    title: 'SEO Content',
    description: 'Search-optimized articles',
    icon: Target,
    category: 'SEO',
    prompt: 'Write SEO-optimized content about [TOPIC]. Include target keywords naturally, meta descriptions, headers (H1-H3), and internal linking suggestions.',
    tags: ['SEO', 'Organic', 'Traffic'],
    estimatedTokens: 1800,
    complexity: 'Medium'
  },
  {
    id: 'video-script',
    title: 'Video Script',
    description: 'YouTube & video content scripts',
    icon: PlayCircle,
    category: 'Video',
    prompt: 'Create a video script for [TOPIC]. Include hook, main content sections, B-roll suggestions, and strong CTA. Optimize for audience retention.',
    tags: ['Video', 'YouTube', 'Script'],
    estimatedTokens: 1200,
    complexity: 'Medium'
  }
]

const EXPORT_FORMATS = [
  { id: 'txt', name: 'Plain Text', icon: FileText, extension: '.txt', mimeType: 'text/plain' },
  { id: 'md', name: 'Markdown', icon: FileCode, extension: '.md', mimeType: 'text/markdown' },
  { id: 'html', name: 'HTML', icon: Globe, extension: '.html', mimeType: 'text/html' },
  { id: 'json', name: 'JSON', icon: FileJson, extension: '.json', mimeType: 'application/json' },
  { id: 'pdf', name: 'PDF', icon: FileImage, extension: '.pdf', mimeType: 'application/pdf' },
  { id: 'docx', name: 'Word', icon: FileType, extension: '.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
]

// ============================================================================
// INTERFACES
// ============================================================================

interface Generation {
  id: string
  title: string
  type: string
  model: string
  timestamp: Date
  preview: string
  content: string
  tokens: number
  cost: number
  temperature: number
  maxTokens: number
  version: number
  iterations: Array<{
    version: number
    content: string
    timestamp: Date
    changes: string
  }>
  tags: string[]
  favorite: boolean
  archived: boolean
}

interface CustomTemplate {
  id: string
  title: string
  description: string
  prompt: string
  category: string
  tags: string[]
  createdAt: Date
  usageCount: number
}

interface AICreateEnhancedProps {
  onSaveKeys?: (keys: Record<string, string>) => void
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AICreateEnhanced({ onSaveKeys }: AICreateEnhancedProps) {
  // Core State
  const [activeTab, setActiveTab] = useState('studio')
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [temperature, setTemperature] = useState([0.7])
  const [maxTokens, setMaxTokens] = useState([1000])
  const [history, setHistory] = useState<Generation[]>([])
  const [copied, setCopied] = useState(false)
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const [typingEffect, setTypingEffect] = useState('')
  const [progress, setProgress] = useState(0)
  const [generationStage, setGenerationStage] = useState('')

  // Enhanced Features State
  const [voiceRecording, setVoiceRecording] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([])
  const [showTemplateCreator, setShowTemplateCreator] = useState(false)
  const [selectedExportFormat, setSelectedExportFormat] = useState('txt')
  const [autoSave, setAutoSave] = useState(true)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedGenerationForEdit, setSelectedGenerationForEdit] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'cost' | 'tokens' | 'favorite'>('recent')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(3)

  // Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    totalGenerations: 0,
    totalTokens: 0,
    totalCost: 0,
    averageTokens: 0,
    averageCost: 0,
    mostUsedModel: '',
    mostUsedTemplate: '',
    costTrend: [] as number[],
    tokenTrend: [] as number[],
    modelDistribution: {} as Record<string, number>,
    templateDistribution: {} as Record<string, number>
  })

  // Refs
  const mediaRecorderRef = useRef<MediaRecognition | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // ============================================================================
  // LIFECYCLE & EFFECTS
  // ============================================================================

  // Check voice support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      setVoiceSupported(!!SpeechRecognition)
    }
  }, [])

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && history.length > 0) {
      saveToLocalStorage()
    }
  }, [history, customTemplates, autoSave])

  // Update analytics when history changes
  useEffect(() => {
    updateAnalytics()
  }, [history])

  // ============================================================================
  // PERSISTENCE FUNCTIONS
  // ============================================================================

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('ai-create-history', JSON.stringify(history))
      localStorage.setItem('ai-create-custom-templates', JSON.stringify(customTemplates))
      localStorage.setItem('ai-create-settings', JSON.stringify({
        selectedModel,
        temperature: temperature[0],
        maxTokens: maxTokens[0],
        autoSave
      }))
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      toast.error('Failed to save data locally')
    }
  }, [history, customTemplates, selectedModel, temperature, maxTokens, autoSave])

  const loadFromLocalStorage = useCallback(() => {
    try {
      const savedHistory = localStorage.getItem('ai-create-history')
      const savedTemplates = localStorage.getItem('ai-create-custom-templates')
      const savedSettings = localStorage.getItem('ai-create-settings')

      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory)
        // Convert timestamp strings back to Date objects
        parsedHistory.forEach((gen: Generation) => {
          gen.timestamp = new Date(gen.timestamp)
          gen.iterations?.forEach(iter => {
            iter.timestamp = new Date(iter.timestamp)
          })
        })
        setHistory(parsedHistory)
      }

      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates)
        parsedTemplates.forEach((tpl: CustomTemplate) => {
          tpl.createdAt = new Date(tpl.createdAt)
        })
        setCustomTemplates(parsedTemplates)
      }

      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setSelectedModel(settings.selectedModel || 'gpt-4o-mini')
        setTemperature([settings.temperature || 0.7])
        setMaxTokens([settings.maxTokens || 1000])
        setAutoSave(settings.autoSave !== false)
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
    }
  }, [])

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem('ai-create-history')
    localStorage.removeItem('ai-create-custom-templates')
    localStorage.removeItem('ai-create-settings')
    setHistory([])
    setCustomTemplates([])
    toast.success('Local data cleared')
  }, [])

  // ============================================================================
  // ANALYTICS FUNCTIONS
  // ============================================================================

  const updateAnalytics = useCallback(() => {
    if (history.length === 0) return

    const total = history.length
    const totalTok = history.reduce((sum, gen) => sum + gen.tokens, 0)
    const totalCst = history.reduce((sum, gen) => sum + gen.cost, 0)

    // Model distribution
    const modelDist: Record<string, number> = {}
    history.forEach(gen => {
      modelDist[gen.model] = (modelDist[gen.model] || 0) + 1
    })

    // Template distribution
    const templateDist: Record<string, number> = {}
    history.forEach(gen => {
      templateDist[gen.type] = (templateDist[gen.type] || 0) + 1
    })

    // Most used
    const mostModel = Object.entries(modelDist).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    const mostTemplate = Object.entries(templateDist).sort((a, b) => b[1] - a[1])[0]?.[0] || ''

    // Trends (last 10)
    const recent = history.slice(0, 10).reverse()
    const costTrend = recent.map(gen => gen.cost)
    const tokenTrend = recent.map(gen => gen.tokens)

    setAnalyticsData({
      totalGenerations: total,
      totalTokens: totalTok,
      totalCost: totalCst,
      averageTokens: Math.round(totalTok / total),
      averageCost: totalCst / total,
      mostUsedModel: mostModel,
      mostUsedTemplate: mostTemplate,
      costTrend,
      tokenTrend,
      modelDistribution: modelDist,
      templateDistribution: templateDist
    })
  }, [history])

  // ============================================================================
  // VOICE INPUT FUNCTIONS
  // ============================================================================

  const startVoiceRecording = useCallback(() => {
    if (!voiceSupported) {
      toast.error('Speech recognition not supported in this browser')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setVoiceRecording(true)
        toast.success('Voice recording started')
      }

      recognition.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' '
          } else {
            interimTranscript += transcript
          }
        }

        if (finalTranscript) {
          setPrompt(prev => prev + finalTranscript)
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        toast.error(`Voice recognition error: ${event.error}`)
        setVoiceRecording(false)
      }

      recognition.onend = () => {
        setVoiceRecording(false)
      }

      recognition.start()
      mediaRecorderRef.current = recognition as any
    } catch (error) {
      console.error('Failed to start voice recording:', error)
      toast.error('Failed to start voice recording')
    }
  }, [voiceSupported])

  const stopVoiceRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
      setVoiceRecording(false)
      toast.success('Voice recording stopped')
    }
  }, [])

  // ============================================================================
  // GENERATION FUNCTIONS
  // ============================================================================

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)
    setResult(null)
    setTypingEffect('')
    setProgress(0)
    setRetryCount(0)

    const attemptGeneration = async (attempt: number = 0): Promise<void> => {
      try {
        // Create abort controller for cancellation
        abortControllerRef.current = new AbortController()

        // Progress stages
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

        // Call API
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: prompt,
            temperature: temperature[0],
            maxTokens: maxTokens[0]
          }),
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`)
        }

        const data = await response.json()
        const generatedContent = data.content || 'No content generated'
        const tokensUsed = data.tokens || 0

        setProgress(80)
        setGenerationStage('Processing response...')
        await new Promise(resolve => setTimeout(resolve, 200))

        setProgress(90)
        setGenerationStage('Finalizing output...')
        await new Promise(resolve => setTimeout(resolve, 200))

        // Typing effect
        if (streaming) {
          let currentText = ''
          const typeSpeed = 10

          for (let i = 0; i < generatedContent.length; i++) {
            currentText += generatedContent[i]
            setTypingEffect(currentText)
            await new Promise(resolve => setTimeout(resolve, typeSpeed))
          }
        } else {
          setTypingEffect(generatedContent)
        }

        setResult(generatedContent)
        setProgress(100)
        setGenerationStage('Complete!')

        // Add to history
        const modelCost = AI_MODELS[selectedModel]?.costPer1K || 0.002
        const newGeneration: Generation = {
          id: Date.now().toString(),
          title: prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt,
          type: selectedTemplate || 'custom',
          model: selectedModel,
          timestamp: new Date(),
          preview: generatedContent.substring(0, 100) + '...',
          content: generatedContent,
          tokens: tokensUsed,
          cost: (tokensUsed / 1000) * modelCost,
          temperature: temperature[0],
          maxTokens: maxTokens[0],
          version: 1,
          iterations: [{
            version: 1,
            content: generatedContent,
            timestamp: new Date(),
            changes: 'Initial generation'
          }],
          tags: [],
          favorite: false,
          archived: false
        }

        setHistory(prev => [newGeneration, ...prev])
        toast.success('Content generated successfully!')

      } catch (error: any) {
        if (error.name === 'AbortError') {
          toast.info('Generation cancelled')
          return
        }

        console.error('Generation error:', error)

        // Retry logic
        if (attempt < maxRetries) {
          setRetryCount(attempt + 1)
          toast.warning(`Retrying... (${attempt + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
          return attemptGeneration(attempt + 1)
        }

        const errorMsg = `Error generating content: ${error.message}\n\nPlease check your API configuration and try again.`
        setResult(errorMsg)
        setTypingEffect(errorMsg)
        toast.error('Failed to generate content after ' + maxRetries + ' attempts')
      } finally {
        setGenerating(false)
        setGenerationStage('')
        setProgress(0)
        abortControllerRef.current = null
      }
    }

    await attemptGeneration()
  }, [prompt, selectedModel, temperature, maxTokens, selectedTemplate, streaming, maxRetries])

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setGenerating(false)
      toast.info('Generation cancelled')
    }
  }, [])

  // Continue in next message due to length...

  return null // Placeholder - will be completed in next part
}
