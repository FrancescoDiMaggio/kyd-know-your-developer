import { t } from 'sn-translate'
import { fill } from './i18n'
import type { KydAnalysisResult, PromptQualityKey, Severity } from '../types'
import { fmtNumber, fmtPct } from './format'

export interface Finding {
    severity: Severity
    title: string
    evidence: string
}

const ORDER: Record<Severity, number> = { high: 0, medium: 1, low: 2, monitor: 3 }

function share(r: KydAnalysisResult, key: PromptQualityKey): number {
    const m = r.promptQuality.metrics.find((x) => x.key === key)
    return m && r.promptQuality.base ? m.count / r.promptQuality.base : 0
}

// Osservazioni puntuali ricavate dai dati, senza LLM: soglie esplicite e verificabili.
export function buildFindings(r: KydAnalysisResult): Finding[] {
    const out: Finding[] = []
    const g = r.governance
    const base = r.promptQuality.base

    r.updateSets
        .filter((u) => u.anomalous)
        .forEach((u) =>
            out.push({
                severity: 'high',
                title: fill(t('Update set "%1" still in progress with %2 updates'), u.name, fmtNumber(u.updates)),
                evidence: t('Not promotable as it is: separate the solution from demo data and test tables first.'),
            }),
        )

    const scratch = r.metadata.tables.filter((tb) => tb.scratch)
    if (scratch.length)
        out.push({
            severity: 'medium',
            title: fill(t('%1 np$* scratch tables left on the instance'), scratch.length),
            evidence: scratch.map((tb) => tb.name).join(', '),
        })

    const platform = r.metadata.dictionaryByTable.filter((d) => !/^(u_|x_)/.test(d.table))
    if (platform.length)
        out.push({
            severity: 'medium',
            title: t('Dictionary changes on platform tables'),
            evidence: platform.map((d) => `${d.table} (${d.count})`).join(', '),
        })

    if (g.atfTests === 0 && r.metadata.artifacts.length)
        out.push({
            severity: 'medium',
            title: fill(t('No ATF tests for %1 functional artifacts'), r.metadata.artifacts.length),
            evidence: t('Validation relies on manual tests only.'),
        })

    if (g.install.total && g.install.failed / g.install.total >= 0.5) {
        const messages = [...new Set(r.buildInstall.installs.filter((i) => !i.ok).map((i) => i.message))].slice(0, 2)
        out.push({
            severity: 'medium',
            title: fill(t('%1 of %2 installs failed'), g.install.failed, g.install.total),
            evidence: messages.join(' · '),
        })
    }

    const critical = r.tools.items.filter((x) => x.critical)
    if (critical.length)
        out.push({
            severity: 'medium',
            title: fill(t('Critical tool areas: %1'), critical.map((x) => `${x.tool} ${fmtPct(x.ok, x.calls, 0)}`).join(', ')),
            evidence: t('Tools with at least as many failures as successes.'),
        })

    const open = r.updateSets.filter((u) => u.state === 'in progress' && !u.anomalous)
    if (open.length)
        out.push({
            severity: 'low',
            title: fill(t('%1 update sets still in progress'), open.length),
            evidence: open.map((u) => `${u.name} (${u.updates})`).join(', '),
        })

    if (base && share(r, 'duplicates') >= 0.05)
        out.push({
            severity: 'low',
            title: fill(t('%1 of the prompts were sent again with the same text'), fmtPct(share(r, 'duplicates'), 1)),
            evidence: t('Session instability or impatience: it creates duplicated work.'),
        })

    if ((g.backgroundScripts || 0) > 50)
        out.push({
            severity: 'monitor',
            title: fill(t('%1 background scripts approved as an operational channel'), `${g.backgroundScriptsEstimated ? '≈ ' : ''}${fmtNumber(g.backgroundScripts)}`),
            evidence: t('Tracked with rollback context, but outside the source and update set cycle.'),
        })

    if (g.globalConversations)
        out.push({
            severity: 'monitor',
            title: fill(t('%1 of %2 conversations in Global scope'), g.globalConversations, g.totalConversations),
            evidence: t('Development directly in Global scope on a shared instance.'),
        })

    if (base && share(r, 'ultraShort') >= 0.1)
        out.push({
            severity: 'monitor',
            title: fill(t('%1 of the prompts are ultra-short ("go", "yes")'), fmtPct(share(r, 'ultraShort'), 1)),
            evidence: t('Implicit delegation of design decisions to the agent: risk of rework.'),
        })

    if (base && share(r, 'friction') >= 0.05)
        out.push({
            severity: 'monitor',
            title: fill(t('%1 of the prompts contain friction signals'), fmtPct(share(r, 'friction'), 1)),
            evidence: t('Long sessions or lost context: consider an upfront design review and splitting the conversations.'),
        })

    return out.sort((a, b) => ORDER[a.severity] - ORDER[b.severity])
}

// Segnali positivi, con le stesse regole esplicite.
export function buildStrengths(r: KydAnalysisResult): string[] {
    const out: string[] = []
    if (r.tools.calls && r.tools.ok / r.tools.calls >= 0.9)
        out.push(fill(t('Tool success rate of %1 over %2 calls'), fmtPct(r.tools.ok, r.tools.calls), fmtNumber(r.tools.calls)))
    const evidence = share(r, 'withImages') + share(r, 'withUrl') + share(r, 'withTicket')
    if (r.promptQuality.base && evidence >= 0.15)
        out.push(fill(t('The prompts bring evidence: screenshots, record links and ticket references in %1 of the cases'), fmtPct(evidence, 1)))
    if (r.promptQuality.base && share(r, 'withTech') >= 0.05)
        out.push(fill(t('%1 of the prompts use technical table and field names'), fmtPct(share(r, 'withTech'), 1)))
    if ((r.governance.atfTests || 0) > 0) out.push(fill(t('%1 ATF tests created in the period'), r.governance.atfTests))
    if (r.subAgents.length) out.push(fill(t('%1 analyses delegated to sub-agents'), r.subAgents.length))
    return out
}
