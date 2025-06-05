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
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-800">Active Projects</CardTitle>
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">Brand Identity Design</h4>
                      <p className="text-sm text-slate-500">Acme Corporation</p>
                    </div>
                    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">In Progress</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-800 font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2 bg-purple-100" />
                    <p className="text-xs text-slate-500">Due in 3 days</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-800">E-commerce Website</h4>
                      <p className="text-sm text-slate-500">Tech Startup Inc.</p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Review</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="text-slate-800 font-medium">90%</span>
                    </div>
                    <Progress value={90} className="h-2 bg-blue-100" />
                    <p className="text-xs text-slate-500">Due in 1 week</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50">
                <Clock className="h-4 w-4 mr-2" />
                Time Tracker
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-emerald-800">Escrow Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-light text-emerald-800 mb-2">$12,450</p>
                <p className="text-sm text-emerald-600">Protected funds</p>
                <Button size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50/50">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Payment received from Acme Corp</p>
                <p className="text-xs text-slate-500">2 hours ago</p>
              </div>
              <span className="text-sm font-semibold text-green-600">+$2,500</span>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50/50">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">New project milestone completed</p>
                <p className="text-xs text-slate-500">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-lg bg-slate-50/50">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Client feedback received</p>
                <p className="text-xs text-slate-500">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
