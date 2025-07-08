"use client"

import { useState, useReducer, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, Search, Filter, CheckCircle, X } from 'lucide-react'

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
}