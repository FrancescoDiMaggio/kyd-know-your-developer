import '@servicenow/sdk/global'
import { CrossScopePrivilege } from '@servicenow/sdk/core'

// Il motore legge le tabelle di Build Agent (scope sn_build_agent).
CrossScopePrivilege({
    $id: Now.ID['kyd-read-sn_build_agent_conversation'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_build_agent_conversation',
    targetScope: 'sn_build_agent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['kyd-read-sn_build_agent_message'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_build_agent_message',
    targetScope: 'sn_build_agent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['kyd-read-sn_build_agent_script_request'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_build_agent_script_request',
    targetScope: 'sn_build_agent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['kyd-read-sn_build_agent_checkpoint'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_build_agent_checkpoint',
    targetScope: 'sn_build_agent',
    targetType: 'sys_db_object',
})

CrossScopePrivilege({
    $id: Now.ID['kyd-read-sn_build_agent_task_telemetry'],
    operation: 'read',
    status: 'allowed',
    targetName: 'sn_build_agent_task_telemetry',
    targetScope: 'sn_build_agent',
    targetType: 'sys_db_object',
})
