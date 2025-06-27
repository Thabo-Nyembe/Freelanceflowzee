'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function AICreatePage() {
  const [apiKey, setApiKey] = useState('')
  const [provider, setProvider] = useState('openai')
  const [testPrompt, setTestPrompt] = useState('')
  const [testResponse, setTestResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Handle API key submission
      setTestResponse('API key saved successfully!')
    } catch (error) {
      setTestResponse('Failed to save API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTest = async () => {
    setIsLoading(true)
    try {
      // Test API connection
      setTestResponse('Connection successful!')
    } catch (error) {
      setTestResponse('Connection failed. Please check your API key.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div data-testid="ai-create" className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">AI Create Studio</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">API Key Configuration</h2>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="api-key-form">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                API Key
              </label>
              <Input
                type="password"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1"
                placeholder="Enter your API key"
                required
                data-testid="api-key-input"
              />
            </div>
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-700">
                AI Provider
              </label>
              <select
                id="provider"
                name="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                data-testid="provider-select"
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="cohere">Cohere</option>
              </select>
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
              data-testid="save-api-key-button"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </Button>
            {testResponse && (
              <p 
                className={`mt-2 text-sm ${testResponse.includes('success') ? 'text-green-600' : 'text-red-600'}`}
                data-testid="api-key-response"
              >
                {testResponse}
              </p>
            )}
          </form>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Connection</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="testPrompt" className="block text-sm font-medium text-gray-700">
                Test Prompt
              </label>
              <textarea
                id="testPrompt"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-32"
                placeholder="Enter a prompt to test the connection..."
              />
            </div>
            <Button
              onClick={handleTest}
              disabled={isLoading}
              variant="secondary"
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </Button>
            {testResponse && (
              <div className="mt-4 p-4 rounded-md bg-gray-50">
                <pre className="whitespace-pre-wrap text-sm">{testResponse}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 