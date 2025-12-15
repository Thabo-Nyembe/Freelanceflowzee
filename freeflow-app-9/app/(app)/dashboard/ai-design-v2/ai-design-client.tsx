'use client'

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
  Share2,
  Trash2,
  Plus
} from 'lucide-react'
import { useAIDesigns, AIDesign, getDesignStatusColor, getDesignStyleColor, formatDesignDate } from '@/lib/hooks/use-ai-designs'
import { createDesign, updateDesign, likeDesign, incrementViews, incrementDownloads, deleteDesign } from '@/app/actions/ai-designs'
import { toast } from 'sonner'

interface AIDesignClientProps {
  initialDesigns: AIDesign[]
}

type DesignStyle = 'modern' | 'minimalist' | 'creative' | 'professional' | 'abstract' | 'vintage'

export default function AIDesignClient({ initialDesigns }: AIDesignClientProps) {
  const { designs, stats, isLoading, error } = useAIDesigns(initialDesigns)
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>('modern')
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<AIDesign | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design prompt')
      return
    }

    setIsGenerating(true)
    try {
      const result = await createDesign({
        prompt: prompt.trim(),
        style: selectedStyle,
        title: `${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)} Design`
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Design generation started!')
        setPrompt('')
      }
    } catch (err) {
      toast.error('Failed to generate design')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLike = async (designId: string) => {
    const result = await likeDesign(designId)
    if (result.error) {
      toast.error(result.error)
    }
  }

  const handleView = async (design: AIDesign) => {
    await incrementViews(design.id)
    setSelectedDesign(design)
  }

  const handleDownload = async (designId: string) => {
    const result = await incrementDownloads(designId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Download started')
    }
  }

  const handleDelete = async (designId: string) => {
    if (!confirm('Are you sure you want to delete this design?')) return

    const result = await deleteDesign(designId)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Design deleted')
    }
  }

  const designStyles = [
    { name: 'modern' as const, description: 'Clean gradients & bold typography', color: 'from-blue-500 to-purple-500' },
    { name: 'minimalist' as const, description: 'Simple shapes & negative space', color: 'from-gray-400 to-gray-600' },
    { name: 'creative' as const, description: 'Abstract art & vibrant colors', color: 'from-pink-500 to-orange-500' },
    { name: 'professional' as const, description: 'Corporate & trustworthy', color: 'from-indigo-500 to-blue-500' },
    { name: 'abstract' as const, description: 'Unique patterns & shapes', color: 'from-violet-500 to-fuchsia-500' },
    { name: 'vintage' as const, description: 'Retro aesthetics & textures', color: 'from-amber-500 to-orange-600' }
  ]

  const statItems = [
    { label: 'Designs Created', value: stats.total.toString(), change: 25.3, icon: <Image className="w-5 h-5" /> },
    { label: 'AI Credits Used', value: stats.totalCreditsUsed.toString(), change: 18.7, icon: <Zap className="w-5 h-5" /> },
    { label: 'Total Likes', value: stats.totalLikes.toString(), change: 32.1, icon: <Heart className="w-5 h-5" /> },
    { label: 'Total Downloads', value: stats.totalDownloads.toString(), change: 12.5, icon: <Download className="w-5 h-5" /> }
  ]

  const recentActivity = designs.slice(0, 4).map(design => ({
    icon: design.status === 'completed' ? <Image className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />,
    title: design.status === 'completed' ? 'Design completed' : 'Design generating',
    description: design.title,
    time: formatDesignDate(design.created_at),
    status: design.status === 'completed' ? 'success' as const : 'info' as const
  }))

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
          <GradientButton from="fuchsia" to="pink" onClick={() => document.getElementById('design-prompt')?.focus()}>
            <Sparkles className="w-5 h-5 mr-2" />
            Generate Design
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Wand2 />} title="Quick Generate" description="Instant AI" onClick={() => document.getElementById('design-prompt')?.focus()} />
          <BentoQuickAction icon={<Palette />} title="Color Palette" description="AI colors" onClick={() => console.log('Palette')} />
          <BentoQuickAction icon={<Layers />} title="Templates" description="Pre-made" onClick={() => console.log('Templates')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <BentoCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Design Prompt</h3>
          <div className="space-y-4">
            <textarea
              id="design-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design idea... (e.g., 'Modern logo with gradient colors for tech startup')"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none"
              rows={4}
            />
            <div className="flex items-center gap-3 flex-wrap">
              {(['modern', 'minimalist', 'creative', 'professional', 'abstract', 'vintage'] as const).map((style) => (
                <PillButton
                  key={style}
                  variant={selectedStyle === style ? 'primary' : 'ghost'}
                  onClick={() => setSelectedStyle(style)}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </PillButton>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <ModernButton variant="primary" onClick={handleGenerate} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Design'}
              </ModernButton>
              <ModernButton variant="outline" onClick={() => setPrompt('')}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear
              </ModernButton>
            </div>
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Generated Designs</h3>
                <span className="text-sm text-muted-foreground">{designs.length} designs</span>
              </div>

              {designs.length === 0 ? (
                <div className="text-center py-12">
                  <Image className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h4 className="text-lg font-medium mb-2">No designs yet</h4>
                  <p className="text-muted-foreground mb-4">Enter a prompt above to generate your first design</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {designs.map((design) => (
                    <div key={design.id} className="rounded-xl border border-border bg-background overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-square bg-muted relative">
                        {design.thumbnail_url ? (
                          <img src={design.thumbnail_url} alt={design.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {design.status === 'pending' || design.status === 'processing' ? (
                              <div className="text-center">
                                <Sparkles className="w-12 h-12 mx-auto text-fuchsia-500 animate-pulse" />
                                <p className="text-sm text-muted-foreground mt-2">Generating...</p>
                              </div>
                            ) : (
                              <Image className="w-12 h-12 text-muted-foreground" />
                            )}
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <button
                            onClick={() => handleView(design)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors"
                          >
                            <Eye className="w-4 h-4 text-gray-700" />
                          </button>
                          <button
                            onClick={() => handleLike(design.id)}
                            className="p-2 rounded-lg bg-white/90 hover:bg-white transition-colors"
                          >
                            <Heart className="w-4 h-4 text-gray-700" />
                          </button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${getDesignStatusColor(design.status)}`}>
                            {design.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{design.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getDesignStyleColor(design.style)}`}>
                            {design.style}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{design.prompt}</p>
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
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {design.downloads}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {design.status === 'completed' && (
                              <ModernButton variant="outline" size="sm" onClick={() => handleDownload(design.id)}>
                                <Download className="w-3 h-3 mr-1" />
                                Export
                              </ModernButton>
                            )}
                            <ModernButton variant="outline" size="sm" onClick={() => handleDelete(design.id)}>
                              <Trash2 className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BentoCard>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Design Styles</h3>
              <div className="space-y-3">
                {designStyles.map((style) => (
                  <div
                    key={style.name}
                    onClick={() => setSelectedStyle(style.name)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedStyle === style.name ? 'bg-fuchsia-100 border-2 border-fuchsia-300' : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${style.color}`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{style.name}</p>
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
                <MiniKPI
                  label="Generation Speed"
                  value={`${(stats.avgGenerationTime / 1000).toFixed(1)}s`}
                  change={-12.5}
                />
                <MiniKPI
                  label="Success Rate"
                  value={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`}
                  change={5.2}
                />
                <MiniKPI
                  label="Credits Used"
                  value={stats.totalCreditsUsed.toString()}
                  change={-25.3}
                />
                <MiniKPI
                  label="Avg Quality Score"
                  value={`${stats.avgQualityScore.toFixed(1)}/10`}
                  change={8.3}
                />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {/* Design Detail Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDesign(null)}>
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedDesign.title}</h3>
                <button onClick={() => setSelectedDesign(null)} className="p-2 hover:bg-muted rounded-lg">
                  ×
                </button>
              </div>
              {selectedDesign.output_url && (
                <img src={selectedDesign.output_url} alt={selectedDesign.title} className="w-full rounded-lg mb-4" />
              )}
              <div className="space-y-2">
                <p className="text-sm"><strong>Prompt:</strong> {selectedDesign.prompt}</p>
                <p className="text-sm"><strong>Style:</strong> {selectedDesign.style}</p>
                <p className="text-sm"><strong>Model:</strong> {selectedDesign.model}</p>
                <p className="text-sm"><strong>Resolution:</strong> {selectedDesign.resolution}</p>
                <p className="text-sm"><strong>Created:</strong> {formatDesignDate(selectedDesign.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
