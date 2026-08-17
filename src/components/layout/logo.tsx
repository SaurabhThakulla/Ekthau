import Link from 'next/link'
import { Camera } from 'lucide-react'
import { cn } from '@/lib/utils'
import { site } from '@/lib/site'

/**
 * The wordmark. `href={null}` renders it as plain text — used in the footer of
 * the page it already links to, so we do not ship a self-referencing link.
 */
export function Logo({
  className,
  href = '/',
  showLocalName = true,
  tone = 'light',
}: {
  className?: string
  href?: string | null
  showLocalName?: boolean
  tone?: 'light' | 'dark'
}) {
  const content = (
    <>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105',
          tone === 'light' ? 'bg-ink-gradient' : 'border border-white/20 bg-white/10 backdrop-blur-sm'
        )}
      >
        <Camera className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-display text-lg font-bold tracking-tight',
            tone === 'light' ? 'text-ink' : 'text-white'
          )}
        >
          {site.name}
        </span>
        {showLocalName && (
          <span
            className={cn(
              'text-sm font-medium',
              tone === 'light' ? 'text-brand-700' : 'text-brand-200'
            )}
            lang="ne"
          >
            {site.nameLocal}
          </span>
        )}
      </span>
    </>
  )

  if (!href) {
    return <span className={cn('group flex items-center gap-2.5', className)}>{content}</span>
  }

  return (
    <Link
      href={href}
      className={cn('group flex items-center gap-2.5 rounded-lg', className)}
    >
      {content}
    </Link>
  )
}
