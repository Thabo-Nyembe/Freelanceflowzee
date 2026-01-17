'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Check,
  ChevronDown,
  ChevronsUpDown,
  Info,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// ============================================================================
// TYPES
// ============================================================================

export interface SelectOption {
  /** Unique value for the option */
  value: string
  /** Display label for the option */
  label: string
  /** Optional description */
  description?: string
  /** Optional icon */
  icon?: React.ReactNode
  /** Whether the option is disabled */
  disabled?: boolean
  /** Optional group name */
  group?: string
}

export interface SelectGroup {
  /** Group label */
  label: string
  /** Options in this group */
  options: SelectOption[]
}

export interface FormSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text shown below the select */
  description?: string
  /** Options to display */
  options: SelectOption[] | SelectGroup[]
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether to enable search functionality */
  searchable?: boolean
  /** Whether to allow clearing the selection */
  clearable?: boolean
  /** Whether to allow multiple selections */
  multiple?: boolean
  /** Maximum number of selections (for multiple mode) */
  maxSelections?: number
  /** Tooltip text for additional information */
  tooltip?: string
  /** Whether the select is in a loading state */
  loading?: boolean
  /** Callback when value changes */
  onValueChange?: (value: string | string[]) => void
  /** Empty state message when no options match search */
  emptyMessage?: string
  /** Custom className */
  className?: string
  /** Trigger className */
  triggerClassName?: string
  /** Content className */
  contentClassName?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isGroupedOptions(options: SelectOption[] | SelectGroup[]): options is SelectGroup[] {
  return options.length > 0 && 'options' in options[0]
}

function flattenOptions(options: SelectOption[] | SelectGroup[]): SelectOption[] {
  if (isGroupedOptions(options)) {
    return options.flatMap(group => group.options)
  }
  return options
}

function groupOptions(options: SelectOption[]): SelectGroup[] {
  const groups: Record<string, SelectOption[]> = {}
  const ungrouped: SelectOption[] = []

  options.forEach(option => {
    if (option.group) {
      if (!groups[option.group]) {
        groups[option.group] = []
      }
      groups[option.group].push(option)
    } else {
      ungrouped.push(option)
    }
  })

  const result: SelectGroup[] = []

  if (ungrouped.length > 0) {
    result.push({ label: '', options: ungrouped })
  }

  Object.entries(groups).forEach(([label, opts]) => {
    result.push({ label, options: opts })
  })

  return result
}

// ============================================================================
// BASIC SELECT (Non-searchable)
// ============================================================================

function BasicSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder = 'Select an option',
  description,
  options,
  required = false,
  disabled = false,
  clearable = false,
  tooltip,
  loading = false,
  onValueChange,
  className,
  triggerClassName,
  contentClassName,
}: Omit<FormSelectProps<TFieldValues, TName>, 'searchable' | 'multiple' | 'maxSelections' | 'emptyMessage'>) {
  const form = useFormContext<TFieldValues>()
  const flatOptions = flattenOptions(options)
  const groupedOptions = isGroupedOptions(options) ? options : groupOptions(flatOptions)

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedOption = flatOptions.find(opt => opt.value === field.value)

        const handleValueChange = (value: string) => {
          field.onChange(value)
          onValueChange?.(value)
        }

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange('')
          onValueChange?.('')
        }

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
                  {label}
                </FormLabel>
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}

            <Select
              value={field.value || ''}
              onValueChange={handleValueChange}
              disabled={disabled || loading}
            >
              <FormControl>
                <SelectTrigger className={cn('relative', triggerClassName)}>
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                      {selectedOption?.icon}
                      <SelectValue placeholder={placeholder} />
                    </div>
                  )}
                  {clearable && field.value && !loading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-transparent absolute right-8"
                      onClick={handleClear}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </SelectTrigger>
              </FormControl>

              <SelectContent className={contentClassName}>
                {groupedOptions.map((group, groupIndex) => (
                  <React.Fragment key={group.label || `ungrouped-${groupIndex}`}>
                    {groupIndex > 0 && <SelectSeparator />}
                    {group.label ? (
                      <SelectGroup>
                        <SelectLabel>{group.label}</SelectLabel>
                        {group.options.map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                          >
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                {option.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ) : (
                      group.options.map(option => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          disabled={option.disabled}
                        >
                          <div className="flex items-center gap-2">
                            {option.icon}
                            <div className="flex flex-col">
                              <span>{option.label}</span>
                              {option.description && (
                                <span className="text-xs text-muted-foreground">
                                  {option.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// SEARCHABLE SELECT (Combobox)
// ============================================================================

function SearchableSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder = 'Select an option',
  description,
  options,
  required = false,
  disabled = false,
  clearable = false,
  tooltip,
  loading = false,
  onValueChange,
  emptyMessage = 'No options found',
  className,
  triggerClassName,
  contentClassName,
}: Omit<FormSelectProps<TFieldValues, TName>, 'searchable' | 'multiple' | 'maxSelections'>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const form = useFormContext<TFieldValues>()
  const flatOptions = flattenOptions(options)
  const groupedOptions = isGroupedOptions(options) ? options : groupOptions(flatOptions)

  const filteredGroups = React.useMemo(() => {
    if (!search) return groupedOptions

    return groupedOptions
      .map(group => ({
        ...group,
        options: group.options.filter(
          option =>
            option.label.toLowerCase().includes(search.toLowerCase()) ||
            option.description?.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter(group => group.options.length > 0)
  }, [groupedOptions, search])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedOption = flatOptions.find(opt => opt.value === field.value)

        const handleSelect = (value: string) => {
          field.onChange(value)
          onValueChange?.(value)
          setOpen(false)
          setSearch('')
        }

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange('')
          onValueChange?.('')
        }

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
                  {label}
                </FormLabel>
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || loading}
                    className={cn(
                      'w-full justify-between font-normal',
                      !field.value && 'text-muted-foreground',
                      triggerClassName
                    )}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-1 overflow-hidden text-left">
                        {selectedOption?.icon}
                        <span className="truncate">
                          {selectedOption?.label || placeholder}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      {clearable && field.value && !loading && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-transparent"
                          onClick={handleClear}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className={cn('w-[--radix-popover-trigger-width] p-0', contentClassName)}>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    {filteredGroups.map((group, groupIndex) => (
                      <React.Fragment key={group.label || `ungrouped-${groupIndex}`}>
                        {groupIndex > 0 && <CommandSeparator />}
                        <CommandGroup heading={group.label || undefined}>
                          {group.options.map(option => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              disabled={option.disabled}
                              onSelect={() => handleSelect(option.value)}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                {option.icon}
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  field.value === option.value
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </React.Fragment>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// MULTI SELECT
// ============================================================================

function MultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder = 'Select options',
  description,
  options,
  required = false,
  disabled = false,
  maxSelections,
  tooltip,
  loading = false,
  onValueChange,
  emptyMessage = 'No options found',
  className,
  triggerClassName,
  contentClassName,
}: Omit<FormSelectProps<TFieldValues, TName>, 'searchable' | 'multiple' | 'clearable'>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const form = useFormContext<TFieldValues>()
  const flatOptions = flattenOptions(options)

  const filteredOptions = React.useMemo(() => {
    if (!search) return flatOptions

    return flatOptions.filter(
      option =>
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        option.description?.toLowerCase().includes(search.toLowerCase())
    )
  }, [flatOptions, search])

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedValues: string[] = Array.isArray(field.value) ? field.value : []
        const selectedOptions = flatOptions.filter(opt => selectedValues.includes(opt.value))
        const isMaxReached = maxSelections ? selectedValues.length >= maxSelections : false

        const handleSelect = (value: string) => {
          let newValues: string[]

          if (selectedValues.includes(value)) {
            newValues = selectedValues.filter(v => v !== value)
          } else if (!isMaxReached) {
            newValues = [...selectedValues, value]
          } else {
            return
          }

          field.onChange(newValues)
          onValueChange?.(newValues)
        }

        const handleRemove = (value: string, e: React.MouseEvent) => {
          e.stopPropagation()
          const newValues = selectedValues.filter(v => v !== value)
          field.onChange(newValues)
          onValueChange?.(newValues)
        }

        const handleClearAll = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange([])
          onValueChange?.([])
        }

        return (
          <FormItem className={cn('space-y-2', className)}>
            {label && (
              <div className="flex items-center gap-2">
                <FormLabel className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
                  {label}
                </FormLabel>
                {maxSelections && (
                  <Badge variant="outline" className="text-xs">
                    {selectedValues.length}/{maxSelections}
                  </Badge>
                )}
                {tooltip && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || loading}
                    className={cn(
                      'w-full min-h-10 h-auto justify-between font-normal',
                      triggerClassName
                    )}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    ) : selectedOptions.length > 0 ? (
                      <div className="flex flex-wrap gap-1 flex-1">
                        {selectedOptions.map(option => (
                          <Badge
                            key={option.value}
                            variant="secondary"
                            className="rounded-sm px-1.5 py-0.5 text-xs"
                          >
                            {option.icon}
                            {option.label}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                              onClick={(e) => handleRemove(option.value, e)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <div className="flex items-center gap-1 ml-2">
                      {selectedOptions.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-transparent"
                          onClick={handleClearAll}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                      <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                    </div>
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent className={cn('w-[--radix-popover-trigger-width] p-0', contentClassName)}>
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList>
                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                    <CommandGroup>
                      {filteredOptions.map(option => {
                        const isSelected = selectedValues.includes(option.value)
                        const isDisabled = option.disabled || (!isSelected && isMaxReached)

                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={isDisabled}
                            onSelect={() => handleSelect(option.value)}
                          >
                            <div
                              className={cn(
                                'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                                isSelected
                                  ? 'bg-primary text-primary-foreground'
                                  : 'opacity-50 [&_svg]:invisible'
                              )}
                            >
                              <Check className="h-4 w-4" />
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              {option.icon}
                              <div className="flex flex-col">
                                <span>{option.label}</span>
                                {option.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {option.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function FormSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: FormSelectProps<TFieldValues, TName>) {
  const { searchable = false, multiple = false } = props

  if (multiple) {
    return <MultiSelect {...props} />
  }

  if (searchable) {
    return <SearchableSelect {...props} />
  }

  return <BasicSelect {...props} />
}

// ============================================================================
// STANDALONE SELECT (without react-hook-form)
// ============================================================================

export interface StandaloneSelectProps {
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Options to display */
  options: SelectOption[] | SelectGroup[]
  /** Current value */
  value?: string | string[]
  /** Callback when value changes */
  onValueChange?: (value: string | string[]) => void
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Whether to enable search functionality */
  searchable?: boolean
  /** Whether to allow clearing */
  clearable?: boolean
  /** Whether to allow multiple selections */
  multiple?: boolean
  /** Maximum selections */
  maxSelections?: number
  /** Tooltip text */
  tooltip?: string
  /** Loading state */
  loading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Custom className */
  className?: string
}

export function StandaloneSelect({
  label,
  placeholder = 'Select an option',
  description,
  error,
  options,
  value,
  onValueChange,
  required = false,
  disabled = false,
  searchable = false,
  clearable = false,
  multiple = false,
  maxSelections,
  tooltip,
  loading = false,
  emptyMessage = 'No options found',
  className,
}: StandaloneSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const flatOptions = flattenOptions(options)
  const groupedOptions = isGroupedOptions(options) ? options : groupOptions(flatOptions)

  const id = React.useId()

  const filteredGroups = React.useMemo(() => {
    if (!search) return groupedOptions

    return groupedOptions
      .map(group => ({
        ...group,
        options: group.options.filter(
          option =>
            option.label.toLowerCase().includes(search.toLowerCase()) ||
            option.description?.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter(group => group.options.length > 0)
  }, [groupedOptions, search])

  if (multiple) {
    const selectedValues: string[] = Array.isArray(value) ? value : []
    const selectedOptions = flatOptions.filter(opt => selectedValues.includes(opt.value))
    const isMaxReached = maxSelections ? selectedValues.length >= maxSelections : false

    const handleSelect = (val: string) => {
      let newValues: string[]
      if (selectedValues.includes(val)) {
        newValues = selectedValues.filter(v => v !== val)
      } else if (!isMaxReached) {
        newValues = [...selectedValues, val]
      } else {
        return
      }
      onValueChange?.(newValues)
    }

    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <div className="flex items-center gap-2">
            <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
              {label}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              role="combobox"
              disabled={disabled || loading}
              className={cn(
                'w-full min-h-10 h-auto justify-between font-normal',
                error && 'border-destructive'
              )}
            >
              {selectedOptions.length > 0 ? (
                <div className="flex flex-wrap gap-1 flex-1">
                  {selectedOptions.map(option => (
                    <Badge key={option.value} variant="secondary" className="rounded-sm px-1.5 py-0.5 text-xs">
                      {option.label}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command shouldFilter={false}>
              <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
              <CommandList>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {flatOptions
                    .filter(opt => !search || opt.label.toLowerCase().includes(search.toLowerCase()))
                    .map(option => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled || (!selectedValues.includes(option.value) && isMaxReached)}
                        onSelect={() => handleSelect(option.value)}
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                            selectedValues.includes(option.value)
                              ? 'bg-primary text-primary-foreground'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <Check className="h-4 w-4" />
                        </div>
                        {option.label}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )
  }

  // Single select
  const selectedOption = flatOptions.find(opt => opt.value === value)

  if (!searchable) {
    return (
      <div className={cn('space-y-2', className)}>
        {label && (
          <div className="flex items-center gap-2">
            <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
              {label}
            </Label>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}

        <Select
          value={value as string || ''}
          onValueChange={(val) => onValueChange?.(val)}
          disabled={disabled || loading}
        >
          <SelectTrigger id={id} className={cn(error && 'border-destructive')}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent>
            {groupedOptions.map((group, groupIndex) => (
              <React.Fragment key={group.label || `ungrouped-${groupIndex}`}>
                {groupIndex > 0 && <SelectSeparator />}
                {group.label ? (
                  <SelectGroup>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.options.map(option => (
                      <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ) : (
                  group.options.map(option => (
                    <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </React.Fragment>
            ))}
          </SelectContent>
        </Select>

        {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )
  }

  // Searchable single select
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
            {label}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            disabled={disabled || loading}
            className={cn(
              'w-full justify-between font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span className="truncate">{selectedOption?.label || placeholder}</span>
            )}
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command shouldFilter={false}>
            <CommandInput placeholder="Search..." value={search} onValueChange={setSearch} />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              {filteredGroups.map((group, groupIndex) => (
                <React.Fragment key={group.label || `ungrouped-${groupIndex}`}>
                  {groupIndex > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.label || undefined}>
                    {group.options.map(option => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        onSelect={() => {
                          onValueChange?.(option.value)
                          setOpen(false)
                          setSearch('')
                        }}
                      >
                        {option.label}
                        <Check
                          className={cn('ml-auto h-4 w-4', value === option.value ? 'opacity-100' : 'opacity-0')}
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
      {error && <p className="text-sm font-medium text-destructive">{error}</p>}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default FormSelect
