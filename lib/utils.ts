import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format stored listing datetimes for `input type="datetime-local"`. */
export function datetimeLocalFromStored(
  value: string | undefined,
  role: 'from' | 'until'
): string {
  if (!value?.trim()) return ''
  const s = value.trim()
  const defaultTime = role === 'until' ? '23:59' : '00:00'

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
