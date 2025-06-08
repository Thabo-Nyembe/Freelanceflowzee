"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Calendar,
  FolderOpen,
  Users,
  CreditCard,
  MessageSquare,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Zap,
  Star,
  TrendingUp,
  PieChart,
  Target,
  Globe,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UnifiedSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  count?: number
  isNew?: boolean
  isPro?: boolean
}

const navigationItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, count: 3 },
  { id: "my-day", label: "My Day", icon: Calendar, isNew: true },
  { id: "projects", label: "Projects", icon: FolderOpen, count: 12 },
  { id: "team", label: "Team", icon: Users, count: 5 },
  { id: "financial", label: "Financial", icon: CreditCard, count: 2 },
  { id: "feedback", label: "Universal Feedback", icon: MessageSquare, count: 8, isPro: true },
  { id: "files", label: "Files", icon: FileText, count: 24 },
  { id: "community", label: "Community", icon: Globe, isNew: true },
  { id: "analytics", label: "Analytics", icon: TrendingUp, isPro: true },
  { id: "profile", label: "Profile", icon: Settings },
  { id: "notifications", label: "Notifications", icon: Bell, count: 15 },
]

export function UnifiedSidebar({ activeTab, setActiveTab }: UnifiedSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col bg-white/80 backdrop-blur-md border-r border-white/20 shadow-xl transition-all duration-300",
      isCollapsed ? "w-16" : "w-72"
    )}>
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                FreeFlow
              </h1>
              <p className="text-sm text-slate-500">Unified Platform</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 h-8 w-8"
          >
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-b border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start p-2 h-auto">
              <div className="flex items-center gap-3 w-full">
                <Avatar className="h-10 w-10 ring-2 ring-blue-500/20">
                  <AvatarImage src="/api/placeholder/40/40" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    JD
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900">John Doe</p>
                    <p className="text-xs text-slate-500">Freelance Designer</p>
                  </div>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-4 space-y-2">
        {!isCollapsed && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 transition-all duration-200",
                  isActive 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25" 
                    : "hover:bg-slate-100 text-slate-700 hover:text-slate-900",
                  isCollapsed ? "px-2" : "px-4"
                )}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-white" : "text-slate-500")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.isNew && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5">
                          New
                        </Badge>
                      )}
                      {item.isPro && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs px-1.5 py-0.5">
                          Pro
                        </Badge>
                      )}
                      {item.count && (
                        <Badge 
                          variant={isActive ? "secondary" : "default"} 
                          className={cn(
                            "text-xs px-1.5 py-0.5",
                            isActive 
                              ? "bg-white/20 text-white" 
                              : "bg-slate-200 text-slate-600"
                          )}
                        >
                          {item.count}
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </Button>
            )
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {!isCollapsed && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-900">Upgrade to Pro</p>
            <p className="text-xs text-slate-500 mb-2">Get unlimited access</p>
            <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
              Upgrade Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 