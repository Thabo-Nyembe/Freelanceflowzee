'use client'

import { useState, useCallback, useMemo } from 'react'
import { useEmployees, type Employee, type EmployeeStatus } from '@/lib/hooks/use-employees'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users, UserPlus, Briefcase, Award, TrendingUp, DollarSign, Eye, MessageCircle, Mail, Star,
  Search, Filter, Calendar, Clock, Gift, Heart, Target, FileText, CheckCircle, XCircle,
  ChevronRight, ChevronDown, Building2, MapPin, Phone, Globe, Linkedin, Twitter,
  GraduationCap, Medal, Zap, Settings, Download, Upload, MoreHorizontal, Edit3,
  Trash2, Send, Bell, BookOpen, Cake, Plane, Umbrella, Coffee, Home, Video,
  BarChart3, PieChart, TrendingDown, ArrowUpRight, UserCheck, UserMinus, Layers
} from 'lucide-react'

// BambooHR-style interfaces
interface TimeOffRequest {
  id: string
  employeeId: string
  employeeName: string
  type: 'vacation' | 'sick' | 'personal' | 'parental' | 'bereavement'
  startDate: string
  endDate: string
  days: number
  status: 'pending' | 'approved' | 'rejected'
  reason?: string
}

interface PerformanceReview {
  id: string
  employeeId: string
  reviewerId: string
  period: string
  overallScore: number
  strengths: string[]
  improvements: string[]
  goals: string[]
  status: 'draft' | 'in_progress' | 'completed'
  createdAt: string
}

interface OnboardingTask {
  id: string
  employeeId: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  category: 'paperwork' | 'training' | 'setup' | 'intro'
}

interface OrgNode {
  id: string
  name: string
  position: string
  department: string
  avatar?: string
  children?: OrgNode[]
}

interface TimeOffBalance {
  type: string
  icon: React.ReactNode
  available: number
  used: number
  total: number
  color: string
}

// Mock time-off requests
const mockTimeOffRequests: TimeOffRequest[] = [
  { id: '1', employeeId: '1', employeeName: 'John Developer', type: 'vacation', startDate: '2024-04-01', endDate: '2024-04-05', days: 5, status: 'pending' },
  { id: '2', employeeId: '2', employeeName: 'Sarah Designer', type: 'sick', startDate: '2024-03-25', endDate: '2024-03-25', days: 1, status: 'approved' },
  { id: '3', employeeId: '3', employeeName: 'Mike Engineer', type: 'personal', startDate: '2024-03-28', endDate: '2024-03-29', days: 2, status: 'pending' },
  { id: '4', employeeId: '4', employeeName: 'Emily PM', type: 'vacation', startDate: '2024-04-10', endDate: '2024-04-15', days: 5, status: 'approved' },
]

// Mock performance reviews
const mockPerformanceReviews: PerformanceReview[] = [
  {
    id: '1',
    employeeId: '1',
    reviewerId: '5',
    period: 'Q1 2024',
    overallScore: 4.5,
    strengths: ['Technical expertise', 'Team collaboration', 'Problem solving'],
    improvements: ['Documentation', 'Meeting deadlines'],
    goals: ['Lead a major project', 'Mentor junior developers'],
    status: 'completed',
    createdAt: '2024-03-15'
  },
  {
    id: '2',
    employeeId: '2',
    reviewerId: '5',
    period: 'Q1 2024',
    overallScore: 4.8,
    strengths: ['Creative design', 'User empathy', 'Attention to detail'],
    improvements: ['Time management'],
    goals: ['Lead design system update', 'Conduct user research'],
    status: 'in_progress',
    createdAt: '2024-03-14'
  },
]

// Mock onboarding tasks
const mockOnboardingTasks: OnboardingTask[] = [
  { id: '1', employeeId: '5', title: 'Complete I-9 Form', description: 'Employment eligibility verification', dueDate: '2024-03-20', completed: true, category: 'paperwork' },
  { id: '2', employeeId: '5', title: 'Setup Workstation', description: 'Computer, monitors, and peripherals', dueDate: '2024-03-21', completed: true, category: 'setup' },
  { id: '3', employeeId: '5', title: 'Security Training', description: 'Complete mandatory security awareness training', dueDate: '2024-03-25', completed: false, category: 'training' },
  { id: '4', employeeId: '5', title: 'Meet with Manager', description: '1:1 introduction and goal setting', dueDate: '2024-03-22', completed: true, category: 'intro' },
  { id: '5', employeeId: '5', title: 'Team Introductions', description: 'Meet team members', dueDate: '2024-03-23', completed: false, category: 'intro' },
]

