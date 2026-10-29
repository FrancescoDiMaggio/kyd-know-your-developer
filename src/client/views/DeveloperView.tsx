import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, HStack, Heading, NativeSelect, Skeleton, Stack, Tabs, Text, Wrap } from '@chakra-ui/react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import type { AnalysisSummary, KydAnalysis } from '../types'
import { kydService } from '../services/kyd-service'
import { StateBadge } from '../components/StateBadge'
import { toaster } from '../components/toaster'
import { RelationshipGraph } from '../components/RelationshipGraph'
import { OverviewTab } from '../sections/OverviewTab'
import { ConversationsTab } from '../sections/ConversationsTab'
import { ToolsTab } from '../sections/ToolsTab'
import { WorkTab } from '../sections/WorkTab'
import { BehaviourTab } from '../sections/BehaviourTab'
import { MetadataTab } from '../sections/MetadataTab'
import { GovernanceTab } from '../sections/GovernanceTab'
import { SectionCard } from '../components/SectionCard'
import { fmtDate, fmtDateTime } from '../utils/format'
import { Route, setPageTitle } from '../utils/navigation'

const TABS = [
    { value: 'overview', label: 'Panoramica' },
    { value: 'conversations', label: 'Conversazioni' },
    { value: 'tools', label: 'Tool ed esiti' },
    { value: 'work', label: 'Lavoro svolto' },
    { value: 'behaviour', label: 'Comportamento' },
    { value: 'metadata', label: 'Componenti' },
    { value: 'governance', label: 'Governance' },
    { value: 'graph', label: 'Grafo' },
]

const POLL_MS = 3000

interface Props {
    route: Route
    navigate: (r: Route, opts?: { replace?: boolean }) => void
}

