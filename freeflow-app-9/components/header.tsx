"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Search, Settings, Plus, MessageSquare, Calendar } from "lucide-react"

interface HeaderProps {
  onNavigate: (screen: string, subTab?: string) => void
  unreadNotifications: number
}

export function Header({ onNavigate, unreadNotifications }: HeaderProps) {
  return (
    <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-purple-100/50 flex items-center justify-between px-8">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
          <Input
            placeholder="Search projects, clients..."
            className="pl-10 w-80 bg-white/50 border-purple-200/50 focus:border-purple-300 text-slate-700"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:bg-purple-100/50"
          onClick={() => onNavigate("projects", "tracking")}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:bg-purple-100/50"
          onClick={() => onNavigate("team", "calendar")}
        >
          <Calendar className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:bg-purple-100/50"
          onClick={() => onNavigate("projects", "collaboration")}
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:bg-purple-100/50 relative"
          onClick={() => onNavigate("notifications")}
        >
          <Bell className="h-5 w-5" />
          {unreadNotifications > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
              {unreadNotifications}
            </Badge>
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-purple-600 hover:bg-purple-100/50"
          onClick={() => onNavigate("profile")}
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Avatar className="h-8 w-8 border-2 border-purple-200 cursor-pointer" onClick={() => onNavigate("profile")}>
          <AvatarImage src="/placeholder.svg?height=32&width=32" />
          <AvatarFallback className="bg-gradient-to-br from-purple-200 to-pink-200 text-purple-700">JD</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
