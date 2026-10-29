import '@servicenow/sdk/global'
import { BusinessRule, Record, ScriptAction } from '@servicenow/sdk/core'
import { queueAnalysis } from '../../server/automation/queue-analysis'
import { runAnalysisAction } from '../../server/automation/run-analysis-action'

export const ANALYSIS_REQUESTED_EVENT = 'x_giss2_kyd.analysis.requested'

Record({
    $id: Now.ID['x-giss2-kyd-analysis-requested-event'],
    table: 'sysevent_register',
    data: {
        suffix: 'analysis.requested',
        event_name: ANALYSIS_REQUESTED_EVENT,
        description: 'Una KYD Analysis è stata richiesta ed è in coda',
        table: 'x_giss2_kyd_analysis',
        fired_by: 'Business Rule: KYD - Queue analysis',
        priority: 100,
    },
})

// Ogni nuova analisi in coda viene passata al motore in background.
BusinessRule({
    $id: Now.ID['kyd-queue-analysis'],
    name: 'KYD - Queue analysis',
    table: 'x_giss2_kyd_analysis',
    when: 'after',
    action: ['insert'],
    filterCondition: 'state=queued^EQ',
    order: 100,
    script: queueAnalysis,
})

ScriptAction({
    $id: Now.ID['kyd-run-analysis'],
    name: 'KYD - Run analysis',
    active: true,
    description: 'Esegue il motore di analisi KYD per la KYD Analysis indicata dall’evento',
    eventName: ANALYSIS_REQUESTED_EVENT,
    order: 100,
    script: runAnalysisAction,
})