export function DeveloperView({ route, navigate }: Props) {
    const developer = route.developer as string
    const tab = TABS.some((t) => t.value === route.tab) ? (route.tab as string) : 'overview'
    const [analyses, setAnalyses] = useState<AnalysisSummary[] | null>(null)
    const [analysis, setAnalysis] = useState<KydAnalysis | null>(null)

    const loadList = useCallback(async () => setAnalyses(await kydService.listAnalyses(developer)), [developer])
    useEffect(() => {
        void loadList()
    }, [loadList])

    // Senza analisi esplicita nell'URL si apre l'ultima completata.
    const selectedId = route.analysis || analyses?.find((a) => a.state === 'complete')?.sysId || analyses?.[0]?.sysId
    useEffect(() => {
        if (!selectedId) return
        setAnalysis(null)
        kydService.getAnalysis(selectedId).then(setAnalysis, (e) =>
            toaster.create({ type: 'error', title: "Impossibile caricare l'analisi", description: String(e) }),
        )
    }, [selectedId])

    const summary = analysis?.summary
    useEffect(() => {
        if (summary) setPageTitle(summary.developer.name)
    }, [summary])

    // Un'analisi in corso viene ricaricata finché non si completa.
    const pending = summary && (summary.state === 'queued' || summary.state === 'running')
    useEffect(() => {
        if (!pending || !selectedId) return
        const t = setInterval(() => {
            kydService.getAnalysis(selectedId).then(setAnalysis)
            void loadList()
        }, POLL_MS)
        return () => clearInterval(t)
    }, [pending, selectedId, loadList])

    const go = (patch: Partial<Route>, replace = false) =>
        navigate({ view: 'detail', developer, analysis: route.analysis, tab: route.tab, ...patch }, { replace })

    const refresh = async () => {
        if (!summary) return
        const a = await kydService.requestAnalysis(developer, { from: summary.periodFrom, to: summary.periodTo })
        toaster.create({ type: 'info', title: `Analisi ${a.number} richiesta`, description: 'Può richiedere qualche minuto.' })
        await loadList()
        go({ analysis: a.sysId })
    }

    if (analyses && !analyses.length) {
        return (
            <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Title>Nessuna analisi per questo developer.</Alert.Title>
            </Alert.Root>
        )
    }

    const r = analysis?.result
    return (
        <Stack gap="5">
            <Button alignSelf="start" variant="ghost" size="sm" onClick={() => navigate({ view: 'list' })}>
                <ArrowLeft /> Developer analizzati
            </Button>

            {!summary ? (
                <Skeleton height="120px" borderRadius="l3" />
            ) : (
                <Card.Root bg="bg">
                    <Card.Body>
                        <HStack justify="space-between" align="start" gap="6" wrap="wrap">
                            <HStack gap="4" align="center">
                                <Avatar.Root size="2xl" colorPalette="brand">
                                    <Avatar.Fallback name={summary.developer.name} />
                                </Avatar.Root>
                                <Box>
                                    <Heading size="2xl">{summary.developer.name}</Heading>
                                    <Text color="fg.muted">
                                        {summary.developer.userName}
                                        {summary.developer.email && ` · ${summary.developer.email}`}
                                    </Text>
                                    <Wrap gap="2" mt="2">
                                        <StateBadge state={summary.state} />
                                        <Text textStyle="sm" color="fg.muted">
                                            {summary.number} · periodo {fmtDate(summary.periodFrom)} → {fmtDate(summary.periodTo)}
                                        </Text>
                                    </Wrap>
                                </Box>
                            </HStack>
                            <Stack gap="2" minW="260px">
                                <Text textStyle="xs" color="fg.muted">
                                    Analisi del developer
                                </Text>
                                <NativeSelect.Root size="sm">
                                    <NativeSelect.Field
                                        value={selectedId}
                                        onChange={(e) => go({ analysis: e.target.value })}
                                        aria-label="Seleziona l'analisi"
                                    >
                                        {analyses?.map((a) => (
                                            <option key={a.sysId} value={a.sysId}>
                                                {a.number} · {fmtDateTime(a.completedOn || a.requestedOn)}
                                                {a.state !== 'complete' ? ` (${a.state})` : ''}
                                            </option>
                                        ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                                <Button size="sm" variant="outline" onClick={() => void refresh()} disabled={!!pending}>
                                    <RefreshCw /> Aggiorna analisi
                                </Button>
                            </Stack>
                        </HStack>
                    </Card.Body>
                </Card.Root>
            )}

            {summary && !r && (
                <Alert.Root status={summary.state === 'error' ? 'error' : 'info'}>
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>
                            {summary.state === 'error' ? 'Analisi terminata con errore' : 'Analisi in elaborazione'}
                        </Alert.Title>
                        <Alert.Description>{summary.statusMessage || 'La pagina si aggiorna da sola al termine.'}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            )}

            {r && (
                <Tabs.Root value={tab} onValueChange={(e) => go({ tab: e.value }, true)} variant="line" colorPalette="brand" lazyMount>
                    <Tabs.List bg="bg" borderRadius="l2" px="2" overflowX="auto">
                        {TABS.map((t) => (
                            <Tabs.Trigger key={t.value} value={t.value} whiteSpace="nowrap">
                                {t.label}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                    <Tabs.Content value="overview">
                        <OverviewTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="conversations">
                        <ConversationsTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="tools">
                        <ToolsTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="work">
                        <WorkTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="behaviour">
                        <BehaviourTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="metadata">
                        <MetadataTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="governance">
                        <GovernanceTab r={r} />
                    </Tabs.Content>
                    <Tabs.Content value="graph">
                        <SectionCard
                            title="Grafo di relazione"
                            description="Elementi toccati: conversazioni, update set, artefatti (raggruppati per classe) e tabelle"
                        >
                            <RelationshipGraph nodes={r.graph.nodes} edges={r.graph.edges} />
                        </SectionCard>
                    </Tabs.Content>
                </Tabs.Root>
            )}
        </Stack>
    )
}
