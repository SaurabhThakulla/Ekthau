import Link from 'next/link'
import { Container } from '@/components/layout/container'
import { Logo } from '@/components/layout/logo'
import { footerNav, site } from '@/lib/site'

/**
 * Crawlable footer navigation. Server-rendered so every internal link is in the
 * initial HTML rather than behind client-side hydration.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div className="max-w-xs space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-ink-muted">
              {site.shortDescription}
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-ink">
                {group.heading}
              </h2>
              <ul className="mt-2 sm:mt-3">
                {group.links.map((link) => (
                  <li key={`${group.heading}-${link.label}`}>
                    {/* Block-level with vertical padding so each link is a
                        comfortable tap target rather than an 18px sliver. */}
                    <Link
                      href={link.href}
                      className="-mx-2 flex min-h-10 items-center rounded-lg px-2 text-sm text-ink-muted transition-colors hover:text-brand-700 sm:min-h-9"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name} (
            <span lang="ne">{site.nameLocal}</span>). Built for celebrations in Nepal
            and beyond.
          </p>
          <p className="text-xs">Photos stay yours. Download the originals any time.</p>
        </div>
      </Container>
    </footer>
  )
}
