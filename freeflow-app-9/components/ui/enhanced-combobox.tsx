'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Plus, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'

export interface ComboboxOption {
  value: string
  label: string
  description?: string
  icon?: React.ElementType
  disabled?: boolean
  group?: string
}

interface EnhancedComboboxProps {
  options: ComboboxOption[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  multiple?: boolean
  creatable?: boolean
  onCreate?: (value: string) => void
  className?: string
  disabled?: boolean
  maxSelected?: number
}

export function EnhancedCombobox({
  options,
  value,
  onValueChange,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search options...',
  emptyMessage = 'No options found.',
  multiple = false,
  creatable = false,
  onCreate,
  className,
  disabled = false,
  maxSelected,
}: EnhancedComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState('')

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : []
    }
    return typeof value === 'string' ? [value] : []
  }, [value, multiple])

  const groupedOptions = React.useMemo(() => {
    const groups: Record<string, ComboboxOption[]> = {}
    const ungrouped: ComboboxOption[] = []

    options.forEach((option) => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = []
        }
        groups[option.group].push(option)
      } else {
        ungrouped.push(option)
      }
    })

    return { groups, ungrouped }
  }, [options])

  const filteredOptions = React.useMemo(() => {
    if (!searchValue) return options

    return options.filter((option) =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]

      if (maxSelected && newValues.length > maxSelected) {
        return
      }

      onValueChange?.(newValues)
    } else {
      onValueChange?.(optionValue)
      setOpen(false)
    }
  }

  const handleRemove = (optionValue: string, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    if (multiple) {
      const newValues = selectedValues.filter((v) => v !== optionValue)
      onValueChange?.(newValues)
    } else {
      onValueChange?.('')
    }
  }

  const handleCreate = () => {
    if (creatable && searchValue && onCreate) {
      onCreate(searchValue)
      setSearchValue('')
      if (!multiple) {
        setOpen(false)
      }
    }
  }

  const getSelectedLabels = () => {
    return selectedValues
      .map((val) => options.find((opt) => opt.value === val)?.label)
      .filter(Boolean)
  }

  const displayValue = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return placeholder
    }

    if (multiple) {
      if (selectedValues.length === 1) {
        return options.find((opt) => opt.value === selectedValues[0])?.label || placeholder
      }
      return `${selectedValues.length} selected`
    }

    return options.find((opt) => opt.value === selectedValues[0])?.label || placeholder
  }, [selectedValues, options, placeholder, multiple])

  const canCreate = creatable && searchValue && !options.some(
    (opt) => opt.label.toLowerCase() === searchValue.toLowerCase()
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            selectedValues.length === 0 && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-1 overflow-hidden">
            {multiple && selectedValues.length > 1 ? (
              <div className="flex items-center gap-1">
                <span>{displayValue}</span>
                {selectedValues.length <= 3 && (
                  <div className="flex gap-1">
                    {getSelectedLabels().slice(0, 3).map((label, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="h-5 text-xs"
                      >
                        {label}
                        <X
                          className="ml-1 h-3 w-3 cursor-pointer"
                          onClick={(e) => handleRemove(selectedValues[index], e)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="truncate">{displayValue}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              <div className="py-6 text-center text-sm">
                {emptyMessage}
                {canCreate && (
                  <Button
                    variant="ghost"
                    className="mt-2 h-8 w-full"
                    onClick={handleCreate}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </Button>
                )}
              </div>
            </CommandEmpty>

            {/* Ungrouped options */}
            {groupedOptions.ungrouped.length > 0 && (
              <CommandGroup>
                {groupedOptions.ungrouped
                  .filter((option) =>
                    option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                    option.description?.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedValues.includes(option.value)
                    
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        onSelect={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className="flex items-center gap-2"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        {Icon && <Icon className="h-4 w-4" />}
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-muted-foreground">
                              {option.description}
                            </div>
                          )}
                        </div>
                      </CommandItem>
                    )
                  })}
              </CommandGroup>
            )}

            {/* Grouped options */}
            {Object.entries(groupedOptions.groups).map(([groupName, groupOptions], index) => {
              const filteredGroupOptions = groupOptions.filter((option) =>
                option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
                option.description?.toLowerCase().includes(searchValue.toLowerCase())
              )

              if (filteredGroupOptions.length === 0) return null

              return (
                <React.Fragment key={groupName}>
                  {index > 0 || groupedOptions.ungrouped.length > 0 ? (
                    <Separator />
                  ) : null}
                  <CommandGroup heading={groupName}>
                    {filteredGroupOptions.map((option) => {
                      const Icon = option.icon
                      const isSelected = selectedValues.includes(option.value)
                      
                      return (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => handleSelect(option.value)}
                          disabled={option.disabled}
                          className="flex items-center gap-2"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              isSelected ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {Icon && <Icon className="h-4 w-4" />}
                          <div className="flex-1">
                            <div className="font-medium">{option.label}</div>
                            {option.description && (
                              <div className="text-xs text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </React.Fragment>
              )
            })}

            {/* Create option */}
            {canCreate && (
              <>
                <Separator />
                <CommandGroup>
                  <CommandItem onSelect={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchValue}"
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Preset configurations for common use cases
export const projectCombobox = (projects: { id: string; name: string; description?: string }[]) => ({
  options: projects.map((project) => ({
    value: project.id,
    label: project.name,
    description: project.description,
  })),
  placeholder: 'Select project...',
  searchPlaceholder: 'Search projects...',
  emptyMessage: 'No projects found.',
})

export const userCombobox = (users: { id: string; name: string; email: string; avatar?: string }[]) => ({
  options: users.map((user) => ({
    value: user.id,
    label: user.name,
    description: user.email,
  })),
  placeholder: 'Select user...',
  searchPlaceholder: 'Search users...',
  emptyMessage: 'No users found.',
  multiple: true,
})

export const tagCombobox = (tags: string[]) => ({
  options: tags.map((tag) => ({
    value: tag,
    label: tag,
  })),
  placeholder: 'Select tags...',
  searchPlaceholder: 'Search tags...',
  emptyMessage: 'No tags found.',
  multiple: true,
  creatable: true,
})



