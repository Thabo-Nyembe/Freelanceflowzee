'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  MOCK_CLIENTS,
  MOCK_PROJECTS,
  MOCK_COMMUNICATIONS,
  MOCK_FILES,
  MOCK_CLIENT_STATS,
  getClientStatusColor,
  getClientTierColor,
  getProjectStatusColor,
  getCommunicationIcon,
  getFileCategoryIcon,
  formatFileSize,
  calculateHealthScore,
  getHealthScoreColor,
  getActiveProjects,
  getProjectBudgetStatus,
  isProjectOverdue
} from '@/lib/client-portal-utils'
import {
  Client,
  ClientStatus,
  ClientTier
} from '@/lib/client-portal-types'

type ViewMode = 'overview' | 'clients' | 'projects' | 'communications' | 'files'

export default function ClientPortalPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [filterStatus, setFilterStatus] = useState<ClientStatus | 'all'>('all')
  const [filterTier, setFilterTier] = useState<ClientTier | 'all'>('all')

  const viewModes = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'projects', label: 'Projects', icon: '📁' },
    { id: 'communications', label: 'Communications', icon: '💬' },
    { id: 'files', label: 'Files', icon: '📄' }
  ]

  const filteredClients = MOCK_CLIENTS.filter(client => {
    if (filterStatus !== 'all' && client.status !== filterStatus) return false
    if (filterTier !== 'all' && client.tier !== filterTier) return false
    return true
  })

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Clients</div>
                <div className="text-3xl font-bold text-blue-500">
                  {MOCK_CLIENT_STATS.totalClients}
                </div>
              </div>
              <div className="text-2xl">👥</div>
            </div>
            <div className="text-xs text-green-500">
              +{MOCK_CLIENT_STATS.newClientsThisMonth} this month
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Active Clients</div>
                <div className="text-3xl font-bold text-green-500">
                  {MOCK_CLIENT_STATS.activeClients}
                </div>
              </div>
              <div className="text-2xl">✅</div>
            </div>
            <div className="text-xs text-muted-foreground">
              {((MOCK_CLIENT_STATS.activeClients / MOCK_CLIENT_STATS.totalClients) * 100).toFixed(1)}% active rate
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
                <div className="text-3xl font-bold text-purple-500">
                  ${(MOCK_CLIENT_STATS.totalRevenue / 1000).toFixed(0)}K
                </div>
              </div>
              <div className="text-2xl">💰</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Avg: ${(MOCK_CLIENT_STATS.averageClientValue / 1000).toFixed(1)}K per client
            </div>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-1">Satisfaction</div>
                <div className="text-3xl font-bold text-orange-500">
                  {MOCK_CLIENT_STATS.clientSatisfaction.toFixed(1)}%
                </div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
            <div className="text-xs text-green-500">
              Above industry average
            </div>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Top Clients */}
      <LiquidGlassCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Top Clients by Revenue</h3>
          <div className="space-y-4">
            {MOCK_CLIENT_STATS.topClients.map((client, index) => (
              <div key={client.clientId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{client.clientName}</div>
                  <div className="text-sm text-muted-foreground">
                    ${(client.revenue / 1000).toFixed(0)}K revenue
                  </div>
                </div>
                <div className="w-32 h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(client.revenue / MOCK_CLIENT_STATS.totalRevenue) * 100}%` }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </LiquidGlassCard>
    </div>
  )

  const renderClients = () => (
    <div className="space-y-6">
      {/* Filters */}
      <LiquidGlassCard>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ClientStatus | 'all')}
                className="px-4 py-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="onboarding">Onboarding</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value as ClientTier | 'all')}
                className="px-4 py-2 rounded-lg border bg-background text-sm"
              >
                <option value="all">All Tiers</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors">
              + Add Client
            </button>
          </div>
        </div>
      </LiquidGlassCard>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => {
          const healthScore = calculateHealthScore(client)

          return (
            <LiquidGlassCard key={client.id}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                      {client.companyName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{client.companyName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded ${getClientStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded ${getClientTierColor(client.tier)}`}>
                          {client.tier}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{client.contactPerson}</span></div>
                  <div><span className="text-muted-foreground">Email:</span> <span className="font-medium text-xs">{client.email}</span></div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div>
                      <div className="text-xl font-bold text-blue-500">{client.metadata.activeProjects}</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-500">
                        ${(client.metadata.totalRevenue / 1000).toFixed(0)}K
                      </div>
                      <div className="text-xs text-muted-foreground">Revenue</div>
                    </div>
                    <div>
                      <div className={`text-xl font-bold ${getHealthScoreColor(healthScore)}`}>
                        {healthScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Health</div>
                    </div>
                  </div>
                </div>

                <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  View Details
                </button>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  const renderProjects = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Projects</h2>
      <div className="space-y-4">
        {MOCK_PROJECTS.map((project) => {
          const client = MOCK_CLIENTS.find(c => c.id === project.clientId)
          const budgetStatus = getProjectBudgetStatus(project)

          return (
            <LiquidGlassCard key={project.id}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                    <div className="text-sm text-muted-foreground mb-3">
                      {client?.companyName} • {project.description}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded ${getProjectStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span>Budget: ${(project.budget / 1000).toFixed(0)}K</span>
                      <span className={budgetStatus === 'over' ? 'text-red-500' : budgetStatus === 'warning' ? 'text-yellow-500' : 'text-green-500'}>
                        Spent: ${(project.spent / 1000).toFixed(0)}K
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-500">{project.progress}%</div>
                    <div className="text-sm text-muted-foreground">Complete</div>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  const renderCommunications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Communications</h2>
      <div className="space-y-4">
        {MOCK_COMMUNICATIONS.map((comm) => {
          const client = MOCK_CLIENTS.find(c => c.id === comm.clientId)
          return (
            <LiquidGlassCard key={comm.id}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">{getCommunicationIcon(comm.type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{comm.subject}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      {client?.companyName} • {new Date(comm.createdAt).toLocaleDateString()}
                    </div>
                    <p className="text-sm">{comm.content}</p>
                  </div>
                </div>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  const renderFiles = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Client Files</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_FILES.map((file) => {
          const client = MOCK_CLIENTS.find(c => c.id === file.clientId)
          return (
            <LiquidGlassCard key={file.id}>
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-2xl">{getFileCategoryIcon(file.category)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 text-sm truncate">{file.name}</h3>
                    <div className="text-xs text-muted-foreground">{client?.companyName}</div>
                  </div>
                </div>
                <div className="space-y-1 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Category:</span> <span className="capitalize">{file.category}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Size:</span> <span>{formatFileSize(file.size)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Version:</span> <span>v{file.version}</span></div>
                </div>
                <button className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                  Download
                </button>
              </div>
            </LiquidGlassCard>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Client Portal
              </TextShimmer>
              <p className="text-muted-foreground">
                Comprehensive client management and collaboration
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <LiquidGlassCard>
            <div className="p-2">
              <div className="flex items-center gap-2">
                {viewModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as ViewMode)}
                    className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                      viewMode === mode.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <span className="mr-2">{mode.icon}</span>
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </LiquidGlassCard>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          {viewMode === 'overview' && renderOverview()}
          {viewMode === 'clients' && renderClients()}
          {viewMode === 'projects' && renderProjects()}
          {viewMode === 'communications' && renderCommunications()}
          {viewMode === 'files' && renderFiles()}
        </ScrollReveal>
      </div>
    </div>
  )
}
