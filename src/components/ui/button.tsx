import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl',
    'text-sm font-semibold leading-none transition-[background-color,border-color,color,box-shadow,transform] duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-55',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0'
  ),
  {
    variants: {
      variant: {
        /* The dominant action: indigo→violet gradient with a coloured lift. */
        primary:
          'bg-cta-gradient text-white shadow-cta hover:brightness-110 active:brightness-95',
        /* Flat brand fill for dense UI (dashboard toolbars, inline actions). */
        solid: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800',
        ink: 'bg-ink text-white shadow-sm hover:bg-ink-soft',
        secondary:
          'border border-border bg-white text-ink shadow-pill hover:border-brand-200 hover:bg-brand-50',
        subtle: 'bg-muted text-ink hover:bg-secondary',
        ghost: 'text-ink-muted hover:bg-muted hover:text-ink',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outlineDestructive:
          'border border-destructive/30 bg-white text-destructive hover:bg-destructive/5',
        link: 'text-brand-700 underline-offset-4 hover:underline',
        onDark: 'bg-white text-ink shadow-sm hover:bg-brand-50',
        onDarkGhost:
          'border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20',
      },
      size: {
        // Every size clears 40px so nothing becomes a fiddly tap target on a
        // phone; `md` and `lg` clear the 44px comfort guideline.
        sm: 'h-10 px-3.5 text-[13px] [&_svg]:size-4',
        md: 'h-11 px-5 [&_svg]:size-4',
        lg: 'h-12 px-6 text-base [&_svg]:size-5',
        /* Hero-scale action. */
        xl: 'h-14 px-8 text-base [&_svg]:size-5',
        icon: 'h-10 w-10 [&_svg]:size-4',
        iconLg: 'h-11 w-11 [&_svg]:size-5',
      },
      shape: {
        /** Fully rounded capsule, matching the header and chip language. */
        pill: 'rounded-full',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  /** Shows a spinner and blocks repeat submits. Ignored when `asChild`. */
  loading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      block,
      asChild = false,
      loading = false,
      loadingText,
      disabled,
      children,
      type,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, shape, block, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        // Defaulting to "button" stops buttons inside forms submitting by accident.
        type={type ?? 'button'}
        className={cn(buttonVariants({ variant, size, shape, block, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" aria-hidden="true" />
            {loadingText ?? children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
