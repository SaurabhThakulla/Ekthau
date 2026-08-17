'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

/**
 * "Enter code" is the default tab, so the jsQR decoder is only fetched once a
 * guest actually chooses to scan. That keeps it out of the initial payload on
 * the join page without changing behaviour for anyone who does scan.
 */
const QrScanner = dynamic(
  () => import('@/components/qr-scanner').then((mod) => mod.QrScanner),
  {
    ssr: false,
    loading: () => (
      <div
        role="status"
        className="mx-auto flex aspect-square w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-ink text-white"
      >
        <Loader2 className="size-5 animate-spin text-brand-300" aria-hidden="true" />
        <p className="text-xs text-white/65">Starting the scanner…</p>
      </div>
    ),
  }
)

export { QrScanner as QrScannerLazy }
