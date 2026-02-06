/**
 * Dashboard Header Component
 *
 * Comprehensive header for dashboard pages with:
 * - Page title/breadcrumbs
 * - Global search
 * - Notifications
 * - User menu
 * - Online people
 * - Theme toggle
 *
 * PERFORMANCE OPTIMIZATIONS:
 * - Uses React.memo to prevent unnecessary re-renders
 * - Uses useCallback for stable event handlers
 * - Uses useMemo for computed values
 */

'use client'

import { useState, useCallback, useMemo, memo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, User, Settings, LogOut, Moon, Sun, Menu, Maximize2, Minimize2, Brain, Activity } from 'lucide-react'
import { OnlinePeopleToggle } from '@/components/realtime/online-people-toggle'
import { useSidebar } from '@/lib/sidebar-context'
import { useAIPanels } from '@/lib/ai-panels-context'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'

interface DashboardHeaderProps {
    user: {
        id: string
        email: string
        user_metadata: { name?: string }
    }
    pageTitle?: string
}

export const DashboardHeader = memo<DashboardHeaderProps>(function DashboardHeader({ user, pageTitle }) {
    const router = useRouter()
    const { theme, setTheme } = useTheme()
    const { isFullscreen, toggleFullscreen } = useSidebar()
    const {
        isIntelligencePanelOpen,
        toggleIntelligencePanel,
        isActivityPanelOpen,
        toggleActivityPanel,
    } = useAIPanels()
    const [searchQuery, setSearchQuery] = useState('')

    // Memoize computed values
    const { userName, userInitials, avatarUrl } = useMemo(() => {
        const name = user.user_metadata?.name || user.email.split('@')[0]
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
        const avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
        return { userName: name, userInitials: initials, avatarUrl: avatar }
    }, [user.email, user.user_metadata?.name])

    // Stable callback references
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }, [searchQuery, router])

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }, [])

    const handleSignOut = useCallback(async () => {
        await fetch('/auth/signout', { method: 'POST' })
        router.push('/')
    }, [router])

    const handleToggleTheme = useCallback(() => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }, [theme, setTheme])

    const handleNavigateToSearch = useCallback(() => {
        router.push('/dashboard/search')
    }, [router])

    const handleNavigateToNotifications = useCallback(() => {
        router.push('/dashboard/notifications')
    }, [router])

    const handleNavigateToProfile = useCallback(() => {
        router.push('/dashboard/profile')
    }, [router])

    const handleNavigateToSettings = useCallback(() => {
        router.push('/dashboard/settings')
    }, [router])

    return (
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                {/* Left Section - Page Title */}
                <div className="flex items-center gap-4 min-w-0">
                    {pageTitle && (
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                            {pageTitle}
                        </h1>
                    )}
                </div>

                {/* Center Section - Search (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md">
                    <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search projects, tasks, clients..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-10 w-full bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                            />
                        </div>
                    </form>
                </div>

                {/* Right Section - Actions */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Search (Mobile) */}
                    <Button
                        variant="ghost"
                        size="sm"
                        className="md:hidden"
                        onClick={handleNavigateToSearch}
                    >
                        <Search className="h-5 w-5" />
                    </Button>

                    {/* Online People */}
                    <div className="hidden sm:block">
                        <OnlinePeopleToggle position="header" />
                    </div>

                    {/* AI Intelligence Toggle */}
                    <Button
                        variant={isIntelligencePanelOpen ? "default" : "ghost"}
                        size="sm"
                        onClick={toggleIntelligencePanel}
                        className="hidden sm:flex gap-2"
                        title="AI Intelligence"
                    >
                        <Brain className="h-5 w-5" />
                        <span className="hidden lg:inline text-sm">AI Intelligence</span>
                    </Button>

                    {/* AI Activity Toggle */}
                    <Button
                        variant={isActivityPanelOpen ? "default" : "ghost"}
                        size="sm"
                        onClick={toggleActivityPanel}
                        className="hidden sm:flex gap-2"
                        title="AI Activity"
                    >
                        <Activity className="h-5 w-5" />
                        <span className="hidden lg:inline text-sm">AI Activity</span>
                    </Button>

                    {/* Fullscreen Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                        className="hidden sm:flex"
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    >
                        {isFullscreen ? (
                            <Minimize2 className="h-5 w-5" />
                        ) : (
                            <Maximize2 className="h-5 w-5" />
                        )}
                    </Button>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="relative">
                                <Bell className="h-5 w-5" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                                >
                                    3
                                </Badge>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-80">
                            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <span className="font-medium">New project assigned</span>
                                    <span className="text-xs text-gray-500">Project "Website Redesign" needs your attention</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <span className="font-medium">Task completed</span>
                                    <span className="text-xs text-gray-500">John marked "Design mockups" as done</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3">
                                    <span className="font-medium">Invoice paid</span>
                                    <span className="text-xs text-gray-500">Client paid invoice #1234</span>
                                </DropdownMenuItem>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="justify-center text-sm text-blue-600"
                                onClick={handleNavigateToNotifications}
                            >
                                View all notifications
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleToggleTheme}
                        className="hidden sm:flex"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-5 w-5" />
                        ) : (
                            <Moon className="h-5 w-5" />
                        )}
                    </Button>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={avatarUrl} />
                                    <AvatarFallback>{userInitials}</AvatarFallback>
                                </Avatar>
                                <span className="hidden lg:inline text-sm font-medium">{userName}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col">
                                    <span className="font-medium">{userName}</span>
                                    <span className="text-xs text-gray-500 font-normal">{user.email}</span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleNavigateToProfile}>
                                <User className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleNavigateToSettings}>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleToggleTheme}
                                className="sm:hidden"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="mr-2 h-4 w-4" />
                                ) : (
                                    <Moon className="mr-2 h-4 w-4" />
                                )}
                                Toggle Theme
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
})
