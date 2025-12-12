"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  ActivityFeed,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Wand2,
  Sparkles,
  Image,
  Palette,
  Layers,
  Download,
  RefreshCw,
  Settings,
  Zap,
  Eye,
  Heart,
  Share2
} from 'lucide-react'

/**
 * AI Design V2 - Groundbreaking AI-Powered Design Generation
 * Showcases AI design tools with modern components
 */
export default function AIDesignV2() {
  const [selectedStyle, setSelectedStyle] = useState<'modern' | 'minimalist' | 'creative'>('modern')
  const [generatedDesigns, setGeneratedDesigns] = useState([
    {
      id: '1',
      title: 'Brand Logo Concept',
      style: 'Modern',
      prompt: 'Professional tech startup logo with gradient',
      thumbnail: 'https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=300&h=300&fit=crop',
      likes: 124,
      views: 847
    },
    {
      id: '2',
      title: 'Social Media Banner',
      style: 'Creative',
      prompt: 'Vibrant social media header with abstract shapes',
      thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=300&h=300&fit=crop',
      likes: 89,
      views: 634
    },
    {
      id: '3',
      title: 'Product Mockup',
      style: 'Minimalist',
      prompt: 'Clean product showcase with white background',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
      likes: 156,
      views: 923
    }
  ])

  const stats = [
    { label: 'Designs Created', value: '342', change: 25.3, icon: <Image className="w-5 h-5" /> },
    { label: 'AI Credits Used', value: '1,247', change: 18.7, icon: <Zap className="w-5 h-5" /> },
    { label: 'Total Likes', value: '3,847', change: 32.1, icon: <Heart className="w-5 h-5" /> },
    { label: 'Generations/Day', value: '47', change: 12.5, icon: <Sparkles className="w-5 h-5" /> }
  ]

  const recentActivity = [
    { icon: <Image className="w-5 h-5" />, title: 'Design generated', description: 'Brand Logo Concept completed', time: '5 minutes ago', status: 'success' as const },
    { icon: <Heart className="w-5 h-5" />, title: 'Design liked', description: 'Product Mockup received 12 likes', time: '1 hour ago', status: 'info' as const },
    { icon: <Share2 className="w-5 h-5" />, title: 'Design shared', description: 'Social Media Banner shared', time: '3 hours ago', status: 'info' as const },
    { icon: <Download className="w-5 h-5" />, title: 'Design downloaded', description: 'Exported in 4K resolution', time: '5 hours ago', status: 'success' as const }
  ]

  const designStyles = [
    { name: 'Modern', description: 'Clean gradients & bold typography', color: 'from-blue-500 to-purple-500' },
    { name: 'Minimalist', description: 'Simple shapes & negative space', color: 'from-gray-400 to-gray-600' },
    { name: 'Creative', description: 'Abstract art & vibrant colors', color: 'from-pink-500 to-orange-500' },
    { name: 'Professional', description: 'Corporate & trustworthy', color: 'from-indigo-500 to-blue-500' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-50 via-pink-50/30 to-rose-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Wand2 className="w-10 h-10 text-fuchsia-600" />
              AI Design Studio
            </h1>
            <p className="text-muted-foreground">Create stunning designs with AI-powered generation</p>
          </div>
          <GradientButton from="fuchsia" to="pink" onClick={() => console.log('New design')}>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Design
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Wand2 />} title="Quick Generate" description="Instant AI" onClick={() => console.log('Generate')} />
          <BentoQuickAction icon={<Palette />} title="Color Palette" description="AI colors" onClick={() => console.log('Palette')} />
          <BentoQuickAction icon={<Layers />} title="Templates" description="Pre-made" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <BentoCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Design Prompt</h3>
          <div className="space-y-4">
            <textarea
              placeholder="Describe your design idea... (e.g., 'Modern logo with gradient colors for tech startup')"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
              rows={4}
            />
            <div className="flex items-center gap-3">
              <PillButton variant={selectedStyle === 'modern' ? 'primary' : 'ghost'} onClick={() => setSelectedStyle('modern')}>
                Modern
              </PillButton>
              <PillButton variant={selectedStyle === 'minimalist' ? 'primary' : 'ghost'} onClick={() => setSelectedStyle('minimalist')}>
                Minimalist
              </PillButton>
              <PillButton variant={selectedStyle === 'creative' ? 'primary' : 'ghost'} onClick={() => setSelectedStyle('creative')}>
                Creative
              </PillButton>
            </div>
            <div className="flex items-center gap-2">
              <ModernButton variant="primary" onClick={() => console.log('Generate')}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Design
              </ModernButton>
              <ModernButton variant="outline" onClick={() => console.log('Random')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Random Prompt
              </ModernButton>
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Generated Designs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedDesigns.map((design) => (
                  <div key={design.id} className="rounded-xl border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-muted relative">
                      <img src={design.thumbnail} alt={design.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors">
                          <Eye className="w-4 h-4 text-gray-700" />
                        </button>
                        <button className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors">
                          <Heart className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{design.title}</h4>
                        <span className="text-xs px-2 py-1 rounded-md bg-fuchsia-100 text-fuchsia-700">
                          {design.style}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{design.prompt}</p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {design.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {design.views}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', design.id)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Edit
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Download', design.id)}>
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </ModernButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Design Styles</h3>
              <div className="space-y-3">
                {designStyles.map((style) => (
                  <div key={style.name} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${style.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{style.name}</p>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance</h3>
              <div className="space-y-3">
                <MiniKPI label="Generation Speed" value="2.4s" change={-12.5} />
                <MiniKPI label="Success Rate" value="98%" change={5.2} />
                <MiniKPI label="Credits Left" value="847" change={-25.3} />
                <MiniKPI label="Avg Quality Score" value="9.2/10" change={8.3} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
