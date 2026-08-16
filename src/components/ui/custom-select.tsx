'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import { ChevronDown, Check } from 'lucide-react'

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
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  disabled = false,
  className = '',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

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

  const handleSelect = (val: string) => {
    onChange(val)
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Hidden input for accessibility/form compatibility */}
      <input
        type="hidden"
        id={id}
        name={id}
        value={value}
      />

      {/* Trigger Button */}
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
          {selectedOption?.icon && (
            <span className="shrink-0 text-[#D49B35]">{selectedOption.icon}</span>
          )}
          {selectedOption ? (
            <span className="font-medium text-xs sm:text-sm text-[#F7F4EE] truncate">
              {selectedOption.label}
            </span>
          ) : (
            <span className="text-xs text-[#78877A] truncate font-mono">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#A0A5AC] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#D49B35]' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 p-1.5 bg-[#15171A] border border-[#2E333A] rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-xl max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs flex items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? 'bg-[#C84B28]/15 text-[#F7F4EE] font-semibold border border-[#C84B28]/30'
                    : 'text-[#A0A5AC] hover:bg-[#1A1C20] hover:text-[#F7F4EE]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {option.icon && (
                    <span className={`shrink-0 ${isSelected ? 'text-[#D49B35]' : 'text-[#78877A]'}`}>
                      {option.icon}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{option.label}</p>
                    {option.description && (
                      <p className="text-[10px] text-[#78877A] truncate mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {option.badge && (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm bg-[#2E333A] text-[#D49B35]">
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-[#C84B28]" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
