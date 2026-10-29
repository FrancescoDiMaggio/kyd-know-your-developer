// Parametri del motore KYD, ripresi da docs_private/Background_BA.js (CFG).

export const ANALYSIS_TABLE = 'x_giss2_kyd_analysis'
export const ANALYSIS_REQUESTED_EVENT = 'x_giss2_kyd.analysis.requested'
export const KYD_USER_ROLE = 'x_giss2_kyd.user'

export const PROMPT_TRUNCATE = 160
export const GOAL_TRUNCATE = 600
export const MAX_PROMPTS_PER_CONV = 400
export const RESULT_TRUNCATE = 220
export const INTENT_TRUNCATE = 140
export const SUBAGENT_TASK_TRUNCATE = 170
export const MAX_SCRIPT_INTENTS = 500
export const MAX_SCRIPT_FAILS = 20
export const MAX_ARTIFACTS = 1000
export const ANOMALOUS_UPDATE_SET_SIZE = 500

export const NOISE_CLASSES = [
    'sys_metadata_delete',
    'sys_wdf_external_connector_mapping',
    'sys_documentation',
    'sys_documentation_field',
    'sys_hub_flow_block',
    'sys_hub_flow_snapshot',
    'sys_hub_action_type_snapshot',
    'sys_hub_action_output',
    'sys_hub_action_input',
    'sys_hub_step_ext_input',
    'sys_hub_step_ext_output',
    'sys_hub_flow_input',
    'sys_hub_flow_variable',
    'sys_dictionary',
    'one_api_feature',
    'one_api_feature_provider',
    'one_api_service_plan',
    'one_api_service_plan_feature',
]

export const KEY_CLASSES = [
    'sys_db_object',
    'sys_script_include',
    'sys_script',
    'sysauto_script',
    'sysevent_register',
    'sysevent_email_action',
    'sysevent_in_email_action',
    'sys_ui_action',
    'sys_ui_page',
    'sys_ui_policy',
    'sys_ui_policy_action',
    'sys_ui_form',
    'sys_ui_section',
    'sys_ui_list',
    'sys_ui_list_control',
    'sys_ui_related_list',
    'sys_properties',
    'sys_security_acl',
    'sys_security_acl_role',
    'sc_cat_item',
    'sc_category',
    'item_option_new_set',
    'io_set_item',
    'catalog_script_client',
    'catalog_ui_policy',
    'catalog_ui_policy_action',
    'sys_hub_flow',
    'sys_hub_action_type_definition',
    'sys_app_application',
    'sys_app_module',
    'sys_choice_set',
    'sys_script_client',
    'sys_transform_map',
    'sys_ws_operation',
    'sys_processor',
    'sys_report',
]

export const FRICTION_WORDS = [
    'wtf',
    'waste',
    'wasting',
    'tired',
    'annoying',
    'catastroph',
    'not what we agreed',
    'again',
    'still not',
    'omg',
    'please stop',
    'confused',
    'frustrat',
    'nonsense',
    'useless',
]

// ------------------------------------------------------------------------------
// Stima dell'effort (KYD Effort Weight). I valori in tabella sovrascrivono questi
// default per classe; le property sovrascrivono i parametri generali.

export const EFFORT_WEIGHT_TABLE = 'x_giss2_kyd_effort_weight'

export const EFFORT_PROPERTIES = {
    hoursPerDay: { name: 'x_giss2_kyd.effort.hours_per_day', value: 8, description: 'Hours in a working day, to show the estimates in days' },
    rangeLow: { name: 'x_giss2_kyd.effort.range_low', value: 0.7, description: 'Lower multiplier of the manual effort range' },
    rangeHigh: { name: 'x_giss2_kyd.effort.range_high', value: 1.3, description: 'Upper multiplier of the manual effort range' },
    sessionGapMinutes: {
        name: 'x_giss2_kyd.effort.session_gap_minutes',
        value: 30,
        description: 'Maximum pause between two prompts still counted as working time in a Build Agent session',
    },
    sessionLeadMinutes: {
        name: 'x_giss2_kyd.effort.session_lead_minutes',
        value: 5,
        description: 'Minutes added at the start of each Build Agent session (reading, preparing the first prompt)',
    },
}

export interface DefaultWeight {
    cls: string
    label: string
    category: string
    baseHours: number
    driver: 'none' | 'script_lines' | 'fields' | 'flow_steps' | 'action_steps' | 'variables'
    hoursPerUnit: number
}

