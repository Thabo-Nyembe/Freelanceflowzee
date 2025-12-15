// Forms V2 - Client Component with Real-time Data
// Created: December 14, 2024

'use client'

import { useState } from 'react'
import { useForms, type Form, type FormStatus, type FormType } from '@/lib/hooks/use-forms'

interface FormsClientProps {
  initialForms: Form[]
}

export default function FormsClient({ initialForms }: FormsClientProps) {
  const [statusFilter, setStatusFilter] = useState<FormStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<FormType | 'all'>('all')

  const { forms, loading, error } = useForms({
    status: statusFilter,
    formType: typeFilter,
    limit: 50
  })

  const displayForms = forms.length > 0 ? forms : initialForms

  // Filter client-side for better UX
  const filteredForms = displayForms.filter(form => {
    if (statusFilter !== 'all' && form.status !== statusFilter) return false
    if (typeFilter !== 'all' && form.form_type !== typeFilter) return false
    return true
  })

  // Calculate statistics
  const stats = {
    total: displayForms.length,
    byStatus: displayForms.reduce((acc, form) => {
      acc[form.status] = (acc[form.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    byType: displayForms.reduce((acc, form) => {
      acc[form.form_type] = (acc[form.form_type] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    totalSubmissions: displayForms.reduce((acc, form) => acc + (form.total_submissions || 0), 0),
    totalViews: displayForms.reduce((acc, form) => acc + (form.total_views || 0), 0),
    avgCompletionRate: displayForms.reduce((acc, form) => acc + (form.completion_rate || 0), 0) / (displayForms.length || 1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: FormStatus) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-700',
      'active': 'bg-green-100 text-green-700',
      'paused': 'bg-yellow-100 text-yellow-700',
      'closed': 'bg-red-100 text-red-700',
      'archived': 'bg-gray-100 text-gray-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getTypeColor = (type: FormType) => {
    const colors = {
      'contact': 'bg-blue-50 text-blue-600',
      'registration': 'bg-purple-50 text-purple-600',
      'application': 'bg-indigo-50 text-indigo-600',
      'survey': 'bg-green-50 text-green-600',
      'quiz': 'bg-yellow-50 text-yellow-600',
      'order': 'bg-orange-50 text-orange-600',
      'feedback': 'bg-pink-50 text-pink-600',
      'custom': 'bg-gray-50 text-gray-600'
    }
    return colors[type] || 'bg-gray-50 text-gray-600'
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            Error loading forms: {error.message}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Forms
            </h1>
            <p className="text-gray-600 mt-2">Create and manage dynamic forms</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all">
            + Create Form
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Forms</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-green-600 mt-1">↑ Real-time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">{stats.byStatus.active || 0}</div>
            <div className="text-xs text-gray-500 mt-1">Published forms</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalSubmissions}</div>
            <div className="text-xs text-gray-500 mt-1">All time</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-600 mb-1">Avg Completion</div>
            <div className="text-3xl font-bold text-purple-600">{stats.avgCompletionRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">Completion rate</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FormStatus | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FormType | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="contact">Contact</option>
                <option value="registration">Registration</option>
                <option value="application">Application</option>
                <option value="survey">Survey</option>
                <option value="quiz">Quiz</option>
                <option value="order">Order</option>
                <option value="feedback">Feedback</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading forms...</p>
          </div>
        )}

        {/* Forms List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Forms ({filteredForms.length})
            </h2>
          </div>

          {filteredForms.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <div className="text-gray-400 mb-2">
                <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No forms found</h3>
              <p className="text-gray-600">Create your first form to get started!</p>
            </div>
          ) : (
            filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(form.form_type)}`}>
                        {form.form_type}
                      </span>
                      {form.is_public && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          Public
                        </span>
                      )}
                      {form.password_protected && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          Password Protected
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                    {form.description && (
                      <p className="text-gray-700 mb-3">{form.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Fields: {form.field_count}</span>
                      <span>Created: {formatDate(form.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 text-right">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{form.total_submissions}</div>
                      <div className="text-xs text-gray-500">submissions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">{form.completion_rate.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">completion</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Views</div>
                    <div className="text-sm font-semibold text-gray-900">{form.total_views}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Started</div>
                    <div className="text-sm font-semibold text-gray-900">{form.total_started}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Completed</div>
                    <div className="text-sm font-semibold text-gray-900">{form.total_completed}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Avg Time</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {form.average_completion_time > 0
                        ? `${(form.average_completion_time / 60).toFixed(1)} min`
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {form.starts_at && (
                  <div className="mt-4 text-sm text-gray-600">
                    <span className="font-medium">Opens:</span> {formatDate(form.starts_at)}
                  </div>
                )}

                {form.ends_at && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Closes:</span> {formatDate(form.ends_at)}
                  </div>
                )}

                {form.max_submissions && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Max Submissions:</span> {form.max_submissions}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
