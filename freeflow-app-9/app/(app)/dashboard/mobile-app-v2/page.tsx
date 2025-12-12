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
  ActivityFeed
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Smartphone,
  Download,
  Users,
  Star,
  TrendingUp,
  Bell,
  Zap,
  Eye,
  MessageSquare,
  Settings,
  Share2,
  Award,
  BarChart3
} from 'lucide-react'

/**
 * Mobile App V2 - Groundbreaking Mobile Platform Management
 * Showcases mobile app features and analytics with modern components
 */
export default function MobileAppV2() {
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'ios' | 'android'>('all')

  const stats = [
    { label: 'Total Downloads', value: '247K', change: 42.1, icon: <Download className="w-5 h-5" /> },
    { label: 'Active Users', value: '124K', change: 35.3, icon: <Users className="w-5 h-5" /> },
    { label: 'App Rating', value: '4.8', change: 8.2, icon: <Star className="w-5 h-5" /> },
    { label: 'Daily Engagement', value: '18m', change: 25.7, icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const appFeatures = [
    {
      id: '1',
      title: 'Push Notifications',
      description: 'Real-time alerts and updates',
      icon: <Bell className="w-8 h-8" />,
      status: 'active',
      users: 98420,
      engagement: 84,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      title: 'In-App Messaging',
      description: 'Direct communication',
      icon: <MessageSquare className="w-8 h-8" />,
      status: 'active',
      users: 87340,
      engagement: 76,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      title: 'Offline Mode',
      description: 'Work without internet',
      icon: <Zap className="w-8 h-8" />,
      status: 'beta',
      users: 45670,
      engagement: 62,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '4',
      title: 'Social Sharing',
      description: 'Share content easily',
      icon: <Share2 className="w-8 h-8" />,
      status: 'active',
      users: 124500,
      engagement: 91,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const platformStats = [
    { platform: 'iOS', downloads: 142000, users: 72000, rating: 4.9, growth: 38.5 },
    { platform: 'Android', downloads: 105000, users: 52000, rating: 4.7, growth: 46.2 }
  ]

  const appVersions = [
    {
      version: '2.4.1',
      releaseDate: '2 days ago',
      downloads: 24700,
      status: 'stable',
      features: ['Bug fixes', 'Performance improvements', 'New dark mode']
    },
    {
      version: '2.4.0',
      releaseDate: '2 weeks ago',
      downloads: 89400,
      status: 'stable',
      features: ['Offline mode beta', 'Enhanced security', 'UI updates']
    },
    {
      version: '2.3.9',
      releaseDate: '1 month ago',
      downloads: 124500,
      status: 'deprecated',
      features: ['Previous stable release']
    }
  ]

  const recentActivity = [
    { icon: <Download className="w-5 h-5" />, title: 'New version released', description: 'v2.4.1 now available', time: '2 days ago', status: 'success' as const },
    { icon: <Star className="w-5 h-5" />, title: 'Rating milestone', description: 'Reached 4.8 average rating', time: '1 week ago', status: 'success' as const },
    { icon: <Users className="w-5 h-5" />, title: 'User milestone', description: '100K active users achieved', time: '2 weeks ago', status: 'success' as const },
    { icon: <Zap className="w-5 h-5" />, title: 'Feature launched', description: 'Offline mode beta released', time: '3 weeks ago', status: 'info' as const }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'beta': return 'bg-blue-100 text-blue-700'
      case 'stable': return 'bg-green-100 text-green-700'
      case 'deprecated': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const maxDownloads = Math.max(...platformStats.map(p => p.downloads))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50/30 to-cyan-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Smartphone className="w-10 h-10 text-indigo-600" />
              Mobile App
            </h1>
            <p className="text-muted-foreground">Manage your mobile presence and engagement</p>
          </div>
          <GradientButton from="indigo" to="blue" onClick={() => console.log('Analytics')}>
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Download />} title="Downloads" description="Track installs" onClick={() => console.log('Downloads')} />
          <BentoQuickAction icon={<Star />} title="Reviews" description="User feedback" onClick={() => console.log('Reviews')} />
          <BentoQuickAction icon={<Bell />} title="Push Alerts" description="Send notification" onClick={() => console.log('Push')} />
          <BentoQuickAction icon={<Settings />} title="App Config" description="Settings" onClick={() => console.log('Config')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPlatform === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedPlatform('all')}>
            All Platforms
          </PillButton>
          <PillButton variant={selectedPlatform === 'ios' ? 'primary' : 'ghost'} onClick={() => setSelectedPlatform('ios')}>
            iOS
          </PillButton>
          <PillButton variant={selectedPlatform === 'android' ? 'primary' : 'ghost'} onClick={() => setSelectedPlatform('android')}>
            Android
          </PillButton>
        </div>

        <BentoCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Platform Performance</h3>
          <div className="space-y-6">
            {platformStats.map((platform) => {
              const downloadPercent = (platform.downloads / maxDownloads) * 100

              return (
                <div key={platform.platform} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">{platform.platform}</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground">Downloads</p>
                        <p className="font-bold">{(platform.downloads / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Active Users</p>
                        <p className="font-bold">{(platform.users / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Rating</p>
                        <p className="font-bold flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          {platform.rating}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground">Growth</p>
                        <p className="font-bold text-green-600">+{platform.growth}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-300"
                      style={{ width: `${downloadPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </BentoCard>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">App Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {appFeatures.map((feature) => (
                  <div key={feature.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center text-white flex-shrink-0`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{feature.title}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(feature.status)}`}>
                            {feature.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{feature.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">Users</p>
                            <p className="font-semibold">{(feature.users / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Engagement</p>
                            <p className="font-semibold">{feature.engagement}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">App Versions</h3>
              <div className="space-y-3">
                {appVersions.map((version) => (
                  <div key={version.version} className="p-4 rounded-lg border border-border bg-background">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">Version {version.version}</h4>
                          <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(version.status)}`}>
                            {version.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">Released {version.releaseDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Downloads</p>
                        <p className="font-semibold">{(version.downloads / 1000).toFixed(1)}K</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {version.features.map((feature, index) => (
                        <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <ProgressCard
              title="Download Target"
              current={247000}
              goal={500000}
              unit=""
              icon={<Download className="w-5 h-5" />}
            />

            <ProgressCard
              title="Rating Goal"
              current={4.8}
              goal={5.0}
              unit=""
              icon={<Star className="w-5 h-5" />}
            />

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="DAU/MAU Ratio" value="42%" change={8.3} />
                <MiniKPI label="Session Length" value="18m" change={25.7} />
                <MiniKPI label="Retention Rate" value="78%" change={12.5} />
                <MiniKPI label="Crash-free Rate" value="99.8%" change={2.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
