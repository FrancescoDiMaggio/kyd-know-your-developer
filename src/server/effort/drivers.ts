import { GlideRecord } from '@servicenow/glide'
import type { WeightDriver } from '../../client/types'
import { SCRIPT_FIELDS } from '../analysis/config.ts'
import { countRows } from '../analysis/util.ts'

function nonEmptyLines(text: string | null): number {
    return String(text || '')
        .split('\n')
        .filter((l) => l.trim() !== '').length
}

function scriptLines(cls: string, sysId: string): number {
    const gr: any = new GlideRecord(cls)
    if (!gr.get(sysId)) return 0
    return (SCRIPT_FIELDS[cls] || ['script']).reduce((sum, f) => sum + (gr.isValidField(f) ? nonEmptyLines(gr.getValue(f)) : 0), 0)
}

function tableFields(sysId: string): number {
    const gr = new GlideRecord('sys_db_object')
    if (!gr.get(sysId)) return 0
    return countRows('sys_dictionary', `name=${gr.getValue('name')}^elementISNOTEMPTY`) || 0
}

function catalogVariables(cls: string, sysId: string): number {
    if (cls === 'item_option_new_set') return countRows('item_option_new', `variable_set=${sysId}`) || 0
    const sets: string[] = []
    const io = new GlideRecord('io_set_item')
    io.addQuery('sc_cat_item', sysId)
    io.query()
    while (io.next()) sets.push(io.getValue('variable_set'))
    const own = countRows('item_option_new', `cat_item=${sysId}`) || 0
    const shared = sets.length ? countRows('item_option_new', `variable_setIN${sets.join(',')}`) || 0 : 0
    return own + shared
}

// Unità del driver di dimensione per un artefatto (righe, campi, step, variabili).
export function measureUnits(driver: WeightDriver, cls: string, sysId: string): number {
    try {
        switch (driver) {
            case 'script_lines':
                return scriptLines(cls, sysId)
            case 'fields':
                return tableFields(sysId)
            case 'flow_steps':
                return (
                    (countRows('sys_hub_action_instance_v2', `flow=${sysId}`) || 0) +
                    (countRows('sys_hub_flow_logic_instance_v2', `flow=${sysId}`) || 0) +
                    (countRows('sys_hub_sub_flow_instance_v2', `flow=${sysId}`) || 0)
                )
            case 'action_steps':
                return countRows('sys_hub_step_instance', `action=${sysId}`) || 0
            case 'variables':
                return catalogVariables(cls, sysId)
            default:
                return 0
        }
    } catch {
        return 0
    }
}
