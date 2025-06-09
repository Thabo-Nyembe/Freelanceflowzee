'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Check, 
  X, 
  Filter, 
  Mail, 
  DollarSign, 
  Users, 
  FileText, 
  Clock,
  MoreHorizontal,
  CheckCheck,
  Trash2
} from 'lucide-react'

// Mock notifications data
const mockNotifications = [
  {
    id: 1,
    type: 'payment',
    title: 'Payment Received',
    message: 'You received $2,500 for Premium Brand Identity Package from TechCorp Inc.',
    timestamp: '5 minutes ago',
    read: false,
    priority: 'high',
    actionUrl: '/dashboard/financial'
  },
  {
    id: 2,
    type: 'project',
    title: 'Project Update Required',
    message: 'E-commerce Website Design needs your review. Client requested changes.',
    timestamp: '2 hours ago',
    read: false,
    priority: 'medium',
    actionUrl: '/projects/ecommerce-website'
  },
  {
    id: 3,
    type: 'team',
    title: 'New Team Member Added',
    message: 'Sarah Johnson joined your team as a UX Designer.',
    timestamp: '4 hours ago',
    read: false,
    priority: 'low',
    actionUrl: '/dashboard/team'
  }
]

const notificationTypes = {
  payment: { icon: DollarSign, color: 'text-green-600 bg-green-50', label: 'Payment' },
  project: { icon: FileText, color: 'text-blue-600 bg-blue-50', label: 'Project' },
  team: { icon: Users, color: 'text-purple-600 bg-purple-50', label: 'Team' },
  message: { icon: Mail, color: 'text-orange-600 bg-orange-50', label: 'Message' }
}

const priorityColors = {
  high: 'border-l-red-500 bg-red-50',
  medium: 'border-l-yellow-500 bg-yellow-50', 
  low: 'border-l-gray-500 bg-gray-50'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [selectedTab, setSelectedTab] = useState('all')

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const filteredNotifications = notifications.filter(notification => {
    if (selectedTab === 'unread') return !notification.read
    if (selectedTab === 'today') return notification.timestamp.includes('minutes') || notification.timestamp.includes('hours')
    if (selectedTab !== 'all') return notification.type === selectedTab
    return true
  })

  useEffect(() => {
    console.log("✅ Notifications: Page loaded successfully")
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto p-6 space-y-6" data-testid="notifications-container">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="notifications-title">
              Notifications
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Stay updated with your projects, payments, and team activities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={markAllAsRead}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              data-testid="mark-all-read-button"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow" data-testid="total-notifications-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Total Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{notifications.length}</div>
              <p className="text-xs text-blue-600 mt-1">All time notifications</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow" data-testid="unread-notifications-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Unread
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{unreadCount}</div>
              <p className="text-xs text-red-600 mt-1">Require your attention</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow" data-testid="today-notifications-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">3</div>
              <p className="text-xs text-green-600 mt-1">Recent activity</p>
            </CardContent>
          </Card>
        </div>

        {/* Notification Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white shadow-sm" data-testid="notification-tabs">
            <TabsTrigger value="all" data-testid="all-tab">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread" data-testid="unread-tab">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="payment" data-testid="payment-tab">Payments</TabsTrigger>
            <TabsTrigger value="project" data-testid="project-tab">Projects</TabsTrigger>
            <TabsTrigger value="team" data-testid="team-tab">Team</TabsTrigger>
            <TabsTrigger value="today" data-testid="today-tab">Today</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-4 mt-6" data-testid="notifications-list">
            {filteredNotifications.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No notifications found</h3>
                  <p className="text-gray-500">You're all caught up! No notifications match the current filter.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const typeConfig = notificationTypes[notification.type]
                  const TypeIcon = typeConfig.icon
                  
                  return (
                    <Card 
                      key={notification.id}
                      className={`border-l-4 hover:shadow-md transition-all cursor-pointer ${
                        !notification.read ? priorityColors[notification.priority] : 'border-l-gray-300'
                      } ${!notification.read ? 'shadow-sm' : ''}`}
                      data-testid={`notification-${notification.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          {/* Avatar */}
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={notification.avatar} />
                            <AvatarFallback>
                              <TypeIcon className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <h3 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h3>
                                <Badge variant="secondary" className={`text-xs ${typeConfig.color}`}>
                                  {typeConfig.label}
                                </Badge>
                                {!notification.read && (
                                  <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs text-gray-500">{notification.timestamp}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Additional actions menu
                                  }}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            
                            <p className={`text-sm mb-3 ${!notification.read ? 'text-gray-700' : 'text-gray-600'}`}>
                              {notification.message}
                            </p>
                            
                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                  className="text-xs"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Navigate to action URL
                                  window.location.href = notification.actionUrl
                                }}
                                className="text-xs"
                              >
                                View Details
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            
            {/* Load More */}
            {filteredNotifications.length > 0 && (
              <div className="text-center pt-6">
                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                  Load More Notifications
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 