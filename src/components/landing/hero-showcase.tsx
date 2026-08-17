'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Check, Images, QrCode, Sparkles, Users } from 'lucide-react'

const ARRIVING_PHOTOS = [
  {
    src: '/images/phone-camera-snap.jpg',
    alt: 'A guest holding up a phone to photograph friends at a party table',
    caption: 'Table 08',
    time: 'Just now',
  },
  {
    src: '/images/live-wall.jpg',
    alt: 'Guests laughing together during a celebration',
    caption: 'Table 03',
    time: '12s ago',
  },
  {
    src: '/images/ai-face-album.jpg',
    alt: 'Guests smiling at a wedding banquet',
    caption: 'Table 11',
    time: '34s ago',
  },
  {
    src: '/images/projector-live-wall.jpg',
    alt: 'Dance floor celebration moment',
    caption: 'Stage area',
    time: '1m ago',
  },
]

export function HeroShowcase() {
  const [photoIndex, setPhotoIndex] = useState(0)
  const [photoCount, setPhotoCount] = useState(1248)
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Subtle real-time photo ticker simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % (ARRIVING_PHOTOS.length - 1))
      setPhotoCount((prev) => prev + 1)
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  // Interactive 3D tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    const maxTilt = 4
    setTilt({
      x: -(y / (rect.height / 2)) * maxTilt,
      y: (x / (rect.width / 2)) * maxTilt,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
  }

  const currentPair = [
    ARRIVING_PHOTOS[photoIndex],
    ARRIVING_PHOTOS[(photoIndex + 1) % ARRIVING_PHOTOS.length],
  ]

  return (
    <div
      className="relative mx-auto w-full max-w-md perspective-1000 lg:max-w-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic ambient glowing mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 animate-blob rounded-[3rem] bg-gradient-to-br from-brand-300/40 via-violet-400/25 to-pink-300/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-8 -right-8 size-64 animate-blob-slow rounded-full bg-violet-500/20 blur-2xl"
      />

      <div
        ref={cardRef}
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.01, 1.01, 1.01)`
            : undefined,
          transition: isHovered
            ? 'transform 0.15s ease-out'
            : 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="group relative rounded-3xl border border-white/80 bg-white/95 p-5 shadow-float backdrop-blur-md will-change-transform sm:p-6 lg:rotate-[2deg] lg:hover:rotate-0"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-600">
              Event gallery
            </p>
            <p className="mt-0.5 truncate font-display text-lg font-bold text-ink">
              Sita &amp; Ramesh
            </p>
          </div>

          {/* Pulsing Live indicator */}
          <span className="relative flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-radar-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        {/* Headline metric + QR, mirroring the host dashboard */}
        <div className="relative mt-5 overflow-hidden rounded-2xl bg-cta-gradient p-4 text-white shadow-cta transition-transform duration-300 group-hover:scale-[1.01]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/10 blur-xl"
          />
          <div className="relative flex items-center gap-4">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-white p-1 shadow-sm transition-transform duration-300 group-hover:rotate-1">
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
              <p className="text-xs text-white/75 font-medium">Photos collected</p>
              <p className="font-display text-3xl font-bold leading-tight tracking-tight">
                {photoCount.toLocaleString()}
              </p>
              <p className="mt-0.5 truncate text-xs text-white/70">
                from 86 guests, 12 tables
              </p>
            </div>
          </div>
        </div>

        {/* Per-source breakdown */}
        <dl className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Photos', value: '1,102', icon: Images },
            { label: 'Videos', value: '146', icon: Sparkles },
            { label: 'Guests', value: '86', icon: Users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group/stat rounded-xl border border-border bg-white p-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-xs"
            >
              <stat.icon
                className="mx-auto size-4 text-brand-600 transition-transform duration-300 group-hover/stat:scale-110"
                aria-hidden="true"
              />
              <dt className="mt-1.5 text-[11px] text-ink-muted">{stat.label}</dt>
              <dd className="font-display text-base font-bold text-ink">{stat.value}</dd>
            </div>
          ))}
        </dl>

        {/* Recent arrivals with live crossfade transitions */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Arriving now
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
              Incoming stream
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {currentPair.map((shot, idx) => (
              <figure
                key={`${shot.src}-${idx}`}
                className="group/photo relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted transition-all duration-500 hover:border-brand-300 hover:shadow-sm"
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(max-width: 640px) 42vw, 200px"
                  className="object-cover transition-transform duration-700 group-hover/photo:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-ink/90 via-ink/60 to-transparent p-2 text-[10px] font-medium text-white backdrop-blur-[1px]">
                  <span>{shot.caption}</span>
                  <span className="text-[9px] text-white/75">{shot.time}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>

      {/* Floating callouts with staggered micro-animations */}
      <div
        aria-hidden="true"
        className="absolute -right-3 -top-5 hidden animate-float items-center gap-2 rounded-full border border-white/90 bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-float backdrop-blur-sm sm:flex transition-transform hover:scale-105"
      >
        <div className="flex size-5 items-center justify-center rounded-full bg-brand-50 text-violet-600">
          <QrCode className="size-3" />
        </div>
        One scan to join
      </div>

      <div
        aria-hidden="true"
        className="absolute -bottom-5 -left-3 hidden animate-float-reverse items-center gap-2 rounded-full border border-white/90 bg-white/95 px-4 py-2 text-xs font-semibold text-ink shadow-float backdrop-blur-sm sm:flex transition-transform hover:scale-105"
      >
        <div className="flex size-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-3" />
        </div>
        Originals kept, never compressed
      </div>
    </div>
  )
}
