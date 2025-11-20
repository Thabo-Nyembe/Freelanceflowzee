'use client'

import * as React from 'react'
import { Moon, Sun, Monitor, Palette } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import { BorderTrail } from '@/components/ui/border-trail'
import { GlowEffect } from '@/components/ui/glow-effect'
import { cn } from '@/lib/utils'

interface PremiumThemeToggleProps {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function PremiumThemeToggle({
  align = 'end',
  side = 'bottom',
  className,
}: PremiumThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  // After mounting, we have access to the theme
  React.useEffect(() => setIsMounted(true), [])

  if (!isMounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'relative h-9 w-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700',
          className
        )}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] text-white" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
      case 'dark':
        return <Moon className="h-[1.2rem] w-[1.2rem] text-blue-400" />
      case 'monochrome':
        return <Palette className="h-[1.2rem] w-[1.2rem] text-gray-400" />
      default:
        return <Monitor className="h-[1.2rem] w-[1.2rem] text-purple-400" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="relative">
          <GlowEffect className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-50" />
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'relative h-9 w-9 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300',
              theme === 'monochrome' && 'bg-white hover:bg-gray-100 border-gray-300',
              className
            )}
          >
            {getIcon()}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} className="p-0 overflow-hidden">
        <LiquidGlassCard className="border-0">
          <div className="p-1 space-y-1">
            <DropdownMenuItem
              onClick={() => setTheme('light')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-all',
                theme === 'light'
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600'
                  : 'hover:bg-slate-700/50 text-gray-300'
              )}
            >
              <Sun className="h-4 w-4" />
              <span className="font-medium">Light</span>
              {theme === 'light' && (
                <div className="ml-auto h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme('dark')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-all',
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400'
                  : 'hover:bg-slate-700/50 text-gray-300'
              )}
            >
              <Moon className="h-4 w-4" />
              <span className="font-medium">Dark</span>
              {theme === 'dark' && (
                <div className="ml-auto h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme('monochrome')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-all',
                theme === 'monochrome'
                  ? 'bg-gradient-to-r from-gray-500/20 to-gray-700/20 text-gray-200'
                  : 'hover:bg-slate-700/50 text-gray-300'
              )}
            >
              <Palette className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">Black & White</span>
                <span className="text-xs text-gray-500">High contrast monochrome</span>
              </div>
              {theme === 'monochrome' && (
                <div className="ml-auto h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setTheme('system')}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-md transition-all',
                theme === 'system'
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400'
                  : 'hover:bg-slate-700/50 text-gray-300'
              )}
            >
              <Monitor className="h-4 w-4" />
              <span className="font-medium">System</span>
              {theme === 'system' && (
                <div className="ml-auto h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
              )}
            </DropdownMenuItem>
          </div>
          <BorderTrail
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            size={60}
            duration={6}
          />
        </LiquidGlassCard>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Floating theme toggle for dashboard pages
export function FloatingThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'monochrome', 'system']
    const currentIndex = themes.indexOf(theme || 'system')
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5 text-amber-500" />
      case 'dark':
        return <Moon className="h-5 w-5 text-blue-400" />
      case 'monochrome':
        return <Palette className="h-5 w-5 text-gray-400" />
      default:
        return <Monitor className="h-5 w-5 text-purple-400" />
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <GlowEffect className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-50" />
        <LiquidGlassCard className="relative p-0 rounded-full overflow-hidden">
          <Button
            onClick={cycleTheme}
            size="icon"
            className={cn(
              'h-12 w-12 rounded-full transition-all duration-300',
              theme === 'monochrome'
                ? 'bg-white hover:bg-gray-100 border-gray-300'
                : 'bg-slate-800/90 hover:bg-slate-700/90'
            )}
            aria-label="Cycle theme"
          >
            {getIcon()}
          </Button>
          <BorderTrail
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            size={40}
            duration={4}
          />
        </LiquidGlassCard>
      </div>
    </div>
  )
}
