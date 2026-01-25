"use client"

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

export function useTheme() {
  const { theme, setTheme } = React.useContext(NextThemesProvider)
  return { theme, setTheme }
}

export function useSystemTheme() {
  const [systemTheme, setSystemTheme] = React.useState<'light' | 'dark'>('light')

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    updateSystemTheme(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', updateSystemTheme)

    return () => {
      mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [])

  return systemTheme
}

export function useThemeValue() {
  const { theme } = useTheme()
  const systemTheme = useSystemTheme()
  
  return theme === 'system' ? systemTheme : theme
}

export function useIsDark() {
  const themeValue = useThemeValue()
  return themeValue === 'dark'
}

export function useThemeColor(lightColor: string, darkColor: string) {
  const isDark = useIsDark()
  return isDark ? darkColor : lightColor
}

export function withTheme<T extends object>(
  Component: React.ComponentType<T>,
  lightStyles: Partial<T>,
  darkStyles: Partial<T>
) {
  return function ThemedComponent(props: T) {
    const isDark = useIsDark()
    const themeProps = isDark ? darkStyles : lightStyles
    
    return <Component {...props} {...themeProps} />
  }
}

export function useThemeTransition(duration: number = 200) {
  const [isTransitioning, setIsTransitioning] = React.useState<any>(false)
  const { setTheme } = useTheme()
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const toggleTheme = React.useCallback((newTheme: string) => {
    setIsTransitioning(true)
    setTheme(newTheme)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsTransitioning(false)
    }, duration)
  }, [setTheme, duration])

  return {
    isTransitioning,
    toggleTheme,
  }
}

export function useThemedValue<T>(lightValue: T, darkValue: T): T {
  const isDark = useIsDark()
  return isDark ? darkValue : lightValue
}

export function useThemeClass(lightClass: string, darkClass: string): string {
  return useThemedValue(lightClass, darkClass)
}

export function useThemeStyle<T extends React.CSSProperties>(
  lightStyle: T,
  darkStyle: T
): T {
  return useThemedValue(lightStyle, darkStyle)
}
