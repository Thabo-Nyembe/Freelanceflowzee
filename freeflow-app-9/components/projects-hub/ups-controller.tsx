"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUPSIntegration, useUPSProject, useUPSUser, useUPSComments, useUPSUI } from '@/lib/ups/integration-service'
import { UniversalPinpointFeedbackSystemEnhanced } from './universal-pinpoint-feedback-system-enhanced'
import { AIInsightsDashboard } from './ai-insights-dashboard'
import { AdvancedCommentFilters } from './advanced-comment-filters'
import { CommentExportSystem } from './comment-export-system'
import { RealTimeCollaboration } from './real-time-collaboration'
import { KeyboardShortcutsAccessibility } from './keyboard-shortcuts-accessibility'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  MessageSquare,
  Users,
  Brain,
  Filter,
  Download,
  Settings,
  Activity,
  Notification,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UPSControllerProps {
  projectId?: string
  className?: string
  initialView?: 'comments' | 'ai-insights' | 'analytics' | 'export' | 'settings'
  enabledFeatures?: string[]
  theme?: 'light' | 'dark' | 'auto'
  layout?: 'sidebar' | 'tabs' | 'floating'
  realTimeEnabled?: boolean
  aiEnabled?: boolean
}

export const UPSController: React.FC<UPSControllerProps> = ({
  projectId,
  className,
  initialView = 'comments',
  enabledFeatures = ['comments', 'ai-insights', 'filters', 'export', 'collaboration', 'shortcuts'],
  theme = 'auto',
  layout = 'sidebar',
  realTimeEnabled = true,
  aiEnabled = true
}) => {
  const integration = useUPSIntegration()
  const currentProject = useUPSProject()
  const currentUser = useUPSUser()
  const comments = useUPSComments()
  const ui = useUPSUI()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Initialize UPS system
  useEffect(() => {
    if (projectId && !currentProject) {
      // Load project data
      const mockProject = {
        id: projectId,
        name: 'Sample Project',
        description: 'Project with UPS integration',
        status: 'active' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [],
        settings: {
          allowAnonymousComments: true,
          requireApproval: false,
          emailNotifications: true,
          realTimeUpdates: realTimeEnabled,
          aiAnalysisEnabled: aiEnabled,
          exportFormats: ['pdf', 'excel', 'csv'],
          maxFileSize: 10 * 1024 * 1024, // 10MB
          allowedFileTypes: ['image/png', 'image/jpeg', 'application/pdf']
        }
      }
      integration.setCurrentProject(mockProject)
    }

    if (initialView !== ui.activeView) {
      integration.setActiveView(initialView)
    }

    // Connect to real-time services if enabled
    if (realTimeEnabled) {
      integration.connect()
    }

    return () => {
      if (realTimeEnabled) {
        integration.disconnect()
      }
    }
  }, [projectId, initialView, realTimeEnabled, aiEnabled])

  // Keyboard shortcuts handler
  const handleKeyboardShortcut = useCallback((action: string, data?: any) => {
    switch (action) {
      case 'toggle_sidebar':
        integration.toggleSidebar()
        break
      case 'new_comment':
        integration.setActiveView('comments')
        break
      case 'ai_insights':
        integration.setActiveView('ai-insights')
        break
      case 'export_data':
        integration.setActiveView('export')
        break
      case 'search':
        integration.setActiveView('comments')
        // Focus search input
        break
      case 'toggle_fullscreen':
        setIsFullscreen(!isFullscreen)
        break
      default:
        console.log('Unknown keyboard shortcut:', action)
    }
  }, [integration, isFullscreen])

  // Activity tracking
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentProject && currentUser) {
        integration.updateUserPresence(currentUser.id, true)
      }
    }, 30000) // Update presence every 30 seconds

    return () => clearInterval(interval)
  }, [currentProject, currentUser, integration])

  // Filter comments based on current filters
  const filteredComments = useMemo(() => {
    const { filters } = ui
    let filtered = [...comments]

    if (filters.searchQuery) {
      filtered = integration.search(filters.searchQuery)
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(comment => filters.status.includes(comment.status))
    }

    if (filters.priority.length > 0) {
      filtered = filtered.filter(comment => filters.priority.includes(comment.priority))
    }

    if (filters.assignee.length > 0) {
      filtered = filtered.filter(comment =>
        comment.assigneeId && filters.assignee.includes(comment.assigneeId)
      )
    }

    if (filters.dateRange) {
      const [start, end] = filters.dateRange
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.createdAt)
        return commentDate >= start && commentDate <= end
      })
    }

    return filtered
  }, [comments, ui.filters, integration])

  // Get statistics
  const stats = useMemo(() => {
    const total = comments.length
    const resolved = comments.filter(c => c.status === 'resolved').length
    const pending = comments.filter(c => c.status === 'pending').length
    const inProgress = comments.filter(c => c.status === 'in_progress').length
    const highPriority = comments.filter(c => c.priority === 'high').length

    return { total, resolved, pending, inProgress, highPriority }
  }, [comments])

  // Render sidebar navigation
  const renderSidebar = () => (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: ui.sidebarOpen ? 0 : -280 }}
      transition={{ type: "spring", damping: 25 }}
      className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-40 flex flex-col"
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">UPS Control Center</h2>
            {currentProject && (
              <p className="text-sm text-muted-foreground">{currentProject.name}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={integration.toggleSidebar}
          >
            {ui.sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Project Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Comments</span>
                <Badge variant="secondary">{stats.total}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Resolved</span>
                <Badge variant="default">{stats.resolved}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <Badge variant="outline">{stats.inProgress}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>High Priority</span>
                <Badge variant="destructive">{stats.highPriority}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {enabledFeatures.includes('comments') && (
                <Button
                  variant={ui.activeView === 'comments' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => integration.setActiveView('comments')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments ({filteredComments.length})
                </Button>
              )}

              {enabledFeatures.includes('ai-insights') && aiEnabled && (
                <Button
                  variant={ui.activeView === 'ai-insights' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => integration.setActiveView('ai-insights')}
                >
                  <Brain className="w-4 h-4 mr-2" />
                  AI Insights
                </Button>
              )}

              {enabledFeatures.includes('collaboration') && realTimeEnabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowActivityPanel(true)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Collaboration
                </Button>
              )}

              {enabledFeatures.includes('export') && (
                <Button
                  variant={ui.activeView === 'export' ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => integration.setActiveView('export')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}

              <Button
                variant={ui.activeView === 'settings' ? 'default' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => integration.setActiveView('settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowNotifications(true)}
              >
                <Notification className="w-4 h-4 mr-2" />
                Notifications
                {integration.notifications.filter(n => !n.read).length > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {integration.notifications.filter(n => !n.read).length}
                  </Badge>
                )}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowActivityPanel(true)}
              >
                <Activity className="w-4 h-4 mr-2" />
                Recent Activity
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 mr-2" />
                ) : (
                  <Maximize2 className="w-4 h-4 mr-2" />
                )}
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              </Button>
            </CardContent>
          </Card>

          {/* Connection Status */}
          {realTimeEnabled && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {ui.connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Connected</span>
                    </>
                  )}
                  {ui.connectionStatus === 'connecting' && (
                    <>
                      <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />
                      <span className="text-sm text-yellow-600">Connecting...</span>
                    </>
                  )}
                  {ui.connectionStatus === 'disconnected' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Disconnected</span>
                    </>
                  )}
                  {ui.connectionStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600">Connection Error</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  )

  // Render main content area
  const renderMainContent = () => {
    const contentMargin = layout === 'sidebar' && ui.sidebarOpen ? 'ml-80' : 'ml-0'

    return (
      <div className={cn("flex-1 transition-all duration-300", contentMargin)}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              {layout === 'sidebar' && !ui.sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={integration.toggleSidebar}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}

              <div>
                <h1 className="text-xl font-semibold">
                  {ui.activeView === 'comments' && 'Comments & Feedback'}
                  {ui.activeView === 'ai-insights' && 'AI Insights'}
                  {ui.activeView === 'analytics' && 'Analytics'}
                  {ui.activeView === 'export' && 'Export Center'}
                  {ui.activeView === 'settings' && 'Settings'}
                </h1>
                {currentProject && (
                  <p className="text-sm text-muted-foreground">{currentProject.name}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Connection Status Indicator */}
              {realTimeEnabled && (
                <div className="flex items-center space-x-1">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ui.connectionStatus === 'connected' && "bg-green-500",
                    ui.connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                    ui.connectionStatus === 'disconnected' && "bg-gray-400",
                    ui.connectionStatus === 'error' && "bg-red-500"
                  )} />
                  <span className="text-xs text-muted-foreground">
                    {ui.connectionStatus}
                  </span>
                </div>
              )}

              <Separator orientation="vertical" className="h-6" />

              {/* Quick Filter Toggle */}
              {enabledFeatures.includes('filters') && ui.activeView === 'comments' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Toggle filter panel
                  }}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              )}

              {/* Notifications */}
              <Sheet open={showNotifications} onOpenChange={setShowNotifications}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <Notification className="w-4 h-4" />
                    {integration.notifications.filter(n => !n.read).length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs"
                      >
                        {integration.notifications.filter(n => !n.read).length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Notifications</SheetTitle>
                    <SheetDescription>
                      Stay updated with your project activity
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <ScrollArea className="h-96">
                      {integration.notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No notifications yet
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {integration.notifications.map(notification => (
                            <Card key={notification.id} className={cn(
                              "p-3 cursor-pointer transition-colors",
                              !notification.read && "bg-primary/5 border-primary/20"
                            )}>
                              <div className="flex items-start space-x-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full mt-2",
                                  notification.priority === 'urgent' && "bg-red-500",
                                  notification.priority === 'high' && "bg-orange-500",
                                  notification.priority === 'medium' && "bg-blue-500",
                                  notification.priority === 'low' && "bg-gray-400"
                                )} />
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium">{notification.title}</h4>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notification.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </ScrollArea>

                    {integration.notifications.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={integration.markAllNotificationsRead}
                        >
                          Mark All as Read
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={integration.clearNotifications}
                        >
                          Clear All
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>

              {/* View Toggle for Tab Layout */}
              {layout === 'tabs' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {layout === 'tabs' ? (
              <Tabs value={ui.activeView} onValueChange={(value) => integration.setActiveView(value as string)} className="h-full">
                <TabsList className="grid w-full grid-cols-5">
                  {enabledFeatures.includes('comments') && (
                    <TabsTrigger value="comments">Comments</TabsTrigger>
                  )}
                  {enabledFeatures.includes('ai-insights') && aiEnabled && (
                    <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
                  )}
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  {enabledFeatures.includes('export') && (
                    <TabsTrigger value="export">Export</TabsTrigger>
                  )}
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                {enabledFeatures.includes('comments') && (
                  <TabsContent value="comments" className="h-full">
                    <div className="h-full flex">
                      <div className="flex-1">
                        <UniversalPinpointFeedbackSystemEnhanced
                          comments={filteredComments}
                          onCommentAdd={integration.addComment}
                          onCommentUpdate={integration.updateComment}
                          onCommentDelete={integration.deleteComment}
                          onCommentResolve={integration.resolveComment}
                          project={currentProject}
                          user={currentUser}
                        />
                      </div>
                      {enabledFeatures.includes('filters') && (
                        <div className="w-80 border-l border-border">
                          <AdvancedCommentFilters
                            filters={ui.filters}
                            onFiltersChange={integration.updateFilters}
                            comments={comments}
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

                {enabledFeatures.includes('ai-insights') && aiEnabled && (
                  <TabsContent value="ai-insights" className="h-full">
                    <AIInsightsDashboard
                      projectId={currentProject?.id || ''}
                      analyses={Object.values(integration.aiAnalyses)}
                      comments={comments}
                    />
                  </TabsContent>
                )}

                <TabsContent value="analytics" className="h-full">
                  <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-muted-foreground">Total Comments</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{comments.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{comments.filter(c => c.resolved).length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{comments.filter(c => !c.resolved).length}</p>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg border">
                      <h3 className="font-semibold mb-2">Recent Activity</h3>
                      <div className="space-y-2">
                        {comments.slice(0, 5).map((comment, idx) => (
                          <div key={comment.id || idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            <span>Comment {comment.resolved ? 'resolved' : 'added'}</span>
                            <span className="text-xs">• {new Date(comment.timestamp || Date.now()).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {enabledFeatures.includes('export') && (
                  <TabsContent value="export" className="h-full">
                    <CommentExportSystem
                      comments={comments}
                      onExport={integration.exportComments}
                      exportHistory={integration.exportHistory}
                    />
                  </TabsContent>
                )}

                <TabsContent value="settings" className="h-full">
                  <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">UPS Settings</h2>
                    <div className="space-y-4 max-w-md">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Show Resolved Comments</p>
                          <p className="text-sm text-muted-foreground">Display resolved comments in the list</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded" aria-label="Show resolved comments" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Real-time Updates</p>
                          <p className="text-sm text-muted-foreground">Enable live sync for comments</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded" aria-label="Real-time updates" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive email for new comments</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 rounded" aria-label="Email notifications" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Compact View</p>
                          <p className="text-sm text-muted-foreground">Show less details in comment cards</p>
                        </div>
                        <input type="checkbox" className="h-5 w-5 rounded" aria-label="Compact view" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="h-full">
                {ui.activeView === 'comments' && enabledFeatures.includes('comments') && (
                  <div className="h-full flex">
                    <div className="flex-1">
                      <UniversalPinpointFeedbackSystemEnhanced
                        comments={filteredComments}
                        onCommentAdd={integration.addComment}
                        onCommentUpdate={integration.updateComment}
                        onCommentDelete={integration.deleteComment}
                        onCommentResolve={integration.resolveComment}
                        project={currentProject}
                        user={currentUser}
                      />
                    </div>
                    {enabledFeatures.includes('filters') && (
                      <div className="w-80 border-l border-border">
                        <AdvancedCommentFilters
                          filters={ui.filters}
                          onFiltersChange={integration.updateFilters}
                          comments={comments}
                        />
                      </div>
                    )}
                  </div>
                )}

                {ui.activeView === 'ai-insights' && enabledFeatures.includes('ai-insights') && aiEnabled && (
                  <AIInsightsDashboard
                    projectId={currentProject?.id || ''}
                    analyses={Object.values(integration.aiAnalyses)}
                    comments={comments}
                  />
                )}

                {ui.activeView === 'analytics' && (
                  <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-muted-foreground">Total Comments</p>
                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{comments.length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="text-3xl font-bold text-green-600 dark:text-green-400">{comments.filter(c => c.resolved).length}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{comments.filter(c => !c.resolved).length}</p>
                      </div>
                    </div>
                  </div>
                )}

                {ui.activeView === 'export' && enabledFeatures.includes('export') && (
                  <CommentExportSystem
                    comments={comments}
                    onExport={integration.exportComments}
                    exportHistory={integration.exportHistory}
                  />
                )}

                {ui.activeView === 'settings' && (
                  <div className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold mb-4">UPS Settings</h2>
                    <div className="space-y-4 max-w-md">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Show Resolved Comments</p>
                          <p className="text-sm text-muted-foreground">Display resolved comments in the list</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div>
                          <p className="font-medium">Real-time Updates</p>
                          <p className="text-sm text-muted-foreground">Enable live sync for comments</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-5 w-5 rounded" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Real-time Collaboration Panel */}
        {enabledFeatures.includes('collaboration') && realTimeEnabled && (
          <Sheet open={showActivityPanel} onOpenChange={setShowActivityPanel}>
            <SheetContent side="right" className="w-96">
              <SheetHeader>
                <SheetTitle>Real-time Collaboration</SheetTitle>
                <SheetDescription>
                  See who's online and recent project activity
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <RealTimeCollaboration
                  projectId={currentProject?.id || ''}
                  users={integration.onlineUsers}
                  activities={integration.getActivities(currentProject?.id || '')}
                  onUserInvite={integration.inviteUser}
                />
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    )
  }

  // Render based on layout
  return (
    <div className={cn(
      "h-screen w-full bg-background text-foreground overflow-hidden",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Keyboard Shortcuts */}
      {enabledFeatures.includes('shortcuts') && (
        <KeyboardShortcutsAccessibility
          onShortcut={handleKeyboardShortcut}
          enabled={true}
        />
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {ui.isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span>Loading...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {ui.error && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center space-x-2 p-4">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{ui.error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => integration.setError(null)}
                >
                  ×
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="h-full flex">
        {layout === 'sidebar' && renderSidebar()}
        {renderMainContent()}
      </div>
    </div>
  )
}

export default UPSController