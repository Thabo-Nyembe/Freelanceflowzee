import React from 'react'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return <>{children}</>
}

export const useTheme = () => {
  return {
    theme: 'light' as const,
    setTheme: () => {},
    systemTheme: 'light' as const
  }
} 