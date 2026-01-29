'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import { toast } from 'sonner'
import {
  Puzzle, Check, X, RefreshCw, Settings,
  Database, Cloud, Lock, Bell, Mail,
  CreditCard, Users, FileText, Zap
} from 'lucide-react'

const components = [
  { id: 'database', name: 'Database', icon: Database, status: 'connected', description: 'Supabase PostgreSQL' },
  { id: 'storage', name: 'File Storage', icon: Cloud, status: 'connected', description: 'Cloud storage for files' },
  { id: 'auth', name: 'Authentication', icon: Lock, status: 'connected', description: 'User authentication system' },
  { id: 'notifications', name: 'Notifications', icon: Bell, status: 'connected', description: 'Push & email notifications' },
  { id: 'email', name: 'Email Service', icon: Mail, status: 'connected', description: 'Transactional emails' },
  { id: 'payments', name: 'Payments', icon: CreditCard, status: 'pending', description: 'Stripe integration' },
  { id: 'team', name: 'Team Management', icon: Users, status: 'connected', description: 'Team & permissions' },
  { id: 'documents', name: 'Documents', icon: FileText, status: 'connected', description: 'Document generation' },
  { id: 'automation', name: 'Automation', icon: Zap, status: 'pending', description: 'Workflow automation' }
]

export default function SetupComponentsPage() {
  const [componentStatus, setComponentStatus] = useState(
    components.reduce((acc, comp) => ({ ...acc, [comp.id]: comp.status }), {} as Record<string, string>)
  )
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null)

  const handleRefresh = async (componentId: string) => {
    setIsRefreshing(componentId)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setComponentStatus(prev => ({ ...prev, [componentId]: 'connected' }))
    setIsRefreshing(null)
    toast.success(`${components.find(c => c.id === componentId)?.name} refreshed`)
  }

  const handleConfigure = (componentId: string) => {
    toast.info(`Configure ${components.find(c => c.id === componentId)?.name}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'error': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <Check className="w-4 h-4" />
      case 'pending': return <RefreshCw className="w-4 h-4" />
      case 'error': return <X className="w-4 h-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="w-8 h-8 text-blue-500" />
            <TextShimmer className="text-4xl font-bold">
              System Components
            </TextShimmer>
          </div>
          <p className="text-muted-foreground">
            Manage and monitor your system components and integrations
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <LiquidGlassCard key={component.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <component.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(componentStatus[component.id])}`}>
                      {getStatusIcon(componentStatus[component.id])}
                      {componentStatus[component.id]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{component.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{component.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRefresh(component.id)}
                      disabled={isRefreshing === component.id}
                      className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing === component.id ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      onClick={() => handleConfigure(component.id)}
                      className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                  </div>
                </div>
              </LiquidGlassCard>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </div>
  )
}
