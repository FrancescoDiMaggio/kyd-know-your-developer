import '@servicenow/sdk/global'
import { Acl } from '@servicenow/sdk/core'
import { kydAdmin, kydUser } from './roles.now'

Acl({
    $id: Now.ID['kyd-analysis-read'],
    type: 'record',
    table: 'x_giss2_kyd_analysis',
    operation: 'read',
    roles: [kydUser],
    description: 'Lettura delle KYD Analysis',
})

Acl({
    $id: Now.ID['kyd-analysis-create'],
    type: 'record',
    table: 'x_giss2_kyd_analysis',
    operation: 'create',
    roles: [kydUser],
    description: 'Richiesta di nuove KYD Analysis',
})

Acl({
    $id: Now.ID['kyd-analysis-write'],
    type: 'record',
    table: 'x_giss2_kyd_analysis',
    operation: 'write',
    roles: [kydAdmin],
    description: 'Le analisi sono scritte dal motore; modifiche manuali solo per gli admin KYD',
})

Acl({
    $id: Now.ID['kyd-analysis-delete'],
    type: 'record',
    table: 'x_giss2_kyd_analysis',
    operation: 'delete',
    roles: [kydAdmin],
    description: 'Cancellazione delle KYD Analysis',
})
