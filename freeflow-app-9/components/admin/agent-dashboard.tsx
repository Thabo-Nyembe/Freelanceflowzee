'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  AlertTriangle,
  Bot,
  Bug,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Shield,
  Brain,
  Target,
  TrendingUp,
  AlertCircle,
  Info
} from 'lucide-react'

// Agent Dashboard Component
export default function AgentDashboard() {
  const [agentStatuses, setAgentStatuses] = useState<any>({})
  const [systemHealth, setSystemHealth] = useState(95)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAgentStatuses()
    const interval = setInterval(loadAgentStatuses, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadAgentStatuses = async () => {
    try {
      // In real implementation, this would call the agent coordinator API
      const mockStatuses = {
        aiUpdate: {
          isActive: true,
          lastUpdate: new Date(),
          updateInterval: 21600000,
          nextUpdate: new Date(Date.now() + 18000000),
          modelsUpdated: 3,
          trendsAnalyzed: 5,
          featuresUpdated: 2
        },
        bugTesting: {
          isActive: true,
          testRunning: false,
          lastScan: new Date(),
          scanInterval: 1800000,
          nextScan: new Date(Date.now() + 1200000),
          bugsFound: 2,
          testsRun: 156,
          testsPassed: 148
        },
        coordinator: {
          isActive: true,
          lastCoordination: new Date(),
          registeredAgents: ['ai-update', 'bug-testing'],
          conflicts: 0
        }
      }

      setAgentStatuses(mockStatuses)
      setSystemHealth(calculateSystemHealth(mockStatuses))
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to load agent statuses:', error)
      setIsLoading(false)
    }
  }

  const calculateSystemHealth = (statuses: any): number => {
    let health = 100

    // Deduct for inactive agents
    if (!statuses.aiUpdate?.isActive) health -= 20
    if (!statuses.bugTesting?.isActive) health -= 20

    // Factor in test results
    const testFailureRate = statuses.bugTesting?.testsRun > 0
      ? ((statuses.bugTesting.testsRun - statuses.bugTesting.testsPassed) / statuses.bugTesting.testsRun) * 100
      : 0
    health -= testFailureRate

    // Factor in bugs
    health -= (statuses.bugTesting?.bugsFound || 0) * 5

    return Math.max(0, Math.min(100, health))
  }

  const handleAgentAction = async (agent: string, action: string) => {
    console.log(`${action} ${agent} agent`)
    // In real implementation, this would call the agent API
    await loadAgentStatuses()
  }

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-green-500'
    if (health >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getHealthBadgeVariant = (health: number) => {
    if (health >= 90) return 'default'
    if (health >= 70) return 'secondary'
    return 'destructive'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getHealthColor(systemHealth)}>{systemHealth}%</span>
            </div>
            <Progress value={systemHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Overall platform health score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agentStatuses.coordinator?.registeredAgents?.length || 0}
            </div>
            <div className="flex gap-1 mt-2">
              {agentStatuses.aiUpdate?.isActive && (
                <Badge variant="default" className="text-xs">AI Update</Badge>
              )}
              {agentStatuses.bugTesting?.isActive && (
                <Badge variant="default" className="text-xs">Bug Testing</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Automated agents running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(agentStatuses.aiUpdate?.modelsUpdated || 0) + (agentStatuses.bugTesting?.testsRun || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Models updated: {agentStatuses.aiUpdate?.modelsUpdated || 0}<br />
              Tests completed: {agentStatuses.bugTesting?.testsRun || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details */}
      <Tabs defaultValue="ai-update" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ai-update" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Update Agent
          </TabsTrigger>
          <TabsTrigger value="bug-testing" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Bug Testing Agent
          </TabsTrigger>
          <TabsTrigger value="coordinator" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Coordinator
          </TabsTrigger>
        </TabsList>

        {/* AI Update Agent */}
        <TabsContent value="ai-update">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Update Agent
                    <Badge variant={agentStatuses.aiUpdate?.isActive ? 'default' : 'secondary'}>
                      {agentStatuses.aiUpdate?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Keeps KAZI platform current with latest AI models and trends
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgentAction('ai-update', 'force-update')}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Force Update
                  </Button>
                  <Button
                    variant={agentStatuses.aiUpdate?.isActive ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleAgentAction('ai-update', agentStatuses.aiUpdate?.isActive ? 'pause' : 'resume')}
                  >
                    {agentStatuses.aiUpdate?.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Update</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.aiUpdate?.lastUpdate?.toLocaleString() || 'Never'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next Update</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.aiUpdate?.nextUpdate?.toLocaleString() || 'Not scheduled'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Models Updated</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.aiUpdate?.modelsUpdated || 0} today
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Trends Analyzed</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.aiUpdate?.trendsAnalyzed || 0} today
                  </p>
                </div>
              </div>

              {/* Recent Updates */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Updates</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    GPT-4 Turbo integrated successfully
                    <Badge variant="outline" className="text-xs">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Claude 3.5 Sonnet performance optimized
                    <Badge variant="outline" className="text-xs">4 hours ago</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-500" />
                    Midjourney V7 integration pending
                    <Badge variant="outline" className="text-xs">6 hours ago</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bug Testing Agent */}
        <TabsContent value="bug-testing">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5" />
                    Bug Testing Agent
                    <Badge variant={agentStatuses.bugTesting?.isActive ? 'default' : 'secondary'}>
                      {agentStatuses.bugTesting?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {agentStatuses.bugTesting?.testRunning && (
                      <Badge variant="outline" className="animate-pulse">Running Tests</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Comprehensive quality assurance and automated testing
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgentAction('bug-testing', 'emergency-diagnostic')}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Emergency Scan
                  </Button>
                  <Button
                    variant={agentStatuses.bugTesting?.isActive ? 'secondary' : 'default'}
                    size="sm"
                    onClick={() => handleAgentAction('bug-testing', agentStatuses.bugTesting?.isActive ? 'pause' : 'resume')}
                  >
                    {agentStatuses.bugTesting?.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Scan</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.bugTesting?.lastScan?.toLocaleString() || 'Never'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next Scan</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.bugTesting?.nextScan?.toLocaleString() || 'Not scheduled'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tests Run</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.bugTesting?.testsRun || 0} total
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Pass Rate</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.bugTesting?.testsRun > 0
                      ? Math.round((agentStatuses.bugTesting.testsPassed / agentStatuses.bugTesting.testsRun) * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h4 className="text-sm font-medium mb-2">Test Results</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Unit Tests</span>
                    <div className="flex items-center gap-2">
                      <Progress value={95} className="w-20" />
                      <span className="text-xs text-muted-foreground">45/47 passed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Integration Tests</span>
                    <div className="flex items-center gap-2">
                      <Progress value={89} className="w-20" />
                      <span className="text-xs text-muted-foreground">34/38 passed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">E2E Tests</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-xs text-muted-foreground">23/25 passed</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Issues */}
              <div>
                <h4 className="text-sm font-medium mb-2">Recent Issues</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    Memory leak detected in Video Studio
                    <Badge variant="outline" className="text-xs">Medium</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    API rate limiting issue resolved
                    <Badge variant="outline" className="text-xs">Fixed</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Coordinator */}
        <TabsContent value="coordinator">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Agent Coordinator
                    <Badge variant={agentStatuses.coordinator?.isActive ? 'default' : 'secondary'}>
                      {agentStatuses.coordinator?.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Orchestrates all automated agents for optimal performance
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAgentAction('coordinator', 'force-coordination')}
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Force Sync
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAgentAction('coordinator', 'emergency-stop')}
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Emergency Stop
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Coordination Status */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Last Coordination</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.coordinator?.lastCoordination?.toLocaleString() || 'Never'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Registered Agents</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.coordinator?.registeredAgents?.length || 0} active
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Conflicts</p>
                  <p className="text-xs text-muted-foreground">
                    {agentStatuses.coordinator?.conflicts || 0} detected
                  </p>
                </div>
              </div>

              {/* Agent Registry */}
              <div>
                <h4 className="text-sm font-medium mb-2">Agent Registry</h4>
                <div className="space-y-2">
                  {agentStatuses.coordinator?.registeredAgents?.map((agent: string) => (
                    <div key={agent} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        {agent === 'ai-update' ? <Brain className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
                        <span className="text-sm font-medium capitalize">{agent.replace('-', ' ')} Agent</span>
                      </div>
                      <Badge variant="default" className="text-xs">
                        {agent === 'ai-update' ? agentStatuses.aiUpdate?.isActive ? 'Active' : 'Inactive' :
                         agentStatuses.bugTesting?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Recommendations */}
              <div>
                <h4 className="text-sm font-medium mb-2">System Recommendations</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm">All agents are operating optimally. Continue monitoring for best performance.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}