// Ore di uno sviluppatore esperto senza Build Agent (analisi tecnica e test unitari inclusi).
export const DEFAULT_EFFORT_WEIGHTS: DefaultWeight[] = [
    { cls: 'sys_db_object', label: 'Table', category: 'data_model', baseHours: 2, driver: 'fields', hoursPerUnit: 0.25 },
    { cls: 'sys_script_include', label: 'Script Include', category: 'logic', baseHours: 1, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_script', label: 'Business Rule', category: 'logic', baseHours: 0.5, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sysauto_script', label: 'Scheduled Script', category: 'automation', baseHours: 0.5, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_ui_action', label: 'UI Action', category: 'ui', baseHours: 0.5, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_script_client', label: 'Client Script', category: 'ui', baseHours: 0.5, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'catalog_script_client', label: 'Catalog Client Script', category: 'catalog', baseHours: 0.5, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_ui_page', label: 'UI Page', category: 'ui', baseHours: 2, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_ws_operation', label: 'Scripted REST Resource', category: 'integration', baseHours: 1, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_processor', label: 'Processor', category: 'integration', baseHours: 1, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_transform_map', label: 'Transform Map', category: 'integration', baseHours: 2, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_hub_flow', label: 'Flow', category: 'automation', baseHours: 2, driver: 'flow_steps', hoursPerUnit: 0.5 },
    { cls: 'sys_hub_action_type_definition', label: 'Flow Designer Action', category: 'automation', baseHours: 2, driver: 'action_steps', hoursPerUnit: 1 },
    { cls: 'sc_cat_item', label: 'Catalog Item', category: 'catalog', baseHours: 2, driver: 'variables', hoursPerUnit: 0.25 },
    { cls: 'item_option_new_set', label: 'Variable Set', category: 'catalog', baseHours: 1, driver: 'variables', hoursPerUnit: 0.25 },
    { cls: 'catalog_ui_policy', label: 'Catalog UI Policy', category: 'catalog', baseHours: 0.5, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_policy', label: 'UI Policy', category: 'ui', baseHours: 0.5, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sysevent_email_action', label: 'Notification', category: 'notification', baseHours: 1, driver: 'script_lines', hoursPerUnit: 0.02 },
    { cls: 'sysevent_in_email_action', label: 'Inbound Email Action', category: 'notification', baseHours: 1, driver: 'script_lines', hoursPerUnit: 0.05 },
    { cls: 'sys_security_acl', label: 'Access Control', category: 'security', baseHours: 0.5, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_security_acl_role', label: 'ACL Role', category: 'security', baseHours: 0.1, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sysevent_register', label: 'Event Registration', category: 'configuration', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_properties', label: 'System Property', category: 'configuration', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_app_application', label: 'Application Menu', category: 'configuration', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_app_module', label: 'Module', category: 'configuration', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_choice_set', label: 'Choice List', category: 'configuration', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_form', label: 'Form', category: 'ui', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_section', label: 'Form Section', category: 'ui', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_list', label: 'List Layout', category: 'ui', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_list_control', label: 'List Control', category: 'ui', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_related_list', label: 'Related List', category: 'ui', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_ui_policy_action', label: 'UI Policy Action', category: 'ui', baseHours: 0.1, driver: 'none', hoursPerUnit: 0 },
    { cls: 'catalog_ui_policy_action', label: 'Catalog UI Policy Action', category: 'catalog', baseHours: 0.1, driver: 'none', hoursPerUnit: 0 },
    { cls: 'io_set_item', label: 'Variable Set Attachment', category: 'catalog', baseHours: 0.1, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sc_category', label: 'Catalog Category', category: 'catalog', baseHours: 0.25, driver: 'none', hoursPerUnit: 0 },
    { cls: 'sys_report', label: 'Report', category: 'ui', baseHours: 1, driver: 'none', hoursPerUnit: 0 },
]

// Classi non presenti né in tabella né nei default.
export const FALLBACK_WEIGHT: DefaultWeight = { cls: '*', label: 'Other', category: 'other', baseHours: 0.5, driver: 'none', hoursPerUnit: 0 }

// Campi di script misurati dal driver script_lines.
export const SCRIPT_FIELDS: Record<string, string[]> = {
    sys_script_include: ['script'],
    sys_script: ['script'],
    sysauto_script: ['script'],
    sys_ui_action: ['script'],
    sys_script_client: ['script'],
    catalog_script_client: ['script'],
    sys_ui_page: ['html', 'client_script', 'processing_script'],
    sys_ws_operation: ['operation_script'],
    sys_processor: ['script'],
    sysevent_email_action: ['message_html'],
    sysevent_in_email_action: ['script'],
}

// Tabelle aggiornate come effetto collaterale degli script (versioni, cache, indici): escluse dal conteggio.
export const ROLLBACK_SIDE_EFFECT_TABLES = [
    'sys_update_version',
    'sys_update_xml',
    'sys_metadata_customization',
    'sys_translated_text',
    'sys_forms_cache_flush',
    'sn_metadata_search_summary',
    'sys_audit_role',
    'sys_audit',
    'sys_user_preference',
    'sys_trigger',
    'syslog',
    'sys_cache_flush',
]
