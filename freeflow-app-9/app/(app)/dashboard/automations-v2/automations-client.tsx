'use client'
import { useState } from 'react'
import { useAutomations, type AutomationWorkflow, type WorkflowType, type WorkflowStatus } from '@/lib/hooks/use-automations'

export default function AutomationsClient({ initialWorkflows }: { initialWorkflows: AutomationWorkflow[] }) {
  const [workflowTypeFilter, setWorkflowTypeFilter] = useState<WorkflowType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | 'all'>('all')
  const { workflows, loading, error } = useAutomations({ workflowType: workflowTypeFilter, status: statusFilter })
  const displayWorkflows = workflows.length > 0 ? workflows : initialWorkflows

  const stats = {
    total: displayWorkflows.length,
    active: displayWorkflows.filter(w => w.status === 'active').length,
    totalExecutions: displayWorkflows.reduce((sum, w) => sum + w.total_executions, 0),
    avgSuccessRate: displayWorkflows.length > 0 ? (displayWorkflows.reduce((sum, w) => sum + (w.successful_executions / (w.total_executions || 1) * 100), 0) / displayWorkflows.length).toFixed(1) : '0'
  }

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Workflow Automation</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Total Workflows</div><div className="text-3xl font-bold text-emerald-600">{stats.total}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Active</div><div className="text-3xl font-bold text-green-600">{stats.active}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Executions</div><div className="text-3xl font-bold text-blue-600">{stats.totalExecutions}</div></div>
          <div className="bg-white rounded-xl p-6 shadow-sm border"><div className="text-sm text-gray-600 mb-1">Avg Success</div><div className="text-3xl font-bold text-purple-600">{stats.avgSuccessRate}%</div></div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
          <div className="flex gap-4">
            <select value={workflowTypeFilter} onChange={(e) => setWorkflowTypeFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Types</option><option value="sequential">Sequential</option><option value="parallel">Parallel</option><option value="conditional">Conditional</option><option value="branching">Branching</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Status</option><option value="draft">Draft</option><option value="active">Active</option><option value="running">Running</option><option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {loading && <div className="text-center py-8"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-600 border-r-transparent"></div></div>}

        <div className="space-y-4">{displayWorkflows.filter(w => (workflowTypeFilter === 'all' || w.workflow_type === workflowTypeFilter) && (statusFilter === 'all' || w.status === statusFilter)).map(workflow => (
          <div key={workflow.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs ${workflow.status === 'active' ? 'bg-green-100 text-green-700' : workflow.status === 'running' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{workflow.status}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-emerald-100 text-emerald-700">{workflow.workflow_type}</span>
                  {workflow.is_published && <span className="px-3 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700">Published v{workflow.published_version}</span>}
                  {workflow.is_enabled && <span className="px-3 py-1 rounded-full text-xs bg-teal-100 text-teal-700">Enabled</span>}
                </div>
                <h3 className="text-lg font-semibold">{workflow.workflow_name}</h3>
                {workflow.description && <p className="text-sm text-gray-600 mt-1">{workflow.description}</p>}
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                  <span>📊 {workflow.step_count} steps</span>
                  <span>🔄 {workflow.total_executions} executions</span>
                  <span>✅ {workflow.successful_executions} success</span>
                  {workflow.failed_executions > 0 && <span className="text-red-600">❌ {workflow.failed_executions} failed</span>}
                </div>
              </div>
              <div className="text-right">
                {workflow.total_executions > 0 && (
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">{((workflow.successful_executions / workflow.total_executions) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-gray-500">success rate</div>
                  </div>
                )}
                {workflow.avg_duration_seconds && <div className="text-xs text-gray-600 mt-1">⏱️ {workflow.avg_duration_seconds}s avg</div>}
              </div>
            </div>
          </div>
        ))}</div>
      </div>
    </div>
  )
}
