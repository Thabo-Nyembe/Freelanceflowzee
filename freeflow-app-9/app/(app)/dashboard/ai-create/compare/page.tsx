"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Activity, Zap, Clock, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AI-Create-Compare')

const MODELS_TO_COMPARE = [
  { id: 'mistral-free', name: 'Mistral 7B', tier: 'free', color: 'green' },
  { id: 'phi-3-free', name: 'Phi-3 Mini', tier: 'free', color: 'green' },
  { id: 'llama-8b', name: 'Llama 3.1 8B', tier: 'affordable', color: 'blue' },
  { id: 'claude-sonnet', name: 'Claude 3.5 Sonnet', tier: 'premium', color: 'purple' },
  { id: 'gpt-4o', name: 'GPT-4o', tier: 'premium', color: 'purple' }
]

export default function ComparePage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>(['mistral-free', 'claude-sonnet'])
  const [comparing, setComparing] = useState(false)

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId))
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  const startComparison = () => {
    setComparing(true)
    // Simulate comparison
    setTimeout(() => setComparing(false), 3000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Model Comparison</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Compare outputs from different AI models side-by-side
        </p>
      </div>

      {/* Prompt Input */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Enter Your Prompt</h3>
        <Textarea
          placeholder="Type your prompt here... (e.g., 'Write a blog post about AI in healthcare')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[120px] mb-4"
        />
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Select 2-4 models to compare
          </p>
          <Button
            onClick={startComparison}
            disabled={selectedModels.length < 2 || !prompt || comparing}
          >
            <Activity className="h-4 w-4 mr-2" />
            {comparing ? 'Comparing...' : 'Compare Models'}
          </Button>
        </div>
      </Card>

      {/* Model Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Select Models ({selectedModels.length}/4)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODELS_TO_COMPARE.map((model) => {
            const isSelected = selectedModels.includes(model.id)
            const canSelect = selectedModels.length < 4

            return (
              <button
                key={model.id}
                onClick={() => toggleModel(model.id)}
                disabled={!isSelected && !canSelect}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  isSelected
                    ? model.color === 'green'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                      : model.color === 'blue'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-purple-500 bg-purple-50 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${!canSelect && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{model.name}</span>
                  {isSelected && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <Badge
                  className={
                    model.tier === 'free'
                      ? 'bg-green-500 text-white'
                      : model.tier === 'affordable'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }
                >
                  {model.tier === 'free' ? 'FREE' : model.tier === 'affordable' ? 'Affordable' : 'Premium'}
                </Badge>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Comparison Results */}
      {comparing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selectedModels.map((modelId) => {
            const model = MODELS_TO_COMPARE.find((m) => m.id === modelId)!
            return (
              <Card key={modelId} className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="font-semibold">{model.name}</h3>
                  <Badge
                    className={
                      model.tier === 'free'
                        ? 'bg-green-500 text-white'
                        : model.tier === 'affordable'
                        ? 'bg-blue-500 text-white'
                        : 'bg-purple-500 text-white'
                    }
                  >
                    {model.tier === 'free' ? 'FREE' : model.tier === 'affordable' ? 'Affordable' : 'Premium'}
                  </Badge>
                </div>
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300 dark:border-gray-700">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Comparison Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enter a prompt and select 2-4 models to see side-by-side comparisons
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-6">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Speed</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Cost</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-semibold">Quality</p>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Tips */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Comparison Tips
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Free models are great for drafts and iteration</li>
              <li>• Premium models excel at complex reasoning and nuanced content</li>
              <li>• Compare free vs premium to see if the cost difference is worth it for your use case</li>
              <li>• Different models have different strengths - test multiple for best results</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}
