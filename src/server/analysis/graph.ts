import type { Conversation, GraphEdge, GraphNode, MetadataSection, UpdateSet } from '../../client/types'
import { conversationOwner } from './windows.ts'

// Grafo di relazione: ogni elemento datato viene attribuito alla conversazione
// la cui finestra [creata, ultimo messaggio] lo contiene; a parità vince la più stretta.
export function buildGraph(
    developerName: string,
    prompts: number,
    conversations: Conversation[],
    updateSets: UpdateSet[],
    metadata: MetadataSection,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const ownerOf = conversationOwner(conversations)

    const DEV = 'dev'
    const nodes: GraphNode[] = [{ id: DEV, label: developerName, type: 'developer', weight: prompts }]
    const edges: GraphEdge[] = []
    const has = (id: string) => nodes.some((n) => n.id === id)

    for (const c of conversations) {
        nodes.push({ id: 'conv:' + c.sysId, label: c.title.slice(0, 48), type: 'conversation', weight: c.senders.user })
        edges.push({ source: c.parent ? 'conv:' + c.parent : DEV, target: 'conv:' + c.sysId })
    }

    updateSets.forEach((u, i) => {
        const id = 'us:' + i
        nodes.push({ id, label: u.name.slice(0, 40), type: 'updateset', weight: u.updates, items: [`${u.state} · ${u.updates} update`] })
        const owner = ownerOf(u.createdOn)
        edges.push({ source: owner ? 'conv:' + owner : DEV, target: id })
    })

    const tableNames = new Set([...metadata.tables.map((t) => t.name), ...metadata.dictionaryByTable.map((d) => d.table)])
    const tableByLabel: Record<string, string> = {}
    metadata.tables.forEach((t) => (tableByLabel[t.label] = t.name))

    const tableNode = (name: string) => {
        const id = 'tbl:' + name
        if (!has(id)) {
            const t = metadata.tables.find((x) => x.name === name)
            const d = metadata.dictionaryByTable.find((x) => x.table === name)
            const items: string[] = []
            if (t) items.push(`${t.scratch ? 'scratch Table Builder · ' : ''}${t.fields} campi · ${t.records ?? 'n/d'} record`)
            if (d) items.push(`${d.count} modifiche al dizionario`)
            nodes.push({ id, label: name, type: 'table', weight: t ? t.fields : d ? d.count : 1, items })
        }
        return id
    }

    // Artefatti raggruppati per (conversazione, classe), collegati alle tabelle che nominano.
    const groups: Record<string, { owner: string; cls: string; items: string[] }> = {}
    for (const a of metadata.artifacts) {
        const owner = ownerOf(a.createdOn) || 'none'
        ;(groups[owner + '|' + a.cls] ||= { owner, cls: a.cls, items: [] }).items.push(a.name)
    }
    Object.values(groups).forEach((g, i) => {
        const id = 'grp:' + i
        nodes.push({ id, label: `${g.cls} (${g.items.length})`, type: 'artifacts', weight: g.items.length, items: g.items })
        edges.push({ source: g.owner === 'none' ? DEV : 'conv:' + g.owner, target: id })
        const linked = new Set<string>()
        for (const name of g.items) {
            const direct = tableByLabel[name] || [...tableNames].find((t) => name === t || name.startsWith(t + '.'))
            if (direct) linked.add(direct)
        }
        linked.forEach((t) => edges.push({ source: id, target: tableNode(t) }))
    })

    // Tabelle senza artefatto datato (scratch np$, dizionario): agganciate alla
    // conversazione che ha creato tabelle senza nome, altrimenti al developer.
    const unnamed = metadata.artifacts.find((a) => a.cls === 'sys_db_object' && !a.name)
    tableNames.forEach((name) => {
        if (has('tbl:' + name)) return
        const id = tableNode(name)
        const owner = name.startsWith('np$') && unnamed ? ownerOf(unnamed.createdOn) : null
        edges.push({ source: owner ? 'conv:' + owner : DEV, target: id })
    })

    return { nodes, edges }
}
