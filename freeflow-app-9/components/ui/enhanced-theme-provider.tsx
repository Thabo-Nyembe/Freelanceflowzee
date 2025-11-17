'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

// KAZI Theme Configuration
export interface KAZITheme {
  name: string
  displayName: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    border: string
    input: string
    ring: string
    // KAZI specific colors
    kaziPurple: string
    kaziViolet: string
    kaziGradient: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  borderRadius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
}

export const kaziThemes: Record<string, KAZITheme> = {
  light: {
    name: 'light',
    displayName: 'Light Mode',
    colors: {
      primary: 'hsl(262.1 83.3% 57.8%)', // Purple-600
      secondary: 'hsl(210 40% 96%)',
      accent: 'hsl(210 40% 96%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(222.2 84% 4.9%)',
      muted: 'hsl(210 40% 96%)',
      mutedForeground: 'hsl(215.4 16.3% 46.9%)',
      border: 'hsl(214.3 31.8% 91.4%)',
      input: 'hsl(214.3 31.8% 91.4%)',
      ring: 'hsl(262.1 83.3% 57.8%)',
      kaziPurple: 'hsl(262.1 83.3% 57.8%)',
      kaziViolet: 'hsl(263.4 70% 50.4%)',
      kaziGradient: 'linear-gradient(135deg, hsl(262.1 83.3% 57.8%) 0%, hsl(263.4 70% 50.4%) 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  dark: {
    name: 'dark',
    displayName: 'Dark Mode',
    colors: {
      primary: 'hsl(263.4 70% 50.4%)', // Violet-600
      secondary: 'hsl(217.2 32.6% 17.5%)',
      accent: 'hsl(217.2 32.6% 17.5%)',
      background: 'hsl(222.2 84% 4.9%)',
      foreground: 'hsl(210 40% 98%)',
      muted: 'hsl(217.2 32.6% 17.5%)',
      mutedForeground: 'hsl(215 20.2% 65.1%)',
      border: 'hsl(217.2 32.6% 17.5%)',
      input: 'hsl(217.2 32.6% 17.5%)',
      ring: 'hsl(263.4 70% 50.4%)',
      kaziPurple: 'hsl(262.1 83.3% 57.8%)',
      kaziViolet: 'hsl(263.4 70% 50.4%)',
      kaziGradient: 'linear-gradient(135deg, hsl(262.1 83.3% 57.8%) 0%, hsl(263.4 70% 50.4%) 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.4)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.4)',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
  'kazi-purple': {
    name: 'kazi-purple',
    displayName: 'KAZI Purple',
    colors: {
      primary: 'hsl(262.1 83.3% 57.8%)',
      secondary: 'hsl(262.1 83.3% 95%)',
      accent: 'hsl(262.1 83.3% 95%)',
      background: 'hsl(0 0% 100%)',
      foreground: 'hsl(262.1 83.3% 15%)',
      muted: 'hsl(262.1 83.3% 95%)',
      mutedForeground: 'hsl(262.1 25% 45%)',
      border: 'hsl(262.1 83.3% 85%)',
      input: 'hsl(262.1 83.3% 85%)',
      ring: 'hsl(262.1 83.3% 57.8%)',
      kaziPurple: 'hsl(262.1 83.3% 57.8%)',
      kaziViolet: 'hsl(263.4 70% 50.4%)',
      kaziGradient: 'linear-gradient(135deg, hsl(262.1 83.3% 57.8%) 0%, hsl(263.4 70% 50.4%) 100%)',
    },
    shadows: {
      sm: '0 1px 2px 0 hsl(262.1 83.3% 57.8% / 0.1)',
      md: '0 4px 6px -1px hsl(262.1 83.3% 57.8% / 0.2), 0 2px 4px -2px hsl(262.1 83.3% 57.8% / 0.1)',
      lg: '0 10px 15px -3px hsl(262.1 83.3% 57.8% / 0.2), 0 4px 6px -4px hsl(262.1 83.3% 57.8% / 0.1)',
      xl: '0 20px 25px -5px hsl(262.1 83.3% 57.8% / 0.2), 0 8px 10px -6px hsl(262.1 83.3% 57.8% / 0.1)',
    },
    borderRadius: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem',
    },
  },
}

// Theme Context
interface ThemeContextType {
  currentTheme: KAZITheme
  setTheme: (themeName: string) => void
  availableThemes: Record<string, KAZITheme>
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

// Enhanced Theme Provider
export function EnhancedThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [currentThemeName, setCurrentThemeName] = React.useState('light')

  const currentTheme = kaziThemes[currentThemeName] || kaziThemes.light

  const setTheme = React.useCallback((themeName: string) => {
    if (kaziThemes[themeName]) {
      setCurrentThemeName(themeName)
      // Apply CSS custom properties
      applyThemeVariables(kaziThemes[themeName])
    }
  }, [])

  React.useEffect(() => {
    applyThemeVariables(currentTheme)
  }, [currentTheme])

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    availableThemes: kaziThemes,
  }

  return (
    <NextThemesProvider {...props}>
      <ThemeContext.Provider value={contextValue}>
        {children}
      </ThemeContext.Provider>
    </NextThemesProvider>
  )
}

// Apply theme variables to CSS
function applyThemeVariables(theme: KAZITheme) {
  const root = document.documentElement

  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${kebabCase(key)}`, value)
  })

  // Apply shadow variables
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value)
  })

  // Apply border radius variables
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value)
  })

  // Apply KAZI specific variables
  root.style.setProperty('--kazi-gradient', theme.colors.kaziGradient)
}

// Utility function to convert camelCase to kebab-case
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase()
}

// Hook to use theme
export function useKAZITheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useKAZITheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// Theme-aware component wrapper
export function withTheme<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ThemedComponent(props: P) {
    const { currentTheme } = useKAZITheme()
    
    return (
      <div
        style={{
          '--theme-primary': currentTheme.colors.primary,
          '--theme-secondary': currentTheme.colors.secondary,
          '--theme-kazi-gradient': currentTheme.colors.kaziGradient,
        } as React.CSSProperties}
      >
        <Component {...props} />
      </div>
    )
  }
}

// Utility classes for theme-aware styling
export const themeClasses = {
  gradient: 'bg-gradient-to-r from-purple-500 to-violet-600',
  gradientText: 'bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent',
  glassMorphism: 'bg-white/80 backdrop-blur-xl border border-white/30',
  card: 'bg-background border border-border rounded-lg shadow-sm',
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  },
}

// Theme-aware CSS variables
export const cssVariables = {
  colors: {
    primary: 'var(--primary)',
    secondary: 'var(--secondary)',
    background: 'var(--background)',
    foreground: 'var(--foreground)',
    kaziPurple: 'var(--kazi-purple)',
    kaziViolet: 'var(--kazi-violet)',
    kaziGradient: 'var(--kazi-gradient)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
}



