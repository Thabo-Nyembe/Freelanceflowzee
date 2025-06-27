'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface ProjectUpdate {
  id: string
  type: 'milestone' | 'comment' | 'file' | 'status
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
  status: 'active' | 'completed' | 'paused
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
          dueDate: '2024-01-15
        }
      ],
      updates: [
        {
          id: '1',
          type: 'milestone',
          title: 'Milestone Completed',
          content: 'Initial concepts completed',
          timestamp: '2024-01-16T10:00:00Z
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
                    className="bg-blue-600 h-2 rounded-full
                    style={{ width: project.progress + '%' }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>"
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
}