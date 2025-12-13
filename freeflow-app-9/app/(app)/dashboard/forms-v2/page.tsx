"use client"

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'
import {
  FileText, Send, Users, TrendingUp, Plus,
  Eye, Download, Upload, RefreshCw, CheckCircle,
  XCircle, Clock, Settings, Copy, Share2
} from 'lucide-react'

type FormStatus = 'draft' | 'published' | 'archived' | 'closed'
type FormType = 'contact' | 'registration' | 'application' | 'survey' | 'order' | 'lead-capture'

interface Form {
  id: string
  title: string
  description: string
  type: FormType
  status: FormStatus
  createdBy: string
  createdDate: string
  publishedDate?: string
  totalFields: number
  requiredFields: number
  totalSubmissions: number
  uniqueSubmissions: number
  completionRate: number
  averageTime: number
  views: number
  conversions: number
  lastSubmission?: string
  isEmbedded: boolean
  allowMultiple: boolean
  tags: string[]
}

const forms: Form[] = [
  {
    id: 'FRM-2847',
    title: 'Product Demo Request Form',
    description: 'Capture leads interested in scheduling a product demonstration',
    type: 'lead-capture',
    status: 'published',
    createdBy: 'Marketing Team',
    createdDate: '2024-01-05T09:00:00',
    publishedDate: '2024-01-08T10:00:00',
    totalFields: 12,
    requiredFields: 6,
    totalSubmissions: 2847,
    uniqueSubmissions: 2734,
    completionRate: 78.5,
    averageTime: 3.2,
    views: 12456,
    conversions: 23,
    lastSubmission: '2024-01-12T14:30:00',
    isEmbedded: true,
    allowMultiple: false,
    tags: ['Lead Generation', 'Demo', 'Sales', 'Marketing']
  },
  {
    id: 'FRM-2846',
    title: 'Job Application - Senior Developer',
    description: 'Application form for Senior Full Stack Developer position',
    type: 'application',
    status: 'published',
    createdBy: 'HR Department',
    createdDate: '2024-01-03T11:00:00',
    publishedDate: '2024-01-05T09:00:00',
    totalFields: 24,
    requiredFields: 15,
    totalSubmissions: 847,
    uniqueSubmissions: 847,
    completionRate: 92.3,
    averageTime: 12.8,
    views: 3456,
    conversions: 25,
    lastSubmission: '2024-01-11T16:45:00',
    isEmbedded: false,
    allowMultiple: false,
    tags: ['Recruitment', 'Job Application', 'HR', 'Developer']
  },
  {
    id: 'FRM-2845',
    title: 'Event Registration - Annual Summit 2024',
    description: 'Registration form for the company annual summit',
    type: 'registration',
    status: 'published',
    createdBy: 'Events Team',
    createdDate: '2023-12-20T10:00:00',
    publishedDate: '2024-01-02T08:00:00',
    totalFields: 18,
    requiredFields: 10,
    totalSubmissions: 4289,
    uniqueSubmissions: 4156,
    completionRate: 96.8,
    averageTime: 5.4,
    views: 8934,
    conversions: 48,
    lastSubmission: '2024-01-12T11:20:00',
    isEmbedded: true,
    allowMultiple: false,
    tags: ['Event', 'Registration', 'Summit', 'Conference']
  },
  {
    id: 'FRM-2844',
    title: 'Customer Feedback - Product Experience',
    description: 'Collect detailed feedback on product usage and satisfaction',
    type: 'survey',
    status: 'published',
    createdBy: 'Product Team',
    createdDate: '2024-01-01T14:00:00',
    publishedDate: '2024-01-03T09:00:00',
    totalFields: 15,
    requiredFields: 8,
    totalSubmissions: 1678,
    uniqueSubmissions: 1645,
    completionRate: 84.7,
    averageTime: 6.7,
    views: 5678,
    conversions: 30,
    lastSubmission: '2024-01-12T09:15:00',
    isEmbedded: false,
    allowMultiple: true,
    tags: ['Feedback', 'Survey', 'Product', 'Customer']
  },
  {
    id: 'FRM-2843',
    title: 'Contact Us - General Inquiries',
    description: 'Main contact form for general customer inquiries',
    type: 'contact',
    status: 'published',
    createdBy: 'Support Team',
    createdDate: '2023-11-15T09:00:00',
    publishedDate: '2023-12-01T10:00:00',
    totalFields: 8,
    requiredFields: 5,
    totalSubmissions: 12847,
    uniqueSubmissions: 11234,
    completionRate: 91.2,
    averageTime: 2.1,
    views: 24567,
    conversions: 52,
    lastSubmission: '2024-01-12T15:10:00',
    isEmbedded: true,
    allowMultiple: true,
    tags: ['Contact', 'Support', 'General', 'Inquiry']
  },
  {
    id: 'FRM-2842',
    title: 'Partnership Application Form',
    description: 'Application form for potential business partners',
    type: 'application',
    status: 'published',
    createdBy: 'Business Development',
    createdDate: '2023-12-10T11:00:00',
    publishedDate: '2023-12-15T09:00:00',
    totalFields: 20,
    requiredFields: 12,
    totalSubmissions: 234,
    uniqueSubmissions: 234,
    completionRate: 87.4,
    averageTime: 10.3,
    views: 892,
    conversions: 26,
    lastSubmission: '2024-01-10T13:30:00',
    isEmbedded: false,
    allowMultiple: false,
    tags: ['Partnership', 'Business', 'Application', 'B2B']
  },
  {
    id: 'FRM-2841',
    title: 'Product Order Form - Enterprise License',
    description: 'Order form for enterprise license purchases',
    type: 'order',
    status: 'published',
    createdBy: 'Sales Team',
    createdDate: '2023-12-01T10:00:00',
    publishedDate: '2023-12-05T09:00:00',
    totalFields: 16,
    requiredFields: 11,
    totalSubmissions: 567,
    uniqueSubmissions: 542,
    completionRate: 95.6,
    averageTime: 7.9,
    views: 1456,
    conversions: 39,
    lastSubmission: '2024-01-09T14:20:00',
    isEmbedded: true,
    allowMultiple: false,
    tags: ['Order', 'Enterprise', 'Sales', 'License']
  },
  {
    id: 'FRM-2840',
    title: 'Beta Program Sign-Up',
    description: 'Registration form for new feature beta testing program',
    type: 'registration',
    status: 'closed',
    createdBy: 'Product Team',
    createdDate: '2023-11-20T14:00:00',
    publishedDate: '2023-12-01T09:00:00',
    totalFields: 10,
    requiredFields: 6,
    totalSubmissions: 1847,
    uniqueSubmissions: 1847,
    completionRate: 88.9,
    averageTime: 3.8,
    views: 4289,
    conversions: 43,
    lastSubmission: '2024-01-05T11:45:00',
    isEmbedded: false,
    allowMultiple: false,
    tags: ['Beta', 'Testing', 'Product', 'Sign-Up']
  }
]

