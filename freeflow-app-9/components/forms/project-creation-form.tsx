"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Upload } from 'lucide-react'
import { createProject } from '@/app/projects/actions'

interface ProjectCreationFormProps {
  userId: string
}

export function ProjectCreationForm({ userId }: ProjectCreationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await createProject(formData)
      
      if (result.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Basic file type validation
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG files only.')
        e.target.value = ''
        return
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB.')
        e.target.value = ''
        return
      }
      
      setSelectedFile(file)
      setError(null)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6" data-testid="project-creation-form">
      <input type="hidden" name="userId" value={userId} />
      
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="Enter project title..."
          required
          disabled={isSubmitting}
          className="w-full"
          data-testid="project-title"
        />
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <Label htmlFor="description">Project Description *</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe the project details, objectives, and requirements..."
          required
          disabled={isSubmitting}
          rows={4}
          className="w-full resize-none"
          data-testid="project-description"
        />
      </div>

      {/* Client Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client Name</Label>
          <Input
            id="clientName"
            name="client_name"
            placeholder="Client company or person name..."
            disabled={isSubmitting}
            data-testid="client-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientEmail">Client Email</Label>
          <Input
            id="clientEmail"
            name="client_email"
            type="email"
            placeholder="client@example.com"
            disabled={isSubmitting}
            data-testid="client-email"
          />
        </div>
      </div>

      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget ($)</Label>
          <Input
            id="budget"
            name="budget"
            type="number"
            placeholder="10000"
            min="0"
            step="100"
            disabled={isSubmitting}
            data-testid="project-budget"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" disabled={isSubmitting}>
            <SelectTrigger data-testid="priority-select">
              <SelectValue placeholder="Select priority level" />
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

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            name="start_date"
            type="date"
            disabled={isSubmitting}
            data-testid="start-date"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            name="end_date"
            type="date"
            disabled={isSubmitting}
            data-testid="end-date"
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <Label htmlFor="attachment">Project Attachments</Label>
        <div className="flex items-center gap-2">
          <Input
            id="attachment"
            name="attachment"
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            disabled={isSubmitting}
            className="flex-1"
            data-testid="file-upload"
          />
          <Upload className="h-4 w-4 text-muted-foreground" />
        </div>
        {selectedFile && (
          <p className="text-sm text-muted-foreground" data-testid="file-selected">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" data-testid="error-message">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800" data-testid="success-message">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Project created successfully! Redirecting to dashboard...
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex-1"
          data-testid="cancel-btn"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          data-testid="submit-btn"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" data-testid="loading-spinner" />
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </div>
    </form>
  )
} 