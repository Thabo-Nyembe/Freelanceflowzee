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
  CheckCircle
} from 'lucide-react'

/**
 * SEO V2 - Groundbreaking SEO & Search Performance
 * Showcases SEO metrics and optimization with modern components
 */
export default function SEOV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month')

  const stats = [
    { label: 'Organic Traffic', value: '124K', change: 42.3, icon: <Eye className="w-5 h-5" /> },
    { label: 'Avg Position', value: '8.4', change: -25.3, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Click Rate', value: '4.8%', change: 18.7, icon: <MousePointer className="w-5 h-5" /> },
    { label: 'Domain Authority', value: '67', change: 12.5, icon: <Award className="w-5 h-5" /> }
  ]

  const keywords = [
    {
      keyword: 'project management software',
      position: 4,
      volume: 8900,
      difficulty: 68,
      traffic: 2400,
      trend: 'up'
    },
    {
      keyword: 'collaboration tools',
      position: 7,
      volume: 12000,
      difficulty: 72,
      traffic: 1800,
      trend: 'up'
    },
    {
      keyword: 'team productivity app',
      position: 12,
      volume: 5400,
      difficulty: 54,
      traffic: 980,
      trend: 'stable'
    },
    {
      keyword: 'workflow automation',
      position: 18,
      volume: 6700,
      difficulty: 76,
      traffic: 450,
      trend: 'down'
    }
  ]

  const topPages = [
    { rank: 1, name: 'Homepage', avatar: '🏠', value: '24.7K', change: 42.3 },
    { rank: 2, name: 'Features Page', avatar: '⭐', value: '18.2K', change: 35.1 },
    { rank: 3, name: 'Pricing Page', avatar: '💰', value: '12.4K', change: 28.5 },
    { rank: 4, name: 'Blog Articles', avatar: '📝', value: '8.9K', change: 22.7 },
    { rank: 5, name: 'Case Studies', avatar: '📊', value: '6.3K', change: 18.2 }
  ]

  const technicalSEO = [
    { metric: 'Page Speed', score: 94, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Mobile Friendly', score: 98, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Core Web Vitals', score: 87, status: 'good', color: 'from-blue-500 to-cyan-500' },
    { metric: 'Security (HTTPS)', score: 100, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'XML Sitemap', score: 100, status: 'excellent', color: 'from-green-500 to-emerald-500' },
    { metric: 'Structured Data', score: 76, status: 'good', color: 'from-yellow-500 to-amber-500' }
  ]

  const backlinks = [
    { source: 'techcrunch.com', authority: 92, links: 3, traffic: 2400 },
    { source: 'producthunt.com', authority: 88, links: 5, traffic: 1800 },
    { source: 'medium.com', authority: 84, links: 12, traffic: 980 },
    { source: 'forbes.com', authority: 95, links: 1, traffic: 3200 }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />
      case 'down': return <TrendingUp className="w-3 h-3 text-red-600 rotate-180" />
      default: return <div className="w-3 h-3" />
    }
  }

  const getPositionColor = (position: number) => {
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
          <GradientButton from="blue" to="indigo" onClick={() => console.log('Run audit')}>
            <Zap className="w-5 h-5 mr-2" />
            SEO Audit
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Search />} title="Keywords" description="Track rankings" onClick={() => console.log('Keywords')} />
          <BentoQuickAction icon={<Link />} title="Backlinks" description="Link building" onClick={() => console.log('Backlinks')} />
          <BentoQuickAction icon={<FileText />} title="Content" description="Optimize pages" onClick={() => console.log('Content')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Performance" onClick={() => console.log('Analytics')} />
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
              <h3 className="text-xl font-semibold mb-4">Keyword Rankings</h3>
              <div className="space-y-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{keyword.keyword}</h4>
                          {getTrendIcon(keyword.trend)}
                        </div>
                        <div className="grid grid-cols-4 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Position</p>
                            <p className={`font-bold text-lg ${getPositionColor(keyword.position)}`}>
                              #{keyword.position}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Volume</p>
                            <p className="font-semibold">{keyword.volume.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Difficulty</p>
                            <p className={`font-semibold ${getDifficultyColor(keyword.difficulty)}`}>
                              {keyword.difficulty}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Traffic</p>
                            <p className="font-semibold">{keyword.traffic.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              <h3 className="text-xl font-semibold mb-4">Top Backlinks</h3>
              <div className="space-y-3">
                {backlinks.map((backlink, index) => (
                  <div key={index} className="p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-sm">{backlink.source}</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <p className="text-muted-foreground">Authority</p>
                            <p className="font-semibold">{backlink.authority}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Links</p>
                            <p className="font-semibold">{backlink.links}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Traffic</p>
                            <p className="font-semibold">{backlink.traffic}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Landing Pages" items={topPages} />

            <ProgressCard
              title="SEO Score"
              current={87}
              goal={100}
              unit=""
              icon={<Award className="w-5 h-5" />}
            />

            <ProgressCard
              title="Monthly Traffic Goal"
              current={124000}
              goal={200000}
              unit=""
              icon={<Eye className="w-5 h-5" />}
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Indexed Pages" value="2,847" change={15.3} />
                <MiniKPI label="Crawl Errors" value="12" change={-42.5} />
                <MiniKPI label="Avg Session" value="3m 24s" change={22.7} />
                <MiniKPI label="Bounce Rate" value="42%" change={-18.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
