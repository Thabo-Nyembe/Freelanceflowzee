"use client"

import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProjectCreationFormProps {
  onSubmit: (data: Record<string, unknown>) => void
  loading?: boolean
}

// Basic HTML sanitization to prevent XSS
function sanitizeInput(input: string | null): string {
  if (!input) return ''
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
}

export function ProjectCreationForm({ onSubmit, loading = false }: ProjectCreationFormProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    // Sanitize all string inputs to prevent XSS
    const data = {
      title: sanitizeInput(formData.get('title') as string),
      description: sanitizeInput(formData.get('description') as string),
      client_name: sanitizeInput(formData.get('client_name') as string),
      client_email: sanitizeInput(formData.get('client_email') as string),
      budget: formData.get('budget'),
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date'),
      priority: formData.get('priority'),
      status: formData.get('status')
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="project-creation-form">
      <div>
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter project title"
          required
          maxLength={200}
          data-testid="project-title-input"
        />
      </div>

      <div>
        <Label htmlFor="description">Project Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter project description"
          required
          maxLength={5000}
          data-testid="project-description-input"
        />
      </div>

      <div>
        <Label htmlFor="client_name">Client Name</Label>
        <Input
          id="client_name"
          name="client_name"
          placeholder="Enter client name"
          maxLength={100}
          data-testid="project-client-name-input"
        />
      </div>

      <div>
        <Label htmlFor="client_email">Client Email</Label>
        <Input
          id="client_email"
          name="client_email"
          type="email"
          placeholder="Enter client email"
          maxLength={254}
          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
          data-testid="project-client-email-input"
        />
      </div>

      <div>
        <Label htmlFor="budget">Budget</Label>
        <Input
          id="budget"
          name="budget"
          type="number"
          min="0"
          max="999999999"
          placeholder="Enter project budget"
          data-testid="project-budget-input"
        />
      </div>

      <div>
        <Label htmlFor="start_date">Start Date</Label>
        <Input
          id="start_date"
          name="start_date"
          type="date"
          data-testid="project-start-date-input"
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          name="end_date"
          type="date"
          data-testid="project-end-date-input"
        />
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select name="priority" defaultValue="medium">
          <SelectTrigger id="priority" data-testid="project-priority-select">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select name="status" defaultValue="active">
          <SelectTrigger id="status" data-testid="project-status-select">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={loading} data-testid="project-submit-button">
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </form>
  )
} 