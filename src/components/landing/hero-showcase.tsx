import Image from 'next/image'
import { Check, Images, QrCode, Sparkles, Users } from 'lucide-react'

/**
 * The hero product visual: a slightly tilted floating card showing what a host
 * sees, with callout badges pinned to its corners. Straightens on hover and on
 * small screens, where the tilt would eat horizontal space.
 */
export function HeroShowcase() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Soft violet bloom behind the card. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-brand-200/50 via-violet-400/25 to-transparent blur-2xl"
      />

      <div className="group relative rounded-3xl border border-white/70 bg-white/95 p-5 shadow-float backdrop-blur-sm transition-transform duration-500 sm:p-6 lg:rotate-[2.5deg] lg:group-hover:rotate-0 lg:hover:rotate-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
              Event gallery
            </p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink">
              Sita &amp; Ramesh
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-500" />
            Live
          </span>
        </div>

        {/* Headline metric + QR, mirroring the host dashboard. */}
        <div className="mt-5 flex items-center gap-4 rounded-2xl bg-cta-gradient p-4 text-white">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white p-1">
            <Image
              src="/images/table-qr-stand.jpg"
              alt="A printed Ekthau QR card standing on a decorated dinner table"
              fill
              priority
              sizes="80px"
              className="rounded-lg object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-white/70">Photos collected</p>
            <p className="font-display text-3xl font-bold leading-tight">1,248</p>
            <p className="mt-0.5 truncate text-xs text-white/70">
              from 86 guests, 12 tables
            </p>
          </div>
        </div>

        {/* Per-source breakdown. */}
        <dl className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Photos', value: '1,102', icon: Images },
            { label: 'Videos', value: '146', icon: Sparkles },
            { label: 'Guests', value: '86', icon: Users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-white p-3 text-center"
            >
              <stat.icon
                className="mx-auto size-4 text-brand-600"
                aria-hidden="true"
              />
              <dt className="mt-1.5 text-[11px] text-ink-muted">{stat.label}</dt>
              <dd className="font-display text-base font-bold text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {/* Recent arrivals. */}
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Arriving now
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                src: '/images/phone-camera-snap.jpg',
                alt: 'A guest holding up a phone to photograph friends at a party table',
                caption: 'Table 08',
              },
              {
                src: '/images/live-wall.jpg',
                alt: 'Guests laughing together during a celebration',
                caption: 'Table 03',
              },
            ].map((shot) => (
              <figure
                key={shot.src}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 640px) 42vw, 200px"
                  className="object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-ink/70 px-2 py-1 text-[10px] font-medium text-white">
                  {shot.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* Floating callouts. Decorative duplicates of copy stated elsewhere. */}
      <div
        aria-hidden="true"
        className="absolute -right-2 -top-4 hidden animate-float items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-float sm:flex"
      >
        <QrCode className="size-3.5 text-violet-600" />
        One scan to join
      </div>

      <div
        aria-hidden="true"
        className="absolute -bottom-4 -left-3 hidden animate-float-slow items-center gap-2 rounded-full border border-white/80 bg-white px-3.5 py-2 text-xs font-semibold text-ink shadow-float sm:flex"
      >
        <Check className="size-3.5 text-emerald-600" />
        Originals kept, never compressed
      </div>
    </div>
  )
}
