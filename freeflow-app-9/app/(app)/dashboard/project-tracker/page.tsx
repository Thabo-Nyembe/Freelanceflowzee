'use client'

import { useState } from 'react'
 content: string; timestamp: string }>
}

interface ProjectMilestone {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'upcoming' | 'active' | 'completed' | 'overdue'
  progress: number
  deliverables: string[]
  payment?: number
}

interface Project {
  id: string
  title: string
  client: string
  description: string
  status: 'active' | 'completed' | 'on-hold' | 'cancelled'
  progress: number
  startDate: string
  dueDate: string
  budget: number
  hourlyRate: number
  totalHours: number
  milestones: ProjectMilestone[]
  deliverables: ProjectDeliverable[]
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  teamMembers?: Array<{ name: string; role: string; avatar?: string }>
}

export default function ProjectTrackerPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<&apos;grid&apos; | &apos;list&apos; | &apos;kanban&apos;>('grid')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')'
  const [statusFilter, setStatusFilter] = useState('all')

  const [projects] = useState<Project[]>([
    {
      id: '1','
      title: 'E-commerce Website Redesign',
      client: 'TechCorp Solutions',
      description: 'Complete redesign of the company website with modern UI/UX and enhanced functionality',
      status: 'active',
      progress: 65,
      startDate: '2024-05-15',
      dueDate: '2024-07-15',
      budget: 15000,
      hourlyRate: 125,
      totalHours: 45,
      priority: 'high',
      tags: ['Web Design', 'UI/UX', 'React', 'E-commerce'],
      teamMembers: [
        { name: 'Sarah J.', role: 'Designer', avatar: '/placeholder-avatar.jpg' },
        { name: 'Mike R.', role: 'Developer', avatar: '/placeholder-avatar.jpg' }
      ],
      milestones: [
        {
          id: '1','
          title: 'Initial Design Concepts',
          description: 'Create wireframes and initial design concepts',
          dueDate: '2024-06-01',
          status: 'completed',
          progress: 100,
          deliverables: ['1', '2'],
          payment: 3000
        },
        {
          id: '2','
          title: 'Homepage Development',
          description: 'Develop and implement homepage design',
          dueDate: '2024-06-20',
          status: 'active',
          progress: 80,
          deliverables: ['3', '4'],
          payment: 4000
        },
        {
          id: '3','
          title: 'Product Pages & Checkout',
          description: 'Build product catalog and checkout flow',
          dueDate: '2024-07-10',
          status: 'upcoming',
          progress: 0,
          deliverables: ['5', '6'],
          payment: 5000
        }
      ],
      deliverables: [
        {
          id: '1','
          title: 'Wireframes & User Journey',
          description: 'Complete wireframes for all key pages and user journey mapping',
          status: 'completed',
          dueDate: '2024-05-28',
          completedDate: '2024-05-26',
          priority: 'high',
          estimatedHours: 12,
          actualHours: 10,
          files: [
            { name: 'wireframes-v1.pdf', url: '/files/wireframes.pdf', uploadedAt: '2024-05-26' },
            { name: 'user-journey.png', url: '/files/journey.png', uploadedAt: '2024-05-26' }
          ],
          comments: [
            { id: '1', author: 'Client', content: 'Great work on the wireframes!', timestamp: '2024-05-27' }'
          ]
        },
        {
          id: '2','
          title: 'Visual Design System',
          description: 'Brand colors, typography, components, and style guide',
          status: 'completed',
          dueDate: '2024-06-02',
          completedDate: '2024-06-01',
          priority: 'high',
          estimatedHours: 16,
          actualHours: 15,
          files: [
            { name: 'design-system.sketch', url: '/files/design-system.sketch', uploadedAt: '2024-06-01' }
          ],
          comments: []
        },
        {
          id: '3','
          title: 'Homepage Implementation',
          description: 'Fully responsive homepage with animations and interactions',
          status: 'in-progress',
          dueDate: '2024-06-18',
          priority: 'high',
          estimatedHours: 20,
          actualHours: 16,
          files: [],
          comments: [
            { id: '2', author: 'Developer', content: 'Working on mobile responsiveness', timestamp: '2024-06-15' }'
          ]
        }
      ]
    },
    {
      id: '2','
      title: 'Mobile App UI Design',
      client: 'Fashion Forward Inc.',
      description: 'Complete UI design for iOS and Android fashion shopping app',
      status: 'active',
      progress: 40,
      startDate: '2024-06-01',
      dueDate: '2024-08-01',
      budget: 8000,
      hourlyRate: 100,
      totalHours: 25,
      priority: 'medium',
      tags: ['Mobile Design', 'iOS', 'Android', 'Fashion'],
      milestones: [
        {
          id: '1','
          title: 'App Architecture & Wireframes',
          description: 'Define app structure and create wireframes',
          dueDate: '2024-06-20',
          status: 'active',
          progress: 60,
          deliverables: ['4'],'
          payment: 2500
        }
      ],
      deliverables: [
        {
          id: '4','
          title: 'App Wireframes',
          description: 'Wireframes for all key app screens',
          status: 'in-progress',
          dueDate: '2024-06-18',
          priority: 'medium',
          estimatedHours: 15,
          actualHours: 9,
          files: [],
          comments: []
        }
      ]
    },
    {
      id: '3','
      title: 'Brand Identity Package',
      client: 'Startup Ventures',
      description: 'Complete brand identity including logo, guidelines, and marketing materials',
      status: 'completed',
      progress: 100,
      startDate: '2024-04-15',
      dueDate: '2024-05-30',
      budget: 5000,
      hourlyRate: 150,
      totalHours: 35,
      priority: 'medium',
      tags: ['Branding', 'Logo Design', 'Guidelines'],
      milestones: [
        {
          id: '1','
          title: 'Brand Strategy & Logo',
          description: 'Develop brand strategy and create logo concepts',
          dueDate: '2024-05-15',
          status: 'completed',
          progress: 100,
          deliverables: ['5'],'
          payment: 2500
        }
      ],
      deliverables: [
        {
          id: '5','
          title: 'Logo & Brand Guidelines',
          description: 'Final logo files and comprehensive brand guidelines',
          status: 'completed',
          dueDate: '2024-05-25',
          completedDate: '2024-05-24',
          priority: 'high',
          estimatedHours: 20,
          actualHours: 18,
          files: [
            { name: 'logo-files.zip', url: '/files/logo.zip', uploadedAt: '2024-05-24' },
            { name: 'brand-guidelines.pdf', url: '/files/guidelines.pdf', uploadedAt: '2024-05-24' }
          ],
          comments: []
        }
      ]
    }
  ])

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700', 'on-hold': 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700',
      pending: 'bg-gray-100 text-gray-700', 'in-progress': 'bg-blue-100 text-blue-700',
      review: 'bg-purple-100 text-purple-700',
      approved: 'bg-green-100 text-green-700',
      upcoming: 'bg-orange-100 text-orange-700',
      overdue: 'bg-red-100 text-red-700'
    }
    return colors[status as keyof typeof colors] || colors.pending
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const activeProjects = projects.filter(p => p.status === 'active').length
  const completedProjects = projects.filter(p => p.status === 'completed').length
  const totalRevenue = projects.reduce((sum, p) => sum + p.budget, 0)
  const avgProgress = projects.reduce((sum, p) => sum + p.progress, 0) / projects.length

  const selectedProjectData = selectedProject ? projects.find(p => p.id === selectedProject) : null

  return (
    <div className= "max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className= "flex items-center justify-between">
        <div>
          <h1 className= "text-3xl font-bold text-gray-900">Project Tracker</h1>
          <p className= "text-gray-600 mt-1">Track deliverables, milestones, and project progress</p>
        </div>
        <div className= "flex gap-3">
          <Button variant= "outline" className= "gap-2">
            <Settings className= "h-4 w-4" />
            Settings
          </Button>
          <Button className= "gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus className= "h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className= "grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className= "h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">{activeProjects}</p>
                <p className= "text-sm text-gray-500">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className= "h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">{completedProjects}</p>
                <p className= "text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className= "h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className= "text-sm text-gray-500">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className= "flex items-center p-6">
            <div className= "flex items-center gap-4">
              <div className= "w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className= "h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className= "text-2xl font-bold text-gray-900">{Math.round(avgProgress)}%</p>
                <p className= "text-sm text-gray-500">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className= "grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className= "lg:col-span-2">
          <Card>
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle>Projects</CardTitle>
                <div className= "flex gap-3">
                  <div className= "relative">
                    <Search className= "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder= "Search projects..." 
                      className= "pl-10 w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className= "w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value= "all">All Status</SelectItem>
                      <SelectItem value= "active">Active</SelectItem>
                      <SelectItem value= "completed">Completed</SelectItem>
                      <SelectItem value= "on-hold">On Hold</SelectItem>
                      <SelectItem value= "cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className= "space-y-4">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedProject === project.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className= "flex items-start justify-between mb-3">
                      <div className= "flex-1">
                        <div className= "flex items-center gap-2 mb-1">
                          <h3 className= "font-semibold text-gray-900">{project.title}</h3>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`}></div>
                        </div>
                        <p className= "text-sm text-gray-600">{project.client}</p>
                        <p className= "text-xs text-gray-500 mt-1">{project.description}</p>
                      </div>
                      <div className= "text-right">
                        <p className= "font-semibold text-gray-900">${project.budget.toLocaleString()}</p>
                        <p className= "text-xs text-gray-500">Budget</p>
                      </div>
                    </div>
                    
                    <div className= "space-y-2">
                      <div className= "flex items-center justify-between text-sm">
                        <span className= "text-gray-600">Progress</span>
                        <span className= "font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className= "h-2" />
                    </div>
                    
                    <div className= "flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                      <div className= "flex flex-wrap gap-1">
                        {project.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant= "outline" className= "text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 2 && (
                          <span className= "text-gray-400">+{project.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <div>
          {selectedProjectData ? (
            <div className= "space-y-6">
              {/* Project Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className= "flex items-center gap-2">
                    <Target className= "h-5 w-5" />
                    {selectedProjectData.title}
                  </CardTitle>
                  <CardDescription>{selectedProjectData.client}</CardDescription>
                </CardHeader>
                <CardContent className= "space-y-4">
                  <div className= "flex items-center justify-between">
                    <span className= "text-sm text-gray-600">Progress</span>
                    <span className= "font-semibold">{selectedProjectData.progress}%</span>
                  </div>
                  <Progress value={selectedProjectData.progress} className= "h-3" />
                  
                  <div className= "grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className= "text-gray-600">Budget:</span>
                      <p className= "font-semibold">${selectedProjectData.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className= "text-gray-600">Hours:</span>
                      <p className= "font-semibold">{selectedProjectData.totalHours}h</p>
                    </div>
                    <div>
                      <span className= "text-gray-600">Start Date:</span>
                      <p className= "font-semibold">{new Date(selectedProjectData.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className= "text-gray-600">Due Date:</span>
                      <p className= "font-semibold">{new Date(selectedProjectData.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {selectedProjectData.teamMembers && (
                    <div>
                      <span className= "text-sm text-gray-600">Team:</span>
                      <div className= "flex gap-2 mt-1">
                        {selectedProjectData.teamMembers.map((member, index) => (
                          <div key={index} className= "flex items-center gap-1">
                            <Avatar className= "w-6 h-6">
                              <AvatarFallback className= "text-xs">
                                {member.name.split(' ').map(n => n[0]).join()}
                              </AvatarFallback>
                            </Avatar>
                            <span className= "text-xs">{member.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle className= "flex items-center gap-2">
                    <Flag className= "h-5 w-5" />
                    Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className= "space-y-3">
                    {selectedProjectData.milestones.map((milestone) => (
                      <div key={milestone.id} className= "border rounded-lg p-3">
                        <div className= "flex items-center justify-between mb-2">
                          <h4 className= "font-medium text-gray-900">{milestone.title}</h4>
                          <Badge className={getStatusColor(milestone.status)}>
                            {milestone.status}
                          </Badge>
                        </div>
                        <p className= "text-sm text-gray-600 mb-2">{milestone.description}</p>
                        <div className= "space-y-1">
                          <div className= "flex justify-between text-xs">
                            <span>Progress</span>
                            <span>{milestone.progress}%</span>
                          </div>
                          <Progress value={milestone.progress} className= "h-1" />
                        </div>
                        <div className= "flex justify-between text-xs text-gray-500 mt-2">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          {milestone.payment && (
                            <span>${milestone.payment.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deliverables */}
              <Card>
                <CardHeader>
                  <CardTitle className= "flex items-center gap-2">
                    <Package className= "h-5 w-5" />
                    Recent Deliverables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className= "space-y-3">
                    {selectedProjectData.deliverables.slice(0, 3).map((deliverable) => (
                      <div key={deliverable.id} className= "flex items-center gap-3 p-2 border rounded">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(deliverable.priority)}`}></div>
                        <div className= "flex-1 min-w-0">
                          <p className= "font-medium text-sm truncate">{deliverable.title}</p>
                          <div className= "flex items-center gap-2 mt-1">
                            <Badge variant= "outline" className={`text-xs ${getStatusColor(deliverable.status)}`}>
                              {deliverable.status}
                            </Badge>
                            <span className= "text-xs text-gray-500">
                              Due: {new Date(deliverable.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className= "flex items-center justify-center h-64">
                <div className= "text-center">
                  <Target className= "h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className= "text-gray-500">Select a project to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create Project Modal Placeholder */}
      {showCreateModal && (
        <div className= "fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className= "w-full max-w-2xl">
            <CardHeader>
              <div className= "flex items-center justify-between">
                <CardTitle>Create New Project</CardTitle>
                <Button
                  variant= "ghost"
                  size= "sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X className= "h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className= "space-y-4">
              <div className= "grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor= "project-title">Project Title</Label>
                  <Input id= "project-title" placeholder= "Enter project title" />
                </div>
                <div>
                  <Label htmlFor= "client-name">Client</Label>
                  <Input id= "client-name" placeholder= "Client name" />
                </div>
              </div>
              <div>
                <Label htmlFor= "description">Description</Label>
                <Textarea id= "description" placeholder= "Project description" rows={3} />
              </div>
              <div className= "grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor= "budget">Budget</Label>
                  <Input id= "budget" type= "number" placeholder= "5000" />
                </div>
                <div>
                  <Label htmlFor= "start-date">Start Date</Label>
                  <Input id= "start-date" type= "date" />
                </div>
                <div>
                  <Label htmlFor= "due-date">Due Date</Label>
                  <Input id= "due-date" type= "date" />
                </div>
              </div>
              <div className= "flex gap-3 pt-4 border-t">
                <Button variant= "outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
