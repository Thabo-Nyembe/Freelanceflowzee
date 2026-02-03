'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { Award, CheckCircle, Clock, Calendar, AlertCircle, TrendingUp, Users, FileCheck } from 'lucide-react'

const certifications = [
  { id: 1, name: 'AWS Solutions Architect', employee: 'Sarah Mitchell', department: 'Engineering', status: 'active', issueDate: '2024-01-15', expiryDate: '2027-01-15', provider: 'Amazon Web Services', cost: 300 },
  { id: 2, name: 'PMP Certification', employee: 'Michael Chen', department: 'Product', status: 'expiring-soon', issueDate: '2021-03-20', expiryDate: '2024-03-20', provider: 'PMI', cost: 555 },
  { id: 3, name: 'Google Cloud Professional', employee: 'Emily Rodriguez', department: 'Engineering', status: 'active', issueDate: '2023-06-10', expiryDate: '2025-06-10', provider: 'Google', cost: 200 },
  { id: 4, name: 'Certified Scrum Master', employee: 'David Park', department: 'Product', status: 'in-progress', issueDate: '', expiryDate: '', provider: 'Scrum Alliance', cost: 400 },
  { id: 5, name: 'CISSP Security', employee: 'Jessica Lee', department: 'Security', status: 'expired', issueDate: '2020-09-15', expiryDate: '2023-09-15', provider: 'ISC2', cost: 700 },
]

const upcomingRenewals = [
  { name: 'PMP Certification', employee: 'Michael Chen', daysUntil: 30, cost: 150 },
  { name: 'ITIL Foundation', employee: 'Robert Williams', daysUntil: 45, cost: 350 },
  { name: 'Azure Administrator', employee: 'Amanda Taylor', daysUntil: 60, cost: 165 },
]

const certificationProviders = [
  { name: 'AWS', count: 8, color: 'bg-orange-100 text-orange-700' },
  { name: 'Google Cloud', count: 5, color: 'bg-blue-100 text-blue-700' },
  { name: 'Microsoft', count: 6, color: 'bg-green-100 text-green-700' },
  { name: 'PMI', count: 4, color: 'bg-purple-100 text-purple-700' },
]

const departmentStats = [
  { department: 'Engineering', active: 12, expiring: 2, total: 15 },
  { department: 'Product', active: 8, expiring: 3, total: 11 },
  { department: 'Security', active: 6, expiring: 1, total: 8 },
  { department: 'Marketing', active: 4, expiring: 0, total: 5 },
]

export default function CertificationsClient() {
  const [filter, setFilter] = useState('all')

  const stats = useMemo(() => ({
    total: certifications.length,
    active: certifications.filter(c => c.status === 'active').length,
    expiringSoon: certifications.filter(c => c.status === 'expiring-soon').length,
    inProgress: certifications.filter(c => c.status === 'in-progress').length,
  }), [])

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'active': 'bg-green-100 text-green-700',
      'expiring-soon': 'bg-yellow-100 text-yellow-700',
      'expired': 'bg-red-100 text-red-700',
      'in-progress': 'bg-blue-100 text-blue-700',
    }
    return <Badge className={styles[status]}>{status.replace('-', ' ')}</Badge>
  }

  const filteredCertifications = useMemo(() => {
    if (filter === 'all') return certifications
    return certifications.filter(c => c.status === filter)
  }, [filter])

  const insights = [
    { icon: Award, title: `${stats.total}`, description: 'Total certifications' },
    { icon: CheckCircle, title: `${stats.active}`, description: 'Active' },
    { icon: AlertCircle, title: `${stats.expiringSoon}`, description: 'Expiring soon' },
    { icon: Clock, title: `${stats.inProgress}`, description: 'In progress' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><Award className="h-8 w-8 text-primary" />Certifications Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage employee certifications</p>
        </div>
        <Button><Award className="h-4 w-4 mr-2" />Add Certification</Button>
      </div>

      <CollapsibleInsightsPanel title="Certifications Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {certificationProviders.map((provider) => (
          <Card key={provider.name} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <Badge className={provider.color}>{provider.name}</Badge>
              <p className="text-2xl font-bold mt-2">{provider.count}</p>
              <p className="text-xs text-muted-foreground">Certifications</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">All Certifications</h3>
              <div className="flex gap-2">
                <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All</Button>
                <Button variant={filter === 'active' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('active')}>Active</Button>
                <Button variant={filter === 'expiring-soon' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('expiring-soon')}>Expiring</Button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCertifications.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cert.employee}`} />
                          <AvatarFallback>{cert.employee.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">{cert.name}</h4>
                          <p className="text-sm text-muted-foreground">{cert.employee} • {cert.department}</p>
                        </div>
                      </div>
                      {getStatusBadge(cert.status)}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Provider</p>
                        <p className="font-medium">{cert.provider}</p>
                      </div>
                      {cert.issueDate && (
                        <div>
                          <p className="text-muted-foreground">Issue Date</p>
                          <p className="font-medium">{cert.issueDate}</p>
                        </div>
                      )}
                      {cert.expiryDate && (
                        <div>
                          <p className="text-muted-foreground">Expiry Date</p>
                          <p className="font-medium">{cert.expiryDate}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Cost</p>
                        <p className="font-medium">${cert.cost}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                      {cert.status === 'expiring-soon' && (
                        <Button size="sm" className="flex-1">Renew</Button>
                      )}
                    </div>
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
                <Calendar className="h-4 w-4" />
                Upcoming Renewals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingRenewals.map((renewal, index) => (
                  <div key={index} className="pb-3 border-b last:border-0 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{renewal.name}</p>
                        <p className="text-xs text-muted-foreground">{renewal.employee}</p>
                      </div>
                      <Badge variant="outline">{renewal.daysUntil}d</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Cost: ${renewal.cost}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                By Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-sm">{dept.department}</span>
                      <span className="text-sm text-muted-foreground">{dept.active}/{dept.total}</span>
                    </div>
                    <Progress value={(dept.active / dept.total) * 100} className="h-2" />
                    {dept.expiring > 0 && (
                      <p className="text-xs text-yellow-600 mt-1">{dept.expiring} expiring soon</p>
                    )}
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
