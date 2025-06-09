'use client'

import { useState } from 'react'
import { Calendar, Clock, CheckCircle, Plus, Filter, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

export default function MyDayPage() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review client feedback for Logo Project', priority: 'high', completed: false, time: '9:00 AM' },
    { id: 2, title: 'Upload final assets to project folder', priority: 'medium', completed: true, time: '10:30 AM' },
    { id: 3, title: 'Team standup meeting', priority: 'high', completed: false, time: '11:00 AM' },
    { id: 4, title: 'Invoice approval for Q4 projects', priority: 'low', completed: false, time: '2:00 PM' },
    { id: 5, title: 'Client presentation prep', priority: 'high', completed: false, time: '3:30 PM' },
  ])

  const toggleTask = (id: number) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Day</h1>
          <p className="text-gray-600">{today}</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Daily Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.completed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => !t.completed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Badge variant="destructive" className="h-8 w-8 rounded-full flex items-center justify-center p-0">
                !
              </Badge>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.priority === 'high' && !t.completed).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your tasks and appointments for today</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`flex items-center space-x-4 p-4 rounded-lg border transition-all hover:shadow-sm ${
                  task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                }`}
              >
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-gray-500">{task.time}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">📁</span>
              <span>New Project</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">📄</span>
              <span>Create Invoice</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">👥</span>
              <span>Team Meeting</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">📊</span>
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 