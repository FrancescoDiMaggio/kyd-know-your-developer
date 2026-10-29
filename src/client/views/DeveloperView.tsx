import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Avatar, Box, Button, Card, HStack, Heading, NativeSelect, Skeleton, Stack, Tabs, Text, Wrap } from '@chakra-ui/react'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { t } from 'sn-translate'
import { fill } from '../utils/i18n'
import type { AnalysisSummary, KydAnalysis } from '../types'
import { kydService } from '../services/kyd-service'
import { StateBadge } from '../components/StateBadge'
import { toaster } from '../components/toaster'
import { RelationshipGraph } from '../components/RelationshipGraph'
import { SectionCard } from '../components/SectionCard'
import { OverviewTab } from '../sections/OverviewTab'
import { ReportTab } from '../sections/ReportTab'
import { ConversationsTab } from '../sections/ConversationsTab'
import { ToolsTab } from '../sections/ToolsTab'
import { WorkTab } from '../sections/WorkTab'
import { BehaviourTab } from '../sections/BehaviourTab'
import { MetadataTab } from '../sections/MetadataTab'
import { GovernanceTab } from '../sections/GovernanceTab'
import { fmtDate, fmtDateTime } from '../utils/format'
import { stageLabel } from '../utils/labels'
import { Route, setPageTitle } from '../utils/navigation'

const TAB_VALUES = ['overview', 'report', 'conversations', 'tools', 'work', 'behaviour', 'metadata', 'governance', 'graph']

function tabLabel(value: string): string {
    switch (value) {
        case 'overview':
            return t('Overview')
        case 'report':
            return t('Report')
        case 'conversations':
            return t('Conversations')
        case 'tools':
            return t('Tools and outcomes')
        case 'work':
            return t('Work done')
        case 'behaviour':
            return t('Behaviour')
        case 'metadata':
            return t('Components')
        case 'governance':
            return t('Governance')
        default:
            return t('Graph')
    }
}

const POLL_MS = 3000

interface Props {
    route: Route
    navigate: (r: Route, opts?: { replace?: boolean }) => void
}

export function DeveloperView({ route, navigate }: Props) {
    const developer = route.developer as string
    const tab = TAB_VALUES.includes(route.tab || '') ? (route.tab as string) : 'overview'
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
            toaster.create({ type: 'error', title: t('Unable to load the analysis'), description: String(e) }),
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
        const timer = setInterval(() => {
            kydService.getAnalysis(selectedId).then(setAnalysis)
            void loadList()
        }, POLL_MS)
        return () => clearInterval(timer)
    }, [pending, selectedId, loadList])

    const go = (patch: Partial<Route>, replace = false) =>
        navigate({ view: 'detail', developer, analysis: route.analysis, tab: route.tab, ...patch }, { replace })

    const refresh = async () => {
        if (!summary) return
        const a = await kydService.requestAnalysis(developer, { from: summary.periodFrom, to: summary.periodTo })
        toaster.create({ type: 'info', title: fill(t('Analysis %1 requested'), a.number), description: t('It can take a few minutes.') })
        await loadList()
        go({ analysis: a.sysId })
    }

    if (analyses && !analyses.length) {
        return (
            <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Title>{t('No analyses for this developer.')}</Alert.Title>
            </Alert.Root>
        )
    }

    const r = analysis?.result
    return (
        <Stack gap="5">
            <Button alignSelf="start" variant="ghost" size="sm" onClick={() => navigate({ view: 'list' })}>
                <ArrowLeft /> {t('Analysed developers')}
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
                                    <Wrap gap="2" mt="2" align="center">
                                        <StateBadge state={summary.state} />
                                        <Text textStyle="sm" color="fg.muted">
                                            {summary.number ? `${summary.number} · ` : ''}
                                            {fill(t('period %1 → %2'), fmtDate(summary.periodFrom), fmtDate(summary.periodTo))}
                                        </Text>
                                    </Wrap>
                                </Box>
                            </HStack>
                            <Stack gap="2" minW="260px">
                                <Text textStyle="xs" color="fg.muted">
                                    {t('Analyses of the developer')}
                                </Text>
                                <NativeSelect.Root size="sm">
                                    <NativeSelect.Field
                                        value={selectedId}
                                        onChange={(e) => go({ analysis: e.target.value })}
                                        aria-label={t('Select the analysis')}
                                    >
                                        {analyses?.map((a) => (
                                            <option key={a.sysId} value={a.sysId}>
                                                {[a.number, fmtDateTime(a.completedOn || a.requestedOn)].filter(Boolean).join(' · ')}
                                                {a.state !== 'complete' ? ` (${stageLabel(a.stage) || a.state})` : ''}
                                            </option>
                                        ))}
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator />
                                </NativeSelect.Root>
                                <Button size="sm" variant="outline" onClick={() => void refresh()} disabled={!!pending}>
                                    <RefreshCw /> {t('Refresh analysis')}
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
                            {summary.state === 'error' ? t('The analysis ended with an error') : t('Analysis in progress')}
                        </Alert.Title>
                        <Alert.Description>
                            {summary.state === 'error'
                                ? summary.statusMessage
                                : stageLabel(summary.stage) || t('The page refreshes by itself when it completes.')}
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            )}

            {r && (
                <Tabs.Root value={tab} onValueChange={(e) => go({ tab: e.value }, true)} variant="line" colorPalette="brand" lazyMount>
                    <Tabs.List bg="bg" borderRadius="l2" px="2" overflowX="auto">
                        {TAB_VALUES.map((value) => (
                            <Tabs.Trigger key={value} value={value} whiteSpace="nowrap">
                                {tabLabel(value)}
                            </Tabs.Trigger>
                        ))}
                    </Tabs.List>
                    <Tabs.Content value="overview">
                        <OverviewTab r={r} summary={summary!} />
                    </Tabs.Content>
                    <Tabs.Content value="report">
                        <ReportTab r={r} />
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
                            title={t('Relationship graph')}
                            description={t('Elements touched: conversations, update sets, artifacts (grouped by class) and tables')}
                        >
                            <RelationshipGraph nodes={r.graph.nodes} edges={r.graph.edges} />
                        </SectionCard>
                    </Tabs.Content>
                </Tabs.Root>
            )}
        </Stack>
    )
}