const stats = [
  {
    label: 'Total Forms',
    value: '247',
    change: 12.5,
    trend: 'up' as const,
    icon: FileText
  },
  {
    label: 'Total Submissions',
    value: '42.5K',
    change: 28.7,
    trend: 'up' as const,
    icon: Send
  },
  {
    label: 'Avg Completion',
    value: '89.3%',
    change: 5.4,
    trend: 'up' as const,
    icon: CheckCircle
  },
  {
    label: 'Avg Conversion',
    value: '35.8%',
    change: 8.2,
    trend: 'up' as const,
    icon: TrendingUp
  }
]

const quickActions = [
  { label: 'Create Form', icon: Plus, gradient: 'from-blue-500 to-cyan-600' },
  { label: 'Publish Form', icon: Send, gradient: 'from-green-500 to-emerald-600' },
  { label: 'View Submissions', icon: Eye, gradient: 'from-purple-500 to-indigo-600' },
  { label: 'Export Data', icon: Download, gradient: 'from-orange-500 to-red-600' },
  { label: 'Import Forms', icon: Upload, gradient: 'from-cyan-500 to-blue-600' },
  { label: 'Duplicate Form', icon: Copy, gradient: 'from-pink-500 to-rose-600' },
  { label: 'Share Form', icon: Share2, gradient: 'from-indigo-500 to-purple-600' },
  { label: 'Refresh', icon: RefreshCw, gradient: 'from-red-500 to-pink-600' }
]

const recentActivity = [
  { action: 'Form submitted', details: 'New demo request from Acme Corp', time: '5 min ago' },
  { action: 'High traffic', details: 'Event registration form reached 4K submissions', time: '2 hours ago' },
  { action: 'Form published', details: 'Product feedback survey activated', time: '1 day ago' },
  { action: 'Form closed', details: 'Beta program sign-up form ended', time: '1 week ago' },
  { action: 'Form created', details: 'Partnership application form drafted', time: '1 month ago' }
]

const topForms = [
  { name: 'Contact Us - General Inquiries', metric: '12,847 submissions' },
  { name: 'Event Registration - Summit 2024', metric: '4,289 submissions' },
  { name: 'Product Demo Request', metric: '2,847 submissions' },
  { name: 'Beta Program Sign-Up', metric: '1,847 submissions' },
  { name: 'Customer Feedback - Product', metric: '1,678 submissions' }
]

