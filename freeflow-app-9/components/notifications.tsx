"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Check,
  Clock,
  DollarSign,
  MessageSquare,
  FileText,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
} from "lucide-react"

interface NotificationProps {
  onNavigate: (screen: string, subTab?: string) => void
}

export function Notifications({ onNavigate }: NotificationProps) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "payment",
      title: "Payment Received",
      message: "Acme Corp has completed the escrow payment for Brand Identity project",
      amount: 5000,
      time: "2 minutes ago",
      read: false,
      priority: "high",
      action: { screen: "financial", subTab: "escrow" },
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      id: 2,
      type: "client_feedback",
      title: "New Client Feedback",
      message: "Tech Startup Inc. left comments on the website mockups",
      time: "15 minutes ago",
      read: false,
      priority: "medium",
      action: { screen: "projects", subTab: "collaboration" },
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: 3,
      type: "deadline",
      title: "Project Deadline Approaching",
      message: "Brand Identity for Acme Corp is due in 2 days",
      time: "1 hour ago",
      read: false,
      priority: "high",
      action: { screen: "projects", subTab: "tracking" },
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      id: 4,
      type: "team",
      title: "Team Meeting Reminder",
      message: "Design review meeting starts in 30 minutes",
      time: "2 hours ago",
      read: true,
      priority: "medium",
      action: { screen: "team", subTab: "calendar" },
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      id: 5,
      type: "gallery",
      title: "Gallery Unlocked",
      message: "Fashion Brand gallery has been unlocked and is ready for download",
      time: "3 hours ago",
      read: true,
      priority: "low",
      action: { screen: "client-zone" },
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      id: 6,
      type: "invoice",
      title: "Invoice Sent",
      message: "Invoice #INV-005 has been sent to Creative Agency",
      time: "5 hours ago",
      read: true,
      priority: "low",
      action: { screen: "financial", subTab: "invoices" },
      icon: FileText,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id)
    if (notification.action) {
      onNavigate(notification.action.screen, notification.action.subTab)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Info className="h-4 w-4 text-amber-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Notifications</h2>
          <p className="text-lg text-slate-500 mt-1">Stay updated with your projects and clients</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={markAllAsRead}
          >
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Badge className="bg-purple-100 text-purple-700 text-lg px-3 py-1">{unreadCount} unread</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-emerald-800 mb-1">3</p>
            <p className="text-sm text-emerald-600">Payment Updates</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-blue-800 mb-1">5</p>
            <p className="text-sm text-blue-600">Client Messages</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-amber-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-amber-800 mb-1">2</p>
            <p className="text-sm text-amber-600">Deadlines</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
            <p className="text-3xl font-light text-purple-800 mb-1">4</p>
            <p className="text-sm text-purple-600">Team Updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => {
              const IconComponent = notification.icon
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                    notification.read
                      ? "bg-slate-50/50 border-slate-200/50"
                      : `${notification.bgColor} border-current/20`
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${notification.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${notification.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold ${notification.read ? "text-slate-600" : "text-slate-800"}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && <div className="w-2 h-2 bg-purple-500 rounded-full"></div>}
                          {getPriorityIcon(notification.priority)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">{notification.time}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-400 hover:text-slate-600"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <p className={`text-sm mb-2 ${notification.read ? "text-slate-500" : "text-slate-700"}`}>
                        {notification.message}
                      </p>

                      {notification.amount && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-100 text-emerald-700">
                            +${notification.amount.toLocaleString()}
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                          View Details
                        </Button>
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-purple-600 hover:bg-purple-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
