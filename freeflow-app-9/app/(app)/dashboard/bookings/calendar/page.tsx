'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import {
  generateCalendarDays,
  getPreviousMonth,
  getNextMonth,
  getMonthYearString,
  getTodaysBookings,
  formatBookingTime,
  type CalendarDay
} from '@/lib/calendar-date-utils'
import {
  generateICalendarFile,
  downloadICalendar,
  getGoogleCalendarURL,
  getOutlookCalendarURL,
  type BookingEvent
} from '@/lib/icalendar-export'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const logger = createFeatureLogger('BookingsCalendar')

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  // Load bookings from database
  useEffect(() => {
    const loadBookings = async () => {
      if (!userId) {
        logger.info('Waiting for user authentication')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        logger.info('Loading bookings for calendar', { userId })

        // Dynamic import for code splitting
        const { getBookings } = await import('@/lib/bookings-queries')

        const { data, error } = await getBookings(userId)

        if (error) throw error

        setBookings(data || [])
        logger.info('Bookings loaded', { count: data?.length || 0, userId })
        toast.success('Bookings loaded', {
          description: `${data?.length || 0} bookings for calendar`
        })
        announce(`${data?.length || 0} bookings loaded`, 'polite')
      } catch (error) {
        logger.error('Failed to load bookings', { error, userId })
        toast.error('Failed to load bookings')
        announce('Failed to load bookings', 'assertive')
      } finally {
        setIsLoading(false)
      }
    }

    loadBookings()
  }, [userId, announce]) // eslint-disable-line react-hooks/exhaustive-deps

  // Generate calendar days when date or bookings change
  useEffect(() => {
    if (!isLoading) {
      const days = generateCalendarDays(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        bookings
      )
      setCalendarDays(days)
      logger.debug('Calendar days generated', {
        month: getMonthYearString(currentDate),
        daysCount: days.length
      })
    }
  }, [currentDate, bookings, isLoading])

  const handlePreviousMonth = () => {
    const newDate = getPreviousMonth(currentDate)
    setCurrentDate(newDate)
    logger.info('Navigate to previous month', {
      month: getMonthYearString(newDate)
    })
    announce(`Showing ${getMonthYearString(newDate)}`)
  }

  const handleNextMonth = () => {
    const newDate = getNextMonth(currentDate)
    setCurrentDate(newDate)
    logger.info('Navigate to next month', { month: getMonthYearString(newDate) })
    announce(`Showing ${getMonthYearString(newDate)}`)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    logger.info('Navigate to today')
    announce('Showing current month')
  }

  const handleDayClick = (day: CalendarDay) => {
    if (!day.isCurrentMonth) return

    setSelectedDate(day.date)
    logger.info('Day selected', {
      date: day.dateString,
      bookingsCount: day.bookingsCount
    })

    if (day.bookingsCount > 0) {
      announce(
        `${day.bookingsCount} booking${day.bookingsCount > 1 ? 's' : ''} on ${format(day.date, 'MMMM d')}`
      )
      toast.info(
        `${day.bookingsCount} booking${day.bookingsCount > 1 ? 's' : ''}`,
        {
          description: `View bookings for ${format(day.date, 'MMMM d, yyyy')}`
        }
      )
    } else {
      announce(`No bookings on ${format(day.date, 'MMMM d')}`)
    }
  }

  const handleAddToCalendar = (booking: any) => {
    setSelectedBooking(booking)
    setShowExportDialog(true)
    logger.info('Add to calendar dialog opened', { bookingId: booking.id })
  }

  const handleExportToGoogle = () => {
    if (!selectedBooking) return

    const bookingEvent: BookingEvent = {
      id: selectedBooking.id,
      title: `Booking: ${selectedBooking.service_name || 'Service'}`,
      description: selectedBooking.notes || '',
      location: selectedBooking.location || 'Virtual',
      startDate: new Date(
        selectedBooking.booking_date +
          'T' +
          (selectedBooking.start_time || '09:00')
      ),
      endDate: new Date(
        selectedBooking.booking_date +
          'T' +
          (selectedBooking.end_time || '10:00')
      ),
      clientName: selectedBooking.client_name,
      clientEmail: selectedBooking.client_email
    }

    const url = getGoogleCalendarURL(bookingEvent)
    window.open(url, '_blank')

    logger.info('Exported to Google Calendar', {
      bookingId: selectedBooking.id
    })
    toast.success('Opening Google Calendar')
    announce('Exported to Google Calendar')
    setShowExportDialog(false)
  }

  const handleExportToOutlook = () => {
    if (!selectedBooking) return

    const bookingEvent: BookingEvent = {
      id: selectedBooking.id,
      title: `Booking: ${selectedBooking.service_name || 'Service'}`,
      description: selectedBooking.notes || '',
      location: selectedBooking.location || 'Virtual',
      startDate: new Date(
        selectedBooking.booking_date +
          'T' +
          (selectedBooking.start_time || '09:00')
      ),
      endDate: new Date(
        selectedBooking.booking_date +
          'T' +
          (selectedBooking.end_time || '10:00')
      ),
      clientName: selectedBooking.client_name,
      clientEmail: selectedBooking.client_email
    }

    const url = getOutlookCalendarURL(bookingEvent)
    window.open(url, '_blank')

    logger.info('Exported to Outlook Calendar', {
      bookingId: selectedBooking.id
    })
    toast.success('Opening Outlook Calendar')
    announce('Exported to Outlook Calendar')
    setShowExportDialog(false)
  }

  const handleDownloadICS = async () => {
    if (!selectedBooking) return

    try {
      const bookingEvent: BookingEvent = {
        id: selectedBooking.id,
        title: `Booking: ${selectedBooking.service_name || 'Service'}`,
        description: selectedBooking.notes || '',
        location: selectedBooking.location || 'Virtual',
        startDate: new Date(
          selectedBooking.booking_date +
            'T' +
            (selectedBooking.start_time || '09:00')
        ),
        endDate: new Date(
          selectedBooking.booking_date +
            'T' +
            (selectedBooking.end_time || '10:00')
        ),
        clientName: selectedBooking.client_name,
        clientEmail: selectedBooking.client_email
      }

      const icsBlob = await generateICalendarFile(bookingEvent)
      downloadICalendar(icsBlob, `booking-${selectedBooking.id}.ics`)

      logger.info('Downloaded ICS file', { bookingId: selectedBooking.id })
      toast.success('Calendar file downloaded')
      announce('Calendar file downloaded')
      setShowExportDialog(false)
    } catch (error) {
      logger.error('Failed to generate ICS file', { error })
      toast.error('Failed to download calendar file')
    }
  }

  const handleSetAvailability = () => {
    logger.info('Set availability opened')

    toast.info('Set Availability', {
      description:
        'Configure working hours, breaks, time zone, and holiday schedule'
    })
  }

  return (
    <div className="container mx-auto px-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Booking Calendar</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            data-testid="calendar-today-btn"
          >
            Today
          </Button>
          <Button variant="outline" size="sm" data-testid="calendar-week-btn">
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            data-testid="calendar-month-btn"
          >
            Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSetAvailability}
            data-testid="calendar-availability-btn"
          >
            Set Availability
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-lg">
            {getMonthYearString(currentDate)}
          </h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePreviousMonth}
              data-testid="calendar-prev-month-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              data-testid="calendar-next-month-btn"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 p-2"
            >
              {day}
            </div>
          ))}

          {isLoading ? (
            <div className="col-span-7 text-center py-8 text-muted-foreground">
              Loading calendar...
            </div>
          ) : (
            calendarDays.map((day, index) => (
              <div
                key={index}
                className={`p-2 border rounded text-center cursor-pointer transition-colors
                  ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'hover:bg-blue-50'}
                  ${day.isToday ? 'border-blue-500 bg-blue-50' : ''}
                  ${day.bookingsCount > 0 ? 'bg-blue-100 border-blue-300' : ''}
                `}
                onClick={() => handleDayClick(day)}
                data-testid={`calendar-day-${day.dateString}`}
              >
                <div>
                  <div
                    className={`text-sm font-medium ${day.isToday ? 'font-bold text-blue-600' : ''}`}
                  >
                    {day.dayNumber}
                  </div>
                  {day.bookingsCount > 0 && (
                    <div className="mt-1">
                      <Badge className="text-[10px] py-0 px-1 bg-blue-600">
                        {day.bookingsCount}{' '}
                        {day.bookingsCount === 1 ? 'booking' : 'bookings'}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const todayBookings = getTodaysBookings(bookings)

            if (isLoading) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  Loading today's bookings...
                </div>
              )
            }

            if (todayBookings.length === 0) {
              return (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No bookings scheduled for today</p>
                </div>
              )
            }

            return (
              <div className="space-y-3">
                {todayBookings.map(booking => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {booking.service_name || 'Service'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.client_name || 'Client'} •{' '}
                        {formatBookingTime(booking.start_time || '')}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCalendar(booking)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Calendar
                    </Button>
                  </div>
                ))}
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* Time Zone Selector */}
      <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Time Zone Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            Current Time Zone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Change Time Zone
          </Button>
        </CardContent>
      </Card>

      {/* Add to Calendar Dialog */}
      {showExportDialog && selectedBooking && (
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add to Calendar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Choose your calendar application:
                </p>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportToGoogle}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Google Calendar
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleExportToOutlook}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Outlook Calendar
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleDownloadICS}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Download (.ics file)
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Booking Details:</p>
                <p>Service: {selectedBooking.service_name || 'N/A'}</p>
                <p>Date: {selectedBooking.booking_date}</p>
                <p>
                  Time: {formatBookingTime(selectedBooking.start_time || '')}
                </p>
                <p>Client: {selectedBooking.client_name || 'N/A'}</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
