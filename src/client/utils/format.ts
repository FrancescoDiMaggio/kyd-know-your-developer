// Locale delle formattazioni: la lingua della sessione ServiceNow (vedi setLocale in app.tsx).
let locale = navigator.language || 'en'

export function setLocale(language?: string) {
    if (language) locale = language.replace('_', '-')
}

// Le date arrivano dalla piattaforma in UTC nel formato "YYYY-MM-DD HH:mm:ss".
export function parseGlideDate(value?: string): Date | null {
    if (!value) return null
    const iso = value.includes('T') ? value : value.replace(' ', 'T') + (value.length === 16 ? ':00' : '') + 'Z'
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d
}

export function fmtDateTime(value?: string): string {
    const d = parseGlideDate(value)
    return d ? d.toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

export function fmtDate(value?: string): string {
    const d = parseGlideDate(value)
    return d ? d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export function fmtDayShort(value: string): string {
    const d = parseGlideDate(value.length === 10 ? value + ' 00:00:00' : value)
    return d ? d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }) : value
}

export function fmtNumber(n: number | null | undefined): string {
    return n == null ? 'n/a' : n.toLocaleString(locale)
}

export function fmtPct(part: number, total: number, digits = 1): string {
    if (!total) return 'n/a'
    return (part / total).toLocaleString(locale, { style: 'percent', maximumFractionDigits: digits })
}

export function fmtShare(value: number): string {
    return (value / 100).toLocaleString(locale, { style: 'percent', maximumFractionDigits: 1 })
}

export function fmtHours(minutes: number): string {
    return (minutes / 60).toLocaleString(locale, { maximumFractionDigits: 1 }) + ' h'
}

export function shortId(sysId: string): string {
    return sysId.slice(0, 6)
}

// Periodo [from, to) come intervallo leggibile, es. "1–29 Oct 2026" (to è esclusivo).
export function fmtRange(from?: string, to?: string): string {
    const start = parseGlideDate(from)
    const endExclusive = parseGlideDate(to)
    if (!start || !endExclusive) return '—'
    const end = new Date(Math.max(start.getTime(), endExclusive.getTime() - 86400000))
    const f = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    return typeof (f as any).formatRange === 'function' ? (f as any).formatRange(start, end) : `${f.format(start)} – ${f.format(end)}`
}

// Nome del mese se il periodo sta in un solo mese, altrimenti null.
export function monthOf(from?: string, to?: string): string | null {
    const start = parseGlideDate(from)
    const endExclusive = parseGlideDate(to)
    if (!start || !endExclusive) return null
    const end = new Date(endExclusive.getTime() - 86400000)
    if (start.getUTCFullYear() !== end.getUTCFullYear() || start.getUTCMonth() !== end.getUTCMonth()) return null
    return new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(start)
}
