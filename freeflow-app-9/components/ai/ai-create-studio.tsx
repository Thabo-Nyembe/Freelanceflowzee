"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Wand2 } from 'lucide-react'

const MODELS = {
  'google-ai': 'Google AI',
  'openai': 'OpenAI',
  'anthropic': 'Anthropic',
  'openrouter': 'OpenRouter'
}

interface AICreateStudioProps {
  onGenerate?: (result: string) => void
  defaultModel?: keyof typeof MODELS
}

export function AICreateStudio({
  onGenerate,
  defaultModel = 'google-ai'
}: AICreateStudioProps) {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>(defaultModel)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    try {
      setGenerating(true)
      setError(null)
      setResult(null)

      // TODO: Replace with actual AI generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockResult = `Generated content for: "${prompt}"\nUsing ${MODELS[selectedModel]}`
      
      setResult(mockResult)
      onGenerate?.(mockResult)

    } catch (err) {
      setError('Generation failed. Please try again.')
    } finally {
      setGenerating(false)
    }
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
} 