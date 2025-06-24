'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aiConfig } from '@/app/config/ai'

interface GenerationResult {
  id: string
  type: string
  content: string
  metadata: {
    prompt: string
    model: string
    timestamp: Date
  }
}

export function AIGenerate() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('text')
  const [generatedContent, setGeneratedContent] = useState<GenerationResult[]>([])

  const generateContent = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          type: contentType,
        }),
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      
      setGeneratedContent(prev => [
        {
          id: Date.now().toString(),
          type: contentType,
          content: data.content,
          metadata: {
            prompt,
            model: data.model,
            timestamp: new Date(),
          },
        },
        ...prev,
      ])
    } catch (error) {
      console.error('Generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-4">
        <div className="flex space-x-4">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              {aiConfig.features.generate.supportedTypes.map(type => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={generateContent} disabled={isGenerating || !prompt.trim()}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </div>

        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
          className="min-h-[100px]"
          maxLength={aiConfig.features.generate.maxPromptLength}
        />
      </div>

      <div className="space-y-4">
        {generatedContent.map((content) => (
          <Card key={content.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Generated {content.type}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(content.metadata.timestamp).toLocaleString()}
                </p>
              </div>
              <span className="text-sm text-gray-500">{content.metadata.model}</span>
            </div>

            <div className="bg-secondary/10 rounded-lg p-4">
              {content.type === 'code' ? (
                <pre className="text-sm overflow-x-auto">
                  <code>{content.content}</code>
                </pre>
              ) : content.type === 'image' ? (
                <img src={content.content} alt="Generated content" className="max-w-full h-auto" />
              ) : (
                <p className="whitespace-pre-wrap">{content.content}</p>
              )}
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">Prompt: {content.metadata.prompt}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 