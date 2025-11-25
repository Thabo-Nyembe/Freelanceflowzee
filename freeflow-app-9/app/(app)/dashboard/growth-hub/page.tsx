'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Zap,
  Briefcase,
  Rocket,
  BarChart3,
  Lightbulb,
  MessageSquare,
  Clock,
  Award
} from 'lucide-react'

export default function GrowthHubPage() {
  const [activeGoal, setActiveGoal] = useState<string>('monetize')

  // Growth goals for different user types
  const growthGoals = [
    {
      id: 'monetize',
      title: 'Monetize',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Turn your skills into revenue',
      color: 'from-green-500 to-emerald-600',
      features: [
        'Pricing strategy optimization',
        'Package & productization',
        'Revenue stream diversification',
        'Value-based pricing calculator'
      ]
    },
    {
      id: 'acquire',
      title: 'Acquire Clients',
      icon: <Users className="w-5 h-5" />,
      description: 'Systematic client acquisition',
      color: 'from-blue-500 to-cyan-600',
      features: [
        'Cold outreach campaigns',
        'LinkedIn automation strategy',
        'Referral system builder',
        'Lead magnet ideas'
      ]
    },
    {
      id: 'scale',
      title: 'Scale Operations',
      icon: <TrendingUp className="w-5 h-5" />,
      description: 'Grow beyond solo capacity',
      color: 'from-purple-500 to-violet-600',
      features: [
        'Team building roadmap',
        'Delegation framework',
        'Productized service design',
        'Systems & automation'
      ]
    },
    {
      id: 'optimize',
      title: 'Optimize',
      icon: <Zap className="w-5 h-5" />,
      description: 'Maximum efficiency & profit',
      color: 'from-orange-500 to-red-600',
      features: [
        'Workflow optimization',
        'Time blocking strategies',
        'Profit margin analysis',
        'Capacity planning'
      ]
    }
  ]

  // User type specific strategies
  const userTypes = [
    {
      type: 'Freelancers',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-700',
      quickWins: [
        'Increase rates by 30% in 90 days',
        'Build 3-tier service packages',
        'Create email templates for common tasks',
        'Implement time tracking & reporting'
      ],
      challenges: [
        'Feast or famine income',
        'Trading time for money',
        'Limited scalability',
        'Client acquisition'
      ]
    },
    {
      type: 'Entrepreneurs',
      icon: <Rocket className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-700',
      quickWins: [
        'Validate MVP with 10 customers',
        'Create growth funnel',
        'Build founding team',
        'Secure first $10K MRR'
      ],
      challenges: [
        'Product-market fit',
        'Scaling customer acquisition',
        'Funding & cash flow',
        'Team building'
      ]
    },
    {
      type: 'Startups',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-green-100 text-green-700',
      quickWins: [
        'Optimize conversion funnel',
        'Reduce CAC by 40%',
        'Increase LTV 2x',
        'Build investor pitch deck'
      ],
      challenges: [
        'Achieving product-market fit',
        'Scaling efficiently',
        'Fundraising',
        'Competitive differentiation'
      ]
    },
    {
      type: 'Enterprises',
      icon: <Award className="w-6 h-6" />,
      color: 'bg-indigo-100 text-indigo-700',
      quickWins: [
        'Digital transformation roadmap',
        'Process optimization (20% efficiency)',
        'Innovation framework',
        'Market expansion strategy'
      ],
      challenges: [
        'Innovation vs bureaucracy',
        'Legacy system modernization',
        'Agile transformation',
        'Talent retention'
      ]
    },
    {
      type: 'Creatives',
      icon: <Lightbulb className="w-6 h-6" />,
      color: 'bg-pink-100 text-pink-700',
      quickWins: [
        'Portfolio positioning strategy',
        'Premium pricing justification',
        'Creative brief templates',
        'Client onboarding system'
      ],
      challenges: [
        'Undercharging for work',
        'Scope creep management',
        'Work-life balance',
        'Finding ideal clients'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
            <Rocket className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Growth Hub</h1>
            <p className="text-gray-600 mt-1">
              AI-powered strategies to monetize, scale, and reach your fullest potential
            </p>
          </div>
        </div>

        {/* Growth Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue Growth</p>
                  <p className="text-2xl font-bold text-gray-900">+127%</p>
                  <p className="text-xs text-green-600 mt-1">vs last quarter</p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-xs text-blue-600 mt-1">+8 this month</p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Project Value</p>
                  <p className="text-2xl font-bold text-gray-900">$4,850</p>
                  <p className="text-xs text-purple-600 mt-1">+45% increase</p>
                </div>
                <DollarSign className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Efficiency Score</p>
                  <p className="text-2xl font-bold text-gray-900">87%</p>
                  <p className="text-xs text-orange-600 mt-1">Excellent</p>
                </div>
                <Zap className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" />
            Growth Goals
          </TabsTrigger>
          <TabsTrigger value="strategies">
            <Lightbulb className="w-4 h-4 mr-2" />
            Strategies by Type
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Zap className="w-4 h-4 mr-2" />
            AI Growth Tools
          </TabsTrigger>
        </TabsList>

        {/* Growth Goals Tab */}
        <TabsContent value="goals" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {growthGoals.map((goal) => (
              <Card
                key={goal.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  activeGoal === goal.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setActiveGoal(goal.id)}
              >
                <CardHeader>
                  <div className={`p-3 bg-gradient-to-r ${goal.color} rounded-lg w-fit mb-3`}>
                    {goal.icon}
                  </div>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <p className="text-sm text-gray-600">{goal.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {goal.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-4" variant="outline">
                    Start {goal.title} Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Center */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🎯 Your Next Actions (Personalized)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">💰 This Week: Increase Rates</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Implement 20% rate increase for new clients. Template email ready.
                  </p>
                  <Button size="sm" className="w-full">View Email Template</Button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📧 This Month: Outreach</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Launch LinkedIn outreach to 50 ideal prospects. Scripts ready.
                  </p>
                  <Button size="sm" className="w-full">Get Campaign</Button>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">⚡ This Quarter: Scale</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Hire first VA to handle admin. Job description + training plan ready.
                  </p>
                  <Button size="sm" className="w-full">View Roadmap</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Strategies by User Type */}
        <TabsContent value="strategies" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTypes.map((userType, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className={`p-3 ${userType.color} rounded-lg w-fit mb-3`}>
                    {userType.icon}
                  </div>
                  <CardTitle>{userType.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-green-700">✨ Quick Wins</h4>
                    <ul className="space-y-1">
                      {userType.quickWins.map((win, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">•</span>
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-700">⚠️ Common Challenges</h4>
                    <ul className="space-y-1">
                      {userType.challenges.map((challenge, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-orange-600 mt-0.5">•</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full mt-4">
                    Get {userType.type} Playbook
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success Stories */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🏆 Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Sarah K.</p>
                      <p className="text-sm text-gray-600">Freelance Designer</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Used Kazi AI to increase my rates from $50/hr to $150/hr in 3 months. Revenue 3x!"
                  </p>
                  <p className="text-xs text-green-600 font-semibold">Revenue: $2K → $6K/month</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Mike T.</p>
                      <p className="text-sm text-gray-600">SaaS Founder</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Kazi's growth roadmap helped us hit $10K MRR in 6 months. Now at $50K!"
                  </p>
                  <p className="text-xs text-green-600 font-semibold">MRR: $0 → $50K in 12 months</p>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Alex R.</p>
                      <p className="text-sm text-gray-600">Creative Agency</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    "Workflow optimization saved 15 hours/week. Took on 5 more clients!"
                  </p>
                  <p className="text-xs text-green-600 font-semibold">Capacity: +50%, Revenue: +80%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Growth Tools */}
        <TabsContent value="tools" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tool Cards */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle>Pricing Optimizer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  AI analyzes your market, experience, and skills to recommend optimal pricing that maximizes revenue without losing clients.
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Market rate comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    3-tier package structure
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    Rate increase timeline
                  </li>
                </ul>
                <Button className="w-full">Optimize My Pricing</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <CardTitle>Client Acquisition Machine</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Generate complete outreach campaigns with email templates, LinkedIn strategies, and referral systems.
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Cold email sequences
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    LinkedIn automation
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-600">✓</span>
                    Referral program builder
                  </li>
                </ul>
                <Button className="w-full">Build Campaign</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <CardTitle>Growth Roadmap Generator</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Create detailed month-by-month growth plans from current revenue to your target goal.
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    Monthly milestones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    Action items per phase
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-purple-600">✓</span>
                    Resource requirements
                  </li>
                </ul>
                <Button className="w-full">Create Roadmap</Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <CardTitle>Workflow Optimizer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  AI identifies bottlenecks and suggests optimizations to save 20-30% of your time.
                </p>
                <ul className="text-sm space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span>
                    Bottleneck analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span>
                    Automation opportunities
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-600">✓</span>
                    Time-saving tactics
                  </li>
                </ul>
                <Button className="w-full">Optimize Workflow</Button>
              </CardContent>
            </Card>
          </div>

          {/* AI Insights */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI-Powered Insights (Real-time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Lightbulb className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 mb-1">Opportunity Detected</p>
                      <p className="text-sm text-gray-700">
                        Your average project value increased 45% this quarter. Consider raising rates for new clients by 30% - you have the data to justify it!
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">View Pricing Strategy</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900 mb-1">Goal Milestone Reached</p>
                      <p className="text-sm text-gray-700">
                        You're 80% toward your Q4 revenue goal! Keep momentum with 2 more client closes this month.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">Get Outreach Templates</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-900 mb-1">Efficiency Optimization</p>
                      <p className="text-sm text-gray-700">
                        You spent 12 hours on admin this week. AI found 3 automation opportunities that could save 8 hours/week.
                      </p>
                      <Button size="sm" variant="outline" className="mt-2">View Optimizations</Button>
                    </div>
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
