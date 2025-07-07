'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Bot,
  Sparkles,
  MessageSquare,
  FileText,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface AIResponse {
  id: string
  content: string
  type: 'text' | 'code' | 'suggestion'
  timestamp: string
  status: 'pending' | 'complete' | 'error'
}

interface AIOpenAIIntegrationProps {
  apiKey?: string
  onApiKeyChange?: (key: string) => void
  onGenerateResponse?: (prompt: string, options: any) => Promise<AIResponse>
  onAcceptSuggestion?: (responseId: string) => void
  onRejectSuggestion?: (responseId: string) => void
}

const modelOptions = [
  { value: 'gpt-4', label: 'GPT-4 (Most Capable)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Fast & Efficient)' },
]

const taskTypes = [
  { value: 'improve', label: 'Improve Writing' },
  { value: 'suggest', label: 'Suggest Ideas' },
  { value: 'review', label: 'Review Code' },
  { value: 'explain', label: 'Explain Concept' },
]

export default function AIOpenAIIntegration({
  apiKey,
  onApiKeyChange,
  onGenerateResponse,
  onAcceptSuggestion,
  onRejectSuggestion,
}: AIOpenAIIntegrationProps) {
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [selectedTask, setSelectedTask] = useState('improve')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [responses, setResponses] = useState<AIResponse[]>([])

  const handleGenerate = async () => {
    if (!prompt.trim() || !onGenerateResponse) return

    setIsGenerating(true)
    try {
      const response = await onGenerateResponse(prompt, {
        model: selectedModel,
        taskType: selectedTask,
      })
      setResponses((prev) => [response, ...prev])
      setPrompt('')
    } catch (error) {
      console.error('Error generating response:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderResponse = (response: AIResponse) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      complete: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    }

    return (
      <div
        key={response.id}
        className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="text-sm font-medium">AI Assistant</span>
            <Badge className={statusColors[response.status]}>
              {response.status}
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">
            {new Date(response.timestamp).toLocaleTimeString()}
          </span>
        </div>

        <div className="pl-6">
          {response.type === 'code' ? (
            <pre className="bg-muted p-2 rounded text-sm overflow-x-auto">
              <code>{response.content}</code>
            </pre>
          ) : (
            <p className="text-sm">{response.content}</p>
          )}
        </div>

        {response.type === 'suggestion' && (
          <div className="flex items-center gap-2 pl-6">
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600"
              onClick={() => onAcceptSuggestion?.(response.id)}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={() => onRejectSuggestion?.(response.id)}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Powered by OpenAI GPT models
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Task Type</label>
            <Select value={selectedTask} onValueChange={setSelectedTask}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="min-h-[100px]"
          />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-32"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {responses.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium">Responses</h3>
            <div className="space-y-4">
              {responses.map(renderResponse)}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
} 