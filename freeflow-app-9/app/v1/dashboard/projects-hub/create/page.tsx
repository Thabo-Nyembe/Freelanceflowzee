// MIGRATED: Batch #29 - Removed mock data, using database hooks
"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Layout,
  FileText,
  Palette,
  Globe,
  Smartphone,
  Monitor,
  Zap,
  Calendar,
  DollarSign,
  Settings,
  Star,
  Clock,
  Target,
  Briefcase,
  Lightbulb,
  Rocket,
  Loader2
} from 'lucide-react'
import { createFeatureLogger } from '@/lib/logger'
import { toast } from 'sonner'

const logger = createFeatureLogger('Projects-Create')

// A+++ UTILITIES
import { DashboardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState } from '@/components/ui/empty-state'
import { useAnnouncer } from '@/lib/accessibility'
import { useCurrentUser } from '@/hooks/use-ai-data'

// DATABASE QUERIES
import { createProject } from '@/lib/projects-hub-queries'
import { useTemplates } from '@/lib/hooks/use-templates'

export default function CreateProjectPage() {
  const router = useRouter()

  // A+++ STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { announce } = useAnnouncer()
  const { userId, loading: userLoading } = useCurrentUser()

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [projectType, setProjectType] = useState<any>('custom')
  const [formData, setFormData] = useState<any>({
    name: '',
    description: '',
    client: '',
    budget: '',
    deadline: '',
    priority: 'medium',
    category: 'design'
  })

  // Load templates from database - FIXED: Now uses real hook
  const { templates, isLoading: templatesLoading } = useTemplates([], { status: 'active', category: 'project' })

  // Quick start templates - mapped from database templates
  const quickTemplates = templates.slice(0, 6).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description || '',
    icon: getTemplateIcon(t.category),
    category: t.category,
    estimatedTime: t.template_data?.estimatedTime || '2-4 weeks',
    complexity: t.template_data?.complexity || 'Medium'
  }))

  // Project categories - derived from templates or fallback defaults
  const projectCategories = [
    { id: 'design', name: 'Design', icon: Palette, color: 'text-pink-500' },
    { id: 'development', name: 'Development', icon: Monitor, color: 'text-blue-500' },
    { id: 'marketing', name: 'Marketing', icon: Target, color: 'text-green-500' },
    { id: 'content', name: 'Content', icon: FileText, color: 'text-purple-500' },
    { id: 'consulting', name: 'Consulting', icon: Briefcase, color: 'text-orange-500' },
    { id: 'research', name: 'Research', icon: Lightbulb, color: 'text-yellow-500' }
  ]

  // Priority levels with proper typing
  const priorityLevels = [
    { id: 'low', name: 'Low', color: 'bg-gray-100 text-gray-700', description: 'No rush, flexible timeline' },
    { id: 'medium', name: 'Medium', color: 'bg-blue-100 text-blue-700', description: 'Standard priority' },
    { id: 'high', name: 'High', color: 'bg-orange-100 text-orange-700', description: 'Important, needs attention' },
    { id: 'urgent', name: 'Urgent', color: 'bg-red-100 text-red-700', description: 'Critical, immediate action' }
  ]

  // Helper function to get template icon based on category
  function getTemplateIcon(category: string) {
    switch (category) {
      case 'design': return Palette
      case 'development': return Monitor
      case 'marketing': return Target
      case 'content': return FileText
      case 'mobile': return Smartphone
      case 'web': return Globe
      default: return Layout
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setProjectType(template.id)
    setFormData(prev => ({ 
      ...prev, 
      name: template.name,
      description: template.description,
      category: template.id === 'brand-identity' ? 'design' : 
                template.id === 'website' ? 'development' :
                template.id === 'mobile-app' ? 'design' :
                template.id === 'marketing' ? 'marketing' :
                template.id === 'video' ? 'content' : 'design'
    }))
  }

  const handleCreateProject = async () => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Project name is required')
      return
    }

    if (!userId) {
      toast.error('Please sign in to create a project')
      return
    }

    setIsCreating(true)
    const filledFields = Object.values(formData).filter(v => v !== '').length

    logger.info('Creating project', {
      projectName: formData.name,
      template: selectedTemplate?.name,
      category: formData.category,
      filledFields
    })

    toast.info('Creating project...', {
      description: `${formData.name || 'New Project'} - ${selectedTemplate?.name || 'Custom'}`
    })

    try {
      // Create project in database
      const { data, error } = await createProject(userId, {
        name: formData.name,
        description: formData.description || '',
        client: formData.client || 'Unnamed Client',
        category: formData.category || 'other',
        priority: formData.priority || 'medium',
        budget: parseFloat(formData.budget) || 0,
        deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        start_date: new Date().toISOString(),
        status: 'Not Started',
        progress: 0,
        tags: selectedTemplate ? [selectedTemplate.id] : [],
        hours_estimated: selectedTemplate?.tasks ? selectedTemplate.tasks * 2 : 0,
      })

      if (error) {
        throw error
      }

      logger.info('Project created successfully', {
        projectId: data?.id,
        projectName: formData.name,
        template: selectedTemplate?.name
      })

      toast.success('Project created successfully!', {
        description: `${formData.name} is ready to start working on`
      })

      announce('Project created successfully', 'polite')

      // Navigate to the new project or projects list
      router.push('/dashboard/projects-hub')
    } catch (err) {
      logger.error('Failed to create project', { error: err })
      toast.error('Failed to create project', {
        description: err instanceof Error ? err.message : 'Please try again'
      })
      announce('Failed to create project', 'assertive')
    } finally {
      setIsCreating(false)
    }
  }

  // A+++ LOADING STATE
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <DashboardSkeleton />
      </div>
    )
  }

  // A+++ ERROR STATE
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <ErrorEmptyState
            error={error}
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Create New Project</h1>
          <p className="text-gray-600 dark:text-gray-300">Start a new project with templates or from scratch</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Save as Template
          </Button>
          <Button size="sm" onClick={handleCreateProject} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Rocket className="h-4 w-4 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Choose a Template
              </CardTitle>
              <CardDescription>Select a template to get started quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => {
                  const IconComponent = template.icon
                  return (
                    <Card 
                      key={template.id} 
                      className={`kazi-card cursor-pointer transition-all duration-200 ${
                        selectedTemplate?.id === template.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${template.color} text-white`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {template.estimatedTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {template.tasks} tasks
                              </span>
                            </div>
                          </div>
                          {selectedTemplate?.id === template.id && (
                            <div className="text-blue-500">
                              <Star className="h-5 w-5 fill-current" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Project Details
              </CardTitle>
              <CardDescription>Configure your project settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="Enter project name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    placeholder="Describe your project"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Client</label>
                  <input
                    type="text"
                    placeholder="Client name"
                    value={formData.client}
                    onChange={(e) => handleInputChange('client', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {projectCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Budget</label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      placeholder="0"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => handleInputChange('deadline', e.target.value)}
                      className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <div className="grid grid-cols-2 gap-2">
                    {priorityLevels.map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => handleInputChange('priority', priority.value)}
                        className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                          formData.priority === priority.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Badge className={priority.color}>
                          {priority.label}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedTemplate && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Template Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Estimated Time: {selectedTemplate.estimatedTime}</p>
                      <p>Tasks: {selectedTemplate.tasks}</p>
                      <p>Category: {selectedTemplate.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Project Preview */}
      {(formData.name || selectedTemplate) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Project Preview
            </CardTitle>
            <CardDescription>Preview of your project configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Project Name</h4>
                <p className="text-gray-600">{formData.name || 'Untitled Project'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Client</h4>
                <p className="text-gray-600">{formData.client || 'No client specified'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Budget</h4>
                <p className="text-gray-600">{formData.budget ? `$${formData.budget}` : 'No budget set'}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Deadline</h4>
                <p className="text-gray-600">{formData.deadline || 'No deadline set'}</p>
              </div>
            </div>
            {formData.description && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-1">Description</h4>
                <p className="text-gray-600">{formData.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
