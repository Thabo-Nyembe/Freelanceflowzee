"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Team } from "@/components/team"
import { Calendar } from "@/components/calendar"
import { Users, CalendarIcon } from "lucide-react"

interface TeamHubProps {
  onNavigate: (screen: string, subTab?: string) => void
}

export function TeamHub({ onNavigate }: TeamHubProps) {
  const [activeTab, setActiveTab] = useState("members")

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-light text-slate-800">Team Hub</h2>
          <p className="text-lg text-slate-500 mt-1">Collaborate with team members and manage schedules</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "members" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("members")}
          className={activeTab === "members" ? "bg-white shadow-sm" : ""}
        >
          <Users className="h-4 w-4 mr-2" />
          Team Members
        </Button>
        <Button
          variant={activeTab === "calendar" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("calendar")}
          className={activeTab === "calendar" ? "bg-white shadow-sm" : ""}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Shared Calendar
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "members" && <Team />}
      {activeTab === "calendar" && <Calendar />}
    </div>
  )
}
