"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

// UI Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


import { ScrollArea } from "@/components/ui/scroll-area"

// Icons
import {
  Users,
  Eye,
  MessageCircle,
  Pencil,
  Mouse,
  Activity,
  Wifi,
  WifiOff,
  Circle,
  Volume2,
  VolumeX,
  Bell,
  User,
  Crown,
  Shield,
  MapPin,
  Radio,
  Monitor,
  Smartphone,
  Tablet
} from "lucide-react"

// Types
export interface UserPresence {
  userId: string
  userName: string
  userEmail?: string
  avatar?: string
  role?: "owner" | "admin" | "editor" | "viewer" | "guest"
  isActive: boolean
  lastActive: string
  status: "online" | "away" | "busy" | "offline"
  device: "desktop" | "mobile" | "tablet"
  location?: {
    country?: string
    city?: string
    timezone?: string
  }
  currentView?: {
    fileId: string
    fileName?: string
    position?: { x: number; y: number }
    timestamp?: number
    page?: number
    line?: number
    zoomLevel?: number
  }
  activities: UserActivity[]
  preferences: {
    showCursor: boolean
    playAudio: boolean
    receiveNotifications: boolean
    shareLocation: boolean
  }
  connectionQuality: "excellent" | "good" | "fair" | "poor"
  joinedAt: string
  isTyping: boolean
  typingLocation?: string
  isRecording: boolean
  isSpeaking: boolean
  isScreenSharing: boolean
}

export interface UserActivity {
  id: string
  type: "comment" | "reply" | "edit" | "delete" | "view" | "join" | "leave" | "draw" | "record"
  description: string
  timestamp: string
  fileId?: string
  commentId?: string
  metadata?: Record<string, any>
}

export interface CollaborationSession {
  id: string
  projectId: string
  name: string
  startedAt: string
  participants: UserPresence[]
  host: string
  isLive: boolean
  settings: {
    allowGuests: boolean
    requireApproval: boolean
    enableVoice: boolean
    enableScreenShare: boolean
    maxParticipants: number
    recordSession: boolean
  }
}

interface RealTimeCollaborationProps {
  session: CollaborationSession
  currentUser: UserPresence
  onUserAction?: (action: UserActivity) => void
  onPresenceUpdate?: (presence: UserPresence) => void
  onCursorMove?: (userId: string, position: { x: number; y: number }) => void
  className?: string
}

