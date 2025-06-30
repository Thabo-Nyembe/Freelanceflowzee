'use client'

import React, { useState, useEffect, useReducer } from 'react'
import Link from 'next/link'
 id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DELETE'; id: string }
  | { type: 'SET_FILTER'; filter: string }
  | { type: 'TOGGLE_EXPANDED' }
  | { type: 'REFRESH_NOTIFICATIONS' }

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0
      }
    case 'DELETE':
      const deletedNotification = state.notifications.find(n => n.id === action.id)
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.id),
        unreadCount: deletedNotification && !deletedNotification.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      }
    case 'SET_FILTER':
      return {
        ...state,
        selectedType: action.filter
      }
    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        isExpanded: !state.isExpanded
      }
    case 'REFRESH_NOTIFICATIONS':
      return {
        ...state,
        notifications: mockNotifications,
        unreadCount: mockNotifications.filter(n => !n.read).length
      }
    default:
      return state
  }
}

// ========================================
// MAIN DASHBOARD NAVIGATION COMPONENT
// ========================================

interface DashboardNavProps {
  className?: string
  onLogout?: () => void
  user?: unknown
  setOpen?: (open: boolean) => void
}

export function DashboardNav({ className, onLogout, user, setOpen }: DashboardNavProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className= "mobile-header lg:hidden">
        <Link href= "/dashboard" className= "flex items-center gap-2">
          <div className= "w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className= "text-white font-bold text-sm">F</span>
          </div>
          <span className= "font-semibold text-gray-900">FreeflowZee</span>
        </Link>
        
        <button
          onClick={toggleMobileMenu}
          className="mobile-menu-button"
          aria-label= "Toggle mobile menu
          data-testid="mobile-menu
        >"
          <Menu className= "h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className= "fixed inset-0 z-50 lg:hidden">
          <div className= "fixed inset-0 bg-purple-100/80 backdrop-blur-sm" onClick={toggleMobileMenu} />
          <div className= "fixed top-0 right-0 h-full w-80 bg-white shadow-xl">
            <div className= "flex items-center justify-between p-4 border-b">
              <span className= "font-semibold">Menu</span>
              <button
                onClick={toggleMobileMenu}
                className="button-touch"
                aria-label= "Close menu
              >
                <X className= "h-5 w-5" />
              </button>
            </div>
            <div className= "p-4 space-y-2">
              {consolidatedNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMobileMenu}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors button-touch",
                    pathname === item.href
                      ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon className= "h-5 w-5" />
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className= "pt-4 mt-4 border-t space-y-2">
                <div className= "px-3 py-2">
                  <div className= "text-sm font-medium text-gray-900">{user?.email}</div>
                  <div className= "text-xs text-gray-500">Creator Account</div>
                </div>
                <button
                  onClick={() => {
                    onLogout?.();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 px-3 py-3 w-full text-left rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 button-touch
                >"
                  <LogOut className= "h-5 w-5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out desktop-only",
        collapsed ? "-translate-x-48" : 'translate-x-0'
      )}>
        <div className= "flex h-full flex-col">
          {/* Header */}
          <div className= "flex items-center justify-between p-6 border-b border-gray-200">
            <Link href= "/dashboard" className= "flex items-center gap-2">
              <div className= "w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className= "text-white font-bold text-sm">F</span>
              </div>
              {!collapsed && <span className= "font-semibold text-gray-900">FreeflowZee</span>}
            </Link>
            <Button
              variant="ghost"
              size= "sm
              onClick={() => setCollapsed(!collapsed)}
              className="button-touch"
              data-testid="sidebar-toggle
            >"
              {collapsed ? <ChevronRight className= "h-4 w-4" /> : <ChevronLeft className= "h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className= "flex-1 space-y-1 p-4">
            {consolidatedNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors button-touch",
                  pathname === item.href
                    ? "bg-indigo-50 text-indigo-700 border-r-2 border-indigo-700
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                data-testid={`nav-${item.href.split('/').pop()}`}
              >
                <item.icon className= "h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          {!collapsed && (
            <div className= "p-4 border-t border-gray-200">
              <div className= "flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className= "w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <span className= "text-white text-sm font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className= "flex-1 min-w-0">
                  <div className= "text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </div>
                  <div className= "text-xs text-gray-500">Creator Account</div>
                </div>
              </div>
              <Button
                variant="ghost
                onClick={() => onLogout?.()}"
                className="w-full mt-2 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 button-touch"
                data-testid="logout-button
              >"
                <LogOut className= "h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className= "mobile-nav-container lg:hidden">
        <div className= "flex justify-around items-center">
          {consolidatedNavigation.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mobile-nav-item",
                pathname === item.href ? "active" : 
              )}
              data-testid={`mobile-nav-${item.href.split('/').pop()}`}
            >
              <item.icon className= "h-5 w-5" />
              <span className= "text-xs font-medium">{item.name.split(&apos; ')[0]}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}