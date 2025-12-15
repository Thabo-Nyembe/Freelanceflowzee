'use client'

import { useState } from 'react'
import { useJobPostings, useJobApplications, useRecruitmentMutations, JobPosting, JobApplication, getJobStatusColor, getApplicationStatusColor, formatSalaryRange, getMatchScoreColor } from '@/lib/hooks/use-recruitment'
import {
  Briefcase,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Search,
  FileText,
  Mail,
  Database,
  Settings,
  BarChart3
} from 'lucide-react'

interface RecruitmentClientProps {
  initialJobs: JobPosting[]
  initialApplications: JobApplication[]
}

type ViewMode = 'all' | 'active' | 'paused' | 'closed'

export default function RecruitmentClient({ initialJobs, initialApplications }: RecruitmentClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { jobs, stats, isLoading } = useJobPostings(initialJobs, {
    status: viewMode === 'all' ? undefined : viewMode
  })
  const { applications } = useJobApplications(initialApplications)
  const { createJob, isCreatingJob } = useRecruitmentMutations()

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.job_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'part-time': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'contract': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'internship': return 'bg-cyan-100 text-cyan-800 border-cyan-200'
      case 'freelance': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Recruitment
            </h1>
            <p className="text-gray-600 mt-2">Manage job postings and candidate pipeline</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Briefcase className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium text-green-600">+8</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
            <p className="text-sm text-gray-500">Active Jobs</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium text-green-600">+324</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalApplications.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Applications</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-yellow-600" />
              <span className="text-sm font-medium text-green-600">+42</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.interviews}</p>
            <p className="text-sm text-gray-500">Interviews Scheduled</p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium text-green-600">-3 days</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">24 days</p>
            <p className="text-sm text-gray-500">Avg Time to Hire</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: 'Post Job', icon: FileText, color: 'from-purple-500 to-pink-500' },
              { label: 'Review Apps', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { label: 'Schedule', icon: Calendar, color: 'from-yellow-500 to-orange-500' },
              { label: 'Send Offer', icon: Mail, color: 'from-green-500 to-emerald-500' },
              { label: 'Candidate DB', icon: Database, color: 'from-indigo-500 to-purple-500' },
              { label: 'Templates', icon: FileText, color: 'from-teal-500 to-cyan-500' },
              { label: 'Analytics', icon: BarChart3, color: 'from-pink-500 to-rose-500' },
              { label: 'Settings', icon: Settings, color: 'from-gray-500 to-slate-500' }
            ].map((action) => (
              <button
                key={action.label}
                className="p-4 bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-3 mx-auto`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-gray-900 text-center">{action.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'active', 'paused', 'closed'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'all' ? 'All Jobs' : mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Postings List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Job Postings</h2>
              <div className="text-sm text-gray-600">{filteredJobs.length} jobs</div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading jobs...</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No job postings found</div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => {
                  const conversionRate = job.applications_count > 0
                    ? ((job.offers_count / job.applications_count) * 100).toFixed(1)
                    : '0.0'

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-purple-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                            <Briefcase className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{job.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-500">{job.job_code}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{job.department || 'General'}</span>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="text-sm text-gray-500">{job.location || 'Remote'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getJobStatusColor(job.status)}`}>
                            {job.status}
                          </div>
                          <div className={`px-3 py-1 rounded-full border text-xs font-medium ${getTypeColor(job.job_type)}`}>
                            {job.job_type}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span>{formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}</span>
                        {job.posted_date && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{job.applications_count}</div>
                          <div className="text-xs text-gray-500">Applications</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">{job.shortlisted_count}</div>
                          <div className="text-xs text-gray-500">Shortlisted</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-yellow-600">{job.interviews_count}</div>
                          <div className="text-xs text-gray-500">Interviews</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{job.offers_count}</div>
                          <div className="text-xs text-gray-500">Offers</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                          <span>Conversion Rate: {conversionRate}%</span>
                          {job.closing_date && (
                            <span>Closes: {new Date(job.closing_date).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(parseFloat(conversionRate) * 10, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border border-gray-100 hover:border-purple-200 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 text-sm">{app.candidate_name}</div>
                        <div className="text-xs text-gray-500 mt-1">{app.stage}</div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getApplicationStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{app.experience_years} years exp</span>
                      <span className={`font-medium ${getMatchScoreColor(Number(app.match_score))}`}>
                        Match: {Number(app.match_score).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Pipeline */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <h3 className="text-lg font-semibold mb-4">Hiring Pipeline</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Applications</span>
                  <span className="font-semibold text-blue-600">{stats.totalApplications}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Shortlisted</span>
                  <span className="font-semibold text-purple-600">{stats.shortlisted}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interviews</span>
                  <span className="font-semibold text-yellow-600">{stats.interviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Offers</span>
                  <span className="font-semibold text-orange-600">{stats.offers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hired</span>
                  <span className="font-semibold text-green-600">{stats.hired}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">89%</div>
                <div className="text-xs text-gray-500">Offer Acceptance</div>
                <div className="text-xs text-green-600">+4%</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <div className="text-2xl font-bold text-gray-900">2.4d</div>
                <div className="text-xs text-gray-500">Avg Response</div>
                <div className="text-xs text-green-600">-0.6d</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
