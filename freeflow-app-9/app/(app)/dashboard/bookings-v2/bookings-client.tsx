'use client'
import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useBookings, type Booking, type BookingType, type BookingStatus, type PaymentStatus } from '@/lib/hooks/use-bookings'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Calendar, Clock, Users, DollarSign, Video, Plus, Settings,
  ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Check, X,
  Bell, Link2, Mail, Phone, Globe, Copy, ExternalLink, CreditCard,
  Repeat, UserCheck, CalendarClock, RefreshCw, Download, Shield,
  Key, Palette, AlertTriangle, MessageSquare, Webhook, Timer, Edit,
  Trash2, BarChart3, FileText
} from 'lucide-react'

// Enhanced & Competitive Upgrade Components
import {
  AIInsightsPanel,
  CollaborationIndicator,
  PredictiveAnalytics,
} from '@/components/ui/competitive-upgrades'

import {
  ActivityFeed,
  QuickActionsToolbar,
} from '@/components/ui/competitive-upgrades-extended'

// Import mock data from centralized adapters



// View types
type ViewType = 'calendar' | 'list' | 'agenda'
type CalendarView = 'month' | 'week' | 'day'

// Service type for booking types
interface ServiceType {
  id: string
  name: string
  duration: number
  price: number
  color: string
  description: string
  buffer: number
  maxCapacity: number
}

// Time slot type
interface TimeSlot {
  time: string
  available: boolean
  bookings: number
}

// Team member for round-robin
interface TeamMember {
  id: string
  name: string
  avatar: string
  role: string
  availability: string[]
  bookingsToday: number
}

// Mock data for AI-powered competitive upgrade components
const mockBookingsAIInsights = [
  { id: '1', type: 'success' as const, title: 'High Demand', description: 'Consultation bookings up 45% this week. Consider adding more slots.', priority: 'medium' as const, timestamp: new Date().toISOString(), category: 'Capacity' },
  { id: '2', type: 'warning' as const, title: 'No-Show Alert', description: '3 no-shows yesterday. Send reminder SMS 2 hours before appointments.', priority: 'high' as const, timestamp: new Date().toISOString(), category: 'Attendance' },
  { id: '3', type: 'info' as const, title: 'Popular Time', description: '10-11 AM slots are most booked. 87% utilization rate.', priority: 'low' as const, timestamp: new Date().toISOString(), category: 'Analytics' },
]

const mockBookingsCollaborators = [
  { id: '1', name: 'Scheduler', avatar: '/avatars/scheduler.jpg', status: 'online' as const, role: 'Scheduling' },
  { id: '2', name: 'Consultant', avatar: '/avatars/consultant.jpg', status: 'online' as const, role: 'Consultant' },
  { id: '3', name: 'Support', avatar: '/avatars/support.jpg', status: 'away' as const, role: 'Support' },
]

const mockBookingsPredictions = [
  { id: '1', title: 'Weekly Forecast', prediction: 'Expect 35% more bookings next week based on seasonal trends', confidence: 82, trend: 'up' as const, impact: 'high' as const },
  { id: '2', title: 'Cancellation Risk', prediction: '5 bookings have high cancellation probability', confidence: 76, trend: 'down' as const, impact: 'medium' as const },
]

const mockBookingsActivities = [
  { id: '1', user: 'Client', action: 'Booked', target: 'Strategy Consultation for tomorrow', timestamp: new Date().toISOString(), type: 'success' as const },
  { id: '2', user: 'Scheduler', action: 'Rescheduled', target: 'Weekly sync meeting', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'info' as const },
  { id: '3', user: 'System', action: 'Sent', target: 'reminder to 12 clients', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'success' as const },
]

