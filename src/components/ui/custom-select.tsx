'use client'

import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  description?: string
  badge?: string
}

interface CustomSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  /** Accessible name. Required — a bare listbox with no label is unusable. */
  label: string
  hideLabel?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  describedBy?: string
}

/**
 * Listbox-pattern select. The previous version was a plain <button> with a
 * hidden input: no accessible name, no roles, and no keyboard support beyond
 * Enter to open. This one implements the ARIA listbox pattern with arrow keys,
 * Home/End, Escape and type-ahead-free focus management.
 */
export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  label,
  hideLabel,
  placeholder = 'Select an option',
  disabled = false,
  className,
  describedBy,
}: CustomSelectProps) {
  const generatedId = useId()
  const buttonId = id ?? generatedId
  const listboxId = `${buttonId}-listbox`
  const labelId = `${buttonId}-label`

  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [open, setOpen] = useState(false)
  const selectedIndex = useMemo(
    () => options.findIndex((option) => option.value === value),
    [options, value]
  )
  const [activeIndex, setActiveIndex] = useState(Math.max(selectedIndex, 0))
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined

  const close = useCallback((refocus = true) => {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!open) return
    setActiveIndex(Math.max(selectedIndex, 0))
  }, [open, selectedIndex])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Keep the highlighted option scrolled into view as arrow keys move it.
  useEffect(() => {
    if (!open) return
    const node = listRef.current?.querySelector<HTMLElement>(
      `[data-index="${activeIndex}"]`
    )
    node?.scrollIntoView({ block: 'nearest' })
  }, [open, activeIndex])

  const commit = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    close()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault()
        setOpen(true)
      }
      return
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((index) => Math.min(index + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((index) => Math.max(index - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        close()
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <span id={labelId} className={cn('mb-1.5 block text-sm font-medium text-ink', hideLabel && 'sr-only')}>
        {label}
      </span>

      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleKeyDown}
        className={cn(
          'flex h-11 w-full items-center justify-between gap-2 rounded-xl border bg-white px-3.5 text-left text-sm shadow-xs transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
          open
            ? 'border-brand-700 ring-2 ring-ring/20'
            : 'border-input hover:border-slate-300',
          disabled ? 'cursor-not-allowed bg-muted opacity-60' : 'cursor-pointer'
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {selectedOption?.icon && (
            <span className="shrink-0 text-brand-700" aria-hidden="true">
              {selectedOption.icon}
            </span>
          )}
          <span
            className={cn(
              'truncate',
              selectedOption ? 'font-medium text-ink' : 'text-slate-400'
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-slate-400 transition-transform',
            open && 'rotate-180 text-brand-700'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 animate-scale-in overflow-y-auto rounded-xl border border-border bg-white p-1.5 shadow-lg"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isActive = index === activeIndex

            return (
              <div
                key={option.value}
                role="option"
                data-index={index}
                aria-selected={isSelected}
                onClick={() => commit(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={cn(
                  'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isSelected
                    ? 'bg-brand-50 font-semibold text-brand-700'
                    : isActive
                      ? 'bg-muted text-ink'
                      : 'text-ink-muted'
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  {option.icon && (
                    <span
                      className={cn('shrink-0', isSelected ? 'text-brand-700' : 'text-slate-400')}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{option.label}</span>
                    {option.description && (
                      <span className="mt-0.5 block truncate text-xs text-ink-muted">
                        {option.description}
                      </span>
                    )}
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2">
                  {option.badge && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-brand-700">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="size-4 text-brand-700" aria-hidden="true" />
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
