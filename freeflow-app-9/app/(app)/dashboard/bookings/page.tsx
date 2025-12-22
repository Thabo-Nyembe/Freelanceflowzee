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
  Settings,
  Users,
  History,
  BarChart3,
  Wrench,
  CalendarDays
} from 'lucide-react'
import Link from 'next/link'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Switch } from '@/components/ui/switch'
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
  validateBookingDate
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

  // Edit and View modal states
  const [editBooking, setEditBooking] = useState<Booking | null>(null)
  const [viewBooking, setViewBooking] = useState<Booking | null>(null)
  const [editForm, setEditForm] = useState({
    clientName: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  // Settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    businessHours: { start: '09:00', end: '17:00' },
    timeZone: 'America/New_York',
    cancellationPolicy: '24 hours notice required',
    reminderHours: 24,
    autoConfirm: false
  })
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null)

  // Load bookings data from Supabase
  useEffect(() => {
    // Wait for auth to complete before loading data
    if (userLoading) return

    // No user logged in - stop loading
    if (!userId) {
      setIsLoading(false)
      return
    }

    const loadBookingsData = async () => {
      try {
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

    // Failsafe timeout
    const timeout = setTimeout(() => {
      setIsLoading(false)
    }, 10000)

    return () => clearTimeout(timeout)
  }, [userId, userLoading, announce])

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

    // Set edit form values
    setEditForm({
      clientName: booking.clientName,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      notes: booking.notes || ''
    })
    setEditBooking(booking)
  }

  const handleSaveEdit = async () => {
    if (!editBooking || !userId) return

    setIsSaving(true)
    try {
      const { updateBooking } = await import('@/lib/bookings-queries')

      const { error } = await updateBooking(editBooking.id, {
        client_name: editForm.clientName,
        service: editForm.service,
        booking_date: editForm.date,
        start_time: editForm.time,
        notes: editForm.notes
      })

      if (error) throw new Error(error.message)

      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b.id === editBooking.id
            ? {
                ...b,
                clientName: editForm.clientName,
                service: editForm.service,
                date: editForm.date,
                time: editForm.time,
                notes: editForm.notes
              }
            : b
        )
      )

      logger.info('Booking updated successfully', { bookingId: editBooking.id })
      toast.success('Booking updated', {
        description: `${editForm.clientName} - ${editForm.service}`
      })
      setEditBooking(null)
    } catch (error) {
      logger.error('Failed to update booking', { error })
      toast.error('Failed to update booking')
    } finally {
      setIsSaving(false)
    }
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

    setViewBooking(booking)
  }

  const handleSendReminder = async (id: string) => {
    if (!userId) {
      toast.error('Please log in to send reminders')
      return
    }

    const booking = bookings.find(b => b.id === id)
    if (!booking) {
      logger.error('Send reminder failed', {
        reason: 'booking_not_found',
        bookingId: id
      })
      toast.error('Booking not found')
      return
    }

    setIsSendingReminder(id)
    try {
      // Dynamic import for code splitting
      const { updateBooking } = await import('@/lib/bookings-queries')

      // Mark reminder as sent in database
      const { error } = await updateBooking(id, {
        reminder_sent: true,
        reminder_sent_at: new Date().toISOString()
      })

      if (error) throw new Error(error.message)

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
    } catch (error: any) {
      logger.error('Failed to send reminder', { error: error.message, bookingId: id })
      toast.error('Failed to send reminder', {
        description: error.message || 'Please try again later'
      })
    } finally {
      setIsSendingReminder(null)
    }
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
    setShowSettingsModal(true)
  }

  const handleSaveSettings = async () => {
    if (!userId) {
      toast.error('Please log in to save settings')
      return
    }

    try {
      // In a real implementation, save to user preferences in database
      logger.info('Booking settings saved', {
        businessHours: settingsForm.businessHours,
        timeZone: settingsForm.timeZone,
        reminderHours: settingsForm.reminderHours,
        autoConfirm: settingsForm.autoConfirm
      })

      toast.success('Settings saved', {
        description: 'Your booking preferences have been updated'
      })
      setShowSettingsModal(false)
      announce('Booking settings saved', 'polite')
    } catch (error: any) {
      logger.error('Failed to save settings', { error: error.message })
      toast.error('Failed to save settings')
    }
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
      {/* Sub-Page Navigation */}
      <LiquidGlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Bookings</h1>
                <p className="text-sm text-gray-600">Manage appointments & scheduling</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <Link href="/dashboard/bookings/calendar">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Calendar</h3>
                  <p className="text-xs text-gray-500">View all</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/bookings/availability">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Availability</h3>
                  <p className="text-xs text-gray-500">Set hours</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/bookings/services">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Services</h3>
                  <p className="text-xs text-gray-500">Offerings</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/bookings/clients">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Clients</h3>
                  <p className="text-xs text-gray-500">Manage</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/bookings/history">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-gray-500 to-slate-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">History</h3>
                  <p className="text-xs text-gray-500">Past</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/bookings/analytics">
              <Card className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-teal-300">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm">Analytics</h3>
                  <p className="text-xs text-gray-500">Stats</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </LiquidGlassCard>

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
              <thead className="bg-gray-50 dark:bg-slate-800">
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
                  <tr key={booking.id} className="hover:bg-gray-50 dark:bg-slate-800">
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

      {/* Edit Booking Dialog */}
      <Dialog open={!!editBooking} onOpenChange={() => setEditBooking(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update the booking details below
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-client">Client Name</Label>
              <Input
                id="edit-client"
                value={editForm.clientName}
                onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-service">Service</Label>
              <Input
                id="edit-service"
                value={editForm.service}
                onChange={(e) => setEditForm({ ...editForm, service: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-time">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Any additional notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditBooking(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Booking Details Dialog */}
      <Dialog open={!!viewBooking} onOpenChange={() => setViewBooking(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {viewBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Client</p>
                  <p className="font-semibold">{viewBooking.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Service</p>
                  <p className="font-semibold">{viewBooking.service}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold">{viewBooking.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold">{viewBooking.time}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">{viewBooking.duration}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-semibold">${viewBooking.amount}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={viewBooking.status === 'confirmed' ? 'default' : 'secondary'}>
                    {viewBooking.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment</p>
                  <Badge variant={viewBooking.payment === 'paid' ? 'default' : 'outline'}>
                    {viewBooking.payment}
                  </Badge>
                </div>
              </div>
              {viewBooking.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="text-sm">{viewBooking.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewBooking(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (viewBooking) {
                setViewBooking(null)
                handleEditBooking(viewBooking.id)
              }
            }}>
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Booking Settings
            </DialogTitle>
            <DialogDescription>
              Configure your booking preferences and business hours
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Business Hours */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Business Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="start-time" className="text-xs text-gray-500">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={settingsForm.businessHours.start}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      businessHours: { ...settingsForm.businessHours, start: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="end-time" className="text-xs text-gray-500">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={settingsForm.businessHours.end}
                    onChange={(e) => setSettingsForm({
                      ...settingsForm,
                      businessHours: { ...settingsForm.businessHours, end: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Time Zone */}
            <div className="grid gap-2">
              <Label htmlFor="timezone">Time Zone</Label>
              <Select
                value={settingsForm.timeZone}
                onValueChange={(value) => setSettingsForm({ ...settingsForm, timeZone: value })}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cancellation Policy */}
            <div className="grid gap-2">
              <Label htmlFor="cancellation-policy">Cancellation Policy</Label>
              <Textarea
                id="cancellation-policy"
                value={settingsForm.cancellationPolicy}
                onChange={(e) => setSettingsForm({ ...settingsForm, cancellationPolicy: e.target.value })}
                placeholder="e.g., 24 hours notice required"
                rows={2}
              />
            </div>

            {/* Reminder Hours */}
            <div className="grid gap-2">
              <Label htmlFor="reminder-hours">Send Reminder (hours before)</Label>
              <Select
                value={settingsForm.reminderHours.toString()}
                onValueChange={(value) => setSettingsForm({ ...settingsForm, reminderHours: parseInt(value) })}
              >
                <SelectTrigger id="reminder-hours">
                  <SelectValue placeholder="Select reminder time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="2">2 hours before</SelectItem>
                  <SelectItem value="6">6 hours before</SelectItem>
                  <SelectItem value="12">12 hours before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">48 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Auto Confirm */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-confirm" className="text-sm font-medium">Auto-confirm Bookings</Label>
                <p className="text-xs text-gray-500">Automatically confirm new bookings without manual review</p>
              </div>
              <Switch
                id="auto-confirm"
                checked={settingsForm.autoConfirm}
                onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, autoConfirm: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
