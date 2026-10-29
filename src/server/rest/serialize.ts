import { GlideRecord } from '@servicenow/glide'
import type { AnalysisState, AnalysisSummary, DeveloperRef } from '../../client/types'

// Risolve i riferimenti a sys_user con una sola query per gruppo di id.
export function loadUsers(ids: string[]): Record<string, DeveloperRef> {
    const out: Record<string, DeveloperRef> = {}
    const unique = [...new Set(ids.filter(Boolean))]
    if (!unique.length) return out
    const u = new GlideRecord('sys_user')
    u.addQuery('sys_id', 'IN', unique.join(','))
    u.query()
    while (u.next()) {
        out[u.getUniqueValue()] = {
            sysId: u.getUniqueValue(),
            name: u.getValue('name') || u.getValue('user_name') || '',
            userName: u.getValue('user_name') || '',
            email: u.getValue('email') || undefined,
        }
    }
    return out
}

export function toSummary(gr: any, users: Record<string, DeveloperRef>): AnalysisSummary {
    const devId = gr.getValue('developer')
    const state = gr.getValue('state') as AnalysisState
    const num = (f: string) => {
        const v = gr.getValue(f)
        return v === null || v === '' ? 0 : Number(v)
    }
    return {
        sysId: gr.getUniqueValue(),
        number: gr.getValue('number') || '',
        developer: users[devId] || { sysId: devId, name: gr.getDisplayValue('developer'), userName: '' },
        state,
        statusMessage: gr.getValue('status_message') || undefined,
        requestedOn: gr.getValue('sys_created_on') || '',
        completedOn: gr.getValue('completed_on') || undefined,
        periodFrom: gr.getValue('period_from') || '',
        periodTo: gr.getValue('period_to') || '',
        kpis:
            state === 'complete'
                ? {
                      conversations: num('conversations'),
                      prompts: num('prompts'),
                      functionalArtifacts: num('functional_artifacts'),
                      toolSuccessRate: num('tool_success_rate'),
                  }
                : undefined,
    }
}
