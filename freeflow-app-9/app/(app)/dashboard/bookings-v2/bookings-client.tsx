'use client'
import { useState, useMemo } from 'react'
import { useBookings, type Booking, type BookingType, type BookingStatus, type PaymentStatus } from '@/lib/hooks/use-bookings'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar, Clock, Users, DollarSign, Video, MapPin, Plus, Settings,
  ChevronLeft, ChevronRight, Search, Filter, MoreVertical, Check, X,
  Bell, Link2, Mail, Phone, Globe, Copy, ExternalLink, CreditCard,
  Repeat, UserCheck, CalendarClock, Zap, RefreshCw, Download
} from 'lucide-react'

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

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookingTypeFilter, setBookingTypeFilter] = useState<BookingType | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all')
  const [view, setView] = useState<ViewType>('calendar')
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showNewBooking, setShowNewBooking] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const { bookings, loading, error } = useBookings({ bookingType: bookingTypeFilter, status: statusFilter, paymentStatus: paymentStatusFilter })
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

  if (error) return <div className="p-8"><div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">Error: {error.message}</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 dark:bg-none dark:bg-gray-900 p-8">
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
                  <span className="px-3 py-1 bg-emerald-500/30 rounded-full text-sm font-medium backdrop-blur-sm">
                    Auto-Sync
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
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Service Type</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              {serviceTypes.map(service => (
                                <option key={service.id} value={service.id}>{service.name} ({service.duration}min)</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Team Member</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              <option value="">Auto-assign (Round Robin)</option>
                              {teamMembers.map(member => (
                                <option key={member.id} value={member.id}>{member.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input type="date" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <select className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700">
                              {timeSlots.filter(s => s.available).map(slot => (
                                <option key={slot.time} value={slot.time}>{slot.time}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Client Name</label>
                          <input type="text" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="Enter client name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Client Email</label>
                          <input type="email" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" placeholder="client@example.com" />
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Add video meeting (Zoom)</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Require payment</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <button onClick={() => setShowNewBooking(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                            Cancel
                          </button>
                          <button className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
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
                <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                  <Bell className="h-5 w-5" />
                </button>
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all">
                      <Settings className="h-5 w-5" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Booking Settings</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="availability" className="mt-4">
                      <TabsList className="grid grid-cols-4 w-full">
                        <TabsTrigger value="availability">Availability</TabsTrigger>
                        <TabsTrigger value="services">Services</TabsTrigger>
                        <TabsTrigger value="team">Team</TabsTrigger>
                        <TabsTrigger value="integrations">Integrations</TabsTrigger>
                      </TabsList>
                      <TabsContent value="availability" className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-3">Working Hours</h4>
                          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                            <div key={day} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-700">
                              <span className="font-medium">{day}</span>
                              <div className="flex items-center gap-2">
                                <select className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600">
                                  <option>9:00 AM</option>
                                  <option>10:00 AM</option>
                                </select>
                                <span className="text-gray-400">to</span>
                                <select className="px-2 py-1 text-sm border rounded dark:bg-gray-700 dark:border-gray-600">
                                  <option>5:00 PM</option>
                                  <option>6:00 PM</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <h4 className="font-medium mb-3">Buffer Time</h4>
                          <div className="flex items-center gap-4">
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">Before meetings</label>
                              <select className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <option>5 minutes</option>
                                <option>10 minutes</option>
                                <option>15 minutes</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm text-gray-500 mb-1">After meetings</label>
                              <select className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600">
                                <option>5 minutes</option>
                                <option>10 minutes</option>
                                <option>15 minutes</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="services" className="mt-4 space-y-4">
                        {serviceTypes.map(service => (
                          <div key={service.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full bg-${service.color}-500`}></div>
                              <div>
                                <p className="font-medium">{service.name}</p>
                                <p className="text-sm text-gray-500">{service.duration} min • ${service.price}</p>
                              </div>
                            </div>
                            <button className="text-sm text-sky-600 hover:underline">Edit</button>
                          </div>
                        ))}
                        <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-sky-500 hover:text-sky-500">
                          + Add Service
                        </button>
                      </TabsContent>
                      <TabsContent value="team" className="mt-4 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Round-Robin Assignment</h4>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                            </label>
                          </div>
                          <p className="text-sm text-gray-500">Automatically distribute bookings evenly among team members</p>
                        </div>
                        {teamMembers.map(member => (
                          <div key={member.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-medium">
                                {member.avatar}
                              </div>
                              <div>
                                <p className="font-medium">{member.name}</p>
                                <p className="text-sm text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{member.bookingsToday} bookings today</p>
                              <p className="text-xs text-gray-500">{member.availability.join(', ')}</p>
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      <TabsContent value="integrations" className="mt-4 space-y-4">
                        {[
                          { name: 'Zoom', description: 'Auto-create meeting links', icon: Video, connected: true },
                          { name: 'Google Calendar', description: 'Two-way sync', icon: Calendar, connected: true },
                          { name: 'Stripe', description: 'Accept payments', icon: CreditCard, connected: true },
                          { name: 'Google Meet', description: 'Alternative video provider', icon: Video, connected: false },
                          { name: 'Outlook', description: 'Calendar sync', icon: Calendar, connected: false }
                        ].map((integration, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${integration.connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                <integration.icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{integration.name}</p>
                                <p className="text-sm text-gray-500">{integration.description}</p>
                              </div>
                            </div>
                            {integration.connected ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Connected</span>
                            ) : (
                              <button className="px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-sm hover:bg-sky-200">Connect</button>
                            )}
                          </div>
                        ))}
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
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
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="space-y-4">
            {loading && (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
              </div>
            )}

            {filteredBookings.map(booking => (
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
        )}

        {/* Agenda View */}
        {view === 'agenda' && (
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
                  <div className="grid grid-cols-2 gap-4">
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
                  <button className="w-full py-3 px-4 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center justify-center gap-2">
                    <Video className="h-4 w-4" />
                    Start Meeting
                  </button>
                  <button className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reschedule
                  </button>
                  <button className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-2">
                    <Mail className="h-4 w-4" />
                    Send Reminder
                  </button>
                  <button className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 flex items-center justify-center gap-2">
                    <X className="h-4 w-4" />
                    Cancel Booking
                  </button>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}

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
      </div>
    </div>
  )
}
