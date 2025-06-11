'use client'

import React, { useReducer, useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  Zap,
  Globe,
  Users,
  Star,
  FileText,
  Link,
  Copy,
  Share2,
  MoreHorizontal,
  CalendarDays,
  Timer,
  DollarSign,
  Award,
  Target,
  TrendingUp,
  BarChart,
  PieChart,
  Activity,
  Bookmark,
  Bell,
  Filter,
  Search,
  Download,
  Upload,
  Archive,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Send
} from 'lucide-react'

// Context7 useReducer Pattern for Booking State Management
type BookingSlot = {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  available: boolean
  price?: number
  serviceType: string
  location: 'online' | 'office' | 'client'
  maxAttendees: number
  currentAttendees: number
  timezone: string
}

type BookingService = {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  color: string
  requirements: string[]
  deliverables: string[]
  isActive: boolean
  popularity: number
  rating: number
  bookingCount: number
}

type BookingRequest = {
  id: string
  clientName: string
  clientEmail: string
  clientPhone?: string
  serviceId: string
  slotId: string
  message: string
  requirements: string[]
  budget?: number
  timeline: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  confirmedAt?: string
  meetingLink?: string
  notes: string
  paymentStatus: 'pending' | 'paid' | 'refunded'
  paymentAmount: number
}

type CalendarView = 'month' | 'week' | 'day' | 'list'

type BookingState = {
  services: BookingService[]
  slots: BookingSlot[]
  requests: BookingRequest[]
  selectedDate: Date
  selectedService: BookingService | null
  selectedSlot: BookingSlot | null
  calendarView: CalendarView
  currentMonth: Date
  availability: {
    [key: string]: BookingSlot[]
  }
  bookingForm: {
    clientName: string
    clientEmail: string
    clientPhone: string
    message: string
    requirements: string[]
    budget: number | null
    timeline: string
  }
  filters: {
    serviceType: string[]
    status: string[]
    dateRange: { start: string; end: string } | null
    priceRange: { min: number; max: number } | null
  }
  showBookingDialog: boolean
  showServiceDialog: boolean
  showAnalytics: boolean
  loading: boolean
  error: string | null
}

type BookingAction = 
  | { type: 'SET_SERVICES'; payload: BookingService[] }
  | { type: 'SET_SLOTS'; payload: BookingSlot[] }
  | { type: 'SET_REQUESTS'; payload: BookingRequest[] }
  | { type: 'SELECT_DATE'; payload: Date }
  | { type: 'SELECT_SERVICE'; payload: BookingService | null }
  | { type: 'SELECT_SLOT'; payload: BookingSlot | null }
  | { type: 'SET_CALENDAR_VIEW'; payload: CalendarView }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'UPDATE_BOOKING_FORM'; payload: Partial<BookingState['bookingForm']> }
  | { type: 'SET_FILTERS'; payload: Partial<BookingState['filters']> }
  | { type: 'TOGGLE_BOOKING_DIALOG'; payload?: boolean }
  | { type: 'TOGGLE_SERVICE_DIALOG'; payload?: boolean }
  | { type: 'TOGGLE_ANALYTICS'; payload?: boolean }
  | { type: 'UPDATE_REQUEST_STATUS'; payload: { id: string; status: BookingRequest['status'] } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_FORM' }

const initialBookingForm = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  message: '',
  requirements: [],
  budget: null,
  timeline: ''
}

const initialState: BookingState = {
  services: [],
  slots: [],
  requests: [],
  selectedDate: new Date(),
  selectedService: null,
  selectedSlot: null,
  calendarView: 'month',
  currentMonth: new Date(),
  availability: {},
  bookingForm: initialBookingForm,
  filters: {
    serviceType: [],
    status: [],
    dateRange: null,
    priceRange: null
  },
  showBookingDialog: false,
  showServiceDialog: false,
  showAnalytics: false,
  loading: false,
  error: null
}

