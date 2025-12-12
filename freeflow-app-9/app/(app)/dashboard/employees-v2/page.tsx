"use client"

import { useState } from 'react'
import {
  BentoCard,
  BentoQuickAction
} from '@/components/ui/bento-grid-advanced'
import {
  StatGrid,
  MiniKPI,
  ActivityFeed,
  RankingList,
  ProgressCard
} from '@/components/ui/results-display'
import {
  ModernButton,
  GradientButton,
  PillButton
} from '@/components/ui/modern-buttons'
import {
  Users,
  UserPlus,
  Briefcase,
  Award,
  Calendar,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  TrendingUp,
  Clock,
  MoreVertical,
  Search,
  Filter,
  Eye,
  MessageCircle,
  Settings,
  Star
} from 'lucide-react'

/**
 * Employees V2 - Human Resources Management
 * Manages employee profiles, departments, and HR analytics
 */
export default function EmployeesV2() {
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'engineering' | 'design' | 'marketing' | 'sales'>('all')

  const stats = [
    { label: 'Total Employees', value: '247', change: 8.3, icon: <Users className="w-5 h-5" /> },
    { label: 'Active', value: '234', change: 5.2, icon: <TrendingUp className="w-5 h-5" /> },
    { label: 'Avg Salary', value: '$94K', change: 12.5, icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Retention', value: '94%', change: 3.7, icon: <Award className="w-5 h-5" /> }
  ]

  const employees = [
    {
      id: '1',
      name: 'Sarah Johnson',
      position: 'Senior Software Engineer',
      department: 'engineering',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      salary: 145000,
      joinDate: '2022-01-15',
      location: 'New York, NY',
      status: 'active',
      performance: 98,
      projects: 12,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: '2',
      name: 'Michael Chen',
      position: 'Product Designer',
      department: 'design',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      salary: 115000,
      joinDate: '2022-03-22',
      location: 'San Francisco, CA',
      status: 'active',
      performance: 95,
      projects: 8,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      position: 'Marketing Manager',
      department: 'marketing',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ER',
      salary: 98000,
      joinDate: '2022-06-10',
      location: 'Austin, TX',
      status: 'active',
      performance: 92,
      projects: 15,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: '4',
      name: 'David Park',
      position: 'Sales Director',
      department: 'sales',
      email: 'david.park@company.com',
      phone: '+1 (555) 456-7890',
      avatar: 'DP',
      salary: 125000,
      joinDate: '2021-09-05',
      location: 'Seattle, WA',
      status: 'active',
      performance: 96,
      projects: 24,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: '5',
      name: 'Lisa Anderson',
      position: 'Frontend Developer',
      department: 'engineering',
      email: 'lisa.anderson@company.com',
      phone: '+1 (555) 567-8901',
      avatar: 'LA',
      salary: 105000,
      joinDate: '2023-01-15',
      location: 'Boston, MA',
      status: 'active',
      performance: 90,
      projects: 6,
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: '6',
      name: 'James Wilson',
      position: 'UX Designer',
      department: 'design',
      email: 'james.wilson@company.com',
      phone: '+1 (555) 678-9012',
      avatar: 'JW',
      salary: 92000,
      joinDate: '2023-02-20',
      location: 'Denver, CO',
      status: 'active',
      performance: 88,
      projects: 7,
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: '7',
      name: 'Maria Garcia',
      position: 'Content Strategist',
      department: 'marketing',
      email: 'maria.garcia@company.com',
      phone: '+1 (555) 789-0123',
      avatar: 'MG',
      salary: 78000,
      joinDate: '2023-04-12',
      location: 'Miami, FL',
      status: 'active',
      performance: 85,
      projects: 11,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      id: '8',
      name: 'Robert Brown',
      position: 'Account Executive',
      department: 'sales',
      email: 'robert.brown@company.com',
      phone: '+1 (555) 890-1234',
      avatar: 'RB',
      salary: 89000,
      joinDate: '2022-11-08',
      location: 'Chicago, IL',
      status: 'active',
      performance: 93,
      projects: 18,
      color: 'from-teal-500 to-cyan-500'
    }
  ]

  const topPerformers = [
    { rank: 1, name: 'Sarah Johnson', avatar: 'SJ', value: '98%', change: 5.2 },
    { rank: 2, name: 'David Park', avatar: 'DP', value: '96%', change: 4.8 },
    { rank: 3, name: 'Michael Chen', avatar: 'MC', value: '95%', change: 3.7 },
    { rank: 4, name: 'Robert Brown', avatar: 'RB', value: '93%', change: 2.9 },
    { rank: 5, name: 'Emily Rodriguez', avatar: 'ER', value: '92%', change: 2.3 }
  ]

  const recentActivity = [
    { icon: <UserPlus className="w-4 h-4" />, title: 'New employee onboarded', time: '2h ago', type: 'success' as const },
    { icon: <Award className="w-4 h-4" />, title: 'Performance review completed', time: '5h ago', type: 'info' as const },
    { icon: <Calendar className="w-4 h-4" />, title: 'Team meeting scheduled', time: '1d ago', type: 'warning' as const },
    { icon: <TrendingUp className="w-4 h-4" />, title: 'Promotion approved', time: '2d ago', type: 'success' as const }
  ]

  const getDepartmentColor = (dept: string) => {
    switch (dept) {
      case 'engineering': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'design': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      case 'marketing': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'sales': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Users className="w-10 h-10 text-sky-600" />
              Employees
            </h1>
            <p className="text-muted-foreground">Manage your team and HR operations</p>
          </div>
          <GradientButton from="sky" to="blue" onClick={() => console.log('Add employee')}>
            <UserPlus className="w-5 h-5 mr-2" />
            Add Employee
          </GradientButton>
        </div>

        <StatGrid columns={4} stats={stats} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <BentoQuickAction icon={<Briefcase />} title="Engineering" description="Tech team" onClick={() => setSelectedDepartment('engineering')} />
          <BentoQuickAction icon={<Award />} title="Design" description="Creatives" onClick={() => setSelectedDepartment('design')} />
          <BentoQuickAction icon={<TrendingUp />} title="Marketing" description="Growth" onClick={() => setSelectedDepartment('marketing')} />
          <BentoQuickAction icon={<DollarSign />} title="Sales" description="Revenue" onClick={() => setSelectedDepartment('sales')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={selectedDepartment === 'all' ? 'primary' : 'ghost'} onClick={() => setSelectedDepartment('all')}>
            All Employees
          </PillButton>
          <PillButton variant={selectedDepartment === 'engineering' ? 'primary' : 'ghost'} onClick={() => setSelectedDepartment('engineering')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Engineering
          </PillButton>
          <PillButton variant={selectedDepartment === 'design' ? 'primary' : 'ghost'} onClick={() => setSelectedDepartment('design')}>
            <Award className="w-4 h-4 mr-2" />
            Design
          </PillButton>
          <PillButton variant={selectedDepartment === 'marketing' ? 'primary' : 'ghost'} onClick={() => setSelectedDepartment('marketing')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Marketing
          </PillButton>
          <PillButton variant={selectedDepartment === 'sales' ? 'primary' : 'ghost'} onClick={() => setSelectedDepartment('sales')}>
            <DollarSign className="w-4 h-4 mr-2" />
            Sales
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BentoCard className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Employee Directory</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <ModernButton variant="outline" size="sm">
                    <Filter className="w-4 h-4" />
                  </ModernButton>
                </div>
              </div>

              <div className="space-y-3">
                {employees.map((employee) => (
                  <div key={employee.id} className="p-4 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${employee.color} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                            {employee.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{employee.name}</h4>
                              {employee.performance >= 95 && (
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                            <p className="text-sm mb-1">{employee.position}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDepartmentColor(employee.department)}`}>
                              {employee.department.charAt(0).toUpperCase() + employee.department.slice(1)}
                            </span>
                          </div>
                        </div>
                        <ModernButton variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </ModernButton>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground mb-1">Performance</p>
                          <p className="font-semibold text-sky-600">{employee.performance}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Projects</p>
                          <p className="font-semibold">{employee.projects}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Joined</p>
                          <p className="font-semibold">{employee.joinDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Location</p>
                          <p className="font-semibold truncate">{employee.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t">
                        <ModernButton variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Profile
                        </ModernButton>
                        <ModernButton variant="outline" size="sm">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Message
                        </ModernButton>
                        <ModernButton variant="outline" size="sm">
                          <Mail className="w-3 h-3 mr-1" />
                          Email
                        </ModernButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            <BentoCard className="p-6">
              <h3 className="text-xl font-semibold mb-4">Department Overview</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-medium">Engineering</p>
                  </div>
                  <p className="text-2xl font-bold">89</p>
                  <p className="text-xs text-blue-600 mt-1">36% of workforce</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-medium">Design</p>
                  </div>
                  <p className="text-2xl font-bold">34</p>
                  <p className="text-xs text-purple-600 mt-1">14% of workforce</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium">Marketing</p>
                  </div>
                  <p className="text-2xl font-bold">67</p>
                  <p className="text-xs text-green-600 mt-1">27% of workforce</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-background">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-orange-600" />
                    <p className="text-sm font-medium">Sales</p>
                  </div>
                  <p className="text-2xl font-bold">57</p>
                  <p className="text-xs text-orange-600 mt-1">23% of workforce</p>
                </div>
              </div>
            </BentoCard>
          </div>

          <div className="space-y-6">
            <RankingList title="⭐ Top Performers" items={topPerformers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">HR Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Employees" value="247" change={8.3} />
                <MiniKPI label="Active Employees" value="234" change={5.2} />
                <MiniKPI label="Avg Salary" value="$94K" change={12.5} />
                <MiniKPI label="Retention Rate" value="94%" change={3.7} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Hiring Goal"
              value={247}
              target={300}
              label="Employees"
              color="from-sky-500 to-blue-500"
            />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                      <span className="text-sm">Engineering</span>
                    </div>
                    <span className="text-xs font-semibold">89 (36%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '36%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Marketing</span>
                    </div>
                    <span className="text-xs font-semibold">67 (27%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '27%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-orange-600" />
                      <span className="text-sm">Sales</span>
                    </div>
                    <span className="text-xs font-semibold">57 (23%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-red-500" style={{ width: '23%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span className="text-sm">Design</span>
                    </div>
                    <span className="text-xs font-semibold">34 (14%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>
      </div>
    </div>
  )
}
