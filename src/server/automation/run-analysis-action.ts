import { runAnalysis } from '../analysis/run.ts'

// Script Action sull'evento x_giss2_kyd.analysis.requested.
// I nomi dei parametri diventano gli argomenti della chiamata generata: current, event.
export function runAnalysisAction(current: any, event: any) {
    runAnalysis(current?.getUniqueValue?.() || event?.instance)
}
