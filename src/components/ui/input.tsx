import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Renders the error styling and wires up `aria-invalid`. */
  invalid?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, invalid, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          // 16px text on mobile stops iOS Safari zooming the viewport on focus.
          'flex h-11 w-full rounded-xl border bg-white px-3.5 text-base text-ink shadow-xs transition-colors sm:text-sm',
          'placeholder:text-slate-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25',
          'disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          invalid
            ? 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/25'
            : 'border-input hover:border-slate-300 focus-visible:border-brand-700',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
