'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { ScrollReveal } from '@/components/ui/scroll-reveal'
import {
  WORKFLOW_TEMPLATES,
  getStatusColor,
  getTriggerIcon,
  getActionIcon,
  formatDuration
} from '@/lib/automation-utils'
import type { WorkflowStatus } from '@/lib/automation-types'

// A+++ UTILITIES
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('AutomationPage')

type ViewMode = 'overview' | 'workflows' | 'templates' | 'builder' | 'executions'

export default function AutomationPage() {
  // AUTHENTICATION
  const { userId, loading: userLoading } = useCurrentUser()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()

  const [viewMode, setViewMode] = useState<ViewMode>('overview')
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // DATABASE STATE
  const [workflows, setWorkflows] = useState<any[]>([])
  const [executions, setExecutions] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')

  // A+++ LOAD AUTOMATION DATA
  useEffect(() => {
    const loadAutomationData = async () => {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading automation data', { userId })

        // Dynamic imports
        const {
          getWorkflows,
          getAutomationMetrics,
          getWorkflowTemplates
        } = await import('@/lib/automation-queries')

        // Load data in parallel
        const [workflowsRes, metricsRes, templatesRes] = await Promise.all([
          getWorkflows(
            statusFilter !== 'all' ? { status: statusFilter as WorkflowStatus } : undefined
          ),
          getAutomationMetrics(),
          getWorkflowTemplates()
        ])

        setWorkflows(workflowsRes)
        setMetrics(metricsRes)
        setTemplates(templatesRes)

        setIsLoading(false)
        announce(`Loaded ${workflowsRes.length} workflows successfully`, 'polite')
        logger.info('Automation data loaded', {
          workflowCount: workflowsRes.length,
          templateCount: templatesRes.length
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load automation workflows'
        logger.error('Failed to load automation data', { error: err })
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading automation workflows', 'assertive')
        toast.error(errorMessage)
      }
    }

    loadAutomationData()
  }, [userId, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  // HANDLER: Create new workflow
  const handleCreateWorkflow = async () => {
    if (!userId) {
      toast.error('Please log in to create workflows')
      logger.warn('Create workflow attempted without authentication')
      return
    }

    try {
      logger.info('Creating new workflow', { userId })
      const { createWorkflow } = await import('@/lib/automation-queries')

      const newWorkflow = await createWorkflow({
        name: 'New Workflow',
        description: 'Describe your workflow',
        trigger_type: 'manual',
        trigger_config: {},
        category: 'custom',
        tags: []
      })

      setWorkflows(prev => [newWorkflow, ...prev])
      setSelectedWorkflow(newWorkflow.id)
      setViewMode('builder')

      toast.success('New workflow created')
      logger.info('Workflow created successfully', { workflowId: newWorkflow.id })
      announce('New workflow created', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workflow'
      logger.error('Failed to create workflow', { error: err })
      toast.error(errorMessage)
    }
  }

  // HANDLER: Toggle workflow status
  const handleToggleWorkflow = async (workflowId: string, currentStatus: string) => {
    if (!userId) {
      toast.error('Please log in to modify workflows')
      return
    }

    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active'
      logger.info('Toggling workflow status', { workflowId, from: currentStatus, to: newStatus })

      const { toggleWorkflowStatus } = await import('@/lib/automation-queries')
      const updated = await toggleWorkflowStatus(workflowId, newStatus as 'active' | 'paused')

      setWorkflows(prev =>
        prev.map(w => (w.id === workflowId ? { ...w, status: newStatus } : w))
      )

      toast.success(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`)
      logger.info('Workflow status toggled', { workflowId, newStatus })
      announce(`Workflow ${newStatus === 'active' ? 'activated' : 'paused'}`, 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update workflow status'
      logger.error('Failed to toggle workflow status', { error: err, workflowId })
      toast.error(errorMessage)
    }
  }

  // HANDLER: Delete workflow
  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    if (!userId) {
      toast.error('Please log in to delete workflows')
      return
    }

    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return
    }

    try {
      logger.info('Deleting workflow', { workflowId, workflowName })

      const { deleteWorkflow } = await import('@/lib/automation-queries')
      await deleteWorkflow(workflowId)

      setWorkflows(prev => prev.filter(w => w.id !== workflowId))
      if (selectedWorkflow === workflowId) {
        setSelectedWorkflow(null)
      }

      toast.success(`Workflow "${workflowName}" deleted`)
      logger.info('Workflow deleted successfully', { workflowId })
      announce(`Workflow deleted`, 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete workflow'
      logger.error('Failed to delete workflow', { error: err, workflowId })
      toast.error(errorMessage)
    }
  }

  // HANDLER: Create workflow from template
  const handleUseTemplate = async (templateId: string, templateName: string) => {
    if (!userId) {
      toast.error('Please log in to use templates')
      return
    }

    try {
      logger.info('Creating workflow from template', { templateId, templateName, userId })

      const { createWorkflowFromTemplate } = await import('@/lib/automation-queries')
      const newWorkflow = await createWorkflowFromTemplate(
        templateId,
        `${templateName} - ${new Date().toLocaleDateString()}`
      )

      setWorkflows(prev => [newWorkflow, ...prev])
      setSelectedWorkflow(newWorkflow.id)
      setViewMode('builder')

      toast.success(`Workflow created from "${templateName}" template`)
      logger.info('Workflow created from template', { workflowId: newWorkflow.id, templateId })
      announce('Workflow created from template', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create workflow from template'
      logger.error('Failed to create from template', { error: err, templateId })
      toast.error(errorMessage)
    }
  }

  // HANDLER: Load workflow executions
  const handleLoadExecutions = async (workflowId: string) => {
    try {
      logger.info('Loading workflow executions', { workflowId })

      const { getWorkflowExecutions } = await import('@/lib/automation-queries')
      const executionData = await getWorkflowExecutions(workflowId, { limit: 50 })

      setExecutions(executionData)
      logger.info('Executions loaded', { count: executionData.length })
    } catch (err) {
      logger.error('Failed to load executions', { error: err, workflowId })
      toast.error('Failed to load execution history')
    }
  }

  const viewTabs = [
    { id: 'overview' as ViewMode, label: 'Overview', icon: '📊' },
    { id: 'workflows' as ViewMode, label: 'My Workflows', icon: '⚡' },
    { id: 'templates' as ViewMode, label: 'Templates', icon: '📋' },
    { id: 'builder' as ViewMode, label: 'Builder', icon: '🛠️' },
    { id: 'executions' as ViewMode, label: 'History', icon: '📜' }
  ]

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto space-y-8">
          <div className="space-y-8">
            <CardSkeleton />
            <CardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <ListSkeleton items={4} />
          </div>
        </div>
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-[1800px] mx-auto">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-[1800px] mx-auto space-y-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex items-center justify-between">
            <div>
              <TextShimmer className="text-4xl font-bold mb-2">
                Workflow Automation
              </TextShimmer>
              <p className="text-muted-foreground">
                Build visual workflows to automate your business processes
              </p>
            </div>
            <button
              onClick={handleCreateWorkflow}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              + Create Workflow
            </button>
          </div>
        </ScrollReveal>

        {/* View Tabs */}
        <ScrollReveal delay={0.1}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {viewTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Overview */}
        {viewMode === 'overview' && (
          <>
            {/* Metrics */}
            <ScrollReveal delay={0.2}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Workflows</div>
                        <div className="text-3xl font-bold text-purple-500">
                          {metrics?.totalWorkflows || 0}
                        </div>
                      </div>
                      <div className="text-2xl">⚡</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metrics?.activeWorkflows || 0} active
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Total Executions</div>
                        <div className="text-3xl font-bold text-blue-500">
                          {(metrics?.totalExecutions || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-2xl">🚀</div>
                    </div>
                    <div className="text-xs text-green-500">
                      {(metrics?.successRate || 0).toFixed(1)}% success rate
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Avg. Execution Time</div>
                        <div className="text-3xl font-bold text-green-500">
                          {(metrics?.averageExecutionTime || 0).toFixed(1)}s
                        </div>
                      </div>
                      <div className="text-2xl">⏱️</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fast & efficient
                    </div>
                  </div>
                </LiquidGlassCard>

                <LiquidGlassCard>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Hours Saved</div>
                        <div className="text-3xl font-bold text-orange-500">
                          {metrics?.automationsSaved || 0}
                        </div>
                      </div>
                      <div className="text-2xl">⏰</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      This month
                    </div>
                  </div>
                </LiquidGlassCard>
              </div>
            </ScrollReveal>

            {/* Active Workflows */}
            <ScrollReveal delay={0.3}>
              <LiquidGlassCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-6">Active Workflows</h3>
                  <div className="space-y-4">
                    {workflows.filter(w => w.status === 'active').length > 0 ? (
                      workflows.filter(w => w.status === 'active').map((workflow) => (
                      <div
                        key={workflow.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedWorkflow(workflow.id)
                          setViewMode('workflows')
                        }}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-3xl">{getTriggerIcon(workflow.trigger_type)}</div>
                          <div className="flex-1">
                            <div className="font-semibold">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">{workflow.description}</div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                              <span>🔄 {workflow.run_count || 0} runs</span>
                              <span>✅ {(workflow.success_rate || 0).toFixed(1)}% success</span>
                              {workflow.last_run && (
                                <span>🕒 Last: {new Date(workflow.last_run).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(workflow.status)}`}>
                            {workflow.status}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedWorkflow(workflow.id)
                              setViewMode('builder')
                            }}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-xs font-medium transition-colors"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No active workflows yet.</p>
                        <button
                          onClick={handleCreateWorkflow}
                          className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Create Your First Workflow
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>

            {/* Popular Templates */}
            <ScrollReveal delay={0.4}>
              <LiquidGlassCard>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Popular Templates</h3>
                    <button
                      onClick={() => setViewMode('templates')}
                      className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.slice(0, 3).map((template) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTemplate(template.id)
                          setViewMode('templates')
                        }}
                      >
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <div className="font-semibold mb-1">{template.name}</div>
                        <div className="text-xs text-muted-foreground mb-2">{template.description}</div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{template.category}</span>
                          <span className="text-purple-500 font-medium">{template.usageCount} uses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </LiquidGlassCard>
            </ScrollReveal>
          </>
        )}

        {/* Workflows */}
        {viewMode === 'workflows' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">My Workflows</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | 'all')}
                      className="px-3 py-2 rounded-lg bg-muted text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className={`p-5 rounded-lg border-2 transition-all ${
                        selectedWorkflow === workflow.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                          : 'border-transparent bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="text-4xl">{getTriggerIcon(workflow.trigger_type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{workflow.name}</h4>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(workflow.status)}`}>
                                {workflow.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{workflow.description}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>🔄 {workflow.run_count || 0} executions</span>
                              <span>✅ {(workflow.success_rate || 0).toFixed(1)}% success</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleWorkflow(workflow.id, workflow.status)}
                            className="px-3 py-1 bg-muted hover:bg-muted/80 rounded text-sm font-medium transition-colors"
                          >
                            {workflow.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                          <button
                            onClick={() => {
                              setSelectedWorkflow(workflow.id)
                              setViewMode('builder')
                            }}
                            className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}

        {/* Templates */}
        {viewMode === 'templates' && (
          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <LiquidGlassCard key={template.id}>
                  <div className="p-6">
                    <div className="text-5xl mb-4">{template.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">Trigger:</span>
                        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded capitalize">
                          {getTriggerIcon(template.trigger_type)} {template.trigger_type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Usage:</span>
                        <span className="text-xs text-purple-500 font-medium">
                          {template.usage_count || 0} times
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {template.tags?.map((tag: string, idx: number) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleUseTemplate(template.id, template.name)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Use Template
                    </button>
                  </div>
                </LiquidGlassCard>
              ))}
            </div>
          </ScrollReveal>
        )}

        {/* Builder */}
        {viewMode === 'builder' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.2}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Workflow Builder</h3>

                    {/* Workflow Name */}
                    <div className="mb-6">
                      <input
                        type="text"
                        placeholder="Workflow Name"
                        className="w-full px-4 py-3 rounded-lg bg-muted text-lg font-semibold"
                      />
                    </div>

                    {/* Visual Flow */}
                    <div className="border-2 border-dashed border-muted rounded-lg p-8 min-h-[500px] bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
                      <div className="space-y-6">
                        {/* Trigger Node */}
                        <div className="flex items-center gap-4">
                          <div className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 border-2 border-purple-500 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl text-white">
                                ⚡
                              </div>
                              <div className="flex-1">
                                <div className="font-bold">Trigger: When...</div>
                                <select className="mt-1 px-3 py-1 rounded bg-muted text-sm w-full">
                                  <option>Select trigger type</option>
                                  <option>Schedule - Daily/Weekly/Monthly</option>
                                  <option>Event - Something happens</option>
                                  <option>Webhook - External API call</option>
                                  <option>Manual - User initiated</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Connector */}
                        <div className="flex justify-center">
                          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500"></div>
                        </div>

                        {/* Action Node */}
                        <div className="flex items-center gap-4">
                          <div className="w-full p-4 rounded-lg bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-2xl text-white">
                                📧
                              </div>
                              <div className="flex-1">
                                <div className="font-bold">Action: Then...</div>
                                <select className="mt-1 px-3 py-1 rounded bg-muted text-sm w-full">
                                  <option>Select action</option>
                                  <option>📧 Send Email</option>
                                  <option>🔔 Send Notification</option>
                                  <option>✅ Create Task</option>
                                  <option>📝 Update Record</option>
                                  <option>🔌 Call API</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Add Action Button */}
                        <div className="flex justify-center">
                          <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors">
                            + Add Action
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            </div>

            <div>
              <ScrollReveal delay={0.3}>
                <LiquidGlassCard>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-6">Actions</h3>
                    <div className="space-y-2">
                      {[
                        { type: 'email', label: 'Send Email', icon: '📧' },
                        { type: 'notification', label: 'Notification', icon: '🔔' },
                        { type: 'create-task', label: 'Create Task', icon: '✅' },
                        { type: 'update-record', label: 'Update Record', icon: '📝' },
                        { type: 'api-call', label: 'API Call', icon: '🔌' },
                        { type: 'delay', label: 'Delay', icon: '⏱️' },
                        { type: 'condition', label: 'Condition', icon: '🔀' }
                      ].map((action) => (
                        <button
                          key={action.type}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
                        >
                          <span className="text-xl">{action.icon}</span>
                          <span className="text-sm font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 pt-6 border-t space-y-2">
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Save Workflow
                      </button>
                      <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Test Workflow
                      </button>
                    </div>
                  </div>
                </LiquidGlassCard>
              </ScrollReveal>
            </div>
          </div>
        )}

        {/* Executions */}
        {viewMode === 'executions' && (
          <ScrollReveal delay={0.2}>
            <LiquidGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-6">Execution History</h3>
                <div className="space-y-4">
                  {executions.map((execution) => {
                    const workflow = workflows.find(w => w.id === execution.workflowId)
                    return (
                      <div
                        key={execution.id}
                        className="p-4 rounded-lg bg-muted/30 border border-muted"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{workflow?.name}</span>
                              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(execution.status)}`}>
                                {execution.status}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Triggered by: {execution.triggeredBy}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {execution.startTime.toLocaleString()}
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {execution.endTime && formatDuration(execution.endTime.getTime() - execution.startTime.getTime())}
                          </div>
                        </div>

                        {/* Execution Steps */}
                        <div className="ml-4 space-y-2">
                          {execution.steps.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                              <span className="text-lg">{getActionIcon(step.actionType)}</span>
                              <span className="text-muted-foreground capitalize">{step.actionType}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(step.status)}`}>
                                {step.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(step.duration)}
                              </span>
                              {step.error && (
                                <span className="text-xs text-red-500">{step.error}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </LiquidGlassCard>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
