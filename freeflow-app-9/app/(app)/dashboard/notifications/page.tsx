'use client'

import React, { useState, useReducer, useEffect } from 'react'
 payload: string }
  | { type: 'SET_FILTER'; payload: NotificationState['filter'] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AI_PROCESSING'; payload: boolean }
  | { type: 'BULK_ACTION'; payload: { action: 'read' | 'delete'; ids: string[] } }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      }
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }
    case 'DELETE_NOTIFICATION':
      const notif = state.notifications.find(n => n.id === action.payload)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload),
        unreadCount: notif && !notif.read ? state.unreadCount - 1 : state.unreadCount
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_AI_PROCESSING':
      return { ...state, aiProcessing: action.payload }
    case 'BULK_ACTION':
      if (action.payload.action === 'read') {
        return {
          ...state,
          notifications: state.notifications.map(n => 
            action.payload.ids.includes(n.id) ? { ...n, read: true } : n
          ),
          unreadCount: state.unreadCount - action.payload.ids.filter(id => 
            !state.notifications.find(n => n.id === id)?.read
          ).length
        }
      } else {
        const deletedUnread = action.payload.ids.filter(id => 
          !state.notifications.find(n => n.id === id)?.read
        ).length
        return {
          ...state,
          notifications: state.notifications.filter(n => !action.payload.ids.includes(n.id)),
          unreadCount: state.unreadCount - deletedUnread
        }
      }
    default:
      return state
  }
}

// Mock notifications with AI-generated insights
const generateMockNotifications = (): Notification[] => [
  {
    id: '1','
    type: 'ai_insight',
    priority: 'high',
    title: 'AI Revenue Optimization Alert',
    message: 'Your project completion rate is 15% above average this month. Consider raising your rates by 12% for new clients.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionRequired: true,
    aiGenerated: true,
    metadata: { sentiment: 'positive' }
  },
  {
    id: '2','
    type: 'payment',
    priority: 'urgent',
    title: 'Payment Received: $2,500',
    message: 'Payment from Kaleidocraft Co. for Brand Identity Project has been processed successfully.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    actionRequired: false,
    metadata: { amount: 2500, clientId: 'client-1', sentiment: 'positive' }
  },
  {
    id: '3','
    type: 'project',
    priority: 'high',
    title: 'Project Deadline Approaching',
    message: 'Mobile App Design project is due in 2 days. Current progress: 75% complete.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: false,
    actionRequired: true,
    metadata: { projectId: 'proj-1', deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) }
  },
  {
    id: '4','
    type: 'collaboration',
    priority: 'medium',
    title: 'New Feedback on Brand Guidelines',
    message: 'Sarah Chen left 3 new comments on your brand guidelines PDF. Sentiment: Positive.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionRequired: true,
    metadata: { clientId: 'sarah-chen', sentiment: 'positive' }
  },
  {
    id: '5','
    type: 'ai_insight',
    priority: 'medium',
    title: 'Client Communication Pattern Alert',
    message: 'Your response time to client messages has improved by 40% this week. Clients are 65% more likely to approve revisions faster.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: true,
    actionRequired: false,
    aiGenerated: true,
    metadata: { sentiment: 'positive' }
  },
  {
    id: '6','
    type: 'client',
    priority: 'high',
    title: 'New Project Inquiry',
    message: 'TechFlow Industries is interested in a complete website redesign. Estimated budget: $8,500.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    actionRequired: true,
    metadata: { amount: 8500, sentiment: 'positive' }
  },
  {
    id: '7','
    type: 'system',
    priority: 'low',
    title: 'Weekly Analytics Ready',
    message: 'Your weekly performance report is available. Revenue up 23% compared to last week.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: true,
    actionRequired: false,
    metadata: { sentiment: 'positive' }
  },
  {
    id: '8','
    type: 'ai_insight',
    priority: 'medium',
    title: 'Project Efficiency Recommendation',
    message: 'AI suggests using your new design template for logo projects. This could reduce project time by 35%.',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    read: false,
    actionRequired: false,
    aiGenerated: true,
    metadata: { sentiment: 'neutral' }
  }
]

