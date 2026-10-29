import { GlideRecord } from '@servicenow/glide'
import type { AccelerationSection, AttributionLevel, Conversation, EstimatedArtifact, UpdateSet, WorkPackage } from '../../client/types'
import { KEY_CLASSES, MAX_ARTIFACTS } from '../analysis/config.ts'
import { periodQuery } from '../analysis/util.ts'
import { conversationOwner, glideTime } from '../analysis/windows.ts'
import { effortParams, effortWeights } from './weights.ts'
import { measureUnits } from './drivers.ts'
import { installedNames, insertedByScripts, loadCheckpoints, loadScriptRequests, loadTelemetry, rollbackStats } from './attribution.ts'
import { linkStories, storyNumbers } from './stories.ts'

export interface EffortInput {
    userSysId: string
    userName: string
    from: string
    to: string
    conversations: Conversation[]
    promptTimes: Record<string, string[]>
    prompts: { conversation: string; items: { text: string }[] }[]
    scriptIntents: { conversation: string; intent: string }[]
    updateSets: UpdateSet[]
}

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits

// Minuti di lavoro in sessione: le pause tra prompt fino a gap contano, oltre si apre
// una nuova sessione a cui si aggiungono lead minuti di preparazione.
function sessionMinutes(times: string[], gap: number, lead: number): number {
    const ts = times
        .map(glideTime)
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b)
    if (!ts.length) return 0
    let total = lead
    for (let i = 1; i < ts.length; i++) {
        const minutes = (ts[i] - ts[i - 1]) / 60000
        total += minutes <= gap ? minutes : lead
    }
    return total
}

interface RawArtifact {
    sysId: string
    cls: string
    name: string
    updateName: string
    createdOn: string
}

function loadArtifacts(userName: string, from: string, to: string): RawArtifact[] {
    const out: RawArtifact[] = []
    const md = new GlideRecord('sys_metadata')
    md.addEncodedQuery(`sys_created_by=${userName}^${periodQuery(from, to)}^sys_class_nameIN${KEY_CLASSES.join(',')}`)
    md.orderBy('sys_created_on')
    md.setLimit(MAX_ARTIFACTS)
    md.query()
    while (md.next()) {
        out.push({
            sysId: md.getUniqueValue(),
            cls: md.getValue('sys_class_name'),
            name: md.getValue('sys_name') || '',
            updateName: md.getValue('sys_update_name') || '',
            createdOn: (md.getValue('sys_created_on') || '').substring(0, 16),
        })
    }
    return out
}

