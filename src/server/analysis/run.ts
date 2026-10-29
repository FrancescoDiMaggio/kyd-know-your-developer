import { GlideDateTime, GlideRecord, gs } from '@servicenow/glide'
import { ANALYSIS_TABLE } from './config'
import { buildAnalysis } from './engine'

// Ciclo di vita di una KYD Analysis: queued -> running -> complete | error.
export function runAnalysis(analysisSysId: string) {
    const gr = new GlideRecord(ANALYSIS_TABLE)
    if (!gr.get(analysisSysId)) {
        gs.error(`KYD: analisi ${analysisSysId} non trovata`)
        return
    }
    if (gr.getValue('state') !== 'queued') return

    const setStatus = (message: string) => {
        gr.setValue('status_message', message.substring(0, 255))
        gr.update()
    }

    gr.setValue('state', 'running')
    gr.setValue('started_on', new GlideDateTime().getValue())
    setStatus('Avvio analisi…')

    try {
        const out = buildAnalysis(gr.getValue('developer'), gr.getValue('period_from'), gr.getValue('period_to'), setStatus)
        gr.setValue('result', JSON.stringify(out.result))
        gr.setValue('conversations', out.kpis.conversations)
        gr.setValue('prompts', out.kpis.prompts)
        gr.setValue('functional_artifacts', out.kpis.functionalArtifacts)
        gr.setValue('tool_success_rate', Math.round(out.kpis.toolSuccessRate * 10000) / 10000)
        gr.setValue('state', 'complete')
        gr.setValue('completed_on', new GlideDateTime().getValue())
        setStatus('')
    } catch (e: any) {
        gs.error(`KYD: analisi ${gr.getValue('number')} fallita: ${e?.message || e}`)
        gr.setValue('state', 'error')
        gr.setValue('completed_on', new GlideDateTime().getValue())
        gr.setValue('error_message', String(e?.stack || e?.message || e).substring(0, 4000))
        setStatus('Analisi terminata con errore')
    }
}
