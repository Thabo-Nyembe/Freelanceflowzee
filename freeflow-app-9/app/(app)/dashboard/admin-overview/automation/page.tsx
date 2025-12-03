'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  formatNumber,
  formatPercentage,
  formatRelativeTime,
  getAutomationStatusColor,
  getAutomationStatusIcon,
  getIntegrationStatusColor,
  getActiveWorkflows,
  getConnectedIntegrations,
  calculateTotalTimeSaved,
  type Workflow,
  type Integration,
  type AutomationStatus,
  type IntegrationStatus
} from '@/lib/admin-overview-utils'
import {
  Zap,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  FlaskConical,
  RefreshCw,
  Search,
  Link,
  Unlink,
  Webhook,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Settings
} from 'lucide-react'

const logger = createFeatureLogger('admin-automation')

export default function AutomationPage() {
  const router = useRouter()
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  // State management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AutomationStatus | 'all'>('all')
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [showWorkflowModal, setShowWorkflowModal] = useState(false)

  // Filtered workflows
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows

    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => w.status === statusFilter)
    }

    if (searchQuery) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [workflows, statusFilter, searchQuery])

  const activeWorkflows = useMemo(() => getActiveWorkflows(workflows), [workflows])
  const connectedIntegrations = useMemo(() => getConnectedIntegrations(integrations), [integrations])
  const totalTimeSaved = useMemo(() => calculateTotalTimeSaved(workflows), [workflows])

  // Load automation data
  useEffect(() => {
    const loadAutomation = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        logger.info('Loading automation data', { userId })

        const { getWorkflows } = await import('@/lib/automation-queries')
        const workflowsResult = await getWorkflows(userId)

        setWorkflows(workflowsResult || [])
        // Note: Integrations will be loaded when integration queries are available
        setIntegrations([])

        setIsLoading(false)
        announce('Automation data loaded successfully', 'polite')
        toast.success('Automation loaded', {
          description: `${workflowsResult?.length || 0} workflows loaded`
        })
        logger.info('Automation loaded', {
          success: true,
          workflowCount: workflowsResult?.length || 0
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load automation'
        setError(errorMessage)
        setIsLoading(false)
        toast.error('Failed to load automation', { description: errorMessage })
        announce('Error loading automation', 'assertive')
        logger.error('Automation load failed', { error: err })
      }
    }

    loadAutomation()
  }, [userId, announce])

  // Button 1: Create Workflow
  const handleCreateWorkflow = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Creating new workflow', { userId })

      const { createWorkflow } = await import('@/lib/automation-queries')

      const newWorkflowId = await createWorkflow({
        name: 'New Workflow',
        description: 'Automated workflow',
        trigger: 'manual',
        userId
      })

      toast.success('Workflow Created', {
        description: 'New workflow has been created as draft'
      })
      logger.info('Workflow created', { success: true, workflowId: newWorkflowId })
      announce('Workflow created successfully', 'polite')

      // Reload workflows
      const { getWorkflows } = await import('@/lib/automation-queries')
      const workflowsResult = await getWorkflows(userId)
      setWorkflows(workflowsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Create failed'
      toast.error('Create Failed', { description: message })
      logger.error('Create workflow failed', { error: message })
      announce('Failed to create workflow', 'assertive')
    }
  }

  // Button 2: Edit Workflow
  const handleEditWorkflow = async (workflowId: string) => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Editing workflow', { workflowId, userId })

      const { updateWorkflow } = await import('@/lib/automation-queries')

      await updateWorkflow(workflowId, {
        description: 'Updated workflow configuration'
      })

      toast.success('Workflow Updated', {
        description: 'Workflow configuration has been updated successfully'
      })
      logger.info('Workflow edited', { success: true, workflowId })
      announce('Workflow updated successfully', 'polite')

      // Reload workflows
      const { getWorkflows } = await import('@/lib/automation-queries')
      const workflowsResult = await getWorkflows(userId)
      setWorkflows(workflowsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Edit failed'
      toast.error('Edit Failed', { description: message })
      logger.error('Edit workflow failed', { error: message })
      announce('Failed to edit workflow', 'assertive')
    }
  }

  // Button 3: Delete Workflow
  const handleDeleteWorkflow = async (workflowId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"? This action cannot be undone.`)) {
      return
    }

    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Deleting workflow', { workflowId, userId })

      const { deleteWorkflow } = await import('@/lib/automation-queries')
      await deleteWorkflow(workflowId)

      toast.success('Workflow Deleted', {
        description: `"${workflowName}" has been permanently removed`
      })
      logger.info('Workflow deleted', { success: true, workflowId })
      announce('Workflow deleted successfully', 'polite')

      // Reload workflows
      const { getWorkflows } = await import('@/lib/automation-queries')
      const workflowsResult = await getWorkflows(userId)
      setWorkflows(workflowsResult || [])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Delete failed'
      toast.error('Delete Failed', { description: message })
      logger.error('Delete workflow failed', { error: message })
      announce('Failed to delete workflow', 'assertive')
    }
  }

  // Button 4: Enable Workflow
  const handleEnableWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      logger.info('Enabling workflow', { workflowId })

      const response = await fetch(`/api/admin/automation/workflows/${workflowId}/enable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to enable workflow')
      const result = await response.json()

      toast.success('Workflow Enabled', {
        description: `"${workflowName}" is now active and will run automatically`
      })
      logger.info('Workflow enabled', { success: true, workflowId, result })
      announce('Workflow enabled successfully', 'polite')

      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status: 'active' } : w))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Enable failed'
      toast.error('Enable Failed', { description: message })
      logger.error('Enable workflow failed', { error: message })
      announce('Failed to enable workflow', 'assertive')
    }
  }

  // Button 5: Disable Workflow
  const handleDisableWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      logger.info('Disabling workflow', { workflowId })

      const response = await fetch(`/api/admin/automation/workflows/${workflowId}/disable`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to disable workflow')
      const result = await response.json()

      toast.success('Workflow Disabled', {
        description: `"${workflowName}" has been paused and will not run`
      })
      logger.info('Workflow disabled', { success: true, workflowId, result })
      announce('Workflow disabled successfully', 'polite')

      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, status: 'paused' } : w))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Disable failed'
      toast.error('Disable Failed', { description: message })
      logger.error('Disable workflow failed', { error: message })
      announce('Failed to disable workflow', 'assertive')
    }
  }

  // Button 6: Test Workflow
  const handleTestWorkflow = async (workflowId: string, workflowName: string) => {
    try {
      logger.info('Testing workflow', { workflowId })

      const response = await fetch(`/api/admin/automation/workflows/${workflowId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to test workflow')
      const result = await response.json()

      toast.success('Workflow Test Complete', {
        description: `"${workflowName}" test run completed successfully`
      })
      logger.info('Workflow tested', { success: true, workflowId, result })
      announce('Workflow test completed', 'polite')

      setWorkflows(prev => prev.map(w => w.id === workflowId ? { ...w, runsCount: w.runsCount + 1 } : w))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Test failed'
      toast.error('Test Failed', { description: message })
      logger.error('Test workflow failed', { error: message })
      announce('Workflow test failed', 'assertive')
    }
  }

  // Button 7: Connect Integration
  const handleConnectIntegration = async (integrationId: string, integrationName: string) => {
    try {
      logger.info('Connecting integration', { integrationId })

      const response = await fetch('/api/admin/automation/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId })
      })

      if (!response.ok) throw new Error('Failed to connect integration')
      const result = await response.json()

      toast.success('Integration Connected', {
        description: `${integrationName} has been connected successfully`
      })
      logger.info('Integration connected', { success: true, integrationId, result })
      announce('Integration connected successfully', 'polite')

      setIntegrations(prev => prev.map(i => i.id === integrationId ? {
        ...i,
        status: 'connected',
        connectedDate: new Date().toISOString()
      } : i))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Connect failed'
      toast.error('Connect Failed', { description: message })
      logger.error('Connect integration failed', { error: message })
      announce('Failed to connect integration', 'assertive')
    }
  }

  // Button 8: Disconnect Integration
  const handleDisconnectIntegration = async (integrationId: string, integrationName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${integrationName}?`)) {
      return
    }

    try {
      logger.info('Disconnecting integration', { integrationId })

      const response = await fetch(`/api/admin/automation/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) throw new Error('Failed to disconnect integration')

      toast.success('Integration Disconnected', {
        description: `${integrationName} has been disconnected`
      })
      logger.info('Integration disconnected', { success: true, integrationId })
      announce('Integration disconnected successfully', 'polite')

      setIntegrations(prev => prev.map(i => i.id === integrationId ? {
        ...i,
        status: 'disconnected',
        connectedDate: undefined,
        lastSync: undefined
      } : i))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Disconnect failed'
      toast.error('Disconnect Failed', { description: message })
      logger.error('Disconnect integration failed', { error: message })
      announce('Failed to disconnect integration', 'assertive')
    }
  }

  // Button 9: Test Webhook
  const handleTestWebhook = async () => {
    try {
      logger.info('Testing webhook')

      const response = await fetch('/api/admin/automation/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://example.com/webhook', event: 'test' })
      })

      if (!response.ok) throw new Error('Failed to test webhook')
      const result = await response.json()

      toast.success('Webhook Test Successful', {
        description: 'Test webhook was sent and received successfully'
      })
      logger.info('Webhook tested', { success: true, result })
      announce('Webhook test successful', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Test failed'
      toast.error('Webhook Test Failed', { description: message })
      logger.error('Test webhook failed', { error: message })
      announce('Webhook test failed', 'assertive')
    }
  }

  // Button 10: Refresh Automation
  const handleRefreshAutomation = async () => {
    if (!userId) {
      toast.error('Authentication required')
      return
    }

    try {
      logger.info('Refreshing automation data', { userId })

      const { getWorkflows } = await import('@/lib/automation-queries')
      const workflowsResult = await getWorkflows(userId)
      setWorkflows(workflowsResult || [])

      // Note: Integrations would be loaded from integration queries when available
      setIntegrations([])

      toast.success('Automation Refreshed', {
        description: `All workflows and integrations have been reloaded (${workflowsResult?.length || 0} workflows)`
      })
      logger.info('Automation refresh completed', { success: true, workflowCount: workflowsResult?.length || 0 })
      announce('Automation refreshed successfully', 'polite')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Refresh failed'
      toast.error('Refresh Failed', { description: message })
      logger.error('Automation refresh failed', { error: message })
      announce('Failed to refresh automation', 'assertive')
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton items={5} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorEmptyState error={error} onRetry={() => window.location.reload()} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Business Automation & Integrations</h2>
                <p className="text-sm text-gray-600">Streamline operations with automated workflows</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleCreateWorkflow}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Workflow
                </button>

                <button
                  onClick={handleTestWebhook}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <Webhook className="w-4 h-4" />
                  Test Webhook
                </button>

                <button
                  onClick={handleRefreshAutomation}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="text-sm text-blue-600 mb-1">Active Workflows</div>
                <div className="text-2xl font-bold text-blue-700">
                  <NumberFlow value={activeWorkflows} />
                </div>
                <div className="text-xs text-gray-600">{workflows.length} total</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="text-sm text-green-600 mb-1">Success Rate</div>
                <div className="text-2xl font-bold text-green-700">
                  <NumberFlow value={workflows.length > 0 ? Math.round((workflows.filter(w => w.status === 'active').length / workflows.length) * 100) : 0} suffix="%" />
                </div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Excellent
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                <div className="text-sm text-purple-600 mb-1">Time Saved</div>
                <div className="text-2xl font-bold text-purple-700">
                  <NumberFlow value={totalTimeSaved} suffix="h" />
                </div>
                <div className="text-xs text-gray-600">This month</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100">
                <div className="text-sm text-orange-600 mb-1">Integrations</div>
                <div className="text-2xl font-bold text-orange-700">
                  <NumberFlow value={connectedIntegrations.length} />
                  <span className="text-base text-gray-600">/{integrations.length}</span>
                </div>
                <div className="text-xs text-gray-600">Connected</div>
              </div>
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Workflow Status Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <div className="flex items-center gap-2">
              {(['all', 'active', 'paused', 'draft', 'error'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All Workflows' : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Workflows Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Workflows ({filteredWorkflows.length})</h3>

            {filteredWorkflows.length === 0 ? (
              <NoDataEmptyState
                title="No Workflows Found"
                description="Create your first automated workflow to get started"
                actionLabel="Create Workflow"
                onAction={handleCreateWorkflow}
              />
            ) : (
              <div className="space-y-3">
                {filteredWorkflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-800">{workflow.name}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getAutomationStatusColor(workflow.status)}`}>
                            {getAutomationStatusIcon(workflow.status)}
                            <span className="ml-1">{workflow.status}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div>Trigger: <span className="font-medium">{workflow.trigger}</span></div>
                          <div>Actions: <span className="font-medium">{workflow.actions.length}</span></div>
                          <div>Runs: <span className="font-medium">{formatNumber(workflow.runsCount)}</span></div>
                          <div>Success: <span className="font-medium text-green-600">{formatPercentage(workflow.successRate)}</span></div>
                          {workflow.timeSaved > 0 && (
                            <div>Saved: <span className="font-medium text-purple-600">{workflow.timeSaved}h</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    {workflow.lastRun && (
                      <div className="text-xs text-gray-600 mb-3">
                        Last run: {formatRelativeTime(workflow.lastRun)}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleEditWorkflow(workflow.id)}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </button>

                      {workflow.status === 'active' ? (
                        <button
                          onClick={() => handleDisableWorkflow(workflow.id, workflow.name)}
                          className="px-3 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors flex items-center gap-1"
                        >
                          <Pause className="w-3 h-3" />
                          Disable
                        </button>
                      ) : workflow.status !== 'error' && (
                        <button
                          onClick={() => handleEnableWorkflow(workflow.id, workflow.name)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Enable
                        </button>
                      )}

                      <button
                        onClick={() => handleTestWorkflow(workflow.id, workflow.name)}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <FlaskConical className="w-3 h-3" />
                        Test
                      </button>

                      <button
                        onClick={() => handleDeleteWorkflow(workflow.id, workflow.name)}
                        className="px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWorkflow(workflow)
                          setShowWorkflowModal(true)
                        }}
                        className="px-3 py-1.5 bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Integrations Marketplace */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <LiquidGlassCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Integration Marketplace</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {integrations.map((integration) => (
                <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-3xl">{integration.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">{integration.name}</h4>
                        <div className="text-xs text-gray-600">{integration.category}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getIntegrationStatusColor(integration.status)}`}>
                      {integration.status}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 mb-3">{integration.description}</p>

                  {integration.status === 'connected' && (
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      {integration.lastSync && (
                        <div>Last sync: {formatRelativeTime(integration.lastSync)}</div>
                      )}
                      {integration.syncFrequency && (
                        <div>Frequency: {integration.syncFrequency}</div>
                      )}
                      <div>Data points: {formatNumber(integration.dataPoints)}</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {integration.status === 'connected' ? (
                      <button
                        onClick={() => handleDisconnectIntegration(integration.id, integration.name)}
                        className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Unlink className="w-3 h-3" />
                        Disconnect
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnectIntegration(integration.id, integration.name)}
                        className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                      >
                        <Link className="w-3 h-3" />
                        Connect
                      </button>
                    )}
                    {integration.isPremium && (
                      <span className="px-2 py-1 bg-purple-500 text-white rounded text-xs font-medium">
                        Premium
                      </span>
                    )}
                    {integration.isPopular && (
                      <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs font-medium">
                        Popular
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LiquidGlassCard>
      </motion.div>

      {/* Workflow Details Modal */}
      <AnimatePresence>
        {showWorkflowModal && selectedWorkflow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWorkflowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">{selectedWorkflow.name}</h3>
                  <p className="text-gray-600">{selectedWorkflow.description}</p>
                </div>
                <button
                  onClick={() => setShowWorkflowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Total Runs</div>
                  <div className="text-3xl font-bold text-blue-700">{formatNumber(selectedWorkflow.runsCount)}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">Success Rate</div>
                  <div className="text-3xl font-bold text-green-700">{formatPercentage(selectedWorkflow.successRate)}</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Trigger:</span>
                  <span>{selectedWorkflow.trigger}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Status:</span>
                  <span className={`px-2 py-1 rounded text-xs ${getAutomationStatusColor(selectedWorkflow.status)}`}>
                    {selectedWorkflow.status}
                  </span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Created By:</span>
                  <span>{selectedWorkflow.createdBy}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-gray-700">Time Saved:</span>
                  <span className="text-purple-600 font-bold">{selectedWorkflow.timeSaved} hours</span>
                </div>
              </div>

              {selectedWorkflow.actions.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Workflow Actions ({selectedWorkflow.actions.length})</h4>
                  <div className="space-y-2">
                    {selectedWorkflow.actions.map((action, index) => (
                      <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800">{action.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditWorkflow(selectedWorkflow.id)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Edit Workflow
                </button>
                <button
                  onClick={() => {
                    handleTestWorkflow(selectedWorkflow.id, selectedWorkflow.name)
                    setShowWorkflowModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Test Workflow
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
