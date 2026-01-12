import {
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  parseISO
} from 'date-fns'

export interface CalendarDay {
  date: Date
  dateString: string // YYYY-MM-DD format
  dayNumber: number // 1-31
  isCurrentMonth: boolean
  isToday: boolean
  bookingsCount: number
  bookings: any[]
}

// Generate calendar days for a given month
export function generateCalendarDays(
  year: number,
  month: number, // 0-11 (JS month format)
  bookings: any[]
): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = endOfMonth(firstDay)

  // Get the first day to display (may be from previous month)
  const calendarStart = startOfWeek(firstDay)
  // Get the last day to display (may be from next month)
  const calendarEnd = endOfWeek(lastDay)

  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return allDays.map(date => {
    const dateString = format(date, 'yyyy-MM-dd')
    const dayBookings = bookings.filter(booking => {
      // Handle both 'booking_date' and 'date' field names
      const bookingDate = booking.booking_date || booking.date
      if (!bookingDate) return false

      // Parse booking date
      let bookingDateObj: Date
      if (typeof bookingDate === 'string') {
        bookingDateObj = parseISO(bookingDate.split('T')[0]) // Handle ISO timestamps
      } else {
        bookingDateObj = bookingDate
      }

      return isSameDay(date, bookingDateObj)
    })

    return {
      date,
      dateString,
      dayNumber: date.getDate(),
      isCurrentMonth: isSameMonth(date, firstDay),
      isToday: isToday(date),
      bookingsCount: dayBookings.length,
      bookings: dayBookings
    }
  })
}

// Navigate to previous month
export function getPreviousMonth(currentDate: Date): Date {
  return subMonths(currentDate, 1)
}

// Navigate to next month
export function getNextMonth(currentDate: Date): Date {
  return addMonths(currentDate, 1)
}

// Get month/year display string
export function getMonthYearString(date: Date): string {
  return format(date, 'MMMM yyyy')
}

// Get bookings for a specific date
export function getBookingsForDate(date: Date, bookings: any[]): any[] {
  return bookings.filter(booking => {
    const bookingDate = booking.booking_date || booking.date
    if (!bookingDate) return false

    let bookingDateObj: Date
    if (typeof bookingDate === 'string') {
      bookingDateObj = parseISO(bookingDate.split('T')[0])
    } else {
      bookingDateObj = bookingDate
    }

    return isSameDay(date, bookingDateObj)
  })
}

// Get today's bookings
export function getTodaysBookings(bookings: any[]): any[] {
  return getBookingsForDate(new Date(), bookings)
}

// Format time for display
export function formatBookingTime(timeString: string): string {
  // Handle various time formats
  if (!timeString) return ''

  // If it's already formatted like "10:00 AM", return as-is
  if (timeString.includes('AM') || timeString.includes('PM')) {
    return timeString
  }

  // If it's 24-hour format like "14:00", convert to 12-hour
  const [hours, minutes] = timeString.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`
}
