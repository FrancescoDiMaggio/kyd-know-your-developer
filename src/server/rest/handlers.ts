import { GlideAggregate, GlideRecord, gs } from '@servicenow/glide'
import type { DeveloperCandidate, DeveloperRow } from '../../client/types'
import { ANALYSIS_TABLE, KYD_USER_ROLE } from '../analysis/config'
import { loadUsers, toSummary } from './serialize'

const GLIDE_DATE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
const SYS_ID = /^[0-9a-f]{32}$/

function fail(response: any, status: number, message: string) {
    response.setStatus(status)
    response.setBody({ error: message })
}

function authorized(response: any): boolean {
    if (gs.hasRole(KYD_USER_ROLE)) return true
    fail(response, 403, `Serve il ruolo ${KYD_USER_ROLE}`)
    return false
}

function analysesCountByDeveloper(): Record<string, number> {
    const out: Record<string, number> = {}
    const ga: any = new GlideAggregate(ANALYSIS_TABLE)
    ga.groupBy('developer')
    ga.addAggregate('COUNT')
    ga.query()
    while (ga.next()) out[ga.getValue('developer')] = parseInt(ga.getAggregate('COUNT'), 10)
    return out
}

// GET /candidates: utenti con almeno una conversazione Build Agent.
export function listCandidates(request: any, response: any) {
    if (!authorized(response)) return
    const stats: { user: string; conversations: number; lastActivity: string }[] = []
    const ga: any = new GlideAggregate('sn_build_agent_conversation')
    ga.addNotNullQuery('user')
    ga.groupBy('user')
    ga.addAggregate('COUNT')
    ga.addAggregate('MAX', 'sys_updated_on')
    ga.query()
    while (ga.next()) {
        stats.push({
            user: ga.getValue('user'),
            conversations: parseInt(ga.getAggregate('COUNT'), 10),
            lastActivity: ga.getAggregate('MAX', 'sys_updated_on') || '',
        })
    }
    const users = loadUsers(stats.map((s) => s.user))
    const analyses = analysesCountByDeveloper()
    const items: DeveloperCandidate[] = stats
        .filter((s) => users[s.user])
        .map((s) => ({
            developer: users[s.user],
            conversations: s.conversations,
            lastActivity: s.lastActivity,
            analysesCount: analyses[s.user] || 0,
        }))
    response.setBody({ items })
}

// GET /developers: un developer per riga, con l'analisi più recente.
export function listDevelopers(request: any, response: any) {
    if (!authorized(response)) return
    const counts = analysesCountByDeveloper()
    const users = loadUsers(Object.keys(counts))
    const items: DeveloperRow[] = []
    for (const dev of Object.keys(counts)) {
        const gr = new GlideRecord(ANALYSIS_TABLE)
        gr.addQuery('developer', dev)
        gr.orderByDesc('sys_created_on')
        gr.setLimit(1)
        gr.query()
        if (!gr.next()) continue
        const latest = toSummary(gr, users)
        items.push({ developer: latest.developer, latest, analysesCount: counts[dev] })
    }
    items.sort((a, b) => b.latest.requestedOn.localeCompare(a.latest.requestedOn))
    response.setBody({ items })
}

// GET /developers/{developer}/analyses
export function listAnalyses(request: any, response: any) {
    if (!authorized(response)) return
    const developer = String(request.pathParams.developer || '')
    if (!SYS_ID.test(developer)) return fail(response, 400, 'developer non valido')
    const users = loadUsers([developer])
    const items = []
    const gr = new GlideRecord(ANALYSIS_TABLE)
    gr.addQuery('developer', developer)
    gr.orderByDesc('sys_created_on')
    gr.query()
    while (gr.next()) items.push(toSummary(gr, users))
    response.setBody({ items })
}

// GET /analyses/{id}: riepilogo più risultato completo.
export function getAnalysis(request: any, response: any) {
    if (!authorized(response)) return
    const id = String(request.pathParams.id || '')
    const gr = new GlideRecord(ANALYSIS_TABLE)
    if (!SYS_ID.test(id) || !gr.get(id)) return fail(response, 404, 'Analisi non trovata')
    const summary = toSummary(gr, loadUsers([gr.getValue('developer')]))
    const raw = gr.getValue('result')
    let result
    try {
        result = summary.state === 'complete' && raw ? JSON.parse(raw) : undefined
    } catch {
        result = undefined
    }
    const errorMessage = summary.state === 'error' ? gr.getValue('error_message') || undefined : undefined
    response.setBody({ summary: errorMessage ? { ...summary, statusMessage: errorMessage } : summary, result })
}

// POST /analyses { developer, from, to }: crea l'analisi in coda o restituisce quella già pendente.
export function createAnalysis(request: any, response: any) {
    if (!authorized(response)) return
    const body = request.body?.data || {}
    const developer = String(body.developer || '')
    const from = String(body.from || '')
    const to = String(body.to || '')
    if (!SYS_ID.test(developer)) return fail(response, 400, 'developer non valido')
    if (!GLIDE_DATE.test(from) || !GLIDE_DATE.test(to) || from >= to) return fail(response, 400, 'periodo non valido')
    const users = loadUsers([developer])
    if (!users[developer]) return fail(response, 404, 'Developer non trovato')

    const pending = new GlideRecord(ANALYSIS_TABLE)
    pending.addQuery('developer', developer)
    pending.addQuery('state', 'IN', 'queued,running')
    pending.orderByDesc('sys_created_on')
    pending.setLimit(1)
    pending.query()
    if (pending.next()) {
        response.setStatus(200)
        response.setBody({ summary: toSummary(pending, users), existing: true })
        return
    }

    const gr = new GlideRecord(ANALYSIS_TABLE)
    gr.initialize()
    gr.setValue('developer', developer)
    gr.setValue('requested_by', gs.getUserID())
    gr.setValue('state', 'queued')
    gr.setValue('status_message', 'In coda')
    gr.setValue('period_from', from)
    gr.setValue('period_to', to)
    const id = gr.insert()
    if (!id) return fail(response, 500, "Impossibile creare l'analisi")
    gr.get(id)
    response.setStatus(201)
    response.setBody({ summary: toSummary(gr, users), existing: false })
}
