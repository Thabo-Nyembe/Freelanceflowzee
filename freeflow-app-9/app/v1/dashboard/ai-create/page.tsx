"use client"

// MIGRATED: Batch #20 - Verified database hook integration
export const dynamic = 'force-dynamic';

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CreativeAssetGenerator } from '@/components/ai-create/creative-asset-generator'
import { Card, CardContent } from '@/components/ui/card'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  Wand2,
  History,
  LayoutTemplate,
  BarChart3,
  GitCompare,
  Settings,
  Palette,
  Sparkles
} from 'lucide-react'

// A+++ UTILITIES
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { createSimpleLogger } from '@/lib/simple-logger'

const logger = createSimpleLogger('AI-Create')

const subPages = [
  {
    name: 'Studio',
    href: '/v1/dashboard/ai-create/studio',
    icon: Palette,
    description: 'Advanced creation studio with multi-model support',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'History',
    href: '/v1/dashboard/ai-create/history',
    icon: History,
    description: 'View and manage your creation history',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Templates',
    href: '/v1/dashboard/ai-create/templates',
    icon: LayoutTemplate,
    description: 'Pre-built templates for quick creation',
    color: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Analytics',
    href: '/v1/dashboard/ai-create/analytics',
    icon: BarChart3,
    description: 'Track usage, costs, and performance',
    color: 'from-orange-500 to-amber-500'
  },
  {
    name: 'Compare',
    href: '/v1/dashboard/ai-create/compare',
    icon: GitCompare,
    description: 'Compare outputs from different models',
    color: 'from-indigo-500 to-violet-500'
  },
  {
    name: 'Settings',
    href: '/v1/dashboard/ai-create/settings',
    icon: Settings,
    description: 'Configure AI preferences and defaults',
    color: 'from-gray-500 to-slate-500'
  }
]

export default function AICreatePage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const pathname = usePathname()

  return (
    <div className="space-y-6">
      {/* Header with Sub-Page Navigation */}
      <LiquidGlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">AI Create</h1>
                <p className="text-sm text-gray-600">Generate creative content with AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-purple-600">Powered by Multiple AI Models</span>
            </div>
          </div>

          {/* Sub-Page Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {subPages.map((page) => (
              <Link key={page.href} href={page.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-purple-300">
                  <CardContent className="p-4 text-center">
                    <div className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${page.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <page.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800">{page.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{page.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </LiquidGlassCard>

      {/* Main Content - Creative Asset Generator */}
      <CreativeAssetGenerator asStandalone={false} />
    </div>
  )
}
