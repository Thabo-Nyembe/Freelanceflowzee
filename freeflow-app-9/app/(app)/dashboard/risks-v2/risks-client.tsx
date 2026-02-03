'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import { ShieldAlert, Plus, Search, AlertTriangle, TrendingUp, CheckCircle, Clock, Users } from 'lucide-react'

const risks = [
  { id: 'RISK-001', title: 'Data Breach Risk', category: 'Security', severity: 'critical', probability: 'medium', impact: 'high', status: 'active', owner: 'CISO', mitigation: 'Implement enhanced encryption', lastAssessed: '2024-01-15' },
  { id: 'RISK-002', title: 'Supply Chain Disruption', category: 'Operations', severity: 'high', probability: 'medium', impact: 'high', status: 'active', owner: 'COO', mitigation: 'Diversify suppliers', lastAssessed: '2024-01-20' },
  { id: 'RISK-003', title: 'Regulatory Non-Compliance', category: 'Compliance', severity: 'high', probability: 'low', impact: 'critical', status: 'mitigating', owner: 'Legal', mitigation: 'Compliance audit program', lastAssessed: '2024-02-01' },
  { id: 'RISK-004', title: 'Key Personnel Loss', category: 'HR', severity: 'medium', probability: 'medium', impact: 'medium', status: 'active', owner: 'CHRO', mitigation: 'Succession planning', lastAssessed: '2024-01-25' },
  { id: 'RISK-005', title: 'Market Competition', category: 'Business', severity: 'medium', probability: 'high', impact: 'medium', status: 'accepted', owner: 'CEO', mitigation: 'Innovation strategy', lastAssessed: '2024-01-10' },
  { id: 'RISK-006', title: 'Technology Obsolescence', category: 'Technology', severity: 'low', probability: 'medium', impact: 'medium', status: 'mitigating', owner: 'CTO', mitigation: 'Tech modernization plan', lastAssessed: '2024-01-30' },
]

const riskMatrix = [
  { severity: 'Critical', count: 5, color: 'bg-red-100 text-red-700' },
  { severity: 'High', count: 12, color: 'bg-orange-100 text-orange-700' },
  { severity: 'Medium', count: 18, color: 'bg-yellow-100 text-yellow-700' },
  { severity: 'Low', count: 8, color: 'bg-green-100 text-green-700' },
]

const mitigationActions = [
  { risk: 'RISK-001', action: 'Deploy MFA across all systems', status: 'in-progress', dueDate: '2024-03-01', progress: 75 },
  { risk: 'RISK-003', action: 'Complete GDPR compliance audit', status: 'pending', dueDate: '2024-04-15', progress: 30 },
  { risk: 'RISK-006', action: 'Upgrade legacy systems', status: 'in-progress', dueDate: '2024-06-30', progress: 45 },
]

const recentAssessments = [
  { risk: 'RISK-003', title: 'Regulatory Non-Compliance', assessor: 'Legal Team', date: '2024-02-01', result: 'High Risk' },
  { risk: 'RISK-006', title: 'Technology Obsolescence', assessor: 'CTO', date: '2024-01-30', result: 'Low Risk' },
  { risk: 'RISK-004', title: 'Key Personnel Loss', assessor: 'CHRO', date: '2024-01-25', result: 'Medium Risk' },
]

export default function RisksClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const stats = useMemo(() => ({
    total: risks.length,
    critical: risks.filter(r => r.severity === 'critical').length,
    high: risks.filter(r => r.severity === 'high').length,
    mitigating: risks.filter(r => r.status === 'mitigating').length,
  }), [])

  const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-100 text-red-700',
      high: 'bg-orange-100 text-orange-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[severity]}>{severity}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-red-100 text-red-700',
      mitigating: 'bg-blue-100 text-blue-700',
      accepted: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
    }
    return <Badge className={styles[status]}>{status}</Badge>
  }

  const filteredRisks = useMemo(() => {
    return risks.filter(r => 
      (categoryFilter === 'all' || r.category === categoryFilter) &&
      (r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       r.id.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, categoryFilter])

  const insights = [
    { icon: ShieldAlert, title: `${stats.total}`, description: 'Total risks' },
    { icon: AlertTriangle, title: `${stats.critical}`, description: 'Critical' },
    { icon: TrendingUp, title: `${stats.high}`, description: 'High severity' },
    { icon: CheckCircle, title: `${stats.mitigating}`, description: 'Being mitigated' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><ShieldAlert className="h-8 w-8 text-primary" />Risk Management</h1>
          <p className="text-muted-foreground mt-1">Identify, assess, and mitigate organizational risks</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Register Risk</Button>
      </div>

      <CollapsibleInsightsPanel title="Risk Overview" insights={insights} defaultExpanded={true} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {riskMatrix.map((item) => (
          <Card key={item.severity} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Badge className={item.color}>{item.severity}</Badge>
              <p className="text-3xl font-bold mt-2">{item.count}</p>
              <p className="text-xs text-muted-foreground">Risks</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="risks">
        <TabsList>
          <TabsTrigger value="risks">Risk Register</TabsTrigger>
          <TabsTrigger value="mitigation">Mitigation Actions</TabsTrigger>
          <TabsTrigger value="assessments">Recent Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="risks" className="mt-4 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search risks..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <select className="border rounded-md px-3 py-2" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="Security">Security</option>
              <option value="Operations">Operations</option>
              <option value="Compliance">Compliance</option>
              <option value="HR">HR</option>
              <option value="Business">Business</option>
              <option value="Technology">Technology</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredRisks.map((risk) => (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{risk.id}</Badge>
                        <h4 className="font-semibold">{risk.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{risk.category}</span>
                        <span>•</span>
                        <span>Owner: {risk.owner}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(risk.severity)}
                      {getStatusBadge(risk.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                    <div>
                      <p className="text-muted-foreground">Probability</p>
                      <p className="font-medium capitalize">{risk.probability}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impact</p>
                      <p className="font-medium capitalize">{risk.impact}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Last Assessed</p>
                      <p className="font-medium">{risk.lastAssessed}</p>
                    </div>
                  </div>

                  <div className="text-sm mb-2">
                    <p className="text-muted-foreground">Mitigation Strategy:</p>
                    <p className="font-medium">{risk.mitigation}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">View Details</Button>
                    <Button size="sm" variant="outline" className="flex-1">Update Assessment</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mitigation" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Mitigation Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mitigationActions.map((action, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-1">{action.risk}</Badge>
                        <h4 className="font-semibold">{action.action}</h4>
                      </div>
                      {getStatusBadge(action.status as any)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{action.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${action.progress}%` }}></div>
                      </div>
                      <p className="text-sm text-muted-foreground">Due: {action.dueDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Risk Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentAssessments.map((assessment, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-1">{assessment.risk}</Badge>
                        <h4 className="font-semibold">{assessment.title}</h4>
                      </div>
                      <Badge className={
                        assessment.result.includes('High') ? 'bg-red-100 text-red-700' :
                        assessment.result.includes('Medium') ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }>{assessment.result}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Assessed by: {assessment.assessor}</span>
                      <span>{assessment.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
