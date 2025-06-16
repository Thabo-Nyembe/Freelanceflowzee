'use client'

import { useState, useReducer } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Plus, 
  MessageSquare, 
  Video, 
  Share2, 
  Upload, 
  Download, 
  Star, 
  Clock, 
  MapPin, 
  Mail, 
  Phone,
  Globe,
  FileText,
  Image,
  Film,
  Code,
  Palette,
  Layers,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Cloud,
  Folder,
  FolderOpen,
  Paperclip,
  Link,
  Eye,
  Heart,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Archive
} from 'lucide-react'

// Types for team collaboration
interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  title: string
  company?: string
  location: string
  skills: string[]
  rating: number
  reviewCount: number
  status: 'online' | 'offline' | 'busy' | 'away'
  lastActive: string
  timezone: string
  hourlyRate?: number
  portfolioUrl?: string
  socialLinks?: {
    linkedin?: string
    behance?: string
    dribbble?: string
    github?: string
  }
  availability: {
    hoursPerWeek: number
    nextAvailable: string
  }
  projects: string[]
  isVerified: boolean
  joinedDate: string
}

interface ProjectFile {
  id: string
  name: string
  type: 'psd' | 'ai' | 'indd' | 'xd' | 'fig' | 'sketch' | 'image' | 'video' | 'document' | 'code'
  size: number
  uploadedBy: string
  uploadedAt: string
  lastModified: string
  version: number
  status: 'latest' | 'archived' | 'draft'
  tags: string[]
  sharedWith: string[]
  comments: FileComment[]
  downloadCount: number
  adobeIntegration?: {
    appType: 'photoshop' | 'illustrator' | 'indesign' | 'xd' | 'after-effects' | 'premiere'
    cloudLink?: string
    collaborators: string[]
    lastSynced: string
  }
  cloudStorage?: {
    provider: 'google-drive' | 'dropbox' | 'onedrive'
    link: string
    syncStatus: 'synced' | 'syncing' | 'error'
  }
}

interface FileComment {
  id: string
  userId: string
  content: string
  timestamp: string
  position?: { x: number; y: number }
  resolved: boolean
  replies: FileComment[]
}

interface Collaboration {
  id: string
  name: string
  description: string
  type: 'project' | 'design-review' | 'brainstorm' | 'meeting'
  participants: string[]
  files: string[]
  createdBy: string
  createdAt: string
  dueDate?: string
  status: 'active' | 'completed' | 'paused'
  messages: Message[]
  adobeSession?: {
    active: boolean
    app: string
    participants: string[]
    sessionId: string
  }
}

interface Message {
  id: string
  userId: string
  content: string
  timestamp: string
  type: 'text' | 'file' | 'system' | 'adobe-link'
  attachments?: string[]
  mentions?: string[]
  reactions: { emoji: string; users: string[] }[]
}

interface TeamState {
  members: TeamMember[]
  files: ProjectFile[]
  collaborations: Collaboration[]
  selectedMember: TeamMember | null
  selectedFile: ProjectFile | null
  selectedCollaboration: Collaboration | null
  showMemberModal: boolean
  showFileModal: boolean
  showCollaborationModal: boolean
  searchQuery: string
  skillFilter: string
  statusFilter: string
  fileTypeFilter: string
  currentView: 'team' | 'files' | 'collaborations'
}

type TeamAction =
  | { type: 'SET_SELECTED_MEMBER'; member: TeamMember | null }
  | { type: 'SET_SELECTED_FILE'; file: ProjectFile | null }
  | { type: 'SET_SELECTED_COLLABORATION'; collaboration: Collaboration | null }
  | { type: 'SET_MEMBER_MODAL'; show: boolean }
  | { type: 'SET_FILE_MODAL'; show: boolean }
  | { type: 'SET_COLLABORATION_MODAL'; show: boolean }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_SKILL_FILTER'; skill: string }
  | { type: 'SET_STATUS_FILTER'; status: string }
  | { type: 'SET_FILE_TYPE_FILTER'; fileType: string }
  | { type: 'SET_CURRENT_VIEW'; view: 'team' | 'files' | 'collaborations' }
  | { type: 'ADD_TEAM_MEMBER'; member: TeamMember }
  | { type: 'UPDATE_TEAM_MEMBER'; id: string; member: Partial<TeamMember> }
  | { type: 'ADD_FILE'; file: ProjectFile }
  | { type: 'UPDATE_FILE'; id: string; file: Partial<ProjectFile> }
  | { type: 'ADD_COLLABORATION'; collaboration: Collaboration }
  | { type: 'UPDATE_COLLABORATION'; id: string; collaboration: Partial<Collaboration> }

