// Segnaposto %1, %2, ... nei messaggi tradotti con t().
// Non si usano {0}: l'SDK inserisce ogni messaggio in un'espressione Jelly ${...}
// e una parentesi graffa nel testo rischierebbe di chiuderla in anticipo.
export function fill(message: string, ...args: unknown[]): string {
    return message.replace(/%(\d+)/g, (match, n) => {
        const value = args[Number(n) - 1]
        return value === undefined ? match : String(value)
    })
}
