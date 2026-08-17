import { Zap } from 'lucide-react'

const FEATURES = [
  'No app to download',
  'Full-resolution originals',
  'Printable table QR cards',
  'Live projector wall',
  'Works on weak signal',
  'Host approves every photo',
  'One-click ZIP download',
  'Private to your guests',
]

/**
 * Continuously scrolling capability strip. The list is rendered twice and the
 * track travels exactly -50%, which makes the loop seamless; the duplicate is
 * hidden from assistive tech so the features are announced only once.
 */
export function FeatureMarquee() {
  return (
    <div className="marquee-mask overflow-hidden border-y border-white/60 bg-white/40 py-4 backdrop-blur-sm">
      <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            role={copy === 0 ? 'list' : 'presentation'}
            aria-hidden={copy === 1 ? true : undefined}
            className="flex shrink-0 items-center gap-3"
          >
            {FEATURES.map((feature) => (
              <li
                key={feature}
                className="flex shrink-0 items-center gap-2 rounded-full border border-white/70 bg-white/85 px-4 py-2 text-sm font-medium text-ink shadow-pill"
              >
                <Zap
                  className="size-3.5 shrink-0 text-violet-600"
                  aria-hidden="true"
                />
                {feature}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}
