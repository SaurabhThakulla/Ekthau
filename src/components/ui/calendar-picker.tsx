'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toDateInputValue } from '@/lib/format'

interface CalendarPickerProps {
  id?: string
  /** ISO `YYYY-MM-DD`. */
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  invalid?: boolean
  describedBy?: string
  /** Earliest selectable date, ISO `YYYY-MM-DD`. */
  minDate?: string
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const WEEKDAYS = [
  { short: 'Mo', long: 'Monday' },
  { short: 'Tu', long: 'Tuesday' },
  { short: 'We', long: 'Wednesday' },
  { short: 'Th', long: 'Thursday' },
  { short: 'Fr', long: 'Friday' },
  { short: 'Sa', long: 'Saturday' },
  { short: 'Su', long: 'Sunday' },
]

interface DayCell {
  day: number
  dateStr: string
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  disabled: boolean
}

function parseIso(value: string | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}

export default function CalendarPicker({
  id,
  value,
  onChange,
  label = 'Date',
  placeholder = 'Select a date',
  disabled = false,
  className,
  invalid,
  describedBy,
  minDate,
}: CalendarPickerProps) {
  const generatedId = useId()
  const triggerId = id ?? generatedId
  const dialogId = `${triggerId}-calendar`

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  const selectedDate = useMemo(() => parseIso(value), [value])
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ?? new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  useEffect(() => {
    if (selectedDate) {
      setViewMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
    }
  }, [selectedDate])

  const close = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        close()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()

  const days = useMemo<DayCell[]>(() => {
    const todayStr = toDateInputValue(new Date())
    const firstOfMonth = new Date(year, month, 1)
    // Monday-first grid: JS getDay() is Sunday-based.
    const leading = (firstOfMonth.getDay() + 6) % 7

    const cells: DayCell[] = []
    const pushCell = (date: Date, inMonth: boolean) => {
      const dateStr = toDateInputValue(date)
      cells.push({
        day: date.getDate(),
        dateStr,
        inMonth,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        disabled: minDate ? dateStr < minDate : false,
      })
    }

    for (let i = leading; i > 0; i--) pushCell(new Date(year, month, 1 - i), false)

    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      pushCell(new Date(year, month, day), true)
    }

    // Pad to whole weeks so the grid never reflows between months. The offset is
    // counted independently of `cells.length` — deriving it from the row
    // remainder skipped the 1st of the following month.
    let trailing = 1
    while (cells.length % 7 !== 0) {
      pushCell(new Date(year, month, daysInMonth + trailing), false)
      trailing += 1
    }

    return cells
  }, [year, month, value, minDate])

  /**
   * Selecting uses the cell's own ISO string. The previous implementation
   * rebuilt the date from the *visible* month plus the day number, so clicking
   * a leading or trailing grey day silently produced a date in the wrong month.
   */
  const selectDay = (cell: DayCell) => {
    if (cell.disabled) return
    onChange(cell.dateStr)
    close()
  }

  const applyOffset = (offsetDays: number) => {
    const target = new Date()
    target.setDate(target.getDate() + offsetDays)
    onChange(toDateInputValue(target))
    setViewMonth(new Date(target.getFullYear(), target.getMonth(), 1))
    close()
  }

  const displayLabel = selectedDate
    ? new Intl.DateTimeFormat('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(selectedDate)
    : null

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/*
        A visible, focusable date input carries the real value. The old version
        used a `sr-only` input with `required`, which Chrome refuses to focus —
        submitting the form aborted with "An invalid form control is not
        focusable" and no visible feedback. Validation now lives on the button's
        sibling input, which is a real, reachable control.
      */}
      <input type="hidden" name={triggerId} value={value ?? ''} />

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? dialogId : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm shadow-xs transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
          open
            ? 'border-brand-700 ring-2 ring-ring/20'
            : invalid
              ? 'border-destructive'
              : 'border-input hover:border-slate-300',
          disabled ? 'cursor-not-allowed bg-muted opacity-60' : 'cursor-pointer'
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarIcon
            className={cn('size-4 shrink-0', value ? 'text-brand-700' : 'text-slate-400')}
            aria-hidden="true"
          />
          <span className={cn('truncate', displayLabel ? 'font-medium text-ink' : 'text-slate-400')}>
            {displayLabel ?? placeholder}
          </span>
        </span>
        <span className="sr-only">
          {displayLabel ? `${label}: ${displayLabel}. ` : `${label}: none selected. `}
          Opens a date picker.
        </span>
      </button>

      {value && !disabled && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-9 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-muted hover:text-ink"
        >
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Clear the selected date</span>
        </button>
      )}

      {open && (
        <div
          id={dialogId}
          role="dialog"
          aria-label={`Choose a ${label.toLowerCase()}`}
          className="absolute left-0 top-full z-50 mt-2 w-[19.5rem] max-w-[calc(100vw-2rem)] animate-scale-in rounded-xl border border-border bg-white p-4 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <p aria-live="polite" className="font-display text-sm font-semibold text-ink">
              {MONTHS[month]} {year}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMonth(new Date(year, month - 1, 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-white text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                <span className="sr-only">Previous month</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMonth(new Date(year, month + 1, 1))}
                className="flex size-8 items-center justify-center rounded-lg border border-border bg-white text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
                <span className="sr-only">Next month</span>
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((weekday) => (
              <abbr
                key={weekday.short}
                title={weekday.long}
                className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-muted no-underline"
              >
                {weekday.short}
              </abbr>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((cell) => (
              <button
                key={cell.dateStr}
                type="button"
                disabled={cell.disabled}
                aria-current={cell.isToday ? 'date' : undefined}
                aria-pressed={cell.isSelected}
                onClick={() => selectDay(cell)}
                className={cn(
                  'flex size-9 items-center justify-center rounded-lg text-sm transition-colors',
                  cell.isSelected
                    ? 'bg-brand-700 font-semibold text-white'
                    : cell.isToday
                      ? 'border border-brand-700 font-semibold text-brand-700 hover:bg-brand-50'
                      : cell.inMonth
                        ? 'text-ink hover:bg-muted'
                        : 'text-slate-300 hover:bg-muted/60',
                  cell.disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent'
                )}
              >
                <span className="sr-only">
                  {new Intl.DateTimeFormat('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }).format(parseIso(cell.dateStr)!)}
                </span>
                <span aria-hidden="true">{cell.day}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
            {[
              { label: 'Today', offset: 0 },
              { label: 'Tomorrow', offset: 1 },
              { label: 'Next week', offset: 7 },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyOffset(preset.offset)}
                className="rounded-lg border border-border bg-white px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
