const LOCALE = 'it-IT'

// Le date arrivano dalla piattaforma in UTC nel formato "YYYY-MM-DD HH:mm:ss".
export function parseGlideDate(value?: string): Date | null {
    if (!value) return null
    const iso = value.includes('T') ? value : value.replace(' ', 'T') + (value.length === 16 ? ':00' : '') + 'Z'
    const d = new Date(iso)
    return isNaN(d.getTime()) ? null : d
}

export function fmtDateTime(value?: string): string {
    const d = parseGlideDate(value)
    return d ? d.toLocaleString(LOCALE, { dateStyle: 'short', timeStyle: 'short' }) : '—'
}

export function fmtDate(value?: string): string {
    const d = parseGlideDate(value)
    return d ? d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}

export function fmtDayShort(value: string): string {
    const d = parseGlideDate(value.length === 10 ? value + ' 00:00:00' : value)
    return d ? d.toLocaleDateString(LOCALE, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }) : value
}

export function fmtNumber(n: number | null | undefined): string {
    return n == null ? 'n/d' : n.toLocaleString(LOCALE)
}

export function fmtPct(part: number, total: number, digits = 1): string {
    if (!total) return 'n/d'
    return (part / total).toLocaleString(LOCALE, { style: 'percent', maximumFractionDigits: digits })
}

export function fmtHours(minutes: number): string {
    return (minutes / 60).toLocaleString(LOCALE, { maximumFractionDigits: 1 }) + ' h'
}

export function nowGlide(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export function shortId(sysId: string): string {
    return sysId.slice(0, 6)
}
