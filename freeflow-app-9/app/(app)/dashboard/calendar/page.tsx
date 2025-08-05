'use client';

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Users, 
  Video, 
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const events = [
    {
      id: 1,
      title: 'Client Meeting - Acme Corp',
      time: '09:00 AM',
      duration: '1 hour',
      type: 'meeting',
      location: 'Video Call',
      attendees: 3,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Design Review Session',
      time: '02:00 PM',
      duration: '2 hours',
      type: 'review',
      location: 'Conference Room A',
      attendees: 5,
      color: 'green'
    },
    {
      id: 3,
      title: 'Project Deadline',
      time: '11:59 PM',
      duration: 'All day',
      type: 'deadline',
      location: 'Remote',
      attendees: 1,
      color: 'red'
    }
  ]

  const upcomingEvents = [
    {
      id: 4,
      title: 'Weekly Team Standup',
      date: 'Tomorrow',
      time: '10:00 AM',
      type: 'meeting'
    },
    {
      id: 5,
      title: 'Client Presentation',
      date: 'Friday',
      time: '03:00 PM',
      type: 'presentation'
    }
  ]

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear()
  }

  return (
    <div className="min-h-screen kazi-bg-light dark:kazi-bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold kazi-text-dark dark:kazi-text-light mb-2 kazi-headline">
                Calendar
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 kazi-body">
                Manage your schedule and appointments
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="kazi-focus">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="btn-kazi-primary kazi-ripple">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <Card className="kazi-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      className="kazi-focus"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-bold kazi-headline">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      className="kazi-focus"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Tabs value={view} onValueChange={setView}>
                      <TabsList>
                        <TabsTrigger value="month">Month</TabsTrigger>
                        <TabsTrigger value="week">Week</TabsTrigger>
                        <TabsTrigger value="day">Day</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {view === 'month' && (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-gray-500 kazi-body-medium">
                        {day}
                      </div>
                    ))}
                    
                    {/* Calendar days */}
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`
                          p-2 h-24 border border-gray-100 dark:border-gray-700 relative cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                          ${day === null ? 'bg-gray-50 dark:bg-gray-900' : ''}
                          ${isToday(day || 0) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'kazi-text-dark dark:kazi-text-light'}`}>
                              {day}
                            </span>
                            {/* Sample events on specific days */}
                            {day === 15 && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded truncate">
                                  Client Meeting
                                </div>
                              </div>
                            )}
                            {day === 20 && (
                              <div className="mt-1 space-y-1">
                                <div className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded truncate">
                                  Design Review
                                </div>
                                <div className="text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded truncate">
                                  Deadline
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {view === 'week' && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Week View</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Weekly calendar view coming soon
                    </p>
                  </div>
                )}

                {view === 'day' && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Day View</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Daily schedule view coming soon
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Events */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Today&apos;s Events</CardTitle>
                <CardDescription className="kazi-body">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1 bg-${event.color}-500`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium kazi-text-dark dark:kazi-text-light kazi-body-medium truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-1">
                        {event.location.includes('Video') ? (
                          <Video className="w-3 h-3" />
                        ) : (
                          <MapPin className="w-3 h-3" />
                        )}
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                    <div>
                      <h4 className="font-medium kazi-text-dark dark:kazi-text-light kazi-body-medium">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {event.date} at {event.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="kazi-card">
              <CardHeader>
                <CardTitle className="kazi-headline">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Team Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Calendar Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}