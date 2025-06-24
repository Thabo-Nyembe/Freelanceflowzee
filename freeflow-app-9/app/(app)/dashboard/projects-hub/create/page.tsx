'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Users, Calendar, DollarSign } from 'lucide-react'

export default function CreateProjectPage() {
  const router = useRouter()
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    type: '',
    client: '',
    budget: '',
    deadline: '',
    priority: 'medium'
  })

  const projectTypes = [
    'Brand Identity Design',
    'Web Development',
    'Mobile App Development',
    'Marketing Campaign',
    'Video Production',
    'Photography',
    'Content Creation',
    'UI/UX Design'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Creating project:', projectData)
    
    // Simulate project creation
    alert(`Project "${projectData.name}" created successfully! Redirecting to project dashboard...`)
    router.push('/dashboard/projects-hub')
  }

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Create New Project
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Set up your new project with all the details
            </p>
          </div>
        </div>

        {/* Project Creation Form */}
        <Card className="p-8">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-purple-600" />
              Project Details
            </CardTitle>
            <CardDescription>
              Fill in the information below to create your new project
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-0">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter project name..."
                  value={projectData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="text-lg"
                />
              </div>

              {/* Project Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Project Type *</Label>
                <Select onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Client */}
              <div className="space-y-2">
                <Label htmlFor="client" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Client Name
                </Label>
                <Input
                  id="client"
                  placeholder="Enter client name..."
                  value={projectData.client}
                  onChange={(e) => handleInputChange('client', e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the project goals, requirements, and deliverables..."
                  value={projectData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Budget and Deadline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Budget (USD)
                  </Label>
                  <Input
                    id="budget"
                    type="number"
                    placeholder="0.00"
                    value={projectData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Deadline
                  </Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={projectData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                  />
                </div>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select onValueChange={(value) => handleInputChange('priority', value)} defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                  disabled={!projectData.name || !projectData.type}
                >
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 