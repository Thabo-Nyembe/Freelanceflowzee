"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Award,
  Target,
  Star,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Users,
  BarChart3,
  FileText,
  MessageCircle,
  ThumbsUp,
  Eye,
  MoreVertical,
  Search,
  Filter,
  Download
} from 'lucide-react'
import { usePerformanceReviews, usePerformanceStats, type PerformanceReview } from '@/lib/hooks/use-performance'
import { updateReviewStatus, approveReview } from '@/app/actions/performance'

interface PerformanceClientProps {
  initialReviews: PerformanceReview[]
}

export default function PerformanceClient({ initialReviews }: PerformanceClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Use hooks for real-time data
  const { data: reviews } = usePerformanceReviews({
    period: selectedPeriod === 'all' ? undefined : selectedPeriod,
    searchQuery: searchQuery || undefined
  })
  const { stats } = usePerformanceStats()

  const displayReviews = reviews || initialReviews

  const filteredReviews = selectedPeriod === 'all'
    ? displayReviews
    : displayReviews.filter(review => review.review_period === selectedPeriod)

  const statItems = [
    { label: 'Avg Performance', value: stats?.averageScore ? `${stats.averageScore.toFixed(0)}%` : '0%', change: 5.7, icon: <Award className="w-5 h-5" /> },
    { label: 'Completed Reviews', value: stats?.completedReviews?.toString() || '0', change: 12.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Goals Met', value: stats?.totalGoals ? `${Math.round((stats.totalGoalsAchieved / stats.totalGoals) * 100)}%` : '0%', change: 8.9, icon: <Target className="w-5 h-5" /> },
    { label: 'Total Reviews', value: stats?.totalReviews?.toString() || '0', change: 3.2, icon: <Star className="w-5 h-5" /> }
  ]

  const topPerformers = displayReviews
    .sort((a, b) => b.overall_score - a.overall_score)
    .slice(0, 5)
    .map((review, index) => ({
      rank: index + 1,
      name: review.employee_name,
      avatar: review.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2),
      value: `${review.overall_score}%`,
      change: 0
    }))

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Review completed', time: '2h ago', type: 'success' as const },
    { icon: <MessageCircle className="w-4 h-4" />, title: 'Feedback submitted', time: '5h ago', type: 'info' as const },
    { icon: <Target className="w-4 h-4" />, title: 'Goals set', time: '1d ago', type: 'warning' as const },
    { icon: <Award className="w-4 h-4" />, title: 'Review approved', time: '2d ago', type: 'success' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' }
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'In Progress' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" />, label: 'Pending' }
      case 'approved':
        return { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', icon: <ThumbsUp className="w-3 h-3" />, label: 'Approved' }
      case 'submitted':
        return { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400', icon: <FileText className="w-3 h-3" />, label: 'Submitted' }
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: <FileText className="w-3 h-3" />, label: status }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-blue-600'
    if (score >= 75) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-amber-500',
      'from-teal-500 to-cyan-500'
    ]
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  const handleApproveReview = async (reviewId: string) => {
    await approveReview(reviewId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50/30 to-orange-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Award className="w-10 h-10 text-amber-600" />
              Performance Reviews
            </h1>
            <p className="text-muted-foreground">Track employee performance and growth</p>
          </div>
          <GradientButton from="amber" to="orange" onClick={() => console.log('Export')}>
            <Download className="w-5 h-5 mr-2" />
            Export Reports
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={statItems} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Target />} title="Set Goals" description="Define targets" onClick={() => console.log('Goals')} />
          <BentoQuickAction icon={<FileText />} title="Reviews" description="All reviews" onClick={() => console.log('Reviews')} />
          <BentoQuickAction icon={<BarChart3 />} title="Analytics" description="Insights" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Users />} title="Team" description="Overview" onClick={() => console.log('Team')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedPeriod === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('all')}>
            All Periods
          </PillButton>
          <PillButton variant={selectedPeriod === 'monthly' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('monthly')}>
            <Calendar className="w-4 h-4 mr-2" />
            Monthly
          </PillButton>
          <PillButton variant={selectedPeriod === 'quarterly' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('quarterly')}>
            <Calendar className="w-4 h-4 mr-2" />
            Quarterly
          </PillButton>
          <PillButton variant={selectedPeriod === 'semi_annual' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('semi_annual')}>
            <Calendar className="w-4 h-4 mr-2" />
            Semi-Annual
          </PillButton>
          <PillButton variant={selectedPeriod === 'annual' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('annual')}>
            <Calendar className="w-4 h-4 mr-2" />
            Annual
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Performance Reviews</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {filteredReviews.map((review) => {
                  const statusBadge = getStatusBadge(review.status)
                  const scoreColor = getScoreColor(review.overall_score)
                  const goalsProgress = review.goals_total > 0 ? (review.goals_achieved / review.goals_total) * 100 : 0
                  const avatarInitials = review.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2)

                  return (
                    <div key={review.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getAvatarColor(review.employee_name)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {avatarInitials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{review.employee_name}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{review.position || 'Employee'}</p>
                              <p className="text-xs text-muted-foreground">Reviewed by {review.reviewer_name || 'Manager'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${scoreColor}`}>{review.overall_score}%</div>
                            <p className="text-xs text-muted-foreground capitalize">{review.review_period.replace('_', '-')}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Goals Progress</span>
                            <span className="font-semibold">{review.goals_achieved}/{review.goals_total} achieved</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${getAvatarColor(review.employee_name)}`}
                              style={{ width: `${goalsProgress}%` }}
                            />
                          </div>
                        </div>

                        {review.feedback && (
                          <div className="p-3 rounded-lg bg-muted/50">
                            <p className="text-sm italic">&quot;{review.feedback}&quot;</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Reviewed on {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ModernButton variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View Full
                            </ModernButton>
                            <ModernButton variant="outline" size="sm">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Feedback
                            </ModernButton>
                            {review.status === 'submitted' && (
                              <ModernButton variant="primary" size="sm" onClick={() => handleApproveReview(review.id)}>
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Approve
                              </ModernButton>
                            )}
                            <ModernButton variant="ghost" size="sm">
                              <MoreVertical className="w-3 h-3" />
                            </ModernButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Performance Distribution</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Excellent</p>
                  </div>
                  <p className="text-2xl font-bold">{displayReviews.filter(r => r.overall_score >= 95).length}</p>
                  <p className="text-xs text-green-600 mt-1">95-100% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Good</p>
                  </div>
                  <p className="text-2xl font-bold">{displayReviews.filter(r => r.overall_score >= 85 && r.overall_score < 95).length}</p>
                  <p className="text-xs text-blue-600 mt-1">85-94% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium">Satisfactory</p>
                  </div>
                  <p className="text-2xl font-bold">{displayReviews.filter(r => r.overall_score >= 75 && r.overall_score < 85).length}</p>
                  <p className="text-xs text-yellow-600 mt-1">75-84% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Needs Improvement</p>
                  </div>
                  <p className="text-2xl font-bold">{displayReviews.filter(r => r.overall_score < 75).length}</p>
                  <p className="text-xs text-orange-600 mt-1">Below 75%</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="Top Performers" items={topPerformers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Performance" value={`${(stats?.averageScore || 0).toFixed(0)}%`} change={5.7} />
                <MiniKPI label="Completed Reviews" value={stats?.completedReviews?.toString() || '0'} change={12.3} />
                <MiniKPI label="Goals Achieved" value={stats?.totalGoalsAchieved?.toString() || '0'} change={8.9} />
                <MiniKPI label="Pending Reviews" value={stats?.pendingReviews?.toString() || '0'} change={3.2} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Review Completion"
              value={stats?.completedReviews || 0}
              target={stats?.totalReviews || 1}
              label="Reviews completed"
              color="from-amber-500 to-orange-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Excellent (95-100)</span>
                    </div>
                    <span className="text-xs font-semibold">{displayReviews.filter(r => r.overall_score >= 95).length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${displayReviews.length ? (displayReviews.filter(r => r.overall_score >= 95).length / displayReviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Good (85-94)</span>
                    </div>
                    <span className="text-xs font-semibold">{displayReviews.filter(r => r.overall_score >= 85 && r.overall_score < 95).length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${displayReviews.length ? (displayReviews.filter(r => r.overall_score >= 85 && r.overall_score < 95).length / displayReviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Satisfactory (75-84)</span>
                    </div>
                    <span className="text-xs font-semibold">{displayReviews.filter(r => r.overall_score >= 75 && r.overall_score < 85).length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: `${displayReviews.length ? (displayReviews.filter(r => r.overall_score >= 75 && r.overall_score < 85).length / displayReviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Needs Work (&lt;75)</span>
                    </div>
                    <span className="text-xs font-semibold">{displayReviews.filter(r => r.overall_score < 75).length}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: `${displayReviews.length ? (displayReviews.filter(r => r.overall_score < 75).length / displayReviews.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
