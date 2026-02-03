'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { ClipboardCheck, Star, TrendingUp, Users, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const reviews = [
  { id: 1, employee: 'Sarah Mitchell', role: 'Senior Developer', department: 'Engineering', reviewType: 'Annual', dueDate: '2024-03-15', status: 'completed', overallRating: 4.5, manager: 'John Smith' },
  { id: 2, employee: 'Michael Chen', role: 'Product Manager', department: 'Product', reviewType: 'Mid-Year', dueDate: '2024-03-20', status: 'in-progress', overallRating: 0, manager: 'Emma Wilson' },
  { id: 3, employee: 'Emily Rodriguez', role: 'UX Designer', department: 'Design', reviewType: 'Probation', dueDate: '2024-02-28', status: 'completed', overallRating: 4.8, manager: 'Alex Johnson' },
  { id: 4, employee: 'David Park', role: 'Data Analyst', department: 'Analytics', reviewType: 'Annual', dueDate: '2024-03-25', status: 'scheduled', overallRating: 0, manager: 'Lisa Brown' },
  { id: 5, employee: 'Jessica Lee', role: 'Marketing Manager', department: 'Marketing', reviewType: 'Annual', dueDate: '2024-02-25', status: 'overdue', overallRating: 0, manager: 'Mark Davis' },
]

const performanceMetrics = [
  { category: 'Technical Skills', avgScore: 4.3, count: 45 },
  { category: 'Communication', avgScore: 4.1, count: 45 },
  { category: 'Teamwork', avgScore: 4.5, count: 45 },
  { category: 'Leadership', avgScore: 3.8, count: 28 },
  { category: 'Problem Solving', avgScore: 4.2, count: 45 },
]

const upcomingReviews = [
  { employee: 'Robert Williams', role: 'DevOps Engineer', dueDate: '2024-03-05', daysUntil: 5 },
  { employee: 'Amanda Taylor', role: 'Sales Executive', dueDate: '2024-03-10', daysUntil: 10 },
  { employee: 'Chris Anderson', role: 'QA Engineer', dueDate: '2024-03-15', daysUntil: 15 },
]

const ratingDistribution = [
  { rating: '5.0', count: 8, percentage: 18 },
  { rating: '4.0-4.9', count: 25, percentage: 56 },
  { rating: '3.0-3.9', count: 10, percentage: 22 },
  { rating: '<3.0', count: 2, percentage: 4 },
]

export default function PerformanceReviewsClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: reviews.length,
    completed: reviews.filter(r => r.status === 'completed').length,
    inProgress: reviews.filter(r => r.status === 'in-progress').length,
    overdue: reviews.filter(r => r.status === 'overdue').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'completed': 'bg-green-100 text-green-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'scheduled': 'bg-purple-100 text-purple-700',
      'overdue': 'bg-red-100 text-red-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews
    return reviews.filter(r => r.status === filter)
  }, [filter])

  const insights = [
    { icon: ClipboardCheck, title: `${stats.total}`, description: 'Total reviews' },
    { icon: CheckCircle, title: `${stats.completed}`, description: 'Completed' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
    { icon: AlertCircle, title: `${stats.overdue}`, description: 'Overdue' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ClipboardCheck className="h-8 w-8 text-primary" />Performance Reviews</h1>
          <p className="text-muted-foreground mt-1">Manage employee performance evaluations</p>
        </div>
        <Button><ClipboardCheck className="h-4 w-4 mr-2" />Schedule Review</Button>
      </div>

      <CollapsibleInsightsPanel title="Reviews Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Reviews</h3>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'completed' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('completed')}>Completed</Button>
                <Button variant={filter === 'in-progress' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('in-progress')}>In Progress</Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.employee}`} />
                          <AvatarFallback>{review.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{review.employee}</h4>
                          <p className="text-sm text-muted-foreground">{review.role} • {review.department}</p>
                        </div>
                      </div>
                      {getStatusBadge(review.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-muted-foreground">Review Type</p>
                        <p className="font-medium">{review.reviewType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Due Date</p>
                        <p className="font-medium">{review.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Manager</p>
                        <p className="font-medium">{review.manager}</p>
                      </div>
                    </div>

                    {review.status === 'completed' && review.overallRating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-lg">{review.overallRating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">Overall Rating</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                      {review.status !== 'completed' && (
                        <Button size="sm" className="flex-1">Continue Review</Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingReviews.map((review, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{review.employee}</p>
                        <p className="text-xs text-muted-foreground">{review.role}</p>
                      </div>
                      <Badge variant="outline">{review.daysUntil}d</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{review.dueDate}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{metric.category}</span>
                      <span className="text-sm text-muted-foreground">{metric.avgScore}/5.0</span>
                    </div>
                    <Progress value={(metric.avgScore / 5) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4" />
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ratingDistribution.map((dist, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1 text-sm">
                      <span className="font-medium">{dist.rating}</span>
                      <span className="text-muted-foreground">{dist.count} ({dist.percentage}%)</span>
                    </div>
                    <Progress value={dist.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
