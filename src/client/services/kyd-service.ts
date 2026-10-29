import type { AnalysisSummary, DeveloperCandidate, DeveloperRow, KydAnalysis } from '../types'
import { mockService } from './mock-service'

export interface AnalysisPeriod {
    from: string
    to: string
}

// Punto unico di accesso ai dati: oggi il mock, domani la Scripted REST API.
export interface KydService {
    readonly isDemo: boolean
    listDevelopers(): Promise<DeveloperRow[]>
    listCandidates(): Promise<DeveloperCandidate[]>
    listAnalyses(developerSysId: string): Promise<AnalysisSummary[]>
    getAnalysis(analysisSysId: string): Promise<KydAnalysis>
    requestAnalysis(developerSysId: string, period: AnalysisPeriod): Promise<AnalysisSummary>
}

export const kydService: KydService = mockService
