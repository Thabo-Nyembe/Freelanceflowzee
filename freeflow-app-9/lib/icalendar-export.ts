import { createEvents, EventAttributes } from 'ics'

export interface BookingEvent {
  id: string
  title: string
  description?: string
  location?: string
  startDate: Date
  endDate: Date
  clientName?: string
  clientEmail?: string
}

export async function generateICalendarFile(booking: BookingEvent): Promise<Blob> {
  const event: EventAttributes = {
    start: [
      booking.startDate.getFullYear(),
      booking.startDate.getMonth() + 1, // ics uses 1-12 for months
      booking.startDate.getDate(),
      booking.startDate.getHours(),
      booking.startDate.getMinutes()
    ],
    end: [
      booking.endDate.getFullYear(),
      booking.endDate.getMonth() + 1,
      booking.endDate.getDate(),
      booking.endDate.getHours(),
      booking.endDate.getMinutes()
    ],
    title: booking.title,
    description: booking.description || '',
    location: booking.location || '',
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: { name: 'KAZI Platform', email: 'noreply@kaziplatform.com' },
    attendees: booking.clientEmail
      ? [{ name: booking.clientName || 'Client', email: booking.clientEmail }]
      : []
  }

  const { error, value } = createEvents([event])

  if (error) {
    throw new Error('Failed to create calendar event')
  }

  return new Blob([value || ''], { type: 'text/calendar;charset=utf-8' })
}

export function downloadICalendar(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Generate Google Calendar URL
export function getGoogleCalendarURL(booking: BookingEvent): string {
  const format = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: booking.title,
    dates: `${format(booking.startDate)}/${format(booking.endDate)}`,
    details: booking.description || '',
    location: booking.location || ''
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Generate Outlook Calendar URL
export function getOutlookCalendarURL(booking: BookingEvent): string {
  const format = (date: Date) => date.toISOString()

  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: booking.title,
    startdt: format(booking.startDate),
    enddt: format(booking.endDate),
    body: booking.description || '',
    location: booking.location || ''
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}
