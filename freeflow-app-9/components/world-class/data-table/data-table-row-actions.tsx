"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import {
  Copy,
  Edit,
  MoreHorizontal,
  Trash2,
  Eye,
  Share2,
  Download,
  Archive,
  Star,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Action types for the row actions
export interface DataTableRowAction<TData> {
  label: string
  icon?: React.ReactNode
  onClick: (row: TData) => void
  shortcut?: string
  variant?: "default" | "destructive"
  disabled?: boolean | ((row: TData) => boolean)
  hidden?: boolean | ((row: TData) => boolean)
}

export interface DataTableRowActionGroup<TData> {
  label: string
  actions: DataTableRowAction<TData>[]
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  actions?: DataTableRowAction<TData>[]
  actionGroups?: DataTableRowActionGroup<TData>[]
  onView?: (row: TData) => void
  onEdit?: (row: TData) => void
  onDelete?: (row: TData) => void
  onCopy?: (row: TData) => void
  onShare?: (row: TData) => void
  onDownload?: (row: TData) => void
  onArchive?: (row: TData) => void
  onFavorite?: (row: TData) => void
}

export function DataTableRowActions<TData>({
  row,
  actions,
  actionGroups,
  onView,
  onEdit,
  onDelete,
  onCopy,
  onShare,
  onDownload,
  onArchive,
  onFavorite,
}: DataTableRowActionsProps<TData>) {
  const data = row.original

  // Check if action should be hidden
  const isHidden = (hidden: boolean | ((row: TData) => boolean) | undefined) => {
    if (typeof hidden === "function") return hidden(data)
    return hidden
  }

  // Check if action should be disabled
  const isDisabled = (disabled: boolean | ((row: TData) => boolean) | undefined) => {
    if (typeof disabled === "function") return disabled(data)
    return disabled
  }

  // Build default actions if individual handlers are provided
  const defaultActions: DataTableRowAction<TData>[] = []

  if (onView) {
    defaultActions.push({
      label: "View",
      icon: <Eye className="mr-2 h-4 w-4" />,
      onClick: onView,
      shortcut: "V",
    })
  }

  if (onEdit) {
    defaultActions.push({
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: onEdit,
      shortcut: "E",
    })
  }

  if (onCopy) {
    defaultActions.push({
      label: "Copy",
      icon: <Copy className="mr-2 h-4 w-4" />,
      onClick: onCopy,
      shortcut: "C",
    })
  }

  if (onShare) {
    defaultActions.push({
      label: "Share",
      icon: <Share2 className="mr-2 h-4 w-4" />,
      onClick: onShare,
    })
  }

  if (onDownload) {
    defaultActions.push({
      label: "Download",
      icon: <Download className="mr-2 h-4 w-4" />,
      onClick: onDownload,
    })
  }

  if (onArchive) {
    defaultActions.push({
      label: "Archive",
      icon: <Archive className="mr-2 h-4 w-4" />,
      onClick: onArchive,
    })
  }

  if (onFavorite) {
    defaultActions.push({
      label: "Favorite",
      icon: <Star className="mr-2 h-4 w-4" />,
      onClick: onFavorite,
      shortcut: "F",
    })
  }

  if (onDelete) {
    defaultActions.push({
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      onClick: onDelete,
      shortcut: "Del",
      variant: "destructive",
    })
  }

  // Combine custom actions with default actions
  const allActions = [...(actions || []), ...defaultActions]

  // If no actions at all, return null
  if (allActions.length === 0 && (!actionGroups || actionGroups.length === 0)) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Render action groups if provided */}
        {actionGroups?.map((group, groupIndex) => (
          <React.Fragment key={group.label}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{group.label}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {group.actions.map((action) => {
                  if (isHidden(action.hidden)) return null
                  return (
                    <DropdownMenuItem
                      key={action.label}
                      onClick={() => action.onClick(data)}
                      disabled={isDisabled(action.disabled)}
                      className={
                        action.variant === "destructive"
                          ? "text-destructive focus:text-destructive"
                          : ""
                      }
                    >
                      {action.icon}
                      {action.label}
                      {action.shortcut && (
                        <DropdownMenuShortcut>
                          {action.shortcut}
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {groupIndex < (actionGroups?.length || 0) - 1 && (
              <DropdownMenuSeparator />
            )}
          </React.Fragment>
        ))}

        {/* Add separator if we have both groups and individual actions */}
        {actionGroups && actionGroups.length > 0 && allActions.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {/* Render individual actions */}
        {allActions.map((action, index) => {
          if (isHidden(action.hidden)) return null

          const isDestructive = action.variant === "destructive"

          // Add separator before destructive actions
          const showSeparator =
            isDestructive &&
            index > 0 &&
            allActions[index - 1]?.variant !== "destructive"

          return (
            <React.Fragment key={action.label}>
              {showSeparator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={() => action.onClick(data)}
                disabled={isDisabled(action.disabled)}
                className={
                  isDestructive
                    ? "text-destructive focus:text-destructive"
                    : ""
                }
              >
                {action.icon}
                {action.label}
                {action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            </React.Fragment>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
