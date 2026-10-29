import '@servicenow/sdk/global'
import { Acl, BooleanColumn, ChoiceColumn, DecimalColumn, Form, IntegerColumn, StringColumn, Table, UiAction, default_view } from '@servicenow/sdk/core'
import { kydAdmin, kydUser } from '../security/roles.now'
import { loadDefaultEffortWeights } from '../../server/effort/seed'

// Pesi configurabili della stima dell'effort manuale: una riga per classe di artefatto.
// Le righe sovrascrivono i default del motore (src/server/analysis/config.ts).
export const x_giss2_kyd_effort_weight = Table({
    name: 'x_giss2_kyd_effort_weight',
    label: 'KYD Effort Weight',
    display: 'artifact_class',
    schema: {
        artifact_class: StringColumn({ label: 'Artifact class', maxLength: 80, mandatory: true }),
        label: StringColumn({ label: 'Label', maxLength: 100 }),
        category: ChoiceColumn({
            label: 'Category',
            choices: {
                data_model: { label: 'Data model', sequence: 10 },
                logic: { label: 'Logic', sequence: 20 },
                ui: { label: 'User interface', sequence: 30 },
                catalog: { label: 'Service Catalog', sequence: 40 },
                automation: { label: 'Automation', sequence: 50 },
                integration: { label: 'Integration', sequence: 60 },
                security: { label: 'Security', sequence: 70 },
                notification: { label: 'Notification', sequence: 80 },
                configuration: { label: 'Configuration', sequence: 90 },
                other: { label: 'Other', sequence: 100 },
            },
            dropdown: 'dropdown_with_none',
        }),
        base_hours: DecimalColumn({ label: 'Base hours', mandatory: true }),
        driver: ChoiceColumn({
            label: 'Size driver',
            choices: {
                none: { label: 'None', sequence: 10 },
                script_lines: { label: 'Script lines', sequence: 20 },
                fields: { label: 'Table fields', sequence: 30 },
                flow_steps: { label: 'Flow steps', sequence: 40 },
                action_steps: { label: 'Action steps', sequence: 50 },
                variables: { label: 'Catalog variables', sequence: 60 },
            },
            default: 'none',
            dropdown: 'dropdown_without_none',
        }),
        hours_per_unit: DecimalColumn({ label: 'Hours per unit' }),
        max_units: IntegerColumn({ label: 'Max units' }),
        active: BooleanColumn({ label: 'Active', default: true }),
        notes: StringColumn({ label: 'Notes', maxLength: 1000 }),
    },
    index: [{ name: 'kyd_effort_weight_class', unique: true, element: 'artifact_class' }],
})

Form({
    table: 'x_giss2_kyd_effort_weight',
    view: default_view,
    sections: [
        {
            caption: 'Weight',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'artifact_class', type: 'table_field' },
                        { field: 'label', type: 'table_field' },
                        { field: 'category', type: 'table_field' },
                        { field: 'active', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'base_hours', type: 'table_field' },
                        { field: 'driver', type: 'table_field' },
                        { field: 'hours_per_unit', type: 'table_field' },
                        { field: 'max_units', type: 'table_field' },
                    ],
                },
                { layout: 'one-column', elements: [{ field: 'notes', type: 'table_field' }] },
            ],
        },
    ],
})

Acl({
    $id: Now.ID['kyd-effort-weight-read'],
    type: 'record',
    table: 'x_giss2_kyd_effort_weight',
    operation: 'read',
    roles: [kydUser],
    description: 'Lettura dei pesi della stima KYD',
})

Acl({
    $id: Now.ID['kyd-effort-weight-create'],
    type: 'record',
    table: 'x_giss2_kyd_effort_weight',
    operation: 'create',
    roles: [kydAdmin],
    description: 'Creazione dei pesi della stima KYD',
})

Acl({
    $id: Now.ID['kyd-effort-weight-write'],
    type: 'record',
    table: 'x_giss2_kyd_effort_weight',
    operation: 'write',
    roles: [kydAdmin],
    description: 'Modifica dei pesi della stima KYD',
})

Acl({
    $id: Now.ID['kyd-effort-weight-delete'],
    type: 'record',
    table: 'x_giss2_kyd_effort_weight',
    operation: 'delete',
    roles: [kydAdmin],
    description: 'Cancellazione dei pesi della stima KYD',
})

// Inserisce i default mancanti e le property dell'effort senza toccare le righe esistenti.
UiAction({
    $id: Now.ID['kyd-effort-weight-load-defaults'],
    table: 'x_giss2_kyd_effort_weight',
    name: 'Load KYD default weights',
    actionName: 'kyd_load_default_weights',
    hint: 'Add the KYD default weights and effort properties that are missing. Existing rows are not changed.',
    list: { showButton: true, style: 'primary' },
    roles: [kydAdmin],
    script: loadDefaultEffortWeights,
    order: 100,
})