// Context7 Reducer Implementation
function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_SERVICES':
      return { ...state, services: action.payload, loading: false }
    
    case 'SET_SLOTS':
      return { ...state, slots: action.payload, loading: false }
    
    case 'SET_REQUESTS':
      return { ...state, requests: action.payload, loading: false }
    
    case 'SELECT_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'SELECT_SERVICE':
      return { ...state, selectedService: action.payload }
    
    case 'SELECT_SLOT':
      return { ...state, selectedSlot: action.payload }
    
    case 'SET_CALENDAR_VIEW':
      return { ...state, calendarView: action.payload }
    
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload }
    
    case 'UPDATE_BOOKING_FORM':
      return { 
        ...state, 
        bookingForm: { ...state.bookingForm, ...action.payload } 
      }
    
    case 'SET_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload } 
      }
    
    case 'TOGGLE_BOOKING_DIALOG':
      return { 
        ...state, 
        showBookingDialog: action.payload !== undefined ? action.payload : !state.showBookingDialog 
      }
    
    case 'TOGGLE_SERVICE_DIALOG':
      return { 
        ...state, 
        showServiceDialog: action.payload !== undefined ? action.payload : !state.showServiceDialog 
      }
    
    case 'TOGGLE_ANALYTICS':
      return { 
        ...state, 
        showAnalytics: action.payload !== undefined ? action.payload : !state.showAnalytics 
      }
    
    case 'UPDATE_REQUEST_STATUS':
      return {
        ...state,
        requests: state.requests.map(request =>
          request.id === action.payload.id
            ? { ...request, status: action.payload.status }
            : request
        )
      }
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'RESET_FORM':
      return { ...state, bookingForm: initialBookingForm }
    
    default:
      return state
  }
}

// Mock Data - Booking Services
const mockServices: BookingService[] = [
  {
    id: 'service_1',
    name: 'Brand Identity Consultation',
    description: 'Comprehensive brand strategy and visual identity development session',
    duration: 90,
    price: 300,
    category: 'Branding',
    color: 'from-rose-500 to-pink-600',
    requirements: ['Brand brief', 'Target audience info', 'Competitor analysis'],
    deliverables: ['Brand strategy document', 'Visual direction', 'Next steps plan'],
    isActive: true,
    popularity: 95,
    rating: 4.9,
    bookingCount: 156
  },
  {
    id: 'service_2',
    name: 'Website Design Review',
    description: 'In-depth analysis and feedback on your website design and user experience',
    duration: 60,
    price: 200,
    category: 'Web Design',
    color: 'from-blue-500 to-indigo-600',
    requirements: ['Current website URL', 'Business goals', 'Target metrics'],
    deliverables: ['Detailed audit report', 'Improvement recommendations', 'Priority action items'],
    isActive: true,
    popularity: 87,
    rating: 4.8,
    bookingCount: 203
  },
  {
    id: 'service_3',
    name: 'Project Kickoff Meeting',
    description: 'Strategic planning session to align goals and establish project framework',
    duration: 120,
    price: 400,
    category: 'Project Management',
    color: 'from-green-500 to-emerald-600',
    requirements: ['Project scope document', 'Timeline requirements', 'Budget parameters'],
    deliverables: ['Project roadmap', 'Milestone timeline', 'Communication plan'],
    isActive: true,
    popularity: 92,
    rating: 4.9,
    bookingCount: 89
  },
  {
    id: 'service_4',
    name: 'Design Mentorship Session',
    description: 'One-on-one guidance for design professionals and aspiring designers',
    duration: 45,
    price: 150,
    category: 'Mentorship',
    color: 'from-purple-500 to-violet-600',
    requirements: ['Portfolio samples', 'Specific questions', 'Career goals'],
    deliverables: ['Personalized feedback', 'Growth plan', 'Resource recommendations'],
    isActive: true,
    popularity: 78,
    rating: 4.7,
    bookingCount: 142
  }
]

