import { OneExtendUtil } from '@servicenow/glide/sn_one_extend'
import type { InsightSkill } from '../../client/types'

export interface SkillRef {
    skill: InsightSkill
    name: string
    // sys_id della capability (sn_nowassist_skill_config.skill_id) e della skill config
    capabilityId: string
    skillConfigId: string
}

// ID generati dalla build delle skill in src/fluent/now-assist-skills (vedi src/fluent/generated/keys.ts).
export const SKILLS: Record<InsightSkill, SkillRef> = {
    behaviour: {
        skill: 'behaviour',
        name: 'KYD Behaviour Profile',
        capabilityId: '1b3cddb8b5a24a2fba8c3e5210cc80a2',
        skillConfigId: 'c2719828783348eea40a9c5e1b916cc6',
    },
    delivery: {
        skill: 'delivery',
        name: 'KYD Delivery Outcomes',
        capabilityId: '3fbbff97a91d42198cacedf9b55bdc1f',
        skillConfigId: 'fa97355eec2a484dad2ee85bd3ada3e4',
    },
    risk: {
        skill: 'risk',
        name: 'KYD Risk and Maturity',
        capabilityId: '7129574e77fb4c7d845c8948d6afdb2f',
        skillConfigId: '3c5fe97bd5e74e2d836e87b4ffacab36',
    },
}

// Il modello deve restituire solo JSON; tollera comunque i blocchi ```json.
function parseJson(text: string): any {
    const cleaned = text.replace(/^\s*```(?:json)?/i, '').replace(/```\s*$/, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start < 0 || end < start) throw new Error(`The skill did not return JSON: ${cleaned.substring(0, 200)}`)
    return JSON.parse(cleaned.substring(start, end + 1))
}

// La risposta può essere l'involucro { model_output, ... } oppure, come su questa istanza,
// direttamente il JSON prodotto dal modello (come stringa o già come oggetto).
function modelOutput(raw: unknown): any {
    const value: any = typeof raw === 'string' ? parseJson(raw) : raw
    if (value && typeof value === 'object' && 'model_output' in value) {
        return typeof value.model_output === 'string' ? parseJson(value.model_output) : value.model_output
    }
    if (value && typeof value === 'object') return value
    throw new Error(`Unexpected skill response: ${JSON.stringify(value).substring(0, 300)}`)
}

// Esegue una skill in modo sincrono. Il motore gira in background come utente di sistema:
// l'accesso è già verificato dalla REST API con lo stesso ruolo della userAccess della skill.
export function runSkill(ref: SkillRef, analysisData: unknown, language: string): any {
    const request = {
        executionRequests: [
            {
                // Chiavi = nomi tecnici degli input (spazi -> underscore). Con chiavi diverse la
                // piattaforma usa in silenzio i testValues della skill al posto dei dati reali.
                payload: { analysis_data: JSON.stringify(analysisData), output_language: language },
                capabilityId: ref.capabilityId,
                meta: { skillConfigId: ref.skillConfigId },
            },
        ],
        mode: 'sync',
    }
    const response: any = OneExtendUtil.execute(request) || {}
    const capability = (response.capabilities || {})[ref.capabilityId] || {}
    if (capability.response === undefined) {
        throw new Error(`${ref.name}: ${JSON.stringify(capability.error || capability.status || response).substring(0, 300)}`)
    }
    return modelOutput(capability.response)
}
