'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/navigation/site-header'
import { SiteFooter } from '@/components/navigation/site-footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap,
  Star,
  Camera,
  Palette,
  Music,
  Video,
  PenTool,
  Code,
  CheckCircle,
  Users,
  Target,
  Sparkles,
  Rocket,
  ArrowRight
} from 'lucide-react'

const AI_MODELS = [
  {
    name: 'GPT-4o',
    provider: 'OpenAI',
    tier: 'Enterprise',
    trials: 3,
    cost: '$0.03/request',
    description: 'Most advanced language model for content creation'
  },
  {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic', 
    tier: 'Enterprise',
    trials: 3,
    cost: '$0.025/request',
    description: 'Superior creative writing and analysis'
  },
  {
    name: 'DALL-E 3',
    provider: 'OpenAI',
    tier: 'Enterprise', 
    trials: 2,
    cost: '$0.04/request',
    description: 'Most advanced image generation AI'
  }
]

const CREATIVE_FIELDS = [
  {
    icon: Camera,
    name: 'Photography',
    tier: 'Pro',
    assets: ['Professional LUTs', 'Lightroom Presets', 'Photoshop Actions', 'Photo Overlays'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Palette,
    name: 'Design', 
    tier: 'Free',
    assets: ['Design Templates', 'Seamless Patterns', 'Icon Sets', 'Custom Fonts'],
    color: 'from-purple-500 to-indigo-500'
  },
  {
    icon: Music,
    name: 'Music',
    tier: 'Pro', 
    assets: ['Audio Samples', 'Synth Presets', 'MIDI Patterns', 'Song Stems'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Video,
    name: 'Video',
    tier: 'Pro',
    assets: ['Video Transitions', 'Cinematic LUTs', 'Title Templates', 'Visual Effects'],
    color: 'from-red-500 to-pink-500'
  },
  {
    icon: PenTool,
    name: 'Writing',
    tier: 'Free',
    assets: ['Content Templates', 'Writing Prompts', 'Headlines', 'Marketing Campaigns'],
    color: 'from-orange-500 to-yellow-500'
  },
  {
    icon: Code,
    name: 'Web Dev',
    tier: 'Free',
    assets: ['UI Components', 'CSS Animations', 'Page Templates', 'Code Snippets'],
    color: 'from-teal-500 to-cyan-500'
  }
]

export default function AICreateStudioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/40">
      <SiteHeader />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200">
              <Sparkles className="w-4 h-4 mr-2" />
              Revolutionary AI Technology
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent">
                AI Create Studio
              </span>
              <br />
              <span className="text-gray-800">Generate Professional Assets</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto">
              Revolutionary AI-powered asset generation across 6+ creative fields with free trials of premium models like 
              <span className="font-semibold text-purple-600"> GPT-4o, Claude 3.5 Sonnet, and DALL-E 3</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/dashboard">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg">
                  <Zap className="w-6 h-6 mr-2" />
                  Try AI Create Free
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                  <Rocket className="w-6 h-6 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Success Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100K+</div>
                <div className="text-sm text-gray-600">AI Assets Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600">Creative Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">50K+</div>
                <div className="text-sm text-gray-600">Premium Model Trials</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">94%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Models Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Premium AI Models at Your Fingertips
              </h2>
              <p className="text-xl text-gray-600">
                Get free trials of the most expensive AI models in the market
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {AI_MODELS.map((model, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default">Enterprise</Badge>
                      <span className="text-sm font-medium text-gray-600">{model.trials} trials</span>
                    </div>
                    <CardTitle className="text-xl">{model.name}</CardTitle>
                    <CardDescription>{model.provider} • {model.cost}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{model.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Creative Fields */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Generate Assets Across 6+ Creative Fields
              </h2>
              <p className="text-xl text-gray-600">
                Professional-grade assets for every creative discipline
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CREATIVE_FIELDS.map((field, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 bg-gradient-to-r ${field.color} rounded-lg`}>
                        <field.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{field.name}</CardTitle>
                        <Badge variant={field.tier === 'Pro' ? 'default' : 'secondary'}>
                          {field.tier} Tier
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {field.assets.map((asset, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {asset}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Revolutionize Your Creative Workflow?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join 25,000+ creative professionals using AI Create Studio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                  <Zap className="w-6 h-6 mr-2" />
                  Start Creating Now
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
                  <Star className="w-6 h-6 mr-2" />
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <SiteFooter />
    </div>
  )
} 