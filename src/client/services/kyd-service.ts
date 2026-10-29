import type { AnalysisSummary, DeveloperCandidate, DeveloperRow, KydAnalysis } from '../types'
import { restService } from './rest-service'

export interface AnalysisPeriod {
    from: string
    to: string
}

// Punto unico di accesso ai dati della UI.
export interface KydService {
    getSession(): Promise<{ language: string }>
    listDevelopers(): Promise<DeveloperRow[]>
    listCandidates(): Promise<DeveloperCandidate[]>
    listAnalyses(developerSysId: string): Promise<AnalysisSummary[]>
    getAnalysis(analysisSysId: string): Promise<KydAnalysis>
    requestAnalysis(developerSysId: string, period: AnalysisPeriod): Promise<AnalysisSummary>
}

export const kydService: KydService = restService
