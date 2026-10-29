import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import type { InsightSkill, KydAnalysisResult, KydInsights } from '../../client/types'
import { runSkill, SKILLS } from './skills.ts'

const LANGUAGES: Record<string, string> = {
    en: 'English',
    it: 'Italian',
    de: 'German',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    nl: 'Dutch',
    pl: 'Polish',
    cs: 'Czech',
    hu: 'Hungarian',
    sv: 'Swedish',
    da: 'Danish',
    fi: 'Finnish',
    nb: 'Norwegian',
    ja: 'Japanese',
    ko: 'Korean',
    zh: 'Chinese',
    ru: 'Russian',
    tr: 'Turkish',
}

// Lingua preferita di chi ha richiesto l'analisi; inglese se non impostata.
export function requesterLanguage(userSysId: string): { code: string; name: string } {
    const u = new GlideRecord('sys_user')
    const code = (u.get(userSysId) && u.getValue('preferred_language')) || 'en'
    return { code, name: LANGUAGES[code.substring(0, 2)] || 'English' }
}

const share = (count: number, base: number) => (base ? Math.round((count / base) * 1000) / 10 : 0)

function behaviourData(r: KydAnalysisResult) {
    const titles: Record<string, string> = {}
    r.conversations.items.forEach((c) => (titles[c.sysId] = c.title))
    return {
        behaviour: r.behaviour,
        promptQuality: r.promptQuality,
        prompts: r.prompts.map((p) => ({
            conversation: titles[p.conversation] || p.conversation,
            items: p.items.map((i) => ({ at: i.createdOn, tags: i.tags, text: i.text, length: i.length })),
        })),
    }
}

function deliveryData(r: KydAnalysisResult) {
    return {
        conversations: r.conversations.items.map((c) => ({
            id: c.sysId.substring(0, 6),
            title: c.title,
            from: c.createdOn,
            to: c.lastMessageOn,
            client: c.client,
            scope: c.scopeId,
            app: c.appName,
            prompts: c.senders.user,
            toolCalls: c.senders['assistant-tool'],
        })),
        tools: r.tools,
        buildInstall: r.buildInstall,
        scriptIntents: r.scriptIntents.items.map((i) => ({ conversation: i.conversation.substring(0, 6), ok: i.ok, intent: i.intent })),
        subAgents: r.subAgents,
        files: r.files,
        metadata: {
            functionalClasses: r.metadata.functionalClasses,
            artifacts: r.metadata.artifacts,
            tables: r.metadata.tables,
            dictionaryByTable: r.metadata.dictionaryByTable,
        },
        updateSets: r.updateSets,
    }
}

function riskData(r: KydAnalysisResult, insights: KydInsights) {
    const pq = r.promptQuality
    return {
        governance: r.governance,
        facts: {
            conversations: r.conversations.rootCount,
            prompts: r.behaviour.prompts,
            activeDays: r.behaviour.activeDays,
            toolSuccessRatePct: share(r.tools.ok, r.tools.calls),
            criticalTools: r.tools.items.filter((t) => t.critical).map((t) => `${t.tool} ${t.ok}/${t.calls}`),
            functionalArtifacts: r.metadata.artifacts.length,
            updateSetsInProgress: r.updateSets.filter((u) => u.state === 'in progress').map((u) => ({ name: u.name, updates: u.updates })),
            scratchTables: r.metadata.tables.filter((t) => t.scratch).map((t) => t.name),
            platformTableDictionaryChanges: r.metadata.dictionaryByTable.filter((d) => !/^(u_|x_)/.test(d.table)),
            promptQualitySharesPct: Object.fromEntries(pq.metrics.map((m) => [m.key, share(m.count, pq.base)])),
        },
        behaviourProfile: insights.behaviour || null,
        deliveryOutcomes: insights.delivery || null,
    }
}

// Interpretazione testuale dei dati con le Skill Now Assist. Un errore di una skill
// non invalida l'analisi: viene registrato in insights.errors.
export function buildInsights(r: KydAnalysisResult, language: { code: string; name: string }): KydInsights {
    const insights: KydInsights = { generatedOn: new GlideDateTime().getValue(), language: language.code, errors: [] }
    const attempt = (skill: InsightSkill, data: unknown) => {
        try {
            return runSkill(SKILLS[skill], data, language.name)
        } catch (e: any) {
            gs.warn(`KYD: skill ${SKILLS[skill].name} failed: ${e?.message || e}`)
            insights.errors.push({ skill, message: String(e?.message || e).substring(0, 500) })
            return undefined
        }
    }
    if (!r.conversations.rootCount) return insights
    insights.behaviour = attempt('behaviour', behaviourData(r))
    insights.delivery = attempt('delivery', deliveryData(r))
    insights.risk = attempt('risk', riskData(r, insights))
    return insights
}
