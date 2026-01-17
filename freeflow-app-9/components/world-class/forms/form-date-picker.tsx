'use client'

import * as React from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'
import { z } from 'zod'
import { format, isValid, parse, isAfter, isBefore, isWithinInterval, addDays, subDays } from 'date-fns'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

// ============================================================================
// TYPES
// ============================================================================

export interface FormDatePickerProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  /** Field name for react-hook-form */
  name: TName
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text shown below the picker */
  description?: string
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Tooltip text for additional information */
  tooltip?: string
  /** Callback when value changes */
  onValueChange?: (value: Date | DateRange | undefined) => void
  /** Date format for display */
  dateFormat?: string
  /** Minimum selectable date */
  minDate?: Date
  /** Maximum selectable date */
  maxDate?: Date
  /** Dates that cannot be selected */
  disabledDates?: Date[]
  /** Days of the week that cannot be selected (0 = Sunday, 6 = Saturday) */
  disabledDaysOfWeek?: number[]
  /** Whether to allow clearing the selection */
  clearable?: boolean
  /** Whether to enable range selection */
  range?: boolean
  /** Number of months to display */
  numberOfMonths?: number
  /** Whether to show preset ranges */
  showPresets?: boolean
  /** Custom preset ranges */
  presets?: DatePreset[]
  /** Whether to show time picker */
  showTimePicker?: boolean
  /** Custom className */
  className?: string
  /** Trigger className */
  triggerClassName?: string
  /** Content className */
  contentClassName?: string
}

export interface DatePreset {
  /** Display label */
  label: string
  /** The date or date range */
  value: Date | DateRange
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const dateValidationSchemas = {
  required: z.date({
    required_error: 'Please select a date',
    invalid_type_error: 'Invalid date',
  }),
  optional: z.date().optional(),
  futureDate: z.date().refine(
    (date) => date > new Date(),
    'Date must be in the future'
  ),
  pastDate: z.date().refine(
    (date) => date < new Date(),
    'Date must be in the past'
  ),
  dateRange: z.object({
    from: z.date({ required_error: 'Start date is required' }),
    to: z.date({ required_error: 'End date is required' }),
  }).refine(
    (range) => range.from <= range.to,
    'Start date must be before end date'
  ),
}

// ============================================================================
// DEFAULT PRESETS
// ============================================================================

const defaultPresets: DatePreset[] = [
  { label: 'Today', value: new Date() },
  { label: 'Tomorrow', value: addDays(new Date(), 1) },
  { label: 'In 3 days', value: addDays(new Date(), 3) },
  { label: 'In a week', value: addDays(new Date(), 7) },
  { label: 'In 2 weeks', value: addDays(new Date(), 14) },
  { label: 'In a month', value: addDays(new Date(), 30) },
]

const defaultRangePresets: DatePreset[] = [
  {
    label: 'Today',
    value: { from: new Date(), to: new Date() },
  },
  {
    label: 'Last 7 days',
    value: { from: subDays(new Date(), 7), to: new Date() },
  },
  {
    label: 'Last 14 days',
    value: { from: subDays(new Date(), 14), to: new Date() },
  },
  {
    label: 'Last 30 days',
    value: { from: subDays(new Date(), 30), to: new Date() },
  },
  {
    label: 'Last 90 days',
    value: { from: subDays(new Date(), 90), to: new Date() },
  },
  {
    label: 'Next 7 days',
    value: { from: new Date(), to: addDays(new Date(), 7) },
  },
  {
    label: 'Next 30 days',
    value: { from: new Date(), to: addDays(new Date(), 30) },
  },
]

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface MonthYearSelectorProps {
  date: Date
  onDateChange: (date: Date) => void
  minDate?: Date
  maxDate?: Date
}

function MonthYearSelector({ date, onDateChange, minDate, maxDate }: MonthYearSelectorProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const currentYear = new Date().getFullYear()
  const minYear = minDate?.getFullYear() || currentYear - 100
  const maxYear = maxDate?.getFullYear() || currentYear + 100
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i)

  const handleMonthChange = (month: string) => {
    const newDate = new Date(date)
    newDate.setMonth(parseInt(month))
    onDateChange(newDate)
  }

