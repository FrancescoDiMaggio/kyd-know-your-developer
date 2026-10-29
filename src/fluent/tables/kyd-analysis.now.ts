import '@servicenow/sdk/global'
import {
    ChoiceColumn,
    DateTimeColumn,
    DecimalColumn,
    Form,
    IntegerColumn,
    JsonColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    StringColumn,
    Table,
    default_view,
} from '@servicenow/sdk/core'

// Una KYD Analysis per ogni richiesta: ce ne possono essere più di una per developer.
export const x_giss2_kyd_analysis = Table({
    name: 'x_giss2_kyd_analysis',
    label: 'KYD Analysis',
    display: 'number',
    audit: false,
    schema: {
        number: StringColumn({ label: 'Number', default: 'javascript:global.getNextObjNumberPadded();', readOnly: true }),
        developer: ReferenceColumn({ label: 'Developer', referenceTable: 'sys_user', mandatory: true }),
        requested_by: ReferenceColumn({ label: 'Requested by', referenceTable: 'sys_user', default: 'javascript:gs.getUserID()' }),
        state: ChoiceColumn({
            label: 'State',
            choices: {
                queued: { label: 'Queued', sequence: 10 },
                running: { label: 'Running', sequence: 20 },
                complete: { label: 'Complete', sequence: 30 },
                error: { label: 'Error', sequence: 40 },
            },
            default: 'queued',
            dropdown: 'dropdown_without_none',
        }),
        stage: ChoiceColumn({
            label: 'Stage',
            choices: {
                queued: { label: 'Queued', sequence: 10 },
                starting: { label: 'Starting', sequence: 20 },
                conversations: { label: 'Reading conversations', sequence: 30 },
                messages: { label: 'Scanning messages', sequence: 40 },
                metadata: { label: 'Metadata and update sets', sequence: 50 },
                governance: { label: 'Governance indicators', sequence: 60 },
                graph: { label: 'Relationship graph', sequence: 70 },
                insights: { label: 'Now Assist insights', sequence: 80 },
                complete: { label: 'Complete', sequence: 90 },
                error: { label: 'Error', sequence: 100 },
            },
            default: 'queued',
            dropdown: 'dropdown_without_none',
        }),
        status_message: StringColumn({ label: 'Status message', maxLength: 255 }),
        period_from: DateTimeColumn({ label: 'Period from', mandatory: true }),
        period_to: DateTimeColumn({ label: 'Period to', mandatory: true }),
        started_on: DateTimeColumn({ label: 'Started on' }),
        completed_on: DateTimeColumn({ label: 'Completed on' }),
        conversations: IntegerColumn({ label: 'Conversations' }),
        prompts: IntegerColumn({ label: 'Prompts' }),
        functional_artifacts: IntegerColumn({ label: 'Functional artifacts' }),
        tool_success_rate: DecimalColumn({ label: 'Tool success rate' }),
        result: JsonColumn({ label: 'Result', maxLength: 4000000 }),
        error_message: MultiLineTextColumn({ label: 'Error message', maxLength: 4000 }),
    },
    autoNumber: { prefix: 'KYD', number: 1000, numberOfDigits: 7 },
    index: [{ name: 'kyd_analysis_developer', unique: false, element: ['developer', 'sys_created_on'] }],
})

Form({
    table: 'x_giss2_kyd_analysis',
    view: default_view,
    sections: [
        {
            caption: 'Analisi',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'number', type: 'table_field' },
                        { field: 'developer', type: 'table_field' },
                        { field: 'requested_by', type: 'table_field' },
                        { field: 'state', type: 'table_field' },
                        { field: 'stage', type: 'table_field' },
                        { field: 'status_message', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'period_from', type: 'table_field' },
                        { field: 'period_to', type: 'table_field' },
                        { field: 'started_on', type: 'table_field' },
                        { field: 'completed_on', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Indicatori',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'conversations', type: 'table_field' },
                        { field: 'prompts', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'functional_artifacts', type: 'table_field' },
                        { field: 'tool_success_rate', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Risultato',
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { field: 'error_message', type: 'table_field' },
                        { field: 'result', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
