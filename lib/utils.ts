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
