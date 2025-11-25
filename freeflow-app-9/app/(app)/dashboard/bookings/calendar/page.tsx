'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createFeatureLogger } from '@/lib/logger'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { mockBookings } from '@/lib/bookings-utils'

const logger = createFeatureLogger('BookingsCalendar')

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState('January 2025')

  const handleAddToCalendar = (id: string) => {
    const booking = mockBookings.find(b => b.id === id)
    if (!booking) {
      toast.error('Booking not found')
      return
    }

    logger.info('Add to calendar', {
      bookingId: id,
      clientName: booking.clientName,
      date: booking.date,
      time: booking.time
    })

    toast.info('Add to Calendar', {
      description: `${booking.clientName} - ${booking.date} at ${booking.time}. Choose calendar: Google, Apple, or Outlook`
    })
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
          <h4 className="font-semibold text-lg">{currentMonth}</h4>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth('December 2024')}
              data-testid="calendar-prev-month-btn"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth('February 2025')}
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
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNum = i - 2
            const hasBooking = [7, 8, 10, 12, 15].includes(dayNum)
            return (
              <div
                key={i}
                className={`p-2 border rounded text-center cursor-pointer hover:bg-blue-50 ${
                  dayNum < 1 || dayNum > 31 ? 'bg-gray-50 text-gray-400' : ''
                } ${hasBooking ? 'bg-blue-100 border-blue-300' : ''}`}
                onClick={() =>
                  hasBooking &&
                  handleAddToCalendar(`B-2025-${String(dayNum).padStart(3, '0')}`)
                }
              >
                {dayNum > 0 && dayNum <= 31 && (
                  <div>
                    <div className="text-sm font-medium">{dayNum}</div>
                    {hasBooking && (
                      <div className="mt-1">
                        <Badge className="text-[10px] py-0 px-1 bg-blue-600">
                          2 bookings
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="border rounded-lg p-4 bg-white">
        <h4 className="font-semibold mb-3">Today's Schedule - Jan 12, 2025</h4>
        <div className="space-y-2">
          {mockBookings.slice(0, 3).map(booking => (
            <div
              key={booking.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {booking.time} - {booking.service}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.clientName} • {booking.duration}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAddToCalendar(booking.id)}
                data-testid={`add-to-cal-${booking.id}-btn`}
              >
                Add to Calendar
              </Button>
            </div>
          ))}
        </div>
      </div>

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
            Current Time Zone: Eastern Standard Time (EST)
          </p>
          <Button variant="outline" size="sm" className="mt-2">
            Change Time Zone
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
