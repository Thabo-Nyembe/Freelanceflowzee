"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Users,
  Plus,
  Search,
  MessageSquare,
  Video,
  Share,
  FileText,
  Download,
  Upload,
  Folder,
  Star,
  Settings,
  Palette,
  Camera,
  Film,
  Code,
  Zap,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react"

export function Team() {
  const [activeTab, setActiveTab] = useState("team")
  const [showInviteForm, setShowInviteForm] = useState(false)

  const teamMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "UI/UX Designer",
      avatar: "SC",
      status: "online",
      skills: ["Figma", "Adobe XD", "Sketch"],
      projects: 3,
      rating: 4.9,
      location: "San Francisco, CA",
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Frontend Developer",
      avatar: "MR",
      status: "busy",
      skills: ["React", "Vue.js", "TypeScript"],
      projects: 5,
      rating: 4.8,
      location: "Austin, TX",
    },
    {
      id: 3,
      name: "Emma Thompson",
      role: "Graphic Designer",
      avatar: "ET",
      status: "online",
      skills: ["Photoshop", "Illustrator", "InDesign"],
      projects: 2,
      rating: 5.0,
      location: "London, UK",
    },
    {
      id: 4,
      name: "David Kim",
      role: "Motion Designer",
      avatar: "DK",
      status: "offline",
      skills: ["After Effects", "Cinema 4D", "Blender"],
      projects: 4,
      rating: 4.7,
      location: "Seoul, KR",
    },
  ]

  const sharedFiles = [
    {
      id: 1,
      name: "Brand_Guidelines_v3.psd",
      type: "Photoshop",
      size: "45.2 MB",
      owner: "Emma Thompson",
      modified: "2 hours ago",
      collaborators: 3,
      icon: Palette,
      color: "text-blue-600",
    },
    {
      id: 2,
      name: "Website_Mockups.fig",
      type: "Figma",
      size: "12.8 MB",
      owner: "Sarah Chen",
      modified: "5 hours ago",
      collaborators: 2,
      icon: Code,
      color: "text-purple-600",
    },
    {
      id: 3,
      name: "Logo_Animation.aep",
      type: "After Effects",
      size: "128.5 MB",
      owner: "David Kim",
      modified: "1 day ago",
      collaborators: 1,
      icon: Film,
      color: "text-indigo-600",
    },
    {
      id: 4,
      name: "Product_Photos.zip",
      type: "Archive",
      size: "256.7 MB",
      owner: "Emma Thompson",
      modified: "2 days ago",
      collaborators: 4,
      icon: Camera,
      color: "text-emerald-600",
    },
  ]

  const adobeApps = [
    { name: "Photoshop", icon: Palette, color: "bg-blue-500", connected: true },
    { name: "Illustrator", icon: Palette, color: "bg-orange-500", connected: true },
    { name: "After Effects", icon: Film, color: "bg-purple-500", connected: false },
    { name: "Premiere Pro", icon: Film, color: "bg-indigo-500", connected: false },
    { name: "InDesign", icon: FileText, color: "bg-pink-500", connected: true },
    { name: "XD", icon: Code, color: "bg-violet-500", connected: true },
  ]

  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEventForm, setShowEventForm] = useState(false)

  const teamEvents = [
    {
      id: 1,
      title: "Design Review Meeting",
      date: "2024-01-25",
      time: "10:00 AM",
      duration: "1 hour",
      attendees: ["Sarah Chen", "Emma Thompson"],
      type: "meeting",
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Client Presentation",
      date: "2024-01-26",
      time: "2:00 PM",
      duration: "2 hours",
      attendees: ["Marcus Rodriguez", "David Kim", "Sarah Chen"],
      type: "presentation",
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Project Deadline",
      date: "2024-01-28",
      time: "All Day",
      duration: "All day",
      attendees: ["All Team"],
      type: "deadline",
      color: "bg-red-500",
    },
    {
      id: 4,
      title: "Team Standup",
      date: "2024-01-29",
      time: "9:00 AM",
      duration: "30 min",
      attendees: ["All Team"],
      type: "standup",
      color: "bg-emerald-500",
    },
  ]

  const teamAvailability = [
    { member: "Sarah Chen", status: "available", until: "5:00 PM", timezone: "PST" },
    { member: "Marcus Rodriguez", status: "busy", until: "3:00 PM", timezone: "CST" },
    { member: "Emma Thompson", status: "available", until: "6:00 PM", timezone: "GMT" },
    { member: "David Kim", status: "offline", until: "Tomorrow", timezone: "KST" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Team Collaboration</h2>
          <p className="text-lg text-slate-500 mt-1">Connect with freelancers and manage shared projects</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
            onClick={() => setShowInviteForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
            <Share className="h-4 w-4 mr-2" />
            Share Project
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "team" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("team")}
          className={activeTab === "team" ? "bg-white shadow-sm" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Members
        </Button>
        <Button
          variant={activeTab === "files" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("files")}
          className={activeTab === "files" ? "bg-white shadow-sm" : ""}
        >
          <Folder className="h-4 w-4 mr-2" />
          Shared Files
        </Button>
        <Button
          variant={activeTab === "integrations" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("integrations")}
          className={activeTab === "integrations" ? "bg-white shadow-sm" : ""}
        >
          <Zap className="h-4 w-4 mr-2" />
          Integrations
        </Button>
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("calendar")}
          className={activeTab === "calendar" ? "bg-white shadow-sm" : ""}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Shared Calendar
        </Button>
      </div>

      {/* Team Members Tab */}
      {activeTab === "team" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search team members..." className="pl-10 bg-white/70 border-slate-200" />
                </div>
                <Button variant="outline" className="border-slate-200 text-slate-600">
                  Filter by Skills
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Team Grid */}
          <div className="grid grid-cols-2 gap-6">
            {teamMembers.map((member) => (
              <Card
                key={member.id}
                className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <Avatar className="h-16 w-16 border-2 border-purple-200">
                        <AvatarImage src={`/placeholder.svg?height=64&width=64`} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-200 to-pink-200 text-purple-700 text-lg">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                          member.status === "online"
                            ? "bg-green-400"
                            : member.status === "busy"
                              ? "bg-amber-400"
                              : "bg-slate-400"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 mb-1">{member.name}</h3>
                      <p className="text-sm text-slate-600 mb-2">{member.role}</p>
                      <p className="text-xs text-slate-500 mb-3">{member.location}</p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-400 fill-current" />
                          <span className="text-sm font-medium text-slate-700">{member.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-600">{member.projects} projects</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {member.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Chat
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-200 text-green-600 hover:bg-green-50"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-200 text-purple-600 hover:bg-purple-50"
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Shared Files Tab */}
      {activeTab === "files" && (
        <div className="space-y-6">
          {/* File Upload */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Files</h3>
                <p className="text-slate-600 mb-4">Drag and drop files here or click to browse</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File List */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Shared Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sharedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        <file.icon className={`h-6 w-6 ${file.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">{file.name}</h4>
                        <p className="text-sm text-slate-600">
                          {file.type} • {file.size} • {file.owner}
                        </p>
                        <p className="text-xs text-slate-500">Modified {file.modified}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {Array.from({ length: file.collaborators }, (_, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                                {String.fromCharCode(65 + i)}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-xs text-slate-500">{file.collaborators} collaborators</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                          <Share className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Adobe Creative Suite */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Adobe Creative Suite</CardTitle>
              <p className="text-sm text-slate-500">Connect your Adobe apps for seamless collaboration</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {adobeApps.map((app) => (
                  <div
                    key={app.name}
                    className="p-4 rounded-xl border border-slate-200/50 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${app.color} rounded-lg flex items-center justify-center`}>
                          <app.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-800">{app.name}</h4>
                          <p className="text-xs text-slate-500">Adobe</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${app.connected ? "bg-green-400" : "bg-slate-300"}`}></div>
                    </div>
                    <Button
                      size="sm"
                      variant={app.connected ? "outline" : "default"}
                      className={`w-full ${
                        app.connected
                          ? "border-slate-200 text-slate-600"
                          : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      }`}
                    >
                      {app.connected ? "Connected" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Other Integrations */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Cloud Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">Google Drive</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <Folder className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">Dropbox</span>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Communication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">Slack</span>
                  </div>
                  <Badge className="bg-green-100 text-green-700">Connected</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Video className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-medium text-slate-800">Zoom</span>
                  </div>
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integration Stats */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-purple-800">Integration Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-light text-purple-800 mb-1">6</p>
                  <p className="text-sm text-purple-600">Connected Apps</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-purple-800 mb-1">24</p>
                  <p className="text-sm text-purple-600">Files Synced</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-purple-800 mb-1">12</p>
                  <p className="text-sm text-purple-600">Team Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-light text-purple-800 mb-1">98%</p>
                  <p className="text-sm text-purple-600">Sync Success</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Shared Calendar Tab */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          {/* Calendar Header */}
          <div className="grid grid-cols-3 gap-6">
            {/* Calendar View */}
            <div className="col-span-2">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      <CardTitle className="text-xl font-semibold text-slate-800">January 2024</CardTitle>
                      <Button variant="ghost" size="icon" className="text-slate-600 hover:bg-slate-100">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                    <Button
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      onClick={() => setShowEventForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Event
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day} className="text-center text-sm font-medium text-slate-500 p-3">
                        {day}
                      </div>
                    ))}

                    {/* Calendar Days */}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 6 + 1
                      const isCurrentMonth = day > 0 && day <= 31
                      const isToday = day === 25
                      const hasEvent = [25, 26, 28, 29].includes(day)

                      return (
                        <div
                          key={i}
                          className={`p-3 text-center text-sm cursor-pointer rounded-lg transition-all duration-200 relative min-h-[60px] ${
                            !isCurrentMonth
                              ? "text-slate-300"
                              : isToday
                                ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg"
                                : "text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {isCurrentMonth && day}
                          {hasEvent && isCurrentMonth && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                              {day === 25 && <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>}
                              {day === 26 && <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>}
                              {day === 28 && <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>}
                              {day === 29 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Availability */}
            <div className="space-y-6">
              <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Team Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamAvailability.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            member.status === "available"
                              ? "bg-green-400"
                              : member.status === "busy"
                                ? "bg-amber-400"
                                : "bg-slate-400"
                          }`}
                        ></div>
                        <div>
                          <h4 className="font-medium text-slate-800 text-sm">{member.member}</h4>
                          <p className="text-xs text-slate-500">
                            {member.status === "available"
                              ? "Available"
                              : member.status === "busy"
                                ? "Busy"
                                : "Offline"}{" "}
                            until {member.until} ({member.timezone})
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-blue-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <Video className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Clock className="h-4 w-4 mr-2" />
                    Find Common Time
                  </Button>
                  <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                    <Share className="h-4 w-4 mr-2" />
                    Share Calendar
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Events */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-slate-800">Upcoming Team Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 ${event.color} rounded-full`}></div>
                      <div>
                        <h4 className="font-medium text-slate-800">{event.title}</h4>
                        <p className="text-sm text-slate-600">
                          {event.date} at {event.time} • {event.duration}
                        </p>
                        <p className="text-xs text-slate-500">
                          Attendees: {Array.isArray(event.attendees) ? event.attendees.join(", ") : event.attendees}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          event.type === "meeting"
                            ? "bg-blue-100 text-blue-700"
                            : event.type === "presentation"
                              ? "bg-purple-100 text-purple-700"
                              : event.type === "deadline"
                                ? "bg-red-100 text-red-700"
                                : "bg-emerald-100 text-emerald-700"
                        }
                      >
                        {event.type}
                      </Badge>
                      <Button size="sm" variant="outline" className="border-slate-200 text-slate-600">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar Stats */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-light text-emerald-800 mb-1">12</p>
                <p className="text-sm text-emerald-600">Events This Month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-light text-blue-800 mb-1">4</p>
                <p className="text-sm text-blue-600">Team Members Online</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-light text-purple-800 mb-1">8</p>
                <p className="text-sm text-purple-600">Meetings This Week</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <p className="text-3xl font-light text-amber-800 mb-1">95%</p>
                <p className="text-sm text-amber-600">Attendance Rate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px] bg-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Create Team Event</CardTitle>
                <Button size="sm" variant="ghost" onClick={() => setShowEventForm(false)}>
                  <Plus className="h-4 w-4 rotate-45" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Event title" className="bg-white border-slate-200" />
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" className="bg-white border-slate-200" />
                <Input type="time" className="bg-white border-slate-200" />
              </div>
              <select className="w-full p-2 border border-slate-200 rounded-md bg-white">
                <option>Event Type</option>
                <option>Meeting</option>
                <option>Presentation</option>
                <option>Deadline</option>
                <option>Standup</option>
                <option>Workshop</option>
              </select>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Invite Team Members</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <label key={member.id} className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="checkbox" className="rounded" />
                      {member.name} ({member.role})
                    </label>
                  ))}
                </div>
              </div>
              <textarea
                placeholder="Event description or agenda..."
                className="w-full p-2 border border-slate-200 rounded-md bg-white min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowEventForm(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setShowEventForm(false)}
                >
                  Create Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
