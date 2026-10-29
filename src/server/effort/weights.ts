import { GlideRecord, gs } from '@servicenow/glide'
import type { EffortWeight, WeightDriver } from '../../client/types'
import { DEFAULT_EFFORT_WEIGHTS, EFFORT_PROPERTIES, EFFORT_WEIGHT_TABLE, FALLBACK_WEIGHT } from '../analysis/config.ts'

export interface EffortParams {
    hoursPerDay: number
    rangeLow: number
    rangeHigh: number
    sessionGapMinutes: number
    sessionLeadMinutes: number
}

// Parametri generali: la property, se esiste, vince sul default del codice.
export function effortParams(): EffortParams {
    const read = (p: { name: string; value: number }) => {
        const v = parseFloat(gs.getProperty(p.name, String(p.value)))
        return isNaN(v) ? p.value : v
    }
    return {
        hoursPerDay: read(EFFORT_PROPERTIES.hoursPerDay),
        rangeLow: read(EFFORT_PROPERTIES.rangeLow),
        rangeHigh: read(EFFORT_PROPERTIES.rangeHigh),
        sessionGapMinutes: read(EFFORT_PROPERTIES.sessionGapMinutes),
        sessionLeadMinutes: read(EFFORT_PROPERTIES.sessionLeadMinutes),
    }
}

export interface WeightModel {
    list: EffortWeight[]
    // null = classe disattivata in tabella: esclusa dalla stima
    forClass: (cls: string) => EffortWeight | null
}

// Pesi effettivi: default del codice sovrascritti dalle righe della tabella KYD Effort Weight.
export function effortWeights(): WeightModel {
    const byClass: Record<string, EffortWeight | null> = {}
    DEFAULT_EFFORT_WEIGHTS.forEach((d) => (byClass[d.cls] = { ...d, source: 'default' }))

    const gr = new GlideRecord(EFFORT_WEIGHT_TABLE)
    gr.query()
    while (gr.next()) {
        const cls = gr.getValue('artifact_class')
        if (!cls) continue
        if (gr.getValue('active') === '0' || gr.getValue('active') === 'false') {
            byClass[cls] = null
            continue
        }
        const max = parseInt(gr.getValue('max_units') || '', 10)
        byClass[cls] = {
            cls,
            label: gr.getValue('label') || byClass[cls]?.label || cls,
            category: gr.getValue('category') || byClass[cls]?.category || 'other',
            baseHours: parseFloat(gr.getValue('base_hours') || '0') || 0,
            driver: (gr.getValue('driver') as WeightDriver) || 'none',
            hoursPerUnit: parseFloat(gr.getValue('hours_per_unit') || '0') || 0,
            maxUnits: isNaN(max) || max <= 0 ? undefined : max,
            source: 'custom',
        }
    }

    const fallback: EffortWeight = { ...FALLBACK_WEIGHT, source: 'default' }
    return {
        list: Object.values(byClass).filter((w): w is EffortWeight => !!w),
        forClass: (cls) => (cls in byClass ? byClass[cls] : { ...fallback, cls }),
    }
}
