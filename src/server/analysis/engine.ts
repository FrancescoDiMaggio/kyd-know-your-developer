import { GlideRecord, gs } from '@servicenow/glide'
import type { AnalysisKpis, AnalysisStage, DeveloperRef, GovernanceSection, KydAnalysisResult, ToolStat } from '../../client/types'
import { MAX_SCRIPT_FAILS } from './config.ts'
import { buildIdentity } from './identity.ts'
import { collectConversations, newScanContext, scanMessages } from './messages.ts'
import { buildMetadata, buildUpdateSets } from './metadata.ts'
import { buildGraph } from './graph.ts'
import { buildAcceleration } from '../effort/acceleration.ts'
import { countRows, periodQuery, sortedPairs } from './util.ts'

export interface EngineOutput {
    developer: DeveloperRef
    result: KydAnalysisResult
    kpis: AnalysisKpis
}

const minutes = (ms: number) => Math.round(ms / 60000)

export type Progress = (stage: AnalysisStage, message: string) => void

// Esegue l'analisi KYD di un developer nel periodo [from, to).
export function buildAnalysis(userSysId: string, from: string, to: string, progress: Progress): EngineOutput {
    const u = new GlideRecord('sys_user')
    if (!u.get(userSysId)) throw new Error(`User ${userSysId} not found`)
    const userName = u.getValue('user_name')
    const { developer, identity } = buildIdentity(u)

    progress('conversations', 'Reading Build Agent conversations')
    const conv = collectConversations(userSysId, from, to)
    const ctx = newScanContext()
    progress('messages', `Scanning messages of ${conv.ids.length} conversations`)
    scanMessages(ctx, conv)

    progress('metadata', 'Analysing metadata and update sets')
    const metadata = buildMetadata(userName, from, to)
    const updateSets = buildUpdateSets(userName, from, to)

    const toolItems: ToolStat[] = Object.entries(ctx.tools)
        .map(([tool, s]) => ({ tool, calls: s.ok + s.ko, ok: s.ok, ko: s.ko, seconds: Math.round(s.ms / 1000), critical: s.ko > 0 && s.ko >= s.ok }))
        .sort((a, b) => b.calls - a.calls)
    const toolsOk = toolItems.reduce((a, t) => a + t.ok, 0)

    progress('governance', 'Computing governance indicators')
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
                key: 'anomalousUpdateSets',
                item: 'Clean up "in progress" update sets with an anomalous volume (demo data vs solution)',
                triggered: updateSets.some((s) => s.anomalous),
            },
            { key: 'scratchTables', item: 'Delete the np$* scratch tables with no fields', triggered: metadata.tables.some((t) => t.scratch) },
            {
                key: 'ootbChanges',
                item: 'Audit fields and views added to platform tables (sc_req_item, sc_cat_item, task...)',
                triggered: metadata.dictionaryByTable.some((d) => !/^(u_|x_)/.test(d.table)),
            },
            {
                key: 'atfCoverage',
                item: 'Cover the modified catalog items and flows with ATF tests',
                triggered: atfTests === 0 && metadata.artifacts.length > 0,
            },
            {
                key: 'openUpdateSets',
                item: 'Close or complete the update sets left open',
                triggered: updateSets.some((s) => s.state === 'in progress'),
            },
        ],
    }

    const days = Object.keys(ctx.byDay).sort()
    const peakDate = days.reduce((best, d) => (ctx.byDay[d] > (ctx.byDay[best] || 0) ? d : best), days[0] || '')
    const pq = ctx.pq

    // La stima dell'effort è un di più: un suo errore non deve invalidare l'analisi.
    progress('effort', 'Estimating the manual effort')
    let acceleration
    try {
        acceleration = buildAcceleration({
            userSysId,
            userName,
            from,
            to,
            conversations: roots,
            promptTimes: ctx.promptTimes,
            prompts: Object.entries(ctx.prompts).map(([conversation, items]) => ({ conversation, items })),
            scriptIntents: ctx.scriptIntents,
            updateSets,
        })
    } catch (e: any) {
        gs.warn(`KYD: effort estimate failed: ${e?.message || e}`)
    }

    progress('graph', 'Building the relationship graph')
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
                { key: 'ultraShort', label: 'Ultra-short (≤15 characters: "go", "yes")', count: pq.ultraShort },
                { key: 'veryLong', label: 'Very detailed (>1500 characters)', count: pq.veryLong },
                { key: 'withImages', label: 'With images / screenshots', count: pq.withImages },
                { key: 'withUrl', label: 'With links to instance records', count: pq.withUrl },
                { key: 'withTicket', label: 'With ticket references (RITM/REQ/STRY)', count: pq.withTicket },
                { key: 'withTech', label: 'With technical table / field names', count: pq.withTech },
                { key: 'duplicates', label: 'Duplicates (same text sent again)', count: pq.duplicates },
                { key: 'friction', label: 'With friction / frustration signals', count: pq.friction },
            ],
        },
        metadata,
        updateSets,
        governance,
        prompts: conv.ids
            .filter((id) => ctx.prompts[id]?.length)
            .map((id) => ({ conversation: id, items: ctx.prompts[id] })),
        graph: buildGraph(developer.name, pq.total, roots, updateSets, metadata),
        acceleration,
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
