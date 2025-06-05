"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, FolderOpen, Users, DollarSign, FileText, User, Bell, Settings, Globe } from "lucide-react"

interface SidebarProps {
  activeScreen: string
  setActiveScreen: (screen: string, subTab?: string) => void
  unreadNotifications: number
}

export function Sidebar({ activeScreen, setActiveScreen, unreadNotifications }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "myday", label: "My Day", icon: Calendar },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "team", label: "Team", icon: Users },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "files", label: "Files", icon: FileText },
    { id: "community", label: "Community", icon: Globe },
    { id: "profile", label: "Profile", icon: User },
  ]

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-slate-200/50 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            FreeFlow
          </span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeScreen === item.id ? "default" : "ghost"}
                className={`w-full justify-start gap-3 ${
                  activeScreen === item.id
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                }`}
                onClick={() => setActiveScreen(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}

          <Button
            variant={activeScreen === "notifications" ? "default" : "ghost"}
            className={`w-full justify-start gap-3 ${
              activeScreen === "notifications"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            }`}
            onClick={() => setActiveScreen("notifications")}
          >
            <Bell className="h-4 w-4" />
            Notifications
            {unreadNotifications > 0 && (
              <Badge className="ml-auto bg-red-500 text-white text-xs">{unreadNotifications}</Badge>
            )}
          </Button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-slate-900">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
