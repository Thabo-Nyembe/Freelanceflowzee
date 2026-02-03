'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Target, TrendingUp, Users, Star, Award, BookOpen, Code, Zap } from 'lucide-react'

const employees = [
  { 
    id: 1, 
    name: 'Sarah Mitchell', 
    role: 'Senior Developer', 
    department: 'Engineering',
    skills: [
      { name: 'React', level: 5, category: 'Frontend' },
      { name: 'Node.js', level: 4, category: 'Backend' },
      { name: 'TypeScript', level: 5, category: 'Language' },
      { name: 'AWS', level: 3, category: 'Cloud' },
    ]
  },
  { 
    id: 2, 
    name: 'Michael Chen', 
    role: 'Product Manager', 
    department: 'Product',
    skills: [
      { name: 'Product Strategy', level: 5, category: 'Management' },
      { name: 'Agile', level: 4, category: 'Methodology' },
      { name: 'Data Analysis', level: 3, category: 'Analytics' },
      { name: 'User Research', level: 4, category: 'UX' },
    ]
  },
  { 
    id: 3, 
    name: 'Emily Rodriguez', 
    role: 'UX Designer', 
    department: 'Design',
    skills: [
      { name: 'Figma', level: 5, category: 'Design' },
      { name: 'User Research', level: 4, category: 'UX' },
      { name: 'Prototyping', level: 5, category: 'Design' },
      { name: 'Accessibility', level: 3, category: 'UX' },
    ]
  },
  { 
    id: 4, 
    name: 'David Park', 
    role: 'Data Analyst', 
    department: 'Analytics',
    skills: [
      { name: 'SQL', level: 5, category: 'Database' },
      { name: 'Python', level: 4, category: 'Language' },
      { name: 'Tableau', level: 4, category: 'Analytics' },
      { name: 'Statistics', level: 3, category: 'Analytics' },
    ]
  },
]

const skillCategories = [
  { name: 'Frontend', count: 24, avgLevel: 4.2, color: 'bg-blue-100 text-blue-700' },
  { name: 'Backend', count: 18, avgLevel: 3.8, color: 'bg-green-100 text-green-700' },
  { name: 'Design', count: 15, avgLevel: 4.5, color: 'bg-purple-100 text-purple-700' },
  { name: 'Analytics', count: 12, avgLevel: 3.9, color: 'bg-orange-100 text-orange-700' },
]

const skillGaps = [
  { skill: 'Kubernetes', required: 5, current: 2.5, priority: 'high' },
  { skill: 'Machine Learning', required: 4, current: 2.0, priority: 'high' },
  { skill: 'GraphQL', required: 4, current: 3.0, priority: 'medium' },
  { skill: 'Microservices', required: 5, current: 3.5, priority: 'medium' },
]

const topPerformers = [
  { name: 'Sarah Mitchell', skills: 12, avgLevel: 4.5, certifications: 3 },
  { name: 'Emily Rodriguez', skills: 10, avgLevel: 4.3, certifications: 2 },
  { name: 'Michael Chen', skills: 11, avgLevel: 4.1, certifications: 4 },
]

export default function SkillsMatrixClient() {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)

  const stats = useMemo(() => ({
    totalEmployees: employees.length,
    totalSkills: skillCategories.reduce((sum, c) => sum + c.count, 0),
    avgSkillLevel: (skillCategories.reduce((sum, c) => sum + c.avgLevel, 0) / skillCategories.length).toFixed(1),
    skillGapsCount: skillGaps.filter(g => g.priority === 'high').length,
  }), [])

  const getLevelBadge = (level: number) => {
    const styles: Record<number, string> = {
      5: 'bg-green-100 text-green-700',
      4: 'bg-blue-100 text-blue-700',
      3: 'bg-yellow-100 text-yellow-700',
      2: 'bg-orange-100 text-orange-700',
      1: 'bg-red-100 text-red-700',
    }
    const labels = ['Novice', 'Beginner', 'Intermediate', 'Advanced', 'Expert']
    return <Badge className={styles[level]}>{labels[level - 1]}</Badge>
  }

  const insights = [
    { icon: Users, title: `${stats.totalEmployees}`, description: 'Employees tracked' },
    { icon: Target, title: `${stats.totalSkills}`, description: 'Total skills' },
    { icon: Star, title: `${stats.avgSkillLevel}`, description: 'Avg skill level' },
    { icon: TrendingUp, title: `${stats.skillGapsCount}`, description: 'High priority gaps' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Target className="h-8 w-8 text-primary" />Skills Matrix</h1>
          <p className="text-muted-foreground mt-1">Track and develop employee skills</p>
        </div>
        <Button><Target className="h-4 w-4 mr-2" />Add Skill</Button>
      </div>

      <CollapsibleInsightsPanel title="Skills Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {skillCategories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Badge className={category.color}>{category.name}</Badge>
              <p className="text-2xl font-bold mt-2">{category.count}</p>
              <p className="text-xs text-muted-foreground">Avg: {category.avgLevel}/5</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Employee Skills</h3>
            <div className="space-y-3">
              {employees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee.name}`} />
                          <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{employee.name}</h4>
                          <p className="text-sm text-muted-foreground">{employee.role} • {employee.department}</p>
                        </div>
                      </div>
                      <Badge variant="outline">{employee.skills.length} skills</Badge>
                    </div>

                    <div className="space-y-2">
                      {employee.skills.map((skill, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{skill.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">{skill.category}</span>
                              {getLevelBadge(skill.level)}
                            </div>
                          </div>
                          <Progress value={(skill.level / 5) * 100} className="h-2" />
                        </div>
                      ))}
                    </div>

                    <Button size="sm" variant="outline" className="w-full mt-3">View Full Profile</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Skill Gaps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {skillGaps.map((gap, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">{gap.skill}</p>
                      <Badge variant={gap.priority === 'high' ? 'destructive' : 'secondary'}>{gap.priority}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Current</span>
                        <span>{gap.current}/5</span>
                      </div>
                      <Progress value={(gap.current / 5) * 100} className="h-1.5" />
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Required</span>
                        <span>{gap.required}/5</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{performer.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{performer.avgLevel}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Skills: </span>
                        <span className="font-medium">{performer.skills}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Certs: </span>
                        <span className="font-medium">{performer.certifications}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
