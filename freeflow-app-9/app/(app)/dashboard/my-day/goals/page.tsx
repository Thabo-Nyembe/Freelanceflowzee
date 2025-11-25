'use client'

import { useReducer } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Target, Calendar, BarChart3, CheckCircle, Timer, MessageSquare, Lightbulb } from 'lucide-react'

// MY DAY UTILITIES
import {
  taskReducer,
  initialTaskState,
  calculateMetrics
} from '@/lib/my-day-utils'

export default function GoalsPage() {
  const [state] = useReducer(taskReducer, initialTaskState)
  const { focusHours, focusMinutes } = calculateMetrics(state)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Goals Tracking</h2>
        <p className="text-gray-600">
          Monitor your progress and achieve your objectives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goals */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Goal 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Complete 5 tasks</p>
                <p className="text-sm text-gray-600">Current: 1/5 completed</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>
            </div>

            {/* Goal 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Timer className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">6 hours of focus time</p>
                <p className="text-sm text-gray-600">Current: {focusHours}h {focusMinutes}m / 6h</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min((state.totalFocusTime / 360) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Goal 3 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">2 client check-ins</p>
                <p className="text-sm text-gray-600">Current: 0/2 completed</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Goals */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Week Goal 1 */}
            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Finish TechCorp milestone</p>
                <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300 text-xs">
                  In Progress
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Complete all logo variations and documentation</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">75% complete - 2 days remaining</p>
            </div>

            {/* Week Goal 2 */}
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Client presentation prep</p>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300 text-xs">
                  Pending
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Prepare slides and demo materials</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">30% complete - 4 days remaining</p>
            </div>

            {/* Week Goal 3 */}
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">Portfolio update</p>
                <Badge variant="outline" className="bg-teal-100 text-teal-700 border-teal-300 text-xs">
                  On Track
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">Add 3 new case studies</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-teal-600 h-2 rounded-full" style={{ width: '66%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">2/3 case studies added</p>
            </div>
          </CardContent>
        </Card>

        {/* Goal Analytics */}
        <Card className="bg-white/70 backdrop-blur-sm border-white/40 shadow-lg md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Goal Achievement Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Overall Achievement */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Overall Achievement</p>
                <p className="text-4xl font-bold text-purple-700">87%</p>
                <p className="text-xs text-gray-500 mt-1">Weekly average</p>
              </div>

              {/* Daily Goals */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Daily Goals</p>
                <p className="text-4xl font-bold text-blue-700">92%</p>
                <p className="text-xs text-gray-500 mt-1">Success rate</p>
              </div>

              {/* Weekly Goals */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Weekly Goals</p>
                <p className="text-4xl font-bold text-green-700">82%</p>
                <p className="text-xs text-gray-500 mt-1">Completion rate</p>
              </div>
            </div>

            {/* Streak Tracking */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
              <h4 className="font-semibold text-gray-900 mb-3">Current Streaks</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">12</p>
                  <p className="text-xs text-gray-600">Daily tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">8</p>
                  <p className="text-xs text-gray-600">Focus hours</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">5</p>
                  <p className="text-xs text-gray-600">Client updates</p>
                </div>
              </div>
            </div>

            {/* Category Performance */}
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">Performance by Category</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Productivity</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Communication</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Learning</span>
                    <span className="font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Goal Suggestions */}
            <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                AI Goal Suggestions
              </h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <p className="text-sm text-indigo-700">Based on your velocity, you could add a stretch goal: "Ship one feature early this week"</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-indigo-600">•</span>
                  <p className="text-sm text-indigo-700">Your productivity peaks in mornings - schedule important goals between 9-11 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
