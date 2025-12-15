'use client'

import { useState } from 'react'
import { useEmployees, type Employee, type EmployeeStatus } from '@/lib/hooks/use-employees'
import { BentoCard, BentoQuickAction } from '@/components/ui/bento-grid-advanced'
import { StatGrid, MiniKPI, ActivityFeed, RankingList, ProgressCard } from '@/components/ui/results-display'
import { ModernButton, GradientButton, PillButton } from '@/components/ui/modern-buttons'
import { Users, UserPlus, Briefcase, Award, TrendingUp, DollarSign, Eye, MessageCircle, Mail, Star } from 'lucide-react'

export default function EmployeesClient({ initialEmployees }: { initialEmployees: Employee[] }) {
  const [departmentFilter, setDepartmentFilter] = useState<string | 'all'>('all')
  const { employees, loading, error } = useEmployees({ department: departmentFilter })

  const displayEmployees = employees.length > 0 ? employees : initialEmployees

  const stats = [
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
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      label: 'Avg Salary',
      value: displayEmployees.length > 0
        ? `$${(displayEmployees.reduce((sum, e) => sum + e.salary, 0) / displayEmployees.length / 1000).toFixed(0)}K`
        : '$0',
      change: 12.5,
      icon: <DollarSign className="w-5 h-5" />
    },
    {
      label: 'Retention',
      value: displayEmployees.length > 0
        ? `${((displayEmployees.filter(e => e.status === 'active').length / displayEmployees.length) * 100).toFixed(0)}%`
        : '0%',
      change: 3.7,
      icon: <Award className="w-5 h-5" />
    }
  ]

  const getDepartmentColor = (dept: string | null) => {
    switch (dept) {
      case 'engineering': return 'bg-blue-100 text-blue-800'
      case 'design': return 'bg-purple-100 text-purple-800'
      case 'marketing': return 'bg-green-100 text-green-800'
      case 'sales': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getColorForEmployee = (index: number) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-pink-500 to-rose-500',
      'from-indigo-500 to-purple-500',
      'from-yellow-500 to-amber-500',
      'from-teal-500 to-cyan-500'
    ]
    return colors[index % colors.length]
  }

  const topPerformers = displayEmployees
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5)
    .map((e, i) => ({
      rank: i + 1,
      label: e.employee_name,
      value: `${e.performance_score}%`,
      change: e.performance_rating
    }))

  const recentActivity = displayEmployees.slice(0, 4).map((e) => ({
    icon: <UserPlus className="w-5 h-5" />,
    title: 'Employee record',
    description: e.employee_name,
    time: new Date(e.created_at).toLocaleDateString(),
    status: e.status === 'active' ? 'success' as const : 'info' as const
  }))

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
          <BentoQuickAction icon={<Briefcase />} title="Engineering" description="Tech team" onClick={() => setDepartmentFilter('engineering')} />
          <BentoQuickAction icon={<Award />} title="Design" description="Creatives" onClick={() => setDepartmentFilter('design')} />
          <BentoQuickAction icon={<TrendingUp />} title="Marketing" description="Growth" onClick={() => setDepartmentFilter('marketing')} />
          <BentoQuickAction icon={<DollarSign />} title="Sales" description="Revenue" onClick={() => setDepartmentFilter('sales')} />
        </div>

        <div className="flex items-center gap-3">
          <PillButton variant={departmentFilter === 'all' ? 'primary' : 'ghost'} onClick={() => setDepartmentFilter('all')}>
            All Employees
          </PillButton>
          <PillButton variant={departmentFilter === 'engineering' ? 'primary' : 'ghost'} onClick={() => setDepartmentFilter('engineering')}>
            <Briefcase className="w-4 h-4 mr-2" />
            Engineering
          </PillButton>
          <PillButton variant={departmentFilter === 'design' ? 'primary' : 'ghost'} onClick={() => setDepartmentFilter('design')}>
            <Award className="w-4 h-4 mr-2" />
            Design
          </PillButton>
          <PillButton variant={departmentFilter === 'marketing' ? 'primary' : 'ghost'} onClick={() => setDepartmentFilter('marketing')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Marketing
          </PillButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {displayEmployees.map((employee, index) => (
              <BentoCard key={employee.id} className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getColorForEmployee(index)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                    {employee.employee_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{employee.employee_name}</h4>
                      {employee.performance_score >= 95 && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      )}
                    </div>
                    <p className="text-sm mb-1">{employee.position || employee.job_title}</p>
                    {employee.department && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDepartmentColor(employee.department)}`}>
                        {employee.department.charAt(0).toUpperCase() + employee.department.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                  <div>
                    <p className="text-muted-foreground mb-1">Performance</p>
                    <p className="font-semibold text-sky-600">{employee.performance_score}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Projects</p>
                    <p className="font-semibold">{employee.projects_count}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Joined</p>
                    <p className="font-semibold">{employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Location</p>
                    <p className="font-semibold truncate">{employee.work_location || employee.office_location || 'N/A'}</p>
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
                  {employee.email && (
                    <ModernButton variant="outline" size="sm">
                      <Mail className="w-3 h-3 mr-1" />
                      Email
                    </ModernButton>
                  )}
                </div>
              </BentoCard>
            ))}

            {displayEmployees.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Employees</h3>
                <p className="text-muted-foreground">Add your first employee</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <RankingList title="⭐ Top Performers" items={topPerformers} />

            <BentoCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">HR Metrics</h3>
              <div className="space-y-3">
                <MiniKPI label="Total Employees" value={displayEmployees.length.toString()} change={8.3} />
                <MiniKPI label="Active" value={displayEmployees.filter(e => e.status === 'active').length.toString()} change={5.2} />
              </div>
            </BentoCard>

            <ActivityFeed title="Recent Activity" activities={recentActivity} />

            <ProgressCard
              title="Hiring Goal"
              value={displayEmployees.length}
              target={300}
              label="Employees"
              color="from-sky-500 to-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
