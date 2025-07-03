'use client'

import { useFormState } from 'react-dom'
import { createProject } from '@/app/(app)/projects/actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProjectFormProps {
  parentId?: string;
  onSuccess?: () => void;
}

export function ProjectForm({ parentId, onSuccess }: ProjectFormProps) {
  const initialState = { error: '', success: false };
  const [state, dispatch] = useFormState(createProject, initialState);

  if (state.success && onSuccess) {
    onSuccess();
  }

  return (
    <form action={dispatch} className="space-y-4">
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      <div>
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" placeholder="Project Title" required />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" placeholder="Project Description" required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_name">Client Name</Label>
          <Input id="client_name" name="client_name" placeholder="Client Name" />
        </div>
        <div>
          <Label htmlFor="client_email">Client Email</Label>
          <Input id="client_email" name="client_email" type="email" placeholder="Client Email" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget">Budget</Label>
          <Input id="budget" name="budget" type="number" placeholder="Budget" />
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger>
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input id="start_date" name="start_date" type="date" />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input id="end_date" name="end_date" type="date" />
        </div>
      </div>

      {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <Button type="submit">Create Project</Button>
    </form>
  );
}
