'use client';

import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { format, addMonths, subMonths } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Filter,
  Search,
  Brain
} from 'lucide-react'

// ============================================================================
// FRAMER MOTION COMPONENTS
// ============================================================================

const FloatingParticle = ({ delay = 0, color = 'blue' }: { delay?: number; color?: string }) => {
  return (
    <motion.div
      className={`absolute w-2 h-2 bg-${color}-400 rounded-full opacity-30`}
      animate={{
        y: [0, -30, 0],
        x: [0, 15, -15, 0],
        scale: [0.8, 1.2, 0.8],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{
        duration: 4 + delay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay
      }}
    />
  )
}

const TextShimmer = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }}
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.4), transparent)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// CALENDAR DATA MODEL
// ============================================================================

const KAZI_CALENDAR_DATA = {
  metrics: {
    totalMeetings: 342,
    monthlyMeetings: 47,
    averageMeetingDuration: 45,
    meetingEfficiencyScore: 87.3,
    noShowRate: 2.1,
    clientSatisfactionScore: 9.4,
    timeUtilization: 78.9,
    productivityIndex: 92.6
  },

  aiInsights: [
    {
      id: 'ai-insight-1',
      type: 'optimization',
      title: 'Meeting Cluster Detected',
      description: 'You have 3 meetings within 2 hours on Thursday',
      impact: 'high',
      confidence: 94,
      actionable: true,
      suggestion: 'Consider consolidating or rescheduling'
    },
    {
      id: 'ai-insight-2',
      type: 'productivity',
      title: 'Peak Productivity Hours',
      description: 'Your most productive meetings are 9-11 AM',
      impact: 'medium',
      confidence: 89,
      actionable: true,
      suggestion: 'Schedule important meetings in this window'
    }
  ]
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [aiMode, setAiMode] = useState(false)

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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const isToday = (day: number) => {
    const today = new Date()
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear()
  }

  // ============================================================================
  // HANDLER 1: NAVIGATE MONTH
  // ============================================================================

  const navigateMonth = (direction: 'prev' | 'next') => {
    const oldMonth = format(currentDate, 'MMMM yyyy')

    console.log('📅 NAVIGATING CALENDAR MONTH')
    console.log('⏪ Direction:', direction === 'prev' ? 'Previous' : 'Next')
    console.log('📊 Current month:', oldMonth)
    console.log('📅 Current view:', view)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('🔍 Search term:', searchTerm || '(none)')

    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1)
    const newMonth = format(newDate, 'MMMM yyyy')

    console.log('⏩ New month:', newMonth)
    console.log('✅ MONTH NAVIGATION COMPLETE')
    console.log('🏁 CALENDAR UPDATED')

    setCurrentDate(newDate)

    toast.success(`Navigated to ${newMonth}`, {
      description: `Viewing ${view} view`
    })
  }

  // ============================================================================
  // HANDLER 2: SEARCH EVENTS
  // ============================================================================

  const handleSearchEvents = (newSearch: string) => {
    const previousSearch = searchTerm

    console.log('🔍 SEARCHING CALENDAR EVENTS')
    console.log('⏪ Previous search:', previousSearch || '(empty)')
    console.log('⏩ New search:', newSearch || '(empty)')
    console.log('📊 Search length:', newSearch.length, 'characters')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)

    if (newSearch.length === 0) {
      console.log('🧹 SEARCH CLEARED - Showing all events')
    } else if (newSearch.length >= 2) {
      console.log('✅ SEARCH ACTIVE - Filtering events')
      console.log('🔎 Searching for:', newSearch)
    }

    console.log('🏁 SEARCH UPDATE COMPLETE')

    setSearchTerm(newSearch)
  }

  // ============================================================================
  // HANDLER 3: AI MODE TOGGLE
  // ============================================================================

  const handleAiModeToggle = () => {
    const previousState = aiMode
    const newState = !aiMode

    console.log('🤖 AI MODE TOGGLE')
    console.log('⏪ Previous state:', previousState ? 'ENABLED' : 'DISABLED')
    console.log('⏩ New state:', newState ? 'ENABLED' : 'DISABLED')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)

    if (newState) {
      console.log('✨ AI FEATURES ENABLED:')
      console.log('  - Smart scheduling suggestions')
      console.log('  - Meeting time optimization')
      console.log('  - Conflict detection')
      console.log('  - AI-powered insights')
    } else {
      console.log('⚠️ AI FEATURES DISABLED')
      console.log('  - Switching to standard calendar')
    }

    console.log('✅ AI MODE UPDATED')
    console.log('🏁 AI MODE TOGGLE COMPLETE')

    setAiMode(newState)

    toast.success(newState ? 'AI Mode Enabled' : 'AI Mode Disabled', {
      description: newState ? 'Smart scheduling features activated' : 'Switched to standard calendar'
    })
  }

  // ============================================================================
  // HANDLER 4: CREATE EVENT
  // ============================================================================

  const handleCreateEvent = async () => {
    console.log('➕ CREATING NEW EVENT')
    console.log('📅 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('📅 Current view:', view)
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('✅ CREATE EVENT MODAL OPENED')
    console.log('🏁 CREATE EVENT PROCESS INITIATED')

    const title = prompt('Enter event title:')
    if (!title) {
      console.log('❌ CREATE EVENT CANCELLED')
      return
    }

    const time = prompt('Enter start time (e.g., 2025-02-01T09:00:00):')
    if (!time) {
      console.log('❌ CREATE EVENT CANCELLED')
      return
    }

    console.log('📝 Event title:', title)
    console.log('⏰ Event time:', time)

    try {
      console.log('📡 SENDING EVENT TO API')
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            title,
            description: 'New calendar event',
            startTime: time,
            endTime: new Date(new Date(time).getTime() + 60 * 60 * 1000).toISOString(),
            type: 'meeting',
            location: { type: 'virtual', details: 'Online' },
            priority: 'medium'
          }
        })
      })

      console.log('📡 API RESPONSE STATUS:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error('Failed to create event')
      }

      const result = await response.json()

      if (result.success) {
        console.log('✅ EVENT CREATED SUCCESSFULLY')
        console.log('🏁 CREATE EVENT PROCESS COMPLETE')

        toast.success(result.message, {
          description: result.hasConflict ? '⚠️ Calendar conflict detected' : 'Event added to calendar'
        })
      }
    } catch (error: any) {
      console.error('❌ CREATE EVENT ERROR:', error)
      console.log('📊 Error details:', error.message || 'Unknown error')
      toast.error('Failed to create event', {
        description: error.message || 'Please try again later'
      })
    }
  }

  // ============================================================================
  // HANDLER 5: VIEW CHANGE
  // ============================================================================

  const handleViewChange = (newView: 'month' | 'week' | 'day') => {
    const previousView = view

    console.log('📅 CALENDAR VIEW CHANGED')
    console.log('⏪ Previous view:', previousView)
    console.log('⏩ New view:', newView)
    console.log('📊 Current month:', format(currentDate, 'MMMM yyyy'))
    console.log('🤖 AI mode:', aiMode ? 'enabled' : 'disabled')
    console.log('✅ VIEW UPDATED')
    console.log('🏁 VIEW CHANGE COMPLETE')

    setView(newView)

    toast.success(`Switched to ${newView} view`, {
      description: `Viewing ${format(currentDate, 'MMMM yyyy')}`
    })
  }

  // ============================================================================
  // ADDITIONAL HANDLERS (keeping existing functionality)
  // ============================================================================

  const handleEditEvent = (eventId: number) => {
    console.log('✏️ EDIT EVENT - ID:', eventId)
    toast.info('Edit event feature', {
      description: 'Modify event details and settings'
    })
  }

  const handleDeleteEvent = async (eventId: number) => {
    console.log('🗑️ DELETE EVENT - ID:', eventId)

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          eventId: eventId.toString()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || 'Event deleted successfully')
      }
    } catch (error: any) {
      console.error('Delete Event Error:', error)
      toast.error('Failed to delete event', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleScheduleWithAI = async () => {
    console.log('🤖 AI SCHEDULING')

    try {
      const response = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          data: {
            title: 'New Meeting',
            duration: 60,
            attendees: []
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get AI suggestions')
      }

      const result = await response.json()

      if (result.success && result.suggestions) {
        toast.success(result.message || 'AI scheduling suggestions ready!', {
          description: `Found ${result.suggestions.length} optimal time slots`
        })
      }
    } catch (error: any) {
      console.error('AI Scheduling Error:', error)
      toast.error('Failed to generate AI suggestions', {
        description: error.message || 'Please try again later'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="relative">
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingParticle delay={0} color="blue" />
                <FloatingParticle delay={1} color="indigo" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 relative z-10">
                Calendar
              </h1>
              <p className="text-lg text-gray-600">
                Manage your schedule and appointments
              </p>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => handleSearchEvents(e.target.value)}
                  className="pl-10 w-80"
                  data-testid="search-events-input"
                />
              </div>
              <Button
                variant={aiMode ? 'default' : 'outline'}
                onClick={handleAiModeToggle}
                className={aiMode ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
                data-testid="ai-mode-toggle-btn"
              >
                <Brain className="w-4 h-4 mr-2" />
                AI Mode
              </Button>
              <Button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                data-testid="create-event-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        {aiMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KAZI_CALENDAR_DATA.aiInsights.map((insight) => (
                  <div key={insight.id} className="p-4 bg-white rounded-lg border border-purple-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-purple-900">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <p className="text-sm text-purple-600 font-medium">{insight.suggestion}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('prev')}
                      data-testid="prev-month-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-2xl font-bold">
                      <TextShimmer>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                      </TextShimmer>
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateMonth('next')}
                      data-testid="next-month-btn"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Tabs value={view} onValueChange={(v) => handleViewChange(v as 'month' | 'week' | 'day')}>
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-7 gap-1"
                  >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-2 text-center font-medium text-gray-500">
                        {day}
                      </div>
                    ))}

                    {generateCalendarDays().map((day, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.01 }}
                        className={`
                          p-2 h-24 border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors
                          ${day === null ? 'bg-gray-50' : ''}
                          ${isToday(day || 0) ? 'bg-blue-50 border-blue-200' : ''}
                        `}
                      >
                        {day && (
                          <>
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-blue-600' : 'text-gray-900'}`}>
                              {day}
                            </span>
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
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {view === 'week' && (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Week View</h3>
                    <p className="text-gray-600">
                      Weekly calendar view coming soon
                    </p>
                  </div>
                )}

                {view === 'day' && (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Day View</h3>
                    <p className="text-gray-600">
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
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Today&apos;s Events</CardTitle>
                <CardDescription>
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                    <div className={`w-3 h-3 rounded-full mt-1 bg-${event.color}-500`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{event.time}</span>
                        <span>•</span>
                        <span>{event.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
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
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600">
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
            <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" onClick={handleScheduleWithAI}>
                  <Brain className="w-4 h-4 mr-2" />
                  AI Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="w-4 h-4 mr-2" />
                  Team Calendar
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </CardContent>
            </Card>

            {/* Meeting Metrics */}
            {aiMode && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                  <CardHeader>
                    <CardTitle className="text-purple-900">Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Meetings</span>
                      <span className="font-bold text-purple-900">{KAZI_CALENDAR_DATA.metrics.totalMeetings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-bold text-purple-900">{KAZI_CALENDAR_DATA.metrics.monthlyMeetings}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Efficiency</span>
                      <span className="font-bold text-purple-900">{KAZI_CALENDAR_DATA.metrics.meetingEfficiencyScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Satisfaction</span>
                      <span className="font-bold text-purple-900">{KAZI_CALENDAR_DATA.metrics.clientSatisfactionScore}/10</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
