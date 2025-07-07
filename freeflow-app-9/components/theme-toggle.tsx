"use client"

import * as React from "react"
import { Moon, Sun, Monitor, Check } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    {
      name: 'Light',
      value: 'light' as const,
      icon: Sun,
      description: 'Light mode',
    },
    {
      name: 'Dark',
      value: 'dark' as const,
      icon: Moon,
      description: 'Dark mode',
    },
    {
      name: 'System',
      value: 'system' as const,
      icon: Monitor,
      description: 'Follow system preference',
    },
  ]

  const getCurrentIcon = () => {
    if (resolvedTheme === 'dark') return Moon
    if (resolvedTheme === 'light') return Sun
    return Monitor
  }

  const CurrentIcon = getCurrentIcon()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          data-testid="theme-toggle"
          aria-label="Toggle theme"
          className="relative h-9 w-9 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <CurrentIcon className="h-4 w-4 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg"
      >
        <div className="p-1">
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            const isSelected = theme === themeOption.value
            
            return (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => setTheme(themeOption.value)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800",
                  isSelected && 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{themeOption.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {themeOption.description}
                  </span>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple toggle variant for mobile/compact spaces
export function ThemeToggleSimple() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      data-testid="theme-toggle-simple"
      aria-label="Toggle theme"
      className="h-9 w-9 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 