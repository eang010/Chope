import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Stored / human-readable: no `T` between date and time (e.g. `2026-05-13 09:00`). */
export function formatListingDatetimeDisplay(value: string | undefined): string {
  if (!value?.trim()) return ''
  return value.trim().replace('T', ' ')
}

/** Parse stored listing datetimes for comparisons (space or `T`; date-only gets midnight). */
function parseListingDate(value: string | undefined): Date | null {
  if (!value?.trim()) return null
  let s = value.trim()
  if (/^\d{4}-\d{2}-\d{2}\s/.test(s)) {
    s = s.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
  }
  if (!s.includes('T') && /^\d{4}-\d{2}-\d{2}$/.test(s.slice(0, 10))) {
    s = `${s.slice(0, 10)}T00:00`
  }
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d
}

const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const MS_PER_YEAR = 365 * MS_PER_DAY

/** Positive duration until target; largest fitting unit down to minutes. */
function relativeInPhrase(diffMs: number): string {
  if (diffMs <= 0) return 'under a minute'
  if (diffMs >= MS_PER_YEAR) {
    const y = Math.floor(diffMs / MS_PER_YEAR)
    return `${y} year${y === 1 ? '' : 's'}`
  }
  if (diffMs >= MS_PER_DAY) {
    const d = Math.floor(diffMs / MS_PER_DAY)
    return `${d} day${d === 1 ? '' : 's'}`
  }
  if (diffMs >= MS_PER_HOUR) {
    const h = Math.floor(diffMs / MS_PER_HOUR)
    return `${h} hour${h === 1 ? '' : 's'}`
  }
  if (diffMs >= MS_PER_MINUTE) {
    const m = Math.floor(diffMs / MS_PER_MINUTE)
    return `${m} minute${m === 1 ? '' : 's'}`
  }
  return 'under a minute'
}

export interface ListingDeadlineMeterState {
  /** 0–100: share of pickup window remaining (100 before/at open, drains toward deadline). */
  percent: number
  headline: string
}

/**
 * Pickup window meter + headline for browse cards (`availableFrom` → `availableUntil`).
 * Caller should only use when `availableUntil` is set.
 */
export function listingDeadlineMeterState(
  availableFrom: string,
  availableUntil: string,
  now: Date
): ListingDeadlineMeterState {
  const from = parseListingDate(availableFrom)
  const until = parseListingDate(availableUntil)
  if (!from || !until) {
    return { percent: 0, headline: 'Pickup window unavailable' }
  }
  const totalMs = until.getTime() - from.getTime()
  if (totalMs <= 0) {
    return { percent: 0, headline: 'Pickup window unavailable' }
  }

  const nowMs = now.getTime()
  if (nowMs >= until.getTime()) {
    return { percent: 0, headline: 'Pickup window ended' }
  }
  if (nowMs <= from.getTime()) {
    return {
      percent: 100,
      headline: `Opens in ${relativeInPhrase(from.getTime() - nowMs)}`,
    }
  }

  const remainingMs = until.getTime() - nowMs
  const percent = Math.round(
    Math.min(100, Math.max(0, (remainingMs / totalMs) * 100))
  )
  return {
    percent,
    headline: `Ending soon in ${relativeInPhrase(remainingMs)}`,
  }
}

/** Persist values from `datetime-local` without a literal `T` in the string. */
export function listingDatetimeForStorage(value: string): string {
  return formatListingDatetimeDisplay(value)
}

/** Format stored listing datetimes for `input type="datetime-local"`. */
export function datetimeLocalFromStored(
  value: string | undefined,
  role: 'from' | 'until'
): string {
  if (!value?.trim()) return ''
  let s = value.trim()
  const defaultTime = role === 'until' ? '23:59' : '00:00'

  // Accept "YYYY-MM-DD HH:mm" (and optional seconds) from stored listings
  if (/^\d{4}-\d{2}-\d{2}\s/.test(s)) {
    s = s.replace(/^(\d{4}-\d{2}-\d{2})\s+/, '$1T')
  }

  if (s.includes('T')) {
    const [d, ...rest] = s.split('T')
    const datePart = d.slice(0, 10)
    const timeRaw =
      rest.join('T').replace(/Z$/i, '').split('.')[0] || defaultTime
    const [hh = '00', mm = '00'] = timeRaw.split(':')
    const timePart = `${hh.padStart(2, '0')}:${mm.padStart(2, '0').slice(0, 2)}`
    return `${datePart}T${timePart}`
  }

  const datePart = s.slice(0, 10)
  return `${datePart}T${defaultTime}`
}
