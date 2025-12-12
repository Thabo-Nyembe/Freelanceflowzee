"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Plug,
  CheckCircle,
  Plus,
  Search,
  Settings,
  BarChart3,
  Zap,
  Mail,
  Calendar,
  MessageSquare,
  Database,
  Cloud
} from 'lucide-react'

/**
 * Integrations V2 - Groundbreaking Third-Party Connections
 * Showcases integrations with modern components
 */
export default function IntegrationsV2() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'connected' | 'available'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const stats = [
    { label: 'Connected', value: '12', change: 12.5, icon: <Plug className="w-5 h-5" /> },
    { label: 'Available', value: '48', change: 8.3, icon: <Cloud className="w-5 h-5" /> },
    { label: 'Data Synced', value: '2.4K', change: 25.3, icon: <Database className="w-5 h-5" /> },
    { label: 'Uptime', value: '99.9%', change: 0.1, icon: <CheckCircle className="w-5 h-5" /> }
  ]

  const integrations = [
    {
      id: 1,
      name: 'Stripe',
      description: 'Accept payments and manage subscriptions',
      category: 'Payments',
      icon: '💳',
      connected: true,
      color: 'blue'
    },
    {
      id: 2,
      name: 'Google Calendar',
      description: 'Sync your schedule and events',
      category: 'Productivity',
      icon: '📅',
      connected: true,
      color: 'green'
    },
    {
      id: 3,
      name: 'Slack',
      description: 'Team communication and notifications',
      category: 'Communication',
      icon: '💬',
      connected: true,
      color: 'purple'
    },
    {
      id: 4,
      name: 'Mailchimp',
      description: 'Email marketing and automation',
      category: 'Marketing',
      icon: '✉️',
      connected: false,
      color: 'yellow'
    },
    {
      id: 5,
      name: 'Dropbox',
      description: 'Cloud storage and file sharing',
      category: 'Storage',
      icon: '📦',
      connected: true,
      color: 'blue'
    },
    {
      id: 6,
      name: 'Zapier',
      description: 'Connect with 5,000+ apps',
      category: 'Automation',
      icon: '⚡',
      connected: false,
      color: 'orange'
    },
    {
      id: 7,
      name: 'GitHub',
      description: 'Code repository and version control',
      category: 'Development',
      icon: '🐙',
      connected: true,
      color: 'gray'
    },
    {
      id: 8,
      name: 'Zoom',
      description: 'Video conferencing',
      category: 'Communication',
      icon: '📹',
      connected: false,
      color: 'blue'
    }
  ]

  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 dark:bg-blue-950'
      case 'green': return 'bg-green-50 dark:bg-green-950'
      case 'purple': return 'bg-purple-50 dark:bg-purple-950'
      case 'yellow': return 'bg-yellow-50 dark:bg-yellow-950'
      case 'orange': return 'bg-orange-50 dark:bg-orange-950'
      case 'gray': return 'bg-gray-50 dark:bg-gray-950'
      default: return 'bg-gray-50 dark:bg-gray-950'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Plug className="w-10 h-10 text-cyan-600" />
              Integrations
            </h1>
            <p className="text-muted-foreground">Connect your favorite tools and services</p>
          </div>
          <GradientButton from="cyan" to="blue" onClick={() => console.log('Browse')}>
            <Plus className="w-5 h-5 mr-2" />
            Browse All
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plug />} title="Connect New" description="Add integration" onClick={() => console.log('Connect')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Manage" onClick={() => console.log('Settings')} />
          <BentoQuickAction icon={<BarChart3 />} title="Usage Stats" description="Analytics" onClick={() => console.log('Stats')} />
          <BentoQuickAction icon={<Zap />} title="API Keys" description="Manage" onClick={() => console.log('Keys')} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <PillButton variant={selectedFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('all')}>
              All
            </PillButton>
            <PillButton variant={selectedFilter === 'connected' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('connected')}>
              Connected
            </PillButton>
            <PillButton variant={selectedFilter === 'available' ? 'primary' : 'ghost'} onClick={() => setSelectedFilter('available')}>
              Available
            </PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <BentoCard key={integration.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-lg ${getColorClass(integration.color)}`}>
                          <span className="text-2xl">{integration.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground">{integration.category}</p>
                        </div>
                      </div>
                      {integration.connected && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-md text-xs">
                          <CheckCircle className="w-3 h-3" />
                          Connected
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{integration.description}</p>

                    <div className="flex items-center gap-2 pt-3 border-t">
                      {integration.connected ? (
                        <>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Configure', integration.id)}>
                            <Settings className="w-3 h-3 mr-1" />
                            Configure
                          </ModernButton>
                          <ModernButton variant="outline" size="sm" onClick={() => console.log('Disconnect', integration.id)}>
                            Disconnect
                          </ModernButton>
                        </>
                      ) : (
                        <ModernButton variant="primary" size="sm" onClick={() => console.log('Connect', integration.id)}>
                          <Plug className="w-3 h-3 mr-1" />
                          Connect
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </BentoCard>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Popular Categories</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Marketing</span>
                  </div>
                  <span className="text-xs text-muted-foreground">12 apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Productivity</span>
                  </div>
                  <span className="text-xs text-muted-foreground">8 apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Communication</span>
                  </div>
                  <span className="text-xs text-muted-foreground">6 apps</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <span className="text-xs text-muted-foreground">4 apps</span>
                </div>
              </div>
            </BentoCard>
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="API Calls Today" value="2,847" change={12.5} />
                <MiniKPI label="Response Time" value="142ms" change={-8.3} />
                <MiniKPI label="Success Rate" value="99.9%" change={0.1} />
                <MiniKPI label="Data Transferred" value="4.2GB" change={15.7} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
