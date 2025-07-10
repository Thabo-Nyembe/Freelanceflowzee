"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Layout, 
  FileText, 
  Palette, 
  Globe, 
  Smartphone, 
  Monitor,
  Zap,
  Users,
  Calendar,
  DollarSign,
  Settings,
  Star,
  Clock,
  Target,
  Briefcase,
  Lightbulb,
  Rocket
} from 'lucide-react'

export default function CreateProjectPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [projectType, setProjectType] = useState('custom')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    client: '',
    budget: '',
    deadline: '',
    priority: 'medium',
    category: 'design'
  })

  // Quick start templates
  const quickTemplates = [
    {
      id: 'brand-identity',
      name: 'Brand Identity',
      description: 'Complete brand identity package with logo, colors, and guidelines',
      icon: Palette,
      color: 'bg-purple-500',
      estimatedTime: '2-3 weeks',
      tasks: 12
    },
    {
      id: 'website',
      name: 'Website Design',
      description: 'Full website design from wireframes to high-fidelity mockups',
      icon: Globe,
      color: 'bg-blue-500',
      estimatedTime: '3-4 weeks',
      tasks: 18
    },
    {
      id: 'mobile-app',
      name: 'Mobile App',
      description: 'Mobile app design with user experience optimization',
      icon: Smartphone,
      color: 'bg-green-500',
      estimatedTime: '4-6 weeks',
      tasks: 22
    },
    {
      id: 'marketing',
      name: 'Marketing Campaign',
      description: 'Complete marketing campaign with assets and strategy',
      icon: Zap,
      color: 'bg-yellow-500',
      estimatedTime: '1-2 weeks',
      tasks: 8
    },
    {
      id: 'video',
      name: 'Video Production',
      description: 'Video production from concept to final delivery',
      icon: Monitor,
      color: 'bg-red-500',
      estimatedTime: '3-5 weeks',
      tasks: 15
    },
    {
      id: 'custom',
      name: 'Custom Project',
      description: 'Start from scratch with your own requirements',
      icon: Plus,
      color: 'bg-gray-500',
      estimatedTime: 'Variable',
      tasks: 'Custom'
    }
  ]

  const projectCategories = [
    { value: 'design', label: 'Design', icon: Palette },
    { value: 'development', label: 'Development', icon: Globe },
    { value: 'marketing', label: 'Marketing', icon: Zap },
    { value: 'content', label: 'Content', icon: FileText },
    { value: 'consulting', label: 'Consulting', icon: Briefcase },
    { value: 'other', label: 'Other', icon: Settings }
  ]

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

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

  const handleCreateProject = () => {
    console.log('Creating project:', { ...formData, template: selectedTemplate })
    // Here you would typically make an API call to create the project
    alert('Project created successfully!')
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
          <Button size="sm" onClick={handleCreateProject}>
            <Rocket className="h-4 w-4 mr-2" />
            Create Project
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
