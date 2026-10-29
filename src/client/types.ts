// Contratto dati tra il motore di analisi (server) e la UI.
// Le sezioni ricalcano il report di docs_private/Background_BA.js (1..13).
// Il motore serializza KydAnalysisResult nel campo JSON della KYD Analysis.

export type AnalysisState = 'queued' | 'running' | 'complete' | 'error'

// Fase corrente del motore, tradotta dalla UI (status_message resta testo libero in inglese).
export type AnalysisStage =
    | 'queued'
    | 'starting'
    | 'conversations'
    | 'messages'
    | 'metadata'
    | 'governance'
    | 'graph'
    | 'insights'
    | 'complete'
    | 'error'

export interface DeveloperRef {
    sysId: string
    name: string
    userName: string
    email?: string
}

export interface AnalysisKpis {
    conversations: number
    prompts: number
    functionalArtifacts: number
    toolSuccessRate: number // 0..1
}

export interface AnalysisSummary {
    sysId: string
    number: string
    developer: DeveloperRef
    state: AnalysisState
    stage?: AnalysisStage
    statusMessage?: string
    requestedOn: string
    completedOn?: string
    periodFrom: string
    periodTo: string
    kpis?: AnalysisKpis
}

// Riga della vista lista: un developer con la sua analisi più recente.
export interface DeveloperRow {
    developer: DeveloperRef
    latest: AnalysisSummary
    analysesCount: number
}

// Utente proposto dal wizard: ha almeno una conversazione con Build Agent.
export interface DeveloperCandidate {
    developer: DeveloperRef
    conversations: number
    lastActivity: string
    analysesCount: number
}

// 1. Identità
export interface Identity {
    active: boolean
    lockedOut: boolean
    createdOn: string
    createdBy: string
    lastLogin: string
    directRoles: string[] // vuoto = accesso via gruppo
    company: string
    location: string
    groups: string[]
    effectiveRoles: { name: string; inherited: boolean }[]
}

// 2. Conversazioni
export type Sender = 'user' | 'assistant' | 'assistant-thinking' | 'assistant-tool' | 'sub-agent'

export interface Conversation {
    sysId: string
    title: string
    isSubAgent: boolean
    parent?: string
    createdOn: string
    lastMessageOn: string
    state: string
    execStatus: string
    client: string
    variant: string
    appName: string
    scopeId: string
    messages: number
    senders: Record<Sender, number>
    // Primo prompt della conversazione (fino a 600 caratteri): l'obiettivo reale, il titolo può essere generico.
    goal?: string
}

export interface ConversationsSection {
    rootCount: number
    totalCount: number
    messages: number
    items: Conversation[]
    senderTotals: { sender: string; count: number }[]
}

// 3. Tool
export interface ToolStat {
    tool: string
    calls: number
    ok: number
    ko: number
    seconds: number
    critical: boolean // ko >= ok
}

export interface ToolsSection {
    calls: number
    ok: number
    ko: number
    items: ToolStat[]
}

// 4. Build / Install
export interface ToolOutcome {
    conversation: string // sys_id conversazione
    tool: string
    ok: boolean
    message: string
}

export interface BuildInstallSection {
    installs: ToolOutcome[]
    buildTotal: number
    buildFailures: ToolOutcome[]
    scriptFailureCount: number
    scriptFailures: ToolOutcome[]
}

// 5. File sorgente
export interface FilesSection {
    operations: number
    writes: { path: string; count: number }[]
    deletes: { conversation: string; op: string; path: string }[]
}

// 6. Intent degli script
export interface ScriptIntentsSection {
    total: number
    items: { conversation: string; ok: boolean; intent: string }[]
}

// 7. Sub-agent
export interface SubAgentDelegation {
    conversation: string
    agentType: string
    name: string
    task: string
}

// 8. Metriche comportamentali
export interface BehaviourSection {
    activeDays: number
    byDay: { date: string; prompts: number }[]
    peak: { date: string; prompts: number }
    byHour: { hour: number; prompts: number }[]
    prompts: number
    systemMarkers: number
    avgPromptChars: number
    longestPrompt: number
    images: number
    agentMinutes: { thinking: number; tools: number; responses: number; total: number }
}

// 9. Qualità dei prompt
export type PromptQualityKey =
    | 'ultraShort'
    | 'veryLong'
    | 'withImages'
    | 'withUrl'
    | 'withTicket'
    | 'withTech'
    | 'duplicates'
    | 'friction'

