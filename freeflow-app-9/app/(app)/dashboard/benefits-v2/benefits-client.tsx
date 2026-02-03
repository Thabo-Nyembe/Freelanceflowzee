'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Heart, Shield, Plane, GraduationCap, DollarSign, TrendingUp, Users, CheckCircle } from 'lucide-react'

const myBenefits = {
  healthInsurance: {
    plan: 'Premium Health Plus',
    coverage: 'Family',
    premium: 450,
    employerContribution: 80,
    deductible: 1500,
    deductibleMet: 800,
  },
  retirement: {
    plan: '401(k)',
    contribution: 6,
    employerMatch: 4,
    balance: 45000,
    ytdContribution: 4500,
  },
  pto: {
    vacation: { total: 20, used: 8, remaining: 12 },
    sick: { total: 10, used: 2, remaining: 8 },
    personal: { total: 5, used: 1, remaining: 4 },
  },
}

const availableBenefits = [
  { id: 1, name: 'Health Insurance', category: 'Health', description: 'Medical, dental, and vision coverage', icon: '🏥', enrolled: true, cost: '$450/mo' },
  { id: 2, name: '401(k) Retirement Plan', category: 'Financial', description: 'Up to 4% employer match', icon: '💰', enrolled: true, cost: '6% salary' },
  { id: 3, name: 'Life Insurance', category: 'Insurance', description: '2x annual salary coverage', icon: '🛡️', enrolled: true, cost: 'Free' },
  { id: 4, name: 'Flexible Spending Account', category: 'Health', description: 'Pre-tax healthcare expenses', icon: '💳', enrolled: false, cost: 'Variable' },
  { id: 5, name: 'Commuter Benefits', category: 'Transportation', description: 'Pre-tax transit expenses', icon: '🚇', enrolled: true, cost: '$150/mo' },
  { id: 6, name: 'Wellness Program', category: 'Health', description: 'Gym membership & wellness activities', icon: '🏃', enrolled: true, cost: 'Free' },
  { id: 7, name: 'Learning & Development', category: 'Education', description: '$2,000 annual budget', icon: '📚', enrolled: true, cost: 'Free' },
  { id: 8, name: 'Employee Assistance Program', category: 'Support', description: 'Counseling and support services', icon: '💬', enrolled: true, cost: 'Free' },
]

const upcomingEnrollment = {
  period: 'Annual Open Enrollment',
  startDate: '2024-11-01',
  endDate: '2024-11-30',
  daysRemaining: 270,
}

export default function BenefitsClient() {
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    enrolled: availableBenefits.filter(b => b.enrolled).length,
    totalBenefits: availableBenefits.length,
    vacationDays: myBenefits.pto.vacation.remaining,
    retirementBalance: myBenefits.retirement.balance,
  }), [])

  const categories = ['all', ...new Set(availableBenefits.map(b => b.category))]

  const filteredBenefits = useMemo(() => availableBenefits.filter(b =>
    categoryFilter === 'all' || b.category === categoryFilter
  ), [categoryFilter])

  const insights = [
    { icon: Heart, title: `${stats.enrolled}/${stats.totalBenefits}`, description: 'Benefits enrolled' },
    { icon: Plane, title: `${stats.vacationDays}`, description: 'Vacation days left' },
    { icon: DollarSign, title: `$${stats.retirementBalance.toLocaleString()}`, description: '401(k) balance' },
    { icon: TrendingUp, title: `${myBenefits.retirement.employerMatch}%`, description: 'Employer match' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Heart className="h-8 w-8 text-primary" />Benefits</h1>
          <p className="text-muted-foreground mt-1">Manage your employee benefits and coverage</p>
        </div>
      </div>

      <CollapsibleInsightsPanel title="Benefits Overview" insights={insights} defaultExpanded={true} />

      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold mb-1">{upcomingEnrollment.period}</h3>
              <p className="text-sm text-muted-foreground">
                {upcomingEnrollment.startDate} - {upcomingEnrollment.endDate}
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-700">{upcomingEnrollment.daysRemaining} days</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="coverage">
        <TabsList>
          <TabsTrigger value="coverage">My Coverage</TabsTrigger>
          <TabsTrigger value="all">All Benefits</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="coverage" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Health Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{myBenefits.healthInsurance.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Coverage:</span>
                  <span className="font-medium">{myBenefits.healthInsurance.coverage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Monthly Premium:</span>
                  <span className="font-medium">${myBenefits.healthInsurance.premium}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employer Contribution:</span>
                  <span className="font-medium text-green-600">{myBenefits.healthInsurance.employerContribution}%</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Deductible Met:</span>
                    <span className="font-medium">${myBenefits.healthInsurance.deductibleMet} / ${myBenefits.healthInsurance.deductible}</span>
                  </div>
                  <Progress value={(myBenefits.healthInsurance.deductibleMet / myBenefits.healthInsurance.deductible) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">401(k) Retirement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plan:</span>
                  <span className="font-medium">{myBenefits.retirement.plan}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Your Contribution:</span>
                  <span className="font-medium">{myBenefits.retirement.contribution}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Employer Match:</span>
                  <span className="font-medium text-green-600">{myBenefits.retirement.employerMatch}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <span className="font-bold text-lg">${myBenefits.retirement.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">YTD Contribution:</span>
                  <span className="font-medium">${myBenefits.retirement.ytdContribution.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <div className="flex gap-4 mb-4">
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBenefits.map((benefit) => (
              <Card key={benefit.id} className={benefit.enrolled ? 'border-blue-200' : ''}>
                <CardContent className="p-4">
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{benefit.name}</h4>
                    {benefit.enrolled && <Badge className="bg-green-100 text-green-700">Enrolled</Badge>}
                  </div>
                  <Badge variant="outline" className="mb-2">{benefit.category}</Badge>
                  <p className="text-sm text-muted-foreground mb-3">{benefit.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{benefit.cost}</span>
                    {!benefit.enrolled && (
                      <Button size="sm" variant="outline">Enroll</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="time-off" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Vacation Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold">{myBenefits.pto.vacation.remaining}</p>
                  <p className="text-sm text-muted-foreground">days remaining</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{myBenefits.pto.vacation.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span>{myBenefits.pto.vacation.used}</span>
                  </div>
                  <Progress value={(myBenefits.pto.vacation.used / myBenefits.pto.vacation.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Sick Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold">{myBenefits.pto.sick.remaining}</p>
                  <p className="text-sm text-muted-foreground">days remaining</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{myBenefits.pto.sick.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span>{myBenefits.pto.sick.used}</span>
                  </div>
                  <Progress value={(myBenefits.pto.sick.used / myBenefits.pto.sick.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personal Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <p className="text-4xl font-bold">{myBenefits.pto.personal.remaining}</p>
                  <p className="text-sm text-muted-foreground">days remaining</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{myBenefits.pto.personal.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Used:</span>
                    <span>{myBenefits.pto.personal.used}</span>
                  </div>
                  <Progress value={(myBenefits.pto.personal.used / myBenefits.pto.personal.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
