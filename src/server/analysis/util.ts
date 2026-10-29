import { GlideAggregate } from '@servicenow/glide'

export function flat(s: unknown, n: number): string {
    return String(s == null ? '' : s)
        .replace(/\s+/g, ' ')
        .substring(0, n)
}

export function parseContent(raw: string): any {
    try {
        return JSON.parse(raw || '{}')
    } catch {
        return { sender: 'PARSE_ERROR' }
    }
}

export function inc(obj: Record<string, number>, key: string, n = 1) {
    obj[key] = (obj[key] || 0) + n
}

export function sortedPairs(obj: Record<string, number>): [string, number][] {
    return Object.entries(obj).sort((a, b) => b[1] - a[1])
}

// COUNT su una tabella qualsiasi; null se la tabella non è leggibile da questo scope.
export function countRows(table: string, encodedQuery?: string): number | null {
    try {
        const ga: any = new GlideAggregate(table)
        if (encodedQuery) ga.addEncodedQuery(encodedQuery)
        ga.addAggregate('COUNT')
        ga.query()
        return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0
    } catch {
        return null
    }
}

// Raggruppa per un campo e restituisce { valore: conteggio }.
export function countBy(table: string, encodedQuery: string, field: string): Record<string, number> {
    const out: Record<string, number> = {}
    const ga: any = new GlideAggregate(table)
    ga.addEncodedQuery(encodedQuery)
    ga.groupBy(field)
    ga.addAggregate('COUNT')
    ga.query()
    while (ga.next()) out[ga.getValue(field)] = parseInt(ga.getAggregate('COUNT'), 10)
    return out
}

export function periodQuery(from: string, to: string): string {
    return `sys_created_on>=${from}^sys_created_on<${to}`
}