// Effort manuale stimato degli artefatti, quanto è attribuibile a Build Agent e tempo reale di lavoro.
export function buildAcceleration(input: EffortInput): AccelerationSection {
    const params = effortParams()
    const weights = effortWeights()
    const owner = conversationOwner(input.conversations)
    const parentOf: Record<string, string> = {}
    input.conversations.forEach((c) => (parentOf[c.sysId] = c.isSubAgent && c.parent ? c.parent : c.sysId))
    const roots = input.conversations.filter((c) => !c.isSubAgent)

    const raw = loadArtifacts(input.userName, input.from, input.to)
    const checkpoints = loadCheckpoints(input.conversations.map((c) => c.sysId))
    const scripts = loadScriptRequests(input.userSysId, input.from, input.to)
    const inserted = insertedByScripts(
        scripts.contexts,
        raw.map((a) => a.sysId),
    )
    const installed = installedNames(
        checkpoints.installUpdateSets,
        raw.map((a) => a.updateName).filter(Boolean),
    )

    const coverage: Record<AttributionLevel, number> = { checkpoint: 0, script: 0, install: 0, window: 0, manual: 0 }
    const artifacts: EstimatedArtifact[] = []
    for (const a of raw) {
        const weight = weights.forClass(a.cls)
        if (!weight) continue
        const cpConversation = checkpoints.records[a.sysId]
        const windowConversation = owner(a.createdOn)
        const attribution: AttributionLevel = cpConversation
            ? 'checkpoint'
            : inserted.has(a.sysId)
              ? 'script'
              : installed.has(a.updateName)
                ? 'install'
                : windowConversation
                  ? 'window'
                  : 'manual'
        let units = weight.driver === 'none' ? 0 : measureUnits(weight.driver, a.cls, a.sysId)
        if (weight.maxUnits) units = Math.min(units, weight.maxUnits)
        const conversation = cpConversation || windowConversation
        coverage[attribution]++
        artifacts.push({
            sysId: a.sysId,
            cls: a.cls,
            name: a.name,
            createdOn: a.createdOn,
            conversation: conversation ? parentOf[conversation] || conversation : undefined,
            attribution,
            units,
            hours: round(weight.baseHours + units * weight.hoursPerUnit, 2),
        })
    }

    // Story del cliente citate in ogni conversazione (titolo, obiettivo, prompt, intent, update set).
    const texts: Record<string, string[]> = {}
    const add = (conv: string | null | undefined, text: string) => {
        if (conv) (texts[parentOf[conv] || conv] ||= []).push(text)
    }
    input.conversations.forEach((c) => add(c.sysId, `${c.title} ${c.goal || ''}`))
    input.prompts.forEach((p) => p.items.forEach((i) => add(p.conversation, i.text)))
    input.scriptIntents.forEach((i) => add(i.conversation, i.intent))
    input.updateSets.forEach((u) => add(owner(u.createdOn), u.name))
    const numbersByConversation: Record<string, string[]> = {}
    Object.entries(texts).forEach(([conv, list]) => (numbersByConversation[conv] = storyNumbers(list.join(' '))))
    const stories = linkStories(numbersByConversation)

    const packages: WorkPackage[] = roots.map((c) => {
        const own = artifacts.filter((a) => a.conversation === c.sysId)
        const estimatedHours = round(own.reduce((sum, a) => sum + a.hours, 0))
        const sessionHours = round(sessionMinutes(input.promptTimes[c.sysId] || [], params.sessionGapMinutes, params.sessionLeadMinutes) / 60)
        return {
            conversation: c.sysId,
            title: c.title,
            artifacts: own.length,
            attributed: own.filter((a) => a.attribution === 'checkpoint' || a.attribution === 'script' || a.attribution === 'install').length,
            estimatedHours,
            sessionHours,
            acceleration: estimatedHours > 0 && sessionHours > 0 ? round(estimatedHours / sessionHours) : null,
            stories: stories.filter((s) => s.conversations.includes(c.sysId)).map((s) => s.number),
        }
    })

    // Il tempo totale usa una sola linea temporale: conversazioni parallele non si sommano.
    const allTimes = Object.values(input.promptTimes).flat()
    const sessionHours = round(sessionMinutes(allTimes, params.sessionGapMinutes, params.sessionLeadMinutes) / 60)
    const estimatedHours = round(artifacts.filter((a) => a.attribution !== 'manual').reduce((sum, a) => sum + a.hours, 0))
    const telemetry = loadTelemetry(input.userSysId, input.from, input.to)

    return {
        hoursPerDay: params.hoursPerDay,
        range: { low: params.rangeLow, high: params.rangeHigh },
        sessionGapMinutes: params.sessionGapMinutes,
        estimatedHours,
        sessionHours,
        agentMinutes: telemetry?.minutes || 0,
        acceleration: estimatedHours > 0 && sessionHours > 0 ? round(estimatedHours / sessionHours) : null,
        coverage,
        artifacts,
        packages,
        stories,
        scripts: {
            total: scripts.total,
            writing: scripts.contexts.length,
            readOnly: scripts.total - scripts.contexts.length,
            ...rollbackStats(scripts.contexts),
        },
        checkpoints: checkpoints.stats,
        telemetry,
        weights: [...weights.list].sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label)),
    }
}
