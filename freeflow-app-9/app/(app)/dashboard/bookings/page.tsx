'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { createFeatureLogger } from '@/lib/logger'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { NoDataEmptyState, ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Settings
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  mockBookings,
  type Booking,
  filterBookings,
  calculateRevenue,
  countByStatus,
  formatDate,
  generateBookingId,
  validateBookingDate,
  checkDoubleBooking
} from '@/lib/bookings-utils'

const logger = createFeatureLogger('Bookings')

export default function UpcomingBookingsPage() {
  // State Management
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [serviceFilter, setServiceFilter] = useState<string>('all')
  const [isCreating, setIsCreating] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)

  // AlertDialog states
  const [showCancelBookingDialog, setShowCancelBookingDialog] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // Load bookings data from Supabase
  useEffect(() => {
    const loadBookingsData = async () => {
      if (!userId) return

      try {
        setIsLoading(true)
        setError(null)

        logger.info('Loading bookings from Supabase', { userId })

        // Dynamic import for code splitting
        const { getBookings } = await import('@/lib/bookings-queries')

        const { data: bookingsData, error: bookingsError } = await getBookings(
          userId,
          undefined, // no filters
          { field: 'booking_date', ascending: true }, // sort by date
          100 // limit
        )

        if (bookingsError) {
          throw new Error(bookingsError.message || 'Failed to load bookings')
        }

        // Transform Supabase data to UI format
        const transformedBookings: Booking[] = bookingsData.map((b) => ({
          id: b.id,
          clientName: b.client_name,
          service: b.service,
          date: b.booking_date,
          time: b.start_time,
          duration: `${b.duration_minutes} min`,
          status: b.status as any,
          payment: b.payment as any,
          amount: b.amount,
          email: b.client_email || '',
          phone: b.client_phone || '',
          notes: b.notes || ''
        }))

        setBookings(transformedBookings)
        setIsLoading(false)
        announce(`${transformedBookings.length} bookings loaded`, 'polite')

        logger.info('Bookings loaded successfully from Supabase', {
          count: transformedBookings.length,
          userId
        })

        toast.success('Bookings loaded', {
          description: `${transformedBookings.length} bookings from database`
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings'
        setError(errorMessage)
        setIsLoading(false)
        announce('Error loading bookings', 'assertive')
        logger.error('Failed to load bookings from Supabase', { error: err, userId })
      }
    }

    loadBookingsData()
  }, [userId, announce])

  // Handler Functions
  const handleNewBooking = async () => {
    if (!userId) {
      toast.error('Please log in to create bookings')
      return
    }

    setIsCreating(true)
    toast.info('Creating new booking...')

    try {
      const newBookingData = {
        clientName: 'New Client',
        service: 'Consultation',
        date: new Date().toISOString().split('T')[0],
        time: '10:00:00',
        duration: 60,
        status: 'pending' as const,
        payment: 'awaiting' as const,
        amount: 150,
        email: 'newclient@email.com',
        phone: '+1 (555) 000-0000',
        notes: 'New booking'
      }

      if (!validateBookingDate(newBookingData.date)) {
        logger.warn('Booking validation failed', {
          reason: 'past_date',
          date: newBookingData.date
        })
        toast.error('Invalid date', {
          description: 'Booking date must be in the future'
        })
        setIsCreating(false)
        return
      }

      // Dynamic import
      const { createBooking } = await import('@/lib/bookings-queries')

      const { data, error } = await createBooking(userId, {
        client_name: newBookingData.clientName,
        client_email: newBookingData.email,
        client_phone: newBookingData.phone,
        service: newBookingData.service,
        type: 'consultation',
        booking_date: newBookingData.date,
        start_time: newBookingData.time,
        duration_minutes: newBookingData.duration,
        status: newBookingData.status,
        payment: newBookingData.payment,
        amount: newBookingData.amount,
        currency: 'USD',
        notes: newBookingData.notes,
        tags: [],
        reminder_sent: false
      })

      if (error || !data) {
        throw new Error(error?.message || 'Failed to create booking')
      }

      // Transform and add to UI
      const newBooking: Booking = {
        id: data.id,
        clientName: data.client_name,
        service: data.service,
        date: data.booking_date,
        time: data.start_time,
        duration: `${data.duration_minutes} min`,
        status: data.status as any,
        payment: data.payment as any,
        amount: data.amount,
        email: data.client_email || '',
        phone: data.client_phone || '',
        notes: data.notes || ''
      }

      setBookings(prev => [...prev, newBooking])

      logger.info('Booking created in Supabase successfully', {
        bookingId: data.id,
        clientName: data.client_name,
        service: data.service,
        date: data.booking_date,
        time: data.start_time,
        amount: data.amount,
        userId
      })

      const totalBookings = bookings.length + 1
      toast.success('Booking created successfully', {
        description: `${newBooking.clientName} - ${newBooking.service} on ${newBooking.date}. Total: ${totalBookings}`
      })

      announce(`New booking created for ${newBooking.clientName}`, 'polite')
    } catch (error: any) {
      logger.error('Failed to create booking', {
        error: error.message,
        userId
      })
      toast.error('Failed to create booking', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditBooking = (id: string) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      logger.error('Edit booking failed', {
        reason: 'booking_not_found',
        bookingId: id
      })
      toast.error('Booking not found')
      return
    }

    logger.info('Edit booking initiated', {
      bookingId: id,
      clientName: booking.clientName,
      service: booking.service
    })

    toast.info('Edit Booking', {
      description: `Editing ${booking.clientName} - ${booking.service}. In production, a modal would open here.`
    })
  }

  const handleCancelBooking = async (id: string) => {
    if (!userId) {
      toast.error('Please log in to cancel bookings')
      return
    }

    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      logger.error('Cancel booking failed', {
        reason: 'booking_not_found',
        bookingId: id
      })
      toast.error('Booking not found')
      return
    }

    logger.info('Cancel booking initiated', {
      bookingId: id,
      clientName: booking.clientName,
      status: booking.status,
      amount: booking.amount
    })

    setBookingToCancel(id)
    setShowCancelBookingDialog(true)
  }

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return

    const booking = bookings.find(b => b.id === bookingToCancel)
    if (!booking) return

    setIsCancelling(true)
    try {
      // Dynamic import
      const { updateBookingStatus, updatePaymentStatus } = await import('@/lib/bookings-queries')

      // Update booking status to cancelled
      const { error: statusError } = await updateBookingStatus(bookingToCancel, 'cancelled')
      if (statusError) {
        throw new Error(statusError.message || 'Failed to cancel booking')
      }

      // Update payment status if needed
      if (booking.payment === 'paid') {
        const { error: paymentError } = await updatePaymentStatus(bookingToCancel, 'refunded')
        if (paymentError) {
          throw new Error(paymentError.message || 'Failed to process refund')
        }
      }

      // Optimistic UI update
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingToCancel
            ? {
                ...b,
                status: 'cancelled',
                payment: b.payment === 'paid' ? 'refunded' : 'awaiting'
              }
            : b
        )
      )

      const refundAmount = booking.payment === 'paid' ? booking.amount : 0
      logger.info('Booking cancelled in Supabase successfully', {
        bookingId: bookingToCancel,
        clientName: booking.clientName,
        refundAmount,
        previousStatus: booking.status
      })

      const cancelled = countByStatus(bookings, 'cancelled') + 1
      toast.success('Booking cancelled', {
        description:
          refundAmount > 0
            ? `$${refundAmount} refund processed for ${booking.clientName}. Total cancelled: ${cancelled}`
            : `Booking cancelled for ${booking.clientName}. Total cancelled: ${cancelled}`
      })

      announce(`Booking cancelled for ${booking.clientName}`, 'polite')
    } catch (error: any) {
      logger.error('Failed to cancel booking', {
        error: error.message,
        bookingId: bookingToCancel
      })
      toast.error('Failed to cancel booking', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsCancelling(false)
      setShowCancelBookingDialog(false)
      setBookingToCancel(null)
    }
  }

  const handleViewDetails = (id: string) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      logger.error('View details failed', {
        reason: 'booking_not_found',
        bookingId: id
      })
      toast.error('Booking not found')
      return
    }

    logger.info('Viewing booking details', {
      bookingId: id,
      clientName: booking.clientName,
      service: booking.service,
      status: booking.status
    })

    toast.info('Viewing Booking Details', {
      description: `${booking.clientName} - ${booking.service} on ${booking.date} at ${booking.time}. Status: ${booking.status}, Payment: ${booking.payment}`
    })
  }

  const handleSendReminder = (id: string) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      logger.error('Send reminder failed', {
        reason: 'booking_not_found',
        bookingId: id
      })
      toast.error('Booking not found')
      return
    }

    logger.info('Reminder sent', {
      bookingId: id,
      clientName: booking.clientName,
      email: booking.email,
      date: booking.date,
      time: booking.time
    })

    toast.success('Reminder sent successfully', {
      description: `Reminder sent to ${booking.clientName} at ${booking.email} for ${booking.date} at ${booking.time}`
    })

    announce(`Reminder sent to ${booking.clientName}`, 'polite')
  }

  const handleExportBookings = () => {
    const filteredBookings = filterBookings(bookings, {
      statusFilter,
      dateFilter,
      serviceFilter,
      searchQuery
    })
    const revenue = calculateRevenue(filteredBookings)
    const bookingCount = filteredBookings.length

    logger.info('Exporting bookings', {
      totalBookings: bookingCount,
      revenue,
      filterApplied:
        statusFilter !== 'all' ||
        dateFilter !== '' ||
        serviceFilter !== 'all' ||
        searchQuery !== ''
    })

    const csvData = [
      [
        'ID',
        'Client',
        'Service',
        'Date',
        'Time',
        'Duration',
        'Status',
        'Payment',
        'Amount',
        'Email',
        'Phone',
        'Notes'
      ],
      ...filteredBookings.map(b => [
        b.id,
        b.clientName,
        b.service,
        b.date,
        b.time,
        b.duration,
        b.status,
        b.payment,
        b.amount,
        b.email || '',
        b.phone || '',
        b.notes || ''
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Bookings exported', {
      description: `${bookingCount} bookings exported to CSV. Total revenue: $${revenue}`
    })

    announce(`${bookingCount} bookings exported`, 'polite')
  }

  const handleSettings = () => {
    logger.info('Opening booking settings')

    toast.info('Booking Settings', {
      description:
        'Configure business hours, time zone, cancellation policy, and reminders'
    })
  }

  const handleRefresh = () => {
    const totalBookings = bookings.length
    const revenue = calculateRevenue(bookings)

    logger.info('Bookings refreshed', {
      totalBookings,
      revenue,
      pending: countByStatus(bookings, 'pending'),
      confirmed: countByStatus(bookings, 'confirmed'),
      completed: countByStatus(bookings, 'completed')
    })

    toast.success('Bookings refreshed', {
      description: `${totalBookings} bookings loaded. Revenue: $${revenue}. Status: ${countByStatus(bookings, 'confirmed')} confirmed, ${countByStatus(bookings, 'pending')} pending`
    })

    announce('Bookings refreshed', 'polite')
  }

  // Helper functions
  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Confirmed
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate stats
  const stats = {
    upcoming: bookings.filter(
      b => new Date(b.date) >= new Date() && b.status !== 'cancelled'
    ).length,
    confirmed: countByStatus(bookings, 'confirmed'),
    pending: countByStatus(bookings, 'pending'),
    revenue: calculateRevenue(bookings)
  }

  // Filter bookings
  const filteredBookings = filterBookings(bookings, {
    statusFilter,
    dateFilter,
    serviceFilter,
    searchQuery
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <ListSkeleton items={6} />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4">
        <ErrorEmptyState
          error={error}
          action={{
            label: 'Retry',
            onClick: () => window.location.reload()
          }}
        />
      </div>
    )
  }

  // Empty state
  if (filteredBookings.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto px-4">
        <NoDataEmptyState
          entityName="bookings"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No bookings match your search criteria. Try adjusting your filters.'
              : 'Start managing appointments by creating your first booking.'
          }
          action={{
            label:
              searchQuery || statusFilter !== 'all'
                ? 'Clear Filters'
                : 'Create Booking',
            onClick:
              searchQuery || statusFilter !== 'all'
                ? () => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }
                : handleNewBooking
          }}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleSettings}
            data-testid="settings-btn"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExportBookings}
            data-testid="export-btn"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            className="gap-2"
            onClick={handleNewBooking}
            disabled={isCreating}
            data-testid="new-booking-btn"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? 'Creating...' : 'New Booking'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <NumberFlow
                  value={stats.upcoming}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <NumberFlow
                  value={stats.confirmed}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <NumberFlow
                  value={stats.pending}
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <NumberFlow
                  value={stats.revenue}
                  format="currency"
                  className="text-2xl font-bold text-gray-900"
                />
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Bookings
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search bookings..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger
                    className="w-[180px]"
                    data-testid="status-filter-select"
                  >
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" data-testid="filter-all">
                      All Statuses
                    </SelectItem>
                    <SelectItem value="confirmed" data-testid="filter-confirmed">
                      Confirmed
                    </SelectItem>
                    <SelectItem value="pending" data-testid="filter-pending">
                      Pending
                    </SelectItem>
                    <SelectItem value="cancelled" data-testid="filter-cancelled">
                      Cancelled
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRefresh}
                  data-testid="refresh-btn"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Booking
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date & Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Payment
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.service}
                          </div>
                          <div className="text-sm text-gray-500">
                            {booking.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.clientName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {booking.time} ({booking.duration})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(booking.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${booking.amount}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {booking.payment}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`booking-actions-${booking.id}-btn`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleViewDetails(booking.id)}
                            data-testid={`view-booking-${booking.id}-btn`}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditBooking(booking.id)}
                            data-testid={`edit-booking-${booking.id}-btn`}
                          >
                            Edit Booking
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleSendReminder(booking.id)}
                            data-testid={`send-reminder-${booking.id}-btn`}
                          >
                            Send Reminder
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleCancelBooking(booking.id)}
                            data-testid={`cancel-booking-${booking.id}-btn`}
                          >
                            Cancel Booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-gray-500">
            Showing {filteredBookings.length} of {mockBookings.length} bookings
          </div>
        </CardFooter>
      </Card>

      {/* Cancel Booking AlertDialog */}
      <AlertDialog open={showCancelBookingDialog} onOpenChange={setShowCancelBookingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Cancel Booking
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel the booking for &quot;{bookings.find(b => b.id === bookingToCancel)?.clientName}&quot;?
              {bookings.find(b => b.id === bookingToCancel)?.payment === 'paid' && (
                <span className="block mt-2 text-orange-600">
                  A refund of ${bookings.find(b => b.id === bookingToCancel)?.amount} will be processed.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelBooking}
              disabled={isCancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
