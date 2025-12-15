'use client'

import { useState } from 'react'
import { useCourses, type Course, type CourseCategory, type CourseStatus, type CourseLevel } from '@/lib/hooks/use-courses'
import { BentoCard } from '@/components/ui/bento-grid-advanced'
import { StatGrid, ActivityFeed, MiniKPI } from '@/components/ui/results-display'
import { GradientButton, PillButton, ModernButton } from '@/components/ui/modern-buttons'
import { BookOpen, GraduationCap, Users, Star, CheckCircle2, Plus, Play, FileText, Award } from 'lucide-react'

export default function CoursesClient({ initialCourses }: { initialCourses: Course[] }) {
  const [categoryFilter, setCategoryFilter] = useState<CourseCategory | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all')
  const [levelFilter, setLevelFilter] = useState<CourseLevel | 'all'>('all')
  const { courses, loading, error } = useCourses({ category: categoryFilter, status: statusFilter, level: levelFilter })

  const displayCourses = courses.length > 0 ? courses : initialCourses

  const stats = [
    {
      label: 'Total Courses',
      value: displayCourses.length.toString(),
      change: 18.2,
      icon: <BookOpen className="w-5 h-5" />
    },
    {
      label: 'Total Students',
      value: displayCourses.reduce((sum, c) => sum + c.student_count, 0).toLocaleString(),
      change: 24.7,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Avg Completion',
      value: displayCourses.length > 0
        ? `${(displayCourses.reduce((sum, c) => sum + c.completion_rate, 0) / displayCourses.length).toFixed(1)}%`
        : '0%',
      change: 12.4,
      icon: <CheckCircle2 className="w-5 h-5" />
    },
    {
      label: 'Avg Rating',
      value: displayCourses.length > 0
        ? `${(displayCourses.reduce((sum, c) => sum + c.rating, 0) / displayCourses.length).toFixed(1)}/5`
        : '0/5',
      change: 8.2,
      icon: <Star className="w-5 h-5" />
    }
  ]

  const getStatusColor = (status: CourseStatus) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200'
      case 'draft': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'under_review': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'expert': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 4.8) return 'text-green-600'
    if (rating >= 4.5) return 'text-blue-600'
    if (rating >= 4.0) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const recentActivity = displayCourses.slice(0, 4).map((c, idx) => ({
    icon: <BookOpen className="w-5 h-5" />,
    title: c.is_published ? 'Published' : 'Draft',
    description: c.course_name,
    time: new Date(c.created_at).toLocaleDateString(),
    status: c.is_published ? 'success' as const : 'info' as const
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-10 h-10 text-blue-600" />
              Course Management
            </h1>
            <p className="text-muted-foreground">Create and manage educational courses</p>
          </div>
          <GradientButton from="blue" to="indigo" onClick={() => console.log('New course')}>
            <Plus className="w-5 h-5 mr-2" />
            New Course
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <PillButton variant={statusFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('all')}>
              All
            </PillButton>
            <PillButton variant={statusFilter === 'published' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('published')}>
              Published
            </PillButton>
            <PillButton variant={statusFilter === 'draft' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('draft')}>
              Draft
            </PillButton>
            <PillButton variant={statusFilter === 'archived' ? 'primary' : 'ghost'} onClick={() => setStatusFilter('archived')}>
              Archived
            </PillButton>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Level:</span>
            <PillButton variant={levelFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setLevelFilter('all')}>
              All
            </PillButton>
            <PillButton variant={levelFilter === 'beginner' ? 'primary' : 'ghost'} onClick={() => setLevelFilter('beginner')}>
              Beginner
            </PillButton>
            <PillButton variant={levelFilter === 'intermediate' ? 'primary' : 'ghost'} onClick={() => setLevelFilter('intermediate')}>
              Intermediate
            </PillButton>
            <PillButton variant={levelFilter === 'advanced' ? 'primary' : 'ghost'} onClick={() => setLevelFilter('advanced')}>
              Advanced
            </PillButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-3">
              {displayCourses.map((course) => (
                <BentoCard key={course.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{course.course_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(course.status)}`}>
                            {course.status}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getLevelColor(course.level)}`}>
                            {course.level}
                          </span>
                          <span className="text-xs text-muted-foreground capitalize">{course.course_category.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    {course.rating > 0 && (
                      <div className={`flex items-center gap-1 ${getRatingColor(course.rating)}`}>
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-semibold">{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4">{course.description}</p>
                  )}

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="font-semibold text-blue-600">{course.student_count.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Completion</p>
                      <p className="font-semibold">{course.completion_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                      <p className="font-semibold">{course.review_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-green-600">${course.total_revenue.toLocaleString()}</p>
                    </div>
                  </div>

                  {course.completion_rate > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600">Course Completion</span>
                        <span className="font-semibold">{course.completion_rate.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                          style={{ width: `${Math.min(course.completion_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {course.instructor_name && (
                        <span>Instructor: <span className="font-medium">{course.instructor_name}</span></span>
                      )}
                      <span>{course.lecture_count} lectures</span>
                      <span>{course.total_duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.is_published ? (
                        <ModernButton variant="outline" size="sm">
                          <FileText className="w-3 h-3 mr-1" />
                          View
                        </ModernButton>
                      ) : (
                        <ModernButton variant="outline" size="sm">
                          <Play className="w-3 h-3 mr-1" />
                          Publish
                        </ModernButton>
                      )}
                    </div>
                  </div>
                </BentoCard>
              ))}

              {displayCourses.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Courses</h3>
                  <p className="text-gray-600">Create your first course</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Course Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Published Courses" value={displayCourses.filter(c => c.is_published).length.toString()} change={18.2} />
                <MiniKPI label="Featured Courses" value={displayCourses.filter(c => c.is_featured).length.toString()} change={12.5} />
                <MiniKPI label="Total Revenue" value={`$${displayCourses.reduce((sum, c) => sum + c.total_revenue, 0).toLocaleString()}`} change={42.1} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
