import { GlideRecord, gs } from '@servicenow/glide'
import { DEFAULT_EFFORT_WEIGHTS, EFFORT_WEIGHT_TABLE } from '../analysis/config.ts'

// UI Action "Load KYD default weights": aggiunge solo le classi mancanti, le righe
// esistenti (anche modificate dall'admin) non vengono toccate.
export function loadDefaultEffortWeights(current: any, action: any) {
    const existing = new Set<string>()
    const gr = new GlideRecord(EFFORT_WEIGHT_TABLE)
    gr.query()
    while (gr.next()) existing.add(gr.getValue('artifact_class'))

    let added = 0
    for (const w of DEFAULT_EFFORT_WEIGHTS) {
        if (existing.has(w.cls)) continue
        const row = new GlideRecord(EFFORT_WEIGHT_TABLE)
        row.initialize()
        row.setValue('artifact_class', w.cls)
        row.setValue('label', w.label)
        row.setValue('category', w.category)
        row.setValue('base_hours', w.baseHours)
        row.setValue('driver', w.driver)
        row.setValue('hours_per_unit', w.hoursPerUnit)
        row.setValue('active', true)
        if (row.insert()) added++
    }
    gs.addInfoMessage(
        added
            ? gs.getMessage('{0} KYD default weights added', [String(added)])
            : gs.getMessage('All the KYD default weights are already present'),
    )
    action?.setRedirectURL?.(`${EFFORT_WEIGHT_TABLE}_list.do`)
}
