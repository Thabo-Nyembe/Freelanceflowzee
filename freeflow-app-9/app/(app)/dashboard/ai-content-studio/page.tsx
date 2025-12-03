'use client'

import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, FileText, Sparkles, Brain } from 'lucide-react'
import { SmartEmailTemplates } from '@/components/ai/smart-email-templates'
import { AIProposalGenerator } from '@/components/ai/ai-proposal-generator'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AIContentStudio')

export default function AIContentStudioPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  useEffect(() => {
    if (userId) {
      logger.info('AI Content Studio page loaded', { userId })
      announce('AI Content Studio loaded', 'polite')
    }
  }, [userId, announce])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">AI Content Studio</h1>
        </div>
        <p className="text-gray-600">
          Create professional emails, proposals, and marketing content with AI assistance
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="emails" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="emails">
            <Mail className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="proposals">
            <FileText className="w-4 h-4 mr-2" />
            Proposal Generator
          </TabsTrigger>
          <TabsTrigger value="content">
            <Brain className="w-4 h-4 mr-2" />
            Marketing Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="emails" className="mt-6">
          <SmartEmailTemplates />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <AIProposalGenerator />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Marketing Content Coming Soon</h3>
              <p className="text-gray-600">
                AI-powered social media posts, blog content, and ad copy
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
