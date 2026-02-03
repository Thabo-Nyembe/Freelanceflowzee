'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Building, Plus, Search, Users, DollarSign, Target, TrendingUp, MoreHorizontal, UserCircle } from 'lucide-react'

const departments = [
  { id: 1, name: 'Engineering', head: 'Sarah Chen', headcount: 45, budget: 2500000, spent: 1875000, projects: 12, color: 'blue' },
  { id: 2, name: 'Sales', head: 'Mike Johnson', headcount: 28, budget: 1800000, spent: 1440000, projects: 8, color: 'green' },
  { id: 3, name: 'Marketing', head: 'Emily Davis', headcount: 18, budget: 1200000, spent: 960000, projects: 15, color: 'purple' },
  { id: 4, name: 'Product', head: 'Tom Wilson', headcount: 22, budget: 1500000, spent: 1050000, projects: 6, color: 'orange' },
  { id: 5, name: 'Customer Success', head: 'Lisa Park', headcount: 15, budget: 900000, spent: 720000, projects: 4, color: 'pink' },
  { id: 6, name: 'Finance', head: 'James Brown', headcount: 12, budget: 800000, spent: 640000, projects: 3, color: 'yellow' },
]

export default function DepartmentsClient() {
  const [searchQuery, setSearchQuery] = useState('')

  const stats = useMemo(() => ({
    totalDepts: departments.length,
    totalHeadcount: departments.reduce((sum, d) => sum + d.headcount, 0),
    totalBudget: departments.reduce((sum, d) => sum + d.budget, 0),
    avgBudgetUtil: Math.round(departments.reduce((sum, d) => sum + (d.spent / d.budget) * 100, 0) / departments.length),
  }), [])

  const filteredDepts = useMemo(() => departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.head.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery])

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
      orange: 'bg-orange-500', pink: 'bg-pink-500', yellow: 'bg-yellow-500',
    }
    return colors[color] || 'bg-gray-500'
  }

  const insights = [
    { icon: Building, title: `${stats.totalDepts}`, description: 'Departments' },
    { icon: Users, title: `${stats.totalHeadcount}`, description: 'Total employees' },
    { icon: TrendingUp, title: `${stats.avgBudgetUtil}%`, description: 'Avg budget util' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            Departments
          </h1>
          <p className="text-muted-foreground mt-1">Manage organizational structure</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Add Department</Button>
      </div>

      <CollapsibleInsightsPanel title="Organization Overview" insights={insights} defaultExpanded={true} />

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search departments..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => (
          <Card key={dept.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-lg ${getColorClass(dept.color)} flex items-center justify-center text-white font-bold`}>
                    {dept.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{dept.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <UserCircle className="h-3 w-3" />{dept.head}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-lg font-bold">{dept.headcount}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-lg font-bold">{dept.projects}</p>
                  <p className="text-xs text-muted-foreground">Projects</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-lg font-bold">${(dept.budget / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground">Budget</p>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Budget Utilization</span>
                  <span className="font-medium">{Math.round((dept.spent / dept.budget) * 100)}%</span>
                </div>
                <Progress value={(dept.spent / dept.budget) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
