"use client"

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Activity, Zap, Clock, DollarSign, CheckCircle, AlertCircle,
  Copy, ThumbsUp, ThumbsDown, Download, RotateCcw, Save, Star
} from 'lucide-react'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { saveModelComparison, type ComparisonResult as DBComparisonResult } from '@/lib/ai-create-queries'

const logger = createFeatureLogger('AI-Create-Compare')

// Comparison result type
interface ComparisonResult {
  modelId: string
  output: string
  responseTime: number
  tokenCount: number
  estimatedCost: number
  quality: number
}

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
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [comparisonProgress, setComparisonProgress] = useState(0)
  const [ratings, setRatings] = useState<Record<string, 'up' | 'down' | null>>({})

  const toggleModel = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      setSelectedModels(selectedModels.filter((id) => id !== modelId))
    } else if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, modelId])
    }
  }

  // Generate simulated response based on model characteristics
  const generateModelResponse = useCallback((modelId: string, userPrompt: string): ComparisonResult => {
    const model = MODELS_TO_COMPARE.find(m => m.id === modelId)!

    // Simulate different response characteristics per model
    const responses: Record<string, { output: string; speed: number; cost: number; quality: number }> = {
      'mistral-free': {
        output: `Here's a response from Mistral 7B:\n\n${userPrompt.includes('blog') ?
          'AI in healthcare represents a transformative shift in how medical professionals diagnose, treat, and manage patient care. From predictive analytics to robotic surgery, the applications are vast and growing.\n\nKey areas include:\n- Diagnostic imaging analysis\n- Drug discovery acceleration\n- Personalized treatment plans\n- Administrative task automation' :
          'Based on your prompt, here is my analysis and response. The key points to consider are the context, requirements, and desired outcomes. I recommend a structured approach that addresses each element systematically.'}`,
        speed: 1.2,
        cost: 0,
        quality: 75
      },
      'phi-3-free': {
        output: `Phi-3 Mini response:\n\n${userPrompt.includes('blog') ?
          'Healthcare AI is revolutionizing medicine. Machine learning algorithms can now detect diseases earlier and more accurately than ever before. This includes applications in radiology, pathology, and genomics.\n\nBenefits:\n• Faster diagnosis\n• Reduced human error\n• 24/7 availability\n• Cost reduction over time' :
          'I understand your request. Let me provide a comprehensive response that covers the main aspects of your query. The approach should be methodical and consider multiple perspectives.'}`,
        speed: 0.8,
        cost: 0,
        quality: 70
      },
      'llama-8b': {
        output: `Llama 3.1 8B analysis:\n\n${userPrompt.includes('blog') ?
          'The intersection of artificial intelligence and healthcare is creating unprecedented opportunities for improving patient outcomes. From early disease detection to personalized medicine, AI is becoming an indispensable tool in modern healthcare.\n\n## Key Applications\n\n1. **Diagnostic Support**: AI systems can analyze medical images with remarkable accuracy\n2. **Predictive Analytics**: Identifying at-risk patients before conditions worsen\n3. **Treatment Optimization**: Personalizing therapies based on genetic profiles\n4. **Operational Efficiency**: Streamlining administrative workflows' :
          'Thank you for your query. I will provide a detailed and well-structured response that addresses your needs. The solution involves several key components that work together effectively.'}`,
        speed: 1.5,
        cost: 0.002,
        quality: 82
      },
      'claude-sonnet': {
        output: `Claude 3.5 Sonnet response:\n\n${userPrompt.includes('blog') ?
          '# The Transformative Power of AI in Healthcare\n\nArtificial intelligence is fundamentally reshaping the healthcare landscape, offering unprecedented opportunities to enhance patient care, streamline operations, and accelerate medical discoveries.\n\n## The Current State\n\nHealthcare AI has moved beyond theoretical applications into practical, life-saving implementations. Hospitals worldwide are deploying AI systems that can:\n\n- **Detect diseases earlier**: AI algorithms can identify subtle patterns in medical imaging that might escape human observation\n- **Predict patient outcomes**: Machine learning models analyze vast datasets to forecast health trajectories\n- **Personalize treatments**: AI enables precision medicine by matching patients with optimal therapies\n\n## Looking Forward\n\nThe future of healthcare AI is incredibly promising, with emerging applications in drug discovery, remote patient monitoring, and mental health support.\n\n*The key is ensuring these technologies are developed responsibly, with patient safety and privacy at the forefront.*' :
          'I appreciate your thoughtful prompt. Let me provide a comprehensive, nuanced response that addresses the key aspects of your request while considering various perspectives and implications. My analysis will be structured, detailed, and actionable.'}`,
        speed: 2.8,
        cost: 0.015,
        quality: 95
      },
      'gpt-4o': {
        output: `GPT-4o response:\n\n${userPrompt.includes('blog') ?
          '# AI in Healthcare: A Comprehensive Overview\n\n## Introduction\n\nThe integration of artificial intelligence into healthcare represents one of the most significant technological shifts in modern medicine. This transformation is not merely incremental—it is fundamentally changing how we approach diagnosis, treatment, and patient care.\n\n## Key Areas of Impact\n\n### 1. Diagnostic Excellence\nAI-powered diagnostic tools are achieving remarkable accuracy in detecting conditions ranging from diabetic retinopathy to various cancers. These systems serve as powerful aids to clinicians, not replacements.\n\n### 2. Drug Discovery Revolution\nPharmaceutical companies are leveraging AI to compress drug development timelines from decades to years, potentially saving billions in development costs.\n\n### 3. Operational Optimization\nFrom scheduling to supply chain management, AI is making healthcare systems more efficient and responsive.\n\n## Ethical Considerations\n\nAs we embrace these technologies, we must remain vigilant about data privacy, algorithmic bias, and ensuring equitable access to AI-enhanced care.\n\n## Conclusion\n\nThe future of healthcare is undeniably intertwined with AI, promising better outcomes for patients worldwide.' :
          'Thank you for your inquiry. I will provide a thorough, well-researched response that addresses all aspects of your prompt. My approach combines analytical rigor with practical applicability, ensuring you receive actionable insights.'}`,
        speed: 3.2,
        cost: 0.02,
        quality: 97
      }
    }

    const modelResponse = responses[modelId] || responses['mistral-free']
    const tokenCount = Math.floor(modelResponse.output.length / 4) // Approximate tokens

    return {
      modelId,
      output: modelResponse.output,
      responseTime: modelResponse.speed + (Math.random() * 0.5),
      tokenCount,
      estimatedCost: modelResponse.cost * (tokenCount / 100),
      quality: modelResponse.quality + Math.floor(Math.random() * 5) - 2
    }
  }, [])

  const startComparison = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }
    if (selectedModels.length < 2) {
      toast.error('Please select at least 2 models')
      return
    }

    setComparing(true)
    setResults([])
    setComparisonProgress(0)
    setRatings({})

    logger.info('Starting model comparison', {
      prompt: prompt.substring(0, 50),
      models: selectedModels
    })
    announce('Starting model comparison', 'polite')

    const newResults: ComparisonResult[] = []

    // Simulate sequential API calls with progress
    for (let i = 0; i < selectedModels.length; i++) {
      const modelId = selectedModels[i]
      const model = MODELS_TO_COMPARE.find(m => m.id === modelId)!

      setComparisonProgress(((i + 0.5) / selectedModels.length) * 100)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))

      const result = generateModelResponse(modelId, prompt)
      newResults.push(result)
      setResults([...newResults])
      setComparisonProgress(((i + 1) / selectedModels.length) * 100)

      logger.info('Model response received', {
        model: model.name,
        responseTime: result.responseTime.toFixed(2)
      })
    }

    setComparing(false)
    setComparisonProgress(100)

    toast.success(`Comparison Complete - Compared ${selectedModels.length} models in ${newResults.reduce((acc, r) => acc + r.responseTime, 0).toFixed(1)}s`)
    announce('Model comparison complete', 'polite')

    logger.info('Comparison complete', {
      totalModels: selectedModels.length,
      totalTime: newResults.reduce((acc, r) => acc + r.responseTime, 0).toFixed(2)
    })
  }, [prompt, selectedModels, generateModelResponse, announce])

  const handleCopyOutput = useCallback((output: string, modelName: string) => {
    navigator.clipboard.writeText(output)
    toast.success(`Copied to clipboard - ${modelName} output copied`)
    logger.info('Output copied', { model: modelName })
  }, [])

  const handleRateOutput = useCallback((modelId: string, rating: 'up' | 'down') => {
    setRatings(prev => ({ ...prev, [modelId]: rating }))
    const model = MODELS_TO_COMPARE.find(m => m.id === modelId)!
    toast.success(`Rating saved - You ${rating === 'up' ? 'liked' : 'disliked'} ${model.name}'s output`)
    logger.info('Output rated', { model: model.name, rating })
  }, [])

  const handleSaveComparison = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to save comparisons')
      return
    }

    // Transform results to database format
    const dbResults: DBComparisonResult[] = results.map(r => ({
      model_id: r.modelId,
      output: r.output,
      response_time: r.responseTime,
      token_count: r.tokenCount,
      estimated_cost: r.estimatedCost,
      quality_score: r.quality
    }))

    try {
      // Save to database
      const { error } = await saveModelComparison(userId, {
        prompt,
        results: dbResults,
        ratings
      })

      if (error) {
        logger.error('Failed to save comparison to database', { error })
        toast.error('Failed to save comparison')
        return
      }

      toast.success('Comparison Saved - Added to your comparison history')
      logger.info('Comparison saved to database')
      announce('Comparison saved', 'polite')
    } catch (error) {
      logger.error('Exception saving comparison', { error })
      toast.error('Failed to save comparison')
    }
  }, [prompt, results, ratings, userId, announce])

  const handleExportComparison = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      prompt,
      models: results.map(r => {
        const model = MODELS_TO_COMPARE.find(m => m.id === r.modelId)!
        return {
          name: model.name,
          tier: model.tier,
          output: r.output,
          metrics: {
            responseTime: `${r.responseTime.toFixed(2)}s`,
            tokens: r.tokenCount,
            estimatedCost: `$${r.estimatedCost.toFixed(4)}`,
            qualityScore: r.quality
          },
          rating: ratings[r.modelId] || 'not rated'
        }
      })
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-comparison-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Export Complete - Comparison exported as JSON')
    logger.info('Comparison exported')
  }, [prompt, results, ratings])

  const resetComparison = useCallback(() => {
    setResults([])
    setComparisonProgress(0)
    setRatings({})
    toast.success('Comparison Reset - Ready for a new comparison')
  }, [])

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

      {/* Progress Bar */}
      {comparing && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Comparing models...</span>
            <span className="text-sm text-gray-500">{Math.round(comparisonProgress)}%</span>
          </div>
          <Progress value={comparisonProgress} className="h-2" />
        </Card>
      )}

      {/* Comparison Results */}
      {results.length > 0 ? (
        <>
          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600">
                {results.length} models compared
              </Badge>
              <Badge variant="outline">
                Total: {results.reduce((acc, r) => acc + r.responseTime, 0).toFixed(1)}s
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handleSaveComparison}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportComparison}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" variant="outline" onClick={resetComparison}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((result) => {
              const model = MODELS_TO_COMPARE.find((m) => m.id === result.modelId)!
              const userRating = ratings[result.modelId]

              return (
                <Card key={result.modelId} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
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
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant={userRating === 'up' ? 'default' : 'ghost'}
                        onClick={() => handleRateOutput(result.modelId, 'up')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={userRating === 'down' ? 'default' : 'ghost'}
                        onClick={() => handleRateOutput(result.modelId, 'down')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyOutput(result.output, model.name)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                      <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold">{result.responseTime.toFixed(1)}s</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                      <Activity className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold">{result.tokenCount}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                      <DollarSign className="h-4 w-4 text-green-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold">${result.estimatedCost.toFixed(3)}</p>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-center">
                      <Star className="h-4 w-4 text-yellow-500 mx-auto mb-1" />
                      <p className="text-xs font-semibold">{result.quality}%</p>
                    </div>
                  </div>

                  {/* Output */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{result.output}</pre>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Comparison Summary */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <h3 className="font-semibold mb-4">Comparison Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Fastest</p>
                <p className="font-semibold">
                  {MODELS_TO_COMPARE.find(m => m.id === results.reduce((a, b) => a.responseTime < b.responseTime ? a : b).modelId)?.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Cheapest</p>
                <p className="font-semibold">
                  {MODELS_TO_COMPARE.find(m => m.id === results.reduce((a, b) => a.estimatedCost < b.estimatedCost ? a : b).modelId)?.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Highest Quality</p>
                <p className="font-semibold">
                  {MODELS_TO_COMPARE.find(m => m.id === results.reduce((a, b) => a.quality > b.quality ? a : b).modelId)?.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">Most Tokens</p>
                <p className="font-semibold">
                  {MODELS_TO_COMPARE.find(m => m.id === results.reduce((a, b) => a.tokenCount > b.tokenCount ? a : b).modelId)?.name}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : !comparing ? (
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
      ) : null}

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
