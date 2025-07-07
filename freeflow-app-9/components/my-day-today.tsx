"use client"

import { useState, useReducer } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, Clock, AlertCircle, CheckCircle2, Calendar, 
  Users, Target, Mail, Send, Edit3, Trash2, Bell
} from 'lucide-react'

interface Reminder {
  id: string
  title: string
  description?: string
  time: string
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  estimatedDuration?: string
  project?: string
  type: 'task' | 'meeting' | 'followup'
}

interface Email {
  id: string
  to: string
  subject: string
  content: string
  scheduled: boolean
  scheduledTime?: string
  sent: boolean
  sentTime?: string
  priority: 'high' | 'normal' | 'low'
  template?: string
}

interface MyDayState {
  reminders: Reminder[]
  emails: Email[]
  emailConnected: boolean
  showReminderModal: boolean
  showEmailModal: boolean
  editingReminder: Reminder | null
  editingEmail: Email | null
}

type MyDayAction =
  | { type: 'ADD_REMINDER'; reminder: Reminder }
  | { type: 'UPDATE_REMINDER'; id: string; reminder: Partial<Reminder> }
  | { type: 'DELETE_REMINDER'; id: string }
  | { type: 'TOGGLE_REMINDER'; id: string }
  | { type: 'ADD_EMAIL'; email: Email }
  | { type: 'UPDATE_EMAIL'; id: string; email: Partial<Email> }
  | { type: 'DELETE_EMAIL'; id: string }
  | { type: 'SEND_EMAIL'; id: string }
  | { type: 'SET_REMINDER_MODAL'; show: boolean; reminder?: Reminder }
  | { type: 'SET_EMAIL_MODAL'; show: boolean; email?: Email }

// Reducer for managing My Day state using Context7 patterns
function myDayReducer(state: MyDayState, action: MyDayAction): MyDayState {
  switch (action.type) {
    case 'ADD_REMINDER':
      return {
        ...state,
        reminders: [...state.reminders, action.reminder],
        showReminderModal: false
      }
    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r => 
          r.id === action.id ? { ...r, ...action.reminder } : r
        ),
        showReminderModal: false
      }
    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(r => r.id !== action.id)
      }
    case 'TOGGLE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(r => 
          r.id === action.id ? { ...r, completed: !r.completed } : r
        )
      }
    case 'ADD_EMAIL':
      return {
        ...state,
        emails: [...state.emails, action.email],
        showEmailModal: false
      }
    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map(e => 
          e.id === action.id ? { ...e, ...action.email } : e
        ),
        showEmailModal: false
      }
    case 'DELETE_EMAIL':
      return {
        ...state,
        emails: state.emails.filter(e => e.id !== action.id)
      }
    case 'SEND_EMAIL':
      return {
        ...state,
        emails: state.emails.map(e => 
          e.id === action.id ? { ...e, sent: true, sentTime: new Date().toISOString() } : e
        )
      }
    case 'SET_REMINDER_MODAL':
      return {
        ...state,
        showReminderModal: action.show,
        editingReminder: action.reminder || null
      }
    case 'SET_EMAIL_MODAL':
      return {
        ...state,
        showEmailModal: action.show,
        editingEmail: action.email || null
      }
    default:
      return state
  }
}

// Initial state with sample data
const initialState: MyDayState = {
  reminders: [
    {
      id: '1',
      title: 'Complete logo variations for TechCorp',
      description: 'Finalize the logo variations and prepare for client presentation',
      time: '10:00',
      priority: 'high',
      completed: false,
      estimatedDuration: '2h',
      project: 'TechCorp Brand Identity',
      type: 'task'
    },
    {
      id: '2',
      title: 'Review and update wireframes',
      description: 'Update wireframes based on client feedback from yesterday',
      time: '14:30',
      priority: 'medium',
      completed: false,
      estimatedDuration: '1.5h',
      project: 'E-commerce Platform',
      type: 'task'
    },
    {
      id: '3',
      title: 'Prepare client presentation',
      description: 'Organize presentation materials for tomorrow\'s client meeting',
      time: '16:00',
      priority: 'high',
      completed: false,
      estimatedDuration: '1h',
      project: 'Fashion Brand Campaign',
      type: 'meeting'
    },
    {
      id: '4',
      title: 'Team feedback incorporation',
      description: 'Implement team suggestions on the mobile app design',
      time: '17:00',
      priority: 'medium',
      completed: false,
      estimatedDuration: '30m',
      project: 'Mobile App Design',
      type: 'followup'
    }
  ],
  emails: [
    {
      id: '1',
      to: 'client@techcorp.com',
      subject: 'Logo Design Update - Ready for Review',
      content: 'Hi there,\n\nI\'ve completed the logo variations as discussed. Please find the files attached for your review.\n\nBest regards,\nJohn',
      scheduled: true,
      scheduledTime: '09:00',
      sent: false,
      priority: 'high',
      template: 'client_update'
    },
    {
      id: '2',
      to: 'team@agency.com',
      subject: 'Project Status Update',
      content: 'Team,\n\nHere\'s the weekly project status update...\n\nBest,\nJohn',
      scheduled: true,
      scheduledTime: '17:30',
      sent: false,
      priority: 'normal',
      template: 'team_update'
    }
  ],
  emailConnected: true,
  showReminderModal: false,
  showEmailModal: false,
  editingReminder: null,
  editingEmail: null
}

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  low: 'bg-green-100 text-green-800 border-green-200'
}

