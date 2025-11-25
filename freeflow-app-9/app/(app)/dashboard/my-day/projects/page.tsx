'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, TrendingUp, Brain, CheckCircle, Activity } from 'lucide-react'

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Active Projects</h2>
        <p className="text-gray-600">
          Track progress and manage your project portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Projects */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Project 1 */}
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">TechCorp Branding</h4>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  On Track
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Complete logo design and brand guidelines</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Tasks today: 2</span>
                  <span>Due: 3 days</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                    High Priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Velocity: 85%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Portfolio Redesign</h4>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  At Risk
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Modernize portfolio with new case studies</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Tasks today: 1</span>
                  <span>Due: 1 week</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                    Medium Priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Velocity: 72%
                  </Badge>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="p-4 rounded-xl border border-green-200 bg-green-50">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">Client Dashboard</h4>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  Ahead
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">Build custom analytics dashboard</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>Tasks today: 1</span>
                  <span>Due: 5 days</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                    Low Priority
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Velocity: 95%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Insights */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Project Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Velocity Metrics */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Team Velocity</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">TechCorp Branding</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">85%</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Portfolio Redesign</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">72%</span>
                    <Activity className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Client Dashboard</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">95%</span>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resource Allocation */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Resource Allocation</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Design</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Development</span>
                    <span className="font-medium">30%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Communication</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Recommendation
              </h4>
              <p className="text-sm text-purple-700 mb-3">
                Focus on TechCorp Branding this week to maintain momentum. Portfolio Redesign needs attention - consider allocating 2 more hours today.
              </p>
              <Button variant="outline" size="sm" className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-100">
                <CheckCircle className="h-3 w-3" />
                Apply Recommendation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
