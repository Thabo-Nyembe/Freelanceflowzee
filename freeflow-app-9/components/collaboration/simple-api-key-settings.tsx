'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Key, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Trash2,
  Plus,
  Save,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'

interface APIProvider {
  id: string
  name: string
  description: string
  website: string
  freeCredits: number
  costPerRequest: number
  supportedModels: string[]
  requiresApiKey: boolean
  hasFreeTier: boolean
  icon: any
}

interface APIKeyData {
  provider: string
  apiKey: string
  isValid: boolean
  lastValidated: Date | null
  requestsUsed: number
  requestsLimit: number
}

const API_PROVIDERS: APIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, DALL-E 3, and other advanced models',
    website: 'https://platform.openai.com',
    freeCredits: 18,
    costPerRequest: 0.002,
    supportedModels: ['GPT-4', 'GPT-3.5', 'DALL-E 3'],
    requiresApiKey: true,
    hasFreeTier: true,
    icon: Key
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet and other Claude models',
    website: 'https://console.anthropic.com',
    freeCredits: 25,
    costPerRequest: 0.003,
    supportedModels: ['Claude 3.5 Sonnet', 'Claude 3 Haiku'],
    requiresApiKey: true,
    hasFreeTier: true,
    icon: Shield
  },
  {
    id: 'google',
    name: 'Google AI',
    description: 'Gemini Pro and PaLM models',
    website: 'https://ai.google.dev',
    freeCredits: 60,
    costPerRequest: 0.001,
    supportedModels: ['Gemini Pro', 'PaLM 2'],
    requiresApiKey: true,
    hasFreeTier: true,
    icon: RefreshCw
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    description: 'Open source models and inference API',
    website: 'https://huggingface.co',
    freeCredits: 1000,
    costPerRequest: 0.0005,
    supportedModels: ['Stable Diffusion', 'CodeLlama'],
    requiresApiKey: true,
    hasFreeTier: true,
    icon: Plus
  }
]

interface APIKeySettingsProps {
  onApiKeyUpdate?: (provider: string, apiKey: string, isValid: boolean) => void
  onProviderChange?: (provider: string) => void
}

