// Le UI Page caricano Prototype.js 1.7.3 (/scripts/lib/prototype.jsx), che imposta
// Array.from = $A: ignora la funzione di mapping e restituisce [] per Set, Map e iteratori.
// d3-shape (barre impilate di recharts) e Array.from({ length }, fn) ne dipendono.
// Va importato per primo, prima di qualunque libreria.

type MapFn = (value: unknown, index: number) => unknown

const legacyFrom = Array.from as (items: unknown) => unknown[]

function isBroken(): boolean {
    try {
        return Array.from([1], (x: number) => x + 1)[0] !== 2 || Array.from(new Set([1])).length !== 1
    } catch {
        return true
    }
}

function from(items: any, mapFn?: MapFn, thisArg?: unknown): unknown[] {
    if (items == null) throw new TypeError('Array.from requires an array-like or iterable object')
    let values: unknown[]
    if (typeof items[Symbol.iterator] === 'function') {
        values = []
        for (const v of items) values.push(v)
    } else if (typeof items.toArray === 'function') {
        // oggetti Prototype (Hash, Enumerable): stesso comportamento di $A
        values = legacyFrom(items)
    } else {
        const length = Math.max(0, Number(items.length) || 0)
        values = new Array(length)
        for (let i = 0; i < length; i++) values[i] = items[i]
    }
    return mapFn ? values.map((v, i) => mapFn.call(thisArg, v, i)) : values
}

if (isBroken()) {
    ;(Array as any).from = from
}
