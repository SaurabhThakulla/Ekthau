'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'

interface CalendarPickerProps {
  id?: string
  value?: string // YYYY-MM-DD
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  minDate?: string // YYYY-MM-DD
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export default function CalendarPicker({
  id,
  value,
  onChange,
  placeholder = 'Select event date...',
  disabled = false,
  className = '',
  required = false,
  minDate,
}: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse initial view date from value or today
  const selectedDateObj = useMemo(() => {
    if (!value) return null
    const [y, m, d] = value.split('-').map(Number)
    if (!y || !m || !d) return null
    return new Date(y, m - 1, d)
  }, [value])

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDateObj) return new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1)
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (selectedDateObj) {
      setViewDate(new Date(selectedDateObj.getFullYear(), selectedDateObj.getMonth(), 1))
    }
  }, [selectedDateObj])

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const currentYear = viewDate.getFullYear()
  const currentMonth = viewDate.getMonth()

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation()
    setViewDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleSelectDay = (day: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    const formatted = `${currentYear}-${mm}-${dd}`
    onChange(formatted)
    setIsOpen(false)
  }

  const handlePreset = (offsetDays: number) => {
    const target = new Date()
    target.setDate(target.getDate() + offsetDays)
    const yyyy = target.getFullYear()
    const mm = String(target.getMonth() + 1).padStart(2, '0')
    const dd = String(target.getDate()).padStart(2, '0')
    const formatted = `${yyyy}-${mm}-${dd}`
    onChange(formatted)
    setViewDate(new Date(yyyy, target.getMonth(), 1))
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  // Generate calendar grid days
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay()
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days: Array<{
      day: number
      isCurrentMonth: boolean
      dateStr: string
      isToday: boolean
      isSelected: boolean
      isDisabled: boolean
    }> = []

    const todayStr = (() => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    })()

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonth = currentMonth === 0 ? 12 : currentMonth
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: minDate ? dateStr < minDate : false,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: minDate ? dateStr < minDate : false,
      })
    }

    // Next month filler days (fill up to multiple of 7 or 42)
    const remaining = (7 - (days.length % 7)) % 7
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = currentMonth === 11 ? 1 : currentMonth + 2
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        day: d,
        isCurrentMonth: false,
        dateStr,
        isToday: dateStr === todayStr,
        isSelected: dateStr === value,
        isDisabled: minDate ? dateStr < minDate : false,
      })
    }

    return days
  }, [currentYear, currentMonth, value, minDate])

  // Formatted human-readable label
  const formattedDisplay = useMemo(() => {
    if (!selectedDateObj) return null
    return selectedDateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [selectedDateObj])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for HTML5 form validation if required */}
      <input
        type="text"
        id={id}
        name={id}
        value={value || ''}
        required={required}
        readOnly
        className="sr-only"
        tabIndex={-1}
      />

      {/* Interactive Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 rounded-xl border bg-[#1A1C20] text-left text-sm flex items-center justify-between gap-2.5 transition-all outline-hidden ${
          isOpen
            ? 'border-[#D49B35] ring-2 ring-[#D49B35]/20 shadow-md'
            : 'border-[#2E333A] hover:border-[#4B5563]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <CalendarIcon
            className={`h-4 w-4 shrink-0 transition-colors ${
              value ? 'text-[#D49B35]' : 'text-[#78877A]'
            }`}
          />
          {formattedDisplay ? (
            <span className="font-mono text-xs font-semibold text-[#F7F4EE] truncate">
              {formattedDisplay}
            </span>
          ) : (
            <span className="text-xs text-[#78877A] truncate font-mono">
              {placeholder}
            </span>
          )}
        </div>

        {value && !disabled ? (
          <div
            onClick={handleClear}
            role="button"
            title="Clear date"
            className="p-1 hover:bg-[#2E333A] rounded-md text-[#78877A] hover:text-[#F7F4EE] transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </div>
        ) : (
          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-[#2E333A] text-[#A0A5AC]">
            Pick
          </span>
        )}
      </button>

      {/* Popover Monthly Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-80 p-4 bg-[#15171A] border border-[#2E333A] rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-sm text-[#F7F4EE]">
                {MONTH_NAMES[currentMonth]}
              </span>
              <span className="font-mono text-xs text-[#D49B35] font-semibold">
                {currentYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#2E333A] bg-[#1A1C20] hover:bg-[#2E333A] text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 flex items-center justify-center rounded-lg border border-[#2E333A] bg-[#1A1C20] hover:bg-[#2E333A] text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAY_NAMES.map((day) => (
              <span
                key={day}
                className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#78877A] py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((item, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={item.isDisabled}
                  onClick={() => handleSelectDay(item.day)}
                  className={`h-8 w-8 mx-auto rounded-lg text-xs font-mono flex items-center justify-center transition-all ${
                    item.isSelected
                      ? 'bg-[#C84B28] text-white font-bold shadow-md shadow-[#C84B28]/30'
                      : item.isToday
                      ? 'border border-[#D49B35] text-[#D49B35] font-bold hover:bg-[#D49B35]/15'
                      : item.isCurrentMonth
                      ? 'text-[#F7F4EE] hover:bg-[#22262B] hover:text-[#D49B35]'
                      : 'text-[#4B5563] hover:bg-[#1A1C20]'
                  } ${item.isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent' : 'cursor-pointer'}`}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Quick Presets Bar */}
          <div className="mt-3.5 pt-3 border-t border-[#2E333A] flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset(0)}
                className="px-2 py-1 rounded-md bg-[#1A1C20] hover:bg-[#2E333A] border border-[#2E333A] text-[10px] font-mono text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1)}
                className="px-2 py-1 rounded-md bg-[#1A1C20] hover:bg-[#2E333A] border border-[#2E333A] text-[10px] font-mono text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="px-2 py-1 rounded-md bg-[#1A1C20] hover:bg-[#2E333A] border border-[#2E333A] text-[10px] font-mono text-[#A0A5AC] hover:text-[#F7F4EE] transition-colors"
              >
                +1 Week
              </button>
            </div>

            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] font-mono text-[#C84B28] hover:underline"
              >
                Clear
              </button>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