const statusColors = {
  completed: "text-green-600", 
  'in-progress': "text-blue-600", 
  upcoming: 'text-slate-600'
}

const typeIcons = {
  meeting: Users,
  work: Target,
  task: Target,
  followup: Target
}

export function MyDayToday() {
  const [state, dispatch] = useReducer(myDayReducer, initialState)
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    time: '',
    priority: 'medium' as const,
    estimatedDuration: '',
    project: '',
    type: 'task' as const
  })
  const [newEmail, setNewEmail] = useState({
    to: '',
    subject: '',
    content: '',
    scheduled: false,
    scheduledTime: '',
    priority: 'normal' as const,
    template: ''
  })

  const getPriorityColor = (priority: string) => {
    return priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium
  }

  const getTypeIcon = (type: string) => {
    const IconComponent = typeIcons[type as keyof typeof typeIcons] || Target
    return IconComponent
  }

  const handleAddReminder = () => {
    if (!newReminder.title.trim()) return

    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      time: newReminder.time,
      priority: newReminder.priority,
      completed: false,
      estimatedDuration: newReminder.estimatedDuration,
      project: newReminder.project,
      type: newReminder.type
    }

    dispatch({ type: 'ADD_REMINDER', reminder })
    setNewReminder({
      title: '',
      description: '',
      time: '',
      priority: 'medium',
      estimatedDuration: '',
      project: '',
      type: 'task'
    })
  }

  const handleAddEmail = () => {
    if (!newEmail.to.trim() || !newEmail.subject.trim()) return

    const email: Email = {
      id: Date.now().toString(),
      to: newEmail.to,
      subject: newEmail.subject,
      content: newEmail.content,
      scheduled: newEmail.scheduled,
      scheduledTime: newEmail.scheduledTime,
      sent: false,
      priority: newEmail.priority,
      template: newEmail.template
    }

    dispatch({ type: 'ADD_EMAIL', email })
    setNewEmail({
      to: '',
      subject: '',
      content: '',
      scheduled: false,
      scheduledTime: '',
      priority: 'normal',
      template: ''
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Day Today</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => dispatch({ type: 'SET_REMINDER_MODAL', show: true })}>
            <Plus className="w-4 h-4 mr-2" />
            Add Reminder
          </Button>
          <Button 
            variant="outline"
            onClick={() => dispatch({ type: 'SET_EMAIL_MODAL', show: true })}
          >
            <Mail className="w-4 h-4 mr-2" />
            Schedule Email
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reminders Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Reminders & Tasks
                </CardTitle>
                <CardDescription>
                  {state.reminders.filter(r => !r.completed).length} pending tasks
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.reminders.map((reminder) => {
              const IconComponent = getTypeIcon(reminder.type)
              return (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-lg border ${
                    reminder.completed ? 'bg-muted/50 opacity-75' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-6 w-6"
                        onClick={() => dispatch({ type: 'TOGGLE_REMINDER', id: reminder.id })}
                      >
                        {reminder.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium ${
                            reminder.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {reminder.title}
                          </h4>
                          <Badge variant="outline" className={getPriorityColor(reminder.priority)}>
                            {reminder.priority}
                          </Badge>
                        </div>
                        {reminder.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {reminder.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reminder.time}
                          </span>
                          {reminder.estimatedDuration && (
                            <span>{reminder.estimatedDuration}</span>
                          )}
                          {reminder.project && (
                            <span className="flex items-center gap-1">
                              <IconComponent className="w-3 h-3" />
                              {reminder.project}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ 
                          type: 'SET_REMINDER_MODAL', 
                          show: true, 
                          reminder 
                        })}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ type: 'DELETE_REMINDER', id: reminder.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Emails Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Scheduled Emails
                </CardTitle>
                <CardDescription>
                  {state.emails.filter(e => !e.sent).length} emails pending
                </CardDescription>
              </div>
              <Badge variant={state.emailConnected ? 'default' : 'destructive'}>
                {state.emailConnected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {state.emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 rounded-lg border ${
                  email.sent ? 'bg-muted/50 opacity-75' : 'bg-background'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-medium ${
                        email.sent ? 'line-through text-muted-foreground' : ''
                      }`}>
                        {email.subject}
                      </h4>
                      <Badge variant="outline" className={getPriorityColor(email.priority)}>
                        {email.priority}
                      </Badge>
                      {email.sent && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Sent
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      To: {email.to}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {email.scheduled && email.scheduledTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {email.scheduledTime}
                        </span>
                      )}
                      {email.sent && email.sentTime && (
                        <span>
                          Sent: {new Date(email.sentTime).toLocaleTimeString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!email.sent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch({ type: 'SEND_EMAIL', id: email.id })}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ 
                        type: 'SET_EMAIL_MODAL', 
                        show: true, 
                        email 
                      })}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: 'DELETE_EMAIL', id: email.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Forms */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Reminder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newReminder.title}
                onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                placeholder="Enter reminder title..."
              />
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={newReminder.time}
                onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReminder.description}
                onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                placeholder="Add details..."
                rows={3}
              />
            </div>
            <Button onClick={handleAddReminder} className="w-full">
              Add Reminder
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Schedule Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={newEmail.to}
                onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={newEmail.subject}
                onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                placeholder="Email subject..."
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newEmail.content}
                onChange={(e) => setNewEmail({ ...newEmail, content: e.target.value })}
                placeholder="Email content..."
                rows={3}
              />
            </div>
            <Button onClick={handleAddEmail} className="w-full">
              Schedule Email
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
