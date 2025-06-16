'use client'

import React, { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format } from 'date-fns/format'
import { parse } from 'date-fns/parse'
import { startOfWeek } from 'date-fns/startOfWeek'
import { getDay } from 'date-fns/getDay'
import { enUS } from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Calendar as CalendarIcon,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Check,
  X,
  Star,
  Video,
  TrendingUp,
  Eye,
  Edit,
  Download,
  Settings
} from 'lucide-react'

import { BookingService, Booking, CalendarEvent, BookingAnalytics } from '@/types/booking'

// Configure date-fns localizer for react-big-calendar
const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Mock data
const mockServices: BookingService[] = [
  {
    id: '1',
    title: 'Initial Consultation',
    description: 'Strategic planning and project scoping session',
    duration: 60,
    price: 15000,
    category: 'consultation',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 30,
    bufferTime: 15,
    tags: ['strategy', 'planning', 'consultation'],
    requirements: ['Project brief', 'Budget range'],
    deliverables: ['Project proposal', 'Timeline'],
  },
  {
    id: '2',
    title: 'Design Review',
    description: 'Review and feedback on design concepts',
    duration: 45,
    price: 12000,
    category: 'review',
    freelancerId: 'user1',
    isActive: true,
    maxAdvanceBooking: 14,
    bufferTime: 10,
    tags: ['design', 'review', 'feedback'],
  }
]

const mockBookings: Booking[] = [
  {
    id: '1',
    clientId: 'client1',
    clientEmail: 'john@company.com',
    clientName: 'John Smith',
    freelancerId: 'user1',
    serviceId: '1',
    timeSlotId: 'slot1',
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentIntentId: 'pi_1234567890',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    totalAmount: 15000,
    notes: 'New website project discussion',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

const mockAnalytics: BookingAnalytics = {
  totalBookings: 47,
  totalRevenue: 584000,
  completedBookings: 42,
  cancelledBookings: 3,
  noShowBookings: 2,
  averageBookingValue: 12426,
  popularServices: [
    { serviceId: '1', serviceName: 'Initial Consultation', bookingCount: 18, revenue: 270000 }
  ],
  revenueByMonth: [
    { month: 'Jan', revenue: 180000, bookingCount: 15 }
  ],
  clientRetentionRate: 68,
  averageRating: 4.8
}

export default function BookingsPage() {
  const [selectedTab, setSelectedTab] = useState('calendar')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Convert bookings to calendar events
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return mockBookings.map(booking => {
      const service = mockServices.find(s => s.id === booking.serviceId)
      return {
        id: booking.id,
        title: `${service?.title || 'Service'} - ${booking.clientName}`,
        start: new Date(booking.startTime),
        end: new Date(booking.endTime),
        resource: {
          bookingId: booking.id,
          serviceId: booking.serviceId,
          clientName: booking.clientName,
          status: booking.status,
          paymentStatus: booking.paymentStatus,
        }
      }
    })
  }, [])

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'paid': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: Booking['paymentStatus']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage your appointments and availability</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Service
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.totalBookings}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <CalendarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+12%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(mockAnalytics.totalRevenue / 100).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">+8%</span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round((mockAnalytics.completedBookings / mockAnalytics.totalBookings) * 100)}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Check className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{mockAnalytics.averageRating}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              {/* Calendar View */}
              <TabsContent value="calendar" className="space-y-4">
                <div className="h-[600px]">
                  <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    defaultView={Views.WEEK}
                    eventPropGetter={(event) => ({
                      style: {
                        backgroundColor: event.resource?.status === 'confirmed' ? '#10b981' :
                                       event.resource?.status === 'pending' ? '#f59e0b' : '#6b7280',
                        borderRadius: '4px',
                        opacity: 0.8,
                        color: 'white',
                        border: '0px',
                        display: 'block'
                      }
                    })}
                  />
                </div>
              </TabsContent>

              {/* Bookings List */}
              <TabsContent value="bookings" className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {mockBookings.map((booking) => {
                    const service = mockServices.find(s => s.id === booking.serviceId)
                    return (
                      <Card key={booking.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar>
                                <AvatarFallback>
                                  {booking.clientName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-gray-900">{booking.clientName}</h3>
                                <p className="text-sm text-gray-600">{booking.clientEmail}</p>
                                <p className="text-sm text-gray-500">{service?.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">
                                  {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  ${(booking.totalAmount / 100).toFixed(2)}
                                </p>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Badge className={getStatusColor(booking.status)}>
                                  {booking.status}
                                </Badge>
                                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                  {booking.paymentStatus}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              {/* Services */}
              <TabsContent value="services" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockServices.map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-gray-900">{service.title}</h3>
                          <Badge variant={service.isActive ? 'default' : 'secondary'}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span className="font-medium">{service.duration} minutes</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Price:</span>
                            <span className="font-medium">${(service.price / 100).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics */}
              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(mockAnalytics.totalRevenue / 100).toFixed(2)}
                    </div>
                    <p className="text-gray-600">Total revenue from {mockAnalytics.totalBookings} bookings</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 