"use client"

import { useState, useReducer } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { 
  Users, 
  // FolderOpen, 
  MessageSquare, 
  Search, 
  // Filter, 
  Download, 
  Share2,
  Star,
  // Globe,
  Clock,
  MapPin,
  // DollarSign,
  FileText,
  ImageIcon,
  Film,
  // Archive,
  Plus,
  Eye,
  MoreHorizontal,
  Upload,
  Video,
  Palette,
  Layers,
  Code,
  Folder,
  Zap,
  ExternalLink,
  Cloud
} from 'lucide-react'

// Type definitions
interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  title: string
  company: string
  location: string
  timezone: string
  skills: string[]
  projects: string[]
  availability: "available" | "busy" | "offline"
}

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "completed" | "archived"
  members: unknown[]
  tasks: number
  progress: number
  dueDate: string
}

interface FileInfo {
  id: string
  name: string
  type: string
  size: number
  lastModified: string
  owner: string
  status: 'latest' | 'draft' | 'archived'
  version: string
  downloadCount: number
  tags: string[]
  cloudStorage: {
    provider: string
    path: string
    syncStatus: 'synced' | 'syncing' | 'error'
  }
  adobeIntegration?: {
    app: string
    appType: string
    status: 'active' | 'inactive'
    lastSync: string
    collaborators: string[]
    cloudLink: string
  }
}

interface Collaboration {
  id: string
  name: string
  description: string
  participants: string[]
  files: string[]
  dueDate?: string
  status: 'active' | 'pending' | 'completed'
  adobeSession?: {
    app: string
    status: 'active' | 'inactive'
    active: boolean
  }
}

interface TeamState {
  members: TeamMember[]
  projects: Project[]
  selectedMember: string | null
  selectedProject: string | null
  filter: string
  search: string
  loading: boolean
  error: string | null
  currentView: 'team' | 'files' | 'collaborations'
  showFileModal: boolean
  showCollaborationModal: boolean
  showMemberModal: boolean
  fileTypeFilter: string
  files: FileInfo[]
  collaborations: Collaboration[]
}

interface TeamStats {
  totalMembers: number
  activeProjects: number
  completedProjects: number
  averageRating: number
  totalHours: number
  totalRevenue: number
  onlineMembers: number
  totalFiles: number
  activeCollaborations: number
}

type TeamAction =
  | { type: "SET_MEMBERS"; members: TeamMember[] }
  | { type: "SET_PROJECTS"; projects: Project[] }
  | { type: "SELECT_MEMBER"; memberId: string }
  | { type: "SELECT_PROJECT"; projectId: string }
  | { type: "SET_FILTER"; filter: string }
  | { type: "SET_SEARCH"; search: string }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SET_CURRENT_VIEW"; view: 'team' | 'files' | 'collaborations' }
  | { type: "SET_FILE_MODAL"; show: boolean }
  | { type: "SET_COLLABORATION_MODAL"; show: boolean }
  | { type: "SET_MEMBER_MODAL"; show: boolean }
  | { type: "SET_FILE_TYPE_FILTER"; fileType: string }

// Sample data
const sampleMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    avatar: "/avatars/sarah.jpg",
    title: "Senior Designer",
    company: "Design Studio",
    location: "San Francisco, CA",
    timezone: "PST",
    skills: ["UI/UX", "Branding", "Motion Design"],
    projects: ["Brand Refresh", "Mobile App"],
    availability: 'available'
  },
  {
    id: "2",
    name: "Marcus Rodriguez",
    email: "marcus@example.com",
    avatar: "/avatars/marcus.jpg",
    title: "Frontend Developer",
    company: "Tech Solutions",
    location: "New York, NY",
    timezone: "EST",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    projects: ["Web Platform", "Client Portal"],
    availability: 'busy'
  }
]

const sampleProjects: Project[] = [
  {
    id: "1",
    name: "Brand Refresh",
    description: "Complete brand identity update for client",
    status: "active",
    members: ["1", "2"],
    tasks: 24,
    progress: 65,
    dueDate: '2024-03-15'
  },
  {
    id: "2",
    name: "Mobile App",
    description: "Design and development of mobile application",
    status: "active",
    members: ["1"],
    tasks: 18,
    progress: 40,
    dueDate: '2024-04-01'
  }
]

