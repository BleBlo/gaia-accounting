import {
  format,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  startOfQuarter,
  endOfQuarter,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  parseISO,
} from 'date-fns'

export function formatDate(date: Date | string, formatString = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatString)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function getDateRangeLabel(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isThisWeek(d)) return format(d, 'EEEE')
  if (isThisMonth(d)) return format(d, 'MMMM d')
  return format(d, 'MMM d, yyyy')
}

export type DateRangePreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'custom'

export function getDateRange(preset: DateRangePreset): { start: Date; end: Date } {
  const now = new Date()

  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'yesterday':
      const yesterday = subDays(now, 1)
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) }
    case 'thisWeek':
      return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) }
    case 'lastWeek':
      const lastWeek = subWeeks(now, 1)
      return { start: startOfWeek(lastWeek, { weekStartsOn: 0 }), end: endOfWeek(lastWeek, { weekStartsOn: 0 }) }
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'lastMonth':
      const lastMonth = subMonths(now, 1)
      return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) }
    default:
      return { start: startOfDay(now), end: endOfDay(now) }
  }
}

export function getQuarterRange(quarter: 1 | 2 | 3 | 4, year: number): { start: Date; end: Date } {
  const quarterStart = new Date(year, (quarter - 1) * 3, 1)
  return {
    start: startOfQuarter(quarterStart),
    end: endOfQuarter(quarterStart),
  }
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMMM')
}

export function getDaysInRange(start: Date, end: Date): Date[] {
  const days: Date[] = []
  let current = startOfDay(start)
  const endDay = startOfDay(end)

  while (current <= endDay) {
    days.push(current)
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000)
  }

  return days
}