export interface PromptQualitySection {
    base: number
    metrics: { key: PromptQualityKey; label: string; count: number }[]
}

// 10. Metadata
export interface CreatedTable {
    name: string
    label: string
    extends: string
    fields: number
    records: number | null
    scratch: boolean // np$* del Table Builder
}

export interface MetadataSection {
    total: number
    functional: number
    noise: number
    functionalClasses: { cls: string; count: number }[]
    noiseClasses: { cls: string; count: number }[]
    artifacts: { createdOn: string; cls: string; name: string }[]
    tables: CreatedTable[]
    dictionaryByTable: { table: string; count: number }[]
}

// 11. Update set
export interface UpdateSet {
    createdOn: string
    state: string
    updates: number
    name: string
    anomalous: boolean // in progress con volume > soglia
}

// 12. Governance e rischio
export interface GovernanceSection {
    backgroundScripts: number | null
    // true se stimato dalle chiamate run_script (script request non leggibili dallo scope)
    backgroundScriptsEstimated?: boolean
    atfTests: number | null
    globalConversations: number
    totalConversations: number
    install: { failed: number; total: number }
    build: { failed: number; total: number }
    frictionPrompts: number
    checklist: { key: ChecklistKey; item: string; triggered: boolean }[]
}

export type ChecklistKey = 'anomalousUpdateSets' | 'scratchTables' | 'ootbChanges' | 'atfCoverage' | 'openUpdateSets'

// 13. Prompt utente
export interface PromptEntry {
    createdOn: string
    tags: string[] // IMG, CKPT, HID
    text: string
    length: number
}

// Grafo di relazione: calcolato lato server dalle sezioni precedenti.
export type GraphNodeType = 'developer' | 'conversation' | 'updateset' | 'artifacts' | 'table' | 'file'

export interface GraphNode {
    id: string
    label: string
    type: GraphNodeType
    weight?: number
    items?: string[] // dettaglio mostrato al click
}

export interface GraphEdge {
    source: string
    target: string
}

export interface KydAnalysisResult {
    identity: Identity
    conversations: ConversationsSection
    tools: ToolsSection
    buildInstall: BuildInstallSection
    files: FilesSection
    scriptIntents: ScriptIntentsSection
    subAgents: SubAgentDelegation[]
    behaviour: BehaviourSection
    promptQuality: PromptQualitySection
    metadata: MetadataSection
    updateSets: UpdateSet[]
    governance: GovernanceSection
    prompts: { conversation: string; items: PromptEntry[] }[]
    graph: { nodes: GraphNode[]; edges: GraphEdge[] }
    insights?: KydInsights
}

// Lettura testuale prodotta dalle Skill Now Assist a fine analisi.
export interface InsightPoint {
    title: string
    detail: string
}

export type StreamOutcome = 'done' | 'partial' | 'blocked' | 'advisory'
export type Severity = 'high' | 'medium' | 'low' | 'monitor'

export interface BehaviourInsight {
    classification: string
    summary: string
    strengths: InsightPoint[]
    concerns: InsightPoint[]
}

export interface DeliveryInsight {
    // v2: etichetta breve del ruolo (es. "Acme platform engineer")
    developerRole?: string
    streams: {
        title: string
        period: string
        scope: string
        outcome: StreamOutcome
        summary: string
        artifacts: string[]
        // v2: prompt degli stream, componenti in una frase, esito in poche parole
        prompts?: number
        components?: string
        result?: string
    }[]
    outcomes: { goal: string; status: 'success' | 'partial' | 'failed'; detail: string }[]
    failureCauses: InsightPoint[]
}

export interface RiskInsight {
    classification: string
    risks: { finding: string; severity: Severity; action: string }[]
    maturity: { dimension: string; score: number; rationale: string }[]
    recommendations: string[]
}

export type InsightSkill = 'behaviour' | 'delivery' | 'risk'

export interface KydInsights {
    generatedOn: string
    language: string
    behaviour?: BehaviourInsight
    delivery?: DeliveryInsight
    risk?: RiskInsight
    errors: { skill: InsightSkill; message: string }[]
}

export interface KydAnalysis {
    summary: AnalysisSummary
    result?: KydAnalysisResult
}
