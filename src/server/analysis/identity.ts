import { GlideRecord } from '@servicenow/glide'
import type { DeveloperRef, Identity } from '../../client/types'

// 1. Identità del developer
export function buildIdentity(u: any): { developer: DeveloperRef; identity: Identity } {
    const userId = u.getUniqueValue()

    const groups: string[] = []
    const gm = new GlideRecord('sys_user_grmember')
    gm.addQuery('user', userId)
    gm.query()
    while (gm.next()) groups.push(gm.getDisplayValue('group'))

    const effectiveRoles: Identity['effectiveRoles'] = []
    const hr = new GlideRecord('sys_user_has_role')
    hr.addQuery('user', userId)
    hr.query()
    while (hr.next()) {
        const inherited = hr.getValue('inherited')
        effectiveRoles.push({ name: hr.getDisplayValue('role'), inherited: inherited === '1' || inherited === 'true' })
    }

    const direct = u.getValue('roles') || ''
    return {
        developer: {
            sysId: userId,
            name: u.getValue('name') || '',
            userName: u.getValue('user_name') || '',
            email: u.getValue('email') || undefined,
        },
        identity: {
            active: u.getValue('active') === '1' || u.getValue('active') === 'true',
            lockedOut: u.getValue('locked_out') === '1' || u.getValue('locked_out') === 'true',
            createdOn: u.getValue('sys_created_on') || '',
            createdBy: u.getValue('sys_created_by') || '',
            lastLogin: u.getValue('last_login_time') || '',
            directRoles: direct
                .split(',')
                .map((r: string) => r.trim())
                .filter(Boolean),
            company: u.getDisplayValue('company') || '',
            location: u.getDisplayValue('location') || '',
            groups,
            effectiveRoles,
        },
    }
}
