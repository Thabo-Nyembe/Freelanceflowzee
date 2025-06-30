"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const AI_PROVIDERS = {
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'google-ai': 'Google AI',
  'openrouter': 'OpenRouter'
} as const

type AIProvider = keyof typeof AI_PROVIDERS

interface AICreateProps {
  onSaveKeys?: (keys: Record<AIProvider, string>) => void
}

export function AICreate({ onSaveKeys }: AICreateProps) {
  const [apiKeys, setApiKeys] = useState<Partial<Record<AIProvider, string>>>({})
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Validate API key format
      if (!apiKeys[selectedProvider]?.trim()) {
        setError('Please enter a valid API key')
        return
      }

      // Simulate API key validation
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (onSaveKeys) {
        onSaveKeys(apiKeys as Record<AIProvider, string>)
      }

    } catch (err) {
      setError('Failed to save API key. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4" data-testid="ai-create">
      <Card>
        <CardHeader>
          <CardTitle>AI Provider Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue={selectedProvider} 
            onValueChange={(value) => setSelectedProvider(value as AIProvider)}
          >
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(AI_PROVIDERS).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  data-testid={`provider-${key}`}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(AI_PROVIDERS).map((provider) => (
              <TabsContent key={provider} value={provider}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`${provider}-api-key`}>
                      {AI_PROVIDERS[provider as AIProvider]} API Key
                    </Label>
                    <Input
                      id={`${provider}-api-key`}
                      type="password"
                      placeholder="Enter your API key"
                      value={apiKeys[provider as AIProvider] || ''}
                      onChange={(e) => setApiKeys(prev => ({
                        ...prev,
                        [provider]: e.target.value
                      }))}
                      disabled={saving}
                      data-testid={`${provider}-api-key-input`}
                    />
                  </div>

                  <Button
                    onClick={handleSave}
                    disabled={saving || !apiKeys[provider as AIProvider]?.trim()}
                    className="w-full"
                    data-testid={`${provider}-save-button`}
                  >
                    {saving ? 'Saving...' : 'Save API Key'}
                  </Button>

                  {error && (
                    <p className="text-sm text-red-500" data-testid="api-key-error">
                      {error}
                    </p>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
