'use client'

import React from 'react'
import { EnhancedCalendarBooking } from '@/components/booking/enhanced-calendar-booking'

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <EnhancedCalendarBooking 
        showAnalytics={true}
        allowClientBooking={true}
        mode="freelancer"
        className="max-w-7xl mx-auto"
      />
    </div>
  )
} 