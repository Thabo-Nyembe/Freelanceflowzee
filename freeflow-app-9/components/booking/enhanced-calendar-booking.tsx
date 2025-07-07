'use client'

import React, { useReducer, useCallback, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Users, DollarSign, Briefcase, Check, X, MoreHorizontal, PlusCircle, Filter, BarChart2 } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, getDay, isToday } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

// Type Definitions
type CalendarView = 'month' | 'week' | 'day'

interface BookingService {
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

interface BookingSlot {
  time: string
  isAvailable: boolean
  isBooked?: boolean
  attendees?: number
}

interface BookingRequest {
  id: string
  serviceName: string
  clientName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

interface BookingState {
  services: BookingService[]
  slots: BookingSlot[]
  requests: BookingRequest[]
  selectedDate: Date
  selectedService: BookingService | null
  selectedSlot: BookingSlot | null
  calendarView: CalendarView
  currentMonth: Date
  availability: { [key: string]: { total: number, available: number } }
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
    dateRange: { from: Date, to: Date } | null
    priceRange: { min: number, max: number } | null
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
    requirements: ['Portfolio link', 'Career goals', 'Specific questions'],
    deliverables: ['Actionable feedback', 'Career advice', 'Resource recommendations'],
    isActive: true,
    popularity: 78,
    rating: 4.9,
    bookingCount: 312
  }
]

export default function EnhancedCalendarBooking() {
  const [, dispatch] = useReducer(bookingReducer, initialState)

  const fetchServices = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    dispatch({ type: 'SET_SERVICES', payload: mockServices })
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Calendar Booking</CardTitle>
          <CardDescription>Manage your services, availability, and client bookings with an integrated system.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Calendar content goes here...</p>
        </CardContent>
      </Card>
    </div>
  )
}