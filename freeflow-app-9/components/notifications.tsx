"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Bell,
  MessageSquare,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings,
  Mark,
  MoreHorizontal,
  Trash2,
  User,
  FolderOpen,
  Star,
  TrendingUp,
  Mail,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
  {
    id: "1",
    type: "payment",
    title: "Payment Received",
    message: "You received $2,500 from TechCorp Inc. for Brand Identity project",
    time: "2 minutes ago",
    read: false,
    icon: DollarSign,
    color: "text-green-600 bg-green-100",
    avatar: "TC"
  },
  {
    id: "2", 
    type: "message",
    title: "New Message",
    message: "Alice Smith commented on your Brand Identity Overhaul project",
    time: "15 minutes ago",
    read: false,
    icon: MessageSquare,
    color: "text-blue-600 bg-blue-100",
    avatar: "AS"
  },
  {
    id: "3",
    type: "deadline",
    title: "Deadline Reminder",
    message: "Mobile App Wireframes project is due tomorrow",
    time: "1 hour ago",
    read: true,
    icon: Calendar,
    color: "text-amber-600 bg-amber-100",
    avatar: null
  },
  {
    id: "4",
    type: "achievement",
    title: "Achievement Unlocked",
    message: "You've completed 100+ projects! You're now a Top Performer",
    time: "3 hours ago",
    read: true,
    icon: Star,
    color: "text-purple-600 bg-purple-100",
    avatar: null
  },
  {
    id: "5",
    type: "system",
    title: "System Update",
    message: "New features available: Enhanced project collaboration tools",
    time: "1 day ago",
    read: true,
    icon: Zap,
    color: "text-indigo-600 bg-indigo-100",
    avatar: null
  }
]

const activities = [
  {
    id: "1",
    action: "completed",
    subject: "Brand Identity Overhaul",
    time: "2 hours ago",
    icon: CheckCircle2,
    color: "text-green-600"
  },
  {
    id: "2",
    action: "uploaded files to",
    subject: "Mobile App Wireframes",
    time: "4 hours ago", 
    icon: FolderOpen,
    color: "text-blue-600"
  },
  {
    id: "3",
    action: "received payment for",
    subject: "E-commerce Website",
    time: "1 day ago",
    icon: DollarSign,
    color: "text-green-600"
  },
  {
    id: "4",
    action: "started working on",
    subject: "Marketing Campaign Design",
    time: "2 days ago",
    icon: Clock,
    color: "text-purple-600"
  }
]

export function Notifications() {
  const [notificationSettings, setNotificationSettings] = useState({
    desktop: true,
    email: true,
    mobile: false,
    marketing: false
  })
  
  const [selectedTab, setSelectedTab] = useState("all")
  const [markAllRead, setMarkAllRead] = useState(false)

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAsRead = (id: string) => {
    // Here you would update the notification status
    console.log("Marking as read:", id)
  }

  const handleMarkAllAsRead = () => {
    setMarkAllRead(true)
    console.log("Marking all as read")
  }

  const handleDelete = (id: string) => {
    console.log("Deleting notification:", id)
  }

  const filteredNotifications = selectedTab === "all" 
    ? notifications 
    : notifications.filter(n => n.type === selectedTab)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-slate-600">
            {unreadCount > 0 ? `You have ${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              Mark All as Read
            </Button>
          )}
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Notification Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all" className="relative">
            All
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 px-1.5 py-0.5 text-xs h-5 min-w-[20px]">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="payment">Payments</TabsTrigger>
          <TabsTrigger value="message">Messages</TabsTrigger>
          <TabsTrigger value="deadline">Deadlines</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="message" className="space-y-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="deadline" className="space-y-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <NotificationsList 
            notifications={filteredNotifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how and when you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Desktop Notifications</Label>
                  <p className="text-sm text-slate-600">Show notifications in your browser</p>
                </div>
                <Switch 
                  checked={notificationSettings.desktop}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, desktop: checked}))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Email Notifications</Label>
                  <p className="text-sm text-slate-600">Receive important updates via email</p>
                </div>
                <Switch 
                  checked={notificationSettings.email}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, email: checked}))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Mobile Push Notifications</Label>
                  <p className="text-sm text-slate-600">Get notified on your mobile device</p>
                </div>
                <Switch 
                  checked={notificationSettings.mobile}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, mobile: checked}))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">Marketing Emails</Label>
                  <p className="text-sm text-slate-600">Receive promotional content and tips</p>
                </div>
                <Switch 
                  checked={notificationSettings.marketing}
                  onCheckedChange={(checked) => 
                    setNotificationSettings(prev => ({...prev, marketing: checked}))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100">
                <div className={cn("p-2 rounded-full", 
                  activity.color === "text-green-600" ? "bg-green-100" :
                  activity.color === "text-blue-600" ? "bg-blue-100" :
                  activity.color === "text-purple-600" ? "bg-purple-100" : "bg-slate-100"
                )}>
                  <activity.icon className={cn("h-4 w-4", activity.color)} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    You <span className="font-medium">{activity.action}</span>{" "}
                    <span className="font-medium text-blue-600">{activity.subject}</span>
                  </p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function NotificationsList({ 
  notifications, 
  onMarkAsRead, 
  onDelete 
}: { 
  notifications: typeof notifications
  onMarkAsRead: (id: string) => void
  onDelete: (id: string) => void 
}) {
  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">No notifications</h3>
            <p className="text-slate-500">You're all caught up! New notifications will appear here.</p>
          </CardContent>
        </Card>
      ) : (
        notifications.map((notification) => (
          <Card key={notification.id} className={cn(
            "transition-all duration-200 hover:shadow-md",
            !notification.read && "border-blue-200 bg-blue-50/30"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon or Avatar */}
                <div className={cn("p-2 rounded-full", notification.color)}>
                  {notification.avatar ? (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {notification.avatar}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <notification.icon className="h-4 w-4" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={cn(
                        "font-medium",
                        !notification.read ? "text-slate-900" : "text-slate-700"
                      )}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-500">{notification.time}</span>
                        {!notification.read && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDelete(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function Label({ children, className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium leading-none", className)} {...props}>
      {children}
    </label>
  )
}
