import Image from 'next/image'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Logo } from '@/components/layout/logo'

/**
 * Split layout shared by sign in and sign up. The decorative panel is hidden
 * below `lg`, and its image is only requested at the widths where it is
 * actually shown.
 */
export function AuthShell({
  eyebrow,
  headline,
  points,
  children,
}: {
  eyebrow: string
  headline: string
  points: string[]
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 text-white lg:flex">
        <Image
          src="/images/auth-hero.jpg"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="50vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink via-brand-900/85 to-brand-700/50"
        />

        <div className="relative">
          <Logo tone="dark" />
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-300">
            {eyebrow}
          </p>
          <p className="mt-3 font-display text-2xl font-bold leading-snug text-white">
            {headline}
          </p>
          <ul role="list" className="mt-6 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-white/80">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand-300"
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/55">
          Guests never need an account. Only hosts sign in.
        </p>
      </aside>

      <main
        id="main"
        className="flex flex-col justify-center px-5 py-10 sm:px-8 lg:px-14"
      >
        <div className="mx-auto w-full max-w-[26rem]">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-10 text-center text-xs text-ink-muted">
            <Link href="/" className="hover:text-brand-700 hover:underline">
              Back to ekthau.com
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
