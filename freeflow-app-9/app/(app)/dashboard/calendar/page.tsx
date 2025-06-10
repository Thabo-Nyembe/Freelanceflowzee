'use client'

import { useState } from 'react'
import { 
  Calendar as CalendarIcon, Plus, Clock, Video, Phone, MapPin, 
  User, Users, Filter, Search, ChevronLeft, ChevronRight,
  Edit3, Trash2, Copy, MoreHorizontal, Star, AlertCircle,
  FileText, DollarSign, CheckCircle, X, Settings
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CalendarEvent {
  id: string
  title: string
  type: 'meeting' | 'deadline' | 'call' | 'project' | 'personal'
  date: string
  time: string
  duration: string
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  client?: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  location?: string
  meetingLink?: string
  amount?: number
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Client Discovery Call',
      type: 'call',
      date: '2024-06-15',
      time: '10:00',
      duration: '1h',
      status: 'confirmed',
      client: 'TechCorp Solutions',
      description: 'Initial project discussion for website redesign',
      priority: 'high',
      meetingLink: 'https://meet.google.com/abc-def-ghi',
      amount: 500
    },
    {
      id: '2',
      title: 'Design Review Meeting',
      type: 'meeting',
      date: '2024-06-15',
      time: '14:30',
      duration: '45m',
      status: 'scheduled',
      client: 'Fashion Forward Inc.',
      description: 'Review mobile app wireframes and get client feedback',
      priority: 'medium',
      location: 'Client Office',
      amount: 300
    },
    {
      id: '3',
      title: 'Project Deadline - Logo Design',
      type: 'deadline',
      date: '2024-06-16',
      time: '23:59',
      duration: '',
      status: 'scheduled',
      client: 'Startup Ventures',
      description: 'Final logo concepts delivery',
      priority: 'high',
      amount: 1200
    },
    {
      id: '4',
      title: 'Team Standup',
      type: 'meeting',
      date: '2024-06-17',
      time: '09:00',
      duration: '30m',
      status: 'scheduled',
      description: 'Weekly team sync and project updates',
      priority: 'medium',
      meetingLink: 'https://zoom.us/j/123456789'
    },
    {
      id: '5',
      title: 'Personal - Gym Session',
      type: 'personal',
      date: '2024-06-18',
      time: '07:00',
      duration: '1h',
      status: 'scheduled',
      description: 'Morning workout routine',
      priority: 'low'
    }
  ])

  const getEventTypeColor = (type: string) => {
    const colors = {
      meeting: 'bg-blue-100 text-blue-700 border-blue-200',
      deadline: 'bg-red-100 text-red-700 border-red-200',
      call: 'bg-green-100 text-green-700 border-green-200',
      project: 'bg-purple-100 text-purple-700 border-purple-200',
      personal: 'bg-gray-100 text-gray-700 border-gray-200'
    }
    return colors[type as keyof typeof colors] || colors.meeting
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const getEventsForDate = (date: string) => {
    return events.filter(event => event.date === date)
  }

  const todayEvents = events.filter(event => event.date === new Date().toISOString().split('T')[0])
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar & Scheduling</h1>
          <p className="text-gray-600 mt-1">Manage your time and schedule efficiently</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button className="gap-2" onClick={() => setShowEventModal(true)}>
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
                <p className="text-sm text-gray-500">Today's Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                <p className="text-sm text-gray-500">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${events.filter(e => e.amount).reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">This Month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.priority === 'high').length}
                </p>
                <p className="text-sm text-gray-500">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-semibold">{formatDate(currentDate)}</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-24 p-1"></div>
                ))}
                
                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, index) => {
                  const day = index + 1
                  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const dayEvents = getEventsForDate(dateString)
                  const isToday = dateString === new Date().toISOString().split('T')[0]
                  
                  return (
                    <div
                      key={day}
                      className={`h-24 p-1 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 ${
                        isToday ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedDate(new Date(dateString))}
                    >
                      <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No events today</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(event.priority)}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.time} • {event.duration}</p>
                        {event.client && (
                          <p className="text-xs text-gray-400">{event.client}</p>
                        )}
                      </div>
                      <Badge variant="outline" className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-2 border rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(event.priority)}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{event.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.date).toLocaleDateString()} • {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Video className="h-4 w-4" />
                Schedule Video Call
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Phone className="h-4 w-4" />
                Schedule Phone Call
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Schedule Meeting
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <FileText className="h-4 w-4" />
                Set Deadline
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal Placeholder */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>New Event</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEventModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input placeholder="Enter event title" />
              </div>
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="call">Call</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEventModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEventModal(false)}>
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
