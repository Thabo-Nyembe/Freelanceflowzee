'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { saveWorkflowDraft, getTriggerTypes } from '@/lib/workflow-builder-queries'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface WorkflowCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (workflowId: string) => void
}

export function WorkflowCreateDialog({ open, onOpenChange, onSuccess }: WorkflowCreateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'manual' as any,
    category: 'general'
  })

  const triggerTypes = getTriggerTypes()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Workflow name is required')
      return
    }

    setIsLoading(true)

    try {
      const workflowId = await saveWorkflowDraft(null, {
        name: formData.name,
        description: formData.description,
        trigger_type: formData.trigger_type,
        trigger_config: {}, // Will be configured in the builder
        category: formData.category
      })

      toast.success('Workflow created!', {
        description: 'Your workflow draft has been created successfully.'
      })

      onSuccess?.(workflowId)
      onOpenChange(false)

      // Reset form
      setFormData({
        name: '',
        description: '',
        trigger_type: 'manual',
        category: 'general'
      })
    } catch (error) {
      console.error('Failed to create workflow:', error)
      toast.error('Failed to create workflow', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogDescription>
            Set up a new workflow to automate your tasks
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workflow Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Weekly Invoice Generator"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this workflow do?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trigger">Trigger Type *</Label>
              <Select
                value={formData.trigger_type}
                onValueChange={(value) => setFormData({ ...formData, trigger_type: value as any })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger type" />
                </SelectTrigger>
                <SelectContent>
                  {triggerTypes.map((trigger) => (
                    <SelectItem key={trigger.type} value={trigger.type}>
                      {trigger.label} - {trigger.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="invoicing">Invoicing</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="project-management">Project Management</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="client-management">Client Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Workflow'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