  const handleYearChange = (year: string) => {
    const newDate = new Date(date)
    newDate.setFullYear(parseInt(year))
    onDateChange(newDate)
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <Select value={date.getMonth().toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-8 w-[110px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={date.getFullYear().toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-8 w-[80px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface TimePickerProps {
  date: Date | undefined
  onChange: (date: Date | undefined) => void
}

function TimePicker({ date, onChange }: TimePickerProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const handleHourChange = (hour: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setHours(parseInt(hour), 0, 0, 0)
      onChange(newDate)
    } else {
      const newDate = new Date(date)
      newDate.setHours(parseInt(hour))
      onChange(newDate)
    }
  }

  const handleMinuteChange = (minute: string) => {
    if (!date) {
      const newDate = new Date()
      newDate.setHours(0, parseInt(minute), 0, 0)
      onChange(newDate)
    } else {
      const newDate = new Date(date)
      newDate.setMinutes(parseInt(minute))
      onChange(newDate)
    }
  }

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-t">
      <span className="text-sm text-muted-foreground">Time:</span>
      <Select
        value={date?.getHours().toString() || '0'}
        onValueChange={handleHourChange}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select
        value={date?.getMinutes().toString() || '0'}
        onValueChange={handleMinuteChange}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, '0')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ============================================================================
// SINGLE DATE PICKER
// ============================================================================

function SingleDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder = 'Pick a date',
  description,
  required = false,
  disabled = false,
  tooltip,
  onValueChange,
  dateFormat = 'PPP',
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  clearable = false,
  numberOfMonths = 1,
  showPresets = false,
  presets = defaultPresets,
  showTimePicker = false,
  className,
  triggerClassName,
  contentClassName,
}: Omit<FormDatePickerProps<TFieldValues, TName>, 'range'>) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(new Date())
  const form = useFormContext<TFieldValues>()

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true
    if (maxDate && isAfter(date, maxDate)) return true
    if (disabledDaysOfWeek.includes(date.getDay())) return true
    if (disabledDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) return true
    return false
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedDate = field.value as Date | undefined

        const handleSelect = (date: Date | undefined) => {
          if (date && showTimePicker && selectedDate) {
            // Preserve time when selecting a new date
            date.setHours(selectedDate.getHours(), selectedDate.getMinutes())
          }
          field.onChange(date)
          onValueChange?.(date)
          if (!showTimePicker && date) {
            setOpen(false)
          }
        }

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange(undefined)
          onValueChange?.(undefined)
        }

        const handlePresetSelect = (preset: DatePreset) => {
          const date = preset.value as Date
          field.onChange(date)
          onValueChange?.(date)
          if (!showTimePicker) {
            setOpen(false)
          }
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
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground',
                      triggerClassName
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      <span>
                        {format(selectedDate, dateFormat)}
                        {showTimePicker && ` ${format(selectedDate, 'HH:mm')}`}
                      </span>
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    {clearable && selectedDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-auto hover:bg-transparent"
                        onClick={handleClear}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className={cn('w-auto p-0', contentClassName)}
                align="start"
              >
                <div className="flex">
                  {/* Presets Sidebar */}
                  {showPresets && presets.length > 0 && (
                    <div className="border-r p-2 space-y-1">
                      {presets.map((preset) => (
                        <Button
                          key={preset.label}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  <div>
                    <MonthYearSelector
                      date={month}
                      onDateChange={setMonth}
                      minDate={minDate}
                      maxDate={maxDate}
                    />
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleSelect}
                      month={month}
                      onMonthChange={setMonth}
                      disabled={isDateDisabled}
                      numberOfMonths={numberOfMonths}
                      initialFocus
                    />
                    {showTimePicker && (
                      <TimePicker date={selectedDate} onChange={handleSelect} />
                    )}
                  </div>
                </div>
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
// DATE RANGE PICKER
// ============================================================================

function DateRangePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  name,
  label,
  placeholder = 'Pick a date range',
  description,
  required = false,
  disabled = false,
  tooltip,
  onValueChange,
  dateFormat = 'LLL dd, y',
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  clearable = false,
  numberOfMonths = 2,
  showPresets = false,
  presets = defaultRangePresets,
  className,
  triggerClassName,
  contentClassName,
}: Omit<FormDatePickerProps<TFieldValues, TName>, 'range' | 'showTimePicker'>) {
  const [open, setOpen] = React.useState(false)
  const form = useFormContext<TFieldValues>()

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true
    if (maxDate && isAfter(date, maxDate)) return true
    if (disabledDaysOfWeek.includes(date.getDay())) return true
    if (disabledDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) return true
    return false
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        const selectedRange = field.value as DateRange | undefined

        const handleSelect = (range: DateRange | undefined) => {
          field.onChange(range)
          onValueChange?.(range)
        }

        const handleClear = (e: React.MouseEvent) => {
          e.stopPropagation()
          field.onChange(undefined)
          onValueChange?.(undefined)
        }

        const handlePresetSelect = (preset: DatePreset) => {
          const range = preset.value as DateRange
          field.onChange(range)
          onValueChange?.(range)
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
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedRange && 'text-muted-foreground',
                      triggerClassName
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedRange?.from ? (
                      selectedRange.to ? (
                        <span>
                          {format(selectedRange.from, dateFormat)} -{' '}
                          {format(selectedRange.to, dateFormat)}
                        </span>
                      ) : (
                        <span>{format(selectedRange.from, dateFormat)}</span>
                      )
                    ) : (
                      <span>{placeholder}</span>
                    )}
                    {clearable && selectedRange && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 ml-auto hover:bg-transparent"
                        onClick={handleClear}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>

              <PopoverContent
                className={cn('w-auto p-0', contentClassName)}
                align="start"
              >
                <div className="flex">
                  {/* Presets Sidebar */}
                  {showPresets && presets.length > 0 && (
                    <div className="border-r p-2 space-y-1 min-w-[140px]">
                      {presets.map((preset) => (
                        <Button
                          key={preset.label}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => handlePresetSelect(preset)}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                  )}

                  <Calendar
                    mode="range"
                    selected={selectedRange}
                    onSelect={handleSelect}
                    disabled={isDateDisabled}
                    numberOfMonths={numberOfMonths}
                    initialFocus
                  />
                </div>
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

export function FormDatePicker<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(props: FormDatePickerProps<TFieldValues, TName>) {
  const { range = false } = props

  if (range) {
    return <DateRangePicker {...props} />
  }

  return <SingleDatePicker {...props} />
}

// ============================================================================
// STANDALONE DATE PICKER (without react-hook-form)
// ============================================================================

export interface StandaloneDatePickerProps {
  /** Label text */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Description text */
  description?: string
  /** Error message */
  error?: string
  /** Current value */
  value?: Date | DateRange
  /** Callback when value changes */
  onValueChange?: (value: Date | DateRange | undefined) => void
  /** Whether the field is required */
  required?: boolean
  /** Whether the field is disabled */
  disabled?: boolean
  /** Date format */
  dateFormat?: string
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Disabled dates */
  disabledDates?: Date[]
  /** Disabled days of week */
  disabledDaysOfWeek?: number[]
  /** Allow clearing */
  clearable?: boolean
  /** Range selection */
  range?: boolean
  /** Number of months */
  numberOfMonths?: number
  /** Show presets */
  showPresets?: boolean
  /** Custom presets */
  presets?: DatePreset[]
  /** Show time picker */
  showTimePicker?: boolean
  /** Tooltip text */
  tooltip?: string
  /** Custom className */
  className?: string
}

export function StandaloneDatePicker({
  label,
  placeholder = 'Pick a date',
  description,
  error,
  value,
  onValueChange,
  required = false,
  disabled = false,
  dateFormat = 'PPP',
  minDate,
  maxDate,
  disabledDates = [],
  disabledDaysOfWeek = [],
  clearable = false,
  range = false,
  numberOfMonths = range ? 2 : 1,
  showPresets = false,
  presets = range ? defaultRangePresets : defaultPresets,
  showTimePicker = false,
  tooltip,
  className,
}: StandaloneDatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(new Date())

  const id = React.useId()

  const isDateDisabled = (date: Date) => {
    if (minDate && isBefore(date, minDate)) return true
    if (maxDate && isAfter(date, maxDate)) return true
    if (disabledDaysOfWeek.includes(date.getDay())) return true
    if (disabledDates.some(d => format(d, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'))) return true
    return false
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(undefined)
  }

  const handlePresetSelect = (preset: DatePreset) => {
    onValueChange?.(preset.value)
    if (!showTimePicker || range) {
      setOpen(false)
    }
  }

  if (range) {
    const rangeValue = value as DateRange | undefined

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
              disabled={disabled}
              className={cn(
                'w-full justify-start text-left font-normal',
                !rangeValue && 'text-muted-foreground',
                error && 'border-destructive'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {rangeValue?.from ? (
                rangeValue.to ? (
                  <span>
                    {format(rangeValue.from, dateFormat)} - {format(rangeValue.to, dateFormat)}
                  </span>
                ) : (
                  <span>{format(rangeValue.from, dateFormat)}</span>
                )
              ) : (
                <span>{placeholder}</span>
              )}
              {clearable && rangeValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 ml-auto hover:bg-transparent"
                  onClick={handleClear}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              {showPresets && presets.length > 0 && (
                <div className="border-r p-2 space-y-1 min-w-[140px]">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-sm"
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              )}

              <Calendar
                mode="range"
                selected={rangeValue}
                onSelect={(range) => onValueChange?.(range)}
                disabled={isDateDisabled}
                numberOfMonths={numberOfMonths}
                initialFocus
              />
            </div>
          </PopoverContent>
        </Popover>

        {description && !error && <p className="text-sm text-muted-foreground">{description}</p>}
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}
      </div>
    )
  }

  // Single date picker
  const dateValue = value as Date | undefined

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
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateValue && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? (
              <span>
                {format(dateValue, dateFormat)}
                {showTimePicker && ` ${format(dateValue, 'HH:mm')}`}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
            {clearable && dateValue && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 ml-auto hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {showPresets && presets.length > 0 && (
              <div className="border-r p-2 space-y-1">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            )}

            <div>
              <MonthYearSelector
                date={month}
                onDateChange={setMonth}
                minDate={minDate}
                maxDate={maxDate}
              />
              <Calendar
                mode="single"
                selected={dateValue}
                onSelect={(date) => {
                  if (date && showTimePicker && dateValue) {
                    date.setHours(dateValue.getHours(), dateValue.getMinutes())
                  }
                  onValueChange?.(date)
                  if (!showTimePicker && date) {
                    setOpen(false)
                  }
                }}
                month={month}
                onMonthChange={setMonth}
                disabled={isDateDisabled}
                numberOfMonths={numberOfMonths}
                initialFocus
              />
              {showTimePicker && (
                <TimePicker
                  date={dateValue}
                  onChange={(date) => onValueChange?.(date)}
                />
              )}
            </div>
          </div>
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

export default FormDatePicker