// Reducer using Context7 patterns
function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case "SET_MEMBERS":
      return { ...state, members: action.members, loading: false }
    case "SET_PROJECTS":
      return { ...state, projects: action.projects, loading: false }
    case "SELECT_MEMBER":
      return { ...state, selectedMember: action.memberId }
    case "SELECT_PROJECT":
      return { ...state, selectedProject: action.projectId }
    case "SET_FILTER":
      return { ...state, filter: action.filter }
    case "SET_SEARCH":
      return { ...state, search: action.search }
    case "SET_LOADING":
      return { ...state, loading: action.loading }
    case "SET_ERROR":
      return { ...state, error: action.error, loading: false }
    case "SET_CURRENT_VIEW":
      return { ...state, currentView: action.view }
    case "SET_FILE_MODAL":
      return { ...state, showFileModal: action.show }
    case "SET_COLLABORATION_MODAL":
      return { ...state, showCollaborationModal: action.show }
    case "SET_MEMBER_MODAL":
      return { ...state, showMemberModal: action.show }
    case "SET_FILE_TYPE_FILTER":
      return { ...state, fileTypeFilter: action.fileType }
    default:
      return state
  }
}

// Initial state
const initialState: TeamState = {
  members: sampleMembers,
  projects: sampleProjects,
  selectedMember: null,
  selectedProject: null,
  filter: 'all',
  search: '',
  loading: false,
  error: null,
  currentView: 'team',
  showFileModal: false,
  showCollaborationModal: false,
  showMemberModal: false,
  fileTypeFilter: 'all',
  files: [],
  collaborations: []
}

