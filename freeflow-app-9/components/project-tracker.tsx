import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, Clock, FileText, Calendar, User } from "lucide-react"

export function ProjectTracker() {
  const deliverables = [
    { id: 1, title: "Initial Concepts & Mood Board", completed: true, dueDate: "2024-01-15", assignee: "John Doe" },
    { id: 2, title: "Logo Design Variations", completed: true, dueDate: "2024-01-20", assignee: "John Doe" },
    { id: 3, title: "Brand Guidelines Document", completed: false, dueDate: "2024-01-25", assignee: "John Doe" },
    { id: 4, title: "Final Asset Package", completed: false, dueDate: "2024-01-30", assignee: "John Doe" },
  ]

  const completedCount = deliverables.filter((d) => d.completed).length
  const progressPercentage = (completedCount / deliverables.length) * 100

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Project Tracker</h2>
          <p className="text-lg text-slate-500 mt-1">Brand Identity Design for Acme Corporation</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Meeting
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Progress Overview */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-purple-800">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-light text-purple-800 mb-2">{Math.round(progressPercentage)}%</div>
              <p className="text-sm text-purple-600">Complete</p>
            </div>
            <Progress value={progressPercentage} className="h-3 bg-purple-100" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-light text-slate-800">{completedCount}</p>
                <p className="text-xs text-slate-500">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-light text-slate-800">{deliverables.length - completedCount}</p>
                <p className="text-xs text-slate-500">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Client</span>
              <span className="font-medium text-slate-800">Acme Corporation</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Start Date</span>
              <span className="font-medium text-slate-800">Jan 10, 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Deadline</span>
              <span className="font-medium text-slate-800">Jan 30, 2024</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Budget</span>
              <span className="font-medium text-emerald-600">$5,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Status</span>
              <Badge className="bg-purple-100 text-purple-700">In Progress</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-blue-800">Time Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-light text-blue-800 mb-1">32.5</div>
              <p className="text-sm text-blue-600">Hours logged</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">This week</span>
                <span className="font-medium text-slate-800">12.5h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Last week</span>
                <span className="font-medium text-slate-800">20h</span>
              </div>
            </div>
            <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Clock className="h-4 w-4 mr-2" />
              Start Timer
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables */}
      <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Deliverables & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deliverables.map((deliverable) => (
              <div
                key={deliverable.id}
                className="p-6 rounded-xl border border-slate-200/50 bg-slate-50/30 hover:bg-slate-50/50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  {deliverable.completed ? (
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-slate-400" />
                  )}
                  <div className="flex-1">
                    <h4
                      className={`font-semibold ${deliverable.completed ? "text-emerald-700 line-through" : "text-slate-800"}`}
                    >
                      {deliverable.title}
                    </h4>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {deliverable.dueDate}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {deliverable.assignee}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {!deliverable.completed && (
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {deliverable.completed && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
