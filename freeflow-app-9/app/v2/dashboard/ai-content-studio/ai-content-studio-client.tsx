'use client'

export const dynamic = 'force-dynamic';

import React, { useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, FileText, Sparkles, Brain, Instagram, Twitter, Linkedin, Facebook, Copy, RefreshCw, Check, Wand2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'
import { SmartEmailTemplates } from '@/components/ai/smart-email-templates'
import { AIProposalGenerator } from '@/components/ai/ai-proposal-generator'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('AIContentStudio')

export default function AiContentStudioClient() {
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
          <MarketingContentGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Marketing Content Generator Component
function MarketingContentGenerator() {
  const [contentType, setContentType] = useState('social')
  const [platform, setPlatform] = useState('instagram')
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    facebook: <Facebook className="w-4 h-4" />
  }

  const contentTemplates: Record<string, Record<string, string>> = {
    instagram: {
      social: "✨ Exciting news! We're revolutionizing [TOPIC] with cutting-edge solutions.\n\n🚀 Here's what makes us different:\n• Innovation-first approach\n• Customer-centric design\n• Results that speak for themselves\n\nDouble tap if you're ready for the future! 💪\n\n#innovation #business #growth #success",
      ad: "🔥 Limited Time Offer!\n\nTransform your [TOPIC] strategy today.\n\n✅ 50% more efficiency\n✅ Save 10+ hours weekly\n✅ Join 10,000+ happy customers\n\n👉 Link in bio for exclusive access!\n\n#ad #sponsored"
    },
    twitter: {
      social: "🚀 Big things happening with [TOPIC]!\n\nWe've been working on something special that's going to change the game.\n\nStay tuned for the reveal 👀\n\n#tech #innovation",
      ad: "🎯 Ready to level up your [TOPIC] game?\n\nOur solution has helped 10,000+ professionals achieve more in less time.\n\nTry it free → [link]"
    },
    linkedin: {
      social: "I'm excited to share our latest insights on [TOPIC].\n\nAfter months of research and development, we've discovered key strategies that are transforming how businesses approach this challenge.\n\nHere are 3 key takeaways:\n\n1. Innovation requires commitment\n2. Customer feedback drives improvement\n3. Data-driven decisions lead to success\n\nWhat's your experience with [TOPIC]? I'd love to hear your thoughts in the comments.\n\n#businessgrowth #leadership #innovation",
      ad: "🎯 Attention [TOPIC] professionals!\n\nAre you struggling to keep up with industry changes?\n\nOur comprehensive solution helps you:\n• Streamline workflows\n• Increase productivity by 40%\n• Stay ahead of competition\n\nJoin 5,000+ industry leaders who trust us.\n\n[Learn More →]"
    },
    facebook: {
      social: "🌟 We're thrilled to share something amazing about [TOPIC]!\n\nOur team has been working hard to bring you the best experience possible, and the results are incredible.\n\n💬 Tell us what you think in the comments!\n\n❤️ Like and share if you agree!",
      ad: "📢 Special Announcement!\n\n[TOPIC] just got a whole lot easier.\n\n🎁 Get 30% off your first month\n⏰ Limited time offer\n🚀 Start seeing results in 7 days\n\n👉 Click 'Learn More' to get started!"
    }
  }

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic first')
      return
    }

    setIsGenerating(true)

    // Generate content from template
    const template = contentTemplates[platform]?.[contentType] || contentTemplates.instagram.social
    const generated = template.replace(/\[TOPIC\]/g, topic)

    setGeneratedContent(generated)
    setIsGenerating(false)
    toast.success('Content generated successfully!')
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Panel */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Generate Marketing Content</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Content Type</label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="social">Social Media Post</SelectItem>
                <SelectItem value="ad">Advertisement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Platform</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(platformIcons).map(([key, icon]) => (
                <Button
                  key={key}
                  variant={platform === key ? 'default' : 'outline'}
                  className="flex items-center justify-center gap-2"
                  onClick={() => setPlatform(key)}
                >
                  {icon}
                  <span className="capitalize text-xs">{key}</span>
                </Button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Topic / Subject</label>
            <Textarea
              placeholder="e.g., product launch, industry trends, company milestone..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Output Panel */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold">Generated Content</h3>
          </div>
          {generatedContent && (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                {platformIcons[platform]}
                <span className="capitalize">{platform}</span>
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          )}
        </div>

        {generatedContent ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-sm">
              {generatedContent}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isGenerating}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Your generated content will appear here</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
