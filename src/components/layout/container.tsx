import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * The single horizontal gutter used across the app. Every page uses this
 * instead of ad-hoc `max-w-* mx-auto px-*` combinations, which is what kept
 * section edges from lining up.
 */
export function Container({
  className,
  as: Tag = 'div',
  width = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  as?: 'div' | 'section' | 'header' | 'footer' | 'main' | 'nav'
  width?: 'default' | 'wide' | 'narrow'
}) {
  return (
    <Tag
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        width === 'narrow' && 'max-w-3xl',
        width === 'default' && 'max-w-content',
        width === 'wide' && 'max-w-[88rem]',
        className
      )}
      {...props}
    />
  )
}
