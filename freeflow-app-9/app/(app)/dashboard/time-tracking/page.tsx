'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Square } from 'lucide-react

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
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}
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
                    className="w-full
                  >"
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking
                  </Button>
                ) : (
                  <Button 
                    onClick={stopTracking}
                    variant="destructive
                    className="w-full
                  >"
                    <Square className="h-4 w-4 mr-2" />
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
}