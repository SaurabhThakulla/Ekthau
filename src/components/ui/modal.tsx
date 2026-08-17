'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  /** `sheet` slides up from the bottom edge — used on the guest camera screen. */
  variant?: 'dialog' | 'sheet'
  className?: string
  /** Hides the visible heading but keeps it as the accessible name. */
  hideTitle?: boolean
}

/**
 * A dialog that actually behaves like one: focus moves in on open and returns
 * to the trigger on close, Tab is trapped, Escape and backdrop clicks dismiss,
 * and the page behind it cannot scroll or be reached by a screen reader.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  variant = 'dialog',
  className,
  hideTitle,
}: ModalProps) {
  const panelRef = React.useRef<HTMLDivElement>(null)
  const previouslyFocused = React.useRef<HTMLElement | null>(null)
  const titleId = React.useId()
  const descId = React.useId()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  // Lock background scroll while open, compensating for the scrollbar width so
  // the layout behind the overlay does not jump.
  React.useEffect(() => {
    if (!open) return
    const { body, documentElement } = document
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
    }
  }, [open])

  /**
   * Move focus in on open, restore it to the trigger on close.
   *
   * `mounted` has to be a dependency: the portal is not rendered on the first
   * pass (it waits for the mount effect), so without it this ran while
   * `panelRef` was still null and focus was left behind on the trigger.
   */
  React.useEffect(() => {
    if (!open || !mounted) return
    previouslyFocused.current = document.activeElement as HTMLElement | null

    const focusFirst = () => {
      const panel = panelRef.current
      if (!panel || panel.contains(document.activeElement)) return
      const first = panel.querySelector<HTMLElement>(FOCUSABLE)
      ;(first ?? panel).focus()
    }

    // Focus synchronously — the portal is already committed by the time effects
    // run. A zero-delay retry covers children that mount a tick later (lazy
    // panels). `requestAnimationFrame` is deliberately not used: it never fires
    // while the document is hidden, which would leave the dialog open with focus
    // stranded on the page behind it.
    focusFirst()
    const retry = window.setTimeout(focusFirst, 0)

    return () => {
      window.clearTimeout(retry)
      const target = previouslyFocused.current
      // Deferred: React detaches the dialog after this cleanup runs, and
      // removing the focused node resets focus to <body>, which would undo an
      // immediate restore. Running a tick later puts focus back on the control
      // that opened the dialog, where a keyboard user expects to resume.
      window.setTimeout(() => {
        if (target?.isConnected) target.focus()
      }, 0)
    }
  }, [open, mounted])

  // Escape to dismiss, Tab cycles inside the panel.
  React.useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return

      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      )
      if (focusable.length === 0) {
        event.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[100] flex animate-fade-in bg-ink/60 p-4 backdrop-blur-sm',
        variant === 'sheet' ? 'items-end justify-center sm:items-center' : 'items-center justify-center'
      )}
      onMouseDown={(event) => {
        // Only dismiss on a press that both starts and ends on the backdrop.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden bg-card text-card-foreground shadow-xl outline-none',
          variant === 'sheet'
            ? 'animate-slide-up rounded-t-2xl sm:max-w-md sm:animate-scale-in sm:rounded-2xl'
            : 'max-w-md animate-scale-in rounded-2xl',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className={cn(
                'text-base font-semibold tracking-tight text-ink',
                hideTitle && 'sr-only'
              )}
            >
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-ink-muted">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1.5 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Close dialog</span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

        {footer && (
          <div className="border-t border-border bg-muted/40 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  )
}

/**
 * Confirmation prompt used instead of `window.confirm`, which is unstyled,
 * blocks the main thread and cannot be dismissed with a backdrop click.
 */
export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  loading,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      className="max-w-sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-muted"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60',
              destructive
                ? 'bg-destructive hover:bg-destructive/90'
                : 'bg-brand-700 hover:bg-brand-800'
            )}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
    </Modal>
  )
}
