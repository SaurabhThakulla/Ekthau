import * as React from 'react'
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertTone = 'error' | 'success' | 'info' | 'warning'

const TONE_STYLES: Record<
  AlertTone,
  { wrapper: string; icon: typeof AlertCircle; iconClass: string }
> = {
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-800',
    icon: AlertCircle,
    iconClass: 'text-red-600',
  },
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  warning: {
    wrapper: 'border-amber-200 bg-amber-50 text-amber-900',
    icon: TriangleAlert,
    iconClass: 'text-amber-600',
  },
  info: {
    wrapper: 'border-brand-200 bg-brand-50 text-brand-900',
    icon: Info,
    iconClass: 'text-brand-700',
  },
}

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: AlertTone
  title?: React.ReactNode
  /** Optional retry / dismiss control rendered on the trailing edge. */
  action?: React.ReactNode
}

/**
 * Error alerts use role="alert" so screen readers announce them the moment a
 * submission fails; non-error tones use role="status" to avoid interrupting.
 */
export function Alert({
  className,
  tone = 'error',
  title,
  action,
  children,
  ...props
}: AlertProps) {
  const { wrapper, icon: Icon, iconClass } = TONE_STYLES[tone]

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3.5 text-sm',
        wrapper,
        className
      )}
      {...props}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', iconClass)} aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="[&_p]:leading-relaxed">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
