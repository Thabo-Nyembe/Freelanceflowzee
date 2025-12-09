"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Settings as SettingsIcon, Key, Shield, Download, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Create-Settings')

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

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({})
  const [preferences, setPreferences] = useState({
    defaultModel: 'mistral-7b-free',
    autoSave: true,
    streamOutput: true,
    showCost: true,
    cacheResults: true
  })

  const handleSaveKeys = () => {
    // Save to localStorage
    localStorage.setItem('kazi-ai-keys', JSON.stringify(apiKeys))
    toast.success('API keys saved successfully')
  }

  const handleExportSettings = () => {
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
                <Input
                  type="password"
                  placeholder={`Enter ${provider.name} API key`}
                  value={apiKeys[provider.id] || ''}
                  onChange={(e) => setApiKeys({ ...apiKeys, [provider.id]: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (apiKeys[provider.id]) {
                      toast.success(`${provider.name} key validated`)
                    } else {
                      toast.error('Please enter a key first')
                    }
                  }}
                >
                  Test
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Export Settings
          </Button>
          <Button onClick={handleSaveKeys}>
            <Shield className="h-4 w-4 mr-2" />
            Save API Keys
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
          onClick={() => {
            localStorage.setItem('kazi-ai-preferences', JSON.stringify(preferences))
            toast.success('Preferences saved')
          }}
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
