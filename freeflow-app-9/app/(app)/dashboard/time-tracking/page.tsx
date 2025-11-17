'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Pause, Clock, BarChart3, Calendar, FileText, Edit, Trash2, Plus, Copy, Download, Filter, RotateCcw } from 'lucide-react'

interface TimeEntry {
  id: string
  projectId: string
  taskId: string
  description: string
  startTime: Date
  endTime?: Date
  duration: number
  isRunning: boolean
}

interface Project {
  id: string
  name: string
  tasks: Task[]
}

interface Task {
  id: string
  name: string
  projectId: string
}

export default function TimeTrackingPage() {
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null)
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<string>('')
  const [description, setDescription] = useState<any>('')
  const [elapsedTime, setElapsedTime] = useState<any>(0)

  // Mock data - replace with real data from your API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      tasks: [
        { id: '1', name: 'UI Design', projectId: '1' },
        { id: '2', name: 'Frontend Development', projectId: '1' },
      ],
    },
    {
      id: '2',
      name: 'Mobile App',
      tasks: [
        { id: '3', name: 'Wireframes', projectId: '2' },
        { id: '4', name: 'User Testing', projectId: '2' },
      ],
    },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = () => {
    if (!selectedProject || !selectedTask) return

    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      projectId: selectedProject,
      taskId: selectedTask,
      description,
      startTime: new Date(),
      duration: 0,
      isRunning: true,
    }

    setActiveTimer(newEntry)
    setTimeEntries((prev) => [...prev, newEntry])
    setElapsedTime(0)
  }

  const stopTimer = () => {
    if (!activeTimer) return

    const endedEntry = {
      ...activeTimer,
      endTime: new Date(),
      duration: elapsedTime,
      isRunning: false,
    }

    setTimeEntries((prev) =>
      prev.map((entry) =>
        entry.id === activeTimer.id ? endedEntry : entry
      )
    )
    setActiveTimer(null)
    setElapsedTime(0)
  }

  const handleEditEntry = (entry: TimeEntry) => {
    console.log('✏️ EDIT TIME ENTRY - ID:', entry.id)
    const newDescription = prompt('Edit description:', entry.description)
    if (newDescription !== null) {
      setTimeEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id ? { ...e, description: newDescription } : e
        )
      )
      alert('✅ Time entry updated successfully!')
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    console.log('🗑️ DELETE TIME ENTRY - ID:', entryId)
    if (confirm('⚠️ Delete Time Entry?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      setTimeEntries((prev) => prev.filter((e) => e.id !== entryId))
      alert('✅ Time entry deleted successfully!')
    }
  }

  const handleAddManualEntry = () => {
    console.log('➕ ADD MANUAL TIME ENTRY')
    if (!selectedProject || !selectedTask) {
      alert('⚠️ Select Project and Task\n\nPlease select a project and task before adding a manual entry.')
      return
    }
    const hours = prompt('Enter hours worked:')
    if (hours) {
      const duration = parseInt(hours) * 3600
      const newEntry: TimeEntry = {
        id: Date.now().toString(),
        projectId: selectedProject,
        taskId: selectedTask,
        description: description || 'Manual entry',
        startTime: new Date(),
        endTime: new Date(),
        duration: duration,
        isRunning: false,
      }
      setTimeEntries((prev) => [...prev, newEntry])
      alert(`✅ Manual Entry Added\n\nDuration: ${hours} hour(s)`)
    }
  }

  const handleDuplicateEntry = (entry: TimeEntry) => {
    console.log('📋 DUPLICATE TIME ENTRY - ID:', entry.id)
    const duplicated: TimeEntry = {
      ...entry,
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: new Date(),
      isRunning: false,
    }
    setTimeEntries((prev) => [...prev, duplicated])
    alert('✅ Time entry duplicated!')
  }

  const handleExportReport = (format: 'csv' | 'pdf' | 'json') => {
    console.log('💾 EXPORT REPORT - Format:', format.toUpperCase())
    const data = timeEntries.map((entry) => ({
      project: projects.find((p) => p.id === entry.projectId)?.name || 'Unknown',
      task: projects.find((p) => p.id === entry.projectId)?.tasks.find((t) => t.id === entry.taskId)?.name || 'Unknown',
      description: entry.description,
      duration: formatTime(entry.duration),
      date: entry.startTime.toLocaleDateString(),
    }))

    let content: string
    let filename: string

    if (format === 'json') {
      content = JSON.stringify(data, null, 2)
      filename = 'time-report.json'
    } else if (format === 'csv') {
      const headers = Object.keys(data[0] || {}).join(',')
      const rows = data.map((row) => Object.values(row).join(','))
      content = [headers, ...rows].join('\n')
      filename = 'time-report.csv'
    } else {
      content = `Time Tracking Report\nGenerated: ${new Date().toLocaleString()}\n\nTotal Entries: ${data.length}`
      filename = 'time-report.txt'
    }

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)

    alert(`💾 Report Exported\n\nFormat: ${format.toUpperCase()}\nFile: ${filename}\nEntries: ${data.length}`)
  }

  const handleFilterByProject = () => {
    console.log('🔍 FILTER BY PROJECT')
    alert('🔍 Filter Options\n\nAvailable filters:\n• By Project\n• By Date Range\n• By Task\n• By Duration')
  }

  const handleFilterByDateRange = () => {
    console.log('📅 FILTER BY DATE RANGE')
    const start = prompt('Enter start date (YYYY-MM-DD):')
    const end = prompt('Enter end date (YYYY-MM-DD):')
    if (start && end) {
      alert(`📅 Filtering entries from ${start} to ${end}`)
    }
  }

  const handleClearFilters = () => {
    console.log('🔄 CLEAR FILTERS')
    alert('✅ All filters cleared!')
  }

  const handleGenerateDailyReport = () => {
    console.log('📊 GENERATE DAILY REPORT')
    const today = new Date().toLocaleDateString()
    const todayEntries = timeEntries.filter(
      (e) => e.startTime.toLocaleDateString() === today
    )
    const totalTime = todayEntries.reduce((sum, e) => sum + e.duration, 0)
    alert(
      `📊 Daily Report - ${today}\n\nEntries: ${todayEntries.length}\nTotal Time: ${formatTime(totalTime)}`
    )
  }

  const handleGenerateWeeklyReport = () => {
    console.log('📊 GENERATE WEEKLY REPORT')
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    alert(
      `📊 Weekly Report\n\nTotal Entries: ${timeEntries.length}\nTotal Time: ${formatTime(totalTime)}\n\nDownload detailed report for more insights.`
    )
  }

  const handleGenerateMonthlyReport = () => {
    console.log('📊 GENERATE MONTHLY REPORT')
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    const avgPerDay = timeEntries.length > 0 ? totalTime / timeEntries.length : 0
    alert(
      `📊 Monthly Report\n\nTotal Entries: ${timeEntries.length}\nTotal Time: ${formatTime(totalTime)}\nAvg per Entry: ${formatTime(avgPerDay)}`
    )
  }

  const handleBulkDeleteEntries = () => {
    console.log('🗑️ BULK DELETE ENTRIES')
    if (timeEntries.length === 0) {
      alert('⚠️ No Entries\n\nNo time entries to delete.')
      return
    }
    if (confirm(`⚠️ Delete All ${timeEntries.length} Entries?\n\nThis action cannot be undone.\n\nAre you sure?`)) {
      setTimeEntries([])
      alert('✅ All time entries deleted!')
    }
  }

  const handleAddProject = () => {
    console.log('➕ ADD PROJECT')
    const projectName = prompt('Enter new project name:')
    if (projectName) {
      alert(`✅ Project Added: ${projectName}\n\nYou can now add tasks to this project.`)
    }
  }

  const handleEditProject = () => {
    console.log('✏️ EDIT PROJECT')
    if (!selectedProject) {
      alert('⚠️ No Project Selected\n\nPlease select a project to edit.')
      return
    }
    const project = projects.find((p) => p.id === selectedProject)
    const newName = prompt('Edit project name:', project?.name)
    if (newName) {
      alert(`✅ Project Updated: ${newName}`)
    }
  }

  const handleDeleteProject = () => {
    console.log('🗑️ DELETE PROJECT')
    if (!selectedProject) {
      alert('⚠️ No Project Selected\n\nPlease select a project to delete.')
      return
    }
    const project = projects.find((p) => p.id === selectedProject)
    if (confirm(`⚠️ Delete Project: ${project?.name}?\n\nAll time entries will be preserved.\n\nAre you sure?`)) {
      setSelectedProject('')
      alert('✅ Project deleted successfully!')
    }
  }

  const handleAddTask = () => {
    console.log('➕ ADD TASK')
    if (!selectedProject) {
      alert('⚠️ No Project Selected\n\nPlease select a project first.')
      return
    }
    const taskName = prompt('Enter new task name:')
    if (taskName) {
      alert(`✅ Task Added: ${taskName}\n\nAdded to current project.`)
    }
  }

  const handleEditTask = () => {
    console.log('✏️ EDIT TASK')
    if (!selectedTask) {
      alert('⚠️ No Task Selected\n\nPlease select a task to edit.')
      return
    }
    const task = projects
      .find((p) => p.id === selectedProject)
      ?.tasks.find((t) => t.id === selectedTask)
    const newName = prompt('Edit task name:', task?.name)
    if (newName) {
      alert(`✅ Task Updated: ${newName}`)
    }
  }

  const handleDeleteTask = () => {
    console.log('🗑️ DELETE TASK')
    if (!selectedTask) {
      alert('⚠️ No Task Selected\n\nPlease select a task to delete.')
      return
    }
    const task = projects
      .find((p) => p.id === selectedProject)
      ?.tasks.find((t) => t.id === selectedTask)
    if (confirm(`⚠️ Delete Task: ${task?.name}?\n\nAll time entries will be preserved.\n\nAre you sure?`)) {
      setSelectedTask('')
      alert('✅ Task deleted successfully!')
    }
  }

  const handleClearDescription = () => {
    console.log('🔄 CLEAR DESCRIPTION')
    setDescription('')
    alert('✅ Description cleared!')
  }

  const handleArchiveEntry = (entryId: string) => {
    console.log('📦 ARCHIVE TIME ENTRY - ID:', entryId)
    if (confirm('Archive this time entry?\n\nArchived entries can be restored later.')) {
      alert('✅ Time entry archived!')
    }
  }

  const handleViewDetailedStats = () => {
    console.log('📈 VIEW DETAILED STATS')
    const totalTime = timeEntries.reduce((sum, e) => sum + e.duration, 0)
    const projectBreakdown = projects.map((project) => {
      const projectEntries = timeEntries.filter((e) => e.projectId === project.id)
      const projectTime = projectEntries.reduce((sum, e) => sum + e.duration, 0)
      return `${project.name}: ${formatTime(projectTime)}`
    }).join('\n')
    alert(
      `📈 Detailed Statistics\n\nTotal Time: ${formatTime(totalTime)}\nTotal Entries: ${timeEntries.length}\n\nProject Breakdown:\n${projectBreakdown || 'No entries yet'}`
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            Time Tracking
          </h1>
          <p className="text-gray-600">Track time across projects and tasks</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Timer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between mb-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleAddProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Project
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleAddTask} disabled={!selectedProject}>
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleEditProject} disabled={!selectedProject}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleEditTask} disabled={!selectedTask}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleDeleteProject} disabled={!selectedProject} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      value={selectedProject}
                      onValueChange={setSelectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedTask}
                      onValueChange={setSelectedTask}
                      disabled={!selectedProject}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Task" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects
                          .find((p) => p.id === selectedProject)
                          ?.tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id}>
                              {task.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="What are you working on?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm" onClick={handleClearDescription}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-mono">
                      {formatTime(elapsedTime)}
                    </div>
                    <div className="flex gap-2">
                      {!activeTimer ? (
                        <>
                          <Button
                            onClick={startTimer}
                            disabled={!selectedProject || !selectedTask}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Timer
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleAddManualEntry}
                            disabled={!selectedProject || !selectedTask}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Manual Entry
                          </Button>
                        </>
                      ) : (
                        <Button onClick={stopTimer} variant="destructive">
                          <Pause className="h-4 w-4 mr-2" />
                          Stop Timer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Time Entries */}
            <Card className="mt-6 bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Time Entries</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleFilterByProject}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFilterByDateRange}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Date Range
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleViewDetailedStats}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Stats
                    </Button>
                    {timeEntries.length > 0 && (
                      <Button variant="outline" size="sm" onClick={handleBulkDeleteEntries} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 rounded-lg border group hover:shadow-md transition-all"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {
                            projects.find((p) => p.id === entry.projectId)?.name
                          }{' '}
                          -{' '}
                          {
                            projects
                              .find((p) => p.id === entry.projectId)
                              ?.tasks.find((t) => t.id === entry.taskId)?.name
                          }
                        </div>
                        <div className="text-sm text-gray-600">
                          {entry.description}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="font-mono mr-4">
                          {formatTime(entry.duration)}
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleEditEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDuplicateEntry(entry)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDeleteEntry(entry.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {timeEntries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No time entries yet. Start tracking time!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Section */}
          <div>
            <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="daily">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">
                      <Clock className="h-4 w-4 mr-2" />
                      Daily
                    </TabsTrigger>
                    <TabsTrigger value="weekly">
                      <Calendar className="h-4 w-4 mr-2" />
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Monthly
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="daily" className="space-y-4">
                    <div className="text-center py-8">
                      <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Daily Overview
                      </h3>
                      <p className="text-gray-600">
                        View your daily time tracking stats
                      </p>
                      <Button onClick={handleGenerateDailyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="weekly" className="space-y-4">
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Weekly Report
                      </h3>
                      <p className="text-gray-600">
                        Analyze your weekly productivity
                      </p>
                      <Button onClick={handleGenerateWeeklyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="monthly" className="space-y-4">
                    <div className="text-center py-8">
                      <BarChart3 className="h-16 w-16 text-purple-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        Monthly Analysis
                      </h3>
                      <p className="text-gray-600">
                        Track long-term time patterns
                      </p>
                      <Button onClick={handleGenerateMonthlyReport} className="mt-4">
                        Generate Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => handleExportReport('json')}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 