// Quick actions are defined inside the component to access state setters

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [view, setView] = useState<ViewType>('calendar')
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showBlockTimeDialog, setShowBlockTimeDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [settingsTab, setSettingsTab] = useState('availability')

  const {
    bookings,
    loading,
    error,
    realtimeStatus,
    stats: hookStats,
    createBooking,
    updateBooking,
    deleteBooking,
    confirmBooking: hookConfirmBooking,
    cancelBooking: hookCancelBooking,
    rescheduleBooking: hookRescheduleBooking,
    refetch
  } = useBookings({
    bookingType: bookingTypeFilter,
    status: statusFilter,
    paymentStatus: paymentStatusFilter,
    enableRealtime: true
  })

  // Form state for new booking
  const [newBookingForm, setNewBookingForm] = useState({
    serviceType: '1',
    teamMember: '',
    date: '',
    time: '09:00',
    clientName: '',
    clientEmail: '',
    addVideoMeeting: false,
    requirePayment: false
  })

  // Reschedule state
  const [rescheduleData, setRescheduleData] = useState<{ bookingId: string; newDate: string; newTime: string } | null>(null)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)

  // Block time form state
  const [blockTimeForm, setBlockTimeForm] = useState({
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
    recurring: false,
    recurringDays: [] as string[]
  })
  const displayBookings = (bookings && bookings.length > 0) ? bookings : (initialBookings || [])

  // Service types
  const serviceTypes: ServiceType[] = [
    { id: '1', name: 'Discovery Call', duration: 15, price: 0, color: 'sky', description: 'Free introductory call', buffer: 5, maxCapacity: 1 },
    { id: '2', name: 'Strategy Session', duration: 60, price: 150, color: 'indigo', description: '1-hour strategy consultation', buffer: 15, maxCapacity: 1 },
    { id: '3', name: 'Project Kickoff', duration: 90, price: 250, color: 'purple', description: 'Comprehensive project planning', buffer: 15, maxCapacity: 5 },
    { id: '4', name: 'Workshop', duration: 180, price: 500, color: 'emerald', description: 'Half-day workshop session', buffer: 30, maxCapacity: 10 },
    { id: '5', name: 'Coaching Call', duration: 45, price: 100, color: 'amber', description: 'Personal coaching session', buffer: 10, maxCapacity: 1 }
  ]

  // Team members
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', avatar: 'SJ', role: 'Lead Consultant', availability: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], bookingsToday: 4 },
    { id: '2', name: 'Michael Chen', avatar: 'MC', role: 'Senior Consultant', availability: ['Mon', 'Tue', 'Wed', 'Thu'], bookingsToday: 3 },
    { id: '3', name: 'Emily Davis', avatar: 'ED', role: 'Consultant', availability: ['Tue', 'Wed', 'Thu', 'Fri'], bookingsToday: 5 },
    { id: '4', name: 'James Wilson', avatar: 'JW', role: 'Junior Consultant', availability: ['Mon', 'Wed', 'Fri'], bookingsToday: 2 }
  ]

  // Generate time slots for the day
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
        slots.push({
          time,
          available: Math.random() > 0.3,
          bookings: Math.floor(Math.random() * 3)
        })
      }
    }
    return slots
  }

  const timeSlots = useMemo(() => generateTimeSlots(), [currentDate])

  // Handlers - Real Supabase Operations
  const handleNewBooking = () => {
    setShowNewBooking(true)
  }

  const handleCreateBooking = async () => {
    const selectedService = serviceTypes.find(s => s.id === newBookingForm.serviceType)
    if (!selectedService) {
      toast.error('Error', { description: 'Please select a service type' })
      return
    }
    if (!newBookingForm.date || !newBookingForm.clientName || !newBookingForm.clientEmail) {
      toast.error('Error', { description: 'Please fill in all required fields' })
      return
    }

    const startTime = new Date(`${newBookingForm.date}T${newBookingForm.time}:00`)
    const endTime = new Date(startTime.getTime() + selectedService.duration * 60000)
    const bookingNumber = `BK-${Date.now().toString(36).toUpperCase()}`

    try {
      await createBooking({
        booking_number: bookingNumber,
        title: selectedService.name,
        description: selectedService.description,
        booking_type: 'appointment' as BookingType,
        customer_name: newBookingForm.clientName,
        customer_email: newBookingForm.clientEmail,
        guest_count: 1,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: selectedService.duration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        buffer_before_minutes: selectedService.buffer,
        buffer_after_minutes: selectedService.buffer,
        status: 'pending' as BookingStatus,
        provider_id: newBookingForm.teamMember || undefined,
        provider_name: newBookingForm.teamMember ? teamMembers.find(m => m.id === newBookingForm.teamMember)?.name : undefined,
        service_id: selectedService.id,
        service_name: selectedService.name,
        price: selectedService.price,
        deposit_amount: 0,
        paid_amount: 0,
        balance_due: selectedService.price,
        currency: 'USD',
        payment_status: 'unpaid' as PaymentStatus,
        reminder_sent: false,
        confirmation_sent: false,
        follow_up_sent: false,
        is_recurring: false,
        capacity: selectedService.maxCapacity,
        slots_booked: 1,
        requirements: {},
        metadata: {
          addVideoMeeting: newBookingForm.addVideoMeeting,
          requirePayment: newBookingForm.requirePayment
        },
        meeting_url: newBookingForm.addVideoMeeting ? 'https://zoom.us/j/pending' : undefined
      })

      toast.success('Booking Created', {
        description: `Booking for ${newBookingForm.clientName} has been created successfully`
      })
      setShowNewBooking(false)
      setNewBookingForm({
        serviceType: '1',
        teamMember: '',
        date: '',
        time: '09:00',
        clientName: '',
        clientEmail: '',
        addVideoMeeting: false,
        requirePayment: false
      })
      // No need to call refetch - real-time subscription handles updates
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to create booking' })
    }
  }

  const handleConfirmBooking = async (booking: Booking) => {
    try {
      await hookConfirmBooking(booking.id)
      toast.success('Booking Confirmed', {
        description: `Booking for ${booking.customer_name || 'client'} has been confirmed`
      })
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null)
      }
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to confirm booking' })
    }
  }

  const handleCancelBooking = async (booking: Booking) => {
    try {
      await hookCancelBooking(booking.id, 'Cancelled by user')
      toast.success('Booking Cancelled', {
        description: `Booking for ${booking.customer_name || 'client'} has been cancelled`
      })
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null)
      }
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to cancel booking' })
    }
  }

  const handleReschedule = (booking: Booking) => {
    setRescheduleData({
      bookingId: booking.id,
      newDate: booking.start_time.split('T')[0],
      newTime: booking.start_time.split('T')[1]?.substring(0, 5) || '09:00'
    })
    setShowRescheduleDialog(true)
  }

  const handleConfirmReschedule = async () => {
    if (!rescheduleData) return

    const booking = displayBookings.find(b => b.id === rescheduleData.bookingId)
    if (!booking) return

    const startTime = new Date(`${rescheduleData.newDate}T${rescheduleData.newTime}:00`)
    const endTime = new Date(startTime.getTime() + booking.duration_minutes * 60000)

    try {
      await hookRescheduleBooking(
        rescheduleData.bookingId,
        startTime.toISOString(),
        endTime.toISOString()
      )
      toast.success('Booking Rescheduled', {
        description: `Booking has been rescheduled to ${startTime.toLocaleDateString()}`
      })
      setShowRescheduleDialog(false)
      setRescheduleData(null)
      if (selectedBooking?.id === rescheduleData.bookingId) {
        setSelectedBooking(null)
      }
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to reschedule booking' })
    }
  }

  const handleDeleteBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to delete the booking "${booking.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteBooking(booking.id)
      toast.success('Booking Deleted', {
        description: `Booking "${booking.title}" has been deleted`
      })
      if (selectedBooking?.id === booking.id) {
        setSelectedBooking(null)
      }
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to delete booking' })
    }
  }

  // Send confirmation email handler
  const handleSendConfirmation = async (booking: Booking) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/bookings/${booking.id}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: booking.customer_email })
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to send confirmation')
        }
        return response.json()
      })(),
      {
        loading: 'Sending confirmation email...',
        success: `Confirmation sent to ${booking.customer_email || 'client'}`,
        error: (err) => err.message || 'Failed to send confirmation'
      }
    )
  }

  // Send reminder handler
  const handleSendReminder = async (booking: Booking) => {
    toast.promise(
      (async () => {
        const response = await fetch(`/api/bookings/${booking.id}/reminder`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: booking.customer_email })
        })
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to send reminder')
        }
        await updateBooking(booking.id, { reminder_sent: true })
        return response.json()
      })(),
      {
        loading: 'Sending reminder...',
        success: `Reminder sent to ${booking.customer_email || 'client'}`,
        error: (err) => err.message || 'Failed to send reminder'
      }
    )
  }

  // Export bookings to CSV
  const handleExportCSV = async () => {
    toast.promise(
      (async () => {
        // Build CSV content from bookings
        const headers = ['Booking Number', 'Title', 'Customer Name', 'Customer Email', 'Date', 'Time', 'Duration (min)', 'Status', 'Payment Status', 'Price', 'Paid Amount', 'Balance Due']
        const rows = filteredBookings.map(booking => [
          booking.booking_number || '',
          booking.title,
          booking.customer_name || '',
          booking.customer_email || '',
          new Date(booking.start_time).toLocaleDateString(),
          new Date(booking.start_time).toLocaleTimeString(),
          booking.duration_minutes.toString(),
          booking.status,
          booking.payment_status,
          booking.price.toString(),
          booking.paid_amount.toString(),
          booking.balance_due.toString()
        ])

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
          .join('\n')

        // Create and download the file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        return { exported: filteredBookings.length }
      })(),
      {
        loading: 'Generating CSV export...',
        success: (result) => `Exported ${result.exported} bookings to CSV`,
        error: 'Failed to export bookings'
      }
    )
  }

  // Open meeting link handler
  const handleOpenMeeting = (booking: Booking) => {
    if (booking.meeting_url) {
      window.open(booking.meeting_url, '_blank')
      toast.success('Meeting opened', { description: 'Video meeting link opened in new tab' })
    } else {
      toast.error('No meeting link', { description: 'This booking does not have a video meeting link' })
    }
  }

  // Quick actions for toolbar
  const bookingsQuickActions = [
    { id: '1', label: 'New Booking', icon: 'plus', action: () => setShowNewBooking(true), variant: 'default' as const },
    { id: '2', label: 'Block Time', icon: 'clock', action: () => setShowBlockTimeDialog(true), variant: 'default' as const },
    { id: '3', label: 'View Calendar', icon: 'calendar', action: () => setView('calendar'), variant: 'outline' as const },
  ]

  // Get days of the week
  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const weekDays = getWeekDays()

  // Comprehensive stats
  const stats = useMemo(() => {
    const total = displayBookings.length
    const confirmed = displayBookings.filter(b => b.status === 'confirmed').length
    const pending = displayBookings.filter(b => b.status === 'pending').length
    const completed = displayBookings.filter(b => b.status === 'completed').length
    const cancelled = displayBookings.filter(b => b.status === 'cancelled').length
    const totalRevenue = displayBookings.reduce((sum, b) => sum + b.price, 0)
    const paidRevenue = displayBookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + b.price, 0)
    const pendingPayments = displayBookings.filter(b => b.payment_status !== 'paid').reduce((sum, b) => sum + b.balance_due, 0)
    const avgDuration = displayBookings.length > 0 ? displayBookings.reduce((sum, b) => sum + b.duration_minutes, 0) / displayBookings.length : 0
    const noShowRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0'

    return {
      total,
      confirmed,
      pending,
      completed,
      cancelled,
      totalRevenue,
      paidRevenue,
      pendingPayments,
      avgDuration: Math.round(avgDuration),
      noShowRate,
      conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0'
    }
  }, [displayBookings])

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return displayBookings.filter(b => {
      const matchesSearch = !searchQuery ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.booking_number?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = bookingTypeFilter === 'all' || b.booking_type === bookingTypeFilter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      const matchesPayment = paymentStatusFilter === 'all' || b.payment_status === paymentStatusFilter
      return matchesSearch && matchesType && matchesStatus && matchesPayment
    })
  }, [displayBookings, searchQuery, bookingTypeFilter, statusFilter, paymentStatusFilter])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (calendarView === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (calendarView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // In demo mode, continue with empty bookings instead of showing error

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CalendarClock className="h-8 w-8" />
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
                    Booking Pro
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1.5 ${
                    realtimeStatus === 'connected' ? 'bg-emerald-500/30' :
                    realtimeStatus === 'connecting' ? 'bg-amber-500/30' :
                    'bg-red-500/30'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      realtimeStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
                      realtimeStatus === 'connecting' ? 'bg-amber-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    {realtimeStatus === 'connected' ? 'Live Sync' :
                     realtimeStatus === 'connecting' ? 'Connecting...' :
                     'Disconnected'}
                  </span>
                </div>
                <h1 className="text-4xl font-bold mb-2">Booking System</h1>
                <p className="text-white/80">
                  Calendly-level scheduling • Round-robin • Video integration • Smart reminders
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dialog open={showNewBooking} onOpenChange={setShowNewBooking}>
                  <DialogTrigger asChild>
                    <button className="px-4 py-2 bg-white text-sky-600 rounded-lg font-medium hover:bg-white/90 transition-all flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      New Booking
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Booking</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="manual" className="mt-4">
                      <TabsList className="grid grid-cols-2 w-full">
                        <TabsTrigger value="manual">Manual Booking</TabsTrigger>
                        <TabsTrigger value="invite">Send Invite Link</TabsTrigger>
                      </TabsList>
                      <TabsContent value="manual" className="mt-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-1">Service Type</label>
                            <select
                              value={newBookingForm.serviceType}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, serviceType: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                              {serviceTypes.map(service => (
                                <option key={service.id} value={service.id}>{service.name} ({service.duration}min)</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Team Member</label>
                            <select
                              value={newBookingForm.teamMember}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, teamMember: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                              <option value="">Auto-assign (Round Robin)</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                              type="date"
                              value={newBookingForm.date}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, date: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <select
                              value={newBookingForm.time}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, time: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            >
                              {timeSlots.filter(s => s.available).map(slot => (
                                <option key={slot.time} value={slot.time}>{slot.time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Client Name</label>
                          <input
                            type="text"
                            value={newBookingForm.clientName}
                            onChange={(e) => setNewBookingForm({ ...newBookingForm, clientName: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Enter client name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Client Email</label>
                          <input
                            type="email"
                            value={newBookingForm.clientEmail}
                            onChange={(e) => setNewBookingForm({ ...newBookingForm, clientEmail: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                            placeholder="client@example.com"
                          />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newBookingForm.addVideoMeeting}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, addVideoMeeting: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">Add video meeting (Zoom)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newBookingForm.requirePayment}
                              onChange={(e) => setNewBookingForm({ ...newBookingForm, requirePayment: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-sm">Require payment</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button onClick={() => setShowNewBooking(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancel
                          </button>
                          <button
                            onClick={handleCreateBooking}
                            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                          >
                            Create Booking
                          </button>
                        </div>
                      </TabsContent>
                      <TabsContent value="invite" className="mt-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Select Service</label>
                          <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                            {serviceTypes.map(service => (
                              <option key={service.id} value={service.id}>{service.name} - ${service.price}</option>
                            ))}
                          </select>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Booking Link</span>
                            <button className="text-sky-600 text-sm flex items-center gap-1 hover:underline">
                              <Copy className="h-3 w-3" /> Copy
                            </button>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded border text-sm font-mono">
                            <Link2 className="h-4 w-4 text-gray-400" />
                            https://book.freeflow.app/your-company/strategy-session
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Send via Email</label>
                          <div className="flex gap-2">
                            <input type="email" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="client@example.com" />
                            <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                              Send
                            </button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
                <button
                  onClick={() => refetch()}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
                  title="Refresh bookings"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Bell className="h-5 w-5" />
                </button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Booking Settings</DialogTitle>
                    </DialogHeader>
                    <Tabs value={settingsTab} onValueChange={setSettingsTab} className="mt-4">
                      <TabsList className="grid grid-cols-6 w-full">
                        <TabsTrigger value="availability" className="gap-2">
                          <Clock className="w-4 h-4" />
                          Availability
                        </TabsTrigger>
                        <TabsTrigger value="services" className="gap-2">
                          <Calendar className="w-4 h-4" />
                          Services
                        </TabsTrigger>
                        <TabsTrigger value="team" className="gap-2">
                          <Users className="w-4 h-4" />
                          Team
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                          <Bell className="w-4 h-4" />
                          Notifications
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="gap-2">
                          <Link2 className="w-4 h-4" />
                          Integrations
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="gap-2">
                          <Shield className="w-4 h-4" />
                          Advanced
                        </TabsTrigger>
                      </TabsList>

                      {/* Availability Settings */}
                      <TabsContent value="availability" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                <Clock className="w-5 h-5 text-sky-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Working Hours</h3>
                                <p className="text-sm text-gray-500">Set your available time slots</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                                <div key={day} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                                  <div className="flex items-center gap-3">
                                    <Switch defaultChecked />
                                    <span className="font-medium">{day}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Select defaultValue="9">
                                      <SelectTrigger className="w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[8, 9, 10].map(h => (
                                          <SelectItem key={h} value={h.toString()}>{h}:00 AM</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <span className="text-gray-400">to</span>
                                    <Select defaultValue="17">
                                      <SelectTrigger className="w-24">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {[17, 18, 19].map(h => (
                                          <SelectItem key={h} value={h.toString()}>{h - 12}:00 PM</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Timer className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Buffer Time</h3>
                                <p className="text-sm text-gray-500">Time between meetings</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Before Meetings</Label>
                                <Select defaultValue="10">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>After Meetings</Label>
                                <Select defaultValue="10">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Minimum Booking Notice</Label>
                                  <p className="text-xs text-gray-500">How far in advance</p>
                                </div>
                                <Select defaultValue="4">
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="1">1 hour</SelectItem>
                                    <SelectItem value="4">4 hours</SelectItem>
                                    <SelectItem value="24">24 hours</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <Calendar className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Scheduling Window</h3>
                              <p className="text-sm text-gray-500">How far in advance clients can book</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Booking Window</Label>
                              <Select defaultValue="60">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="14">14 days</SelectItem>
                                  <SelectItem value="30">30 days</SelectItem>
                                  <SelectItem value="60">60 days</SelectItem>
                                  <SelectItem value="90">90 days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Time Slot Duration</Label>
                              <Select defaultValue="30">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="15">15 minutes</SelectItem>
                                  <SelectItem value="30">30 minutes</SelectItem>
                                  <SelectItem value="60">60 minutes</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                              <div>
                                <Label>Show Timezone</Label>
                                <p className="text-xs text-gray-500">Display client's timezone</p>
                              </div>
                              <Switch defaultChecked />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Services Settings */}
                      <TabsContent value="services" className="mt-6 space-y-6">
                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                <CalendarClock className="w-5 h-5 text-sky-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Event Types</h3>
                                <p className="text-sm text-gray-500">Configure your booking services</p>
                              </div>
                            </div>
                            <Button className="gap-2 bg-sky-600 hover:bg-sky-700">
                              <Plus className="w-4 h-4" />
                              Add Service
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {serviceTypes.map(service => (
                              <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className={`w-4 h-4 rounded-full bg-${service.color}-500`} />
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{service.name}</p>
                                    <p className="text-sm text-gray-500">{service.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="font-medium">{service.duration} min</p>
                                    <p className="text-sm text-gray-500">${service.price}</p>
                                  </div>
                                  <Badge variant="outline">{service.maxCapacity === 1 ? '1:1' : `${service.maxCapacity} max`}</Badge>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CreditCard className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Payment Settings</h3>
                                <p className="text-sm text-gray-500">Payment collection options</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Require Payment Upfront</Label>
                                  <p className="text-xs text-gray-500">Collect payment at booking</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Allow Partial Payment</Label>
                                  <p className="text-xs text-gray-500">Accept deposits</p>
                                </div>
                                <Switch />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Auto-Refund on Cancel</Label>
                                  <p className="text-xs text-gray-500">If within policy</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <FileText className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Cancellation Policy</h3>
                                <p className="text-sm text-gray-500">Set cancellation rules</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Cancellation Window</Label>
                                <Select defaultValue="24">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">No cancellations</SelectItem>
                                    <SelectItem value="2">2 hours before</SelectItem>
                                    <SelectItem value="24">24 hours before</SelectItem>
                                    <SelectItem value="48">48 hours before</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Allow Rescheduling</Label>
                                  <p className="text-xs text-gray-500">Let clients reschedule</p>
                                </div>
                                <Switch defaultChecked />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Team Settings */}
                      <TabsContent value="team" className="mt-6 space-y-6">
                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Repeat className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">Round-Robin Assignment</h3>
                              <p className="text-sm text-gray-500">Automatically distribute bookings evenly among team members</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Assignment Method</Label>
                              <Select defaultValue="equal">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equal">Equal Distribution</SelectItem>
                                  <SelectItem value="availability">By Availability</SelectItem>
                                  <SelectItem value="priority">Priority Based</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Max Per Day Per Member</Label>
                              <Select defaultValue="8">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="4">4 bookings</SelectItem>
                                  <SelectItem value="6">6 bookings</SelectItem>
                                  <SelectItem value="8">8 bookings</SelectItem>
                                  <SelectItem value="10">10 bookings</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600">
                              <div>
                                <Label>Skill-Based Matching</Label>
                                <p className="text-xs text-gray-500">Match by expertise</p>
                              </div>
                              <Switch />
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                                <Users className="w-5 h-5 text-sky-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
                                <p className="text-sm text-gray-500">Manage who can receive bookings</p>
                              </div>
                            </div>
                            <Button variant="outline" className="gap-2">
                              <Plus className="w-4 h-4" />
                              Add Member
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {teamMembers.map(member => (
                              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-medium text-lg">
                                    {member.avatar}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.role}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm font-medium">{member.bookingsToday} today</p>
                                    <p className="text-xs text-gray-500">{member.availability.join(', ')}</p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-700">Active</Badge>
                                  <Button size="sm" variant="ghost">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Notifications Settings */}
                      <TabsContent value="notifications" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Mail className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Email Notifications</h3>
                                <p className="text-sm text-gray-500">Client email settings</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {[
                                { label: 'Booking Confirmation', desc: 'When booking is made', enabled: true },
                                { label: 'Reminder - 24h', desc: '24 hours before', enabled: true },
                                { label: 'Reminder - 1h', desc: '1 hour before', enabled: true },
                                { label: 'Cancellation Notice', desc: 'When cancelled', enabled: true },
                                { label: 'Reschedule Notice', desc: 'When rescheduled', enabled: true },
                                { label: 'Follow-up Email', desc: 'After meeting', enabled: false },
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <div>
                                    <Label className="font-medium">{item.label}</Label>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                  </div>
                                  <Switch defaultChecked={item.enabled} />
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">SMS Notifications</h3>
                                <p className="text-sm text-gray-500">Text message reminders</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {[
                                { label: 'SMS Confirmation', desc: 'Booking confirmation text', enabled: true },
                                { label: 'SMS Reminder - 24h', desc: '24 hours before', enabled: true },
                                { label: 'SMS Reminder - 2h', desc: '2 hours before', enabled: false },
                                { label: 'SMS Cancellation', desc: 'Cancellation notice', enabled: true },
                              ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                                  <div>
                                    <Label className="font-medium">{item.label}</Label>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                  </div>
                                  <Switch defaultChecked={item.enabled} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Bell className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Team Notifications</h3>
                              <p className="text-sm text-gray-500">Alerts for your team</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            {[
                              { label: 'New Booking', desc: 'When booking created', enabled: true },
                              { label: 'Cancellation', desc: 'Client cancels', enabled: true },
                              { label: 'Reschedule', desc: 'Client reschedules', enabled: true },
                              { label: 'No-Show Alert', desc: 'Client didn\'t show', enabled: true },
                              { label: 'Payment Received', desc: 'Payment processed', enabled: false },
                              { label: 'Daily Summary', desc: 'End of day report', enabled: true },
                            ].map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600">
                                <div>
                                  <Label className="font-medium">{item.label}</Label>
                                  <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                                <Switch defaultChecked={item.enabled} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Integrations Settings */}
                      <TabsContent value="integrations" className="mt-6 space-y-6">
                        <div className="p-6 border rounded-xl dark:border-gray-700">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                              <Link2 className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 dark:text-white">Connected Services</h3>
                              <p className="text-sm text-gray-500">Integrate with your favorite tools</p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {[
                              { name: 'Zoom', desc: 'Auto-create meeting links', icon: Video, connected: true, color: 'blue' },
                              { name: 'Google Calendar', desc: 'Two-way sync', icon: Calendar, connected: true, color: 'green' },
                              { name: 'Stripe', desc: 'Accept payments', icon: CreditCard, connected: true, color: 'purple' },
                              { name: 'Google Meet', desc: 'Video meetings', icon: Video, connected: false, color: 'gray' },
                              { name: 'Microsoft Outlook', desc: 'Calendar & email', icon: Calendar, connected: false, color: 'gray' },
                              { name: 'Slack', desc: 'Team notifications', icon: MessageSquare, connected: false, color: 'gray' },
                            ].map((integration, idx) => (
                              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${integration.connected ? `bg-${integration.color}-100 dark:bg-${integration.color}-900/30` : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <integration.icon className={`h-5 w-5 ${integration.connected ? `text-${integration.color}-600` : 'text-gray-400'}`} />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{integration.name}</p>
                                    <p className="text-sm text-gray-500">{integration.desc}</p>
                                  </div>
                                </div>
                                {integration.connected ? (
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-700">Connected</Badge>
                                    <Button size="sm" variant="outline">Configure</Button>
                                  </div>
                                ) : (
                                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700">Connect</Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <Webhook className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Webhooks</h3>
                                <p className="text-sm text-gray-500">Real-time event notifications</p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Webhook URL</Label>
                              <Input placeholder="https://your-app.com/webhooks/bookings" />
                            </div>
                            <Button variant="outline" className="w-full gap-2">
                              <Plus className="w-4 h-4" />
                              Add Webhook
                            </Button>
                          </div>

                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Key className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">API Access</h3>
                                <p className="text-sm text-gray-500">Developer access keys</p>
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg font-mono text-sm">
                              ••••••••••••••••••••
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" className="flex-1 gap-2">
                                <Copy className="w-4 h-4" />
                                Copy Key
                              </Button>
                              <Button variant="outline" className="gap-2">
                                <RefreshCw className="w-4 h-4" />
                                Regenerate
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Advanced Settings */}
                      <TabsContent value="advanced" className="mt-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Palette className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Branding</h3>
                                <p className="text-sm text-gray-500">Customize booking page</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Primary Color</Label>
                                <div className="flex gap-2">
                                  <Input defaultValue="#0EA5E9" className="flex-1" />
                                  <div className="w-10 h-10 rounded-lg bg-sky-500 border" />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>Logo URL</Label>
                                <Input placeholder="https://cdn.example.com/logo.png" />
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>Hide FreeFlow Branding</Label>
                                  <p className="text-xs text-gray-500">White-label mode</p>
                                </div>
                                <Switch />
                              </div>
                            </div>
                          </div>

                          <div className="p-6 border rounded-xl dark:border-gray-700 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Globe className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Localization</h3>
                                <p className="text-sm text-gray-500">Language and timezone</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Default Language</Label>
                                <Select defaultValue="en">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="en">English</SelectItem>
                                    <SelectItem value="es">Spanish</SelectItem>
                                    <SelectItem value="fr">French</SelectItem>
                                    <SelectItem value="de">German</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Timezone</Label>
                                <Select defaultValue="america_new_york">
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="america_new_york">Eastern Time (ET)</SelectItem>
                                    <SelectItem value="america_los_angeles">Pacific Time (PT)</SelectItem>
                                    <SelectItem value="europe_london">London (GMT)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label>24-Hour Format</Label>
                                  <p className="text-xs text-gray-500">Use 24h time display</p>
                                </div>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-6 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/20">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                              <p className="text-sm text-red-600 dark:text-red-400">Irreversible actions</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">Cancel All Pending Bookings</div>
                                <p className="text-sm text-gray-500">Mass cancel all pending bookings</p>
                              </div>
                              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                Cancel All
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">Reset Booking Page</div>
                                <p className="text-sm text-gray-500">Reset all settings to default</p>
                              </div>
                              <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-700 rounded-lg bg-white dark:bg-gray-800">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">Export All Data</div>
                                <p className="text-sm text-gray-500">Download complete booking history</p>
                              </div>
                              <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
                                <Download className="w-4 h-4" />
                                Export
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { icon: Plus, label: 'New Booking', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
            { icon: Calendar, label: 'Calendar', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            { icon: Users, label: 'Clients', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
            { icon: Video, label: 'Video Meet', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
            { icon: CreditCard, label: 'Payments', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
            { icon: Bell, label: 'Reminders', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
            { icon: BarChart3, label: 'Analytics', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
            { icon: Settings, label: 'Settings', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
          ].map((action, idx) => (
            <Button
              key={idx}
              variant="ghost"
              className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Confirmed</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{stats.confirmed}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-gray-500">Pending</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <span className="text-sm text-gray-500">Revenue</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">${stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-500">Show Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{100 - parseFloat(stats.noShowRate)}%</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span className="text-sm text-gray-500">Avg Duration</span>
            </div>
            <div className="text-2xl font-bold text-indigo-600">{stats.avgDuration}m</div>
          </div>
        </div>

        {/* Booking Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total} Bookings</p>
              </div>
            </div>
            <div className="h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(stats.confirmed / Math.max(stats.total, 1)) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-xl font-bold text-emerald-600">${stats.paidRevenue.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Pending: ${stats.pendingPayments.toLocaleString()}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Conversion</p>
                <p className="text-xl font-bold text-purple-600">{stats.conversionRate}%</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">No-show rate: {stats.noShowRate}%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Duration</p>
                <p className="text-xl font-bold text-amber-600">{stats.avgDuration} min</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Across all booking types</p>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border">
            {(['calendar', 'list', 'agenda'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  view === v
                    ? 'bg-sky-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <>
            {/* Calendar Banner */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Calendar View</h2>
                  <p className="text-emerald-100">Visual scheduling with drag-and-drop booking management</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-emerald-200 text-sm">This Week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.confirmed}</p>
                    <p className="text-emerald-200 text-sm">Confirmed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.pending}</p>
                    <p className="text-emerald-200 text-sm">Pending</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Event', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
                { icon: Calendar, label: 'Day View', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
                { icon: CalendarClock, label: 'Week View', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
                { icon: Globe, label: 'Month View', color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
                { icon: RefreshCw, label: 'Sync', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { icon: Repeat, label: 'Recurring', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Download, label: 'Export', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
                { icon: Filter, label: 'Filter', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
            {/* Calendar Header */}
            <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => navigateCalendar('prev')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => navigateCalendar('next')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200">
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                {(['month', 'week', 'day'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCalendarView(v)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all capitalize ${
                      calendarView === v ? 'bg-white dark:bg-gray-600 shadow-sm' : ''
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Week View */}
            {calendarView === 'week' && (
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Day Headers */}
                  <div className="grid grid-cols-8 border-b dark:border-gray-700">
                    <div className="p-3 text-sm font-medium text-gray-500"></div>
                    {weekDays.map((day, idx) => (
                      <div key={idx} className={`p-3 text-center border-l dark:border-gray-700 ${
                        day.toDateString() === new Date().toDateString() ? 'bg-sky-50 dark:bg-sky-900/20' : ''
                      }`}>
                        <div className="text-xs text-gray-500">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className={`text-lg font-bold ${
                          day.toDateString() === new Date().toDateString() ? 'text-sky-600' : ''
                        }`}>{day.getDate()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <ScrollArea className="h-[500px]">
                    {timeSlots.slice(0, 18).map((slot, idx) => (
                      <div key={idx} className="grid grid-cols-8 border-b dark:border-gray-700">
                        <div className="p-2 text-xs text-gray-500 text-right pr-3">{slot.time}</div>
                        {weekDays.map((day, dayIdx) => (
                          <div key={dayIdx} className="border-l dark:border-gray-700 min-h-[60px] p-1 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative group">
                            {/* Sample bookings */}
                            {Math.random() > 0.85 && (
                              <div className={`absolute inset-1 rounded p-1 text-xs font-medium ${
                                ['bg-sky-100 text-sky-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700'][Math.floor(Math.random() * 3)]
                              }`}>
                                <p className="truncate">Strategy Call</p>
                                <p className="text-[10px] opacity-75">John D.</p>
                              </div>
                            )}
                            <button className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-sky-50/80 dark:bg-sky-900/50 transition-opacity">
                              <Plus className="h-4 w-4 text-sky-600" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            )}

            {/* Day View */}
            {calendarView === 'day' && (
              <div className="p-4">
                <h4 className="font-medium mb-4">{formatDate(currentDate)}</h4>
                <div className="space-y-2">
                  {timeSlots.map((slot, idx) => (
                    <div key={idx} className="flex items-center gap-4 py-2 border-b dark:border-gray-700">
                      <span className="text-sm text-gray-500 w-20">{slot.time}</span>
                      <div className={`flex-1 p-3 rounded-lg ${slot.available ? 'bg-gray-50 dark:bg-gray-700 hover:bg-sky-50 dark:hover:bg-sky-900/30 cursor-pointer' : 'bg-gray-100 dark:bg-gray-600'}`}>
                        {slot.available ? (
                          <span className="text-sm text-gray-500">Available</span>
                        ) : (
                          <span className="text-sm text-gray-400">Blocked</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Month View */}
            {calendarView === 'month' && (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">{day}</div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - currentDate.getDay() + 1)
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                    const isToday = day.toDateString() === new Date().toDateString()
                    const hasBookings = Math.random() > 0.6

                    return (
                      <div
                        key={i}
                        className={`p-2 min-h-[80px] rounded-lg border ${
                          isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                        } ${isToday ? 'border-sky-500 ring-1 ring-sky-500' : 'border-transparent'} hover:border-sky-300 cursor-pointer`}
                      >
                        <div className={`text-sm ${isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'} ${isToday ? 'font-bold text-sky-600' : ''}`}>
                          {day.getDate()}
                        </div>
                        {hasBookings && isCurrentMonth && (
                          <div className="mt-1 space-y-1">
                            <div className="h-1.5 w-full bg-sky-500 rounded"></div>
                            {Math.random() > 0.5 && <div className="h-1.5 w-3/4 bg-purple-500 rounded"></div>}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {/* List View */}
        {view === 'list' && (
          <>
            {/* List Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Booking List</h2>
                  <p className="text-amber-100">Detailed view with advanced filtering and bulk actions</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredBookings.length}</p>
                    <p className="text-amber-200 text-sm">Showing</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                    <p className="text-amber-200 text-sm">Total Value</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{stats.conversionRate}%</p>
                    <p className="text-amber-200 text-sm">Show Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* List Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'Add Booking', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Filter, label: 'Filter', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Search, label: 'Search', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Check, label: 'Confirm All', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Mail, label: 'Email All', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: Download, label: 'Export', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
                { icon: FileText, label: 'Reports', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Settings, label: 'Settings', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

          <div className="space-y-4">
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading bookings from database...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Bookings</h3>
                <p className="text-red-600 dark:text-red-300 mb-4">{error.message}</p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && filteredBookings.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Bookings Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {searchQuery ? 'No bookings match your search criteria.' : 'You don\'t have any bookings yet.'}
                </p>
                <Button
                  onClick={() => setShowNewBooking(true)}
                  className="bg-sky-600 hover:bg-sky-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Booking
                </Button>
              </div>
            )}

            {!loading && !error && filteredBookings.map(booking => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs bg-sky-100 text-sky-700">{booking.booking_type}</span>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        booking.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        booking.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.payment_status}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold mb-1">{booking.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {booking.customer_name && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.customer_name}
                        </span>
                      )}
                      {booking.booking_number && (
                        <span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {booking.booking_number}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.start_time).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </span>
                      <span>{booking.duration_minutes} min</span>
                      {booking.guest_count > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {booking.guest_count} guests
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-sky-600">${booking.price.toFixed(2)}</div>
                    {booking.balance_due > 0 && (
                      <div className="text-xs text-red-600 mt-1">Due: ${booking.balance_due.toFixed(2)}</div>
                    )}
                    <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}

        {/* Agenda View */}
        {view === 'agenda' && (
          <>
            {/* Agenda Banner */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Agenda View</h2>
                  <p className="text-indigo-100">Timeline view organized by day with smart grouping</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredBookings.slice(0, 3).length}</p>
                    <p className="text-indigo-200 text-sm">Today</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredBookings.slice(3, 5).length}</p>
                    <p className="text-indigo-200 text-sm">Tomorrow</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">{filteredBookings.slice(5).length}</p>
                    <p className="text-indigo-200 text-sm">Upcoming</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
              {[
                { icon: Plus, label: 'New Event', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
                { icon: Calendar, label: 'Today', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
                { icon: Clock, label: 'This Week', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
                { icon: CalendarClock, label: 'This Month', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
                { icon: Filter, label: 'Filter', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
                { icon: Bell, label: 'Reminders', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { icon: Repeat, label: 'Recurring', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
                { icon: Download, label: 'Export', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
              ].map((action, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className={`h-20 flex-col gap-2 ${action.color} hover:scale-105 transition-all duration-200`}
                >
                  <action.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Button>
              ))}
            </div>

          <div className="space-y-6">
            {/* Today */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <div className="h-2 w-2 bg-sky-500 rounded-full"></div>
                Today
              </h3>
              <div className="space-y-2">
                {filteredBookings.slice(0, 3).map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-sky-600">{formatTime(booking.start_time)}</div>
                        <div className="text-xs text-gray-500">{booking.duration_minutes}m</div>
                      </div>
                      <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        <p className="text-sm text-gray-500">{booking.customer_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.status}
                      </span>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Video className="h-4 w-4 text-sky-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tomorrow */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-500">Tomorrow</h3>
              <div className="space-y-2">
                {filteredBookings.slice(3, 5).map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="text-lg font-bold text-gray-600">{formatTime(booking.start_time)}</div>
                        <div className="text-xs text-gray-500">{booking.duration_minutes}m</div>
                      </div>
                      <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        <p className="text-sm text-gray-500">{booking.customer_name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-500">Upcoming This Week</h3>
              <div className="space-y-2">
                {filteredBookings.slice(5).map(booking => (
                  <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[80px]">
                        <div className="text-sm font-medium">{new Date(booking.start_time).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                        <div className="text-lg font-bold text-gray-600">{formatTime(booking.start_time)}</div>
                      </div>
                      <div className="h-10 w-px bg-gray-200 dark:bg-gray-700"></div>
                      <div>
                        <p className="font-medium">{booking.title}</p>
                        <p className="text-sm text-gray-500">{booking.customer_name}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Booking Detail Modal */}
        {selectedBooking && (
          <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedBooking.title}</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="details" className="mt-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="client">Client</TabsTrigger>
                  <TabsTrigger value="actions">Actions</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        Date & Time
                      </div>
                      <p className="font-medium">{new Date(selectedBooking.start_time).toLocaleDateString()}</p>
                      <p className="text-sm">{formatTime(selectedBooking.start_time)} - {formatTime(selectedBooking.end_time)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <DollarSign className="h-4 w-4" />
                        Payment
                      </div>
                      <p className="font-medium">${selectedBooking.price.toFixed(2)}</p>
                      <p className={`text-sm ${selectedBooking.payment_status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {selectedBooking.payment_status}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Video className="h-4 w-4" />
                      Meeting Link
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="https://zoom.us/j/123456789"
                        className="flex-1 px-3 py-2 bg-white dark:bg-gray-700 border rounded-lg text-sm"
                      />
                      <button className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200">
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="client" className="mt-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-xl font-bold">
                      {selectedBooking.customer_name?.split(' ').map(n => n[0]).join('') || 'C'}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold">{selectedBooking.customer_name || 'Client'}</h4>
                      <p className="text-sm text-gray-500">Client since Jan 2024</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">client@example.com</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">America/New_York (EST)</span>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="actions" className="mt-4 space-y-3">
                  {selectedBooking.status === 'pending' && (
                    <button
                      onClick={() => handleConfirmBooking(selectedBooking)}
                      className="w-full py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Confirm Booking
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenMeeting(selectedBooking)}
                    className="w-full py-3 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center justify-center gap-2"
                  >
                    <Video className="h-4 w-4" />
                    Start Meeting
                  </button>
                  <button
                    onClick={() => handleReschedule(selectedBooking)}
                    className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleSendReminder(selectedBooking)}
                    className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking)}
                    className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => handleDeleteBooking(selectedBooking)}
                    className="w-full py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Booking
                  </button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}

        {/* Reschedule Dialog */}
        <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reschedule Booking</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Date</label>
                <input
                  type="date"
                  value={rescheduleData?.newDate || ''}
                  onChange={(e) => setRescheduleData(prev => prev ? { ...prev, newDate: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Time</label>
                <select
                  value={rescheduleData?.newTime || '09:00'}
                  onChange={(e) => setRescheduleData(prev => prev ? { ...prev, newTime: e.target.value } : null)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                >
                  {timeSlots.filter(s => s.available).map(slot => (
                    <option key={slot.time} value={slot.time}>{slot.time}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <button
                onClick={() => {
                  setShowRescheduleDialog(false)
                  setRescheduleData(null)
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Confirm Reschedule
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Competitive Upgrade Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <AIInsightsPanel
              insights={mockBookingsAIInsights}
              title="Booking Intelligence"
              onInsightAction={(insight) => toast.info(insight.title || 'AI Insight', { description: insight.description || 'View insight details' })}
            />
          </div>
          <div className="space-y-6">
            <CollaborationIndicator
              collaborators={mockBookingsCollaborators}
              maxVisible={4}
            />
            <PredictiveAnalytics
              predictions={mockBookingsPredictions}
              title="Booking Forecasts"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ActivityFeed
            activities={mockBookingsActivities}
            title="Booking Activity"
            maxItems={5}
          />
          <QuickActionsToolbar
            actions={bookingsQuickActions}
            variant="grid"
          />
        </div>

        {/* Quick Stats Footer */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">Booking Page</h4>
              <p className="text-sm text-gray-500">Share your booking link with clients</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm">
                book.freeflow.app/your-company
              </div>
              <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
            </div>
          </div>
        </div>

        {/* Block Time Dialog */}
        <Dialog open={showBlockTimeDialog} onOpenChange={setShowBlockTimeDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-sky-600" />
                Block Time Slot
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800">
                <p className="text-sm text-sky-700 dark:text-sky-300">
                  Block unavailable hours to prevent bookings during specific times. Blocked time will appear as unavailable on your booking page.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={blockTimeForm.date}
                    onChange={(e) => setBlockTimeForm({ ...blockTimeForm, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select
                      value={blockTimeForm.startTime}
                      onValueChange={(value) => setBlockTimeForm({ ...blockTimeForm, startTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <>
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{hour}:00</SelectItem>
                              <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{hour}:30</SelectItem>
                            </>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select
                      value={blockTimeForm.endTime}
                      onValueChange={(value) => setBlockTimeForm({ ...blockTimeForm, endTime: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0')
                          return (
                            <>
                              <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{hour}:00</SelectItem>
                              <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{hour}:30</SelectItem>
                            </>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Input
                    placeholder="e.g., Lunch break, Personal time, Meeting..."
                    value={blockTimeForm.reason}
                    onChange={(e) => setBlockTimeForm({ ...blockTimeForm, reason: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
                  <div>
                    <Label className="font-medium">Recurring Block</Label>
                    <p className="text-xs text-gray-500">Block this time every week</p>
                  </div>
                  <Switch
                    checked={blockTimeForm.recurring}
                    onCheckedChange={(checked) => setBlockTimeForm({ ...blockTimeForm, recurring: checked })}
                  />
                </div>

                {blockTimeForm.recurring && (
                  <div className="space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Label>Repeat on</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = blockTimeForm.recurringDays.includes(day)
                              ? blockTimeForm.recurringDays.filter((d) => d !== day)
                              : [...blockTimeForm.recurringDays, day]
                            setBlockTimeForm({ ...blockTimeForm, recurringDays: days })
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            blockTimeForm.recurringDays.includes(day)
                              ? 'bg-sky-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBlockTimeDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-sky-600 hover:bg-sky-700"
                onClick={() => {
                  if (!blockTimeForm.date) {
                    toast.error('Date required', { description: 'Please select a date to block' })
                    return
                  }
                  if (blockTimeForm.startTime >= blockTimeForm.endTime) {
                    toast.error('Invalid time range', { description: 'End time must be after start time' })
                    return
                  }
                  if (blockTimeForm.recurring && blockTimeForm.recurringDays.length === 0) {
                    toast.error('Select days', { description: 'Please select at least one day for recurring block' })
                    return
                  }
                  toast.promise(
                    new Promise((resolve) => setTimeout(resolve, 1000)),
                    {
                      loading: 'Blocking time slot...',
                      success: () => {
                        setShowBlockTimeDialog(false)
                        setBlockTimeForm({
                          date: '',
                          startTime: '09:00',
                          endTime: '17:00',
                          reason: '',
                          recurring: false,
                          recurringDays: []
                        })
                        return `Time blocked: ${blockTimeForm.date} from ${blockTimeForm.startTime} to ${blockTimeForm.endTime}${blockTimeForm.reason ? ` (${blockTimeForm.reason})` : ''}`
                      },
                      error: 'Failed to block time slot'
                    }
                  )
                }}
              >
                <Timer className="h-4 w-4 mr-2" />
                Block Time
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
