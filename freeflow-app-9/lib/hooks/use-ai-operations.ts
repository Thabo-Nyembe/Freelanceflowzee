'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface AIGenerationParams {
  prompt: string
  type: 'design' | 'content' | 'asset
  settings?: Record<string, any>
}

interface AIAnalysisParams {
  content: string
  type: 'design' | 'performance' | 'seo
  options?: Record<string, any>
}

export function useAIOperations() {
  const queryClient = useQueryClient()

  // Generate content/assets using AI
  const generateMutation = useMutation({
    mutationFn: async (params: AIGenerationParams) => {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        throw new Error('Generation failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] })
      toast.success('Generation completed successfully')
    },
    onError: (error) => {
      toast.error('Generation failed: ' + error.message)'
    }
  })

  // Analyze content using AI
  const analyzeMutation = useMutation({
    mutationFn: async (params: AIAnalysisParams) => {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      
      if (!response.ok) {
        throw new Error('Analysis failed')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-history'] })
      toast.success('Analysis completed successfully')
    },
    onError: (error) => {
      toast.error('Analysis failed: ' + error.message)'
    }
  })

  // Get AI operation history
  const historyQuery = useQuery({
    queryKey: ['ai-history'],
    queryFn: async () => {
      const response = await fetch('/api/ai/history')
      if (!response.ok) {
        throw new Error('Failed to fetch history')
      }
      return response.json()
    }
  })

  // Get AI component recommendations
  const recommendationsQuery = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const response = await fetch('/api/ai/component-recommendations')
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      return response.json()
    }
  })

  return {
    generate: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    analyze: analyzeMutation.mutate,
    isAnalyzing: analyzeMutation.isPending,
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    recommendations: recommendationsQuery.data,
    isLoadingRecommendations: recommendationsQuery.isLoading,
  }
} 