import type { AnalysisState, AnalysisSummary, DeveloperCandidate, DeveloperRef, KydAnalysis } from '../types'
import type { AnalysisPeriod, KydService } from './kyd-service'
import { demoPeriod, demoResult } from '../fixtures/demo-analysis'
import { nowGlide, parseGlideDate } from '../utils/format'

// Simula il motore asincrono: ogni analisi richiesta resta "queued" e poi
// "running" per qualche secondo, poi si completa con il risultato di esempio.
const QUEUED_MS = 4000
const RUNNING_MS = 12000
const STORAGE_KEY = 'kyd.mock.analyses'

const DEMO: DeveloperRef = {
    sysId: '0d1e2f30405060708090a0b0c0d0e0f1',
    name: 'Developer demo',
    userName: 'dev.demo',
    email: 'dev.demo@example.com',
}

const CANDIDATES: DeveloperCandidate[] = [
    { developer: DEMO, conversations: 8, lastActivity: '2026-10-29 09:38:40', analysesCount: 0 },
    {
        developer: { sysId: '1d1e2f30405060708090a0b0c0d0e0f2', name: 'Developer demo B', userName: 'dev.demo.b' },
        conversations: 3,
        lastActivity: '2026-10-21 14:02:10',
        analysesCount: 0,
    },
    {
        developer: { sysId: '2d1e2f30405060708090a0b0c0d0e0f3', name: 'Developer demo C', userName: 'dev.demo.c' },
        conversations: 1,
        lastActivity: '2026-10-14 08:45:00',
        analysesCount: 0,
    },
]

const kpis = {
    conversations: demoResult.conversations.rootCount,
    prompts: demoResult.behaviour.prompts,
    functionalArtifacts: demoResult.metadata.artifacts.length,
    toolSuccessRate: demoResult.tools.ok / demoResult.tools.calls,
}

const SEED: AnalysisSummary[] = [
    {
        sysId: 'a0000000000000000000000000000001',
        number: 'KYD0001001',
        developer: DEMO,
        state: 'complete',
        requestedOn: '2026-10-29 09:40:00',
        completedOn: '2026-10-29 09:43:12',
        periodFrom: demoPeriod.from,
        periodTo: demoPeriod.to,
        kpis,
    },
]

function load(): AnalysisSummary[] {
    try {
        const raw = window.sessionStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : [...SEED]
    } catch {
        return [...SEED]
    }
}

let analyses = load()

function save() {
    try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(analyses))
    } catch {
        // sessionStorage non disponibile: lo stato resta in memoria
    }
}

// Calcola lo stato simulato in base al tempo trascorso dalla richiesta.
function withLiveState(a: AnalysisSummary): AnalysisSummary {
    if (a.state === 'complete' || a.state === 'error') return a
    const requested = parseGlideDate(a.requestedOn)?.getTime() ?? Date.now()
    const elapsed = Date.now() - requested
    let state: AnalysisState = 'queued'
    if (elapsed >= QUEUED_MS + RUNNING_MS) state = 'complete'
    else if (elapsed >= QUEUED_MS) state = 'running'
    if (state !== 'complete') {
        return { ...a, state, statusMessage: state === 'running' ? 'Scansione dei messaggi Build Agent…' : 'In coda' }
    }
    const done = { ...a, state, statusMessage: undefined, completedOn: nowGlide(), kpis }
    analyses = analyses.map((x) => (x.sysId === a.sysId ? done : x))
    save()
    return done
}

const delay = <T>(value: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(value), ms))

function nextNumber() {
    const max = analyses.reduce((m, a) => Math.max(m, parseInt(a.number.slice(3), 10)), 1000)
    return 'KYD' + String(max + 1).padStart(7, '0')
}

export const mockService: KydService = {
    isDemo: true,

    async listDevelopers() {
        const live = analyses.map(withLiveState)
        const byDev = new Map<string, AnalysisSummary[]>()
        live.forEach((a) => byDev.set(a.developer.sysId, [...(byDev.get(a.developer.sysId) || []), a]))
        const rows = [...byDev.values()].map((list) => {
            const sorted = [...list].sort((x, y) => y.requestedOn.localeCompare(x.requestedOn))
            return { developer: sorted[0].developer, latest: sorted[0], analysesCount: list.length }
        })
        return delay(rows.sort((x, y) => y.latest.requestedOn.localeCompare(x.latest.requestedOn)))
    },

    async listCandidates() {
        return delay(
            CANDIDATES.map((c) => ({
                ...c,
                analysesCount: analyses.filter((a) => a.developer.sysId === c.developer.sysId).length,
            })),
        )
    },

    async listAnalyses(developerSysId) {
        const list = analyses.filter((a) => a.developer.sysId === developerSysId).map(withLiveState)
        return delay(list.sort((x, y) => y.requestedOn.localeCompare(x.requestedOn)))
    },

    async getAnalysis(analysisSysId) {
        const found = analyses.find((a) => a.sysId === analysisSysId)
        if (!found) throw new Error('Analisi non trovata')
        const summary = withLiveState(found)
        const analysis: KydAnalysis = { summary, result: summary.state === 'complete' ? demoResult : undefined }
        return delay(analysis, 400)
    },

    async requestAnalysis(developerSysId, period: AnalysisPeriod) {
        const dev = CANDIDATES.find((c) => c.developer.sysId === developerSysId)?.developer
        if (!dev) throw new Error('Developer non trovato')
        const pending = analyses.map(withLiveState).find(
            (a) => a.developer.sysId === developerSysId && (a.state === 'queued' || a.state === 'running'),
        )
        if (pending) return delay(pending)
        const created: AnalysisSummary = {
            sysId: crypto.randomUUID().replace(/-/g, ''),
            number: nextNumber(),
            developer: dev,
            state: 'queued',
            statusMessage: 'In coda',
            requestedOn: nowGlide(),
            periodFrom: period.from,
            periodTo: period.to,
        }
        analyses = [created, ...analyses]
        save()
        return delay(created)
    },
}
