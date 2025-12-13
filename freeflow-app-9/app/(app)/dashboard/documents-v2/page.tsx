'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type DocumentStatus = 'draft' | 'review' | 'approved' | 'archived'
type DocumentType = 'contract' | 'proposal' | 'report' | 'policy' | 'invoice' | 'other'
type AccessLevel = 'public' | 'internal' | 'confidential' | 'restricted'
type ViewMode = 'all' | 'draft' | 'review' | 'approved'

export default function DocumentsV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample documents data
  const documents = [
    {
      id: 'DOC-2847',
      title: 'Q4 2024 Financial Report',
      type: 'report' as const,
      status: 'approved' as const,
      accessLevel: 'confidential' as const,
      owner: 'Emily Rodriguez',
      department: 'Finance',
      version: '3.2',
      size: '2.4 MB',
      created: '2024-01-15',
      modified: '2024-02-10',
      views: 284,
      downloads: 47,
      comments: 12,
      approvedBy: 'Robert Brown',
      tags: ['financial', 'quarterly', 'confidential']
    },
    {
      id: 'DOC-2846',
      title: 'Product Development Proposal',
      type: 'proposal' as const,
      status: 'review' as const,
      accessLevel: 'internal' as const,
      owner: 'Michael Chen',
      department: 'Product',
      version: '2.1',
      size: '1.8 MB',
      created: '2024-02-05',
      modified: '2024-02-12',
      views: 147,
      downloads: 24,
      comments: 8,
      approvedBy: '',
      tags: ['product', 'development', 'proposal']
    },
    {
      id: 'DOC-2845',
      title: 'Employee Handbook 2024',
      type: 'policy' as const,
      status: 'approved' as const,
      accessLevel: 'internal' as const,
      owner: 'Sarah Johnson',
      department: 'HR',
      version: '4.0',
      size: '3.2 MB',
      created: '2024-01-01',
      modified: '2024-01-28',
      views: 847,
      downloads: 284,
      comments: 42,
      approvedBy: 'Emily Rodriguez',
      tags: ['hr', 'policy', 'handbook']
    },
    {
      id: 'DOC-2844',
      title: 'Client Service Agreement - Acme Corp',
      type: 'contract' as const,
      status: 'approved' as const,
      accessLevel: 'restricted' as const,
      owner: 'David Kim',
      department: 'Legal',
      version: '1.0',
      size: '847 KB',
      created: '2024-02-01',
      modified: '2024-02-08',
      views: 68,
      downloads: 12,
      comments: 6,
      approvedBy: 'Legal Team',
      tags: ['contract', 'client', 'legal']
    },
    {
      id: 'DOC-2843',
      title: 'Marketing Campaign Strategy',
      type: 'proposal' as const,
      status: 'draft' as const,
      accessLevel: 'internal' as const,
      owner: 'Jessica Williams',
      department: 'Marketing',
      version: '0.9',
      size: '1.2 MB',
      created: '2024-02-12',
      modified: '2024-02-14',
      views: 24,
      downloads: 4,
      comments: 2,
      approvedBy: '',
      tags: ['marketing', 'campaign', 'strategy']
    },
    {
      id: 'DOC-2842',
      title: 'Security Audit Report',
      type: 'report' as const,
      status: 'review' as const,
      accessLevel: 'confidential' as const,
      owner: 'Lisa Anderson',
      department: 'Security',
      version: '1.5',
      size: '4.1 MB',
      created: '2024-02-08',
      modified: '2024-02-13',
      views: 42,
      downloads: 8,
      comments: 5,
      approvedBy: '',
      tags: ['security', 'audit', 'confidential']
    }
  ]

  const recentActivity = [
    {
      id: 'ACT-8471',
      user: 'Emily Rodriguez',
      action: 'approved',
      document: 'Q4 2024 Financial Report',
      timestamp: '2 hours ago'
    },
    {
      id: 'ACT-8470',
      user: 'Michael Chen',
      action: 'updated',
      document: 'Product Development Proposal',
      timestamp: '4 hours ago'
    },
    {
      id: 'ACT-8469',
      user: 'David Kim',
      action: 'commented on',
      document: 'Client Service Agreement',
      timestamp: '6 hours ago'
    },
    {
      id: 'ACT-8468',
      user: 'Sarah Johnson',
      action: 'shared',
      document: 'Employee Handbook 2024',
      timestamp: '1 day ago'
    }
  ]

  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'review': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'archived': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'contract': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'proposal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'report': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'policy': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'invoice': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'other': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    }
  }

  const getAccessLevelColor = (level: AccessLevel) => {
    switch (level) {
      case 'public': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'internal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'confidential': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'restricted': return 'bg-red-500/10 text-red-500 border-red-500/20'
    }
  }

  const filteredDocuments = viewMode === 'all'
    ? documents
    : documents.filter(doc => doc.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-cyan-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Document Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Organize and manage all company documents
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-300">
              Upload Document
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Total Documents',
              value: '2,847',
              change: '+284',
              trend: 'up' as const,
              subtitle: 'across all departments'
            },
            {
              label: 'Pending Review',
              value: '47',
              change: '-12',
              trend: 'up' as const,
              subtitle: 'down from last week'
            },
            {
              label: 'Storage Used',
              value: '284 GB',
              change: '+24 GB',
              trend: 'up' as const,
              subtitle: 'of 1 TB available'
            },
            {
              label: 'Avg Response Time',
              value: '2.4 days',
              change: '-0.6d',
              trend: 'up' as const,
              subtitle: 'for approvals'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Upload', icon: '📤', onClick: () => {} },
            { label: 'Create Folder', icon: '📁', onClick: () => {} },
            { label: 'Share', icon: '🔗', onClick: () => {} },
            { label: 'Review Queue', icon: '📋', onClick: () => {} },
            { label: 'Search', icon: '🔍', onClick: () => {} },
            { label: 'Templates', icon: '📄', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Documents"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Draft"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
          <PillButton
            label="In Review"
            isActive={viewMode === 'review'}
            onClick={() => setViewMode('review')}
          />
          <PillButton
            label="Approved"
            isActive={viewMode === 'approved'}
            onClick={() => setViewMode('approved')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Documents ({filteredDocuments.length})
              </h2>
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            {doc.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(doc.type)}`}>
                            {doc.type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getAccessLevelColor(doc.accessLevel)}`}>
                            {doc.accessLevel}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-cyan-500">👤</span>
                            {doc.owner}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-cyan-500">🏢</span>
                            {doc.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-cyan-500">📊</span>
                            v{doc.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-cyan-500">💾</span>
                            {doc.size}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{doc.views}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{doc.downloads}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{doc.comments}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Comments</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Last Modified</div>
                        <div className="text-xs font-medium text-slate-900 dark:text-white">{doc.modified}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 flex-wrap">
                        {doc.tags.map((tag) => (
                          <span key={tag} className="px-2 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                      {doc.approvedBy && (
                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                          Approved by: <span className="font-medium text-emerald-600 dark:text-emerald-400">{doc.approvedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Recent Activity */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="text-sm">
                      <span className="font-medium text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                        {activity.user}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400"> {activity.action} </span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {activity.document}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {activity.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document Types */}
            <ProgressCard
              title="Documents by Type"
              items={[
                { label: 'Reports', value: 847, total: 2847, color: 'green' },
                { label: 'Contracts', value: 612, total: 2847, color: 'purple' },
                { label: 'Proposals', value: 524, total: 2847, color: 'blue' },
                { label: 'Policies', value: 447, total: 2847, color: 'orange' },
                { label: 'Other', value: 417, total: 2847, color: 'slate' }
              ]}
            />

            {/* Top Contributors */}
            <RankingList
              title="Top Contributors"
              items={[
                { label: 'Emily Rodriguez', value: '284 docs', rank: 1, trend: 'up' },
                { label: 'Michael Chen', value: '247 docs', rank: 2, trend: 'up' },
                { label: 'Sarah Johnson', value: '186 docs', rank: 3, trend: 'same' },
                { label: 'David Kim', value: '147 docs', rank: 4, trend: 'down' },
                { label: 'Lisa Anderson', value: '124 docs', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Approval Rate"
                value="94%"
                trend="up"
                change="+3%"
              />
              <MiniKPI
                label="Avg File Size"
                value="2.1 MB"
                trend="down"
                change="-0.3MB"
              />
            </div>

            {/* System Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Document approved',
                  subject: 'Q4 Financial Report',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Document updated',
                  subject: 'Product Proposal v2.1',
                  time: '4 hours ago',
                  type: 'info'
                },
                {
                  action: 'Document shared',
                  subject: 'Employee Handbook',
                  time: '1 day ago',
                  type: 'info'
                },
                {
                  action: 'Review requested',
                  subject: 'Security Audit Report',
                  time: '2 days ago',
                  type: 'warning'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