// Sample data
const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah@designstudio.com',
    avatar: '/avatars/sarah.jpg',
    title: 'Senior UI/UX Designer',
    company: 'Design Studio Pro',
    location: 'San Francisco, CA',
    skills: ['UI Design', 'UX Research', 'Figma', 'Adobe XD', 'Prototyping'],
    rating: 4.9,
    reviewCount: 47,
    status: 'online',
    lastActive: '2 minutes ago',
    timezone: 'PST',
    hourlyRate: 125,
    portfolioUrl: 'https://sarahchen.design',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarahchen',
      behance: 'https://behance.net/sarahchen',
      dribbble: 'https://dribbble.com/sarahchen'
    },
    availability: {
      hoursPerWeek: 30,
      nextAvailable: '2024-06-15'
    },
    projects: ['Brand Identity', 'Mobile App Design'],
    isVerified: true,
    joinedDate: '2023-03-15'
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    email: 'marcus@devforce.io',
    avatar: '/avatars/marcus.jpg',
    title: 'Full Stack Developer',
    company: 'DevForce Solutions',
    location: 'Austin, TX',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
    rating: 4.8,
    reviewCount: 32,
    status: 'busy',
    lastActive: '1 hour ago',
    timezone: 'CST',
    hourlyRate: 95,
    socialLinks: {
      github: 'https://github.com/marcusdev',
      linkedin: 'https://linkedin.com/in/marcusrodriguez'
    },
    availability: {
      hoursPerWeek: 40,
      nextAvailable: '2024-06-20'
    },
    projects: ['E-commerce Platform', 'API Development'],
    isVerified: true,
    joinedDate: '2023-01-22'
  },
  {
    id: '3',
    name: 'Emma Thompson',
    email: 'emma@creativevision.com',
    avatar: '/avatars/emma.jpg',
    title: 'Motion Graphics Designer',
    company: 'Creative Vision Co.',
    location: 'London, UK',
    skills: ['After Effects', 'Cinema 4D', 'Motion Design', 'Video Editing', 'Animation'],
    rating: 4.9,
    reviewCount: 28,
    status: 'online',
    lastActive: 'Just now',
    timezone: 'GMT',
    hourlyRate: 110,
    portfolioUrl: 'https://emmathompson.motion',
    socialLinks: {
      behance: 'https://behance.net/emmathompson',
      linkedin: 'https://linkedin.com/in/emmathompson'
    },
    availability: {
      hoursPerWeek: 25,
      nextAvailable: '2024-06-18'
    },
    projects: ['Brand Animation', 'Product Demo Videos'],
    isVerified: true,
    joinedDate: '2023-05-10'
  }
]

const sampleFiles: ProjectFile[] = [
  {
    id: '1',
    name: 'Brand_Identity_V3.psd',
    type: 'psd',
    size: 45600000, // 45.6MB
    uploadedBy: '1',
    uploadedAt: '2024-06-10T10:30:00Z',
    lastModified: '2024-06-10T14:22:00Z',
    version: 3,
    status: 'latest',
    tags: ['brand', 'logo', 'identity'],
    sharedWith: ['2', '3'],
    comments: [],
    downloadCount: 12,
    adobeIntegration: {
      appType: 'photoshop',
      cloudLink: 'https://creative.adobe.com/share/xyz123',
      collaborators: ['1', '2'],
      lastSynced: '2024-06-10T14:22:00Z'
    }
  },
  {
    id: '2',
    name: 'Website_Wireframes.xd',
    type: 'xd',
    size: 12800000, // 12.8MB
    uploadedBy: '1',
    uploadedAt: '2024-06-09T16:45:00Z',
    lastModified: '2024-06-10T09:15:00Z',
    version: 2,
    status: 'latest',
    tags: ['wireframes', 'ux', 'website'],
    sharedWith: ['2', '3'],
    comments: [],
    downloadCount: 8,
    adobeIntegration: {
      appType: 'xd',
      cloudLink: 'https://xd.adobe.com/view/abc456',
      collaborators: ['1', '2', '3'],
      lastSynced: '2024-06-10T09:15:00Z'
    },
    cloudStorage: {
      provider: 'google-drive',
      link: 'https://drive.google.com/file/d/xyz789',
      syncStatus: 'synced'
    }
  },
  {
    id: '3',
    name: 'Product_Animation.aep',
    type: 'video',
    size: 156700000, // 156.7MB
    uploadedBy: '3',
    uploadedAt: '2024-06-08T11:20:00Z',
    lastModified: '2024-06-09T13:40:00Z',
    version: 1,
    status: 'latest',
    tags: ['animation', 'product', 'video'],
    sharedWith: ['1', '2'],
    comments: [],
    downloadCount: 5,
    adobeIntegration: {
      appType: 'after-effects',
      collaborators: ['3'],
      lastSynced: '2024-06-09T13:40:00Z'
    }
  }
]

