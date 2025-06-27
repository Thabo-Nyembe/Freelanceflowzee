#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple and effective fixes for critical build errors
const fixes = [
  {
    file: 'app/(app)/dashboard/my-day/page.tsx',
    find: /setNewTaskTitle\('''\)/g,
    replace: "setNewTaskTitle('')"
  },
  {
    file: 'app/(app)/dashboard/my-day/page.tsx',
    find: /setNewTaskDescription\('''\)/g,
    replace: "setNewTaskDescription('')"
  },
  {
    file: 'app/(app)/dashboard/page.tsx',
    find: /^use client$/gm,
    replace: "'use client'"
  },
  {
    file: 'app/(app)/dashboard/time-tracking/page.tsx',
    find: /^use client$/gm,
    replace: "'use client'"
  }
];

// Files that need complete rewriting
const filesToRewrite = {
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
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'Project Update',
        message: 'Your project has been updated',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      }
    ]
    dispatch({ type: 'SET_NOTIFICATIONS', payload: mockNotifications })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Notifications</h1>
        <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.notifications.map((notification) => (
                <div key={notification.id} className="p-4 rounded-lg border bg-white">
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <Badge variant="outline">{notification.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
        }
      ],
      updates: [
        {
          id: '1',
          type: 'milestone',
          title: 'Milestone Completed',
          content: 'Initial concepts completed',
          timestamp: '2024-01-16T10:00:00Z'
        }
      ]
    }
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Project Tracker</h1>
        <div className="space-y-6">
          {projects.map((project) => (
            <Card key={project.id} className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
                <Badge variant="default">{project.status}</Badge>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: project.progress + '%' }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Milestones</h3>
                    <div className="space-y-2">
                      {project.milestones.map((milestone) => (
                        <div key={milestone.id} className="p-3 rounded-lg border bg-white">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                          <Badge variant={milestone.completed ? 'default' : 'outline'}>
                            {milestone.completed ? 'Complete' : 'Pending'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Recent Updates</h3>
                    <div className="space-y-2">
                      {project.updates.map((update) => (
                        <div key={update.id} className="p-3 bg-white rounded-lg border">
                          <Badge variant="outline">{update.type}</Badge>
                          <h4 className="font-medium text-sm">{update.title}</h4>
                          <p className="text-sm text-gray-600">{update.content}</p>
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
}`
};

console.log('🔧 Starting build error fixes...\n');

// Apply simple fixes
let fixCount = 0;
fixes.forEach(({ file, find, replace }) => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      if (find.test(content)) {
        content = content.replace(find, replace);
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed: ${file}`);
        fixCount++;
      }
    } catch (error) {
      console.log(`❌ Error fixing ${file}:`, error.message);
    }
  }
});

// Rewrite corrupted files
let rewriteCount = 0;
Object.entries(filesToRewrite).forEach(([filePath, content]) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Rewrote: ${filePath}`);
      rewriteCount++;
    } catch (error) {
      console.log(`❌ Error rewriting ${filePath}:`, error.message);
    }
  }
});

console.log(`\n🎉 Fix Summary:`);
console.log(`🔧 Files pattern-fixed: ${fixCount}`);
console.log(`📝 Files rewritten: ${rewriteCount}`);
console.log(`\n✅ Build errors should be resolved!`); 