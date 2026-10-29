import { t } from 'sn-translate'
import type { AnalysisStage, AttributionLevel, ChecklistKey, PromptQualityKey, Severity, StreamOutcome, WeightDriver } from '../types'

// Etichette traducibili dei valori codificati restituiti dal motore.
// Ogni t() ha un letterale come primo argomento, così la build lo raccoglie.

export function stageLabel(stage?: AnalysisStage): string {
    switch (stage) {
        case 'queued':
            return t('Queued')
        case 'starting':
            return t('Starting analysis')
        case 'conversations':
            return t('Reading Build Agent conversations')
        case 'messages':
            return t('Scanning messages')
        case 'metadata':
            return t('Analysing metadata and update sets')
        case 'governance':
            return t('Computing governance indicators')
        case 'graph':
            return t('Building the relationship graph')
        case 'effort':
            return t('Estimating the manual effort')
        case 'insights':
            return t('Generating Now Assist insights')
        case 'complete':
            return t('Complete')
        case 'error':
            return t('Analysis failed')
        default:
            return ''
    }
}

export function checklistLabel(key: ChecklistKey): string {
    switch (key) {
        case 'anomalousUpdateSets':
            return t('Clean up "in progress" update sets with an anomalous volume (demo data vs solution)')
        case 'scratchTables':
            return t('Delete the np$* scratch tables with no fields')
        case 'ootbChanges':
            return t('Audit fields and views added to platform tables (sc_req_item, sc_cat_item, task...)')
        case 'atfCoverage':
            return t('Cover the modified catalog items and flows with ATF tests')
        case 'openUpdateSets':
            return t('Close or complete the update sets left open')
    }
}

export function promptQualityLabel(key: PromptQualityKey): string {
    switch (key) {
        case 'ultraShort':
            return t('Ultra-short (≤15 characters: "go", "yes")')
        case 'veryLong':
            return t('Very detailed (>1500 characters)')
        case 'withImages':
            return t('With images / screenshots')
        case 'withUrl':
            return t('With links to instance records')
        case 'withTicket':
            return t('With ticket references (RITM/REQ/STRY)')
        case 'withTech':
            return t('With technical table / field names')
        case 'duplicates':
            return t('Duplicates (same text sent again)')
        case 'friction':
            return t('With friction / frustration signals')
    }
}

export function severityLabel(severity: Severity): string {
    switch (severity) {
        case 'high':
            return t('High')
        case 'medium':
            return t('Medium')
        case 'low':
            return t('Low')
        case 'monitor':
            return t('Monitor')
    }
}

export const SEVERITY_PALETTE: Record<Severity, string> = { high: 'red', medium: 'orange', low: 'yellow', monitor: 'gray' }

export function outcomeLabel(outcome: StreamOutcome | 'success' | 'failed'): string {
    switch (outcome) {
        case 'done':
        case 'success':
            return t('Done')
        case 'partial':
            return t('Partial')
        case 'blocked':
            return t('Blocked')
        case 'failed':
            return t('Failed')
        case 'advisory':
            return t('Advisory only')
    }
}

export const OUTCOME_PALETTE: Record<string, string> = {
    done: 'green',
    success: 'green',
    partial: 'yellow',
    blocked: 'red',
    failed: 'red',
    advisory: 'gray',
}

export function unnamed(name: string): string {
    return name || t('(no name)')
}

export function attributionLabel(level: AttributionLevel): string {
    switch (level) {
        case 'checkpoint':
            return t('Build Agent checkpoint')
        case 'script':
            return t('Build Agent script')
        case 'install':
            return t('Build Agent install')
        case 'window':
            return t('Same time window (probable)')
        case 'manual':
            return t('Outside Build Agent')
    }
}

export const ATTRIBUTION_PALETTE: Record<AttributionLevel, string> = {
    checkpoint: 'green',
    script: 'green',
    install: 'green',
    window: 'yellow',
    manual: 'gray',
}

export function driverLabel(driver: WeightDriver): string {
    switch (driver) {
        case 'script_lines':
            return t('script lines')
        case 'fields':
            return t('table fields')
        case 'flow_steps':
            return t('flow steps')
        case 'action_steps':
            return t('action steps')
        case 'variables':
            return t('catalog variables')
        default:
            return t('none')
    }
}

export function categoryLabel(category: string): string {
    switch (category) {
        case 'data_model':
            return t('Data model')
        case 'logic':
            return t('Logic')
        case 'ui':
            return t('User interface')
        case 'catalog':
            return t('Service Catalog')
        case 'automation':
            return t('Automation')
        case 'integration':
            return t('Integration')
        case 'security':
            return t('Security')
        case 'notification':
            return t('Notification')
        case 'configuration':
            return t('Configuration')
        default:
            return t('Other')
    }
}
