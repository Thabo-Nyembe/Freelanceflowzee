#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Critical build error patterns and their fixes
const errorPatterns = [
  // Fix unterminated string constants with extra quotes
  {
    pattern: /(\w+\([^)]*\))'([^']*)'(?!')/g,
    replacement: "$1'$2'"
  },
  // Fix missing quotes in use client directives
  {
    pattern: /^use client$/gm,
    replacement: "'use client'"
  },
  // Fix malformed interface declarations
  {
    pattern: /^\s*(\w+):\s*string;\s*timestamp:\s*string\s*}>\s*$/gm,
    replacement: "interface ProjectUpdate {\n  id: string\n  type: 'milestone' | 'comment' | 'file' | 'status'\n  title: string\n  content: string\n  timestamp: string\n}"
  },
  // Fix broken type declarations
  {
    pattern: /^\s*payload:\s*string\s*}\s*$/gm,
    replacement: "type NotificationAction = \n  | { type: 'SET_NOTIFICATIONS'; payload: any[] }\n  | { type: 'MARK_AS_READ'; payload: string }"
  },
  // Fix unterminated string literals in className and other contexts
  {
    pattern: /className="([^"]*)"'/g,
    replacement: 'className="$1"'
  },
  // Fix HTML entities in quotes
  {
    pattern: /&apos;/g,
    replacement: "'"
  },
  {
    pattern: /&quot;/g,
    replacement: '"'
  },
  // Fix missing imports for common icons
  {
    pattern: /(import.*from\s+['"]lucide-react['"])/,
    replacement: "$1\n// Added missing icons\nimport { ArrowRight, Play, Pause, BarChart3, Trash2 } from 'lucide-react'"
  }
];

// Files that need complete rewriting due to severe corruption
const filesToRewrite = {
  'app/(app)/dashboard/my-day/page.tsx': `'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Pause, BarChart3, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  estimatedTime: number
  completed: boolean
  projectId?: string
  tags: string[]
}

interface TaskState {
  tasks: Task[]
  completedTasks: Task[]
  currentTask: Task | null
  totalTimeSpent: number
  insights: {
    productiveHours: string
    completionRate: number
    averageTaskTime: number
  }
}

type TaskAction = 
  | { type: 'ADD_TASK'; task: Task }
  | { type: 'COMPLETE_TASK'; taskId: string }
  | { type: 'SET_CURRENT_TASK'; task: Task | null }
  | { type: 'UPDATE_TIME'; time: number }

const initialState: TaskState = {
  tasks: [],
  completedTasks: [],
  currentTask: null,
  totalTimeSpent: 0,
  insights: {
    productiveHours: '9-11 AM',
    completionRate: 75,
    averageTaskTime: 45
  }
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.task] }
    case 'COMPLETE_TASK':
      const taskToComplete = state.tasks.find(t => t.id === action.taskId)
      if (!taskToComplete) return state
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.taskId),
        completedTasks: [...state.completedTasks, { ...taskToComplete, completed: true }]
      }
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.task }
    case 'UPDATE_TIME':
      return { ...state, totalTimeSpent: state.totalTimeSpent + action.time }
    default:
      return state
  }
}

export default function MyDayPage() {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [isAddingTask, setIsAddingTask] = useState(false)

  const addTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      category: 'work',
      estimatedTime: 30,
      completed: false,
      tags: []
    }

    dispatch({ type: 'ADD_TASK', task: newTask })
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setIsAddingTask(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            My Day Today
          </h1>
          <p className="text-gray-600">AI-powered daily planning and productivity insights</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Today's Tasks
                  <Button onClick={() => setIsAddingTask(true)} size="sm">
                    Add Task
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAddingTask && (
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="mb-2"
                    />
                    <Textarea
                      placeholder="Description (optional)"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button onClick={addTask} size="sm">Add</Button>
                      <Button onClick={() => setIsAddingTask(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {state.tasks.map((task) => (
                    <div key={task.id} className="p-3 bg-white rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-600">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
                            {task.priority}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => dispatch({ type: 'COMPLETE_TASK', taskId: task.id })}
                          >
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insights Section */}
          <div>
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Today's Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Productive Hours</h4>
                    <p className="text-lg">{state.insights.productiveHours}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Completion Rate</h4>
                    <p className="text-lg">{state.insights.completionRate}%</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600">Total Time Spent</h4>
                    <p className="text-lg">{Math.floor(state.totalTimeSpent / 60)}h {state.totalTimeSpent % 60}m</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}`,

  'app/(app)/dashboard/notifications/page.tsx': `'use client'

import React, { useState, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  timestamp: string
}

interface NotificationState {
  notifications: Notification[]
  filter: 'all' | 'unread' | 'read'
  search: string
  loading: boolean
}

type NotificationAction = 
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'SET_FILTER'; payload: NotificationState['filter'] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: NotificationState = {
  notifications: [],
  filter: 'all',
  search: '',
  loading: false
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        )
      }
    case 'SET_FILTER':
      return { ...state, filter: action.payload }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

export default function NotificationsPage() {
  const [state, dispatch] = useReducer(notificationReducer, initialState)

  useEffect(() => {
    // Mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Project Update',
        message: 'Your project "Brand Identity" has been updated',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Payment Received',
        message: 'Payment of $500 has been received',
        type: 'success',
        read: true,
        timestamp: new Date().toISOString()
      }
    ]
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications })
  }, [])

  const filteredNotifications = state.notifications.filter(notification => {
    const matchesFilter = state.filter === 'all' || 
      (state.filter === 'read' && notification.read) ||
      (state.filter === 'unread' && !notification.read)
    
    const matchesSearch = notification.title.toLowerCase().includes(state.search.toLowerCase()) ||
      notification.message.toLowerCase().includes(state.search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">Stay updated with your latest activities</p>
        </div>

        <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <div className="flex gap-4">
              <Input
                placeholder="Search notifications..."
                value={state.search}
                onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
                className="max-w-xs"
              />
              <div className="flex gap-2">
                <Button
                  variant={state.filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
                >
                  All
                </Button>
                <Button
                  variant={state.filter === 'unread' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'unread' })}
                >
                  Unread
                </Button>
                <Button
                  variant={state.filter === 'read' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: 'read' })}
                >
                  Read
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <Badge
                          variant={
                            notification.type === 'success' ? 'default' :
                            notification.type === 'error' ? 'destructive' :
                            notification.type === 'warning' ? 'secondary' : 'outline'
                          }
                        >
                          {notification.type}
                        </Badge>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dispatch({ type: 'MARK_AS_READ', payload: notification.id })}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`,

  'app/(app)/dashboard/page.tsx': `'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">Welcome to your FreeflowZee dashboard</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2">5</div>
              <p className="text-sm text-gray-600">Projects in progress</p>
              <Button className="mt-4 w-full" variant="outline">
                View All Projects
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 mb-2">$12,400</div>
              <p className="text-sm text-gray-600">This month</p>
              <Button className="mt-4 w-full" variant="outline">
                View Analytics
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Time Tracked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 mb-2">187h</div>
              <p className="text-sm text-gray-600">This month</p>
              <Button className="mt-4 w-full" variant="outline">
                Time Tracker
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}`,

  'app/(app)/dashboard/project-tracker/page.tsx': `'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProjectUpdate {
  id: string
  type: 'milestone' | 'comment' | 'file' | 'status'
  title: string
  content: string
  timestamp: string
}

interface ProjectMilestone {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate: string
}

interface Project {
  id: string
  title: string
  status: 'active' | 'completed' | 'paused'
  progress: number
  milestones: ProjectMilestone[]
  updates: ProjectUpdate[]
}

export default function ProjectTrackerPage() {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      title: 'Brand Identity Design',
      status: 'active',
      progress: 75,
      milestones: [
        {
          id: '1',
          title: 'Initial Concepts',
          description: 'Create initial design concepts',
          completed: true,
          dueDate: '2024-01-15'
        },
        {
          id: '2',
          title: 'Client Review',
          description: 'Present concepts to client',
          completed: true,
          dueDate: '2024-01-20'
        },
        {
          id: '3',
          title: 'Final Design',
          description: 'Complete final design',
          completed: false,
          dueDate: '2024-01-25'
        }
      ],
      updates: [
        {
          id: '1',
          type: 'milestone',
          title: 'Milestone Completed',
          content: 'Initial concepts have been completed and approved',
          timestamp: '2024-01-16T10:00:00Z'
        }
      ]
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Project Tracker
          </h1>
          <p className="text-gray-600">Monitor project progress and milestones</p>
        </div>

        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{project.title}</CardTitle>
                  <Badge
                    variant={
                      project.status === 'active' ? 'default' :
                      project.status === 'completed' ? 'secondary' : 'outline'
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: \`\${project.progress}%\` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{project.progress}% Complete</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Milestones</h3>
                    <div className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={\`p-3 rounded-lg border \${
                            milestone.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                          }\`}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <Badge variant={milestone.completed ? 'default' : 'outline'}>
                              {milestone.completed ? 'Complete' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Recent Updates</h3>
                    <div className="space-y-2">
                      {project.updates.map((update) => (
                        <div key={update.id} className="p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{update.type}</Badge>
                            <h4 className="font-medium text-sm">{update.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{update.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(update.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}`,

  'app/(app)/dashboard/time-tracking/page.tsx': `'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TimeEntry {
  id: string
  project: string
  task: string
  duration: number
  date: string
  billable: boolean
}

const mockEntries: TimeEntry[] = [
  {
    id: '1',
    project: 'Brand Identity',
    task: 'Logo Design',
    duration: 120,
    date: '2024-01-15',
    billable: true
  },
  {
    id: '2',
    project: 'Website Redesign',
    task: 'UI Design',
    duration: 180,
    date: '2024-01-15',
    billable: true
  }
]

export default function TimeTrackingPage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    setEntries(mockEntries)
  }, [])

  const startTracking = (project: string, task: string) => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      project,
      task,
      duration: 0,
      date: new Date().toISOString().split('T')[0],
      billable: true
    }
    setCurrentEntry(newEntry)
    setIsTracking(true)
    setElapsedTime(0)
  }

  const stopTracking = () => {
    if (currentEntry) {
      const updatedEntry = { ...currentEntry, duration: elapsedTime }
      setEntries(prev => [...prev, updatedEntry])
      setCurrentEntry(null)
      setIsTracking(false)
      setElapsedTime(0)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return \`\${hours.toString().padStart(2, '0')}:\${minutes.toString().padStart(2, '0')}:\${secs.toString().padStart(2, '0')}\`
  }

  const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 3600
  const billableHours = entries.filter(e => e.billable).reduce((sum, entry) => sum + entry.duration, 0) / 3600

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Time Tracking
          </h1>
          <p className="text-gray-600">Track your time and manage productivity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {totalHours.toFixed(1)}h
              </div>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Billable Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {billableHours.toFixed(1)}h
              </div>
              <p className="text-sm text-gray-600">This week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Current Session</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {formatTime(elapsedTime)}
              </div>
              <p className="text-sm text-gray-600">
                {isTracking ? 'Tracking...' : 'Not tracking'}
              </p>
              <div className="mt-4 space-y-2">
                {!isTracking ? (
                  <Button 
                    onClick={() => startTracking('New Project', 'New Task')}
                    className="w-full"
                  >
                    Start Tracking
                  </Button>
                ) : (
                  <Button 
                    onClick={stopTracking}
                    variant="destructive"
                    className="w-full"
                  >
                    Stop Tracking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{entry.project}</h3>
                      <p className="text-sm text-gray-600">{entry.task}</p>
                      <p className="text-xs text-gray-400">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatTime(entry.duration)}
                      </div>
                      <Badge variant={entry.billable ? 'default' : 'secondary'}>
                        {entry.billable ? 'Billable' : 'Non-billable'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}`
};

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fixed = false;

    // Apply pattern fixes
    errorPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        fixed = true;
      }
    });

    if (fixed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed patterns in: ${filePath}`);
    }

    return fixed;
  } catch (error) {
    console.log(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function rewriteFile(filePath, newContent) {
  try {
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Rewrote corrupted file: ${filePath}`);
    return true;
  } catch (error) {
    console.log(`❌ Error rewriting ${filePath}:`, error.message);
    return false;
  }
}

function findAllTsxFiles(dir, files = []) {
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        findAllTsxFiles(fullPath, files);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.log(`Warning: Could not read directory ${dir}`);
  }
  
  return files;
}

// Main execution
console.log('🔧 Starting comprehensive build error fixes...\n');

// First, rewrite severely corrupted files
let rewriteCount = 0;
Object.entries(filesToRewrite).forEach(([filePath, content]) => {
  if (fs.existsSync(filePath)) {
    if (rewriteFile(filePath, content)) {
      rewriteCount++;
    }
  }
});

// Then apply pattern fixes to all TypeScript files
const allFiles = findAllTsxFiles('app');
let fixCount = 0;

allFiles.forEach(filePath => {
  if (fixFile(filePath)) {
    fixCount++;
  }
});

console.log(`\n🎉 Build Error Fix Summary:`);
console.log(`📝 Files rewritten: ${rewriteCount}`);
console.log(`🔧 Files pattern-fixed: ${fixCount}`);
console.log(`📁 Total files processed: ${allFiles.length}`);
console.log(`\n✅ Critical build errors should now be resolved!`);
console.log(`\nNext: Run 'npm run build' to verify fixes`); 