'use client'

import {
  Calendar,
  Clock,
  Users,
  Settings as SettingsIcon,
  Bell,
  ArrowRight
} from 'lucide-react'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import EnhancedCalendarBooking from '@/components/booking/enhanced-calendar-booking'

export default function BookingPage() {
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

          <Badge variant="outline" className="bg-primary/10">Live</Badge>
        </div>
      </div>

      {/* Live Enhanced Calendar Booking */}
      <div className="container mx-auto px-4">
        <EnhancedCalendarBooking />
      </div>
    </div>
  )
}
