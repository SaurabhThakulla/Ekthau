import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
    /** Appends a marked-up required indicator with an accessible name. */
    required?: boolean
  }
>(({ className, children, required, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      'block text-sm font-medium leading-none text-ink peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  >
    {children}
    {required && (
      <span className="ml-1 text-destructive" aria-hidden="true">
        *
      </span>
    )}
  </LabelPrimitive.Root>
))
Label.displayName = LabelPrimitive.Root.displayName

/** Small helper text rendered under a field and referenced by aria-describedby. */
const FieldHint = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-xs text-ink-muted', className)} {...props} />
))
FieldHint.displayName = 'FieldHint'

/** Inline validation message. Announced because of role="alert". */
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  if (!children) return null
  return (
    <p
      ref={ref}
      role="alert"
      className={cn('text-xs font-medium text-destructive', className)}
      {...props}
    >
      {children}
    </p>
  )
})
FieldError.displayName = 'FieldError'

export { Label, FieldHint, FieldError }
