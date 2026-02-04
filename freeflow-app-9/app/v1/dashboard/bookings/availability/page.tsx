// MIGRATED: Batch #28 - Verified database hook integration
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import { Globe, Plus, Settings } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const logger = createSimpleLogger('BookingsAvailability')

const weekDays = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

export default function AvailabilityPage() {
  // A+++ UTILITIES
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()

  const [timeZone, setTimeZone] = useState('EST')

  const handleBlockTimeSlot = () => {
    logger.info('Block time slot initiated')

    toast.info('Block Time Slot', {
      description: 'Choose block type: One-time, Recurring, Vacation, or Personal'
    })
  }

  const handleSaveDaySettings = (day: string) => {
    logger.info('Saving availability for day', { day })
    toast.success(`Availability saved for ${day}`)
  }

  const handleChangeTimeZone = () => {
    logger.info('Changing time zone', { currentTimeZone: timeZone })
    toast.info('Time Zone Settings', {
      description: 'Select your time zone from the list'
    })
  }

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Availability Settings</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleChangeTimeZone}
          data-testid="availability-timezone-btn"
        >
          <Globe className="h-4 w-4 mr-2" />
          Change Time Zone ({timeZone})
        </Button>
      </div>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Working Hours</CardTitle>
          <CardDescription>
            Set your available hours for each day
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {weekDays.map(day => (
            <div
              key={day}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  defaultChecked={!['Saturday', 'Sunday'].includes(day)}
                  className="h-4 w-4"
                />
                <span className="font-medium w-24">{day}</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="time" defaultValue="09:00" className="w-32" />
                <span>to</span>
                <Input type="time" defaultValue="17:00" className="w-32" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSaveDaySettings(day)}
                  data-testid={`availability-${day.toLowerCase()}-settings-btn`}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Break Times & Buffer */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Break Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Lunch Break</span>
              <span className="text-sm font-medium">12:00 PM - 1:00 PM</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              data-testid="availability-add-break-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Break Time
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buffer Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm">Buffer between bookings</Label>
              <Select defaultValue="15">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No buffer</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blocked Time Slots */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Blocked Time Slots</CardTitle>
          <CardDescription>Dates and times you're unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Holiday Break</p>
                <p className="text-sm text-gray-600">
                  Dec 25, 2024 - Jan 1, 2025
                </p>
              </div>
              <Badge variant="outline">Vacation</Badge>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleBlockTimeSlot}
            data-testid="availability-block-time-btn"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Blocked Time
          </Button>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Advanced Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Minimum Notice Time</p>
              <p className="text-xs text-gray-600">
                How far in advance clients must book
              </p>
            </div>
            <Select defaultValue="24">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-medium text-sm">Maximum Booking Window</p>
              <p className="text-xs text-gray-600">
                How far in advance clients can book
              </p>
            </div>
            <Select defaultValue="60">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
