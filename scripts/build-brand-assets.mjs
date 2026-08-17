/**
 * Derives icon and brand assets from the master logo (public/brand/ekthau-logo.png).
 *
 * Generates:
 * - public/brand/ekthau-mark.png (512x512 PNG high-res mark)
 * - src/app/icon.png (512x512 PNG favicon for Next.js app router)
 * - src/app/apple-icon.png (180x180 PNG Apple touch icon)
 * - public/favicon.ico (Multi-resolution 16x16, 32x32, 48x48 ICO)
 * - public/favicon.svg (Vector SVG favicon)
 *
 * Run with:
 *   node scripts/build-brand-assets.mjs
 */
import { writeFileSync } from 'node:fs'
import sharp from 'sharp'

const SOURCE = 'public/brand/ekthau-logo.png'
const MARK_OUT = 'public/brand/ekthau-mark.png'
const ICON_OUT = 'src/app/icon.png'
const APPLE_ICON_OUT = 'src/app/apple-icon.png'
const ICO_OUT = 'public/favicon.ico'
const SVG_OUT = 'public/favicon.svg'

async function build() {
  console.log(`Reading source logo from ${SOURCE}...`)
  const image = sharp(SOURCE)
  const meta = await image.metadata()
  const raw = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = raw.info
  const data = raw.data

  let minX = width
  let maxX = 0
  let minY = height
  let maxY = 0

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels
      if (data[idx] > 30 || data[idx + 1] > 30 || data[idx + 2] > 30) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  const glyphW = maxX - minX
  const glyphH = maxY - minY
  const cx = Math.round((minX + maxX) / 2)
  const cy = Math.round((minY + maxY) / 2)

  // Balance padding around the camera mark (~15% padding)
  const cropDim = Math.min(
    Math.round(Math.max(glyphW, glyphH) * 1.28),
    Math.min(width, height)
  )
  const cropX = Math.max(0, Math.min(width - cropDim, Math.round(cx - cropDim / 2)))
  const cropY = Math.max(0, Math.min(height - cropDim, Math.round(cy - cropDim / 2)))

  console.log(`Glyph bounds: [${minX}..${maxX}, ${minY}..${maxY}] (${glyphW}x${glyphH})`)
  console.log(`Crop frame:   ${cropDim}x${cropDim} at (${cropX}, ${cropY})`)

  // 1. Generate 512x512 high-resolution mark PNG
  const mark512 = await sharp(SOURCE)
    .extract({ left: cropX, top: cropY, width: cropDim, height: cropDim })
    .resize(512, 512, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  writeFileSync(MARK_OUT, mark512)
  console.log(`Wrote ${MARK_OUT} (512x512, ${(mark512.length / 1024).toFixed(1)} KB)`)

  // 2. Next.js app/icon.png
  writeFileSync(ICON_OUT, mark512)
  console.log(`Wrote ${ICON_OUT}`)

  // 3. Next.js app/apple-icon.png (180x180)
  const apple180 = await sharp(SOURCE)
    .extract({ left: cropX, top: cropY, width: cropDim, height: cropDim })
    .resize(180, 180, { kernel: 'lanczos3' })
    .png({ compressionLevel: 9 })
    .toBuffer()

  writeFileSync(APPLE_ICON_OUT, apple180)
  console.log(`Wrote ${APPLE_ICON_OUT} (180x180, ${(apple180.length / 1024).toFixed(1)} KB)`)

  // 4. Multi-resolution ICO (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48]
  const icoPngs = []
  for (const s of icoSizes) {
    const buf = await sharp(SOURCE)
      .extract({ left: cropX, top: cropY, width: cropDim, height: cropDim })
      .resize(s, s, { kernel: 'lanczos3' })
      .png()
      .toBuffer()
    icoPngs.push({ size: s, buf })
  }

  const icoHeader = Buffer.alloc(6)
  icoHeader.writeUInt16LE(0, 0)
  icoHeader.writeUInt16LE(1, 2)
  icoHeader.writeUInt16LE(icoPngs.length, 4)

  let offset = 6 + 16 * icoPngs.length
  const icoEntries = []
  for (const item of icoPngs) {
    const entry = Buffer.alloc(16)
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0)
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1)
    entry.writeUInt8(0, 2)
    entry.writeUInt8(0, 3)
    entry.writeUInt16LE(1, 4)
    entry.writeUInt16LE(32, 6)
    entry.writeUInt32LE(item.buf.length, 8)
    entry.writeUInt32LE(offset, 12)
    icoEntries.push(entry)
    offset += item.buf.length
  }

  const icoBuf = Buffer.concat([icoHeader, ...icoEntries, ...icoPngs.map((p) => p.buf)])
  writeFileSync(ICO_OUT, icoBuf)
  console.log(`Wrote ${ICO_OUT} (${(icoBuf.length / 1024).toFixed(1)} KB)`)

  // 5. SVG vector favicon
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" rx="112" fill="#000000"/>
  <rect x="88" y="88" width="336" height="336" rx="96" stroke="#ffffff" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="256" r="88" stroke="#ffffff" stroke-width="44"/>
</svg>
`
  writeFileSync(SVG_OUT, svgContent)
  console.log(`Wrote ${SVG_OUT}`)

  console.log('Brand asset generation complete!')
}

build().catch((err) => {
  console.error('Failed to build brand assets:', err)
  process.exit(1)
})