export default function NotificationsPage() {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: generateMockNotifications(),
    unreadCount: 6,
    filter: 'all',
    searchTerm: '','
    loading: false,
    aiProcessing: false
  })

  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  // Filter notifications based on current filter and search
  const filteredNotifications = state.notifications.filter(notification => {
    const matchesFilter = 
      state.filter === 'all' || 
      (state.filter === 'unread' && !notification.read) ||
      (state.filter === 'urgent' && (notification.priority === 'urgent' || notification.priority === 'high')) ||
      (state.filter === 'ai_insights' && notification.aiGenerated)

    const matchesSearch = notification.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(state.searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case &apos;payment&apos;: return <DollarSign className= "h-4 w-4" />
      case &apos;project&apos;: return <Clock className= "h-4 w-4" />
      case &apos;collaboration&apos;: return <MessageSquare className= "h-4 w-4" />
      case &apos;client&apos;: return <Users className= "h-4 w-4" />
      case &apos;ai_insight&apos;: return <Brain className= "h-4 w-4" />
      case &apos;system&apos;: return <Bell className= "h-4 w-4" />
      default: return <Bell className= "h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id })
  }

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id })
  }

  const handleBulkAction = (action: 'read' | 'delete') => {
    if (selectedNotifications.length > 0) {
      dispatch({ type: 'BULK_ACTION', payload: { action, ids: selectedNotifications } })
      setSelectedNotifications([])
    }
  }

  const generateAIInsight = async () => {
    dispatch({ type: 'SET_AI_PROCESSING', payload: true })
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const aiInsights = [
      {
        id: `ai-${Date.now()}`,
        type: 'ai_insight' as const,
        priority: 'medium' as const,
        title: 'AI Performance Analysis',
        message: 'Based on your recent activity, you could increase project efficiency by 28% by batching similar design tasks together.',
        timestamp: new Date(),
        read: false,
        actionRequired: false,
        aiGenerated: true,
        metadata: { sentiment: 'positive' as const }
      },
      {
        id: `ai-${Date.now() + 1}`,
        type: 'ai_insight' as const,
        priority: 'high' as const,
        title: 'Revenue Opportunity Detected',
        message: 'AI found 3 past clients who haven\'t worked with you in 6+ months. Reach out with a 15% returning client discount.','
        timestamp: new Date(),
        read: false,
        actionRequired: true,
        aiGenerated: true,
        metadata: { sentiment: 'positive' as const }
      }
    ]

    aiInsights.forEach(insight => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: insight })
    })

    dispatch({ type: 'SET_AI_PROCESSING', payload: false })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className= "min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-4">
      <div className= "max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className= "flex items-center justify-between">
          <div>
            <h1 className= "text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className= "h-8 w-8 text-purple-600" />
              Notifications
              {state.unreadCount > 0 && (
                <Badge variant= "secondary" className= "bg-red-500 text-white">
                  {state.unreadCount}
                </Badge>
              )}
            </h1>
            <p className= "text-gray-600 mt-1">
              Stay updated with your projects, payments, and AI insights with real-time updates
            </p>
          </div>
          
          <div className= "flex items-center gap-3">
            <Button
              onClick={generateAIInsight}
              disabled={state.aiProcessing}
              className= "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              {state.aiProcessing ? (
                <>
                  <div className= "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating AI Insights...
                </>
              ) : (
                <>
                  <Brain className= "h-4 w-4 mr-2" />
                  Generate AI Insights
                </>
              )}
            </Button>
            
            <Button
              variant= "outline"
              onClick={() => dispatch({ type: 'MARK_ALL_READ' })}
              disabled={state.unreadCount === 0}
            >
              <CheckCircle className= "h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className= "p-4">
            <div className= "flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className= "flex items-center gap-4 w-full sm:w-auto">
                <div className= "relative flex-1 sm:flex-none">
                  <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder= "Search notifications..."
                    value={state.searchTerm}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                    className= "pl-10 w-full sm:w-80"
                  />
                </div>
                
                <Select value={state.filter} onValueChange={(value: NotificationState['filter']) => dispatch({ type: &apos;SET_FILTER&apos;, payload: value })}>
                  <SelectTrigger className= "w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value= "all">All</SelectItem>
                    <SelectItem value= "unread">Unread ({state.notifications.filter(n => !n.read).length})</SelectItem>
                    <SelectItem value= "urgent">Urgent</SelectItem>
                    <SelectItem value= "ai_insights">AI Insights</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className= "flex gap-2">
                  <span className= "text-xs text-gray-500 mr-2 flex items-center">
                    Bulk Actions:
                  </span>
                  <Button
                    size= "sm"
                    variant= "outline"
                    onClick={() => handleBulkAction('read')}
                  >
                    Mark Read ({selectedNotifications.length})
                  </Button>
                  <Button
                    size= "sm"
                    variant= "outline"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Delete ({selectedNotifications.length})
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notification Tabs */}
        <Tabs defaultValue= "all" className= "w-full">
          <TabsList className= "grid w-full grid-cols-6">
            <TabsTrigger value= "all">All</TabsTrigger>
            <TabsTrigger value= "payments">Payments</TabsTrigger>
            <TabsTrigger value= "projects">Projects</TabsTrigger>
            <TabsTrigger value= "collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value= "ai">AI Insights</TabsTrigger>
            <TabsTrigger value= "clients">Clients</TabsTrigger>
          </TabsList>

          <TabsContent value= "all" className= "space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className= "flex flex-col items-center justify-center py-12">
                  <Bell className= "h-12 w-12 text-gray-400 mb-4" />
                  <h3 className= "text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
                  <p className= "text-gray-600 text-center">
                    {state.searchTerm ? 'Try adjusting your search terms' : 'You\'re all caught up!'}'
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className= "space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all duration-200 hover:shadow-md ${
                      !notification.read ? 'bg-blue-50/50 border-blue-200' : 'bg-white'
                    } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-purple-500' : }`}'
                  >
                    <CardContent className= "p-4">
                      <div className= "flex items-start gap-4">
                        <input
                          type= "checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedNotifications([...selectedNotifications, notification.id])
                            } else {
                              setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id))
                            }
                          }}
                          className= "mt-1"
                        />
                        
                        <div className= "flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)} mt-2`} />
                        </div>

                        <div className= "flex-shrink-0 mt-1">
                          <div className={`p-2 rounded-full ${
                            notification.aiGenerated ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {getNotificationIcon(notification.type)}
                          </div>
                        </div>

                        <div className= "flex-1 min-w-0">
                          <div className= "flex items-center gap-2 mb-1">
                            <h4 className= "font-semibold text-gray-900 truncate">
                              {notification.title}
                            </h4>
                            {notification.aiGenerated && (
                              <Badge variant= "secondary" className= "bg-purple-100 text-purple-700 text-xs">
                                <Sparkles className= "h-3 w-3 mr-1" />
                                AI
                              </Badge>
                            )}
                            {notification.actionRequired && (
                              <Badge variant= "secondary" className= "bg-orange-100 text-orange-700 text-xs">
                                Action Required
                              </Badge>
                            )}
                          </div>
                          
                          <p className= "text-gray-600 text-sm mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className= "flex items-center justify-between">
                            <span className= "text-xs text-gray-500">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            
                            <div className= "flex gap-2">
                              {!notification.read && (
                                <Button
                                  size= "sm"
                                  variant= "ghost"
                                  onClick={() => handleMarkRead(notification.id)}
                                  className= "text-xs"
                                >
                                  <Check className= "h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                              
                              <Button
                                size= "sm"
                                variant= "ghost"
                                onClick={() => handleDelete(notification.id)}
                                className= "text-xs text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Individual tabs would filter by type */}
          <TabsContent value= "payments">
            <div className= "space-y-3">
              {filteredNotifications.filter(n => n.type === 'payment').map((notification) => (
                <Card key={notification.id} className= "bg-green-50/50 border-green-200">
                  <CardContent className= "p-4">
                    <div className= "flex items-center gap-3">
                      <DollarSign className= "h-5 w-5 text-green-600" />
                      <div>
                        <h4 className= "font-semibold text-gray-900">{notification.title}</h4>
                        <p className= "text-sm text-gray-600">{notification.message}</p>
                        <span className= "text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value= "ai">
            <div className= "space-y-3">
              {filteredNotifications.filter(n => n.aiGenerated).map((notification) => (
                <Card key={notification.id} className= "bg-purple-50/50 border-purple-200">
                  <CardContent className= "p-4">
                    <div className= "flex items-start gap-3">
                      <div className= "p-2 rounded-full bg-purple-100 text-purple-600">
                        <Brain className= "h-5 w-5" />
                      </div>
                      <div className= "flex-1">
                        <div className= "flex items-center gap-2 mb-2">
                          <h4 className= "font-semibold text-gray-900">{notification.title}</h4>
                          <Badge variant= "secondary" className= "bg-purple-100 text-purple-700">
                            <Sparkles className= "h-3 w-3 mr-1" />
                            AI Generated
                          </Badge>
                        </div>
                        <p className= "text-sm text-gray-600 mb-2">{notification.message}</p>
                        <span className= "text-xs text-gray-500">{formatTimeAgo(notification.timestamp)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Add other tab contents as needed */}
          <TabsContent value= "projects">
            <div className= "text-center py-8">
              <Clock className= "h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className= "text-gray-600">Project notifications will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value= "collaboration">
            <div className= "text-center py-8">
              <MessageSquare className= "h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className= "text-gray-600">Collaboration notifications will appear here</p>
            </div>
          </TabsContent>

          <TabsContent value= "clients">
            <div className= "text-center py-8">
              <Users className= "h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className= "text-gray-600">Client notifications will appear here</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Insights Summary Card */}
        <Card className= "bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardHeader>
            <CardTitle className= "flex items-center gap-2">
              <TrendingUp className= "h-5 w-5" />
              AI Performance Summary
            </CardTitle>
            <CardDescription className= "text-purple-100">
              Your freelance business insights powered by AI with Smart Categorization & Priority Assessment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className= "grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className= "text-center">
                <div className= "text-2xl font-bold">+23%</div>
                <div className= "text-sm text-purple-100">Revenue Growth</div>
              </div>
              <div className= "text-center">
                <div className= "text-2xl font-bold">92%</div>
                <div className= "text-sm text-purple-100">Client Satisfaction</div>
              </div>
              <div className= "text-center">
                <div className= "text-2xl font-bold">-15%</div>
                <div className= "text-sm text-purple-100">Project Time</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 