// Mock org structure
const mockOrgChart: OrgNode = {
  id: '1',
  name: 'Alex CEO',
  position: 'Chief Executive Officer',
  department: 'Executive',
  children: [
    {
      id: '2',
      name: 'Sarah VP Engineering',
      position: 'VP of Engineering',
      department: 'Engineering',
      children: [
        { id: '5', name: 'John Developer', position: 'Senior Engineer', department: 'Engineering' },
        { id: '6', name: 'Mike Engineer', position: 'Software Engineer', department: 'Engineering' },
      ]
    },
    {
      id: '3',
      name: 'Emily VP Product',
      position: 'VP of Product',
      department: 'Product',
      children: [
        { id: '7', name: 'Lisa PM', position: 'Product Manager', department: 'Product' },
      ]
    },
    {
      id: '4',
      name: 'David VP Sales',
      position: 'VP of Sales',
      department: 'Sales',
      children: [
        { id: '8', name: 'Tom Sales', position: 'Sales Manager', department: 'Sales' },
      ]
    }
  ]
}

// Time-off balances
const timeOffBalances: TimeOffBalance[] = [
  { type: 'Vacation', icon: <Plane className="w-5 h-5" />, available: 12, used: 3, total: 15, color: 'bg-blue-500' },
  { type: 'Sick Leave', icon: <Heart className="w-5 h-5" />, available: 8, used: 2, total: 10, color: 'bg-red-500' },
  { type: 'Personal', icon: <Coffee className="w-5 h-5" />, available: 3, used: 0, total: 3, color: 'bg-purple-500' },
  { type: 'Parental', icon: <Home className="w-5 h-5" />, available: 12, used: 0, total: 12, color: 'bg-green-500' },
]

