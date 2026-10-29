import '@servicenow/sdk/global'
import { ApplicationMenu, Record } from '@servicenow/sdk/core'

export const kydMenu = ApplicationMenu({
    $id: Now.ID['kyd-menu'],
    title: 'KYD - Know Your Developer',
    hint: 'Analisi dei developer che lavorano con Build Agent',
    roles: ['admin'],
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
        roles: ['admin'],
        active: true,
        order: 100,
    },
})
