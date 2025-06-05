"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Plus, Clock, Video, Coffee, CalendarIcon } from "lucide-react"
import { useState } from "react"

export function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events = [
    { id: 1, title: "Client Meeting - Acme Corp", time: "10:00 AM", type: "meeting", color: "blue", duration: "1h" },
    { id: 2, title: "Design Review Session", time: "2:00 PM", type: "review", color: "purple", duration: "30m" },
    { id: 3, title: "Project Deadline", time: "5:00 PM", type: "deadline", color: "red", duration: "All day" },
  ]

  const upcomingEvents = [
    { id: 4, title: "Brand Presentation", date: "Tomorrow", time: "9:00 AM", client: "Tech Startup" },
    { id: 5, title: "Website Launch", date: "Jan 28", time: "2:00 PM", client: "Creative Agency" },
    { id: 6, title: "Photography Session", date: "Jan 30", time: "10:00 AM", client: "Fashion Brand" },
  ]

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Calendar</h2>
          <p className="text-lg text-slate-500 mt-1">Manage your schedule and deadlines</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Clock className="h-4 w-4 mr-2" />
            Time Tracking
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <CardTitle className="text-xl font-semibold text-slate-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </CardTitle>
                <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-slate-500 p-3">
                    {day}
                  </div>
                ))}

                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDayOfMonth }, (_, i) => (
                  <div key={`empty-${i}`} className="p-3"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const isToday =
                    day === new Date().getDate() &&
                    currentDate.getMonth() === new Date().getMonth() &&
                    currentDate.getFullYear() === new Date().getFullYear()
                  const hasEvents = day === 15 || day === 22 || day === 28

                  return (
                    <div
                      key={day}
                      className={`p-3 text-center text-sm cursor-pointer rounded-lg transition-all duration-200 relative
                        ${
                          isToday
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                            : "text-slate-700 hover:bg-slate-100"
                        }
                        ${hasEvents ? "font-semibold" : ""}
                      `}
                    >
                      {day}
                      {hasEvents && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200/50"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 ${
                        event.color === "blue"
                          ? "bg-blue-400"
                          : event.color === "purple"
                            ? "bg-purple-400"
                            : "bg-red-400"
                      }`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-sm">{event.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-slate-500">{event.time}</p>
                        <span className="text-xs text-slate-400">•</span>
                        <p className="text-xs text-slate-500">{event.duration}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        event.color === "blue"
                          ? "bg-blue-100 text-blue-700"
                          : event.color === "purple"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {event.type === "meeting" && <Video className="h-3 w-3 mr-1" />}
                      {event.type === "review" && <Coffee className="h-3 w-3 mr-1" />}
                      {event.type === "deadline" && <Clock className="h-3 w-3 mr-1" />}
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-200/50"
                >
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">{event.title}</h4>
                    <p className="text-xs text-slate-500">{event.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700">{event.date}</p>
                    <p className="text-xs text-slate-500">{event.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-red-800 flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Deadlines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex justify-between items-center p-4 rounded-lg bg-white/50">
              <div>
                <h4 className="font-medium text-slate-800">Brand Identity Final</h4>
                <p className="text-sm text-slate-600">Acme Corporation</p>
              </div>
              <Badge className="bg-red-100 text-red-700">3 days</Badge>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-white/50">
              <div>
                <h4 className="font-medium text-slate-800">Website Launch</h4>
                <p className="text-sm text-slate-600">Tech Startup</p>
              </div>
              <Badge className="bg-orange-100 text-orange-700">1 week</Badge>
            </div>
            <div className="flex justify-between items-center p-4 rounded-lg bg-white/50">
              <div>
                <h4 className="font-medium text-slate-800">Photography Delivery</h4>
                <p className="text-sm text-slate-600">Fashion Brand</p>
              </div>
              <Badge className="bg-amber-100 text-amber-700">2 weeks</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
