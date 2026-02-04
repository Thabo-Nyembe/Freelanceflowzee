'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import EnhancedAIChat from '@/components/ai/enhanced-ai-chat'
import SimpleAIChat from '@/components/ai/simple-ai-chat'
import { AICreateStudio } from '@/components/ai/ai-create-studio'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'

const logger = createSimpleLogger('AI-Assistant')

export default function AIAssistantPage() {
  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [activeTab, setActiveTab] = useState<any>('chat')

  // A+++ LOAD AI ASSISTANT DATA
  useEffect(() => {
    const loadAIAssistantData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Simulate data loading with 5% error rate
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            if (Math.random() > 0.95) {
              reject(new Error('Failed to load AI assistant'))
            } else {
              resolve(null)
            }
          }, 1000)
        })

        setIsLoading(false)
        announce('AI assistant loaded successfully', 'polite')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load AI assistant')
        setIsLoading(false)
        announce('Error loading AI assistant', 'assertive')
      }
    }

    loadAIAssistantData()
  }, [announce])

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">AI Assistant</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="analyze">Analyze</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>AI Chat Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedAIChat />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <AICreateStudio
                onGenerate={(result) => {
                  logger.info('AI content generated', {
                    contentLength: result?.length || 0,
                    contentType: typeof result
                  })

                  toast.success('Content generated successfully', {
                    description: `Generated ${result?.length || 0} characters`
                  })
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleAIChat />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 