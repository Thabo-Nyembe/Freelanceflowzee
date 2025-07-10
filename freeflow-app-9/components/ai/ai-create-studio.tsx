"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Wand2, Copy, Download, RefreshCw, FileText, Image, Code, Mail, Sparkles, Zap } from 'lucide-react'

const MODELS = {
  'gpt-4o-mini': 'GPT-4o Mini',
  'gpt-4o': 'GPT-4o',
  'claude-3-5-sonnet': 'Claude 3.5 Sonnet',
  'claude-3-haiku': 'Claude 3 Haiku'
}

const CONTENT_TYPES = {
  'text': { label: 'Text Content', icon: FileText, color: 'bg-blue-500' },
  'image': { label: 'Image Description', icon: Image, color: 'bg-purple-500' },
  'code': { label: 'Code Generation', icon: Code, color: 'bg-green-500' },
  'email': { label: 'Email Writing', icon: Mail, color: 'bg-orange-500' }
}

interface AICreateStudioProps {
  onGenerate?: (result: string) => void
  defaultModel?: keyof typeof MODELS
}

type ContentType = keyof typeof CONTENT_TYPES

export const AICreateStudio = memo(function AICreateStudio({
  onGenerate: unknown, defaultModel = 'gpt-4o-mini'
}: AICreateStudioProps) {
  const [prompt, setPrompt] = useState<any>('')
  const [generating, setGenerating] = useState<any>(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>(defaultModel)
  const [contentType, setContentType] = useState<ContentType>('text')
  const [temperature, setTemperature] = useState<any>([0.7])
  const [maxTokens, setMaxTokens] = useState<any>([1000])
  const [history, setHistory] = useState<Array<{prompt: string, result: string, timestamp: Date}>>([])
  const [copied, setCopied] = useState<any>(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      setGenerating(true)
      setError(null)
      setResult(null)

      // Call AI generation API
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          type: contentType,
          temperature: temperature[0],
          maxTokens: maxTokens[0]
        })
      })

      if (!response.ok) {
        throw new Error('AI generation failed')
      }

      const data = await response.json()
      const generatedContent = data.result || data.content
      setResult(generatedContent)
      onGenerate?.(generatedContent)
      
      // Add to history
      setHistory(prev => [...prev, {
        prompt,
        result: generatedContent,
        timestamp: new Date()
      }])

    } catch (err) {
      setError('Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (result) {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ai-generated-${contentType}-${Date.now()}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const regenerate = () => {
    handleGenerate()
  }

  const clearAll = () => {
    setPrompt('')
    setResult(null)
    setError(null)
    setHistory([])
  }

  return (
    <div className="space-y-4" data-testid="ai-create-studio">
      <Card>
        <CardHeader>
          <CardTitle>AI Create Studio</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={selectedModel} onValueChange={(value) => setSelectedModel(value as keyof typeof MODELS)}>
            <TabsList className="grid w-full grid-cols-4">
              {Object.entries(MODELS).map(([key, label]) => (
                <TabsTrigger 
                  key={key} 
                  value={key}
                  data-testid={`model-${key}`}
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(MODELS).map((key) => (
              <TabsContent key={key} value={key}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Your Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter your creative prompt..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={generating}
                      data-testid="prompt-input"
                    />
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || generating}
                    className="w-full"
                    data-testid="generate-button"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    {generating ? 'Generating...' : 'Generate'}
                  </Button>

                  {error && (
                    <p className="text-sm text-red-500" data-testid="generation-error">
                      {error}
                    </p>
                  )}

                  {result && (
                    <div 
                      className="mt-4 p-4 bg-muted rounded-lg whitespace-pre-wrap"
                      data-testid="generation-result"
                    >
                      {result}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})