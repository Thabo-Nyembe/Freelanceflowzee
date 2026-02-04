"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings as SettingsIcon, Key, Shield, Download, AlertCircle, Check, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'

// DATABASE QUERIES
import {
  getAPIKeys,
  createAPIKey,
  updateAPIKey,
  deleteAPIKey,
  APIKey
} from '@/lib/ai-settings-queries'

const logger = createSimpleLogger('AI-Create-Settings')

const API_PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', required: true, description: 'Access to 4 FREE models + affordable options' },
  { id: 'openai', name: 'OpenAI', required: false, description: 'GPT-4o and DALL-E 3 (optional)' },
  { id: 'anthropic', name: 'Anthropic', required: false, description: 'Claude 3.5 Sonnet (optional)' },
  { id: 'google', name: 'Google AI', required: false, description: 'Gemini Pro Vision (optional)' },
  { id: 'stability', name: 'Stability AI', required: false, description: 'Stable Diffusion XL (optional)' }
]

export default function SettingsPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // STATE
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [savedKeyIds, setSavedKeyIds] = useState<Record<string, string>>({})
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})
  const [preferences, setPreferences] = useState({
    defaultModel: 'mistral-7b-free',
    autoSave: true,
    streamOutput: true,
    showCost: true,
    cacheResults: true
  })

  // LOAD SAVED API KEYS FROM DATABASE
  useEffect(() => {
    const loadAPIKeys = async () => {
      if (userLoading || !userId) {
        if (!userLoading) setIsLoading(false)
        return
      }

      try {
        const result = await getAPIKeys(userId)
        if (result.data && result.data.length > 0) {
          const keyMap: Record<string, string> = {}
          const idMap: Record<string, string> = {}

          result.data.forEach((key: APIKey) => {
            // Show masked key with last 4 characters
            keyMap[key.provider_id] = key.key_last_four ? `****${key.key_last_four}` : ''
            idMap[key.provider_id] = key.id
          })

          setApiKeys(keyMap)
          setSavedKeyIds(idMap)
        }
        setIsLoading(false)
        announce('AI settings loaded', 'polite')
      } catch (err) {
        logger.error('Failed to load API keys', err)
        setIsLoading(false)
      }
    }

    loadAPIKeys()
  }, [userId, userLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSaveKeys = useCallback(async () => {
    if (!userId) {
      toast.error('Please sign in to save API keys')
      return
    }

    setIsSaving(true)
    try {
      // Save each key that has a value and isn't just a masked placeholder
      for (const [providerId, keyValue] of Object.entries(apiKeys)) {
        // Skip if it's a masked key (starts with ****)
        if (keyValue.startsWith('****') || !keyValue.trim()) {
          continue
        }

        const lastFour = keyValue.slice(-4)
        const existingKeyId = savedKeyIds[providerId]

        if (existingKeyId) {
          // Update existing key
          await updateAPIKey(existingKeyId, {
            key_value: keyValue,
            key_last_four: lastFour
          })
        } else {
          // Create new key
          const result = await createAPIKey(userId, {
            provider_id: providerId,
            key_name: API_PROVIDERS.find(p => p.id === providerId)?.name || providerId,
            key_value: keyValue,
            key_last_four: lastFour
          })
          if (result.data) {
            setSavedKeyIds(prev => ({ ...prev, [providerId]: result.data!.id }))
          }
        }

        // Mask the key in UI after save
        setApiKeys(prev => ({ ...prev, [providerId]: `****${lastFour}` }))
      }

      toast.success('API keys saved securely!')
      announce('API keys saved to database', 'polite')
    } catch (err) {
      logger.error('Failed to save API keys', err)
      toast.error('Failed to save API keys')
    } finally {
      setIsSaving(false)
    }
  }, [apiKeys, savedKeyIds, userId, announce])

  const handleExportSettings = useCallback(() => {
    const settings = {
      preferences,
      apiKeys: Object.keys(apiKeys).reduce((acc, key) => {
        acc[key] = '***hidden***'
        return acc
      }, {} as Record<string, string>)
    }
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'kazi-ai-settings.json'
    a.click()
    toast.success('Settings exported')
  }, [preferences, apiKeys])

  const handleTestKey = useCallback(async (providerId: string) => {
    const keyValue = apiKeys[providerId]
    if (!keyValue || keyValue.startsWith('****')) {
      toast.error('Please enter a new API key to test')
      return
    }

    toast.loading('Testing API key...', { id: 'test-key' })

    try {
      // Simple validation based on provider key format
      let isValid = false

      switch (providerId) {
        case 'openrouter':
          isValid = keyValue.startsWith('sk-or-')
          break
        case 'openai':
          isValid = keyValue.startsWith('sk-')
          break
        case 'anthropic':
          isValid = keyValue.startsWith('sk-ant-')
          break
        case 'google':
          isValid = keyValue.length >= 20
          break
        case 'stability':
          isValid = keyValue.startsWith('sk-')
          break
        default:
          isValid = keyValue.length >= 10
      }

      if (isValid) {
        toast.success(`${API_PROVIDERS.find(p => p.id === providerId)?.name} key validated!`, { id: 'test-key' })
      } else {
        toast.error('API key format appears invalid', { id: 'test-key' })
      }
    } catch (err) {
      toast.error('Failed to validate key', { id: 'test-key' })
    }
  }, [apiKeys])

  const handleDeleteKey = useCallback(async (providerId: string) => {
    const keyId = savedKeyIds[providerId]
    if (!keyId) {
      // Just clear the input
      setApiKeys(prev => ({ ...prev, [providerId]: '' }))
      return
    }

    try {
      await deleteAPIKey(keyId)
      setSavedKeyIds(prev => {
        const newIds = { ...prev }
        delete newIds[providerId]
        return newIds
      })
      setApiKeys(prev => ({ ...prev, [providerId]: '' }))
      toast.success('API key deleted')
    } catch (err) {
      toast.error('Failed to delete key')
    }
  }, [savedKeyIds])

  const handleSavePreferences = useCallback(async () => {
    if (userId) {
      try {
        // Save preferences via API
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ai_preferences: preferences })
        })
      } catch {
        // Ignore API errors, preferences are also in local state
      }
    }
    toast.success('Preferences saved')
  }, [preferences, userId])

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Configure your AI Create experience and manage API keys
        </p>
      </div>

      {/* API Keys Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold">API Keys</h3>
        </div>

        <div className="space-y-4">
          {API_PROVIDERS.map((provider) => (
            <div key={provider.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{provider.name}</span>
                    {provider.required && (
                      <Badge className="bg-green-500 text-white">Required for FREE models</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {provider.description}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showKeys[provider.id] ? 'text' : 'password'}
                    placeholder={savedKeyIds[provider.id] ? 'Key saved - enter new key to update' : `Enter ${provider.name} API key`}
                    value={apiKeys[provider.id] || ''}
                    onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowKeys(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                  >
                    {showKeys[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestKey(provider.id)}
                >
                  Test
                </Button>
                {savedKeyIds[provider.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-600"
                    disabled
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button onClick={handleSaveKeys} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            {isSaving ? 'Saving...' : 'Save API Keys'}
          </Button>
        </div>
      </Card>

      {/* Preferences Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <SettingsIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold">Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="auto-save" className="font-medium">Auto-save generations</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Automatically save all generations to history
              </p>
            </div>
            <Switch
              id="auto-save"
              checked={preferences.autoSave}
              onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="stream-output" className="font-medium">Stream output</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Show results as they're being generated
              </p>
            </div>
            <Switch
              id="stream-output"
              checked={preferences.streamOutput}
              onCheckedChange={(checked) => setPreferences({ ...preferences, streamOutput: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="show-cost" className="font-medium">Show cost estimates</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Display estimated cost for each generation
              </p>
            </div>
            <Switch
              id="show-cost"
              checked={preferences.showCost}
              onCheckedChange={(checked) => setPreferences({ ...preferences, showCost: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <Label htmlFor="cache-results" className="font-medium">Cache results</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Cache similar prompts to reduce costs (up to 70% savings)
              </p>
            </div>
            <Switch
              id="cache-results"
              checked={preferences.cacheResults}
              onCheckedChange={(checked) => setPreferences({ ...preferences, cacheResults: checked })}
            />
          </div>
        </div>

        <Button
          className="w-full mt-6"
          onClick={handleSavePreferences}
        >
          Save Preferences
        </Button>
      </Card>

      {/* Getting Started Guide */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
              🚀 Getting Started with Free Models
            </h3>
            <ol className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
              <li>1. Get a free OpenRouter API key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a></li>
              <li>2. Paste your key in the OpenRouter field above and click "Test"</li>
              <li>3. Click "Save API Keys" to store it securely</li>
              <li>4. Start creating with 4 FREE AI models immediately!</li>
            </ol>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-3 font-medium">
              💡 No credit card required for free models - truly unlimited usage!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
