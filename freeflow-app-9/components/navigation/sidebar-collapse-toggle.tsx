/**
 * Sidebar Collapse Toggle Button Component
 * 
 * Standalone toggle button to be added at the bottom of the sidebar
 */

'use client'

import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useSidebar } from '@/lib/sidebar-context'
import { cn } from '@/lib/utils'

export function SidebarCollapseToggle() {
    const { isCollapsed, toggleSidebar } = useSidebar()

    return (
        <div className="px-4 pb-2 border-t border-gray-200 dark:border-gray-800 pt-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                    "w-full justify-start gap-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                    isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {isCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                ) : (
                    <>
                        <PanelLeftClose className="h-4 w-4" />
                        <span>Collapse Sidebar</span>
                    </>
                )}
            </Button>
        </div>
    )
}
