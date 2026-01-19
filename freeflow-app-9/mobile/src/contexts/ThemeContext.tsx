/**
 * Theme Context
 *
 * Dark/Light mode support for mobile app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  isDark: boolean
  setTheme: (theme: Theme) => void
  colors: typeof lightColors
}

const lightColors = {
  background: '#ffffff',
  surface: '#f4f4f5',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  secondary: '#f4f4f5',
  secondaryForeground: '#18181b',
  muted: '#f4f4f5',
  mutedForeground: '#71717a',
  accent: '#f4f4f5',
  accentForeground: '#18181b',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e4e4e7',
  input: '#e4e4e7',
  ring: '#6366f1',
  text: '#09090b',
  textMuted: '#71717a',
  card: '#ffffff',
  cardForeground: '#09090b',
}

const darkColors = {
  background: '#09090b',
  surface: '#18181b',
  primary: '#6366f1',
  primaryForeground: '#ffffff',
  secondary: '#27272a',
  secondaryForeground: '#fafafa',
  muted: '#27272a',
  mutedForeground: '#a1a1aa',
  accent: '#27272a',
  accentForeground: '#fafafa',
  destructive: '#dc2626',
  destructiveForeground: '#ffffff',
  border: '#27272a',
  input: '#27272a',
  ring: '#6366f1',
  text: '#fafafa',
  textMuted: '#a1a1aa',
  card: '#18181b',
  cardForeground: '#fafafa',
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme()
  const [theme, setThemeState] = useState<Theme>('system')

  const isDark = theme === 'system'
    ? systemColorScheme === 'dark'
    : theme === 'dark'

  const colors = isDark ? darkColors : lightColors

  useEffect(() => {
    loadTheme()
  }, [])

  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem('theme')
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as Theme)
      }
    } catch (error) {
      console.error('Failed to load theme:', error)
    }
  }

  async function setTheme(newTheme: Theme) {
    setThemeState(newTheme)
    try {
      await AsyncStorage.setItem('theme', newTheme)
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
