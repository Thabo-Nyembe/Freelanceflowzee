import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ProjectCreationForm } from '@/components/forms/project-creation-form'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (projectData: Record<string, unknown>) => void
  loading?: boolean
}

export function CreateProjectDialog({ open, onOpenChange, onSubmit, loading = false }: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className= "sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <ProjectCreationForm onSubmit={onSubmit} loading={loading} />
      </DialogContent>
    </Dialog>
  )
} 