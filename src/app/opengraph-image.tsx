import { ImageResponse } from 'next/og'
import { site } from '@/lib/site'

export const runtime = 'nodejs'
export const alt = `${site.name} — ${site.tagline}`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Generates the social share card. The metadata previously declared
 * `summary_large_image` with no image attached, so shares rendered as a blank
 * card on every platform.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundColor: '#1B1145',
          backgroundImage:
            'linear-gradient(135deg, #1B1145 0%, #3A1C92 52%, #6D28D9 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 68,
              height: 68,
              borderRadius: 20,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              fontSize: 34,
            }}
          >
            📸
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
              {site.name}
            </span>
            <span style={{ fontSize: 22, color: '#CFC4FF' }}>{site.nameLocal}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span
            style={{
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -2,
              maxWidth: 940,
            }}
          >
            Every guest photo from your event, in one place.
          </span>
          <span style={{ fontSize: 30, color: '#DDD3FF', maxWidth: 900 }}>
            Print a QR code. Guests scan, shoot and upload from any phone browser.
            No app to download.
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 16,
            fontSize: 22,
            color: '#AE9BFF',
          }}
        >
          <span>Full-resolution originals</span>
          <span>•</span>
          <span>Live photo wall</span>
          <span>•</span>
          <span>1 GB free</span>
        </div>
      </div>
    ),
    size
  )
}
