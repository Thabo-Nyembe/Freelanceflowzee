'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Users,
  UserPlus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Clock,
  MessageSquare,
  FileText,
  Award,
  Building,
  Globe,
  Heart,
  Zap,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Download,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react'

// Framework7-inspired color palette for client management
const clientColors = {
  active: 'from-green-400 to-emerald-500',
  pending: 'from-yellow-400 to-orange-500',
  inactive: 'from-gray-400 to-slate-500',
  vip: 'from-purple-400 to-pink-500'
}

// Mock client data with Framework7-inspired design
const mockClients = [
  {
    id: 1,
    name: 'TechCorp Industries',
    contact: 'Sarah Johnson',
    email: 'sarah@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    status: 'active',
    tier: 'vip',
    avatar: '/avatars/techcorp.jpg',
    totalProjects: 12,
    activeProjects: 3,
    totalRevenue: 125000,
    satisfaction: 4.9,
    lastContact: '2 days ago',
    joinDate: 'Jan 2023',
    tags: ['Enterprise', 'Tech', 'Long-term'],
    projects: [
      { name: 'Platform Redesign', status: 'In Progress', progress: 75 },
      { name: 'Mobile App', status: 'Review', progress: 90 },
      { name: 'Brand Identity', status: 'Planning', progress: 25 }
    ]
  },
  {
    id: 2,
    name: 'StartupFlow',
    contact: 'Mike Chen',
    email: 'mike@startupflow.io',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    status: 'active',
    tier: 'premium',
    avatar: '/avatars/startupflow.jpg',
    totalProjects: 8,
    activeProjects: 2,
    totalRevenue: 67500,
    satisfaction: 4.7,
    lastContact: '1 week ago',
    joinDate: 'Mar 2023',
    tags: ['Startup', 'Fast-growing', 'Innovation'],
    projects: [
      { name: 'E-commerce Site', status: 'In Progress', progress: 60 },
      { name: 'Marketing Assets', status: 'Completed', progress: 100 }
    ]
  },
  {
    id: 3,
    name: 'Creative Agency Plus',
    contact: 'Emma Wilson',
    email: 'emma@creativeplus.com',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    status: 'pending',
    tier: 'standard',
    avatar: '/avatars/creative.jpg',
    totalProjects: 5,
    activeProjects: 1,
    totalRevenue: 42000,
    satisfaction: 4.5,
    lastContact: '3 days ago',
    joinDate: 'Jun 2023',
    tags: ['Creative', 'Design-focused', 'Collaborative'],
    projects: [
      { name: 'Website Refresh', status: 'Planning', progress: 15 }
    ]
  },
  {
    id: 4,
    name: 'Global Solutions Ltd',
    contact: 'David Rodriguez',
    email: 'david@globalsolutions.com',
    phone: '+1 (555) 321-0987',
    location: 'Miami, FL',
    status: 'inactive',
    tier: 'standard',
    avatar: '/avatars/global.jpg',
    totalProjects: 15,
    activeProjects: 0,
    totalRevenue: 89000,
    satisfaction: 4.3,
    lastContact: '2 months ago',
    joinDate: 'Sep 2022',
    tags: ['International', 'Consulting', 'B2B'],
    projects: []
  }
]

const clientStats = [
  {
    title: 'Total Clients',
    value: '47',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Active Projects',
    value: '23',
    change: '+8%',
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Monthly Revenue',
    value: '$28,400',
    change: '+15%',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Satisfaction',
    value: '4.8/5',
    change: '+0.3',
    icon: Star,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    gradient: 'from-yellow-500 to-orange-500'
  }
]

export default function ModernClientsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [viewMode, setViewMode] = useState('grid')
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || client.status === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return styles[status as keyof typeof styles] || styles.inactive
  }

  const getTierBadge = (tier: string) => {
    const styles = {
      vip: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
      premium: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white',
      standard: 'bg-gray-100 text-gray-800'
    }
    return styles[tier as keyof typeof styles] || styles.standard
  }

  const StatCard = ({ stat, index }: { stat: any, index: number }) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 border-0 bg-white">
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
            <stat.icon className={`h-6 w-6 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ClientCard = ({ client }: { client: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border border-gray-100 bg-white">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                {client.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {client.name}
              </h3>
              <p className="text-sm text-gray-600">{client.contact}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={`text-xs border ${getStatusBadge(client.status)}`}>
                  {client.status}
                </Badge>
                <Badge className={`text-xs ${getTierBadge(client.tier)}`}>
                  {client.tier}
                </Badge>
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit Client
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Client
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Active Projects</span>
            <span className="font-medium">{client.activeProjects}/{client.totalProjects}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Revenue</span>
            <span className="font-medium text-green-600">${client.totalRevenue.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Satisfaction</span>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{client.satisfaction}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Last Contact</span>
            <span className="text-gray-500">{client.lastContact}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">{client.location}</span>
            </div>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MessageSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Client Management
              </h1>
              <p className="text-gray-600 mt-1">Manage relationships and track client success</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <UserPlus className="h-4 w-4" />
                    Add Client
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Client</DialogTitle>
                    <DialogDescription>
                      Create a new client profile to start managing projects and relationships.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <Input placeholder="Company Name" />
                    <Input placeholder="Contact Person" />
                    <Input placeholder="Email Address" />
                    <Input placeholder="Phone Number" />
                    <Input placeholder="Location" />
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                        Cancel
                      </Button>
                      <Button>Create Client</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clientStats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSelectedFilter('all')}>
                      All Clients
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter('active')}>
                      Active Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter('pending')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSelectedFilter('inactive')}>
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>

        {filteredClients.length === 0 && (
          <Card className="border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? `No clients match "${searchQuery}"` : 'Start by adding your first client to the system.'}
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add First Client
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedClient.avatar} alt={selectedClient.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {selectedClient.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <DialogTitle className="text-2xl">{selectedClient.name}</DialogTitle>
                  <DialogDescription className="text-lg">
                    {selectedClient.contact} • {selectedClient.email}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <DollarSign className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <div className="text-2xl font-bold text-green-600">
                        ${selectedClient.totalRevenue.toLocaleString()}
                      </div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedClient.totalProjects}
                      </div>
                      <p className="text-sm text-gray-600">Total Projects</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Star className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
                      <div className="text-2xl font-bold text-yellow-600">
                        {selectedClient.satisfaction}
                      </div>
                      <p className="text-sm text-gray-600">Satisfaction</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="space-y-4 mt-6">
                {selectedClient.projects.map((project: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{project.name}</h4>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                      <p className="text-sm text-gray-600 mt-2">{project.progress}% complete</p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="communication" className="mt-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <MessageSquare className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600">Communication history will be displayed here</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
} 