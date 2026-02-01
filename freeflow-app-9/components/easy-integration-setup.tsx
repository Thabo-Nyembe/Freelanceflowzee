'use client'

/**
 * Easy Integration Setup Component
 *
 * Provides a simple, user-friendly interface for connecting integrations
 * with one-click OAuth, visual guidance, and real-time status updates.
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Calendar, CreditCard, MessageSquare, Users, Brain,
  Check, Loader2, ExternalLink, Shield, Zap, ArrowRight,
  CheckCircle, Info, Play, Settings as SettingsIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('EasyIntegrationSetup')

// ============================================================================
// INTEGRATION DEFINITIONS
// ============================================================================

interface IntegrationOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'email' | 'ai' | 'calendar' | 'payment' | 'sms' | 'crm'
  authType: 'oauth' | 'api-key' | 'manual'
  difficulty: 'easy' | 'medium'
  estimatedTime: string
  popular: boolean
  required: boolean
  benefits: string[]
  setupSteps: {
    title: string
    description: string
    action?: string
  }[]
}

const INTEGRATIONS: IntegrationOption[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Connect your Gmail account for automated email management',
    icon: <Mail className="w-6 h-6" />,
    category: 'email',
    authType: 'oauth',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    popular: true,
    required: true,
    benefits: [
      'Auto-reply to clients',
      'Email categorization',
      'Smart follow-ups',
      'Email templates'
    ],
    setupSteps: [
      {
        title: 'Click "Connect Gmail"',
        description: 'Opens Google OAuth in a new window',
        action: 'oauth'
      },
      {
        title: 'Grant Permissions',
        description: 'Allow KAZI to access your Gmail',
      },
      {
        title: 'Done!',
        description: 'Your Gmail is now connected',
      }
    ]
  },
  {
    id: 'outlook',
    name: 'Outlook',
    description: 'Connect Microsoft Outlook for email automation',
    icon: <Mail className="w-6 h-6" />,
    category: 'email',
    authType: 'oauth',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    popular: true,
    required: true,
    benefits: [
      'Outlook email integration',
      'Calendar sync',
      'Contact management',
      'Team collaboration'
    ],
    setupSteps: [
      {
        title: 'Click "Connect Outlook"',
        description: 'Opens Microsoft OAuth',
        action: 'oauth'
      },
      {
        title: 'Sign in with Microsoft',
        description: 'Use your Microsoft account',
      },
      {
        title: 'All Set!',
        description: 'Outlook is connected',
      }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Power your AI features with GPT-4',
    icon: <Brain className="w-6 h-6" />,
    category: 'ai',
    authType: 'api-key',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    popular: true,
    required: true,
    benefits: [
      'GPT-4 responses',
      'Smart suggestions',
      'Content generation',
      'Advanced automation'
    ],
    setupSteps: [
      {
        title: 'Get API Key',
        description: 'Visit platform.openai.com/api-keys',
        action: 'external'
      },
      {
        title: 'Copy & Paste',
        description: 'Enter your API key below',
      },
      {
        title: 'Test Connection',
        description: 'We\'ll verify it works',
      }
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    description: 'Use Claude AI for intelligent automation',
    icon: <Brain className="w-6 h-6" />,
    category: 'ai',
    authType: 'api-key',
    difficulty: 'easy',
    estimatedTime: '3 minutes',
    popular: true,
    required: false,
    benefits: [
      'Claude 3 access',
      'Long context windows',
      'Nuanced responses',
      'Fast processing'
    ],
    setupSteps: [
      {
        title: 'Get API Key',
        description: 'Visit console.anthropic.com',
        action: 'external'
      },
      {
        title: 'Enter Key',
        description: 'Paste your Anthropic API key',
      },
      {
        title: 'Verify',
        description: 'Test the connection',
      }
    ]
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your calendar for smart scheduling',
    icon: <Calendar className="w-6 h-6" />,
    category: 'calendar',
    authType: 'oauth',
    difficulty: 'easy',
    estimatedTime: '2 minutes',
    popular: true,
    required: false,
    benefits: [
      'Auto-schedule meetings',
      'Availability checking',
      'Meeting reminders',
      'Calendar automation'
    ],
    setupSteps: [
      {
        title: 'Connect Calendar',
        description: 'OAuth authentication',
        action: 'oauth'
      },
      {
        title: 'Select Calendars',
        description: 'Choose which calendars to sync',
      },
      {
        title: 'Ready!',
        description: 'Calendar integration complete',
      }
    ]
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage billing',
    icon: <CreditCard className="w-6 h-6" />,
    category: 'payment',
    authType: 'api-key',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    popular: true,
    required: false,
    benefits: [
      'Payment processing',
      'Invoice generation',
      'Subscription management',
      'Automated billing'
    ],
    setupSteps: [
      {
        title: 'Get API Keys',
        description: 'Dashboard → Developers → API Keys',
        action: 'external'
      },
      {
        title: 'Enter Keys',
        description: 'Add publishable and secret keys',
      },
      {
        title: 'Test Mode',
        description: 'Start with test keys first',
      }
    ]
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'Send SMS and WhatsApp messages',
    icon: <MessageSquare className="w-6 h-6" />,
    category: 'sms',
    authType: 'api-key',
    difficulty: 'medium',
    estimatedTime: '5 minutes',
    popular: false,
    required: false,
    benefits: [
      'SMS notifications',
      'WhatsApp messages',
      'Two-factor auth',
      'Customer alerts'
    ],
    setupSteps: [
      {
        title: 'Get Credentials',
        description: 'Account SID and Auth Token',
        action: 'external'
      },
      {
        title: 'Add Phone Number',
        description: 'Your Twilio phone number',
      },
      {
        title: 'Verify',
        description: 'Test SMS sending',
      }
    ]
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync CRM data and contacts',
    icon: <Users className="w-6 h-6" />,
    category: 'crm',
    authType: 'oauth',
    difficulty: 'medium',
    estimatedTime: '4 minutes',
    popular: false,
    required: false,
    benefits: [
      'Contact sync',
      'Deal tracking',
      'Pipeline automation',
      'Activity logging'
    ],
    setupSteps: [
      {
        title: 'Connect HubSpot',
        description: 'OAuth authentication',
        action: 'oauth'
      },
      {
        title: 'Select Data',
        description: 'Choose what to sync',
      },
      {
        title: 'Complete!',
        description: 'CRM is connected',
      }
    ]
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

interface EasyIntegrationSetupProps {
  onComplete?: () => void
  compact?: boolean
}

export function EasyIntegrationSetup({ onComplete, compact = false }: EasyIntegrationSetupProps) {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationOption | null>(null)
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set())
  const [currentStep, setCurrentStep] = useState(0)
  const [activeCategory, setActiveCategory] = useState<'all' | 'email' | 'ai' | 'calendar' | 'payment' | 'sms' | 'crm'>('all')

  const filteredIntegrations = activeCategory === 'all'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === activeCategory)

  const handleConnect = async (integration: IntegrationOption) => {
    logger.info('Starting integration connection', {
      integrationId: integration.id,
      authType: integration.authType
    })

    setSelectedIntegration(integration)
    setCurrentStep(0)

    if (integration.authType === 'oauth') {
      handleOAuthConnect(integration)
    }
  }

  const handleOAuthConnect = async (integration: IntegrationOption) => {
    setIsConnecting(true)

    try {
      logger.info('Initiating OAuth flow', { integrationId: integration.id })

      // Open OAuth window
      const width = 600
      const height = 700
      const left = window.screen.width / 2 - width / 2
      const top = window.screen.height / 2 - height / 2

      const authUrl = `/api/integrations/${integration.id}/auth`
      const popup = window.open(
        authUrl,
        'OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      // Listen for OAuth completion
      const checkPopup = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkPopup)
          setIsConnecting(false)

          // Check if successful
          setTimeout(() => {
            checkConnectionStatus(integration.id)
          }, 1000)
        }
      }, 500)

      toast.info(`Connecting ${integration.name}`, {
        description: 'Please complete the authentication in the popup window'
      })

    } catch (error) {
      logger.error('OAuth connection failed', {
        integrationId: integration.id,
        error: error.message
      })

      toast.error('Connection Failed', {
        description: error.message || 'Please try again'
      })

      setIsConnecting(false)
    }
  }

  const handleApiKeyConnect = async () => {
    if (!selectedIntegration || !apiKey.trim()) {
      toast.error('API Key Required', {
        description: 'Please enter your API key'
      })
      return
    }

    setIsConnecting(true)

    try {
      logger.info('Testing API key connection', {
        integrationId: selectedIntegration.id
      })

      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integrationId: selectedIntegration.id,
          apiKey
        })
      })

      const result = await response.json()

      if (result.success) {
        // Save the integration
        await fetch('/api/integrations/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            integrationId: selectedIntegration.id,
            apiKey
          })
        })

        setConnectedIntegrations(prev => new Set(prev).add(selectedIntegration.id))

        logger.info('Integration connected successfully', {
          integrationId: selectedIntegration.id
        })

        toast.success(`${selectedIntegration.name} Connected!`, {
          description: 'Your integration is now active and ready to use'
        })

        setSelectedIntegration(null)
        setApiKey('')
      } else {
        throw new Error(result.error || 'Connection test failed')
      }

    } catch (error) {
      logger.error('API key connection failed', {
        integrationId: selectedIntegration.id,
        error: error.message
      })

      toast.error('Connection Failed', {
        description: error.message || 'Please check your API key and try again'
      })

    } finally {
      setIsConnecting(false)
    }
  }

  const checkConnectionStatus = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations/status?id=${integrationId}`)
      const result = await response.json()

      if (result.connected) {
        setConnectedIntegrations(prev => new Set(prev).add(integrationId))

        const integration = INTEGRATIONS.find(i => i.id === integrationId)

        toast.success(`${integration?.name} Connected!`, {
          description: 'Your integration is active'
        })

        setSelectedIntegration(null)
      }
    } catch (error) {
      logger.error('Failed to check connection status', { integrationId, error })
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const connectedCount = connectedIntegrations.size
  const requiredConnected = INTEGRATIONS.filter(i => i.required && connectedIntegrations.has(i.id)).length
  const requiredTotal = INTEGRATIONS.filter(i => i.required).length
  const setupProgress = (requiredConnected / requiredTotal) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Easy Integration Setup
          </h2>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {connectedCount} / {INTEGRATIONS.length} Connected
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Connect your favorite tools in minutes. No technical knowledge required!
        </p>
      </div>

      {/* Progress Bar (Required Integrations) */}
      <Card className="border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Setup Progress</CardTitle>
            <Badge variant={setupProgress === 100 ? "default" : "secondary"}>
              {requiredConnected} / {requiredTotal} Required
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={setupProgress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {setupProgress === 100
              ? '✅ All required integrations connected! You\'re ready to go.'
              : `Connect ${requiredTotal - requiredConnected} more required integration${requiredTotal - requiredConnected !== 1 ? 's' : ''} to get started.`}
          </p>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Tabs value={activeCategory} onValueChange={(v: any) => setActiveCategory(v)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="crm">CRM</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredIntegrations.map((integration, index) => {
            const isConnected = connectedIntegrations.has(integration.id)

            return (
              <motion.div
                key={integration.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${isConnected ? 'border-green-500 border-2' : ''}`}>
                  {isConnected && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                  )}

                  {integration.popular && !isConnected && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">Popular</Badge>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                        {integration.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {integration.name}
                          {integration.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {integration.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Info Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getDifficultyColor(integration.difficulty)}>
                        {integration.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        <Zap className="w-3 h-3 mr-1" />
                        {integration.estimatedTime}
                      </Badge>
                      <Badge variant="outline">
                        {integration.authType === 'oauth' ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            One-Click
                          </>
                        ) : (
                          <>API Key</>
                        )}
                      </Badge>
                    </div>

                    {/* Benefits */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Benefits:</p>
                      <ul className="text-xs space-y-1">
                        {integration.benefits.slice(0, 3).map((benefit, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                            <span className="text-muted-foreground">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Button */}
                    {isConnected ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        <SettingsIcon className="w-4 h-4 mr-2" />
                        Settings
                      </Button>
                    ) : (
                      <Button
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        onClick={() => handleConnect(integration)}
                        disabled={isConnecting}
                      >
                        {isConnecting && selectedIntegration?.id === integration.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Connect Now
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Setup Modal for API Key Integrations */}
      <AnimatePresence>
        {selectedIntegration && selectedIntegration.authType === 'api-key' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedIntegration(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-background rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0">
                <CardHeader className="border-b">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                      {selectedIntegration.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl">
                        Connect {selectedIntegration.name}
                      </CardTitle>
                      <CardDescription>
                        Follow these simple steps to get started
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                  {/* Steps */}
                  <div className="space-y-4">
                    {selectedIntegration.setupSteps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{step.title}</h4>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.action === 'external' && (
                            <Button
                              variant="link"
                              size="sm"
                              className="pl-0 mt-1"
                              onClick={() => window.open(`https://${selectedIntegration.id === 'openai' ? 'platform.openai.com/api-keys' : selectedIntegration.id === 'anthropic' ? 'console.anthropic.com' : 'stripe.com/dashboard'}`, '_blank')}
                            >
                              Open in new tab
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* API Key Input */}
                  <div className="space-y-3">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={`Enter your ${selectedIntegration.name} API key`}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>

                  {/* Alert */}
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Estimated setup time: {selectedIntegration.estimatedTime}</AlertTitle>
                    <AlertDescription>
                      This is a one-time setup. Once connected, everything works automatically.
                    </AlertDescription>
                  </Alert>
                </CardContent>

                <div className="flex gap-3 p-6 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedIntegration(null)}
                    disabled={isConnecting}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={handleApiKeyConnect}
                    disabled={isConnecting || !apiKey.trim()}
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Connect {selectedIntegration.name}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Message */}
      {setupProgress === 100 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Setup Complete!</AlertTitle>
          <AlertDescription>
            All required integrations are connected. You're ready to automate your business!
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
