"use client"

import { usePathname, useRouter } from 'next/navigation'
import {
  Brain,
  Sparkles,
  Zap,
  FileText,
  Clock,
  TrendingUp,
  Activity,
  Settings as SettingsIcon
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { NumberFlow } from '@/components/ui/number-flow'
import { Upload, CheckCircle, ArrowRight } from 'lucide-react'

interface TabItem {
  id: string
  name: string
  icon: any
  path: string
}

const MAIN_TABS: TabItem[] = [
  { id: 'creative-assets', name: 'Creative Assets', icon: Sparkles, path: '/dashboard/ai-create' },
  { id: 'studio', name: 'Studio', icon: Zap, path: '/dashboard/ai-create/studio' },
  { id: 'templates', name: 'Templates', icon: FileText, path: '/dashboard/ai-create/templates' },
  { id: 'history', name: 'History', icon: Clock, path: '/dashboard/ai-create/history' },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, path: '/dashboard/ai-create/analytics' },
  { id: 'compare', name: 'Compare', icon: Activity, path: '/dashboard/ai-create/compare' },
  { id: 'settings', name: 'Settings', icon: SettingsIcon, path: '/dashboard/ai-create/settings' }
]

export default function AICreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (path: string) => {
    if (path === '/dashboard/ai-create') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  return (
    <div className="container py-8 kazi-bg-light dark:kazi-bg-dark min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" data-testid="ai-create-icon" />
            <TextShimmer className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-gray-100 dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
              AI Create
            </TextShimmer>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-3">
            Generate professional content with <span className="font-semibold text-green-600 dark:text-green-400">4 FREE AI models</span> + 8 premium options. Upload any file type - images, videos, code, designs - and get instant AI-powered insights.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge className="bg-green-500 text-white">4 Free Models</Badge>
            <Badge variant="outline">12 Total Models</Badge>
            <Badge variant="outline">30+ File Types</Badge>
            <Badge variant="outline">Code & Design Analysis</Badge>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-lg backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">FREE Models</span>
              </div>
              <div className="flex items-baseline gap-1">
                <NumberFlow value={4} className="text-2xl font-bold text-green-600 dark:text-green-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">/ 12 total</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Via OpenRouter</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 dark:from-blue-400/10 dark:to-cyan-400/10 rounded-lg backdrop-blur-sm">
                  <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">File Types</span>
              </div>
              <div className="flex items-baseline gap-1">
                <NumberFlow value={30} className="text-2xl font-bold text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">+ formats</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Media, Code, Design</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="gradient" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-400/10 dark:to-pink-400/10 rounded-lg backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Cost Savings</span>
              </div>
              <div className="flex items-baseline gap-1">
                <NumberFlow value={99} className="text-2xl font-bold text-purple-600 dark:text-purple-400" />
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">%</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">vs ChatGPT Plus</p>
            </div>
          </LiquidGlassCard>

          <LiquidGlassCard variant="tinted" hoverEffect={true}>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Status</span>
              </div>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle className="h-4 w-4" />
                Ready to Create
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">All systems go!</p>
            </div>
          </LiquidGlassCard>
        </div>

        {/* Feature Callout Banner */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 dark:from-green-950/30 dark:via-blue-950/30 dark:to-purple-950/30 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">🎉 NEW: Free AI Models + Enhanced File Upload</h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Start creating for FREE with 4 powerful AI models via OpenRouter. Upload code files, design files (Figma, Sketch, PSD), and get instant AI-powered analysis!
              </p>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span>Mistral 7B - FREE</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  <span>Phi-3 Mini 128K - FREE</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  <span>15+ Code Languages</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  <span>Design Files (.fig, .psd, .sketch)</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap"
              onClick={() => router.push('/dashboard/ai-create')}
            >
              Try Free Models
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.path)

            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </div>
              </button>
            )
          })}
        </div>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