export default function EmployeesClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all')
  const [activeTab, setActiveTab] = useState('directory')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [showAddEmployeeDialog, setShowAddEmployeeDialog] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['1', '2', '3', '4'])

  const { employees, loading, error } = useEmployees({ department: departmentFilter })
  const displayEmployees = useMemo(() => {
    const emps = (employees && employees.length > 0) ? employees : (initialEmployees || [])
    if (!searchQuery) return emps
    return emps.filter(e =>
      e.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.department?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [employees, initialEmployees, searchQuery])

  const stats = useMemo(() => [
    {
      label: 'Total Employees',
      value: displayEmployees.length.toString(),
      change: 8.3,
      icon: <Users className="w-5 h-5" />
    },
    {
      label: 'Active',
      value: displayEmployees.filter(e => e.status === 'active').length.toString(),
      change: 5.2,
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      label: 'Pending Time Off',
      value: mockTimeOffRequests.filter(r => r.status === 'pending').length.toString(),
      change: 0,
      icon: <Clock className="w-5 h-5" />
    },
    {
      label: 'Avg Performance',
      value: displayEmployees.length > 0
        ? `${(displayEmployees.reduce((sum, e) => sum + e.performance_score, 0) / displayEmployees.length).toFixed(1)}%`
        : '0%',
      change: 3.7,
      icon: <Target className="w-5 h-5" />
    }
  ], [displayEmployees])

  const getDepartmentColor = (dept: string | null) => {
    const colors: Record<string, string> = {
      engineering: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      marketing: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      sales: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      product: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      hr: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    }
    return colors[dept?.toLowerCase() || ''] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
  }

  const getTimeOffTypeIcon = (type: TimeOffRequest['type']) => {
    switch (type) {
      case 'vacation': return <Plane className="w-4 h-4 text-blue-600" />
      case 'sick': return <Heart className="w-4 h-4 text-red-600" />
      case 'personal': return <Coffee className="w-4 h-4 text-purple-600" />
      case 'parental': return <Home className="w-4 h-4 text-green-600" />
      case 'bereavement': return <Umbrella className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const toggleOrgNode = (id: string) => {
    setExpandedNodes(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    )
  }

  const renderOrgNode = (node: OrgNode, level: number = 0) => (
    <div key={node.id} className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
        {node.children && node.children.length > 0 && (
          <button onClick={() => toggleOrgNode(node.id)} className="p-1">
            {expandedNodes.includes(node.id) ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
        {(!node.children || node.children.length === 0) && <div className="w-6" />}
        <Avatar>
          <AvatarImage src={`https://avatar.vercel.sh/${node.name}`} />
          <AvatarFallback>{node.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-medium">{node.name}</p>
          <p className="text-sm text-muted-foreground">{node.position}</p>
        </div>
        <Badge className={getDepartmentColor(node.department)}>{node.department}</Badge>
      </div>
      {node.children && expandedNodes.includes(node.id) && (
        <div className="mt-1">
          {node.children.map(child => renderOrgNode(child, level + 1))}
        </div>
      )}
    </div>
  )

  const handleViewProfile = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowProfileDialog(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/40 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              Employees
            </h1>
            <p className="text-muted-foreground">BambooHR-style HR management and employee experience</p>
          </div>
          <div className="flex items-center gap-3">
            <ModernButton variant="outline" onClick={() => setShowTimeOffDialog(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Time Off
            </ModernButton>
            <GradientButton from="sky" to="blue" onClick={() => setShowAddEmployeeDialog(true)}>
              <UserPlus className="w-5 h-5 mr-2" />
              Add Employee
            </GradientButton>
          </div>
        </div>

        <StatGrid columns={4} stats={stats} />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white/50 dark:bg-gray-800/50 p-1 rounded-lg">
              <TabsTrigger value="directory" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Users className="w-4 h-4 mr-2" />
                Directory
              </TabsTrigger>
              <TabsTrigger value="org-chart" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Layers className="w-4 h-4 mr-2" />
                Org Chart
              </TabsTrigger>
              <TabsTrigger value="time-off" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Plane className="w-4 h-4 mr-2" />
                Time Off
              </TabsTrigger>
              <TabsTrigger value="performance" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <Target className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="onboarding" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                <GraduationCap className="w-4 h-4 mr-2" />
                Onboarding
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Directory Tab */}
          <TabsContent value="directory" className="space-y-6">
            {/* Department Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'engineering', 'design', 'marketing', 'sales', 'product', 'hr'].map(dept => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    departmentFilter === dept
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {dept === 'all' ? 'All Departments' : dept.charAt(0).toUpperCase() + dept.slice(1)}
                </button>
              ))}
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayEmployees.map((employee) => (
                <Card key={employee.id} className="overflow-hidden hover:shadow-lg transition-all">
                  <div className="h-20 bg-gradient-to-r from-sky-500 to-blue-600 relative">
                    <Avatar className="absolute -bottom-8 left-6 w-16 h-16 border-4 border-white dark:border-gray-800">
                      <AvatarImage src={`https://avatar.vercel.sh/${employee.employee_name}`} />
                      <AvatarFallback>{employee.employee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardContent className="pt-10 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {employee.employee_name}
                          {employee.performance_score >= 95 && (
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          )}
                        </h3>
                        <p className="text-sm text-muted-foreground">{employee.position || employee.job_title}</p>
                      </div>
                      <Badge className={getDepartmentColor(employee.department)}>
                        {employee.department}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {employee.email && (
                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {employee.email}
                        </p>
                      )}
                      {(employee.work_location || employee.office_location) && (
                        <p className="text-sm flex items-center gap-2 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {employee.work_location || employee.office_location}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Performance</p>
                          <p className="font-semibold text-sky-600">{employee.performance_score}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Projects</p>
                          <p className="font-semibold">{employee.projects_count}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewProfile(employee)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {displayEmployees.length === 0 && (
                <div className="col-span-full text-center py-16 bg-white dark:bg-gray-800 rounded-xl border">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Employees Found</h3>
                  <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Org Chart Tab */}
          <TabsContent value="org-chart" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {renderOrgNode(mockOrgChart)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Time Off Tab */}
          <TabsContent value="time-off" className="space-y-6">
            {/* Time Off Balances */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {timeOffBalances.map((balance) => (
                <Card key={balance.type}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 ${balance.color} bg-opacity-20 rounded-lg`}>
                        {balance.icon}
                      </div>
                      <span className="font-medium">{balance.type}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Available</span>
                        <span className="font-semibold">{balance.available} days</span>
                      </div>
                      <Progress value={(balance.used / balance.total) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">{balance.used} of {balance.total} used</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Time Off Requests */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Time Off Requests</CardTitle>
                <ModernButton variant="primary" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Request Time Off
                </ModernButton>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTimeOffRequests.map(request => (
                    <div key={request.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="p-2 bg-white dark:bg-gray-700 rounded-lg">
                        {getTimeOffTypeIcon(request.type)}
                      </div>
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${request.employeeName}`} />
                        <AvatarFallback>{request.employeeName.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{request.employeeName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)} • {request.days} day{request.days > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}</p>
                        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-700 rounded-lg hover:bg-green-200">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg hover:bg-red-200">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar view placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Team Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-sky-300" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold text-sky-600">
                      {displayEmployees.length > 0
                        ? (displayEmployees.reduce((sum, e) => sum + e.performance_score, 0) / displayEmployees.length).toFixed(1)
                        : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                  <div className="space-y-2">
                    {['Exceeds', 'Meets', 'Needs Improvement'].map((rating, i) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="text-sm w-32">{rating}</span>
                        <Progress value={[35, 55, 10][i]} className="flex-1 h-2" />
                        <span className="text-sm w-8">{[35, 55, 10][i]}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Recent Reviews</CardTitle>
                  <ModernButton variant="primary" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Review
                  </ModernButton>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPerformanceReviews.map(review => (
                      <div key={review.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={`https://avatar.vercel.sh/user${review.employeeId}`} />
                              <AvatarFallback>E{review.employeeId}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Employee #{review.employeeId}</p>
                              <p className="text-sm text-muted-foreground">{review.period}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-sky-600">{review.overallScore}/5</p>
                            <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-green-600 mb-1">Strengths</p>
                            <ul className="text-muted-foreground space-y-1">
                              {review.strengths.slice(0, 2).map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-orange-600 mb-1">Areas to Improve</p>
                            <ul className="text-muted-foreground space-y-1">
                              {review.improvements.map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-sky-600 mb-1">Goals</p>
                            <ul className="text-muted-foreground space-y-1">
                              {review.goals.slice(0, 2).map((s, i) => (
                                <li key={i}>• {s}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {displayEmployees
                    .sort((a, b) => b.performance_score - a.performance_score)
                    .slice(0, 5)
                    .map((employee, i) => (
                      <div key={employee.id} className="text-center p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div className="relative inline-block mb-3">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={`https://avatar.vercel.sh/${employee.employee_name}`} />
                            <AvatarFallback>{employee.employee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          {i < 3 && (
                            <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                              i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-600'
                            }`}>
                              {i + 1}
                            </div>
                          )}
                        </div>
                        <p className="font-medium">{employee.employee_name}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                        <p className="text-lg font-bold text-sky-600 mt-2">{employee.performance_score}%</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onboarding Tab */}
          <TabsContent value="onboarding" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Onboarding Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Completion</span>
                      <span className="text-sm font-medium">
                        {mockOnboardingTasks.filter(t => t.completed).length}/{mockOnboardingTasks.length} tasks
                      </span>
                    </div>
                    <Progress
                      value={(mockOnboardingTasks.filter(t => t.completed).length / mockOnboardingTasks.length) * 100}
                      className="h-3"
                    />
                  </div>

                  <div className="space-y-3">
                    {mockOnboardingTasks.map(task => (
                      <div
                        key={task.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                          task.completed
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          task.completed
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-muted-foreground'
                        }`}>
                          {task.completed ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border-2" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                          </p>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{task.category}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <UserPlus className="w-5 h-5 text-sky-600" />
                      <span className="font-medium">New Hires</span>
                    </div>
                    <p className="text-3xl font-bold text-sky-600">3</p>
                    <p className="text-sm text-muted-foreground">This month</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <GraduationCap className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Completed</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">12</p>
                    <p className="text-sm text-muted-foreground">Onboardings this quarter</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Avg Time</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">14</p>
                    <p className="text-sm text-muted-foreground">Days to complete</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Employee Profile Dialog */}
        <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Employee Profile</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={`https://avatar.vercel.sh/${selectedEmployee.employee_name}`} />
                    <AvatarFallback>{selectedEmployee.employee_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedEmployee.employee_name}</h2>
                    <p className="text-muted-foreground">{selectedEmployee.position || selectedEmployee.job_title}</p>
                    <Badge className={getDepartmentColor(selectedEmployee.department)} >
                      {selectedEmployee.department}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedEmployee.email || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{selectedEmployee.work_location || selectedEmployee.office_location || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Hire Date</p>
                    <p className="font-medium">
                      {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Manager</p>
                    <p className="font-medium">{selectedEmployee.manager_name || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-sky-600">{selectedEmployee.performance_score}%</p>
                    <p className="text-sm text-muted-foreground">Performance</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-purple-600">{selectedEmployee.projects_count}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{selectedEmployee.tasks_completed || 0}</p>
                    <p className="text-sm text-muted-foreground">Tasks Done</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Employee Dialog */}
        <Dialog open={showAddEmployeeDialog} onOpenChange={setShowAddEmployeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>Enter the new employee's information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Full Name</Label>
                <Input placeholder="John Doe" className="mt-1" />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" placeholder="john@company.com" className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <select className="w-full px-3 py-2 border rounded-lg mt-1 dark:bg-gray-800">
                    <option>Engineering</option>
                    <option>Design</option>
                    <option>Marketing</option>
                    <option>Sales</option>
                    <option>Product</option>
                    <option>HR</option>
                  </select>
                </div>
                <div>
                  <Label>Position</Label>
                  <Input placeholder="Software Engineer" className="mt-1" />
                </div>
              </div>
              <div>
                <Label>Start Date</Label>
                <Input type="date" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <ModernButton variant="outline" onClick={() => setShowAddEmployeeDialog(false)}>Cancel</ModernButton>
              <GradientButton from="sky" to="blue">Add Employee</GradientButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Plus icon component for buttons
function Plus({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
