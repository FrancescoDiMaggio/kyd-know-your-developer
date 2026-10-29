import { GlideAggregate, GlideRecord } from '@servicenow/glide'
import type { AccelerationSection } from '../../client/types'
import { ROLLBACK_SIDE_EFFECT_TABLES } from '../analysis/config.ts'
import { periodQuery } from '../analysis/util.ts'

const chunks = <T>(list: T[], size = 100): T[][] => {
    const out: T[][] = []
    for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size))
    return out
}

export interface CheckpointData {
    stats: AccelerationSection['checkpoints']
    // sys_id -> conversazione del checkpoint che ha toccato il record (la voce "table" del
    // working set non è sempre la classe dell'artefatto, il sys_id invece è univoco)
    records: Record<string, string>
    installUpdateSets: string[]
}

// Checkpoint per turno: install e modifiche manuali con il loro working set.
export function loadCheckpoints(conversationIds: string[]): CheckpointData {
    const stats = { total: 0, install: 0, manualEdit: 0, reverted: 0, records: 0 }
    const records: Record<string, string> = {}
    const sets = new Set<string>()
    if (!conversationIds.length) return { stats, records, installUpdateSets: [] }
    const cp = new GlideRecord('sn_build_agent_checkpoint')
    cp.addQuery('conversation', 'IN', conversationIds.join(','))
    cp.query()
    while (cp.next()) {
        stats.total++
        const type = cp.getValue('type')
        if (type === 'install') stats.install++
        if (type === 'manual_edit') stats.manualEdit++
        if (cp.getValue('status') === 'reverted') {
            stats.reverted++
            continue
        }
        if (type === 'install' && cp.getValue('update_set')) sets.add(cp.getValue('update_set'))
        let ws: any[] = []
        try {
            ws = JSON.parse(cp.getValue('working_set') || '[]') || []
        } catch {
            ws = []
        }
        for (const entry of Array.isArray(ws) ? ws : []) {
            const id = entry?.sysId || entry?.sys_id
            if (id) records[id] = cp.getValue('conversation')
        }
    }
    stats.records = Object.keys(records).length
    return { stats, records, installUpdateSets: [...sets] }
}

export interface ScriptData {
    total: number
    contexts: string[]
}

// Script in background approvati dal developer; quelli con rollback context hanno scritto dati.
export function loadScriptRequests(userSysId: string, from: string, to: string): ScriptData {
    const contexts: string[] = []
    let total = 0
    const sr = new GlideRecord('sn_build_agent_script_request')
    sr.addQuery('approved_by', userSysId)
    sr.addEncodedQuery(periodQuery(from, to))
    sr.query()
    while (sr.next()) {
        total++
        if (sr.getValue('rollback_context')) contexts.push(sr.getValue('rollback_context'))
    }
    return { total, contexts }
}

// Record toccati dagli script, per tabella e operazione (null se il rollback non è leggibile).
export function rollbackStats(contexts: string[]): Omit<AccelerationSection['scripts'], 'total' | 'writing' | 'readOnly'> {
    const empty = { rollbackRows: null, metadataRows: null, dataRows: null, byOperation: {}, tables: [] }
    if (!contexts.length) return { ...empty, rollbackRows: 0, metadataRows: 0, dataRows: 0 }
    try {
        let rows = 0
        let metadataRows = 0
        const byOperation: Record<string, number> = {}
        const tables: Record<string, { count: number; metadata: boolean }> = {}
        for (const chunk of chunks(contexts)) {
            const ga: any = new GlideAggregate('sys_rollback_sequence')
            ga.addQuery('context', 'IN', chunk.join(','))
            ga.groupBy('target_class_name')
            ga.groupBy('operation')
            ga.groupBy('is_metadata')
            ga.addAggregate('COUNT')
            ga.query()
            while (ga.next()) {
                const n = parseInt(ga.getAggregate('COUNT'), 10)
                const table = ga.getValue('target_class_name') || '?'
                const isMeta = ga.getValue('is_metadata') === '1' || ga.getValue('is_metadata') === 'true'
                rows += n
                if (isMeta) metadataRows += n
                byOperation[ga.getValue('operation') || '?'] = (byOperation[ga.getValue('operation') || '?'] || 0) + n
                if (ROLLBACK_SIDE_EFFECT_TABLES.includes(table)) continue
                const t = (tables[table] ||= { count: 0, metadata: isMeta })
                t.count += n
                t.metadata = t.metadata || isMeta
            }
        }
        return {
            rollbackRows: rows,
            metadataRows,
            dataRows: rows - metadataRows,
            byOperation,
            tables: Object.entries(tables)
                .map(([table, v]) => ({ table, count: v.count, metadata: v.metadata }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 20),
        }
    } catch {
        return empty
    }
}

// sys_id degli artefatti inseriti dagli script di Build Agent.
export function insertedByScripts(contexts: string[], sysIds: string[]): Set<string> {
    const out = new Set<string>()
    if (!contexts.length || !sysIds.length) return out
    try {
        for (const ctx of chunks(contexts)) {
            for (const ids of chunks(sysIds)) {
                const rs = new GlideRecord('sys_rollback_sequence')
                rs.addQuery('context', 'IN', ctx.join(','))
                rs.addQuery('operation', 'insert')
                rs.addQuery('document_id', 'IN', ids.join(','))
                rs.query()
                while (rs.next()) out.add(rs.getValue('document_id'))
            }
        }
    } catch {
        // rollback non leggibile dallo scope: l'attribuzione ripiega sulle altre fonti
    }
    return out
}

// Nomi di update (sys_update_name) presenti negli update set degli install di Build Agent.
export function installedNames(updateSets: string[], names: string[]): Set<string> {
    const out = new Set<string>()
    if (!updateSets.length || !names.length) return out
    for (const chunk of chunks(names)) {
        const ux = new GlideRecord('sys_update_xml')
        ux.addQuery('update_set', 'IN', updateSets.join(','))
        ux.addQuery('name', 'IN', chunk.join(','))
        ux.query()
        while (ux.next()) out.add(ux.getValue('name'))
    }
    return out
}

// Task di Build Agent (uno per richiesta): esito e tempo dell'agente.
export function loadTelemetry(userSysId: string, from: string, to: string): AccelerationSection['telemetry'] {
    try {
        const out = { tasks: 0, complete: 0, error: 0, aborted: 0, inProgress: 0, success: 0, minutes: 0 }
        const tt = new GlideRecord('sn_build_agent_task_telemetry')
        tt.addQuery('user', userSysId)
        tt.addEncodedQuery(periodQuery(from, to))
        tt.query()
        while (tt.next()) {
            out.tasks++
            const status = tt.getValue('status')
            if (status === 'complete') out.complete++
            else if (status === 'error') out.error++
            else if (status === 'aborted') out.aborted++
            else if (status === 'in-progress') out.inProgress++
            if (tt.getValue('agent_status') === 'success') out.success++
            // glide_duration: "1970-01-01 HH:mm:ss" = millisecondi dall'epoch
            const d = tt.getValue('total_time')
            if (d) out.minutes += new Date(d.replace(' ', 'T') + 'Z').getTime() / 60000
        }
        out.minutes = Math.round(out.minutes)
        return out
    } catch {
        return null
    }
}