export default function APIKeySettings({ onApiKeyUpdate, onProviderChange }: APIKeySettingsProps) {
  const [userApiKeys, setUserApiKeys] = useState<Record<string, APIKeyData>>({})
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState<Record<string, boolean>>({})
  const [useCustomApi, setUseCustomApi] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('openai')

  // Load saved API keys from localStorage
  useEffect(() => {
    const savedKeys = localStorage.getItem('freeflow-api-keys')
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys)
        setUserApiKeys(parsed)
        setUseCustomApi(Object.keys(parsed).length > 0)
      } catch (error) {
        console.error('Failed to load saved API keys:', error)
      }
    }
  }, [])

  const saveApiKey = (providerId: string, apiKey: string) => {
    const newKeyData: APIKeyData = {
      provider: providerId,
      apiKey,
      isValid: false,
      lastValidated: null,
      requestsUsed: 0,
      requestsLimit: 1000
    }

    const updatedKeys = {
      ...userApiKeys,
      [providerId]: newKeyData
    }

    setUserApiKeys(updatedKeys)
    localStorage.setItem('freeflow-api-keys', JSON.stringify(updatedKeys))
    
    // Validate the key
    validateApiKey(providerId, apiKey)
    
    toast.success(`API key saved for ${API_PROVIDERS.find(p => p.id === providerId)?.name}`)
    
    // Notify parent component
    onApiKeyUpdate?.(providerId, apiKey, false)
  }

  const validateApiKey = async (providerId: string, apiKey: string) => {
    if (!apiKey.trim()) return

    setIsValidating(prev => ({ ...prev, [providerId]: true }))

    try {
      // Mock validation - in real app, this would make API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const isValid = apiKey.length > 10 && apiKey.startsWith('sk-') // Simple validation
      
      const updatedKeys = {
        ...userApiKeys,
        [providerId]: {
          ...userApiKeys[providerId],
          isValid,
          lastValidated: new Date()
        }
      }

      setUserApiKeys(updatedKeys)
      localStorage.setItem('freeflow-api-keys', JSON.stringify(updatedKeys))
      
      if (isValid) {
        toast.success(`API key validated successfully for ${API_PROVIDERS.find(p => p.id === providerId)?.name}`)
      } else {
        toast.error(`Invalid API key for ${API_PROVIDERS.find(p => p.id === providerId)?.name}`)
      }
      
      // Notify parent component
      onApiKeyUpdate?.(providerId, apiKey, isValid)
      
    } catch (error) {
      toast.error('Failed to validate API key')
    } finally {
      setIsValidating(prev => ({ ...prev, [providerId]: false }))
    }
  }

  const removeApiKey = (providerId: string) => {
    const updatedKeys = { ...userApiKeys }
    delete updatedKeys[providerId]
    
    setUserApiKeys(updatedKeys)
    localStorage.setItem('freeflow-api-keys', JSON.stringify(updatedKeys))
    
    toast.success(`API key removed for ${API_PROVIDERS.find(p => p.id === providerId)?.name}`)
  }

  const toggleApiKeyVisibility = (providerId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [providerId]: !prev[providerId]
    }))
  }

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
    onProviderChange?.(providerId)
  }

  const calculateMonthlySavings = () => {
    const validKeys = Object.values(userApiKeys).filter(k => k.isValid)
    if (validKeys.length === 0) return 0
    
    const avgRequestsPerMonth = 1000
    const platformCost = 0.01 // What we would charge
    const userCost = validKeys.reduce((acc, key) => {
      const provider = API_PROVIDERS.find(p => p.id === key.provider)
      return acc + (provider?.costPerRequest || 0)
    }, 0) / validKeys.length
    
    return (platformCost - userCost) * avgRequestsPerMonth
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Key className="h-5 w-5 text-blue-500" />
          Your API Keys
        </h3>
        <p className="text-sm text-muted-foreground">
          Use your own API keys to access free credits and save money
        </p>
      </div>

      {/* Benefits Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2 text-green-700">
            <DollarSign className="h-4 w-4" />
            Cost Savings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Monthly Savings:</span>
              <div className="text-lg font-bold text-green-600">
                ${calculateMonthlySavings().toFixed(2)}
              </div>
            </div>
            <div>
              <span className="font-medium">Free Credits Available:</span>
              <div className="text-lg font-bold text-blue-600">
                ${API_PROVIDERS.reduce((acc, p) => acc + p.freeCredits, 0)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enable Custom API Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Use Your Own API Keys</CardTitle>
              <CardDescription className="text-xs">
                Access free credits and reduce costs
              </CardDescription>
            </div>
            <Switch
              checked={useCustomApi}
              onCheckedChange={setUseCustomApi}
            />
          </div>
        </CardHeader>
      </Card>

      {useCustomApi && (
        <>
          {/* Provider Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Select AI Provider</CardTitle>
              <CardDescription className="text-xs">
                Choose which API to use for generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedProvider} onValueChange={handleProviderSelect}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {API_PROVIDERS.map((provider) => (
                    <TabsTrigger key={provider.id} value={provider.id} className="text-xs">
                      {provider.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* API Key Configuration */}
          <div className="space-y-4">
            {API_PROVIDERS.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <provider.icon className="h-4 w-4" />
                      <CardTitle className="text-sm">{provider.name}</CardTitle>
                      {userApiKeys[provider.id]?.isValid && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        ${provider.freeCredits} free
                      </Badge>
                      {provider.hasFreeTier && (
                        <Badge variant="outline" className="text-xs">
                          Free tier
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-xs">
                    {provider.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`api-key-${provider.id}`} className="text-xs">
                      API Key
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={`api-key-${provider.id}`}
                          type={showApiKeys[provider.id] ? 'text' : 'password'}
                          placeholder={`Enter your ${provider.name} API key`}
                          value={userApiKeys[provider.id]?.apiKey || ''}
                          onChange={(e) => {
                            const apiKey = e.target.value
                            setUserApiKeys(prev => ({
                              ...prev,
                              [provider.id]: {
                                ...prev[provider.id],
                                provider: provider.id,
                                apiKey,
                                isValid: false,
                                lastValidated: null,
                                requestsUsed: 0,
                                requestsLimit: 1000
                              }
                            }))
                          }}
                          className="text-xs pr-8"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={() => toggleApiKeyVisibility(provider.id)}
                        >
                          {showApiKeys[provider.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveApiKey(provider.id, userApiKeys[provider.id]?.apiKey || '')}
                        disabled={!userApiKeys[provider.id]?.apiKey || isValidating[provider.id]}
                        className="text-xs"
                      >
                        {isValidating[provider.id] ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Save className="h-3 w-3" />
                        )}
                      </Button>
                      {userApiKeys[provider.id] && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeApiKey(provider.id)}
                          className="text-xs"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      Get your API key from{' '}
                      <a 
                        href={provider.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {provider.website}
                      </a>
                    </span>
                    {userApiKeys[provider.id]?.lastValidated && (
                      <span>
                        Validated {new Date(userApiKeys[provider.id].lastValidated!).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {userApiKeys[provider.id]?.isValid && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-green-50 p-2 rounded">
                      <div>
                        <span className="font-medium">Requests Used:</span>
                        <div>{userApiKeys[provider.id].requestsUsed}/{userApiKeys[provider.id].requestsLimit}</div>
                      </div>
                      <div>
                        <span className="font-medium">Cost per Request:</span>
                        <div>${provider.costPerRequest.toFixed(4)}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Usage Tips */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                <AlertCircle className="h-4 w-4" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 text-blue-700">
              <div>• Start with free tier accounts to get free credits</div>
              <div>• Use multiple providers to maximize free allowances</div>
              <div>• Your API keys are stored securely in your browser</div>
              <div>• Switch providers anytime in Settings</div>
              <div>• Monitor usage to stay within free limits</div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 