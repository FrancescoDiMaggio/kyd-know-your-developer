import type { AnalysisSummary, DeveloperCandidate, DeveloperRow, KydAnalysis } from '../types'
import type { KydService } from './kyd-service'

declare global {
    interface Window {
        g_ck: string
    }
}

// Scripted REST API dell'app (src/fluent/rest/kyd-api.now.ts).
const BASE = '/api/x_giss2_kyd/kyd'

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(BASE + path, {
        ...init,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-UserToken': window.g_ck,
            ...(init.headers || {}),
        },
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) {
        const message = body?.result?.error || body?.error?.message || `HTTP ${response.status}`
        throw new Error(message)
    }
    return body.result as T
}

export const restService: KydService = {
    async getSession() {
        return call<{ language: string }>('/session')
    },

    async listDevelopers() {
        return (await call<{ items: DeveloperRow[] }>('/developers')).items
    },

    async listCandidates() {
        return (await call<{ items: DeveloperCandidate[] }>('/candidates')).items
    },

    async listAnalyses(developerSysId) {
        return (await call<{ items: AnalysisSummary[] }>(`/developers/${encodeURIComponent(developerSysId)}/analyses`)).items
    },

    async getAnalysis(analysisSysId) {
        return call<KydAnalysis>(`/analyses/${encodeURIComponent(analysisSysId)}`)
    },

    async requestAnalysis(developerSysId, period) {
        const res = await call<{ summary: AnalysisSummary }>('/analyses', {
            method: 'POST',
            body: JSON.stringify({ developer: developerSysId, from: period.from, to: period.to }),
        })
        return res.summary
    },
}
