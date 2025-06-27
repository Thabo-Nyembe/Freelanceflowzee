'use client

import { useState } from 'react
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface APIKeySettingsProps {
  onApiKeyUpdate: (provider: string, apiKey: string, isValid: boolean) => void
  onProviderChange: (provider: string) => void
}

export default function APIKeySettings({ onApiKeyUpdate, onProviderChange }: APIKeySettingsProps) {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('openai')
  const [isLoading, setIsLoading] = useState(false)
  const [validationMessage, setValidationMessage] = useState('')

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    onProviderChange(newProvider)
  }

  const handleValidateKey = async () => {
    setIsLoading(true)
    try {
      // Simulate API key validation
      const isValid = apiKey.length > 10
      onApiKeyUpdate(provider, apiKey, isValid)
      setValidationMessage(isValid ? 'API key is valid' : 'Invalid API key')
    } catch (error) {
      setValidationMessage('Failed to validate API key')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
            AI Provider
          </label>
          <Select value={provider} onValueChange={handleProviderChange}>
            <SelectTrigger data-testid="provider-select">
              <SelectValue placeholder="Select AI provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="google">Google AI</SelectItem>
              <SelectItem value="huggingface">Hugging Face</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
            API Key
          </label>
          <Input
            type="password
            id="apiKey
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key
            data-testid="api-key-input
          />
        </div>
        <Button
          onClick={handleValidateKey}
          disabled={isLoading}
          data-testid="validate-api-key-btn
        >
          {isLoading ? 'Validating...' : 'Validate Key'}
        </Button>
        {validationMessage && (
          <p className={`text-sm ${validationMessage.includes('valid') ? 'text-green-600' : 'text-red-600'}`}>
            {validationMessage}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
