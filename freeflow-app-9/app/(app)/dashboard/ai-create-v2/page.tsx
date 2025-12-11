"use client"

import { useState } from 'react'
import {
  AISandbox,
  AIThinking,
  AIResult,
  AIResultCard,
  AIStreamingText
} from '@/components/ui/ai-components'
import {
  BentoGrid,
  BentoCard
} from '@/components/ui/bento-grid-advanced'
import {
  ModernButton,
  GradientButton,
  PillButton,
  IconButton
} from '@/components/ui/modern-buttons'
import {
  Sparkles,
  Brain,
  Wand2,
  Copy,
  Download,
  RefreshCw,
  Settings,
  History,
  BookOpen
} from 'lucide-react'

/**
 * AI Create V2 - Groundbreaking AI Interface
 * Showcases AI sandbox, thinking states, and results
 */
export default function AICreateV2() {
  const [prompt, setPrompt] = useState("Write a professional blog post about...")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any[]>([])

  const handleGenerate = async (code: string) => {
    setIsGenerating(true)
    setShowResult(false)

    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 3000))

    const generatedContent = `# Professional Blog Post

## Introduction
This is a sample AI-generated blog post that demonstrates the power of our AI content creation tools...

## Key Points
- AI can significantly speed up content creation
- Quality remains high with proper prompts
- Saves time and resources

## Conclusion
AI-powered content creation is the future of digital marketing.`

    setResult(generatedContent)
    setIsGenerating(false)
    setShowResult(true)

    // Simulate analysis
    setAnalysisResults([
      {
        title: "High Quality Score",
        description: "Content meets professional standards",
        score: 95,
        confidence: 98,
        metadata: [
          { label: "Readability", value: "Excellent" },
          { label: "SEO Score", value: "92/100" },
          { label: "Word Count", value: "450" }
        ]
      },
      {
        title: "Engaging Content",
        description: "Strong hook and clear structure",
        score: 88,
        confidence: 92,
        metadata: [
          { label: "Engagement", value: "High" },
          { label: "Clarity", value: "Very Clear" }
        ]
      },
      {
        title: "SEO Optimized",
        description: "Well-structured for search engines",
        score: 92,
        confidence: 95,
        metadata: [
          { label: "Keywords", value: "Optimized" },
          { label: "Meta Tags", value: "Complete" }
        ]
      }
    ])

    return generatedContent
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50/30 to-pink-50/40 dark:from-violet-950 dark:via-purple-950/30 dark:to-pink-950/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Sparkles className="w-10 h-10 text-violet-600" />
              AI Content Studio
            </h1>
            <p className="text-muted-foreground">
              Create amazing content with the power of AI
            </p>
          </div>

          <div className="flex items-center gap-3">
            <IconButton
              icon={<History />}
              ariaLabel="View history"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<BookOpen />}
              ariaLabel="Templates"
              variant="ghost"
              size="md"
            />
            <IconButton
              icon={<Settings />}
              ariaLabel="Settings"
              variant="ghost"
              size="md"
            />
          </div>
        </div>

        {/* Quick Templates */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Quick Templates:
          </span>
          <PillButton variant="ghost" onClick={() => setPrompt("Write a blog post about...")}>
            <Wand2 className="w-4 h-4 mr-2" />
            Blog Post
          </PillButton>
          <PillButton variant="ghost" onClick={() => setPrompt("Create a social media caption for...")}>
            Social Media
          </PillButton>
          <PillButton variant="ghost" onClick={() => setPrompt("Write a product description for...")}>
            Product Description
          </PillButton>
          <PillButton variant="ghost" onClick={() => setPrompt("Draft an email about...")}>
            Email
          </PillButton>
          <PillButton variant="ghost" onClick={() => setPrompt("Generate ad copy for...")}>
            Ad Copy
          </PillButton>
        </div>

        {/* AI Sandbox */}
        <AISandbox
          title="AI Content Playground"
          description="Write your prompt below and click Run to generate content"
          code={prompt}
          language="markdown"
          onRun={handleGenerate}
        />

        {/* Processing State */}
        {isGenerating && (
          <BentoCard gradient="violet" className="p-8">
            <div className="flex flex-col items-center justify-center space-y-6">
              <AIThinking
                variant="brain"
                message="AI is crafting your content..."
              />
              <div className="text-center max-w-md">
                <p className="text-sm text-muted-foreground">
                  Our advanced AI is analyzing your prompt and generating high-quality content tailored to your needs.
                </p>
              </div>
            </div>
          </BentoCard>
        )}

        {/* Result Display */}
        {showResult && result && (
          <AIResult
            status="success"
            title="🎉 Content Generated Successfully!"
            message="Your AI-generated content is ready to use"
            details="The content has been analyzed and meets professional quality standards"
            action={{
              label: "Copy to Clipboard",
              onClick: handleCopy
            }}
          />
        )}

        {/* Generated Content Preview */}
        {result && !isGenerating && (
          <BentoCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Generated Content</h3>
              <div className="flex gap-2">
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={<Copy className="w-4 h-4" />}
                  onClick={handleCopy}
                >
                  Copy
                </ModernButton>
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                >
                  Download
                </ModernButton>
                <ModernButton
                  variant="ghost"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => handleGenerate(prompt)}
                >
                  Regenerate
                </ModernButton>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm bg-muted/50 p-6 rounded-lg">
                {result}
              </pre>
            </div>
          </BentoCard>
        )}

        {/* Analysis Results */}
        {analysisResults.length > 0 && !isGenerating && (
          <div className="space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-violet-600" />
              AI Analysis
            </h3>

            <BentoGrid columns={3} gap="md">
              {analysisResults.map((analysis, index) => (
                <AIResultCard
                  key={index}
                  title={analysis.title}
                  description={analysis.description}
                  score={analysis.score}
                  confidence={analysis.confidence}
                  metadata={analysis.metadata}
                />
              ))}
            </BentoGrid>
          </div>
        )}

        {/* CTA Section */}
        {!result && !isGenerating && (
          <BentoCard gradient="glass" className="p-12 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <Brain className="w-16 h-16 mx-auto text-violet-600" />
              <h2 className="text-3xl font-bold">
                Ready to Create Amazing Content?
              </h2>
              <p className="text-lg text-muted-foreground">
                Our AI-powered content studio helps you create professional content in seconds. Just write a prompt and let the AI do the magic.
              </p>
              <GradientButton
                from="violet"
                to="purple"
                onClick={() => handleGenerate(prompt)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Content
              </GradientButton>
            </div>
          </BentoCard>
        )}
      </div>
    </div>
  )
}
