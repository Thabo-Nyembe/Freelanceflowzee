'use client'

import { useReducer, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, ChevronRight, Plus, Search, Users, Video, Clock, Calendar as CalendarIcon, Filter, MapPin, MoreVertical, MessageSquare, CheckCircle2, Globe } from 'lucide-react'

// Type Definitions
interface CalendarEvent {
  id: string;
  title: string;
  type: 'standup' | 'presentation' | 'deadline' | 'workshop' | 'meeting';
  date: Date;
  time: string;
  duration: number;
  attendees: string[];
  description: string;
  location: string;
  isRecurring?: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  status: 'available' | 'busy' | 'away' | 'offline';
  timezone: string;
  availableUntil: string;
  currentActivity: string;
}

interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  events: CalendarEvent[];
  teamMembers: TeamMember[];
  selectedEvent: CalendarEvent | null;
  showEventModal: boolean;
  showCreateEventModal: boolean;
  calendarView: 'month' | 'week' | 'day';
  filterType: 'all' | 'meeting' | 'presentation' | 'deadline' | 'standup' | 'workshop';
  searchQuery: string;
}

type CalendarAction =
  | { type: 'SET_CURRENT_DATE'; date: Date }
  | { type: 'SET_SELECTED_DATE'; date: Date | null }
  | { type: 'ADD_EVENT'; event: CalendarEvent }
  | { type: 'UPDATE_EVENT'; event: CalendarEvent }
  | { type: 'DELETE_EVENT'; eventId: string }
  | { type: 'SET_SELECTED_EVENT'; event: CalendarEvent | null }
  | { type: 'TOGGLE_EVENT_MODAL' }
  | { type: 'TOGGLE_CREATE_EVENT_MODAL' }
  | { type: 'SET_CALENDAR_VIEW'; view: 'month' | 'week' | 'day' }
  | { type: 'SET_FILTER_TYPE'; filterType: 'all' | 'meeting' | 'presentation' | 'deadline' | 'standup' | 'workshop' }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'UPDATE_TEAM_MEMBER_STATUS'; memberId: string; status: 'available' | 'busy' | 'away' | 'offline' }

// Mock Data
const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: undefined,
    status: 'available',
    timezone: 'EST',
    availableUntil: '6:00 PM',
    currentActivity: 'Working on brand identity'
  },
  {
    id: '2',
    name: 'Mike Chen',
    avatar: undefined,
    status: 'busy',
    timezone: 'PST',
    availableUntil: '4:30 PM',
    currentActivity: 'Client presentation'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    avatar: undefined,
    status: 'available',
    timezone: 'EST',
    availableUntil: '5:30 PM',
    currentActivity: 'Code review'
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: undefined,
    status: 'away',
    timezone: 'CST',
    availableUntil: '3:00 PM',
    currentActivity: 'Lunch break'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    avatar: undefined,
    status: 'available',
    timezone: 'EST',
    availableUntil: '7:00 PM',
    currentActivity: 'Design wireframes'
  }
]

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Weekly Team Standup',
    type: 'standup',
    date: new Date(),
    time: '10:00 AM',
    duration: 30,
    attendees: ['1', '2', '3', '4', '5'],
    description: 'Weekly progress updates and planning',
    location: 'Conference Room A',
    isRecurring: true
  },
  {
    id: '2',
    title: 'Client Brand Presentation',
    type: 'presentation',
    date: new Date(Date.now() + 86400000), // Tomorrow
    time: '2:00 PM',
    duration: 60,
    attendees: ['1', '2'],
    description: 'Present final brand identity designs to client',
    location: 'Virtual (Zoom)'
  },
  {
    id: '3',
    title: 'Project Deadline: Mobile App',
    type: 'deadline',
    date: new Date(Date.now() + 172800000), // Day after tomorrow
    time: '11:59 PM',
    duration: 0,
    attendees: ['3', '4'],
    description: 'Final submission for mobile app development',
    location: 'N/A'
  },
  {
    id: '4',
    title: 'Design Workshop',
    type: 'workshop',
    date: new Date(Date.now() + 259200000), // 3 days from now
    time: '1:00 PM',
    duration: 120,
    attendees: ['1', '2', '5'],
    description: 'Advanced Figma techniques workshop',
    location: 'Design Studio'
  }
]

