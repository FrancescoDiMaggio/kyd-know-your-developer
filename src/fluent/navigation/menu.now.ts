import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'
import { kydUser } from '../security/roles.now'

export const kydMenu = ApplicationMenu({
    $id: Now.ID['kyd-menu'],
    title: 'KYD - Know Your Developer',
    hint: 'Analisi dei developer che lavorano con Build Agent',
    roles: [kydUser],
    active: true,
})

Record({
    $id: Now.ID['kyd-module-home'],
    table: 'sys_app_module',
    data: {
        title: 'Developer analizzati',
        application: kydMenu,
        link_type: 'DIRECT',
        query: 'x_giss2_kyd_app.do',
        hint: 'Apri KYD',
        roles: ['x_giss2_kyd.user'],
        active: true,
        order: 100,
    },
})

Record({
    $id: Now.ID['kyd-module-analyses'],
    table: 'sys_app_module',
    data: {
        title: 'KYD Analysis',
        application: kydMenu,
        link_type: 'LIST',
        name: 'x_giss2_kyd_analysis',
        hint: 'Tutte le analisi (vista tabellare)',
        roles: ['x_giss2_kyd.admin'],
        active: true,
        order: 200,
    },
})