// Mock Data - Available Slots
const generateMockSlots = (date: Date): BookingSlot[] => {
  const slots: BookingSlot[] = []
  const timeSlots = ['09:00', '10:30', '14:00', '15:30', '17:00']
  
  timeSlots.forEach((time, index) => {
    const [hours, minutes] = time.split(':').map(Number)
    const endTime = `${hours + 1}:${minutes.toString().padStart(2, '0')}`
    
    slots.push({
      id: `slot_${date.toISOString().split('T')[0]}_${time}`,
      date: date.toISOString().split('T')[0],
      startTime: time,
      endTime: endTime,
      duration: 60,
      available: Math.random() > 0.3, // 70% availability
      price: 200 + (index * 50),
      serviceType: mockServices[index % mockServices.length].category,
      location: ['online', 'office', 'client'][Math.floor(Math.random() * 3)] as any,
      maxAttendees: 1,
      currentAttendees: 0,
      timezone: 'UTC+2'
    })
  })
  
  return slots
}

// Mock Data - Booking Requests
const mockRequests: BookingRequest[] = [
  {
    id: 'req_1',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@techstartup.com',
    clientPhone: '+1-555-0123',
    serviceId: 'service_1',
    slotId: 'slot_1',
    message: 'Looking to rebrand our tech startup. We need a fresh, modern identity that appeals to our target demographic.',
    requirements: ['Brand brief', 'Competitor analysis'],
    budget: 5000,
    timeline: '6 weeks',
    status: 'pending',
    createdAt: '2024-02-01T10:30:00Z',
    notes: '',
    paymentStatus: 'pending',
    paymentAmount: 300
  },
  {
    id: 'req_2',
    clientName: 'Michael Chen',
    clientEmail: 'mike@ecommerce.co',
    clientPhone: '+1-555-0456',
    serviceId: 'service_2',
    slotId: 'slot_2',
    message: 'Our e-commerce site needs a UX audit. Conversion rates have been declining.',
    requirements: ['Current website URL', 'Analytics data'],
    budget: 3000,
    timeline: '2 weeks',
    status: 'confirmed',
    createdAt: '2024-02-02T14:15:00Z',
    confirmedAt: '2024-02-02T16:20:00Z',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    notes: 'Client provided comprehensive analytics data',
    paymentStatus: 'paid',
    paymentAmount: 200
  },
  {
    id: 'req_3',
    clientName: 'Emily Rodriguez',
    clientEmail: 'emily@creativestudio.com',
    clientPhone: '+1-555-0789',
    serviceId: 'service_4',
    slotId: 'slot_3',
    message: 'Junior designer seeking mentorship on career growth and portfolio development.',
    requirements: ['Portfolio samples', 'Career goals'],
    timeline: 'Ongoing',
    status: 'completed',
    createdAt: '2024-01-28T09:00:00Z',
    confirmedAt: '2024-01-28T11:30:00Z',
    notes: 'Excellent session, very engaged mentee',
    paymentStatus: 'paid',
    paymentAmount: 150
  }
]

interface EnhancedCalendarBookingProps {
  className?: string
  showAnalytics?: boolean
  allowClientBooking?: boolean
  mode?: 'freelancer' | 'client' | 'admin'
}

