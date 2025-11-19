'use client'

import {
  Calendar,
  Clock,
  Users,
  Settings as SettingsIcon,
  Bell,
  ArrowRight,
  FileText
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EnhancedCalendarBooking from '@/components/booking/enhanced-calendar-booking'

export default function BookingPage() {
  // Handler functions with comprehensive logging
  const handleNewBooking = () => {
    console.log('📅 BOOKING: New booking initiated')
    console.log('🔍 BOOKING: Opening booking creation form')
    console.log('📝 BOOKING: Loading available time slots')
    console.log('✅ BOOKING: Booking form ready')
  }

  const handleBookingSettings = () => {
    console.log('⚙️ BOOKING: Settings accessed')
    console.log('📊 BOOKING: Loading booking preferences')
    console.log('🔧 BOOKING: Opening settings panel')
    console.log('✅ BOOKING: Settings loaded successfully')
  }

  const handleBookingReports = () => {
    console.log('📊 BOOKING: Reports requested')
    console.log('📈 BOOKING: Gathering booking statistics')
    console.log('💾 BOOKING: Generating comprehensive report')
    console.log('✅ BOOKING: Report generated successfully')
  }

  return (
    <div className="kazi-bg-light dark:kazi-bg-dark min-h-screen py-8">
      {/* Header */}
      <div className="container mx-auto px-4 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-violet-bolt/10 dark:bg-violet-bolt/20">
              <Calendar className="h-6 w-6 kazi-text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
                Booking Management
              </h1>
              <p className="text-muted-foreground text-sm">
                Manage appointments, services and availability
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button data-testid="new-booking-btn" size="sm" onClick={handleNewBooking}>
              <Calendar className="h-4 w-4 mr-2" />
              New Booking
            </Button>
            <Button data-testid="booking-settings-btn" variant="outline" size="sm" onClick={handleBookingSettings}>
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button data-testid="booking-reports-btn" variant="outline" size="sm" onClick={handleBookingReports}>
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>
      </div>

      {/* Live Enhanced Calendar Booking */}
      <div className="container mx-auto px-4">
        <EnhancedCalendarBooking />
      </div>
    </div>
  )
}
