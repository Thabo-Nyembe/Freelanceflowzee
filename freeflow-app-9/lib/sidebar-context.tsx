/**
 * Sidebar Context - Global Sidebar State Management
 * 
 * Manages sidebar collapse/expand state across the application
 * with localStorage persistence
 */

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface SidebarContextValue {
    isCollapsed: boolean
    toggleSidebar: () => void
    setSidebarCollapsed: (collapsed: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within SidebarProvider')
    }
    return context
}

interface SidebarProviderProps {
    children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    // Load saved state from localStorage on mount
    useEffect(() => {
        setIsMounted(true)
        const saved = localStorage.getItem('kazi-sidebar-collapsed')
        if (saved !== null) {
            setIsCollapsed(saved === 'true')
        }
    }, [])

    const toggleSidebar = () => {
        setIsCollapsed(prev => {
            const newValue = !prev
            if (isMounted) {
                localStorage.setItem('kazi-sidebar-collapsed', String(newValue))
            }
            return newValue
        })
    }

    const setSidebarCollapsed = (collapsed: boolean) => {
        setIsCollapsed(collapsed)
        if (isMounted) {
            localStorage.setItem('kazi-sidebar-collapsed', String(collapsed))
        }
    }

    const value: SidebarContextValue = {
        isCollapsed,
        toggleSidebar,
        setSidebarCollapsed
    }

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    )
}
