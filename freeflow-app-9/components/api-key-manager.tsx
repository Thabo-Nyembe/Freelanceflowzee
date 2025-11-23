'use client'

/**
 * API Key Manager Component
 *
 * Allows users to manage their own API keys for all services (BYOK - Bring Your Own Key)
 * Reduces platform costs, gives users full control, and enables unlimited usage
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Eye, EyeOff, Plus, Trash2, Edit, Check, X, AlertCircle,
  Shield, DollarSign, TrendingUp, Zap, Copy, ExternalLink,
  CheckCircle, Clock, RefreshCw, Info, HelpCircle, Lock,
  Unlock, Settings, BarChart, FileText, Download, Upload,
  Star, Sparkles, Award, Target, Activity, Wifi, WifiOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('APIKeyManager')

// ============================================================================
// API KEY CONFIGURATIONS
// ============================================================================

interface APIKeyConfig {
  id: string
  name: string
  description: string
  icon: string
  category: 'ai' | 'email' | 'sms' | 'payment' | 'analytics' | 'storage' | 'other'
  required: boolean
  popular: boolean
  provider: string
  setupGuideUrl: string
  pricingUrl: string

  // Pricing info
  pricingModel: 'pay-per-use' | 'subscription' | 'free-tier' | 'freemium'
  estimatedCost: string
  freeTier?: string

  // Setup info
  setupDifficulty: 'easy' | 'medium' | 'hard'
  setupTime: string

  // Validation
  keyFormat: RegExp
  keyPrefix?: string
  testEndpoint?: string

  // Benefits
  benefits: string[]
  features: string[]

  // Usage limits
  rateLimits?: {
    requestsPerMinute?: number
    requestsPerDay?: number
    tokensPerRequest?: number
  }
}

const API_KEY_CONFIGS: APIKeyConfig[] = [
  // AI Providers
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5, and DALL-E for AI-powered features',
    icon: '🤖',
    category: 'ai',
    required: true,
    popular: true,
    provider: 'OpenAI',
    setupGuideUrl: 'https://platform.openai.com/docs/quickstart',
    pricingUrl: 'https://openai.com/pricing',
    pricingModel: 'pay-per-use',
    estimatedCost: '$0.01 - $0.10 per request',
    freeTier: '$18 free credits (first 3 months)',
    setupDifficulty: 'easy',
    setupTime: '2 minutes',
    keyFormat: /^sk-[a-zA-Z0-9]{48}$/,
    keyPrefix: 'sk-',
    benefits: [
      'Most advanced AI models',
      'Fast response times',
      'High accuracy',
      'Large context windows'
    ],
    features: [
      'GPT-4 Turbo',
      'GPT-3.5 Turbo',
      'DALL-E 3',
      'Whisper (audio)',
      'Embeddings'
    ],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerDay: 10000,
      tokensPerRequest: 128000
    }
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Claude 3 (Opus, Sonnet, Haiku) for intelligent automation',
    icon: '🧠',
    category: 'ai',
    required: false,
    popular: true,
    provider: 'Anthropic',
    setupGuideUrl: 'https://docs.anthropic.com/claude/docs',
    pricingUrl: 'https://www.anthropic.com/pricing',
    pricingModel: 'pay-per-use',
    estimatedCost: '$0.01 - $0.15 per request',
    freeTier: '$5 free credits',
    setupDifficulty: 'easy',
    setupTime: '2 minutes',
    keyFormat: /^sk-ant-[a-zA-Z0-9_-]{95}$/,
    keyPrefix: 'sk-ant-',
    benefits: [
      'Long context (200K tokens)',
      'Very accurate',
      'Great for analysis',
      'Ethical AI focus'
    ],
    features: [
      'Claude 3 Opus',
      'Claude 3 Sonnet',
      'Claude 3 Haiku',
      '200K context window',
      'Vision capabilities'
    ],
    rateLimits: {
      requestsPerMinute: 50,
      requestsPerDay: 5000,
      tokensPerRequest: 200000
    }
  },

  // Email Services
  {
    id: 'resend',
    name: 'Resend',
    description: 'Modern email API for transactional emails',
    icon: '📧',
    category: 'email',
    required: false,
    popular: true,
    provider: 'Resend',
    setupGuideUrl: 'https://resend.com/docs',
    pricingUrl: 'https://resend.com/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free up to 3,000/month, then $0.001/email',
    freeTier: '3,000 emails/month forever',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^re_[a-zA-Z0-9]{32}$/,
    keyPrefix: 're_',
    benefits: [
      '99.99% uptime',
      'Fast delivery',
      'Great deliverability',
      'Generous free tier'
    ],
    features: [
      'Transactional emails',
      'Email templates',
      'Webhooks',
      'Email analytics',
      'Custom domains'
    ]
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Enterprise email delivery platform',
    icon: '✉️',
    category: 'email',
    required: false,
    popular: false,
    provider: 'Twilio SendGrid',
    setupGuideUrl: 'https://docs.sendgrid.com',
    pricingUrl: 'https://sendgrid.com/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free up to 100/day, then $19.95/month',
    freeTier: '100 emails/day forever',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/,
    keyPrefix: 'SG.',
    benefits: [
      'Industry leader',
      'Advanced analytics',
      'High deliverability',
      'Enterprise support'
    ],
    features: [
      'Marketing campaigns',
      'A/B testing',
      'Email validation',
      'Inbox testing',
      'Dedicated IPs'
    ]
  },

  // SMS & Communication
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS, WhatsApp, and voice communications',
    icon: '📱',
    category: 'sms',
    required: false,
    popular: true,
    provider: 'Twilio',
    setupGuideUrl: 'https://www.twilio.com/docs',
    pricingUrl: 'https://www.twilio.com/pricing',
    pricingModel: 'pay-per-use',
    estimatedCost: '$0.0079/SMS, $0.005/WhatsApp',
    freeTier: '$15 free trial credit',
    setupDifficulty: 'medium',
    setupTime: '5 minutes',
    keyFormat: /^[A-Z0-9]{32}$/,
    benefits: [
      'Global coverage',
      'High reliability',
      'Multiple channels',
      'Rich features'
    ],
    features: [
      'SMS',
      'WhatsApp Business',
      'Voice calls',
      'Video',
      'Verify API',
      'Programmable chat'
    ]
  },

  // Payment Processing
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and invoicing',
    icon: '💳',
    category: 'payment',
    required: false,
    popular: true,
    provider: 'Stripe',
    setupGuideUrl: 'https://stripe.com/docs',
    pricingUrl: 'https://stripe.com/pricing',
    pricingModel: 'pay-per-use',
    estimatedCost: '2.9% + $0.30 per transaction',
    setupDifficulty: 'medium',
    setupTime: '5 minutes',
    keyFormat: /^(sk_test_|sk_live_)[a-zA-Z0-9]{24}$/,
    keyPrefix: 'sk_',
    benefits: [
      'Industry standard',
      'Easy integration',
      'Global support',
      'Advanced features'
    ],
    features: [
      'Payment processing',
      'Subscriptions',
      'Invoicing',
      'Payment links',
      'Fraud prevention',
      'Revenue analytics'
    ]
  },

  // Analytics
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Website and app analytics',
    icon: '📊',
    category: 'analytics',
    required: false,
    popular: true,
    provider: 'Google',
    setupGuideUrl: 'https://developers.google.com/analytics',
    pricingUrl: 'https://marketingplatform.google.com/about/analytics/pricing/',
    pricingModel: 'free-tier',
    estimatedCost: 'Free (up to 10M hits/month)',
    freeTier: 'Free forever (GA4)',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^G-[A-Z0-9]{10}$/,
    keyPrefix: 'G-',
    benefits: [
      'Completely free',
      'Industry standard',
      'Rich insights',
      'Easy to use'
    ],
    features: [
      'User tracking',
      'Event tracking',
      'Conversion tracking',
      'Custom reports',
      'Real-time data',
      'Integration with Google Ads'
    ]
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics and user insights',
    icon: '📈',
    category: 'analytics',
    required: false,
    popular: false,
    provider: 'Mixpanel',
    setupGuideUrl: 'https://docs.mixpanel.com',
    pricingUrl: 'https://mixpanel.com/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free up to 100K MTUs, then $25/month',
    freeTier: '100K monthly tracked users',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^[a-f0-9]{32}$/,
    benefits: [
      'User-centric analytics',
      'Funnel analysis',
      'Cohort tracking',
      'A/B testing'
    ],
    features: [
      'Event tracking',
      'User profiles',
      'Funnels',
      'Retention analysis',
      'A/B testing',
      'Alerts'
    ]
  },

  // Storage
  {
    id: 'aws-s3',
    name: 'AWS S3',
    description: 'Cloud file storage and CDN',
    icon: '☁️',
    category: 'storage',
    required: false,
    popular: true,
    provider: 'Amazon Web Services',
    setupGuideUrl: 'https://docs.aws.amazon.com/s3',
    pricingUrl: 'https://aws.amazon.com/s3/pricing',
    pricingModel: 'pay-per-use',
    estimatedCost: '$0.023/GB/month + transfer costs',
    freeTier: '5GB storage + 20K GET requests/month (12 months)',
    setupDifficulty: 'medium',
    setupTime: '5 minutes',
    keyFormat: /^[A-Z0-9]{20}$/,
    benefits: [
      'Industry leader',
      'High reliability',
      'Global CDN',
      'Scalable'
    ],
    features: [
      'Object storage',
      'CDN (CloudFront)',
      'Versioning',
      'Encryption',
      'Access control',
      'Lifecycle policies'
    ]
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    description: 'Image and video management with transformations',
    icon: '🖼️',
    category: 'storage',
    required: false,
    popular: true,
    provider: 'Cloudinary',
    setupGuideUrl: 'https://cloudinary.com/documentation',
    pricingUrl: 'https://cloudinary.com/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free up to 25GB, then $99/month',
    freeTier: '25GB storage + 25GB bandwidth/month',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^[a-zA-Z0-9_-]{15,}$/,
    benefits: [
      'Image optimization',
      'On-the-fly transforms',
      'AI features',
      'Generous free tier'
    ],
    features: [
      'Image/video upload',
      'Transformations',
      'AI tagging',
      'Face detection',
      'Lazy loading',
      'Responsive images'
    ]
  },

  // Other Services
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code hosting and version control',
    icon: '💻',
    category: 'other',
    required: false,
    popular: false,
    provider: 'GitHub',
    setupGuideUrl: 'https://docs.github.com',
    pricingUrl: 'https://github.com/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free for public repos, $4/user/month for private',
    freeTier: 'Unlimited public repos',
    setupDifficulty: 'easy',
    setupTime: '2 minutes',
    keyFormat: /^(ghp_|github_pat_)[a-zA-Z0-9]{36,255}$/,
    keyPrefix: 'ghp_',
    benefits: [
      'Industry standard',
      'Free for open source',
      'CI/CD included',
      'Large community'
    ],
    features: [
      'Git hosting',
      'Issues & projects',
      'Actions (CI/CD)',
      'Code review',
      'Wiki & docs',
      'Packages'
    ]
  },
  {
    id: 'sentry',
    name: 'Sentry',
    description: 'Error tracking and performance monitoring',
    icon: '🐛',
    category: 'other',
    required: false,
    popular: false,
    provider: 'Sentry',
    setupGuideUrl: 'https://docs.sentry.io',
    pricingUrl: 'https://sentry.io/pricing',
    pricingModel: 'freemium',
    estimatedCost: 'Free up to 5K errors/month, then $26/month',
    freeTier: '5,000 errors/month + 10K performance units',
    setupDifficulty: 'easy',
    setupTime: '3 minutes',
    keyFormat: /^[a-f0-9]{32}$/,
    benefits: [
      'Real-time alerts',
      'Stack traces',
      'Release tracking',
      'Performance monitoring'
    ],
    features: [
      'Error tracking',
      'Performance monitoring',
      'Release tracking',
      'Source maps',
      'Breadcrumbs',
      'User feedback'
    ]
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

interface UserAPIKey {
  id: string
  configId: string
  keyValue: string
  nickname?: string
  environment: 'production' | 'test'
  isActive: boolean
  createdAt: string
  lastUsed?: string
  usageCount: number
  estimatedCost: number
  status: 'active' | 'inactive' | 'expired' | 'invalid'
}

export function APIKeyManager() {
  const [apiKeys, setApiKeys] = useState<UserAPIKey[]>([])
  const [selectedConfig, setSelectedConfig] = useState<APIKeyConfig | null>(null)
  const [isAddingKey, setIsAddingKey] = useState(false)
  const [isTestingKey, setIsTestingKey] = useState(false)
  const [showKeyValues, setShowKeyValues] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'all' | 'ai' | 'email' | 'sms' | 'payment' | 'analytics' | 'storage' | 'other'>('all')

  // Form state
  const [newKey, setNewKey] = useState('')
  const [keyNickname, setKeyNickname] = useState('')
  const [keyEnvironment, setKeyEnvironment] = useState<'production' | 'test'>('production')

  useEffect(() => {
    loadAPIKeys()
  }, [])

  const loadAPIKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys')
      const result = await response.json()

      if (result.success) {
        setApiKeys(result.data || [])
        logger.info('API keys loaded', { count: result.data?.length || 0 })
      }
    } catch (error: any) {
      logger.error('Failed to load API keys', { error: error.message })
    }
  }

  const handleAddKey = async () => {
    if (!selectedConfig || !newKey.trim()) {
      toast.error('Missing Information', {
        description: 'Please enter an API key'
      })
      return
    }

    // Validate key format
    if (selectedConfig.keyFormat && !selectedConfig.keyFormat.test(newKey)) {
      toast.error('Invalid Key Format', {
        description: `Key should start with "${selectedConfig.keyPrefix || ''}" and match the expected format`
      })
      return
    }

    setIsTestingKey(true)

    try {
      logger.info('Adding API key', {
        configId: selectedConfig.id,
        provider: selectedConfig.provider,
        environment: keyEnvironment
      })

      // Test the key first
      const testResponse = await fetch('/api/user/api-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configId: selectedConfig.id,
          keyValue: newKey,
          environment: keyEnvironment
        })
      })

      const testResult = await testResponse.json()

      if (!testResult.success) {
        throw new Error(testResult.error || 'Key validation failed')
      }

      // Save the key
      const saveResponse = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configId: selectedConfig.id,
          keyValue: newKey,
          nickname: keyNickname || undefined,
          environment: keyEnvironment
        })
      })

      const saveResult = await saveResponse.json()

      if (saveResult.success) {
        toast.success(`${selectedConfig.name} Key Added!`, {
          description: 'Your API key has been saved and is ready to use'
        })

        logger.info('API key added successfully', {
          configId: selectedConfig.id,
          keyId: saveResult.data.id
        })

        // Reload keys
        await loadAPIKeys()

        // Reset form
        setSelectedConfig(null)
        setNewKey('')
        setKeyNickname('')
        setIsAddingKey(false)
      } else {
        throw new Error(saveResult.error || 'Failed to save API key')
      }

    } catch (error: any) {
      logger.error('Failed to add API key', {
        configId: selectedConfig.id,
        error: error.message
      })

      toast.error('Failed to Add Key', {
        description: error.message || 'Please check your key and try again'
      })
    } finally {
      setIsTestingKey(false)
    }
  }

  const handleDeleteKey = async (keyId: string) => {
    try {
      const key = apiKeys.find(k => k.id === keyId)
      if (!key) return

      logger.info('Deleting API key', { keyId })

      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Key Deleted', {
          description: 'API key has been removed'
        })

        await loadAPIKeys()
      } else {
        throw new Error(result.error || 'Failed to delete key')
      }
    } catch (error: any) {
      logger.error('Failed to delete API key', { keyId, error: error.message })
      toast.error('Deletion Failed', {
        description: error.message
      })
    }
  }

  const handleToggleKeyVisibility = (keyId: string) => {
    const newSet = new Set(showKeyValues)
    if (newSet.has(keyId)) {
      newSet.delete(keyId)
    } else {
      newSet.add(keyId)
    }
    setShowKeyValues(newSet)
  }

  const handleCopyKey = (keyValue: string) => {
    navigator.clipboard.writeText(keyValue)
    toast.success('Copied!', {
      description: 'API key copied to clipboard'
    })
  }

  const getConfigForKey = (configId: string) => {
    return API_KEY_CONFIGS.find(c => c.id === configId)
  }

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••'
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  const filteredConfigs = activeTab === 'all'
    ? API_KEY_CONFIGS
    : API_KEY_CONFIGS.filter(c => c.category === activeTab)

  const connectedCount = apiKeys.filter(k => k.isActive).length
  const totalCost = apiKeys.reduce((sum, k) => sum + k.estimatedCost, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            API Key Manager
          </h2>
          <p className="text-muted-foreground mt-2">
            Use your own API keys for full control and unlimited usage
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={() => setIsAddingKey(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add API Key
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Connected Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {API_KEY_CONFIGS.length} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estimated Monthly Cost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">
              You're in full control
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total API Calls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {apiKeys.reduce((sum, k) => sum + k.usageCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              across all services
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Banner */}
      <Alert className="border-purple-500 bg-purple-50 dark:bg-purple-950">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertTitle>Why Use Your Own API Keys? (BYOK)</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Full Control:</strong> Use any provider you prefer</li>
            <li><strong>Unlimited Usage:</strong> No platform limits or quotas</li>
            <li><strong>Lower Costs:</strong> Pay providers directly, no markup</li>
            <li><strong>Better Privacy:</strong> Your data goes direct to provider</li>
            <li><strong>Free Tiers:</strong> Take advantage of provider free tiers</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* API Keys Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredConfigs.map((config) => {
          const userKey = apiKeys.find(k => k.configId === config.id && k.isActive)
          const isConnected = !!userKey

          return (
            <Card key={config.id} className={isConnected ? 'border-green-500 border-2' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{config.icon}</span>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.name}
                        {config.required && (
                          <Badge variant="destructive" className="text-xs">Required</Badge>
                        )}
                        {config.popular && !config.required && (
                          <Badge variant="secondary" className="text-xs">Popular</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  {isConnected && (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Pricing Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{config.estimatedCost}</span>
                  </div>
                  {config.freeTier && (
                    <div className="text-xs text-green-600 bg-green-50 dark:bg-green-950 p-2 rounded">
                      🎁 {config.freeTier}
                    </div>
                  )}
                </div>

                {/* Setup Info */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {config.setupTime}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {config.setupDifficulty}
                  </Badge>
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-xs font-semibold mb-2">Benefits:</p>
                  <div className="flex flex-wrap gap-1">
                    {config.benefits.slice(0, 3).map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Connected Key Info */}
                {isConnected && userKey && (
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3 h-3" />
                        <span className="text-xs font-mono">
                          {showKeyValues.has(userKey.id) ? userKey.keyValue : maskKey(userKey.keyValue)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleKeyVisibility(userKey.id)}
                        >
                          {showKeyValues.has(userKey.id) ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCopyKey(userKey.keyValue)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Used {userKey.usageCount.toLocaleString()} times</span>
                      <Badge variant="outline" className="text-xs">
                        {userKey.environment}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(config.setupGuideUrl, '_blank')}
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Docs
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => userKey && handleDeleteKey(userKey.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        size="sm"
                        onClick={() => {
                          setSelectedConfig(config)
                          setIsAddingKey(true)
                        }}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Key
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(config.setupGuideUrl, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Add Key Dialog */}
      <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-4xl">{selectedConfig?.icon}</span>
              Add {selectedConfig?.name} API Key
            </DialogTitle>
            <DialogDescription>
              Get your API key from {selectedConfig?.provider} and paste it below
            </DialogDescription>
          </DialogHeader>

          {selectedConfig && (
            <div className="space-y-6">
              {/* Setup Instructions */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>How to Get Your API Key</AlertTitle>
                <AlertDescription>
                  <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>
                      Visit{' '}
                      <a
                        href={selectedConfig.setupGuideUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {selectedConfig.provider} API Keys Page
                      </a>
                    </li>
                    <li>Create a new API key (look for "Create API Key" or similar)</li>
                    <li>Copy the key (it usually starts with "{selectedConfig.keyPrefix}")</li>
                    <li>Paste it below</li>
                  </ol>
                </AlertDescription>
              </Alert>

              {/* Pricing Info */}
              {selectedConfig.freeTier && (
                <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <AlertTitle>Free Tier Available!</AlertTitle>
                  <AlertDescription>
                    {selectedConfig.freeTier}
                    <br />
                    <a
                      href={selectedConfig.pricingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline text-sm mt-1 inline-block"
                    >
                      View full pricing →
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              {/* Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key *</Label>
                  <Input
                    type="password"
                    placeholder={`${selectedConfig.keyPrefix || ''}...`}
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your key is encrypted and stored securely
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Nickname (Optional)</Label>
                  <Input
                    placeholder="e.g., Production, Test, Personal"
                    value={keyNickname}
                    onChange={(e) => setKeyNickname(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Select value={keyEnvironment} onValueChange={(v: any) => setKeyEnvironment(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="test">Test / Development</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingKey(false)
                setSelectedConfig(null)
                setNewKey('')
                setKeyNickname('')
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={handleAddKey}
              disabled={isTestingKey || !newKey.trim()}
            >
              {isTestingKey ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Add & Test Key
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