export function TeamCollaborationHub() {
  const [state, dispatch] = useReducer(teamReducer, initialState)
  const [newMember, setNewMember] = useState<any>({ name: '', email: '', title: '' })

  const teamStats: TeamStats = {
    totalMembers: state.members.length,
    activeProjects: state.projects.filter(p => p.status === 'active').length,
    completedProjects: state.projects.filter(p => p.status === 'completed').length,
    averageRating: state.members.reduce((sum, m) => sum + m.skills.length, 0) / state.members.length,
    totalHours: 2500, // This would come from a real tracking system
    totalRevenue: 125000, // This would come from a real financial system
    onlineMembers: state.members.filter(m => m.availability === 'available').length,
    totalFiles: state.files.length,
    activeCollaborations: state.projects.filter(p => p.status === 'active').length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'completed':
        return 'bg-blue-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getFileTypeIcon = (type: string) => {
    const icons = {
      psd: Palette,
      ai: Palette,
      indd: FileText,
      xd: Layers,
      fig: Layers,
      sketch: Layers,
      image: ImageIcon,
      video: Film,
      document: FileText,
      code: Code
    }
    const IconComponent = icons[type as keyof typeof icons] || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const getAdobeAppIcon = (app: string) => {
    const icons = {
      photoshop: { name: 'Ps', color: '#31A8FF' },
      illustrator: { name: 'Ai', color: '#FF9A00' },
      indesign: { name: 'Id', color: '#FF3366' },
      xd: { name: 'Xd', color: '#FF61F6' },
      'after-effects': { name: 'Ae', color: '#9999FF' },
      premiere: { name: 'Pr', color: '#9999FF' }
    }
    const appInfo = icons[app as keyof typeof icons] || { name: 'Cc', color: '#DA1F26' }
    return (
      <div 
        className="w-6 h-6 rounded text-white text-xs font-bold flex items-center justify-center"
        style={{ backgroundColor: appInfo.color }}
      >
        {appInfo.name}
      </div>
    )
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Team Collaboration Hub</h2>
          <p className="text-lg text-slate-500 mt-1">Connect with freelancers, share files, and collaborate with Adobe Creative Suite</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            onClick={() => dispatch({ type: 'SET_FILE_MODAL', show: true })}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => dispatch({ type: 'SET_COLLABORATION_MODAL', show: true })}
          >
            <Video className="h-4 w-4 mr-2" />
            Start Session
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
            onClick={() => dispatch({ type: 'SET_MEMBER_MODAL', show: true })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Team Members</p>
                <p className="text-2xl font-bold text-blue-900">{teamStats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Online Now</p>
                <p className="text-2xl font-bold text-green-900">{teamStats.onlineMembers}</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-purple-900">{teamStats.averageRating.toFixed(1)}</p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Project Files</p>
                <p className="text-2xl font-bold text-orange-900">{teamStats.totalFiles}</p>
              </div>
              <Folder className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-pink-600">Active Sessions</p>
                <p className="text-2xl font-bold text-pink-900">{teamStats.activeCollaborations}</p>
              </div>
              <Zap className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={state.currentView} onValueChange={(value) => dispatch({ type: 'SET_CURRENT_VIEW', view: value as any })}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="files">Project Files</TabsTrigger>
          <TabsTrigger value="collaborations">Active Sessions</TabsTrigger>
        </TabsList>

        {/* Team Members Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800">Team Directory</CardTitle>
                <div className="flex gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search members..." 
                      className="pl-10 w-64"
                      value={state.search}
                      onChange={(e) => dispatch({ type: 'SET_SEARCH', search: e.target.value })}
                    />
                  </div>
                  <Select value={state.filter} onValueChange={(value) => dispatch({ type: 'SET_FILTER', filter: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Skills" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="UI Design">UI Design</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Animation">Animation</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.members.map((member) => (
                  <Card key={member.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer bg-white/80">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Member Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div 
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                  member.availability === 'available' ? 'bg-green-500' :
                                  member.availability === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                              ></div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800">{member.name}</h3>
                              </div>
                              <p className="text-sm text-slate-600">{member.title}</p>
                              {member.company && (
                                <p className="text-xs text-slate-500">{member.company}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location & Rating */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {member.location}
                          </div>
                        </div>

                        {/* Skills */}
                        <div>
                          <p className="text-xs font-medium text-slate-700 mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill) => (
                              <Badge key={skill} className="text-xs bg-slate-100 text-slate-700">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 3 && (
                              <Badge className="text-xs bg-slate-100 text-slate-700">
                                +{member.skills.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Availability & Rate */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-slate-600">Availability</p>
                            <p className="font-medium">{member.availability}</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Video className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Project Files Tab */}
        <TabsContent value="files" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800">Project Files & Adobe Integration</CardTitle>
                <div className="flex gap-3">
                  <Select value={state.fileTypeFilter} onValueChange={(value) => dispatch({ type: 'SET_FILE_TYPE_FILTER', fileType: value })}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Files</SelectItem>
                      <SelectItem value="psd">Photoshop</SelectItem>
                      <SelectItem value="ai">Illustrator</SelectItem>
                      <SelectItem value="xd">Adobe XD</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync Cloud
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.files.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-all duration-200 bg-white/50">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getFileTypeIcon(file.type)}
                        {file.adobeIntegration && getAdobeAppIcon(file.adobeIntegration.appType)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-800">{file.name}</p>
                          <Badge className={`text-xs ${
                            file.status === 'latest' ? 'bg-green-100 text-green-700' :
                            file.status === 'draft' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            v{file.version} • {file.status}
                          </Badge>
                          {file.adobeIntegration && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">
                              <Zap className="h-3 w-3 mr-1" />
                              Adobe Sync
                            </Badge>
                          )}
                          {file.cloudStorage && (
                            <Badge className="text-xs bg-purple-100 text-purple-700">
                              <Cloud className="h-3 w-3 mr-1" />
                              {file.cloudStorage.provider}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>Updated {new Date(file.lastModified).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{file.downloadCount} downloads</span>
                          {file.adobeIntegration && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {file.adobeIntegration.collaborators.length} collaborators
                              </span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          {file.tags.map((tag) => (
                            <Badge key={tag} className="text-xs bg-slate-100 text-slate-600">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {file.adobeIntegration?.cloudLink && (
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open in {file.adobeIntegration.appType}
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collaborations Tab */}
        <TabsContent value="collaborations" className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Active Collaboration Sessions</CardTitle>
              <CardDescription>
                Real-time collaboration with Adobe Creative Cloud integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {state.collaborations.map((collaboration) => (
                  <Card key={collaboration.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Video className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800">{collaboration.name}</h3>
                              <Badge className="bg-green-100 text-green-700">
                                {collaboration.status}
                              </Badge>
                              {collaboration.adobeSession?.active && (
                                <Badge className="bg-blue-100 text-blue-700">
                                  <Zap className="h-3 w-3 mr-1" />
                                  Adobe Session Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{collaboration.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {collaboration.participants.length} participants
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {collaboration.files.length} files
                              </span>
                              {collaboration.dueDate && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Due {new Date(collaboration.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                          <Button variant="outline" size="sm">
                            <Video className="h-4 w-4 mr-1" />
                            Join Call
                          </Button>
                          {collaboration.adobeSession?.active && (
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Join Adobe Session
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
