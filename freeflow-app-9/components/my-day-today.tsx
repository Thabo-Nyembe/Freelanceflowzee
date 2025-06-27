"use client

import { useState, useReducer } from "react"
 id: string; reminder: Partial<Reminder> }
  | { type: 'DELETE_REMINDER'; id: string }
  | { type: 'TOGGLE_REMINDER'; id: string }
  | { type: 'ADD_EMAIL'; email: Email }
  | { type: &apos;UPDATE_EMAIL&apos;; id: string; email: Partial<Email> }
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
      id: '1','
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
      id: '2','
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
      id: '3','
      title: 'Prepare client presentation',
      description: 'Organize presentation materials for tomorrow\'s client meeting','
      time: '16:00',
      priority: 'high',
      completed: false,
      estimatedDuration: '1h',
      project: 'Fashion Brand Campaign',
      type: 'meeting'
    },
    {
      id: '4','
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
      id: '1','
      to: 'client@techcorp.com',
      subject: 'Logo Design Update - Ready for Review',
      content: 'Hi there,\n\nI\'ve completed the logo variations as discussed. Please find the files attached for your review.\n\nBest regards,\nJohn','
      scheduled: true,
      scheduledTime: '09:00',
      sent: false,
      priority: 'high',
      template: 'client_update'
    },
    {
      id: '2','
      to: 'team@agency.com',
      subject: 'Project Status Update',
      content: 'Team,\n\nHere\'s the weekly project status update...\n\nBest,\nJohn','
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
  low: "bg-green-100 text-green-800 border-green-200"
}

const statusColors = {
  completed: "text-green-600", "in-progress": "text-blue-600", 
  upcoming: "text-slate-600"
}

const typeIcons = {
  meeting: Users,
  work: Target
}

