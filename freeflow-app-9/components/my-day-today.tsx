"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Calendar,
  Clock,
  Coffee,
  FileText,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Video,
  Zap,
  CheckCircle,
  BrainCircuit,
  Bell,
  Mail,
  Plus,
  X,
  Send,
} from "lucide-react"

export function MyDayToday() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReminderForm, setShowReminderForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [reminders, setReminders] = useState([
    { id: 1, title: "Follow up with Acme Corp", time: "2:00 PM", priority: "high" },
    { id: 2, title: "Send invoice to Tech Startup", time: "4:30 PM", priority: "medium" },
    { id: 3, title: "Review brand guidelines", time: "Tomorrow 9:00 AM", priority: "low" },
  ])

  const refreshPlan = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">My Day Today</h2>
          <p className="text-lg text-slate-500 mt-1">AI-powered daily planning and insights</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => setShowEmailForm(true)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Integration
          </Button>
          <Button
            onClick={refreshPlan}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Refresh Plan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AI Assistant Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Good morning, John!</h3>
              <p className="text-slate-600 leading-relaxed">
                I've analyzed your schedule, deadlines, and priorities. Today looks busy with the Acme Corp project
                deadline approaching. I've optimized your day to balance client work, creative time, and necessary
                meetings. You have 3 reminders set and 2 emails scheduled to send.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-8">
        {/* Daily Schedule */}
        <div className="col-span-2">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Morning Block */}
              <div>
                <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
                  <Coffee className="h-4 w-4 mr-2 text-amber-500" />
                  Morning Focus (9:00 AM - 12:00 PM)
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded mr-3">
                          9:00 AM
                        </span>
                        <h5 className="font-medium text-slate-800">Brand Identity Design</h5>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700">2 hours</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Focus on finalizing the logo variations for Acme Corp. Priority task as the deadline is in 3 days.
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <FileText className="h-3 w-3 mr-1" />
                        Acme Corp Project
                      </div>
                      <div className="text-xs font-medium text-amber-600">High Priority</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded mr-3">
                          11:00 AM
                        </span>
                        <h5 className="font-medium text-slate-800">Client Video Call</h5>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">1 hour</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Review session with Tech Startup Inc. about website mockups. Prepare the latest designs for
                      presentation.
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <Video className="h-3 w-3 mr-1" />
                        Tech Startup Project
                      </div>
                      <div className="text-xs font-medium text-blue-600">Medium Priority</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Afternoon Block */}
              <div>
                <h4 className="text-md font-semibold text-slate-700 mb-3 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-amber-500" />
                  Afternoon Tasks (1:00 PM - 5:00 PM)
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded mr-3">
                          1:00 PM
                        </span>
                        <h5 className="font-medium text-slate-800">Invoice Creation</h5>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">30 min</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Prepare and send invoice for the completed Photography project for Fashion Brand.
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <FileText className="h-3 w-3 mr-1" />
                        Administrative
                      </div>
                      <div className="text-xs font-medium text-emerald-600">Medium Priority</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded mr-3">
                          2:00 PM
                        </span>
                        <h5 className="font-medium text-slate-800">Creative Work</h5>
                        <Bell className="h-4 w-4 ml-2 text-amber-500" />
                      </div>
                      <Badge className="bg-amber-100 text-amber-700">2 hours</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Work on the E-commerce website design for Tech Startup. Focus on the product page templates.
                      <span className="text-amber-600 font-medium"> (Reminder: Follow up with Acme Corp)</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <FileText className="h-3 w-3 mr-1" />
                        Tech Startup Project
                      </div>
                      <div className="text-xs font-medium text-blue-600">Medium Priority</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-mono text-sm text-rose-600 bg-rose-100 px-2 py-1 rounded mr-3">
                          4:00 PM
                        </span>
                        <h5 className="font-medium text-slate-800">Client Feedback Review</h5>
                      </div>
                      <Badge className="bg-rose-100 text-rose-700">1 hour</Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      Review and implement feedback on the Brand Guidelines document for Acme Corp.
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center text-xs text-slate-500">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Acme Corp Project
                      </div>
                      <div className="text-xs font-medium text-amber-600">High Priority</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Insights */}
        <div className="space-y-6">
          {/* Daily Progress */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-800">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tasks Completed</span>
                  <span className="text-slate-800 font-medium">2/6</span>
                </div>
                <Progress value={33} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Hours Tracked</span>
                  <span className="text-slate-800 font-medium">3.5/8</span>
                </div>
                <Progress value={44} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Project Progress</span>
                  <span className="text-slate-800 font-medium">75%</span>
                </div>
                <Progress value={75} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-amber-800 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Reminders
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-200 text-amber-600 hover:bg-amber-50"
                  onClick={() => setShowReminderForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/50">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      reminder.priority === "high"
                        ? "bg-red-400"
                        : reminder.priority === "medium"
                          ? "bg-amber-400"
                          : "bg-blue-400"
                    }`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 text-sm">{reminder.title}</h4>
                    <p className="text-xs text-slate-500">{reminder.time}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-600">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Email Integration */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <h4 className="font-medium text-slate-800 text-sm">Connected</h4>
                </div>
                <p className="text-xs text-slate-600">john.doe@email.com</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Scheduled Emails</span>
                  <span className="text-slate-800 font-medium">2</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Sent Today</span>
                  <span className="text-slate-800 font-medium">5</span>
                </div>
              </div>

              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowEmailForm(true)}
              >
                <Send className="h-4 w-4 mr-2" />
                Compose Email
              </Button>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-800">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-slate-800 text-sm">Productivity Peak</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Your most productive hours are between 9-11 AM. Schedule creative work during this time.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-slate-800 text-sm">Time Management</h4>
                </div>
                <p className="text-xs text-slate-600">
                  You spend 40% of your time in meetings. Consider blocking focused work time.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-slate-800 text-sm">Goal Progress</h4>
                </div>
                <p className="text-xs text-slate-600">
                  You're on track to complete the Acme Corp project by the deadline.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reminder Form Modal */}
      {showReminderForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Add Reminder</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowReminderForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Reminder title" className="bg-white border-slate-200" />
              <Input type="datetime-local" className="bg-white border-slate-200" />
              <select className="w-full p-2 border border-slate-200 rounded-md bg-white">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowReminderForm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => setShowReminderForm(false)}
                >
                  Add Reminder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Email Form Modal */}
      {showEmailForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[600px] bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Compose Email</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowEmailForm(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="To: client@email.com" className="bg-white border-slate-200" />
              <Input placeholder="Subject" className="bg-white border-slate-200" />
              <Textarea placeholder="Email content..." className="bg-white border-slate-200 min-h-[150px]" />
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" className="rounded" />
                  Schedule for later
                </label>
                <Input type="datetime-local" className="bg-white border-slate-200 flex-1" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEmailForm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => setShowEmailForm(false)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
