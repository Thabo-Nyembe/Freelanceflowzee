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
  TrendingUp,
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

/**
 * Performance V2 - Performance Review Management
 * Manages employee performance reviews, goals, and feedback
 */
export default function PerformanceV2() {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'q1' | 'q2' | 'q3' | 'q4'>('all')

  const stats = [
    { label: 'Avg Performance', value: '92%', change: 5.7, icon: <Award className="w-5 h-5" /> },
    { label: 'Completed Reviews', value: '234', change: 12.3, icon: <CheckCircle className="w-5 h-5" /> },
    { label: 'Goals Met', value: '89%', change: 8.9, icon: <Target className="w-5 h-5" /> },
    { label: 'Satisfaction', value: '4.7/5', change: 3.2, icon: <Star className="w-5 h-5" /> }
  ]

  const reviews = [
    {
      id: '1',
      employee: 'Sarah Johnson',
      position: 'Senior Software Engineer',
      avatar: 'SJ',
      reviewer: 'John Smith',
      score: 98,
      period: 'Q4 2023',
      reviewDate: '2024-01-15',
      status: 'completed',
      goalsAchieved: 12,
      totalGoals: 12,
      feedback: 'Exceptional performance across all metrics',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      employee: 'Michael Chen',
      position: 'Product Designer',
      avatar: 'MC',
      reviewer: 'Jane Doe',
      score: 95,
      period: 'Q4 2023',
      reviewDate: '2024-01-18',
      status: 'completed',
      goalsAchieved: 9,
      totalGoals: 10,
      feedback: 'Outstanding creativity and team collaboration',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      employee: 'Emily Rodriguez',
      position: 'Marketing Manager',
      avatar: 'ER',
      reviewer: 'Mark Wilson',
      score: 92,
      period: 'Q4 2023',
      reviewDate: '2024-01-20',
      status: 'completed',
      goalsAchieved: 11,
      totalGoals: 12,
      feedback: 'Strong leadership and strategic thinking',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      employee: 'David Park',
      position: 'Sales Director',
      avatar: 'DP',
      reviewer: 'Lisa Brown',
      score: 96,
      period: 'Q4 2023',
      reviewDate: '2024-01-22',
      status: 'completed',
      goalsAchieved: 15,
      totalGoals: 15,
      feedback: 'Exceeded all sales targets and mentored team',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      employee: 'Lisa Anderson',
      position: 'Frontend Developer',
      avatar: 'LA',
      reviewer: 'Tom Garcia',
      score: 90,
      period: 'Q4 2023',
      reviewDate: '2024-01-25',
      status: 'completed',
      goalsAchieved: 8,
      totalGoals: 10,
      feedback: 'Great progress on technical skills',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      employee: 'James Wilson',
      position: 'UX Designer',
      avatar: 'JW',
      reviewer: 'Anna Lee',
      score: 88,
      period: 'Q4 2023',
      reviewDate: '2024-01-28',
      status: 'completed',
      goalsAchieved: 7,
      totalGoals: 9,
      feedback: 'Solid performance with room for growth',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      employee: 'Maria Garcia',
      position: 'Content Strategist',
      avatar: 'MG',
      reviewer: 'Chris Martin',
      score: 85,
      period: 'Q4 2023',
      reviewDate: '2024-02-01',
      status: 'in_progress',
      goalsAchieved: 6,
      totalGoals: 8,
      feedback: 'Working on improvement areas',
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      employee: 'Robert Brown',
      position: 'Account Executive',
      avatar: 'RB',
      reviewer: 'Sara Davis',
      score: 93,
      period: 'Q4 2023',
      reviewDate: '2024-02-03',
      status: 'completed',
      goalsAchieved: 10,
      totalGoals: 11,
      feedback: 'Excellent client relationships',
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const topPerformers = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '98%', change: 5.2 },
    { rank: 2, name: 'David Park', avatar: 'DP', value: '96%', change: 4.8 },
    { rank: 3, name: 'Michael Chen', avatar: 'MC', value: '95%', change: 3.7 },
    { rank: 4, name: 'Robert Brown', avatar: 'RB', value: '93%', change: 2.9 },
    { rank: 5, name: 'Emily Rodriguez', avatar: 'ER', value: '92%', change: 2.3 }
  ]

  const recentActivity = [
    { icon: <CheckCircle className="w-4 h-4" />, title: 'Review completed for Sarah', time: '2h ago', type: 'success' as const },
    { icon: <MessageCircle className="w-4 h-4" />, title: 'Feedback submitted', time: '5h ago', type: 'info' as const },
    { icon: <Target className="w-4 h-4" />, title: 'Q1 goals set', time: '1d ago', type: 'warning' as const },
    { icon: <Award className="w-4 h-4" />, title: '5 promotions approved', time: '2d ago', type: 'success' as const }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' }
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: <Clock className="w-3 h-3" />, label: 'In Progress' }
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: <AlertCircle className="w-3 h-3" />, label: 'Pending' }
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

        <StatGrid columns={4} stats={stats} />

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
          <PillButton variant={selectedPeriod === 'q1' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('q1')}>
            <Calendar className="w-4 h-4 mr-2" />
            Q1
          </PillButton>
          <PillButton variant={selectedPeriod === 'q2' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('q2')}>
            <Calendar className="w-4 h-4 mr-2" />
            Q2
          </PillButton>
          <PillButton variant={selectedPeriod === 'q3' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('q3')}>
            <Calendar className="w-4 h-4 mr-2" />
            Q3
          </PillButton>
          <PillButton variant={selectedPeriod === 'q4' ? 'primary' : 'ghost'} onClick={() => setSelectedPeriod('q4')}>
            <Calendar className="w-4 h-4 mr-2" />
            Q4
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
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {reviews.map((review) => {
                  const statusBadge = getStatusBadge(review.status)
                  const scoreColor = getScoreColor(review.score)
                  const goalsProgress = (review.goalsAchieved / review.totalGoals) * 100

                  return (
                    <div key={review.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${review.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                              {review.avatar}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{review.employee}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusBadge.color}`}>
                                  {statusBadge.icon}
                                  {statusBadge.label}
                                </span>
                              </div>
                              <p className="text-sm mb-1">{review.position}</p>
                              <p className="text-xs text-muted-foreground">Reviewed by {review.reviewer}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${scoreColor}`}>{review.score}%</div>
                            <p className="text-xs text-muted-foreground">{review.period}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Goals Progress</span>
                            <span className="font-semibold">{review.goalsAchieved}/{review.totalGoals} achieved</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${review.color}`}
                              style={{ width: `${goalsProgress}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm italic">&quot;{review.feedback}&quot;</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>Reviewed on {review.reviewDate}</span>
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
                  <p className="text-2xl font-bold">92</p>
                  <p className="text-xs text-green-600 mt-1">95-100% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <ThumbsUp className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Good</p>
                  </div>
                  <p className="text-2xl font-bold">108</p>
                  <p className="text-xs text-blue-600 mt-1">85-94% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm font-medium">Satisfactory</p>
                  </div>
                  <p className="text-2xl font-bold">28</p>
                  <p className="text-xs text-yellow-600 mt-1">75-84% score</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Needs Improvement</p>
                  </div>
                  <p className="text-2xl font-bold">6</p>
                  <p className="text-xs text-orange-600 mt-1">Below 75%</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="🏆 Top Performers" items={topPerformers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Avg Performance" value="92%" change={5.7} />
                <MiniKPI label="Completed Reviews" value="234" change={12.3} />
                <MiniKPI label="Goals Met" value="89%" change={8.9} />
                <MiniKPI label="Satisfaction" value="4.7/5" change={3.2} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Review Completion"
              value={234}
              target={247}
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
                    <span className="text-xs font-semibold">92 (39%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '39%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Good (85-94)</span>
                    </div>
                    <span className="text-xs font-semibold">108 (46%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '46%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm">Satisfactory (75-84)</span>
                    </div>
                    <span className="text-xs font-semibold">28 (12%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500" style={{ width: '12%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Needs Work (&lt;75)</span>
                    </div>
                    <span className="text-xs font-semibold">6 (3%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '3%' }} />
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
