import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge';
import { getTopLevelProjects } from '@/app/(app)/projects/actions';
import { ProjectDetails } from '@/components/projects/project-details';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

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
  client: string
  deadline: string
}

function ProjectCard({ project }) {
  return (
    <Card className="bg-white/60 backdrop-blur-xl border-0 shadow-2xl">
      <CardHeader>
        <CardTitle>{project.title}</CardTitle>
        <Badge variant="default">{project.status || 'No Status'}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 pt-4">{project.description}</p>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">View Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl h-4/5 overflow-y-auto">
            <ProjectDetails project={project} />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default async function ProjectTrackerPage() {
  const { projects, error } = await getTopLevelProjects();

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!projects || projects.length === 0) {
    return <div className="p-6">No projects found.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Project Tracker</h1>
        <div className="space-y-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  )
}