export default function FormsV2Page() {
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'draft' | 'embedded'>('all')

  const filteredForms = forms.filter(form => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return form.status === 'published'
    if (viewMode === 'draft') return form.status === 'draft'
    if (viewMode === 'embedded') return form.isEmbedded
    return true
  })

  const getStatusColor = (status: FormStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'archived': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'closed': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: FormStatus) => {
    switch (status) {
      case 'draft': return <Clock className="w-3 h-3" />
      case 'published': return <CheckCircle className="w-3 h-3" />
      case 'archived': return <XCircle className="w-3 h-3" />
      case 'closed': return <XCircle className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  const getTypeColor = (type: FormType) => {
    switch (type) {
      case 'contact': return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'registration': return 'bg-purple-50 text-purple-600 border-purple-100'
      case 'application': return 'bg-indigo-50 text-indigo-600 border-indigo-100'
      case 'survey': return 'bg-green-50 text-green-600 border-green-100'
      case 'order': return 'bg-orange-50 text-orange-600 border-orange-100'
      case 'lead-capture': return 'bg-pink-50 text-pink-600 border-pink-100'
      default: return 'bg-gray-50 text-gray-600 border-gray-100'
    }
  }

  const getTypeGradient = (type: FormType) => {
    switch (type) {
      case 'contact': return 'from-blue-500 to-cyan-600'
      case 'registration': return 'from-purple-500 to-pink-600'
      case 'application': return 'from-indigo-500 to-purple-600'
      case 'survey': return 'from-green-500 to-emerald-600'
      case 'order': return 'from-orange-500 to-red-600'
      case 'lead-capture': return 'from-pink-500 to-rose-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const calculateConversionRate = (conversions: number, views: number) => {
    if (views === 0) return 0
    return Math.round((conversions / views) * 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              Forms
            </h1>
            <p className="text-gray-600 mt-2">Create and manage data collection forms</p>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Form
          </button>
        </div>

        {/* Stats */}
        <StatGrid stats={stats} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <BentoQuickAction actions={quickActions} />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-3 flex-wrap">
          <PillButton
            label="All Forms"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Published"
            isActive={viewMode === 'published'}
            onClick={() => setViewMode('published')}
          />
          <PillButton
            label="Drafts"
            isActive={viewMode === 'draft'}
            onClick={() => setViewMode('draft')}
          />
          <PillButton
            label="Embedded"
            isActive={viewMode === 'embedded'}
            onClick={() => setViewMode('embedded')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Forms List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'all' && 'All Forms'}
              {viewMode === 'published' && 'Published Forms'}
              {viewMode === 'draft' && 'Draft Forms'}
              {viewMode === 'embedded' && 'Embedded Forms'}
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({filteredForms.length} total)
              </span>
            </h2>

            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(form.status)} flex items-center gap-1`}>
                        {getStatusIcon(form.status)}
                        {form.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(form.type)}`}>
                        {form.type}
                      </span>
                      {form.isEmbedded && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-50 text-blue-600 border-blue-100">
                          Embedded
                        </span>
                      )}
                      {form.allowMultiple && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-600 border-purple-100">
                          Multiple Allowed
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {form.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      {form.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {form.id} • Created by {form.createdBy} • {formatDate(form.createdDate)}
                    </p>
                  </div>
                  <button className={`px-4 py-2 bg-gradient-to-r ${getTypeGradient(form.type)} text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2`}>
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total Fields</p>
                    <p className="text-sm font-semibold text-gray-900">{form.totalFields} ({form.requiredFields} required)</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Submissions</p>
                    <p className="text-sm font-semibold text-gray-900">{form.totalSubmissions.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Views</p>
                    <p className="text-sm font-semibold text-gray-900">{form.views.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Avg Time</p>
                    <p className="text-sm font-semibold text-gray-900">{form.averageTime} min</p>
                  </div>
                </div>

                {/* Progress Bars */}
                {form.status === 'published' && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Completion Rate</span>
                        <span>{form.completionRate}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTypeGradient(form.type)} rounded-full transition-all`}
                          style={{ width: `${form.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Conversion Rate</span>
                        <span>{calculateConversionRate(form.conversions, form.views)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all"
                          style={{ width: `${calculateConversionRate(form.conversions, form.views)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Row */}
                {form.lastSubmission && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Send className="w-4 h-4 text-green-600" />
                      <span>Last: {formatDate(form.lastSubmission)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{form.uniqueSubmissions.toLocaleString()} unique</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span>{form.conversions}% conversion</span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Form Type Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Form Types</h3>
              <div className="space-y-3">
                {[
                  { type: 'contact', count: 78, percentage: 32 },
                  { type: 'registration', count: 62, percentage: 25 },
                  { type: 'lead-capture', count: 45, percentage: 18 },
                  { type: 'survey', count: 34, percentage: 14 },
                  { type: 'application', count: 18, percentage: 7 },
                  { type: 'order', count: 10, percentage: 4 }
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 capitalize">{item.type}</span>
                      <span className="text-gray-900 font-semibold">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getTypeGradient(item.type as FormType)} rounded-full`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Forms */}
            <RankingList
              title="Most Submissions"
              items={topForms}
              gradient="from-pink-500 to-rose-600"
            />

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              activities={recentActivity}
            />

            {/* Performance Metrics */}
            <MiniKPI
              label="Unique Submissions"
              value="38.4K"
              change={15.7}
              trend="up"
            />

            <ProgressCard
              title="Monthly Target"
              current={42}
              target={50}
              label="forms created"
              gradient="from-pink-500 to-rose-600"
            />

          </div>
        </div>

      </div>
    </div>
  )
}
