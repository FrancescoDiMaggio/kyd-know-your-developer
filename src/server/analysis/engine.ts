import { GlideRecord } from '@servicenow/glide'
import type { AnalysisKpis, DeveloperRef, GovernanceSection, KydAnalysisResult, ToolStat } from '../../client/types'
import { MAX_SCRIPT_FAILS } from './config'
import { buildIdentity } from './identity'
import { collectConversations, newScanContext, scanMessages } from './messages'
import { buildMetadata, buildUpdateSets } from './metadata'
import { buildGraph } from './graph'
import { countRows, periodQuery, sortedPairs } from './util'

export interface EngineOutput {
    developer: DeveloperRef
    result: KydAnalysisResult
    kpis: AnalysisKpis
}

const minutes = (ms: number) => Math.round(ms / 60000)

// Esegue l'analisi KYD di un developer nel periodo [from, to).
export function buildAnalysis(userSysId: string, from: string, to: string, progress: (msg: string) => void): EngineOutput {
    const u = new GlideRecord('sys_user')
    if (!u.get(userSysId)) throw new Error(`Utente ${userSysId} non trovato`)
    const userName = u.getValue('user_name')
    const { developer, identity } = buildIdentity(u)

    progress('Lettura delle conversazioni Build Agent…')
    const conv = collectConversations(userSysId, from, to)
    const ctx = newScanContext()
    progress(`Scansione dei messaggi di ${conv.ids.length} conversazioni…`)
    scanMessages(ctx, conv)

    progress('Analisi dei metadata e degli update set…')
    const metadata = buildMetadata(userName, from, to)
    const updateSets = buildUpdateSets(userName, from, to)

    const toolItems: ToolStat[] = Object.entries(ctx.tools)
        .map(([tool, s]) => ({ tool, calls: s.ok + s.ko, ok: s.ok, ko: s.ko, seconds: Math.round(s.ms / 1000), critical: s.ko > 0 && s.ko >= s.ok }))
        .sort((a, b) => b.calls - a.calls)
    const toolsOk = toolItems.reduce((a, t) => a + t.ok, 0)

    progress('Indicatori di governance…')
    const dateQ = periodQuery(from, to)
    const runScriptCalls = ctx.tools['run_script'] ? ctx.tools['run_script'].ok + ctx.tools['run_script'].ko : 0
    const scriptRequests = countRows('sn_build_agent_script_request', `sys_created_by=${userName}^${dateQ}`)
    // La tabella delle script request può non essere leggibile da questo scope:
    // in quel caso si stima con le chiamate al tool run_script.
    const estimated = !scriptRequests && runScriptCalls > 0
    const atfTests = countRows('sys_atf_test', `sys_created_by=${userName}^${dateQ}`)
    const install = ctx.tools['install'] || { ok: 0, ko: 0 }
    const roots = conv.ids.map((id) => conv.meta[id])
    const governance: GovernanceSection = {
        backgroundScripts: estimated ? runScriptCalls : scriptRequests,
        backgroundScriptsEstimated: estimated,
        atfTests,
        globalConversations: roots.filter((c) => c.scopeId === 'global').length,
        totalConversations: roots.length,
        install: { failed: install.ko, total: install.ok + install.ko },
        build: { failed: ctx.buildFailures.length, total: ctx.buildCount },
        frictionPrompts: ctx.pq.friction,
        checklist: [
            {
                item: 'Bonificare gli update set "in progress" con volume anomalo (dati demo vs soluzione)',
                triggered: updateSets.some((s) => s.anomalous),
            },
            { item: 'Eliminare le tabelle scratch np$* senza campi', triggered: metadata.tables.some((t) => t.scratch) },
            {
                item: 'Audit dei campi/view aggiunti su tabelle OOTB (sc_req_item, sc_cat_item, task...)',
                triggered: metadata.dictionaryByTable.some((d) => !/^(u_|x_)/.test(d.table)),
            },
            { item: 'Coprire con ATF i catalog item e i flow modificati', triggered: atfTests === 0 && metadata.artifacts.length > 0 },
            { item: 'Chiudere o completare gli update set rimasti aperti', triggered: updateSets.some((s) => s.state === 'in progress') },
        ],
    }

    const days = Object.keys(ctx.byDay).sort()
    const peakDate = days.reduce((best, d) => (ctx.byDay[d] > (ctx.byDay[best] || 0) ? d : best), days[0] || '')
    const pq = ctx.pq

    progress('Costruzione del grafo di relazione…')
    const result: KydAnalysisResult = {
        identity,
        conversations: {
            rootCount: conv.rootCount,
            totalCount: conv.ids.length,
            messages: ctx.messages,
            items: roots,
            senderTotals: sortedPairs(ctx.senderTotals).map(([sender, count]) => ({ sender, count })),
        },
        tools: { calls: ctx.toolTotal, ok: toolsOk, ko: ctx.toolTotal - toolsOk, items: toolItems },
        buildInstall: {
            installs: ctx.installs,
            buildTotal: ctx.buildCount,
            buildFailures: ctx.buildFailures,
            scriptFailureCount: ctx.scriptFailures.length,
            scriptFailures: ctx.scriptFailures.slice(0, MAX_SCRIPT_FAILS),
        },
        files: {
            operations: ctx.fileOps,
            writes: sortedPairs(ctx.filesWritten).map(([path, count]) => ({ path, count })),
            deletes: ctx.filesDeleted,
        },
        scriptIntents: { total: ctx.scriptIntents.length, items: ctx.scriptIntents.slice(0, 500) },
        subAgents: ctx.subAgents,
        behaviour: {
            activeDays: days.length,
            byDay: days.map((date) => ({ date, prompts: ctx.byDay[date] })),
            peak: { date: peakDate, prompts: ctx.byDay[peakDate] || 0 },
            byHour: Object.keys(ctx.byHour)
                .sort()
                .map((h) => ({ hour: parseInt(h, 10), prompts: ctx.byHour[h] })),
            prompts: pq.total,
            systemMarkers: pq.hidden,
            avgPromptChars: pq.total ? Math.round(ctx.promptChars / pq.total) : 0,
            longestPrompt: ctx.longestPrompt,
            images: ctx.images,
            agentMinutes: {
                thinking: minutes(ctx.durThinking),
                tools: minutes(ctx.durTools),
                responses: minutes(ctx.durResponses),
                total: minutes(ctx.durThinking + ctx.durTools + ctx.durResponses),
            },
        },
        promptQuality: {
            base: pq.total,
            metrics: [
                { key: 'ultraShort', label: 'Ultra-brevi (≤15 caratteri: "go", "yes")', count: pq.ultraShort },
                { key: 'veryLong', label: 'Molto articolati (>1500 caratteri)', count: pq.veryLong },
                { key: 'withImages', label: 'Con immagini / screenshot', count: pq.withImages },
                { key: 'withUrl', label: "Con link a record dell'istanza", count: pq.withUrl },
                { key: 'withTicket', label: 'Con riferimenti ticket (RITM/REQ/STRY)', count: pq.withTicket },
                { key: 'withTech', label: 'Con nomi tecnici tabella / campo', count: pq.withTech },
                { key: 'duplicates', label: 'Duplicati (stesso testo reinviato)', count: pq.duplicates },
                { key: 'friction', label: 'Con segnali di attrito / frustrazione', count: pq.friction },
            ],
        },
        metadata,
        updateSets,
        governance,
        prompts: conv.ids
            .filter((id) => ctx.prompts[id]?.length)
            .map((id) => ({ conversation: id, items: ctx.prompts[id] })),
        graph: buildGraph(developer.name, pq.total, roots, updateSets, metadata),
    }

    return {
        developer,
        result,
        kpis: {
            conversations: conv.rootCount,
            prompts: pq.total,
            functionalArtifacts: metadata.artifacts.length,
            toolSuccessRate: ctx.toolTotal ? toolsOk / ctx.toolTotal : 0,
        },
    }
}
