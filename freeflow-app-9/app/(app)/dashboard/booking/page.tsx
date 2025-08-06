'use client'

import {
  Calendar,
  Clock,
  Users,
  Settings as SettingsIcon,
  Bell,
  ArrowRight
} from 'lucide-react'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

          <Badge variant="outline" className="bg-primary/10">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Upcoming Bookings */}
          <Card className="group cursor-pointer hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-base">Upcoming Bookings</CardTitle>
                <CardDescription>See your next appointments</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 group-hover:bg-blue-50"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Manage Services */}
          <Card className="group cursor-pointer hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center gap-3">
              <SettingsIcon className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-base">Manage Services</CardTitle>
                <CardDescription>Create & edit offerings</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 group-hover:bg-green-50"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Clients / Attendees */}
          <Card className="group cursor-pointer hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center gap-3">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle className="text-base">Clients</CardTitle>
                <CardDescription>Manage attendee list</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 group-hover:bg-purple-50"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="group cursor-pointer hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-orange-600" />
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Booking alerts & reminders</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 group-hover:bg-orange-50"
              >
                Open <ArrowRight className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
