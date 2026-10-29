import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import type { AnalysisStage } from '../../client/types'
import { ANALYSIS_TABLE } from './config.ts'
import { buildAnalysis } from './engine.ts'
import { buildInsights, requesterLanguage } from '../insights/insights.ts'

// Ciclo di vita di una KYD Analysis: queued -> running -> complete | error.
export function runAnalysis(analysisSysId: string) {
    const gr = new GlideRecord(ANALYSIS_TABLE)
    if (!gr.get(analysisSysId)) {
        gs.error(`KYD: analysis ${analysisSysId} not found`)
        return
    }
    if (gr.getValue('state') !== 'queued') return

    const progress = (stage: AnalysisStage, message: string) => {
        gr.setValue('stage', stage)
        gr.setValue('status_message', message.substring(0, 255))
        gr.update()
    }

    gr.setValue('state', 'running')
    gr.setValue('started_on', new GlideDateTime().getValue())
    progress('starting', 'Starting analysis')

    try {
        const out = buildAnalysis(gr.getValue('developer'), gr.getValue('period_from'), gr.getValue('period_to'), progress)
        progress('insights', 'Generating Now Assist insights')
        out.result.insights = buildInsights(out.result, requesterLanguage(gr.getValue('requested_by')), out.developer.email)
        gr.setValue('result', JSON.stringify(out.result))
        gr.setValue('conversations', out.kpis.conversations)
        gr.setValue('prompts', out.kpis.prompts)
        gr.setValue('functional_artifacts', out.kpis.functionalArtifacts)
        gr.setValue('tool_success_rate', Math.round(out.kpis.toolSuccessRate * 10000) / 10000)
        gr.setValue('state', 'complete')
        gr.setValue('completed_on', new GlideDateTime().getValue())
        progress('complete', '')
    } catch (e: any) {
        gs.error(`KYD: analysis ${gr.getValue('number')} failed: ${e?.message || e}`)
        gr.setValue('state', 'error')
        gr.setValue('completed_on', new GlideDateTime().getValue())
        gr.setValue('error_message', String(e?.stack || e?.message || e).substring(0, 4000))
        progress('error', 'Analysis failed')
    }
}