export function RealTimeCollaboration({
  session,
  currentUser,
  onUserAction,
  onPresenceUpdate,
  onCursorMove,
  className
}: RealTimeCollaborationProps) {
  const [showPresencePanel, setShowPresencePanel] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [activityFeed, setActivityFeed] = useState<UserActivity[]>([])
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connected")
  const [notifications, setNotifications] = useState<UserActivity[]>([])
  const [showCursors, setShowCursors] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(true)

  // Real-time activity simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate random user activities
      const randomUser = session.participants[Math.floor(Math.random() * session.participants.length)]
      const activities = ["comment", "view", "edit", "draw"] as const
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]

      const newActivity: UserActivity = {
        id: `activity-${Date.now()}`,
        type: randomActivity,
        description: `${randomUser.userName} ${randomActivity === "comment" ? "added a comment" :
                     randomActivity === "view" ? "is viewing" :
                     randomActivity === "edit" ? "is editing" : "is drawing"}`,
        timestamp: new Date().toISOString(),
        fileId: randomUser.currentView?.fileId
      }

      setActivityFeed(prev => [newActivity, ...prev.slice(0, 49)]) // Keep last 50 activities

      // Add to notifications if not current user
      if (randomUser.userId !== currentUser.userId && Math.random() > 0.7) {
        setNotifications(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10 notifications
      }
    }, 3000 + Math.random() * 5000) // Random interval between 3-8 seconds

    return () => clearInterval(interval)
  }, [session.participants, currentUser.userId])

  // Get user status color
  const getStatusColor = (status: UserPresence["status"]) => {
    switch (status) {
      case "online": return "bg-green-500"
      case "away": return "bg-yellow-500"
      case "busy": return "bg-red-500"
      case "offline": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  // Get device icon
  const getDeviceIcon = (device: UserPresence["device"]) => {
    switch (device) {
      case "desktop": return Monitor
      case "mobile": return Smartphone
      case "tablet": return Tablet
      default: return Monitor
    }
  }

  // Get role icon
  const getRoleIcon = (role?: UserPresence["role"]) => {
    switch (role) {
      case "owner": return Crown
      case "admin": return Shield
      case "editor": return Pencil
      case "viewer": return Eye
      default: return User
    }
  }

  // Calculate online users
  const onlineUsers = useMemo(() =>
    session.participants.filter(user => user.status === "online"),
    [session.participants]
  )

  // Active users (recently active)
  const activeUsers = useMemo(() =>
    session.participants.filter(user => {
      const lastActive = new Date(user.lastActive)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
      return lastActive > fiveMinutesAgo
    }),
    [session.participants]
  )

  // User presence indicators
  const PresenceIndicator = ({ user }: { user: UserPresence }) => {
    const DeviceIcon = getDeviceIcon(user.device)
    const RoleIcon = getRoleIcon(user.role)

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "relative cursor-pointer",
                selectedUser === user.userId && "ring-2 ring-primary ring-offset-2"
              )}
              onClick={() => setSelectedUser(user.userId === selectedUser ? null : user.userId)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-xs">
                  {user.userName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Status indicator */}
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                getStatusColor(user.status)
              )} />

              {/* Activity indicators */}
              {user.isTyping && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <Pencil className="w-1.5 h-1.5 text-white" />
                </motion.div>
              )}

              {user.isRecording && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <Circle className="w-1.5 h-1.5 text-white fill-current" />
                </motion.div>
              )}

              {user.isSpeaking && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"
                />
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-64">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{user.userName}</span>
                <RoleIcon className="w-3 h-3" />
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(user.status))} />
                <span className="capitalize">{user.status}</span>
                <DeviceIcon className="w-3 h-3" />
              </div>
              {user.currentView && (
                <div className="text-xs text-muted-foreground">
                  Viewing: {user.currentView.fileName || "Unknown file"}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Last active: {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
              </div>
              {user.location && (
                <div className="text-xs text-muted-foreground flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location.city}, {user.location.country}
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // User cursor component
  const UserCursor = ({ user, position }: { user: UserPresence; position: { x: number; y: number } }) => (
    <motion.div
      className="absolute pointer-events-none z-50"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
    >
      <div className="relative">
        {/* Cursor pointer */}
        <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
          <path
            d="M0 0L20 8L8 12L0 0Z"
            fill={`hsl(${user.userId.charCodeAt(0) * 137.5 % 360}, 70%, 50%)`}
            stroke="white"
            strokeWidth="1"
          />
        </svg>

        {/* User name label */}
        <div
          className="absolute top-5 left-2 px-2 py-1 bg-black text-white text-xs rounded whitespace-nowrap"
          style={{ backgroundColor: `hsl(${user.userId.charCodeAt(0) * 137.5 % 360}, 70%, 50%)` }}
        >
          {user.userName}
        </div>
      </div>
    </motion.div>
  )

  // Activity item component
  const ActivityItem = ({ activity }: { activity: UserActivity }) => {
    const getActivityIcon = (type: UserActivity["type"]) => {
      switch (type) {
        case "comment": return MessageCircle
        case "reply": return MessageCircle
        case "edit": return Pencil
        case "view": return Eye
        case "join": return User
        case "leave": return User
        case "draw": return Pencil
        case "record": return Circle
        default: return Activity
      }
    }

    const Icon = getActivityIcon(activity.type)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-3 p-2 hover:bg-muted/50 rounded-md"
      >
        <div className={cn(
          "p-1 rounded-full",
          activity.type === "comment" ? "bg-blue-100 text-blue-600" :
          activity.type === "edit" ? "bg-green-100 text-green-600" :
          activity.type === "view" ? "bg-purple-100 text-purple-600" :
          "bg-gray-100 text-gray-600"
        )}>
          <Icon className="w-3 h-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">{activity.description}</p>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {connectionStatus === "connected" ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : connectionStatus === "connecting" ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Radio className="w-4 h-4 text-yellow-500" />
                </motion.div>
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>

            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{onlineUsers.length} online</span>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{activeUsers.length} active</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCursors(!showCursors)}
            >
              <Mouse className={cn("w-4 h-4", showCursors ? "text-primary" : "text-muted-foreground")} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAudioEnabled(!audioEnabled)}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPresencePanel(!showPresencePanel)}
            >
              <Users className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Presence Panel */}
        <AnimatePresence>
          {showPresencePanel && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Participants ({session.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quick presence overview */}
                    <div className="flex flex-wrap gap-2">
                      {session.participants.map(user => (
                        <PresenceIndicator key={user.userId} user={user} />
                      ))}
                    </div>

                    {/* Detailed user list */}
                    <ScrollArea className="h-64">
                      <div className="space-y-2">
                        {session.participants.map(user => {
                          const DeviceIcon = getDeviceIcon(user.device)
                          const RoleIcon = getRoleIcon(user.role)

                          return (
                            <div
                              key={user.userId}
                              className={cn(
                                "flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors",
                                "hover:bg-muted",
                                selectedUser === user.userId && "bg-muted"
                              )}
                              onClick={() => setSelectedUser(user.userId === selectedUser ? null : user.userId)}
                            >
                              <div className="relative">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback className="text-xs">
                                    {user.userName.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className={cn(
                                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                                  getStatusColor(user.status)
                                )} />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-medium truncate">{user.userName}</span>
                                  <RoleIcon className="w-3 h-3 text-muted-foreground" />
                                  <DeviceIcon className="w-3 h-3 text-muted-foreground" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-muted-foreground capitalize">{user.status}</span>
                                  {user.currentView && (
                                    <Badge variant="outline" className="text-xs">
                                      {user.currentView.fileName || "Viewing"}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1">
                                {user.isTyping && (
                                  <motion.div
                                    animate={{ opacity: [1, 0.5, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                  >
                                    <Pencil className="w-3 h-3 text-blue-500" />
                                  </motion.div>
                                )}
                                {user.isRecording && (
                                  <Circle className="w-3 h-3 text-red-500 fill-current" />
                                )}
                                {user.isSpeaking && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 0.8 }}
                                  >
                                    <Volume2 className="w-3 h-3 text-green-500" />
                                  </motion.div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Activity Feed */}
        <div className={cn("lg:col-span-2", !showPresencePanel && "lg:col-span-3")}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Live Activity
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && (
                    <Badge variant="destructive">{notifications.length}</Badge>
                  )}
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-1">
                  {activityFeed.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Activity className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">No recent activity</p>
                    </div>
                  ) : (
                    activityFeed.map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating cursors */}
      <AnimatePresence>
        {showCursors && session.participants
          .filter(user => user.userId !== currentUser.userId && user.currentView?.position)
          .map(user => (
            <UserCursor
              key={user.userId}
              user={user}
              position={user.currentView!.position!}
            />
          ))
        }
      </AnimatePresence>

      {/* Selected user details */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <Card className="w-80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">User Details</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const user = session.participants.find(u => u.userId === selectedUser)
                  if (!user) return null

                  return (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{user.userName}</h4>
                          <p className="text-sm text-muted-foreground">{user.userEmail}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <div className="flex items-center space-x-1">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(user.status))} />
                            <span className="capitalize">{user.status}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Role:</span>
                          <span className="ml-1 capitalize">{user.role}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Device:</span>
                          <span className="ml-1 capitalize">{user.device}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Connection:</span>
                          <span className="ml-1 capitalize">{user.connectionQuality}</span>
                        </div>
                      </div>

                      {user.currentView && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Currently viewing:</span>
                          <p className="font-medium">{user.currentView.fileName}</p>
                          {user.currentView.position && (
                            <p className="text-xs text-muted-foreground">
                              Position: {user.currentView.position.x.toFixed(1)}%, {user.currentView.position.y.toFixed(1)}%
                            </p>
                          )}
                        </div>
                      )}

                      <div className="text-sm">
                        <span className="text-muted-foreground">Joined:</span>
                        <span className="ml-1">{formatDistanceToNow(new Date(user.joinedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}