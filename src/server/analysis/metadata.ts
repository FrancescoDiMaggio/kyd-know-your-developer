import { GlideAggregate, GlideRecord } from '@servicenow/glide'
import type { CreatedTable, MetadataSection, UpdateSet } from '../../client/types'
import { ANOMALOUS_UPDATE_SET_SIZE, KEY_CLASSES, MAX_ARTIFACTS, NOISE_CLASSES } from './config.ts'
import { countBy, countRows, periodQuery, sortedPairs } from './util.ts'

// 10. Componenti / metadata creati dal developer nel periodo
export function buildMetadata(userName: string, from: string, to: string): MetadataSection {
    const baseQ = `sys_created_by=${userName}^${periodQuery(from, to)}`

    const byClass = countBy('sys_metadata', baseQ, 'sys_class_name')
    const functional: Record<string, number> = {}
    const noise: Record<string, number> = {}
    for (const [cls, n] of Object.entries(byClass)) (NOISE_CLASSES.includes(cls) ? noise : functional)[cls] = n
    const sum = (o: Record<string, number>) => Object.values(o).reduce((a, b) => a + b, 0)

    const artifacts: MetadataSection['artifacts'] = []
    const ka = new GlideRecord('sys_metadata')
    ka.addEncodedQuery(`${baseQ}^sys_class_nameIN${KEY_CLASSES.join(',')}`)
    ka.orderBy('sys_created_on')
    ka.setLimit(MAX_ARTIFACTS)
    ka.query()
    while (ka.next()) {
        artifacts.push({
            createdOn: (ka.getValue('sys_created_on') || '').substring(0, 16),
            cls: ka.getValue('sys_class_name'),
            name: ka.getValue('sys_name') || '',
        })
    }

    const tables: CreatedTable[] = []
    const tb = new GlideRecord('sys_db_object')
    tb.addEncodedQuery(baseQ)
    tb.orderBy('name')
    tb.query()
    while (tb.next()) {
        const name = tb.getValue('name')
        tables.push({
            name,
            label: tb.getValue('label') || '-',
            extends: tb.getDisplayValue('super_class') || '-',
            fields: countRows('sys_dictionary', `name=${name}^elementISNOTEMPTY`) ?? 0,
            records: countRows(name),
            scratch: name.startsWith('np$'),
        })
    }

    const dict = countBy('sys_dictionary', baseQ, 'name')
    const dictionaryByTable = sortedPairs(dict)
        .filter(([table]) => table && !table.startsWith('var__m_'))
        .map(([table, count]) => ({ table, count }))

    return {
        total: sum(byClass),
        functional: sum(functional),
        noise: sum(noise),
        functionalClasses: sortedPairs(functional).map(([cls, count]) => ({ cls, count })),
        noiseClasses: sortedPairs(noise).map(([cls, count]) => ({ cls, count })),
        artifacts,
        tables,
        dictionaryByTable,
    }
}

// 11. Update set creati o aggiornati dal developer nel periodo
export function buildUpdateSets(userName: string, from: string, to: string): UpdateSet[] {
    const out: UpdateSet[] = []
    const ids: string[] = []
    const us = new GlideRecord('sys_update_set')
    us.addEncodedQuery(`sys_created_by=${userName}^ORsys_updated_by=${userName}`)
    us.addQuery('sys_created_on', '>=', from)
    us.addQuery('sys_created_on', '<', to)
    us.orderBy('sys_created_on')
    us.query()
    while (us.next()) {
        ids.push(us.getUniqueValue())
        out.push({
            createdOn: (us.getValue('sys_created_on') || '').substring(0, 16),
            state: us.getValue('state') || '',
            updates: 0,
            name: us.getValue('name') || '',
            anomalous: false,
        })
    }
    if (!ids.length) return out

    const updates: Record<string, number> = {}
    const ga: any = new GlideAggregate('sys_update_xml')
    ga.addQuery('update_set', 'IN', ids.join(','))
    ga.groupBy('update_set')
    ga.addAggregate('COUNT')
    ga.query()
    while (ga.next()) updates[ga.getValue('update_set')] = parseInt(ga.getAggregate('COUNT'), 10)

    return out.map((u, i) => {
        const n = updates[ids[i]] || 0
        return { ...u, updates: n, anomalous: u.state === 'in progress' && n > ANOMALOUS_UPDATE_SET_SIZE }
    })
}
