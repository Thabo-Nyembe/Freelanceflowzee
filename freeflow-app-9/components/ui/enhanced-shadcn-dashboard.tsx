'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar as CalendarIcon,
  Bell,
  Settings,
  MoreHorizontal,
  Plus,
  Filter,
  Search,
  Download,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
}

interface RecentActivity {
  id: string
  user: string
  action: string
  timestamp: string
  avatar?: string
}

interface Project {
  id: string
  name: string
  progress: number
  status: 'active' | 'completed' | 'pending'
  dueDate: string
  team: string[]
}

interface EnhancedDashboardProps {
  stats?: DashboardStats[]
  recentActivity?: RecentActivity[]
  projects?: Project[]
  isLoading?: boolean
  className?: string
}

const defaultStats: DashboardStats[] = [
  {
    title: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    title: 'Active Projects',
    value: '23',
    change: '+12%',
    changeType: 'positive',
    icon: BarChart3,
  },
  {
    title: 'Team Members',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Completion Rate',
    value: '87%',
    change: '+5%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

const defaultActivity: RecentActivity[] = [
  {
    id: '1',
    user: 'Alice Johnson',
    action: 'completed project "Website Redesign"',
    timestamp: '2 hours ago',
    avatar: '/avatars/alice.jpg',
  },
  {
    id: '2',
    user: 'Bob Smith',
    action: 'uploaded new design assets',
    timestamp: '4 hours ago',
    avatar: '/avatars/bob.jpg',
  },
  {
    id: '3',
    user: 'Carol Davis',
    action: 'commented on "Mobile App UI"',
    timestamp: '6 hours ago',
    avatar: '/avatars/carol.jpg',
  },
]

const defaultProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    progress: 75,
    status: 'active',
    dueDate: '2024-02-15',
    team: ['Alice', 'Bob', 'Carol'],
  },
  {
    id: '2',
    name: 'Mobile App Development',
    progress: 45,
    status: 'active',
    dueDate: '2024-03-01',
    team: ['David', 'Eva'],
  },
  {
    id: '3',
    name: 'Brand Identity Refresh',
    progress: 100,
    status: 'completed',
    dueDate: '2024-01-30',
    team: ['Frank', 'Grace'],
  },
]

export function EnhancedShadcnDashboard({
  stats = defaultStats,
  recentActivity = defaultActivity,
  projects = defaultProjects,
  isLoading = false,
  className,
}: EnhancedDashboardProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? date.toLocaleDateString() : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600' 
                    : stat.changeType === 'negative' 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Projects Overview */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
            <CardDescription>
              Your active and completed projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {project.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {project.dueDate}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        project.status === 'completed' 
                          ? 'default' 
                          : project.status === 'active' 
                          ? 'secondary' 
                          : 'outline'
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Team:</span>
                    <div className="flex -space-x-1">
                      {project.team.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={`/avatars/${member.toLowerCase()}.jpg`} />
                          <AvatarFallback className="text-xs">
                            {member.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  {project !== projects[projects.length - 1] && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback>
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <div className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            You have 3 pending project reviews that require your attention.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            The "Mobile App Development" project is approaching its deadline.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Start a new project for your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Project creation form would go here...
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Invite Team
            </Button>
            
            <Button variant="outline" size="sm">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>
            
            <Button variant="outline" size="sm">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



