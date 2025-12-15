"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ProgressCard,
  RankingList
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Search,
  TrendingUp,
  Eye,
  MousePointer,
  Globe,
  Award,
  BarChart3,
  Link,
  FileText,
  Zap,
  Target,
  CheckCircle,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink
} from 'lucide-react'
import { useSEOKeywords, useSEOBacklinks, useSEOPages, useSEOStats, SEOKeyword, SEOBacklink, SEOPage } from '@/lib/hooks/use-seo'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SEOClientProps {
  initialKeywords: SEOKeyword[]
  initialBacklinks: SEOBacklink[]
  initialPages: SEOPage[]
}

export default function SEOClient({ initialKeywords, initialBacklinks, initialPages }: SEOClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')
  const [showNewKeyword, setShowNewKeyword] = useState(false)
  const [showNewBacklink, setShowNewBacklink] = useState(false)
  const [newKeyword, setNewKeyword] = useState({
    keyword: '',
    target_url: '',
    search_volume: 0,
    keyword_difficulty: 0
  })
  const [newBacklink, setNewBacklink] = useState({
    source_url: '',
    source_domain: '',
    target_url: '',
    domain_authority: 0
  })

  const {
    keywords,
    loading: keywordsLoading,
    createKeyword,
    deleteKeyword,
    updateRanking
  } = useSEOKeywords()
  const {
    backlinks,
    loading: backlinksLoading,
    createBacklink,
    markLost
  } = useSEOBacklinks()
  const { pages, loading: pagesLoading } = useSEOPages()
  const { getStats } = useSEOStats()

  const displayKeywords = keywords.length > 0 ? keywords : initialKeywords
  const displayBacklinks = backlinks.length > 0 ? backlinks : initialBacklinks
  const displayPages = pages.length > 0 ? pages : initialPages
  const stats = getStats()

  const statCards = [
    { label: 'Organic Traffic', value: stats.totalTraffic > 1000 ? `${(stats.totalTraffic / 1000).toFixed(0)}K` : stats.totalTraffic.toString(), change: 42.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Avg Position', value: stats.avgPosition.toFixed(1), change: -25.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Top 10 Keywords', value: stats.top10Keywords.toString(), change: 18.7, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Domain Authority', value: stats.avgDomainAuthority.toFixed(0), change: 12.5, icon: <Award className="w-5 h-5" /> }
  ]

  const topPages = displayPages
    .sort((a, b) => b.organic_traffic - a.organic_traffic)
    .slice(0, 5)
    .map((p, i) => ({
      rank: i + 1,
      name: p.title || p.url.split('/').pop() || 'Page',
      avatar: i === 0 ? '🏠' : i === 1 ? '⭐' : i === 2 ? '💰' : i === 3 ? '📝' : '📊',
      value: `${(p.organic_traffic / 1000).toFixed(1)}K`,
      change: 20 + Math.random() * 20
    }))

  const technicalSEO = displayPages.length > 0 ? [
    { metric: 'Page Speed', score: Math.round(displayPages.reduce((s, p) => s + p.page_speed_score, 0) / displayPages.length), status: 'good', color: 'from-green-500 to-emerald-500' },
    { metric: 'Mobile Score', score: Math.round(displayPages.reduce((s, p) => s + p.mobile_score, 0) / displayPages.length), status: 'good', color: 'from-green-500 to-emerald-500' },
    { metric: 'Core Web Vitals', score: Math.round(displayPages.reduce((s, p) => s + p.core_web_vitals_score, 0) / displayPages.length), status: 'good', color: 'from-blue-500 to-cyan-500' },
    { metric: 'Pages Indexed', score: Math.round((displayPages.filter(p => p.is_indexed).length / displayPages.length) * 100), status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Has Sitemap', score: Math.round((displayPages.filter(p => p.has_sitemap).length / displayPages.length) * 100), status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Structured Data', score: Math.round((displayPages.filter(p => p.has_structured_data).length / displayPages.length) * 100), status: 'good', color: 'from-yellow-500 to-amber-500' }
  ] : [
    { metric: 'Page Speed', score: 94, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Mobile Friendly', score: 98, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Core Web Vitals', score: 87, status: 'good', color: 'from-blue-500 to-cyan-500' },
    { metric: 'Security (HTTPS)', score: 100, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'XML Sitemap', score: 100, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Structured Data', score: 76, status: 'good', color: 'from-yellow-500 to-amber-500' }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'down': return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
      default: return <div className="w-3 h-3" />
    }
  }

  const getPositionColor = (position: number | null) => {
    if (!position) return 'text-gray-600'
    if (position <= 3) return 'text-green-600'
    if (position <= 10) return 'text-blue-600'
    if (position <= 20) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty >= 70) return 'text-red-600'
    if (difficulty >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleCreateKeyword = async () => {
    if (!newKeyword.keyword) return
    try {
      await createKeyword(newKeyword)
      setShowNewKeyword(false)
      setNewKeyword({ keyword: '', target_url: '', search_volume: 0, keyword_difficulty: 0 })
    } catch (error) {
      console.error('Failed to create keyword:', error)
    }
  }

  const handleCreateBacklink = async () => {
    if (!newBacklink.source_url || !newBacklink.target_url) return
    try {
      const domain = new URL(newBacklink.source_url).hostname
      await createBacklink({ ...newBacklink, source_domain: domain })
      setShowNewBacklink(false)
      setNewBacklink({ source_url: '', source_domain: '', target_url: '', domain_authority: 0 })
    } catch (error) {
      console.error('Failed to create backlink:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Search className="w-10 h-10 text-blue-600" />
              SEO Dashboard
            </h1>
            <p className="text-muted-foreground">Optimize search performance and rankings</p>
          </div>
          <div className="flex gap-2">
            <ModernButton variant="outline" onClick={() => setShowNewKeyword(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </ModernButton>
            <GradientButton from="blue" to="indigo" onClick={() => setShowNewBacklink(true)}>
              <Link className="w-5 h-5 mr-2" />
              Add Backlink
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={statCards} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Search />} title="Keywords" description={`${displayKeywords.length} tracking`} onClick={() => setShowNewKeyword(true)} />
          <BentoQuickAction icon={<Link />} title="Backlinks" description={`${displayBacklinks.length} total`} onClick={() => setShowNewBacklink(true)} />
          <BentoQuickAction icon={<FileText />} title="Pages" description={`${displayPages.length} monitored`} onClick={() => {}} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => {}} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'week' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('week')}>
            Week
          </PillButton>
          <PillButton variant={selectedPeriod === 'month' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('month')}>
            Month
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarter' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarter')}>
            Quarter
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Keyword Rankings</h3>
                {keywordsLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-3">
                {displayKeywords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No keywords tracked yet. Add your first keyword!</p>
                  </div>
                ) : (
                  displayKeywords.map((keyword) => (
                    <div key={keyword.id} className="p-4 rounded-lg border border-border bg-background">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{keyword.keyword}</h4>
                            {getTrendIcon(keyword.trend)}
                          </div>
                          <div className="grid grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Position</p>
                              <p className={`font-bold text-lg ${getPositionColor(keyword.current_position)}`}>
                                {keyword.current_position ? `#${keyword.current_position}` : '-'}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Volume</p>
                              <p className="font-semibold">{keyword.search_volume.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Difficulty</p>
                              <p className={`font-semibold ${getDifficultyColor(keyword.keyword_difficulty)}`}>
                                {keyword.keyword_difficulty}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Traffic</p>
                              <p className="font-semibold">{keyword.actual_traffic.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => deleteKeyword(keyword.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </ModernButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>

            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Technical SEO</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {technicalSEO.map((item) => (
                  <div key={item.metric} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <span className="text-2xl font-bold text-green-600">{item.score}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color}`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.status}</p>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Top Backlinks</h3>
                {backlinksLoading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground" />}
              </div>
              <div className="space-y-3">
                {displayBacklinks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No backlinks tracked yet. Add your first backlink!</p>
                  </div>
                ) : (
                  displayBacklinks.slice(0, 5).map((backlink) => (
                    <div key={backlink.id} className="p-3 rounded-lg border border-border bg-background">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <h4 className="font-semibold text-sm">{backlink.source_domain}</h4>
                            <a href={backlink.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-blue-600" />
                            </a>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs">
                            <div>
                              <p className="text-muted-foreground">Authority</p>
                              <p className="font-semibold">{backlink.domain_authority}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Type</p>
                              <p className="font-semibold">{backlink.link_type}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Traffic</p>
                              <p className="font-semibold">{backlink.referral_traffic}</p>
                            </div>
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm" onClick={() => markLost(backlink.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </ModernButton>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Landing Pages" items={topPages.length > 0 ? topPages : [
              { rank: 1, name: 'Add pages to track', avatar: '📊', value: '-', change: 0 }
            ]} />

            <ProgressCard
              title="SEO Score"
              current={stats.avgPageSpeed || 87}
              goal={100}
              unit=""
              icon={<Award className="w-5 h-5" />}
            />

            <ProgressCard
              title="Monthly Traffic Goal"
              current={stats.totalTraffic}
              goal={200000}
              unit=""
              icon={<Eye className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Keywords" value={stats.totalKeywords.toString()} change={15.3} />
                <MiniKPI label="Top 10 Rankings" value={stats.top10Keywords.toString()} change={22.7} />
                <MiniKPI label="Total Backlinks" value={stats.totalBacklinks.toString()} change={18.2} />
                <MiniKPI label="Pages Monitored" value={stats.totalPages.toString()} change={8.5} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      <Dialog open={showNewKeyword} onOpenChange={setShowNewKeyword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Keyword to Track</DialogTitle>
            <DialogDescription>
              Track a new keyword to monitor its ranking performance.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="keyword">Keyword</Label>
              <Input
                id="keyword"
                value={newKeyword.keyword}
                onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                placeholder="project management software"
              />
            </div>
            <div>
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={newKeyword.target_url}
                onChange={(e) => setNewKeyword({ ...newKeyword, target_url: e.target.value })}
                placeholder="https://yoursite.com/page"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="volume">Search Volume</Label>
                <Input
                  id="volume"
                  type="number"
                  value={newKeyword.search_volume || ''}
                  onChange={(e) => setNewKeyword({ ...newKeyword, search_volume: parseInt(e.target.value) || 0 })}
                  placeholder="5000"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty (0-100)</Label>
                <Input
                  id="difficulty"
                  type="number"
                  min="0"
                  max="100"
                  value={newKeyword.keyword_difficulty || ''}
                  onChange={(e) => setNewKeyword({ ...newKeyword, keyword_difficulty: parseInt(e.target.value) || 0 })}
                  placeholder="45"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewKeyword(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="blue" to="indigo" onClick={handleCreateKeyword}>
              <Plus className="w-4 h-4 mr-2" />
              Add Keyword
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showNewBacklink} onOpenChange={setShowNewBacklink}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backlink</DialogTitle>
            <DialogDescription>
              Track a new backlink pointing to your site.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sourceUrl">Source URL</Label>
              <Input
                id="sourceUrl"
                value={newBacklink.source_url}
                onChange={(e) => setNewBacklink({ ...newBacklink, source_url: e.target.value })}
                placeholder="https://linkingsite.com/article"
              />
            </div>
            <div>
              <Label htmlFor="backlinkTarget">Target URL (your page)</Label>
              <Input
                id="backlinkTarget"
                value={newBacklink.target_url}
                onChange={(e) => setNewBacklink({ ...newBacklink, target_url: e.target.value })}
                placeholder="https://yoursite.com/page"
              />
            </div>
            <div>
              <Label htmlFor="authority">Domain Authority (0-100)</Label>
              <Input
                id="authority"
                type="number"
                min="0"
                max="100"
                value={newBacklink.domain_authority || ''}
                onChange={(e) => setNewBacklink({ ...newBacklink, domain_authority: parseInt(e.target.value) || 0 })}
                placeholder="65"
              />
            </div>
          </div>
          <DialogFooter>
            <ModernButton variant="outline" onClick={() => setShowNewBacklink(false)}>
              Cancel
            </ModernButton>
            <GradientButton from="blue" to="indigo" onClick={handleCreateBacklink}>
              <Plus className="w-4 h-4 mr-2" />
              Add Backlink
            </GradientButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
