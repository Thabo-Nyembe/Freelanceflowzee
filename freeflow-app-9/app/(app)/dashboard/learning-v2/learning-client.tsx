'use client'

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  GraduationCap,
  BookOpen,
  Plus,
  Video,
  TrendingUp,
  Settings,
  Eye,
  Star,
  Clock,
  Users,
  Award,
  X,
  Loader2,
  Trash2,
  Play
} from 'lucide-react'

export interface Course {
  id: string
  title: string
  description: string | null
  instructor: string | null
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  format: 'video' | 'text' | 'interactive' | 'live' | 'mixed'
  status: 'draft' | 'published' | 'archived'
  category: string | null
  duration_minutes: number
  lessons_count: number
  total_enrolled: number
  completed_count: number
  average_rating: number
  total_reviews: number
  price: number
  certificate_available: boolean
  tags: string[]
}

export interface CourseStats {
  total: number
  published: number
  draft: number
  totalStudents: number
  completionRate: number
  avgRating: number
}

interface LearningClientProps {
  initialCourses: Course[]
  initialStats: CourseStats
}

export default function LearningClient({ initialCourses, initialStats }: LearningClientProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [stats] = useState<CourseStats>(initialStats)
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'all' | 'published' | 'popular' | 'beginner'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    level: 'beginner' as const,
    category: ''
  })

  const filteredCourses = courses.filter(course => {
    if (viewMode === 'all') return true
    if (viewMode === 'published') return course.status === 'published'
    if (viewMode === 'popular') return course.total_enrolled > 1000
    if (viewMode === 'beginner') return course.level === 'beginner'
    return true
  })

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) return
    setLoading(true)
    // In production, this would call a server action
    const newId = `course-${Date.now()}`
    const created: Course = {
      id: newId,
      ...newCourse,
      status: 'draft',
      format: 'video',
      duration_minutes: 0,
      lessons_count: 0,
      total_enrolled: 0,
      completed_count: 0,
      average_rating: 0,
      total_reviews: 0,
      price: 0,
      certificate_available: false,
      tags: []
    }
    setCourses(prev => [created, ...prev])
    setShowCreateModal(false)
    setNewCourse({ title: '', description: '', instructor: '', level: 'beginner', category: '' })
    setLoading(false)
  }

  const displayStats = [
    { label: 'Total Courses', value: stats.total.toString(), change: 18.5, icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Students', value: stats.totalStudents.toLocaleString(), change: 32.7, icon: <Users className="w-5 h-5" /> },
    { label: 'Completion', value: `${stats.completionRate}%`, change: 5.8, icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Avg Rating', value: stats.avgRating.toFixed(1), change: 3.2, icon: <Star className="w-5 h-5" /> }
  ]

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'intermediate': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      case 'advanced': return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      case 'archived': return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/30 to-cyan-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <GraduationCap className="w-10 h-10 text-emerald-600" />
              Learning
            </h1>
            <p className="text-muted-foreground">Manage courses and educational content</p>
          </div>
          <GradientButton from="emerald" to="teal" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Create Course
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={displayStats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Plus />} title="New Course" description="Create" onClick={() => setShowCreateModal(true)} />
          <BentoQuickAction icon={<Video />} title="Upload Content" description="Add videos" onClick={() => console.log('Upload')} />
          <BentoQuickAction icon={<TrendingUp />} title="Analytics" description="View stats" onClick={() => console.log('Analytics')} />
          <BentoQuickAction icon={<Settings />} title="Settings" description="Configure" onClick={() => console.log('Settings')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={viewMode === 'all' ? 'primary' : 'ghost'} onClick={() => setViewMode('all')}>All Courses</PillButton>
          <PillButton variant={viewMode === 'published' ? 'primary' : 'ghost'} onClick={() => setViewMode('published')}>Published</PillButton>
          <PillButton variant={viewMode === 'popular' ? 'primary' : 'ghost'} onClick={() => setViewMode('popular')}>Popular</PillButton>
          <PillButton variant={viewMode === 'beginner' ? 'primary' : 'ghost'} onClick={() => setViewMode('beginner')}>Beginner</PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {loading && courses.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No courses found</p>
                <ModernButton variant="outline" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Course
                </ModernButton>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <BentoCard key={course.id} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(course.status)}`}>{course.status}</span>
                            <span className={`text-xs px-2 py-1 rounded-md ${getLevelColor(course.level)}`}>{course.level}</span>
                            {course.certificate_available && (
                              <span className="text-xs px-2 py-1 rounded-md bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300 flex items-center gap-1">
                                <Award className="w-3 h-3" />Certificate
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{course.description || 'No description'}</p>
                          {course.instructor && <p className="text-xs text-muted-foreground mt-1">By {course.instructor}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-xs">
                        <div><span className="text-muted-foreground">Duration</span><p className="font-semibold">{formatDuration(course.duration_minutes)}</p></div>
                        <div><span className="text-muted-foreground">Lessons</span><p className="font-semibold">{course.lessons_count}</p></div>
                        <div><span className="text-muted-foreground">Students</span><p className="font-semibold">{course.total_enrolled.toLocaleString()}</p></div>
                        <div><span className="text-muted-foreground">Price</span><p className="font-semibold">${course.price}</p></div>
                      </div>

                      {course.total_reviews > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(course.average_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold">{course.average_rating}</span>
                          <span className="text-sm text-muted-foreground">({course.total_reviews} reviews)</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-3 border-t">
                        <ModernButton variant="outline" size="sm" onClick={() => console.log('Edit', course.id)}>
                          <Eye className="w-3 h-3 mr-1" />View
                        </ModernButton>
                        {course.status === 'draft' && (
                          <ModernButton variant="primary" size="sm" onClick={() => console.log('Publish', course.id)}>
                            <Play className="w-3 h-3 mr-1" />Publish
                          </ModernButton>
                        )}
                        <ModernButton variant="outline" size="sm" onClick={() => setCourses(prev => prev.filter(c => c.id !== course.id))}>
                          <Trash2 className="w-3 h-3" />
                        </ModernButton>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Course Levels</h3>
              <div className="space-y-3">
                {['beginner', 'intermediate', 'advanced', 'expert'].map(level => {
                  const count = courses.filter(c => c.level === level).length
                  const percentage = courses.length > 0 ? Math.round((count / courses.length) * 100) : 0
                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{level}</span>
                        <span className="font-semibold">{count}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${getLevelColor(level).replace('text-', 'bg-').split(' ')[0]} rounded-full`} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <MiniKPI label="Published" value={stats.published.toString()} change={18.5} />
                <MiniKPI label="Draft" value={stats.draft.toString()} change={8.3} />
                <MiniKPI label="Completion Rate" value={`${stats.completionRate}%`} change={5.8} />
                <MiniKPI label="Avg Rating" value={stats.avgRating.toFixed(1)} change={3.2} />
              </div>
            </BentoCard>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Create Course</h2>
              <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Instructor</label>
                  <input
                    type="text"
                    value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <ModernButton variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</ModernButton>
                <GradientButton from="emerald" to="teal" className="flex-1" onClick={handleCreateCourse} disabled={loading || !newCourse.title.trim()}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Course'}
                </GradientButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
