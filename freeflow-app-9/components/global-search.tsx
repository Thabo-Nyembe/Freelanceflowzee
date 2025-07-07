"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import {
  Calculator,
  Calendar,
  CreditCard,
  File,
  Settings,
  Smile,
  User,
  Search,
  X,
} from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const groups = [
  {
    name: 'Suggestions',
    items: [
      {
        id: 'profile',
        name: 'View Profile',
        shortcut: ['P'],
        icon: User,
        url: '/profile',
      },
      {
        id: 'calendar',
        name: 'Calendar',
        shortcut: ['C'],
        icon: Calendar,
        url: '/calendar',
      },
      {
        id: 'settings',
        name: 'Settings',
        shortcut: ['S'],
        icon: Settings,
        url: '/settings',
      },
      {
        id: 'billing',
        name: 'Billing',
        shortcut: ['B'],
        icon: CreditCard,
        url: '/billing',
      },
    ],
  },
  {
    name: 'Recent',
    items: [
      {
        id: 'doc1',
        name: 'Project Proposal',
        shortcut: [],
        icon: File,
        url: '/docs/proposal',
      },
      {
        id: 'doc2',
        name: 'Meeting Notes',
        shortcut: [],
        icon: File,
        url: '/docs/meeting',
      },
    ],
  },
]

interface GlobalSearchProps {
  onClose?: () => void
}

export default function GlobalSearch({ onClose }: GlobalSearchProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = useCallback((command: { id: string; url: string }) => {
    setOpen(false)
    router.push(command.url)
    onClose?.()
  }, [router, onClose])

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search documentation...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0">
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
            <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or search..."
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setSearch('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
              <Command.Empty className="py-6 text-center text-sm">
                No results found.
              </Command.Empty>
              {groups.map((group) => (
                <Command.Group key={group.name} heading={group.name}>
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.id}
                      value={item.name}
                      onSelect={() => runCommand(item)}
                      className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </div>
                      {item.shortcut?.length ? (
                        <kbd className="ml-auto flex gap-1">
                          {item.shortcut.map((key, index) => (
                            <span
                              key={index}
                              className="text-xs bg-muted px-1.5 py-0.5 rounded"
                            >
                              {key}
                            </span>
                          ))}
                        </kbd>
                      ) : null}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
