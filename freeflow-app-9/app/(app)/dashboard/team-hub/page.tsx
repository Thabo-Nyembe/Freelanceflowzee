'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  CalendarDays, 
  Plus, 
  UserPlus,
  Video,
  MessageCircle,
  Clock,
  Star,
  Calendar,
  Bell,
  Settings,
  ExternalLink,
  MapPin,
  Briefcase,
  Mail,
  Phone,
  Globe,
  Award,
  Target,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

// Mock team data
const mockTeamMembers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'UX Designer',
    avatar: '/avatars/sarah.jpg',
    status: 'online',
    skills: ['UI/UX', 'Figma', 'Research'],
    availability: 'Available',
    timezone: 'EST',
    projectCount: 3,
    rating: 4.9,
    email: 'sarah@company.com',
    phone: '+1 (555) 123-4567'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    role: 'Frontend Developer',
    avatar: '/avatars/marcus.jpg',
    status: 'away',
    skills: ['React', 'TypeScript', 'Next.js'],
    availability: 'In Meeting',
    timezone: 'PST',
    projectCount: 2,
    rating: 4.8,
    email: 'marcus@company.com',
    phone: '+1 (555) 234-5678'
  },
  {
    id: 3,
    name: 'Emma Wilson',
    role: 'Project Manager',
    avatar: '/avatars/emma.jpg',
    status: 'online',
    skills: ['Agile', 'Scrum', 'Leadership'],
    availability: 'Available',
    timezone: 'CST',
    projectCount: 5,
    rating: 5.0,
    email: 'emma@company.com',
    phone: '+1 (555) 345-6789'
  },
  {
    id: 4,
    name: 'David Rodriguez',
    role: 'Backend Developer',
    avatar: '/avatars/david.jpg',
    status: 'offline',
    skills: ['Node.js', 'Python', 'MongoDB'],
    availability: 'Off Today',
    timezone: 'MST',
    projectCount: 1,
    rating: 4.7,
    email: 'david@company.com',
    phone: '+1 (555) 456-7890'
  }
]

// Mock calendar events
const mockEvents = [
  {
    id: 1,
    title: 'Team Standup',
    time: '9:00 AM',
    duration: '30 min',
    attendees: ['Sarah', 'Marcus', 'Emma'],
    type: 'meeting',
    status: 'upcoming'
  },
  {
    id: 2,
    title: 'Design Review Session',
    time: '2:00 PM',
    duration: '1 hour',
    attendees: ['Sarah', 'Emma'],
    type: 'review',
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Client Presentation',
    time: '4:00 PM',
    duration: '45 min',
    attendees: ['Emma', 'David'],
    type: 'presentation',
    status: 'scheduled'
  }
]

const statusConfig = {
  online: { color: 'bg-green-500', label: 'Online' },
  away: { color: 'bg-yellow-500', label: 'Away' },
  offline: { color: 'bg-gray-400', label: 'Offline' }
}

const eventTypeConfig = {
  meeting: { color: 'bg-blue-500', icon: Users },
  review: { color: 'bg-purple-500', icon: Target },
  presentation: { color: 'bg-green-500', icon: TrendingUp }
}

export default function TeamHubPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Team Hub
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Manage team members and coordinate schedules
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Meeting
            </Button>
            <Button className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-cyan-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-900">4</div>
              <p className="text-xs text-cyan-600 mt-1">3 online now</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Today's Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">3</div>
              <p className="text-xs text-blue-600 mt-1">Next in 2 hours</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Active Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">8</div>
              <p className="text-xs text-purple-600 mt-1">All on track</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <Award className="h-4 w-4" />
                Team Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 flex items-center gap-1">
                4.9
                <Star className="h-6 w-6 text-yellow-500 fill-current" />
              </div>
              <p className="text-xs text-green-600 mt-1">Excellent performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger value="overview" className="gap-2" data-testid="overview-tab">
              <Users className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2" data-testid="team-tab">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2" data-testid="calendar-tab">
              <CalendarDays className="h-4 w-4" />
              Shared Calendar
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
              <p className="text-gray-600">Team collaboration and scheduling hub coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Team Members</h2>
              <p className="text-gray-600">Team management interface coming soon...</p>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6 mt-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Shared Calendar</h2>
              <p className="text-gray-600">Calendar integration coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 