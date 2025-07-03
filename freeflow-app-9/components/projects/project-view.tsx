'use client'

import Editor from './editor'
import { useState } from 'react'
import { SummarizeButton } from '@/components/ai/summarize-button';
import { ActionItemsButton } from '../ai/action-items-button';
import { RollupReportButton } from './rollup-report-button';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectForm } from './project-form';
import { useRouter } from 'next/navigation';

// TODO: Create a proper project type definition in @/types
interface Project {
  id: string
  title: string
  description: string
  client_name?: string
  client_email?: string
  budget?: number
  start_date?: string
  end_date?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  user_id: string
  created_at: string
  updated_at: string
}

type ProjectViewProps = {
  project: Project
}

export default function ProjectView({ project }: ProjectViewProps) {
  const [content, setContent] = useState(project.description);
  const [isSubProjectModalOpen, setIsSubProjectModalOpen] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    // TODO: Implement the save logic to update the project in the database
    console.log('Saving content:', content);
  };

  const handleSubProjectSuccess = () => {
    setIsSubProjectModalOpen(false);
    router.refresh();
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
      <p className="text-sm text-gray-500 mb-6">Created at: {new Date(project.created_at).toLocaleDateString()}</p>
      
      <Editor 
        onChange={setContent} 
        initialContent={content} 
        editable 
      />

      <div className="flex items-center gap-x-2 mt-4">
        <Button onClick={handleSave}>Save Changes</Button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <SummarizeButton projectId={project.id} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Generate an AI-powered summary of this project.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <ActionItemsButton projectId={project.id} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Detect actionable tasks from the project description.</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <RollupReportButton projectId={project.id} />
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a roll-up report including all sub-projects.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <Dialog open={isSubProjectModalOpen} onOpenChange={setIsSubProjectModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Sub-project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new sub-project to "{project.title}"</DialogTitle>
            </DialogHeader>
            <ProjectForm parentId={project.id} onSuccess={handleSubProjectSuccess} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