const sampleCollaborations: Collaboration[] = [
  {
    id: '1',
    name: 'Brand Identity Review',
    description: 'Final review of the TechCorp brand identity package',
    type: 'design-review',
    participants: ['1', '2', '3'],
    files: ['1', '2'],
    createdBy: '1',
    createdAt: '2024-06-10T09:00:00Z',
    dueDate: '2024-06-15T17:00:00Z',
    status: 'active',
    messages: [],
    adobeSession: {
      active: true,
      app: 'photoshop',
      participants: ['1', '2'],
      sessionId: 'session-abc123'
    }
  }
]

// Reducer using Context7 patterns
function teamReducer(state: TeamState, action: TeamAction): TeamState {
  switch (action.type) {
    case 'SET_SELECTED_MEMBER':
      return { ...state, selectedMember: action.member }
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.file }
    case 'SET_SELECTED_COLLABORATION':
      return { ...state, selectedCollaboration: action.collaboration }
    case 'SET_MEMBER_MODAL':
      return { ...state, showMemberModal: action.show }
    case 'SET_FILE_MODAL':
      return { ...state, showFileModal: action.show }
    case 'SET_COLLABORATION_MODAL':
      return { ...state, showCollaborationModal: action.show }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query }
    case 'SET_SKILL_FILTER':
      return { ...state, skillFilter: action.skill }
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.status }
    case 'SET_FILE_TYPE_FILTER':
      return { ...state, fileTypeFilter: action.type }
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.view }
    case 'ADD_TEAM_MEMBER':
      return { ...state, members: [...state.members, action.member] }
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        members: state.members.map(m => 
          m.id === action.id ? { ...m, ...action.member } : m
        )
      }
    case 'ADD_FILE':
      return { ...state, files: [...state.files, action.file] }
    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(f => 
          f.id === action.id ? { ...f, ...action.file } : f
        )
      }
    case 'ADD_COLLABORATION':
      return { ...state, collaborations: [...state.collaborations, action.collaboration] }
    case 'UPDATE_COLLABORATION':
      return {
        ...state,
        collaborations: state.collaborations.map(c => 
          c.id === action.id ? { ...c, ...action.collaboration } : c
        )
      }
    default:
      return state
  }
}

// Initial state
const initialState: TeamState = {
  members: sampleTeamMembers,
  files: sampleFiles,
  collaborations: sampleCollaborations,
  selectedMember: null,
  selectedFile: null,
  selectedCollaboration: null,
  showMemberModal: false,
  showFileModal: false,
  showCollaborationModal: false,
  searchQuery: '',
  skillFilter: 'all',
  statusFilter: 'all',
  fileTypeFilter: 'all',
  currentView: 'team'
}

export function TeamCollaborationHub() {
  const [state, dispatch] = useReducer(teamReducer, initialState)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    title: '',
    company: '',
    location: '',
    skills: '',
    hourlyRate: 0
  })

  const getStatusColor = (status: string) => {
    const colors = {
      online: 'bg-green-100 text-green-700 border-green-200',
      offline: 'bg-gray-100 text-gray-700 border-gray-200',
      busy: 'bg-red-100 text-red-700 border-red-200',
      away: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
    return colors[status as keyof typeof colors] || colors.offline
  }

  const getFileTypeIcon = (type: string) => {
    const icons = {
      psd: Palette,
      ai: Palette,
      indd: FileText,
      xd: Layers,
      fig: Layers,
      sketch: Layers,
      image: Image,
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

  const teamStats = {
    totalMembers: state.members.length,
    onlineMembers: state.members.filter(m => m.status === 'online').length,
    averageRating: state.members.reduce((sum, m) => sum + m.rating, 0) / state.members.length,
    totalFiles: state.files.length,
    activeCollaborations: state.collaborations.filter(c => c.status === 'active').length
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
                      value={state.searchQuery}
                      onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', query: e.target.value })}
                    />
                  </div>
                  <Select value={state.skillFilter} onValueChange={(value) => dispatch({ type: 'SET_SKILL_FILTER', skill: value })}>
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
                  <Select value={state.statusFilter} onValueChange={(value) => dispatch({ type: 'SET_STATUS_FILTER', status: value })}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
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
                                  member.status === 'online' ? 'bg-green-500' :
                                  member.status === 'busy' ? 'bg-red-500' :
                                  member.status === 'away' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}
                              ></div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800">{member.name}</h3>
                                {member.isVerified && (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{member.title}</p>
                              {member.company && (
                                <p className="text-xs text-slate-500">{member.company}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={getStatusColor(member.status)}>
                            {member.status}
                          </Badge>
                        </div>

                        {/* Location & Rating */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="h-3 w-3" />
                            {member.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{member.rating}</span>
                            <span className="text-slate-500">({member.reviewCount})</span>
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
                            <p className="font-medium">{member.availability.hoursPerWeek}h/week</p>
                          </div>
                          {member.hourlyRate && (
                            <div>
                              <p className="text-xs text-slate-600">Rate</p>
                              <p className="font-medium">${member.hourlyRate}/hr</p>
                            </div>
                          )}
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
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-3 w-3" />
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
                            file.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
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