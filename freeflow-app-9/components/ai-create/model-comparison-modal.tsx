"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import {
  Zap,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Award,
  Copy,
  RefreshCw
} from 'lucide-react'

const logger = createFeatureLogger('ModelComparison')

interface ModelResult {
  model: string
  content: string
  tokens: number
  cost: number
  time: number
  status: 'pending' | 'success' | 'error'
  error?: string
}

interface ModelComparisonModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: string
  models?: string[]
}

const DEFAULT_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' }
]

export function ModelComparisonModal({
  open,
  onOpenChange,
  prompt,
  models = DEFAULT_MODELS.map(m => m.id)
}: ModelComparisonModalProps) {
  const [results, setResults] = useState<Record<string, ModelResult>>({})
  const [comparing, setComparing] = useState(false)
  const [selectedBest, setSelectedBest] = useState<string | null>(null)

  useEffect(() => {
    if (open && prompt) {
      startComparison()
    }
  }, [open, prompt])

  const startComparison = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt to compare')
      return
    }

    setComparing(true)
    setSelectedBest(null)

    logger.info('Starting model comparison', {
      prompt: prompt.substring(0, 100),
      modelCount: models.length,
      models
    })

    // Initialize results
    const initialResults: Record<string, ModelResult> = {}
    models.forEach(model => {
      initialResults[model] = {
        model,
        content: '',
        tokens: 0,
        cost: 0,
        time: 0,
        status: 'pending'
      }
    })
    setResults(initialResults)

    // Generate with all models in parallel
    const promises = models.map(async (model) => {
      const startTime = Date.now()

      try {
        const response = await fetch('/api/ai/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            temperature: 0.7,
            maxTokens: 1000
          })
        })

        const data = await response.json()
        const endTime = Date.now()

        if (data.success) {
          setResults(prev => ({
            ...prev,
            [model]: {
              model,
              content: data.content,
              tokens: data.tokens,
              cost: data.cost,
              time: endTime - startTime,
              status: 'success'
            }
          }))

          logger.info('Model generation succeeded', {
            model,
            tokens: data.tokens,
            cost: data.cost,
            time: endTime - startTime
          })
        } else {
          throw new Error(data.error || 'Generation failed')
        }
      } catch (error: any) {
        setResults(prev => ({
          ...prev,
          [model]: {
            ...prev[model],
            status: 'error',
            error: error.message || 'Failed to generate'
          }
        }))

        logger.error('Model generation failed', {
          model,
          error: error.message
        })
      }
    })

    await Promise.all(promises)
    setComparing(false)

    toast.success('Comparison Complete', {
      description: `Compared ${models.length} models successfully`
    })

    logger.info('Comparison complete', {
      modelCount: models.length,
      successCount: Object.values(results).filter(r => r.status === 'success').length
    })
  }

  const handleSelectBest = (model: string) => {
    setSelectedBest(model)

    logger.info('Best model selected', {
      model,
      tokens: results[model]?.tokens,
      cost: results[model]?.cost
    })

    toast.success('Model Selected', {
      description: `${model} marked as best result`
    })
  }

  const handleCopyResult = (model: string) => {
    const content = results[model]?.content
    if (content) {
      navigator.clipboard.writeText(content)
      toast.success('Copied', {
        description: `${model} result copied to clipboard`
      })
    }
  }

  const getModelInfo = (modelId: string) => {
    return DEFAULT_MODELS.find(m => m.id === modelId) || { id: modelId, name: modelId, provider: 'Unknown' }
  }

  const getBestModel = () => {
    const successfulResults = Object.entries(results).filter(([_, result]) => result.status === 'success')

    if (successfulResults.length === 0) return null

    // Score based on: quality (token count as proxy), speed, cost
    const scored = successfulResults.map(([model, result]) => {
      const qualityScore = Math.min(result.tokens / 500, 1) * 40 // 40 points for quality
      const speedScore = Math.max(0, (5000 - result.time) / 5000) * 30 // 30 points for speed
      const costScore = Math.max(0, (0.01 - result.cost) / 0.01) * 30 // 30 points for cost

      return {
        model,
        score: qualityScore + speedScore + costScore
      }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored[0]?.model
  }

  const recommendedModel = getBestModel()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Model Comparison
            {comparing && (
              <Badge variant="secondary" className="ml-2">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Comparing...
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Prompt Display */}
          <Card className="p-4 bg-gray-50 dark:bg-gray-900">
            <div className="text-sm font-medium mb-2">Prompt:</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {prompt}
            </div>
          </Card>

          {/* Progress Bar */}
          {comparing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating with {models.length} models...</span>
                <span>
                  {Object.values(results).filter(r => r.status !== 'pending').length} / {models.length}
                </span>
              </div>
              <Progress
                value={(Object.values(results).filter(r => r.status !== 'pending').length / models.length) * 100}
              />
            </div>
          )}

          {/* Results Grid */}
          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-4">
              {models.map(modelId => {
                const result = results[modelId]
                const modelInfo = getModelInfo(modelId)
                const isRecommended = recommendedModel === modelId
                const isBest = selectedBest === modelId

                return (
                  <Card
                    key={modelId}
                    className={`p-4 transition-all ${
                      isBest ? 'ring-2 ring-purple-500 shadow-lg' : ''
                    } ${isRecommended && !isBest ? 'ring-1 ring-yellow-500' : ''}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-2">
                          {modelInfo.name}
                          {isRecommended && !comparing && (
                            <Award className="h-4 w-4 text-yellow-500" title="Recommended" />
                          )}
                          {isBest && (
                            <CheckCircle className="h-4 w-4 text-green-500" title="Your Choice" />
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{modelInfo.provider}</div>
                      </div>

                      {/* Status Badge */}
                      {result?.status === 'pending' && (
                        <Badge variant="secondary">
                          <Loader2 className="h-3 w-3 animate-spin" />
                        </Badge>
                      )}
                      {result?.status === 'success' && (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle className="h-3 w-3" />
                        </Badge>
                      )}
                      {result?.status === 'error' && (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>

                    {/* Metrics */}
                    {result?.status === 'success' && (
                      <>
                        <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <Clock className="h-3 w-3 mx-auto mb-1 text-blue-500" />
                            <div className="font-semibold">{result.time}ms</div>
                            <div className="text-gray-500">Speed</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <Zap className="h-3 w-3 mx-auto mb-1 text-purple-500" />
                            <div className="font-semibold">{result.tokens}</div>
                            <div className="text-gray-500">Tokens</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 dark:bg-gray-900 rounded">
                            <DollarSign className="h-3 w-3 mx-auto mb-1 text-green-500" />
                            <div className="font-semibold">${result.cost.toFixed(4)}</div>
                            <div className="text-gray-500">Cost</div>
                          </div>
                        </div>

                        {/* Content Preview */}
                        <ScrollArea className="h-32 mb-3">
                          <div className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {result.content}
                          </div>
                        </ScrollArea>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopyResult(modelId)}
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            size="sm"
                            variant={isBest ? "default" : "secondary"}
                            onClick={() => handleSelectBest(modelId)}
                            className="flex-1"
                          >
                            {isBest ? <CheckCircle className="h-3 w-3 mr-1" /> : <Award className="h-3 w-3 mr-1" />}
                            {isBest ? 'Selected' : 'Pick'}
                          </Button>
                        </div>
                      </>
                    )}

                    {/* Error Display */}
                    {result?.status === 'error' && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                        {result.error}
                      </div>
                    )}

                    {/* Pending Display */}
                    {result?.status === 'pending' && (
                      <div className="text-xs text-gray-500 text-center py-8">
                        Generating...
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </ScrollArea>

          <Separator />

          {/* Footer Actions */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {isRecommended && !comparing && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-yellow-500" />
                  <span>Recommended: <strong>{getModelInfo(recommendedModel).name}</strong></span>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={startComparison}
                disabled={comparing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-compare
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
