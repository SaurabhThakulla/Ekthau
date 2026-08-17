import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * Placeholder block used while data loads. Marked aria-hidden because the
 * surrounding region carries the live "Loading…" announcement instead.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn('skeleton rounded-lg', className)}
      {...props}
    />
  )
}

/** Wraps skeletons so assistive tech hears one message instead of nothing. */
export function LoadingRegion({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  )
}