export function EnhancedCalendarBooking({ 
  className = '',
  showAnalytics = true,
  allowClientBooking = true,
  mode = 'freelancer'
}: EnhancedCalendarBookingProps) {
  const [state, dispatch] = useReducer(bookingReducer, initialState)

  // Initialize mock data
  useEffect(() => {
    dispatch({ type: 'SET_SERVICES', payload: mockServices })
    dispatch({ type: 'SET_REQUESTS', payload: mockRequests })
    
    // Generate slots for the next 30 days
    const slots: BookingSlot[] = []
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      slots.push(...generateMockSlots(date))
    }
    dispatch({ type: 'SET_SLOTS', payload: slots })
  }, [])

  const handleBookingSubmit = useCallback(async () => {
    if (!state.selectedService || !state.selectedSlot) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newRequest: BookingRequest = {
        id: `req_${Date.now()}`,
        ...state.bookingForm,
        serviceId: state.selectedService.id,
        slotId: state.selectedSlot.id,
        requirements: state.selectedService.requirements,
        status: 'pending',
        createdAt: new Date().toISOString(),
        notes: '',
        paymentStatus: 'pending',
        paymentAmount: state.selectedService.price
      }
      
      dispatch({ type: 'SET_REQUESTS', payload: [...state.requests, newRequest] })
      dispatch({ type: 'RESET_FORM' })
      dispatch({ type: 'TOGGLE_BOOKING_DIALOG', payload: false })
      dispatch({ type: 'SELECT_SERVICE', payload: null })
      dispatch({ type: 'SELECT_SLOT', payload: null })
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to submit booking request' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [state.selectedService, state.selectedSlot, state.bookingForm, state.requests])

  const getStatusColor = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: BookingRequest['status']) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-3 h-3" />
      case 'confirmed': return <CheckCircle className="w-3 h-3" />
      case 'cancelled': return <XCircle className="w-3 h-3" />
      case 'completed': return <Star className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const filteredRequests = state.requests.filter(request => {
    if (state.filters.status.length > 0 && !state.filters.status.includes(request.status)) {
      return false
    }
    return true
  })

  const totalRevenue = state.requests
    .filter(r => r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + r.paymentAmount, 0)

  const monthlyBookings = state.requests.filter(r => {
    const requestDate = new Date(r.createdAt)
    const currentMonth = new Date()
    return requestDate.getMonth() === currentMonth.getMonth() && 
           requestDate.getFullYear() === currentMonth.getFullYear()
  }).length

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 bg-clip-text text-transparent">
            Enhanced Booking System
          </h1>
          <p className="text-slate-600 font-light">
            Professional calendar management inspired by Calendly and Acuity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-700">
            <TrendingUp className="w-3 h-3 mr-1" />
            ${totalRevenue.toLocaleString()} Revenue
          </Badge>
          <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700">
            <CalendarDays className="w-3 h-3 mr-1" />
            {monthlyBookings} This Month
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: 'TOGGLE_ANALYTICS' })}
            className="bg-white/60 border-white/20"
          >
            <BarChart className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {state.showAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-blue-900">{state.requests.length}</p>
                </div>
                <CalendarDays className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Revenue</p>
                  <p className="text-2xl font-bold text-green-900">${totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {(state.services.reduce((sum, s) => sum + s.rating, 0) / state.services.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Active Services</p>
                  <p className="text-2xl font-bold text-orange-900">{state.services.filter(s => s.isActive).length}</p>
                </div>
                <Target className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white/60 backdrop-blur-xl border-white/20">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests ({state.requests.length})
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          {/* Calendar View */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Availability Calendar
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-white/60 border-white/20">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-white/60 border-white/20">
                  Today
                </Button>
                <Button variant="outline" size="sm" className="bg-white/60 border-white/20">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar implementation would go here */}
              <div className="text-center py-12 text-slate-600">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                <p>Interactive calendar with booking slots and availability management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.services.map((service) => (
              <Card 
                key={service.id} 
                className="group bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                onClick={() => dispatch({ type: 'SELECT_SERVICE', payload: service })}
              >
                {/* Service Header */}
                <div className={`h-2 bg-gradient-to-r ${service.color}`}></div>
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{service.name}</h3>
                      <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">${service.price}</p>
                      <p className="text-xs text-slate-500">{service.duration} min</p>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.description}</p>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{service.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{service.bookingCount} bookings</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{service.popularity}% popular</span>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.requirements.slice(0, 2).map((req, index) => (
                        <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                          {req}
                        </Badge>
                      ))}
                      {service.requirements.length > 2 && (
                        <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600 border-slate-200">
                          +{service.requirements.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch({ type: 'SELECT_SERVICE', payload: service })
                        dispatch({ type: 'TOGGLE_BOOKING_DIALOG', payload: true })
                      }}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="bg-white/60 border-white/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Copy booking link
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Service Button */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 border-dashed shadow-luxury hover:shadow-xl transition-all duration-300 cursor-pointer">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Add New Service</h3>
              <p className="text-slate-600 mb-6">Create a new booking service with custom duration and pricing</p>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                onClick={() => dispatch({ type: 'TOGGLE_SERVICE_DIALOG', payload: true })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Service
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-6">
          {/* Requests List */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Booking Requests
                </CardTitle>
                <div className="flex items-center gap-2">
                  <select 
                    className="px-3 py-1.5 text-sm border rounded-md bg-white/60 border-white/20 focus:bg-white"
                    onChange={(e) => {
                      const status = e.target.value
                      dispatch({ 
                        type: 'SET_FILTERS', 
                        payload: { status: status ? [status] : [] } 
                      })
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredRequests.map((request) => {
                const service = state.services.find(s => s.id === request.serviceId)
                
                return (
                  <Card key={request.id} className="bg-white/40 border-white/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                            {request.clientName[0]}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">{request.clientName}</h4>
                            <p className="text-sm text-slate-600">{request.clientEmail}</p>
                            <p className="text-xs text-slate-500">{new Date(request.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status}</span>
                          </Badge>
                          <Button size="sm" variant="outline" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {service && (
                        <div className="mb-3">
                          <Badge variant="outline" className={`text-xs bg-gradient-to-r ${service.color} text-white border-0`}>
                            {service.name}
                          </Badge>
                          <span className="text-sm text-slate-600 ml-2">${service.price} • {service.duration} min</span>
                        </div>
                      )}

                      <p className="text-sm text-slate-700 mb-3 line-clamp-2">{request.message}</p>

                      {request.budget && (
                        <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Budget: ${request.budget.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Timeline: {request.timeline}
                          </span>
                        </div>
                      )}

                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => dispatch({ 
                              type: 'UPDATE_REQUEST_STATUS', 
                              payload: { id: request.id, status: 'confirmed' } 
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => dispatch({ 
                              type: 'UPDATE_REQUEST_STATUS', 
                              payload: { id: request.id, status: 'cancelled' } 
                            })}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {request.status === 'confirmed' && request.meetingLink && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-blue-50 text-blue-600 border-blue-200"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="bg-white/60 border-white/20"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}

              {filteredRequests.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">No booking requests</h3>
                  <p className="text-slate-600">When clients book your services, they'll appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Settings */}
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Booking Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-12 text-slate-600">
                <Settings className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Booking Configuration</h3>
                <p>Manage availability, notifications, and booking preferences</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={state.showBookingDialog} onOpenChange={(open) => dispatch({ type: 'TOGGLE_BOOKING_DIALOG', payload: open })}>
        <DialogContent className="bg-white/95 backdrop-blur-xl border-white/20 max-w-md">
          <DialogHeader>
            <DialogTitle>Book {state.selectedService?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <Input
                value={state.bookingForm.clientName}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_BOOKING_FORM', 
                  payload: { clientName: e.target.value } 
                })}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <Input
                type="email"
                value={state.bookingForm.clientEmail}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_BOOKING_FORM', 
                  payload: { clientEmail: e.target.value } 
                })}
                placeholder="Enter your email"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Phone Number (Optional)</label>
              <Input
                value={state.bookingForm.clientPhone}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_BOOKING_FORM', 
                  payload: { clientPhone: e.target.value } 
                })}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700">Project Details</label>
              <Textarea
                value={state.bookingForm.message}
                onChange={(e) => dispatch({ 
                  type: 'UPDATE_BOOKING_FORM', 
                  payload: { message: e.target.value } 
                })}
                placeholder="Tell us about your project requirements..."
                rows={3}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleBookingSubmit}
                disabled={state.loading}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {state.loading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Submit Booking
              </Button>
              <Button 
                variant="outline" 
                onClick={() => dispatch({ type: 'TOGGLE_BOOKING_DIALOG', payload: false })}
                className="bg-white/60 border-white/20"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 