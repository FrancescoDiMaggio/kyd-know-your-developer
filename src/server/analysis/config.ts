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
