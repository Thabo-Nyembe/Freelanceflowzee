'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  AlertTriangle,
  Info,
  Calendar as CalendarIcon,
  Bell,
  Settings,
  MoreHorizontal,
  Plus,
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
  const [showInviteDialog, setShowInviteDialog] = React.useState(false)
  const [showReportsDialog, setShowReportsDialog] = React.useState(false)
  const [showNotificationsDialog, setShowNotificationsDialog] = React.useState(false)
  const [inviteEmails, setInviteEmails] = React.useState('')
  const [inviteRole, setInviteRole] = React.useState('member')
  const [isSendingInvites, setIsSendingInvites] = React.useState(false)
  const [notificationSettings, setNotificationSettings] = React.useState({
    projectUpdates: true,
    teamMessages: true,
    deadlineReminders: true,
    weeklyDigest: false,
    marketingEmails: false
  })

  const handleSendInvites = async () => {
    if (!inviteEmails.trim()) return
    setIsSendingInvites(true)
    toast.loading('Sending invitations...', { id: 'send-invites' })
    await new Promise(resolve => setTimeout(resolve, 1500))
    const emailCount = inviteEmails.split(',').filter(e => e.trim()).length
    toast.success('Invitations sent', {
      id: 'send-invites',
      description: `${emailCount} team member${emailCount > 1 ? 's' : ''} invited successfully`
    })
    setInviteEmails('')
    setIsSendingInvites(false)
    setShowInviteDialog(false)
  }

  const handleSaveNotifications = async () => {
    toast.loading('Saving preferences...', { id: 'save-notifs' })
    await new Promise(resolve => setTimeout(resolve, 800))
    toast.success('Preferences saved', { id: 'save-notifs', description: 'Your notification settings have been updated' })
    setShowNotificationsDialog(false)
  }

  const handleExportReport = async (format: string) => {
    toast.loading(`Generating ${format} report...`, { id: 'export-report' })
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Report ready', { id: 'export-report', description: `Your ${format} report is downloading` })
  }

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
          
          <Button variant="outline" size="sm" onClick={() => {
            toast.promise(
              new Promise(resolve => setTimeout(resolve, 1500)),
              {
                loading: 'Refreshing dashboard data...',
                success: 'Dashboard data refreshed',
                error: 'Failed to refresh'
              }
            )
          }}>
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
            
            <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
              <Users className="mr-2 h-4 w-4" />
              Invite Team
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowReportsDialog(true)}>
              <BarChart3 className="mr-2 h-4 w-4" />
              View Reports
            </Button>

            <Button variant="outline" size="sm" onClick={() => setShowNotificationsDialog(true)}>
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Invitation Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Invite Team Members
            </DialogTitle>
            <DialogDescription>
              Send invitations to collaborate on your projects
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Email Addresses</Label>
              <Input
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate multiple emails with commas</p>
            </div>

            <div>
              <Label>Role</Label>
              <div className="flex gap-2 mt-1">
                {['member', 'admin', 'viewer'].map((role) => (
                  <Button
                    key={role}
                    variant={inviteRole === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInviteRole(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Role Permissions</p>
              <p className="text-xs text-muted-foreground mt-1">
                {inviteRole === 'admin' && 'Can manage team, projects, and settings'}
                {inviteRole === 'member' && 'Can create and edit projects, collaborate with team'}
                {inviteRole === 'viewer' && 'Can view projects and leave comments'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvites} disabled={!inviteEmails.trim() || isSendingInvites}>
              {isSendingInvites ? 'Sending...' : 'Send Invitations'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReportsDialog} onOpenChange={setShowReportsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Analytics Reports
            </DialogTitle>
            <DialogDescription>
              Export detailed reports and analytics data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => handleExportReport('PDF')}>
                <div className="text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="font-medium text-sm">PDF Report</p>
                  <p className="text-xs text-muted-foreground">Full analytics summary</p>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => handleExportReport('Excel')}>
                <div className="text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-medium text-sm">Excel Export</p>
                  <p className="text-xs text-muted-foreground">Raw data spreadsheet</p>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => handleExportReport('CSV')}>
                <div className="text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-medium text-sm">CSV Data</p>
                  <p className="text-xs text-muted-foreground">For custom analysis</p>
                </div>
              </Card>

              <Card className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => handleExportReport('JSON')}>
                <div className="text-center">
                  <Download className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                  <p className="font-medium text-sm">JSON Export</p>
                  <p className="text-xs text-muted-foreground">For API integration</p>
                </div>
              </Card>
            </div>

            <Separator />

            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Report Summary</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Period:</span> Last 30 days
                </div>
                <div>
                  <span className="text-muted-foreground">Projects:</span> {projects.length}
                </div>
                <div>
                  <span className="text-muted-foreground">Team Size:</span> 12 members
                </div>
                <div>
                  <span className="text-muted-foreground">Data points:</span> 1,247
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotificationsDialog} onOpenChange={setShowNotificationsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </DialogTitle>
            <DialogDescription>
              Manage how and when you receive notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {[
              { key: 'projectUpdates', label: 'Project Updates', description: 'When projects are updated or completed' },
              { key: 'teamMessages', label: 'Team Messages', description: 'New messages from team members' },
              { key: 'deadlineReminders', label: 'Deadline Reminders', description: 'Upcoming project deadlines' },
              { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of activity' },
              { key: 'marketingEmails', label: 'Marketing Emails', description: 'Product updates and tips' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="font-medium">{item.label}</Label>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Checkbox
                  checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                  onCheckedChange={(checked) =>
                    setNotificationSettings(prev => ({ ...prev, [item.key]: checked }))
                  }
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotificationsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotifications}>
              Save Preferences
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



