'use client'

import { useState } from 'react'
import StatGrid from '@/components/dashboard-results/StatGrid'
import BentoQuickAction from '@/components/dashboard-results/BentoQuickAction'
import PillButton from '@/components/modern-button-suite/PillButton'
import MiniKPI from '@/components/dashboard-results/MiniKPI'
import ActivityFeed from '@/components/dashboard-results/ActivityFeed'
import RankingList from '@/components/dashboard-results/RankingList'
import ProgressCard from '@/components/dashboard-results/ProgressCard'

type JobStatus = 'active' | 'paused' | 'closed' | 'draft'
type ApplicationStatus = 'new' | 'screening' | 'interview' | 'offer' | 'rejected' | 'hired'
type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'freelance'
type ViewMode = 'all' | 'active' | 'paused' | 'closed'

export default function RecruitmentV2() {
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  // Sample recruitment data
  const jobPostings = [
    {
      id: 'JOB-2847',
      title: 'Senior Full Stack Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'full-time' as const,
      status: 'active' as const,
      applications: 284,
      shortlisted: 47,
      interviews: 12,
      offers: 2,
      posted: '2024-02-01',
      daysOpen: 14,
      salary: '$140k - $180k'
    },
    {
      id: 'JOB-2846',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      type: 'full-time' as const,
      status: 'active' as const,
      applications: 412,
      shortlisted: 68,
      interviews: 24,
      offers: 3,
      posted: '2024-01-28',
      daysOpen: 18,
      salary: '$120k - $150k'
    },
    {
      id: 'JOB-2845',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'full-time' as const,
      status: 'active' as const,
      applications: 518,
      shortlisted: 92,
      interviews: 18,
      offers: 1,
      posted: '2024-01-25',
      daysOpen: 21,
      salary: '$100k - $130k'
    },
    {
      id: 'JOB-2844',
      title: 'Marketing Intern',
      department: 'Marketing',
      location: 'Austin, TX',
      type: 'internship' as const,
      status: 'active' as const,
      applications: 647,
      shortlisted: 124,
      interviews: 32,
      offers: 4,
      posted: '2024-01-20',
      daysOpen: 26,
      salary: '$25/hour'
    },
    {
      id: 'JOB-2843',
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'contract' as const,
      status: 'paused' as const,
      applications: 156,
      shortlisted: 28,
      interviews: 8,
      offers: 0,
      posted: '2024-01-15',
      daysOpen: 31,
      salary: '$120k - $140k'
    },
    {
      id: 'JOB-2842',
      title: 'Data Scientist',
      department: 'Data',
      location: 'Boston, MA',
      type: 'full-time' as const,
      status: 'closed' as const,
      applications: 892,
      shortlisted: 147,
      interviews: 42,
      offers: 5,
      posted: '2024-01-10',
      daysOpen: 36,
      salary: '$150k - $190k'
    }
  ]

  const recentApplications = [
    {
      id: 'APP-8471',
      candidate: 'Sarah Johnson',
      position: 'Senior Full Stack Developer',
      status: 'interview' as const,
      stage: 'Technical Round',
      appliedDate: '2024-02-10',
      experience: '8 years',
      matchScore: 94
    },
    {
      id: 'APP-8470',
      candidate: 'Michael Chen',
      position: 'Product Manager',
      status: 'offer' as const,
      stage: 'Offer Extended',
      appliedDate: '2024-02-08',
      experience: '6 years',
      matchScore: 92
    },
    {
      id: 'APP-8469',
      candidate: 'Emily Rodriguez',
      position: 'UX/UI Designer',
      status: 'screening' as const,
      stage: 'Portfolio Review',
      appliedDate: '2024-02-12',
      experience: '5 years',
      matchScore: 88
    },
    {
      id: 'APP-8468',
      candidate: 'David Kim',
      position: 'Data Scientist',
      status: 'hired' as const,
      stage: 'Offer Accepted',
      appliedDate: '2024-01-15',
      experience: '7 years',
      matchScore: 96
    },
    {
      id: 'APP-8467',
      candidate: 'Jessica Williams',
      position: 'Marketing Intern',
      status: 'new' as const,
      stage: 'Application Received',
      appliedDate: '2024-02-14',
      experience: '1 year',
      matchScore: 78
    }
  ]

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'paused': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'closed': return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
      case 'draft': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    }
  }

  const getApplicationStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'screening': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'interview': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'offer': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'hired': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    }
  }

  const getTypeColor = (type: JobType) => {
    switch (type) {
      case 'full-time': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'part-time': return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'contract': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'internship': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
      case 'freelance': return 'bg-pink-500/10 text-pink-500 border-pink-500/20'
    }
  }

  const filteredJobs = viewMode === 'all'
    ? jobPostings
    : jobPostings.filter(job => job.status === viewMode)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Recruitment
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage job postings and candidate pipeline
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300">
              Post New Job
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <StatGrid
          stats={[
            {
              label: 'Active Jobs',
              value: '47',
              change: '+8',
              trend: 'up' as const,
              subtitle: 'across all departments'
            },
            {
              label: 'Total Applications',
              value: '2,847',
              change: '+324',
              trend: 'up' as const,
              subtitle: 'this month'
            },
            {
              label: 'Interviews Scheduled',
              value: '186',
              change: '+42',
              trend: 'up' as const,
              subtitle: 'next 7 days'
            },
            {
              label: 'Avg Time to Hire',
              value: '24 days',
              change: '-3 days',
              trend: 'up' as const,
              subtitle: 'improving efficiency'
            }
          ]}
        />

        {/* Quick Actions */}
        <BentoQuickAction
          actions={[
            { label: 'Post Job', icon: '📝', onClick: () => {} },
            { label: 'Review Applications', icon: '📋', onClick: () => {} },
            { label: 'Schedule Interview', icon: '📅', onClick: () => {} },
            { label: 'Send Offer', icon: '✉️', onClick: () => {} },
            { label: 'Candidate Database', icon: '👥', onClick: () => {} },
            { label: 'Job Templates', icon: '📄', onClick: () => {} },
            { label: 'Analytics', icon: '📊', onClick: () => {} },
            { label: 'Settings', icon: '⚙️', onClick: () => {} }
          ]}
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillButton
            label="All Jobs"
            isActive={viewMode === 'all'}
            onClick={() => setViewMode('all')}
          />
          <PillButton
            label="Active"
            isActive={viewMode === 'active'}
            onClick={() => setViewMode('active')}
          />
          <PillButton
            label="Paused"
            isActive={viewMode === 'paused'}
            onClick={() => setViewMode('paused')}
          />
          <PillButton
            label="Closed"
            isActive={viewMode === 'closed'}
            onClick={() => setViewMode('closed')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Job Postings List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
                Job Postings ({filteredJobs.length})
              </h2>
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 group cursor-pointer bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {job.title}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs border ${getTypeColor(job.type)}`}>
                            {job.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="text-purple-500">🏢</span>
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-purple-500">📍</span>
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-purple-500">💰</span>
                            {job.salary}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-purple-500">📅</span>
                            {job.daysOpen} days open
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">{job.applications}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Applications</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{job.shortlisted}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Shortlisted</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{job.interviews}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Interviews</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">{job.offers}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">Offers</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Conversion Rate: {((job.offers / job.applications) * 100).toFixed(1)}%</span>
                        <span>Posted: {job.posted}</span>
                      </div>
                      <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-500"
                          style={{ width: `${(job.offers / job.applications) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Recent Applications */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Applications</h3>
              <div className="space-y-3">
                {recentApplications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors text-sm">
                          {app.candidate}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {app.position}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs border ${getApplicationStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                      <span>{app.experience}</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">Match: {app.matchScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring Pipeline */}
            <ProgressCard
              title="Hiring Pipeline"
              items={[
                { label: 'New Applications', value: 847, total: 2847, color: 'blue' },
                { label: 'Screening', value: 284, total: 2847, color: 'purple' },
                { label: 'Interviews', value: 186, total: 2847, color: 'yellow' },
                { label: 'Offers', value: 42, total: 2847, color: 'green' },
                { label: 'Hired', value: 18, total: 2847, color: 'emerald' }
              ]}
            />

            {/* Top Departments Hiring */}
            <RankingList
              title="Top Departments Hiring"
              items={[
                { label: 'Engineering', value: '18 positions', rank: 1, trend: 'up' },
                { label: 'Product', value: '12 positions', rank: 2, trend: 'up' },
                { label: 'Marketing', value: '8 positions', rank: 3, trend: 'same' },
                { label: 'Sales', value: '5 positions', rank: 4, trend: 'down' },
                { label: 'Design', value: '4 positions', rank: 5, trend: 'up' }
              ]}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <MiniKPI
                label="Offer Acceptance"
                value="89%"
                trend="up"
                change="+4%"
              />
              <MiniKPI
                label="Avg Response Time"
                value="2.4 days"
                trend="up"
                change="-0.6d"
              />
            </div>

            {/* Recent Activity */}
            <ActivityFeed
              activities={[
                {
                  action: 'Offer accepted',
                  subject: 'David Kim - Data Scientist',
                  time: '2 hours ago',
                  type: 'success'
                },
                {
                  action: 'Interview scheduled',
                  subject: 'Sarah Johnson - Technical Round',
                  time: '4 hours ago',
                  type: 'info'
                },
                {
                  action: 'New application',
                  subject: 'Emily Rodriguez - UX Designer',
                  time: '6 hours ago',
                  type: 'info'
                },
                {
                  action: 'Job posted',
                  subject: 'Senior Backend Engineer',
                  time: '1 day ago',
                  type: 'success'
                }
              ]}
            />

          </div>
        </div>

      </div>
    </div>
  )
}
