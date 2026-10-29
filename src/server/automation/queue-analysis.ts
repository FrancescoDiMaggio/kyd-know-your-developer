import { gs } from '@servicenow/glide'
import { ANALYSIS_REQUESTED_EVENT } from '../analysis/config'

// Business rule (after insert): passa la nuova analisi al motore in background.
export function queueAnalysis(current: any, previous: any) {
    gs.eventQueue(ANALYSIS_REQUESTED_EVENT, current, current.getValue('developer'), current.getValue('number'))
}
