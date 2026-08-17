'use client'

import { useEffect } from 'react'

/**
 * Catches errors thrown by the root layout itself. It has to render its own
 * <html>/<body> because the failing layout never rendered them.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Fatal application error:', error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          color: '#0B132B',
          background: '#ffffff',
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.75rem' }}>
            Ekthau could not start
          </h1>
          <p style={{ color: '#475569', lineHeight: 1.6, margin: '0 0 1.5rem' }}>
            An unexpected error stopped the page from loading. Reloading usually
            fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              minHeight: '44px',
              padding: '0 1.5rem',
              borderRadius: '12px',
              border: 'none',
              background: '#1E3A8A',
              color: '#ffffff',
              fontSize: '0.9375rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload the page
          </button>
        </main>
      </body>
    </html>
  )
}
