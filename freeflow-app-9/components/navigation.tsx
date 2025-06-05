"use client"

import { Button } from "@/components/ui/button"
import { Home, FolderOpen, Shield, MessageSquare, ImageIcon, User, Calendar, FileText } from "lucide-react"

interface NavigationProps {
  activeScreen: string
  setActiveScreen: (screen: string) => void
}

export function Navigation({ activeScreen, setActiveScreen }: NavigationProps) {
  const navItems = [
    { id: "dashboard", icon: Home, label: "Home" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "escrow", icon: Shield, label: "Escrow" },
    { id: "collaboration", icon: MessageSquare, label: "Collab" },
    { id: "gallery", icon: ImageIcon, label: "Gallery" },
    { id: "profile", icon: User, label: "Profile" },
    { id: "calendar", icon: Calendar, label: "Calendar" },
    { id: "invoices", icon: FileText, label: "Invoices" },
  ]

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md">
      <div className="bg-black/40 backdrop-blur-xl border-t border-white/10 p-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = activeScreen === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive ? "text-blue-400 bg-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveScreen(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            )
          })}
        </div>
        <div className="grid grid-cols-4 gap-1 mt-1">
          {navItems.slice(4).map((item) => {
            const Icon = item.icon
            const isActive = activeScreen === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  isActive ? "text-blue-400 bg-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                onClick={() => setActiveScreen(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
