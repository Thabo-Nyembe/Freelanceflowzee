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
  Cpu
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

// Mock Recent Generations
const RECENT_GENERATIONS = [
  {
    id: '1',
    title: 'How to Build a Successful SaaS Product',
    type: 'blog-post',
    model: 'gpt-4o',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    preview: 'Building a successful SaaS product requires careful planning, market research, and continuous iteration...',
    tokens: 1247,
    cost: 0.0025
  },
  {
    id: '2',
    title: '5 LinkedIn Posts for Product Launch',
    type: 'social-media',
    model: 'claude-3-5-sonnet',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    preview: '🚀 Excited to announce our latest product launch! After months of development...',
    tokens: 845,
    cost: 0.0017
  }
]

interface AICreateProps {
  onSaveKeys?: (keys: Record<string, string>) => void
}

export function AICreate({ onSaveKeys }: AICreateProps) {
  // State Management (15 variables as per MD)
  const [activeTab, setActiveTab] = React.useState('studio')
  const [selectedModel, setSelectedModel] = React.useState('gpt-4o-mini')
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null)
  const [prompt, setPrompt] = React.useState('')
  const [generating, setGenerating] = React.useState(false)
  const [result, setResult] = React.useState<string | null>(null)
  const [temperature, setTemperature] = React.useState([0.7])
  const [maxTokens, setMaxTokens] = React.useState([1000])
  const [history, setHistory] = React.useState(RECENT_GENERATIONS)
  const [copied, setCopied] = React.useState(false)
  const [savedTemplates] = React.useState<string[]>(['blog-post', 'email-campaign'])
  const [hoveredTemplate, setHoveredTemplate] = React.useState<string | null>(null)
  const [typingEffect, setTypingEffect] = React.useState('')
  const [progress, setProgress] = React.useState(0)
  const [generationStage, setGenerationStage] = React.useState('')

  // Main Generation Handler
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }

    setGenerating(true)
    setResult(null)
    setTypingEffect('')
    setProgress(0)

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

      // Call API
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
      const generatedContent = data.content || 'No content generated'
      const tokensUsed = data.tokens || 0

      setProgress(80)
      setGenerationStage('Processing response...')
      await new Promise(resolve => setTimeout(resolve, 200))

      setProgress(90)
      setGenerationStage('Finalizing output...')
      await new Promise(resolve => setTimeout(resolve, 200))

      // Typing effect
      let currentText = ''
      const typeSpeed = 10 // 10ms per character

      for (let i = 0; i < generatedContent.length; i++) {
        currentText += generatedContent[i]
        setTypingEffect(currentText)
        await new Promise(resolve => setTimeout(resolve, typeSpeed))
      }

      setResult(generatedContent)
      setProgress(100)
      setGenerationStage('Complete!')

      // Add to history
      const newGeneration = {
        id: Date.now().toString(),
        title: prompt.length > 50 ? `${prompt.substring(0, 50)}...` : prompt,
        type: selectedTemplate || 'custom',
        model: selectedModel,
        timestamp: new Date(),
        preview: generatedContent.substring(0, 100) + '...',
        tokens: tokensUsed,
        cost: (tokensUsed / 1000) * 0.002
      }

      setHistory(prev => [newGeneration, ...prev])
      toast.success('Content generated successfully!')

    } catch (error: any) {
      console.error('Generation error:', error)
      const errorMsg = `Error generating content: ${error.message}\n\nPlease check your API configuration and try again.`
      setResult(errorMsg)
      setTypingEffect(errorMsg)
      toast.error('Failed to generate content')
    } finally {
      setGenerating(false)
      setGenerationStage('')
      setProgress(0)
    }
  }

  // Template Selection Handler
  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.id)
    setPrompt(template.prompt)
    setActiveTab('studio')
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

  // Download Result Handler
  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-generated-${selectedTemplate || 'custom'}-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Downloaded!')
    }
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
                <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                  <motion.div
                    className="absolute top-2 bottom-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md"
                    layoutId="activeAITab"
                    style={{
                      left: `${['settings', 'studio', 'templates', 'history'].indexOf(activeTab) * 25}%`,
                      width: '25%'
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
                    <Label htmlFor="prompt">Your Prompt</Label>
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

                  {/* Result Display */}
                  {(typingEffect || result) && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <Label>Generated Content</Label>
                        <div className="flex gap-2">
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
                            Download
                          </Button>
                        </div>
                      </div>
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

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Content Templates</h3>
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
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Generations</h3>
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
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => (
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
                                  <CardTitle className="text-base">{item.title}</CardTitle>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                      {AI_MODELS[item.model]?.name}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {CONTENT_TEMPLATES.find(t => t.id === item.type)?.title || 'Custom'}
                                    </Badge>
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
    </div>
  )
}
