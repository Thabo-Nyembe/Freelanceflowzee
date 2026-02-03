'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { BookOpen, Play, CheckCircle, Clock, Award, Users, TrendingUp, Star } from 'lucide-react'

const courses = [
  { id: 1, title: 'React Advanced Patterns', category: 'Development', duration: '8 hours', enrolled: 45, completed: 32, rating: 4.8, instructor: 'John Smith', level: 'Advanced' },
  { id: 2, title: 'Leadership Fundamentals', category: 'Management', duration: '6 hours', enrolled: 62, completed: 48, rating: 4.6, instructor: 'Sarah Wilson', level: 'Intermediate' },
  { id: 3, title: 'Data Analytics Bootcamp', category: 'Analytics', duration: '12 hours', enrolled: 38, completed: 15, rating: 4.9, instructor: 'Mike Chen', level: 'Beginner' },
  { id: 4, title: 'Cybersecurity Essentials', category: 'Security', duration: '10 hours', enrolled: 28, completed: 20, rating: 4.7, instructor: 'Alex Johnson', level: 'Intermediate' },
  { id: 5, title: 'Agile Project Management', category: 'Management', duration: '5 hours', enrolled: 55, completed: 42, rating: 4.5, instructor: 'Emma Davis', level: 'Beginner' },
  { id: 6, title: 'UI/UX Design Principles', category: 'Design', duration: '7 hours', enrolled: 40, completed: 28, rating: 4.8, instructor: 'Lisa Brown', level: 'Intermediate' },
]

const employeeProgress = [
  { name: 'Sarah Mitchell', courses: 5, completed: 4, inProgress: 1, hours: 32, certificates: 4 },
  { name: 'Michael Chen', courses: 3, completed: 2, inProgress: 1, hours: 18, certificates: 2 },
  { name: 'Emily Rodriguez', courses: 6, completed: 5, inProgress: 1, hours: 42, certificates: 5 },
  { name: 'David Park', courses: 4, completed: 3, inProgress: 1, hours: 24, certificates: 3 },
]

const upcomingTraining = [
  { title: 'Cloud Architecture Workshop', date: '2024-03-15', instructor: 'James Wilson', seats: 20, enrolled: 15 },
  { title: 'Advanced SQL Techniques', date: '2024-03-20', instructor: 'Maria Garcia', seats: 25, enrolled: 18 },
  { title: 'Product Strategy Masterclass', date: '2024-03-25', instructor: 'Robert Taylor', seats: 30, enrolled: 22 },
]

const categories = [
  { name: 'Development', courses: 24, color: 'bg-blue-100 text-blue-700' },
  { name: 'Management', courses: 18, color: 'bg-purple-100 text-purple-700' },
  { name: 'Design', courses: 15, color: 'bg-pink-100 text-pink-700' },
  { name: 'Analytics', courses: 12, color: 'bg-green-100 text-green-700' },
  { name: 'Security', courses: 10, color: 'bg-red-100 text-red-700' },
]

export default function TrainingClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    totalCourses: courses.length,
    totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
    totalCompleted: courses.reduce((sum, c) => sum + c.completed, 0),
    avgRating: (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1),
  }), [])

  const getLevelBadge = (level: string) => {
    const styles: Record<string, string> = {
      'Beginner': 'bg-green-100 text-green-700',
      'Intermediate': 'bg-blue-100 text-blue-700',
      'Advanced': 'bg-purple-100 text-purple-700',
    }
    return <Badge className={styles[level]}>{level}</Badge>
  }

  const filteredCourses = useMemo(() =>
    courses.filter(c =>
      (categoryFilter === 'all' || c.category === categoryFilter) &&
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery, categoryFilter])

  const insights = [
    { icon: BookOpen, title: `${stats.totalCourses}`, description: 'Total courses' },
    { icon: Users, title: `${stats.totalEnrolled}`, description: 'Enrollments' },
    { icon: CheckCircle, title: `${stats.totalCompleted}`, description: 'Completed' },
    { icon: Star, title: `${stats.avgRating}`, description: 'Avg rating' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><BookOpen className="h-8 w-8 text-primary" />Training & Development</h1>
          <p className="text-muted-foreground mt-1">Manage employee training and courses</p>
        </div>
        <Button><Play className="h-4 w-4 mr-2" />Create Course</Button>
      </div>

      <CollapsibleInsightsPanel title="Training Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.courses}</p>
              <p className="text-xs text-muted-foreground">Courses</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses">
        <TabsList>
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="progress">Employee Progress</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <select
              className="border rounded-md px-3 py-2"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                    </div>
                    {getLevelBadge(course.level)}
                  </div>

                  <Badge variant="outline" className="mb-3">{course.category}</Badge>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span className="font-medium">{course.enrolled} students</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">{course.completed} students</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Rating:</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{course.rating}</span>
                      </div>
                    </div>
                  </div>

                  <Progress value={(course.completed / course.enrolled) * 100} className="h-2 mb-3" />

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">View Course</Button>
                    <Button size="sm" variant="outline" className="flex-1">Enroll</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Training Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employeeProgress.map((employee, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{employee.name}</h4>
                      <Badge><Award className="h-3 w-3 mr-1" />{employee.certificates} certificates</Badge>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Enrolled</p>
                        <p className="font-medium text-lg">{employee.courses}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed</p>
                        <p className="font-medium text-lg text-green-600">{employee.completed}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">In Progress</p>
                        <p className="font-medium text-lg text-blue-600">{employee.inProgress}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Hours</p>
                        <p className="font-medium text-lg">{employee.hours}h</p>
                      </div>
                    </div>

                    <Progress value={(employee.completed / employee.courses) * 100} className="h-2 mt-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Training Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingTraining.map((training, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{training.title}</h4>
                        <p className="text-sm text-muted-foreground">Instructor: {training.instructor}</p>
                      </div>
                      <Badge variant="outline">{training.date}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Seats: </span>
                        <span className="font-medium">{training.enrolled}/{training.seats}</span>
                      </div>
                      <Progress value={(training.enrolled / training.seats) * 100} className="h-2 w-32" />
                    </div>

                    <Button size="sm" className="w-full mt-3">Register</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