// Calendar Reducer (following Context7 patterns)
function calendarReducer(state: CalendarState, action: CalendarAction): CalendarState {
  switch (action.type) {
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.date }
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.date }
    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.event] }
    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map(event => 
          event.id === action.event.id ? action.event : event
        )
      }
    case 'DELETE_EVENT':
      return {
        ...state,
        events: state.events.filter(event => event.id !== action.eventId)
      }
    case 'SET_SELECTED_EVENT':
      return { ...state, selectedEvent: action.event }
    case 'TOGGLE_EVENT_MODAL':
      return { ...state, showEventModal: !state.showEventModal }
    case 'TOGGLE_CREATE_EVENT_MODAL':
      return { ...state, showCreateEventModal: !state.showCreateEventModal }
    case 'SET_CALENDAR_VIEW':
      return { ...state, calendarView: action.view }
    case 'SET_FILTER_TYPE':
      return { ...state, filterType: action.filterType }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }
    case 'UPDATE_TEAM_MEMBER_STATUS':
      return {
        ...state,
        teamMembers: state.teamMembers.map(member =>
          member.id === action.memberId 
            ? { ...member, status: action.status }
            : member
        )
      }
    default:
      return state
  }
}

// Initial State
const initialState: CalendarState = {
  currentDate: new Date(),
  selectedDate: null,
  events: mockEvents,
  teamMembers: mockTeamMembers,
  selectedEvent: null,
  showEventModal: false,
  showCreateEventModal: false,
  calendarView: 'month',
  filterType: 'all',
  searchQuery: ''
}

