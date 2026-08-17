import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { brand } from '@/lib/brand'
import { site } from '@/lib/site'

/**
 * The wordmark lockup: the square brand mark followed by the name.
 *
 * `href={null}` renders it as plain text — used where it would otherwise be a
 * self-referencing link.
 */
export function Logo({
  className,
  href = '/',
  showLocalName = true,
  tone = 'light',
  size = 'md',
}: {
  className?: string
  href?: string | null
  showLocalName?: boolean
  /** `dark` = sitting on a dark surface, so the text flips to white. */
  tone?: 'light' | 'dark'
  size?: 'md' | 'lg'
}) {
  const markSize = size === 'lg' ? 44 : 38

  const content = (
    <>
      <span
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl transition-transform group-hover:scale-105',
          // The artwork has an opaque dark backdrop, so on light surfaces it is
          // framed as a dark badge rather than left as a grey square.
          brand.logoHasOpaqueBackground && 'bg-ink ring-1 ring-white/10',
          size === 'lg' ? 'size-11' : 'size-[38px]'
        )}
      >
        <Image
          src={brand.logoMark}
          alt=""
          aria-hidden="true"
          width={markSize}
          height={markSize}
          priority
          // Crops into the artwork so the lockup reads as the camera mark at
          // small sizes instead of shrinking the whole wordmark into mush.
          className="size-full scale-[1.45] object-cover object-[50%_38%]"
        />
      </span>

      <span className="flex items-baseline gap-1.5">
        <span
          className={cn(
            'font-display font-bold tracking-tight',
            size === 'lg' ? 'text-xl' : 'text-lg',
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
    return (
      <span className={cn('group flex items-center gap-2.5', className)}>{content}</span>
    )
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
