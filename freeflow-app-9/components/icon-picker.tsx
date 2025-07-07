"use client";

import * as React from 'react'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'
import * as Icons from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

type IconType = keyof typeof Icons
type IconPickerProps = {
  onChange: (icon: IconType) => void
  value?: IconType
  className?: string
}

const iconCategories = {
  'Common Actions': [
    'Save',
    'Edit',
    'Delete',
    'Add',
    'Remove',
    'Check',
    'X',
    'Search',
    'Settings',
    'Menu',
  ],
  'User Interface': [
    'ChevronDown',
    'ChevronUp',
    'ChevronLeft',
    'ChevronRight',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
  ],
  'User & Account': [
    'User',
    'Users',
    'UserPlus',
    'UserMinus',
    'Mail',
    'Lock',
    'Unlock',
    'Key',
  ],
  'Files & Media': [
    'File',
    'FileText',
    'Image',
    'Video',
    'Music',
    'Upload',
    'Download',
    'Folder',
  ],
  'Communication': [
    'MessageSquare',
    'MessageCircle',
    'Send',
    'Phone',
    'Bell',
    'Share',
    'Link',
    'Globe',
  ],
} as const

export function IconPicker({ onChange, value, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  const SelectedIcon = value ? Icons[value] : Icons.Image

  const filteredIcons = React.useMemo(() => {
    const searchLower = search.toLowerCase()
    const result: { [key: string]: string[] } = {}

    Object.entries(iconCategories).forEach(([category, icons]) => {
      const filtered = icons.filter((icon) =>
        icon.toLowerCase().includes(searchLower)
      )
      if (filtered.length > 0) {
        result[category] = filtered
      }
    })

    return result
  }, [search])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn('h-10 w-10', className)}
        >
          <SelectedIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search icons..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <ScrollArea className="h-[300px]">
            {Object.entries(filteredIcons).length > 0 ? (
              Object.entries(filteredIcons).map(([category, icons]) => (
                <Command.Group
                  key={category}
                  heading={category}
                  className="p-2"
                >
                  <div className="grid grid-cols-6 gap-2">
                    {icons.map((icon) => {
                      const Icon = Icons[icon as IconType]
                      return (
                        <Command.Item
                          key={icon}
                          onSelect={() => {
                            onChange(icon as IconType)
                            setOpen(false)
                          }}
                          className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-md border hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                          <Icon className="h-6 w-6" />
                        </Command.Item>
                      )
                    })}
                  </div>
                </Command.Group>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No icons found.
              </div>
            )}
          </ScrollArea>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
