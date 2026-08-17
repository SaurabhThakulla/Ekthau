import * as React from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  /** Buttons or links offering the obvious next step. */
  action?: React.ReactNode
  className?: string
  /** `dashed` reads as "nothing here yet", `plain` as "nothing matched". */
  variant?: 'dashed' | 'plain'
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'dashed',
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center sm:py-16',
        variant === 'dashed'
          ? 'border-2 border-dashed border-border bg-muted/40'
          : 'border border-border bg-card shadow-card',
        className
      )}
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-ink">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action}
        </div>
      )}
    </div>
  )
}
