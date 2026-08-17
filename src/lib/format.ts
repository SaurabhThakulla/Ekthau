/**
 * Date helpers. Every screen used to call `toLocaleDateString` with different
 * options (or none at all, which renders differently per visitor locale and
 * caused a hydration mismatch between server and client). These pin the locale
 * so the server and browser always produce the same string.
 */

const LOCALE = 'en-GB'

/** `15 Oct 2026` */
export function formatEventDate(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return 'Date to be confirmed'
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** `Thursday, 15 October 2026` */
export function formatEventDateLong(value: string | null | undefined): string {
  const date = toDate(value)
  if (!date) return 'Date to be confirmed'
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** ISO `YYYY-MM-DD` for `<time dateTime>` and date inputs. */
export function toDateInputValue(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayInputValue(): string {
  return toDateInputValue(new Date())
}

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null
  // Date-only strings are parsed as UTC by the Date constructor, which shifts
  // the displayed day backwards west of Greenwich. Build a local date instead.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
