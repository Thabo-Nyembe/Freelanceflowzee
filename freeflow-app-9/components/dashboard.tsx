"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, CheckCircle, Clock, Plus, ArrowUpRight, Star } from "lucide-react"

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-light text-slate-800 mb-4">
          Good morning,{" "}
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            John
          </span>
        </h1>
        <p className="text-lg text-slate-500">Ready to create something extraordinary today?</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600 mb-1">Total Earnings</p>
                <p className="text-3xl font-light text-emerald-800">$47,250</p>
                <p className="text-xs text-emerald-500 flex items-center mt-2">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Active Projects</p>
                <p className="text-3xl font-light text-blue-800">8</p>
                <p className="text-xs text-blue-500 flex items-center mt-2">
                  <Clock className="h-3 w-3 mr-1" />3 due this week
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Completed</p>
                <p className="text-3xl font-light text-purple-800">24</p>
                <p className="text-xs text-purple-500 flex items-center mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  This quarter
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600 mb-1">Client Rating</p>
                <p className="text-3xl font-light text-amber-800">4.9</p>
                <p className="text-xs text-amber-500 flex items-center mt-2">
                  <Star className="h-3 w-3 mr-1" />
                  127 reviews
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-8">
        {/* Active Projects */}
        <div className="col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-semibold text-slate-800">Active Projects</CardTitle>
                <Button variant="outline" size="sm" className="text-slate-600">
                  <Plus className="h-4 w-4 mr-1" />
                  New Project
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">Brand Identity Design</h3>
                      <p className="text-sm text-slate-500">Acme Corporation</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-800 font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Due in 5 days
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">JD</div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">AM</div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">TN</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">Website Redesign</h3>
                      <p className="text-sm text-slate-500">Tech Startup Inc.</p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">Review</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-800 font-medium">90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Due tomorrow
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs">TN</div>
                      <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs">KL</div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-200/50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-slate-800">Mobile App Development</h3>
                      <p className="text-sm text-slate-500">Health & Fitness Co.</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-800 font-medium">40%</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="mt-4 flex justify-between items-center text-sm">
                    <div className="flex items-center text-slate-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      Due in 2 weeks
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">JD</div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">AM</div>
                      <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">SR</div>
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs">+2</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-slate-600">
                  View All Projects
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="col-span-1">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-slate-800">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Payment Received</p>
                    <p className="text-sm text-slate-500">$2,500 from Acme Corporation</p>
                    <p className="text-xs text-slate-400 mt-1">Today, 9:32 AM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">Project Completed</p>
                    <p className="text-sm text-slate-500">E-commerce Website Design</p>
                    <p className="text-xs text-slate-400 mt-1">Yesterday, 4:15 PM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <ArrowUpRight className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">New Project</p>
                    <p className="text-sm text-slate-500">Mobile App Development</p>
                    <p className="text-xs text-slate-400 mt-1">Yesterday, 11:30 AM</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Star className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">New Review</p>
                    <p className="text-sm text-slate-500">5-star rating from Tech Startup Inc.</p>
                    <p className="text-xs text-slate-400 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <Button variant="ghost" className="text-slate-600">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
