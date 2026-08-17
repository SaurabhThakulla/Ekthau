import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import { brand } from '@/lib/brand'
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
/**
 * Reads the logo off disk and inlines it as a data URI. `ImageResponse` cannot
 * resolve site-relative paths at build time, and the card must still generate if
 * the file is missing — so a failure falls back to no mark rather than failing
 * the build.
 */
async function loadLogo(): Promise<string | null> {
  try {
    const bytes = await readFile(join(process.cwd(), 'public', brand.logoMark))
    return `data:image/png;base64,${bytes.toString('base64')}`
  } catch {
    return null
  }
}

export default async function OpengraphImage() {
  const logo = await loadLogo()

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
              width: 76,
              height: 76,
              borderRadius: 22,
              overflow: 'hidden',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              fontSize: 36,
            }}
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- satori only
              // renders plain <img> inside ImageResponse.
              <img
                src={logo}
                alt=""
                width={76}
                height={76}
                style={{ width: 76, height: 76, objectFit: 'cover' }}
              />
            ) : (
              '📸'
            )}
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