export function MyDayToday() {
  const [state, dispatch] = useReducer(myDayReducer, initialState)
  const [newReminder, setNewReminder] = useState({
    title: '','
    description: '','
    time: '','
    priority: 'medium' as const,
    estimatedDuration: '','
    project: '','
    type: 'task' as const
  })
  const [newEmail, setNewEmail] = useState({
    to: '','
    subject: '','
    content: '','
    scheduled: false,
    scheduledTime: '','
    priority: 'normal' as const,
    template: ''
  })

  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening'

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-blue-100 text-blue-700 border-blue-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      high: 'bg-orange-100 text-orange-700 border-orange-200',
      urgent: 'bg-red-100 text-red-700 border-red-200'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      task: Target,
      meeting: Users,
      deadline: AlertTriangle,
      followup: MessageSquare
    }
    const IconComponent = icons[type as keyof typeof icons] || Target
    return <IconComponent className= "h-4 w-4" />
  }

  const handleAddReminder = () => {
    if (!newReminder.title || !newReminder.time) return

    const reminder: Reminder = {
      id: Date.now().toString(),
      ...newReminder,
      completed: false
    }

    dispatch({ type: 'ADD_REMINDER', reminder })
    setNewReminder({
      title: '','
      description: '','
      time: '','
      priority: 'medium',
      estimatedDuration: '','
      project: '','
      type: 'task'
    })
  }

  const handleAddEmail = () => {
    if (!newEmail.to || !newEmail.subject) return

    const email: Email = {
      id: Date.now().toString(),
      ...newEmail,
      sent: false
    }

    dispatch({ type: 'ADD_EMAIL', email })
    setNewEmail({
      to: '','
      subject: '','
      content: '','
      scheduled: false,
      scheduledTime: '','
      priority: 'normal',
      template: ''
    })
  }

  const completedTasks = state.reminders.filter(r => r.completed).length
  const totalTasks = state.reminders.length
  const scheduledEmails = state.emails.filter(e => e.scheduled && !e.sent).length
  const sentEmails = state.emails.filter(e => e.sent).length

  return (
    <div className= "space-y-8">
      <div className= "flex items-center justify-between">
        <div>
          <h2 className= "text-3xl font-light text-slate-800">My Day Today</h2>
          <p className= "text-lg text-slate-500 mt-1">AI-powered daily planning and insights</p>
        </div>
        <div className= "flex gap-3">
          <Button
            variant= "outline"
            className= "border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => dispatch({ type: 'SET_EMAIL_MODAL', show: true })}
          >
            <Mail className= "h-4 w-4 mr-2" />
            Email Integration
          </Button>
          <Button
            onClick={() => dispatch({ type: 'SET_REMINDER_MODAL', show: true })}
            className= "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Plus className= "h-4 w-4 mr-2" />
            Add Reminder
          </Button>
        </div>
      </div>

      {/* AI Assistant Card */}
      <Card className= "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
        <CardContent className= "p-6">
          <div className= "flex items-start gap-4">
            <div className= "w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <BrainCircuit className= "h-6 w-6 text-white" />
            </div>
            <div className= "flex-1">
              <h3 className= "text-lg font-semibold text-slate-800 mb-2">Good morning, John!</h3>
              <p className= "text-slate-600 leading-relaxed">
                I've analyzed your schedule, deadlines, and priorities. Today looks busy with the Acme Corp project
                deadline approaching. I've optimized your day to balance client work, creative time, and necessary
                meetings. You have {state.reminders.length} reminders set and {scheduledEmails} emails scheduled to send.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className= "grid grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className= "col-span-2">
          <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className= "text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className= "h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className= "space-y-6">
              {/* Morning Block */}
              <div>
                <h4 className= "text-md font-semibold text-slate-700 mb-3 flex items-center">
                  <Coffee className= "h-4 w-4 mr-2 text-amber-500" />
                  Morning Focus (9:00 AM - 12:00 PM)
                </h4>
                <div className= "space-y-3 pl-6">
                  <div className= "p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                    <div className= "flex items-center justify-between mb-2">
                      <div className= "flex items-center">
                        <span className= "font-mono text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded mr-3">
                          9:00 AM
                        </span>
                        <h5 className= "font-medium text-slate-800">Brand Identity Design</h5>
                      </div>
                      <Badge className= "bg-blue-100 text-blue-700">2 hours</Badge>
                    </div>
                    <p className= "text-sm text-slate-600">
                      Focus on finalizing the logo variations for Acme Corp. Priority task as the deadline is in 3 days.
                    </p>
                    <div className= "mt-2 flex items-center justify-between">
                      <div className= "flex items-center text-xs text-slate-500">
                        <FileText className= "h-3 w-3 mr-1" />
                        Acme Corp Project
                      </div>
                      <div className= "text-xs font-medium text-amber-600">High Priority</div>
                    </div>
                  </div>

                  <div className= "p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
                    <div className= "flex items-center justify-between mb-2">
                      <div className= "flex items-center">
                        <span className= "font-mono text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded mr-3">
                          11:00 AM
                        </span>
                        <h5 className= "font-medium text-slate-800">Client Video Call</h5>
                      </div>
                      <Badge className= "bg-purple-100 text-purple-700">1 hour</Badge>
                    </div>
                    <p className= "text-sm text-slate-600">
                      Review session with Tech Startup Inc. about website mockups. Prepare the latest designs for
                      presentation.
                    </p>
                    <div className= "mt-2 flex items-center justify-between">
                      <div className= "flex items-center text-xs text-slate-500">
                        <Video className= "h-3 w-3 mr-1" />
                        Tech Startup Project
                      </div>
                      <div className= "text-xs font-medium text-blue-600">Medium Priority</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Afternoon Block */}
              <div>
                <h4 className= "text-md font-semibold text-slate-700 mb-3 flex items-center">
                  <Zap className= "h-4 w-4 mr-2 text-amber-500" />
                  Afternoon Tasks (1:00 PM - 5:00 PM)
                </h4>
                <div className= "space-y-3 pl-6">
                  <div className= "p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                    <div className= "flex items-center justify-between mb-2">
                      <div className= "flex items-center">
                        <span className= "font-mono text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded mr-3">
                          1:00 PM
                        </span>
                        <h5 className= "font-medium text-slate-800">Invoice Creation</h5>
                      </div>
                      <Badge className= "bg-emerald-100 text-emerald-700">30 min</Badge>
                    </div>
                    <p className= "text-sm text-slate-600">
                      Prepare and send invoice for the completed Photography project for Fashion Brand.
                    </p>
                    <div className= "mt-2 flex items-center justify-between">
                      <div className= "flex items-center text-xs text-slate-500">
                        <FileText className= "h-3 w-3 mr-1" />
                        Administrative
                      </div>
                      <div className= "text-xs font-medium text-emerald-600">Medium Priority</div>
                    </div>
                  </div>

                  <div className= "p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                    <div className= "flex items-center justify-between mb-2">
                      <div className= "flex items-center">
                        <span className= "font-mono text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded mr-3">
                          2:00 PM
                        </span>
                        <h5 className= "font-medium text-slate-800">Creative Work</h5>
                        <Bell className= "h-4 w-4 ml-2 text-amber-500" />
                      </div>
                      <Badge className= "bg-amber-100 text-amber-700">2 hours</Badge>
                    </div>
                    <p className= "text-sm text-slate-600">
                      Work on the E-commerce website design for Tech Startup. Focus on the product page templates.
                      <span className= "text-amber-600 font-medium"> (Reminder: Follow up with Acme Corp)</span>
                    </p>
                    <div className= "mt-2 flex items-center justify-between">
                      <div className= "flex items-center text-xs text-slate-500">
                        <FileText className= "h-3 w-3 mr-1" />
                        Tech Startup Project
                      </div>
                      <div className= "text-xs font-medium text-blue-600">Medium Priority</div>
                    </div>
                  </div>

                  <div className= "p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50">
                    <div className= "flex items-center justify-between mb-2">
                      <div className= "flex items-center">
                        <span className= "font-mono text-sm text-rose-600 bg-rose-100 px-2 py-1 rounded mr-3">
                          4:00 PM
                        </span>
                        <h5 className= "font-medium text-slate-800">Client Feedback Review</h5>
                      </div>
                      <Badge className= "bg-rose-100 text-rose-700">1 hour</Badge>
                    </div>
                    <p className= "text-sm text-slate-600">
                      Review and implement feedback on the Brand Guidelines document for Acme Corp.
                    </p>
                    <div className= "mt-2 flex items-center justify-between">
                      <div className= "flex items-center text-xs text-slate-500">
                        <MessageSquare className= "h-3 w-3 mr-1" />
                        Acme Corp Project
                      </div>
                      <div className= "text-xs font-medium text-amber-600">High Priority</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Insights */}
        <div className= "space-y-6">
          {/* Daily Progress */}
          <Card className= "bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className= "text-lg font-semibold text-slate-800">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "space-y-2">
                <div className= "flex justify-between text-sm">
                  <span className= "text-slate-600">Tasks Completed</span>
                  <span className= "text-slate-800 font-medium">{completedTasks}/{totalTasks}</span>
                </div>
                <Progress value={(completedTasks / totalTasks) * 100} className= "h-2" />
              </div>

              <div className= "space-y-2">
                <div className= "flex justify-between text-sm">
                  <span className= "text-slate-600">Hours Tracked</span>
                  <span className= "text-slate-800 font-medium">3.5/8</span>
                </div>
                <Progress value={75} className= "h-2" />
              </div>

              <div className= "space-y-2">
                <div className= "flex justify-between text-sm">
                  <span className= "text-slate-600">Project Progress</span>
                  <span className= "text-slate-800 font-medium">75%</span>
                </div>
                <Progress value={75} className= "h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className= "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle className= "text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Bell className= "h-5 w-5" />
                  Reminders
                </CardTitle>
                <Dialog 
                  open={state.showReminderModal} 
                  onOpenChange={(open) => dispatch({ type: 'SET_REMINDER_MODAL', show: open })}
                >
                  <DialogTrigger asChild>
                    <Button size= "sm" variant= "outline" className= "border-amber-200 text-amber-600 hover:bg-amber-50">
                      <Plus className= "h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className= "sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Reminder</DialogTitle>
                      <DialogDescription>
                        Create a new reminder with priority and time estimation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className= "space-y-4">
                      <div>
                        <Label htmlFor= "reminder-title">Title</Label>
                        <Input
                          id= "reminder-title"
                          value={newReminder.title}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                          placeholder= "Enter reminder title"
                        />
                      </div>
                      <div>
                        <Label htmlFor= "reminder-description">Description</Label>
                        <Textarea
                          id= "reminder-description"
                          value={newReminder.description}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, description: e.target.value }))}
                          placeholder= "Enter description"
                          rows={2}
                        />
                      </div>
                      <div className= "grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor= "reminder-time">Time</Label>
                          <Input
                            id= "reminder-time"
                            type= "time"
                            value={newReminder.time}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor= "reminder-duration">Duration</Label>
                          <Input
                            id= "reminder-duration"
                            value={newReminder.estimatedDuration}
                            onChange={(e) => setNewReminder(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                            placeholder= "e.g., 1h 30m"
                          />
                        </div>
                      </div>
                      <div className= "grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor= "reminder-priority">Priority</Label>
                          <Select 
                            value={newReminder.priority} 
                            onValueChange={(value) => setNewReminder(prev => ({ ...prev, priority: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder= "Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value= "low">Low</SelectItem>
                              <SelectItem value= "medium">Medium</SelectItem>
                              <SelectItem value= "high">High</SelectItem>
                              <SelectItem value= "urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor= "reminder-type">Type</Label>
                          <Select 
                            value={newReminder.type} 
                            onValueChange={(value) => setNewReminder(prev => ({ ...prev, type: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder= "Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value= "task">Task</SelectItem>
                              <SelectItem value= "meeting">Meeting</SelectItem>
                              <SelectItem value= "deadline">Deadline</SelectItem>
                              <SelectItem value= "followup">Follow-up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor= "reminder-project">Project (Optional)</Label>
                        <Input
                          id= "reminder-project"
                          value={newReminder.project}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, project: e.target.value }))}
                          placeholder= "Associated project"
                        />
                      </div>
                      <div className= "flex justify-end space-x-2">
                        <Button
                          variant= "outline"
                          onClick={() => dispatch({ type: 'SET_REMINDER_MODAL', show: false })}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleAddReminder}>
                          Add Reminder
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className= "space-y-3">
              {state.reminders.map((reminder) => (
                <div
                  key={reminder.id}
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    reminder.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className= "flex items-start justify-between">
                    <div className= "flex-1">
                      <div className= "flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          reminder.completed ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}>
                          {reminder.title}
                        </h4>
                        <Badge className={`text-xs ${getPriorityColor(reminder.priority)}`}>
                          {getTypeIcon(reminder.type)}
                        </Badge>
                      </div>
                      {reminder.description && (
                        <p className= "text-xs text-slate-600 mb-2">{reminder.description}</p>
                      )}
                      <div className= "flex items-center gap-2 text-xs text-slate-500">
                        <Clock className= "h-3 w-3" />
                        <span>{reminder.time}</span>
                        {reminder.estimatedDuration && (
                          <>
                            <span>•</span>
                            <span>{reminder.estimatedDuration}</span>
                          </>
                        )}
                      </div>
                      {reminder.project && (
                        <Badge className= "mt-2 text-xs bg-blue-100 text-blue-700">
                          {reminder.project}
                        </Badge>
                      )}
                    </div>
                    <div className= "flex items-center gap-1">
                      <Button
                        size= "sm"
                        variant= "ghost"
                        onClick={() => dispatch({ type: 'TOGGLE_REMINDER', id: reminder.id })}
                        className= "h-6 w-6 p-0"
                      >
                        {reminder.completed ? (
                          <CheckCircle className= "h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className= "h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                      <Button
                        size= "sm"
                        variant= "ghost"
                        onClick={() => dispatch({ type: 'DELETE_REMINDER', id: reminder.id })}
                        className= "h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className= "h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Email Integration */}
          <Card className= "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className= "text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Mail className= "h-5 w-5" />
                Email Status
              </CardTitle>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "p-3 rounded-lg bg-white/50">
                <div className= "flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${state.emailConnected ? &apos;bg-green-400&apos; : &apos;bg-red-400&apos;}`}></div>
                  <h4 className= "font-medium text-slate-800 text-sm">
                    {state.emailConnected ? 'Connected' : 'Disconnected'}
                  </h4>
                </div>
                <p className= "text-xs text-slate-600">john.doe@email.com</p>
              </div>

              <div className= "space-y-2">
                <div className= "flex justify-between text-sm">
                  <span className= "text-slate-600">Scheduled Emails</span>
                  <span className= "text-slate-800 font-medium">{scheduledEmails}</span>
                </div>
                <div className= "flex justify-between text-sm">
                  <span className= "text-slate-600">Sent Today</span>
                  <span className= "text-slate-800 font-medium">{sentEmails}</span>
                </div>
              </div>

              <Dialog 
                open={state.showEmailModal} 
                onOpenChange={(open) => dispatch({ type: 'SET_EMAIL_MODAL', show: open })}
              >
                <DialogTrigger asChild>
                  <Button className= "w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
                    <Send className= "h-4 w-4 mr-2" />
                    Compose Email
                  </Button>
                </DialogTrigger>
                <DialogContent className= "sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                    <DialogDescription>
                      Create and schedule emails with smart templates.
                    </DialogDescription>
                  </DialogHeader>
                  <div className= "space-y-4">
                    <div className= "grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor= "email-to">To</Label>
                        <Input
                          id= "email-to"
                          value={newEmail.to}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, to: e.target.value }))}
                          placeholder= "recipient@email.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor= "email-template">Template</Label>
                        <Select 
                          value={newEmail.template} 
                          onValueChange={(value) => setNewEmail(prev => ({ ...prev, template: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder= "Select template" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value= "client_update">Client Update</SelectItem>
                            <SelectItem value= "team_update">Team Update</SelectItem>
                            <SelectItem value= "project_status">Project Status</SelectItem>
                            <SelectItem value= "follow_up">Follow Up</SelectItem>
                            <SelectItem value= "custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor= "email-subject">Subject</Label>
                      <Input
                        id= "email-subject"
                        value={newEmail.subject}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder= "Email subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor= "email-content">Content</Label>
                      <Textarea
                        id= "email-content"
                        value={newEmail.content}
                        onChange={(e) => setNewEmail(prev => ({ ...prev, content: e.target.value }))}
                        placeholder= "Email content"
                        rows={4}
                      />
                    </div>
                    <div className= "flex items-center space-x-4">
                      <div className= "flex items-center space-x-2">
                        <input
                          type= "checkbox"
                          id= "email-scheduled"
                          checked={newEmail.scheduled}
                          onChange={(e) => setNewEmail(prev => ({ ...prev, scheduled: e.target.checked }))}
                          className= "rounded"
                        />
                        <Label htmlFor= "email-scheduled" className= "text-sm">Schedule for later</Label>
                      </div>
                      {newEmail.scheduled && (
                        <div>
                          <Input
                            type= "time"
                            value={newEmail.scheduledTime}
                            onChange={(e) => setNewEmail(prev => ({ ...prev, scheduledTime: e.target.value }))}
                            className= "w-32"
                          />
                        </div>
                      )}
                    </div>
                    <div className= "flex justify-end space-x-2">
                      <Button
                        variant= "outline"
                        onClick={() => dispatch({ type: 'SET_EMAIL_MODAL', show: false })}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddEmail}>
                        {newEmail.scheduled ? 'Schedule Email' : 'Send Now'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className= "bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className= "text-lg font-semibold text-purple-800">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "p-3 rounded-lg bg-white/50">
                <div className= "flex items-center gap-2 mb-2">
                  <Sparkles className= "h-4 w-4 text-purple-500" />
                  <h4 className= "font-medium text-slate-800 text-sm">Productivity Peak</h4>
                </div>
                <p className= "text-xs text-slate-600">
                  Your most productive hours are between 9-11 AM. Schedule creative work during this time.
                </p>
              </div>

              <div className= "p-3 rounded-lg bg-white/50">
                <div className= "flex items-center gap-2 mb-2">
                  <Clock className= "h-4 w-4 text-purple-500" />
                  <h4 className= "font-medium text-slate-800 text-sm">Time Management</h4>
                </div>
                <p className= "text-xs text-slate-600">
                  You spend 40% of your time in meetings. Consider blocking focused work time.
                </p>
              </div>

              <div className= "p-3 rounded-lg bg-white/50">
                <div className= "flex items-center gap-2 mb-2">
                  <CheckCircle className= "h-4 w-4 text-purple-500" />
                  <h4 className= "font-medium text-slate-800 text-sm">Goal Progress</h4>
                </div>
                <p className= "text-xs text-slate-600">
                  You're on track to complete the Acme Corp project by the deadline.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
