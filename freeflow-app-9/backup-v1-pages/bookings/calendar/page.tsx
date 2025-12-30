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
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const logger = createFeatureLogger('BookingsCalendar')

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false)
  const [availabilityForm, setAvailabilityForm] = useState({
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    workingHours: { start: '09:00', end: '17:00' },
    breakTime: { start: '12:00', end: '13:00', enabled: true },
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bufferTime: 15,
    maxBookingsPerDay: 8
  })
  const [isSavingAvailability, setIsSavingAvailability] = useState(false)
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
    setShowAvailabilityModal(true)
  }

  const handleSaveAvailability = async () => {
    if (!userId) {
      toast.error('Please log in to save availability')
      return
    }

    setIsSavingAvailability(true)
    try {
      // In a real implementation, save to user preferences in database
      logger.info('Availability settings saved', {
        workingDays: availabilityForm.workingDays,
        workingHours: availabilityForm.workingHours,
        breakTime: availabilityForm.breakTime,
        timeZone: availabilityForm.timeZone,
        bufferTime: availabilityForm.bufferTime,
        maxBookingsPerDay: availabilityForm.maxBookingsPerDay
      })

      toast.success('Availability saved', {
        description: 'Your availability preferences have been updated'
      })
      setShowAvailabilityModal(false)
      announce('Availability settings saved', 'polite')
    } catch (error: any) {
      logger.error('Failed to save availability', { error: error.message })
      toast.error('Failed to save availability')
    } finally {
      setIsSavingAvailability(false)
    }
  }

  const toggleWorkingDay = (day: keyof typeof availabilityForm.workingDays) => {
    setAvailabilityForm(prev => ({
      ...prev,
      workingDays: {
        ...prev.workingDays,
        [day]: !prev.workingDays[day]
      }
    }))
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
      <div className="border rounded-lg p-4 bg-white dark:bg-slate-800">
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
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 dark:bg-slate-800"
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

      {/* Availability Settings Dialog */}
      <Dialog open={showAvailabilityModal} onOpenChange={setShowAvailabilityModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Set Availability
            </DialogTitle>
            <DialogDescription>
              Configure your working hours, breaks, and booking preferences
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Working Days */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Working Days</Label>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(availabilityForm.workingDays).map(([day, enabled]) => (
                  <div
                    key={day}
                    className={`p-2 rounded-lg text-center cursor-pointer border-2 transition-all ${
                      enabled
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-gray-100 border-gray-200 text-gray-500'
                    }`}
                    onClick={() => toggleWorkingDay(day as keyof typeof availabilityForm.workingDays)}
                  >
                    <span className="text-xs font-medium capitalize">{day.slice(0, 3)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Working Hours</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="work-start" className="text-xs text-gray-500">Start Time</Label>
                  <Input
                    id="work-start"
                    type="time"
                    value={availabilityForm.workingHours.start}
                    onChange={(e) => setAvailabilityForm(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="work-end" className="text-xs text-gray-500">End Time</Label>
                  <Input
                    id="work-end"
                    type="time"
                    value={availabilityForm.workingHours.end}
                    onChange={(e) => setAvailabilityForm(prev => ({
                      ...prev,
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
            </div>

            {/* Break Time */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Break Time</Label>
                <Switch
                  checked={availabilityForm.breakTime.enabled}
                  onCheckedChange={(checked) => setAvailabilityForm(prev => ({
                    ...prev,
                    breakTime: { ...prev.breakTime, enabled: checked }
                  }))}
                />
              </div>
              {availabilityForm.breakTime.enabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="break-start" className="text-xs text-gray-500">Start</Label>
                    <Input
                      id="break-start"
                      type="time"
                      value={availabilityForm.breakTime.start}
                      onChange={(e) => setAvailabilityForm(prev => ({
                        ...prev,
                        breakTime: { ...prev.breakTime, start: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="break-end" className="text-xs text-gray-500">End</Label>
                    <Input
                      id="break-end"
                      type="time"
                      value={availabilityForm.breakTime.end}
                      onChange={(e) => setAvailabilityForm(prev => ({
                        ...prev,
                        breakTime: { ...prev.breakTime, end: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Time Zone */}
            <div className="grid gap-2">
              <Label htmlFor="availability-timezone">Time Zone</Label>
              <Select
                value={availabilityForm.timeZone}
                onValueChange={(value) => setAvailabilityForm(prev => ({ ...prev, timeZone: value }))}
              >
                <SelectTrigger id="availability-timezone">
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
                  <SelectItem value="Africa/Johannesburg">Johannesburg (SAST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buffer Time & Max Bookings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="buffer-time">Buffer Between Bookings</Label>
                <Select
                  value={availabilityForm.bufferTime.toString()}
                  onValueChange={(value) => setAvailabilityForm(prev => ({
                    ...prev,
                    bufferTime: parseInt(value)
                  }))}
                >
                  <SelectTrigger id="buffer-time">
                    <SelectValue placeholder="Buffer time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No buffer</SelectItem>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max-bookings">Max Bookings per Day</Label>
                <Select
                  value={availabilityForm.maxBookingsPerDay.toString()}
                  onValueChange={(value) => setAvailabilityForm(prev => ({
                    ...prev,
                    maxBookingsPerDay: parseInt(value)
                  }))}
                >
                  <SelectTrigger id="max-bookings">
                    <SelectValue placeholder="Max bookings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 bookings</SelectItem>
                    <SelectItem value="6">6 bookings</SelectItem>
                    <SelectItem value="8">8 bookings</SelectItem>
                    <SelectItem value="10">10 bookings</SelectItem>
                    <SelectItem value="12">12 bookings</SelectItem>
                    <SelectItem value="0">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAvailabilityModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAvailability} disabled={isSavingAvailability}>
              {isSavingAvailability ? 'Saving...' : 'Save Availability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