export function SharedTeamCalendar() {
  const [state, dispatch] = useReducer(calendarReducer, initialState)
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'meeting' as const,
    date: '',
    time: '',
    duration: 60,
    attendees: [] as string[],
    description: '',
    location: ''
  })

  // Calendar Utilities
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => 
      event.date.toDateString() === date.toDateString() &&
      (state.filterType === 'all' || event.type === state.filterType) &&
      (state.searchQuery === '' || 
       event.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
       event.description.toLowerCase().includes(state.searchQuery.toLowerCase()))
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(state.currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    dispatch({ type: 'SET_CURRENT_DATE', date: newDate })
  }

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return

    const event: CalendarEvent = {
      id: Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      type: newEvent.type,
      date: new Date(newEvent.date),
      time: newEvent.time,
      duration: newEvent.duration,
      attendees: newEvent.attendees,
      description: newEvent.description,
      location: newEvent.location
    }

    dispatch({ type: 'ADD_EVENT', event })
    dispatch({ type: 'TOGGLE_CREATE_EVENT_MODAL' })
    
    // Reset form
    setNewEvent({
      title: '',
      type: 'meeting',
      date: '',
      time: '',
      duration: 60,
      attendees: [],
      description: '',
      location: ''
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500'
      case 'presentation': return 'bg-purple-500'
      case 'deadline': return 'bg-red-500'
      case 'standup': return 'bg-green-500'
      case 'workshop': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventTypeBadge = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'meeting': return 'default'
      case 'presentation': return 'secondary'
      case 'deadline': return 'destructive'
      case 'standup': return 'default'
      case 'workshop': return 'outline'
      default: return 'secondary'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500'
      case 'busy': return 'bg-red-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Shared Team Calendar</h2>
          <p className="text-gray-600">Coordinate schedules and manage team availability</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
              className="pl-9 w-64"
            />
          </div>
          <Select value={state.filterType} onValueChange={(value) => dispatch({ type: 'SET_FILTER_TYPE', filterType: value as CalendarState['filterType'] })}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="presentation">Presentations</SelectItem>
              <SelectItem value="deadline">Deadlines</SelectItem>
              <SelectItem value="standup">Standups</SelectItem>
              <SelectItem value="workshop">Workshops</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={state.showCreateEventModal} onOpenChange={() => dispatch({ type: 'TOGGLE_CREATE_EVENT_MODAL' })}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to add a new event to the team calendar.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-title">Event Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="e.g., Weekly Team Meeting"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-type">Type</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent({ ...newEvent, type: value as CalendarEvent['type'] })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="presentation">Presentation</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="standup">Standup</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event-duration">Duration (min)</Label>
                    <Input
                      id="event-duration"
                      type="number"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) })}
                      min="15"
                      step="15"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="event-date">Date</Label>
                    <Input
                      id="event-date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="event-time">Time</Label>
                    <Input
                      id="event-time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="event-location">Location (Optional)</Label>
                  <Input
                    id="event-location"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    placeholder="e.g., Conference Room A or Zoom"
                  />
                </div>
                <div>
                  <Label htmlFor="event-description">Description</Label>
                  <Textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Event details and agenda..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => dispatch({ type: 'TOGGLE_CREATE_EVENT_MODAL' })}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent}>Create Event</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {monthNames[state.currentDate.getMonth()]} {state.currentDate.getFullYear()}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={state.calendarView === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch({ type: 'SET_CALENDAR_VIEW', view: 'month' })}
                  >
                    Month
                  </Button>
                  <Button
                    variant={state.calendarView === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => dispatch({ type: 'SET_CALENDAR_VIEW', view: 'week' })}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {getDaysInMonth(state.currentDate).map((date, index) => {
                  const isToday = date && date.toDateString() === new Date().toDateString()
                  const isSelected = date && state.selectedDate && date.toDateString() === state.selectedDate.toDateString()
                  const eventsForDay = date ? getEventsForDate(date) : []
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-24 p-2 border border-gray-100 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${isToday ? 'bg-blue-50 border-blue-200' : ''} ${isSelected ? 'bg-indigo-50 border-indigo-200' : ''} ${!date ? 'bg-gray-50' : ''}`}
                      onClick={() => date && dispatch({ type: 'SET_SELECTED_DATE', date })}
                    >
                      {date && (
                        <>
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {date.getDate()}
                          </div>
                          <div className="space-y-1 mt-1">
                            {eventsForDay.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`w-full h-2 rounded-sm ${getEventTypeColor(event.type)} opacity-75`}
                                title={`${event.time} - ${event.title}`}
                              />
                            ))}
                            {eventsForDay.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{eventsForDay.length - 2} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Team Availability */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                Team Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.teamMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Globe className="w-3 h-3" />
                        <span>{member.timezone}</span>
                        {member.availableUntil && (
                          <>
                            <span>•</span>
                            <Clock className="w-3 h-3" />
                            <span>until {member.availableUntil}</span>
                          </>
                        )}
                      </div>
                      {member.currentActivity && (
                        <p className="text-xs text-gray-400 truncate">{member.currentActivity}</p>
                      )}
                    </div>
                    <Badge variant={member.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                      {member.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-green-600" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {state.events
                  .filter(event => event.date >= new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .slice(0, 4)
                  .map(event => (
                    <div 
                      key={event.id} 
                      className="p-3 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow cursor-pointer"
                      onClick={() => {
                        dispatch({ type: 'SET_SELECTED_EVENT', event })
                        dispatch({ type: 'TOGGLE_EVENT_MODAL' })
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant={getEventTypeBadge(event.type)} className="text-xs">
                              {event.type}
                            </Badge>
                            {event.isRecurring && (
                              <Badge variant="outline" className="text-xs">
                                Recurring
                              </Badge>
                            )}
                          </div>
                          <h4 className="font-medium text-sm text-gray-900 mb-1">{event.title}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>{event.date.toLocaleDateString()} at {event.time}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendees.length} attendees</span>
                            {event.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{event.duration}m</span>
                              </>
                            )}
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => dispatch({ type: 'TOGGLE_CREATE_EVENT_MODAL' })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Find Common Time
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Video className="w-4 h-4 mr-2" />
                  Start Video Call
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Team Message
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Stats */}
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="text-center">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">This Month</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-indigo-600">{state.events.length}</p>
                    <p className="text-xs text-gray-600">Total Events</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{state.teamMembers.filter(m => m.status === 'available').length}</p>
                    <p className="text-xs text-gray-600">Available Now</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-200">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Team productivity: 85%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Event Details Modal */}
      <Dialog open={state.showEventModal} onOpenChange={() => dispatch({ type: 'TOGGLE_EVENT_MODAL' })}>
        <DialogContent className="max-w-md">
          {state.selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{state.selectedEvent.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</DialogTitle>
                <DialogDescription>
                  {state.selectedEvent.title}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Badge variant={getEventTypeBadge(state.selectedEvent.type)}>
                    {state.selectedEvent.type}
                  </Badge>
                  {state.selectedEvent.isRecurring && (
                    <Badge variant="outline">Recurring</Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Duration: {state.selectedEvent.duration} minutes</span>
                  </div>
                  {state.selectedEvent.location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{state.selectedEvent.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{state.selectedEvent.attendees.length} attendees</span>
                  </div>
                </div>

                {state.selectedEvent.description && (
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-600">{state.selectedEvent.description}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-2">Attendees</h4>
                  <div className="flex -space-x-2">
                    {state.selectedEvent.attendees.slice(0, 5).map(attendeeId => {
                      const attendee = state.teamMembers.find(m => m.id === attendeeId)
                      return attendee ? (
                        <Avatar key={attendee.id} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={attendee.avatar} alt={attendee.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                            {attendee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ) : null
                    })}
                    {state.selectedEvent.attendees.length > 5 && (
                      <div className="h-8 w-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-gray-600">+{state.selectedEvent.attendees.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => dispatch({ type: 'TOGGLE_EVENT_MODAL' })}>
                  Close
                </Button>
                <Button>
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 